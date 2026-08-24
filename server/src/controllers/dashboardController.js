import { getVillages, getRelocationSites } from "../services/dataStore.js";
import { computeAllVillageRisks } from "../services/riskEngine.js";
import { computeSiteCapacity } from "../services/capacityEngine.js";

export async function getDashboardStats(req, res) {
  const waterLevelM = parseFloat(req.query.waterLevel) || 8.0;
  const villages = await getVillages();
  const sites = await getRelocationSites();

  const risks = computeAllVillageRisks(villages, waterLevelM);
  const redVillages = risks.filter((r) => r.riskCategory === "RED");
  const orangeVillages = risks.filter((r) => r.riskCategory === "ORANGE");
  const immediateCandidates = risks.filter((r) => r.relocationPriority === "IMMEDIATE");

  const affectedPopulation = risks
    .filter((r) => r.riskCategory !== "YELLOW")
    .reduce((sum, r) => {
      const v = villages.find((vv) => vv.id === r.villageId);
      return sum + (v ? v.population : 0);
    }, 0);

  const totalRelocationCapacity = sites.reduce((sum, s) => {
    const cap = computeSiteCapacity(s);
    return sum + cap.netAvailableCapacity;
  }, 0);

  res.json({
    waterLevelM,
    totalMonitoredVillages: villages.length,
    highRiskVillages: redVillages.length + orangeVillages.length,
    criticalVillages: redVillages.length,
    immediateRelocationCandidates: immediateCandidates.length,
    estimatedAffectedPopulation: affectedPopulation,
    availableRelocationCapacity: totalRelocationCapacity,
    riskBreakdown: {
      yellow: risks.filter((r) => r.riskCategory === "YELLOW").length,
      orange: orangeVillages.length,
      red: redVillages.length
    }
  });
}
