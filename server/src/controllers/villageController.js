import { getVillages, getVillageById, getRelocationSites } from "../services/dataStore.js";
import { computeVillageRisk, computeAllVillageRisks } from "../services/riskEngine.js";
import { rankSitesForVillage, compareVillageAndSite } from "../services/relocationEngine.js";
import { canAccommodate } from "../services/capacityEngine.js";

function levelFromQuery(req) {
  const v = parseFloat(req.query.waterLevel);
  return Number.isFinite(v) ? v : 8.0;
}

export async function listVillages(req, res) {
  const waterLevelM = levelFromQuery(req);
  const villages = await getVillages();
  const risks = computeAllVillageRisks(villages, waterLevelM);
  const merged = villages.map((v, i) => ({ ...v, risk: risks[i] }));
  res.json({ waterLevelM, villages: merged });
}

export async function getVillage(req, res) {
  const village = await getVillageById(req.params.id);
  if (!village) return res.status(404).json({ error: "Village not found" });
  const waterLevelM = levelFromQuery(req);
  const risk = computeVillageRisk(village, waterLevelM);
  res.json({ ...village, risk });
}

export async function getVillageRelocationOptions(req, res) {
  const village = await getVillageById(req.params.id);
  if (!village) return res.status(404).json({ error: "Village not found" });
  const waterLevelM = levelFromQuery(req);
  const risk = computeVillageRisk(village, waterLevelM);
  const sites = await getRelocationSites();
  const ranked = rankSitesForVillage(village, sites);
  res.json({ village, risk, waterLevelM, candidateSites: ranked });
}

export async function getVillageComparison(req, res) {
  const village = await getVillageById(req.params.id);
  if (!village) return res.status(404).json({ error: "Village not found" });
  const siteId = req.query.siteId;
  const sites = await getRelocationSites();
  const site = sites.find((s) => s.id === siteId) || null;
  if (!site) return res.status(400).json({ error: "Provide a valid siteId query parameter" });
  const waterLevelM = levelFromQuery(req);
  const risk = computeVillageRisk(village, waterLevelM);
  const comparison = compareVillageAndSite(village, site, risk);
  const capacity = canAccommodate(site, village.population);
  res.json({ village, site, risk, comparison, capacity });
}

export async function searchVillages(req, res) {
  const q = (req.query.q || "").toLowerCase().trim();
  const villages = await getVillages();
  const results = q
    ? villages.filter((v) => v.name.toLowerCase().includes(q))
    : villages;
  res.json(results.map(({ id, name, districtId, population }) => ({ id, name, districtId, population })));
}
