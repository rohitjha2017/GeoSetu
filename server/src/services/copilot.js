/**
 * copilot.js
 *
 * The AI Relocation Copilot NEVER lets the LLM invent village/site
 * statistics. This module always retrieves the actual application data
 * first (via dataStore + riskEngine/relocationEngine/capacityEngine),
 * assembles it into a structured JSON context object, and only then
 * calls the LLM — instructed to explain/summarize that context, not to
 * fabricate numbers of its own.
 */

import { getVillages, getVillageById, getRelocationSites } from "./dataStore.js";
import { computeVillageRisk } from "./riskEngine.js";
import { rankSitesForVillage, compareVillageAndSite } from "./relocationEngine.js";
import { canAccommodate } from "./capacityEngine.js";

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6";

const SYSTEM_PROMPT = `You are the AI Relocation Copilot inside a disaster-management decision-support prototype for Bihar, India (Koshi river flood scenario).

Rules you must always follow:
1. Only use the structured JSON "context" you are given. Never invent village names, population figures, risk scores, or site statistics that are not present in the context.
2. If the context does not contain information needed to answer, say so plainly instead of guessing.
3. Be concise, clear, and practical — you are briefing a disaster management official or explaining risk to the public.
4. Always make clear this is a SCENARIO-BASED PROTOTYPE MODEL, not a real-time or verified flood forecast.
5. End every answer with this exact line on its own: "AI-generated explanations are decision-support only and should not replace official disaster-management instructions."`;

async function callAnthropic(userMessage, context) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return fallbackAnswer(userMessage, context);
  }

  const body = {
    model: MODEL,
    max_tokens: 700,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: `Context (application data, ground truth — do not deviate from these numbers):\n${JSON.stringify(
          context,
          null,
          2
        )}\n\nQuestion: ${userMessage}`
      }
    ]
  };

  try {
    const res = await fetch(ANTHROPIC_API_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("[copilot] Anthropic API error:", res.status, errText);
      return fallbackAnswer(userMessage, context, true);
    }

    const data = await res.json();
    const text = (data.content || [])
      .filter((block) => block.type === "text")
      .map((block) => block.text)
      .join("\n");

    return text || fallbackAnswer(userMessage, context);
  } catch (err) {
    console.error("[copilot] Anthropic API call failed:", err.message);
    return fallbackAnswer(userMessage, context, true);
  }
}

/**
 * Deterministic, data-only fallback used when no ANTHROPIC_API_KEY is
 * configured (so the demo still works end-to-end) or if the API call
 * fails. Purely template-based, using only the same structured context.
 */
function fallbackAnswer(userMessage, context, wasError = false) {
  const lines = [];
  if (wasError) lines.push("(AI service unavailable — showing a data-only summary instead.)\n");

  if (context.village) {
    const v = context.village;
    lines.push(
      `${v.name} (${v.district}) has a scenario flood-risk score of ${(v.riskScore * 100).toFixed(
        0
      )}% at a river level of ${v.waterLevelM} m, classified ${v.riskCategory}. Vulnerability index: ${(
        v.vulnerability * 100
      ).toFixed(0)}%. Recorded historical flood events: ${v.historicalFloods}. Relocation priority: ${
        v.relocationPriority
      }.`
    );
  }
  if (context.candidateSites && context.candidateSites.length) {
    const top = context.candidateSites[0];
    lines.push(
      `Top-ranked relocation site: ${top.siteName}, suitability score ${top.suitabilityScore}/100, ${top.distanceFromVillageKm} km away, estimated net available capacity ${top.capacity.netAvailableCapacity}.`
    );
  }
  lines.push(
    "\nThis is a scenario-based prototype model, not a real-time or verified flood forecast."
  );
  lines.push(
    "AI-generated explanations are decision-support only and should not replace official disaster-management instructions."
  );
  return lines.join("\n");
}

/**
 * Build the structured, data-grounded context object for a copilot
 * question. villageId / siteId / waterLevelM are optional — whatever is
 * provided is resolved from real application data.
 */
export async function buildCopilotContext({ villageId, siteId, waterLevelM = 8.0 }) {
  const context = { scenario: { waterLevelM } };

  if (villageId) {
    const village = await getVillageById(villageId);
    if (village) {
      const risk = computeVillageRisk(village, waterLevelM);
      const sites = await getRelocationSites();
      const ranked = rankSitesForVillage(village, sites);
      const top = ranked[0];
      const topSite = sites.find((s) => s.id === top.siteId);
      const capacity = canAccommodate(topSite, village.population);
      const comparison = compareVillageAndSite(village, topSite, risk);

      context.village = {
        id: village.id,
        name: village.name,
        district: village.districtId,
        population: village.population,
        elevationM: village.elevationM,
        distanceFromRiverKm: village.distanceFromRiverKm,
        historicalFloods: village.historicalFloods,
        vulnerability: risk.components.vulnerability,
        riskScore: risk.riskScore,
        riskCategory: risk.riskCategory,
        relocationPriority: risk.relocationPriority,
        waterLevelM
      };
      context.candidateSites = ranked.slice(0, 3);
      context.recommendedSite = top.siteName;
      context.capacityAssessment = capacity;
      context.postRelocationComparison = comparison;
    }
  }

  if (siteId && !context.candidateSites) {
    const sites = await getRelocationSites();
    const site = sites.find((s) => s.id === siteId);
    if (site) {
      context.site = site;
      context.capacityAssessment = canAccommodate(site, site.existingPopulation || 0);
    }
  }

  if (!villageId && !siteId) {
    // General question — give a lightweight system-wide snapshot.
    const villages = await getVillages();
    const risks = villages.map((v) => computeVillageRisk(v, waterLevelM));
    context.overview = {
      totalVillages: villages.length,
      redCount: risks.filter((r) => r.riskCategory === "RED").length,
      orangeCount: risks.filter((r) => r.riskCategory === "ORANGE").length,
      yellowCount: risks.filter((r) => r.riskCategory === "YELLOW").length,
      immediateRelocationCandidates: risks.filter((r) => r.relocationPriority === "IMMEDIATE").length
    };
  }

  return context;
}

export async function askCopilot({ message, villageId, siteId, waterLevelM }) {
  const context = await buildCopilotContext({ villageId, siteId, waterLevelM });
  const answer = await callAnthropic(message, context);
  return { answer, context };
}
