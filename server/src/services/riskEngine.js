/**
 * riskEngine.js
 *
 * PROTOTYPE SCENARIO MODEL — NOT A HYDROLOGICAL FORECAST.
 *
 * This module converts a village's static attributes + the currently
 * selected Koshi water-level scenario into a deterministic 0..1 risk
 * score and a Yellow/Orange/Red category. Every weight and normalization
 * range below is a documented prototype assumption chosen to make the
 * demo behave sensibly (closer-to-river + lower-elevation + higher
 * scenario water level => higher risk). None of these numbers are
 * derived from real hydrological survey data.
 *
 * The module is intentionally isolated behind computeVillageRisk() /
 * computeAllVillageRisks() so it can be swapped for a real ML/hydrology
 * model later without changing any controller or route code.
 */

import { getFloodZoneConfig } from "./dataStore.js";

// ---- Configurable prototype constants -------------------------------------

export const RISK_WEIGHTS = {
  floodExposure: 0.40,
  elevationRisk: 0.20,
  riverProximity: 0.15,
  historicalRisk: 0.15,
  vulnerability: 0.10
};

export const RISK_THRESHOLDS = {
  yellowMax: 0.39, // 0.00–0.39 -> Yellow
  orangeMax: 0.69  // 0.40–0.69 -> Orange, 0.70–1.00 -> Red
};

// Reference ranges used only to normalize raw village attributes into 0..1.
// Chosen from the spread of the prototype's demo dataset.
const NORMALIZATION = {
  elevationMinM: 30,
  elevationMaxM: 55,
  riverProximityReferenceKm: 8,
  historicalFloodsReferenceCount: 12
};

function clamp01(x) {
  return Math.max(0, Math.min(1, x));
}

function lerp(a, b, t) {
  return a + (b - a) * clamp01(t);
}

/**
 * How far (km) flood influence is assumed to reach from the river
 * centerline for a given scenario water level, interpolated from the
 * floodZones.json prototype config (yellow band, the widest reach).
 */
function effectiveInundationReachKm(waterLevelM) {
  const cfg = getFloodZoneConfig();
  const { minM, maxM } = cfg.waterLevelRange;
  const yellow = cfg.bufferBandsKm.find((b) => b.level === "yellow");
  const t = (waterLevelM - minM) / (maxM - minM);
  return lerp(yellow.bufferAtMinM, yellow.bufferAtMaxM, t);
}

/**
 * Compute the scenario-based risk score + category for one village at a
 * given Koshi water-level scenario (metres, expected range ~6.0–10.0).
 */
export function computeVillageRisk(village, waterLevelM) {
  const reachKm = effectiveInundationReachKm(waterLevelM);

  const floodExposure = clamp01(1 - village.distanceFromRiverKm / Math.max(reachKm, 0.001));

  const elevationRisk = clamp01(
    (NORMALIZATION.elevationMaxM - village.elevationM) /
      (NORMALIZATION.elevationMaxM - NORMALIZATION.elevationMinM)
  );

  const riverProximity = clamp01(1 - village.distanceFromRiverKm / NORMALIZATION.riverProximityReferenceKm);

  const historicalRisk = clamp01(village.historicalFloods / NORMALIZATION.historicalFloodsReferenceCount);

  const vulnerability = clamp01(village.vulnerabilityIndex);

  const riskScore =
    floodExposure * RISK_WEIGHTS.floodExposure +
    elevationRisk * RISK_WEIGHTS.elevationRisk +
    riverProximity * RISK_WEIGHTS.riverProximity +
    historicalRisk * RISK_WEIGHTS.historicalRisk +
    vulnerability * RISK_WEIGHTS.vulnerability;

  const category = categorize(riskScore);
  const relocationPriority = derivePriority(category, vulnerability, riskScore);

  return {
    villageId: village.id,
    waterLevelM,
    components: {
      floodExposure: round(floodExposure),
      elevationRisk: round(elevationRisk),
      riverProximity: round(riverProximity),
      historicalRisk: round(historicalRisk),
      vulnerability: round(vulnerability)
    },
    riskScore: round(riskScore),
    riskCategory: category, // "YELLOW" | "ORANGE" | "RED"
    relocationPriority // "IMMEDIATE" | "SHORT_TERM" | "MEDIUM_TERM" | "MONITOR"
  };
}

export function computeAllVillageRisks(villages, waterLevelM) {
  return villages.map((v) => computeVillageRisk(v, waterLevelM));
}

function categorize(score) {
  if (score <= RISK_THRESHOLDS.yellowMax) return "YELLOW";
  if (score <= RISK_THRESHOLDS.orangeMax) return "ORANGE";
  return "RED";
}

function derivePriority(category, vulnerability, riskScore) {
  if (category === "RED" && (vulnerability >= 0.65 || riskScore >= 0.85)) return "IMMEDIATE";
  if (category === "RED") return "SHORT_TERM";
  if (category === "ORANGE") return "MEDIUM_TERM";
  return "MONITOR";
}

function round(x) {
  return Math.round(x * 100) / 100;
}
