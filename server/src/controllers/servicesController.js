import { getServices, getHistoricalDisasters } from "../services/dataStore.js";

export async function listServices(req, res) {
  const type = req.query.type;
  const services = await getServices();
  res.json(type ? services.filter((s) => s.type === type) : services);
}

export async function listHistoricalDisasters(req, res) {
  res.json(await getHistoricalDisasters());
}
