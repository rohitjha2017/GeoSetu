import { getRelocationSites } from "../services/dataStore.js";
import { computeSiteCapacity } from "../services/capacityEngine.js";

export async function listSites(req, res) {
  const sites = await getRelocationSites();
  res.json(sites.map((s) => ({ ...s, capacity: computeSiteCapacity(s) })));
}

export async function getSite(req, res) {
  const sites = await getRelocationSites();
  const site = sites.find((s) => s.id === req.params.id);
  if (!site) return res.status(404).json({ error: "Site not found" });
  res.json({ ...site, capacity: computeSiteCapacity(site) });
}
