import { getDistricts, getRiverGeoJSON } from "../services/dataStore.js";
import { generateFloodZones } from "../services/floodZoneService.js";

export async function listDistricts(req, res) {
  res.json(await getDistricts());
}

export function getRiver(req, res) {
  res.json(getRiverGeoJSON());
}

export function getFloodZones(req, res) {
  const waterLevelM = parseFloat(req.query.waterLevel) || 8.0;
  res.json(generateFloodZones(waterLevelM));
}
