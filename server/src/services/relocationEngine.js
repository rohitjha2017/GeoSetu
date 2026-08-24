/**
 * relocationEngine.js
 *
 * PROTOTYPE SUITABILITY MODEL.
 *
 * Ranks candidate relocation sites for a given at-risk village using a
 * weighted score across safety, capacity, accessibility, healthcare,
 * education and water availability. Weights are prototype assumptions
 * and are exposed as SUITABILITY_WEIGHTS so they can be tuned or later
 * replaced with a learned model.
 */

import { canAccommodate } from "./capacityEngine.js";

export const SUITABILITY_WEIGHTS = {
  safety: 0.35,
  capacity: 0.20,
  accessibility: 0.15,
  healthcare: 0.10,
  education: 0.10,
  water: 0.10
};

const SITE_NORMALIZATION = {
  elevationMinM: 45,
  elevationMaxM: 70,
  riverProximityReferenceKm: 15
};

function clamp01(x) {
  return Math.max(0, Math.min(1, x));
}

function haversineKm(a, b) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.asin(Math.sqrt(h));
}

function siteSafetyScore(site) {
  const elevationSafety = clamp01(
    (site.elevationM - SITE_NORMALIZATION.elevationMinM) /
      (SITE_NORMALIZATION.elevationMaxM - SITE_NORMALIZATION.elevationMinM)
  );
  const distanceSafety = clamp01(site.distanceFromRiverKm / SITE_NORMALIZATION.riverProximityReferenceKm);
  return clamp01(elevationSafety * 0.6 + distanceSafety * 0.4);
}

function qualitativeLabel(score) {
  if (score >= 0.8) return "Excellent";
  if (score >= 0.6) return "Good";
  if (score >= 0.4) return "Moderate";
  return "Limited";
}

/**
 * Rank all candidate sites for a village. Returns sites sorted by
 * suitability score descending, each annotated with sub-scores,
 * qualitative labels, capacity info, and distance from the village.
 */
export function rankSitesForVillage(village, sites) {
  const ranked = sites.map((site) => {
    const safety = siteSafetyScore(site);
    const capacityInfo = canAccommodate(site, village.population);
    // Capacity score: how comfortably the site's net available capacity
    // covers this village's population (capped at 1.0).
    const capacityScore = clamp01(
      capacityInfo.netAvailableCapacity / Math.max(village.population, 1)
    );
    const accessibility = clamp01(site.roadAccess);
    const healthcare = clamp01(site.healthcareAccess);
    const education = clamp01(site.schoolAccess);
    const water = clamp01(site.waterAvailability);

    const suitabilityRaw =
      safety * SUITABILITY_WEIGHTS.safety +
      capacityScore * SUITABILITY_WEIGHTS.capacity +
      accessibility * SUITABILITY_WEIGHTS.accessibility +
      healthcare * SUITABILITY_WEIGHTS.healthcare +
      education * SUITABILITY_WEIGHTS.education +
      water * SUITABILITY_WEIGHTS.water;

    const suitabilityScore = Math.round(suitabilityRaw * 100);
    const distanceKm = Math.round(haversineKm(village.location, site.location) * 10) / 10;

    return {
      siteId: site.id,
      siteName: site.name,
      suitabilityScore,
      distanceFromVillageKm: distanceKm,
      subScores: {
        safety: { value: Math.round(safety * 100), label: qualitativeLabel(safety) },
        capacity: { value: Math.round(capacityScore * 100), label: qualitativeLabel(capacityScore) },
        accessibility: { value: Math.round(accessibility * 100), label: qualitativeLabel(accessibility) },
        healthcare: { value: Math.round(healthcare * 100), label: qualitativeLabel(healthcare) },
        education: { value: Math.round(education * 100), label: qualitativeLabel(education) },
        water: { value: Math.round(water * 100), label: qualitativeLabel(water) }
      },
      capacity: capacityInfo
    };
  });

  ranked.sort((a, b) => b.suitabilityScore - a.suitabilityScore);
  return ranked.map((r, idx) => ({ ...r, rank: idx + 1, recommended: idx === 0 }));
}

/**
 * Post-relocation trade-off comparison between the original village and
 * a proposed site. NOT a rigorous socioeconomic model — a prototype
 * decision-support illustration built from the same site/village access
 * attributes already used for ranking, plus the village's current flood
 * risk for contrast.
 */
export function compareVillageAndSite(village, site, villageRisk) {
  const villageSide = {
    agriculturalAccess: "High", // villages in this dataset are all agrarian floodplain settlements
    schoolDistanceKm: 1.5,
    marketDistanceKm: 2.5,
    healthcareDistanceKm: 6.0,
    floodRisk: villageRisk.riskCategory
  };

  const siteSide = {
    agriculturalAccess: site.distanceFromRiverKm > 8 ? "Low" : "Moderate",
    schoolDistanceKm: Math.round((1 - site.schoolAccess) * 8 * 10) / 10,
    marketDistanceKm: Math.round((1 - site.roadAccess) * 10 * 10) / 10,
    healthcareDistanceKm: Math.round((1 - site.healthcareAccess) * 10 * 10) / 10,
    floodRisk: "LOW"
  };

  const challenges = [];
  if (siteSide.agriculturalAccess !== "High") {
    challenges.push("Loss of direct agricultural land access — livelihood transition support may be needed.");
  }
  if (siteSide.schoolDistanceKm > villageSide.schoolDistanceKm) {
    challenges.push("Longer school commute for children until local schooling capacity is expanded.");
  }
  if (siteSide.marketDistanceKm > villageSide.marketDistanceKm) {
    challenges.push("Greater distance to markets may affect trade and daily wage access initially.");
  }
  if (site.existingPopulation > 0) {
    challenges.push("Site already hosts an existing population — integration and social cohesion planning required.");
  }
  challenges.push("Compensation, land titling and livelihood restoration will need dedicated administrative planning.");

  return { village: villageSide, site: siteSide, challenges };
}
