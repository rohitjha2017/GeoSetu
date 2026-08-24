import { askCopilot } from "../services/copilot.js";

export async function postCopilotQuery(req, res) {
  const { message, villageId, siteId, waterLevelM } = req.body || {};
  if (!message || typeof message !== "string") {
    return res.status(400).json({ error: "\"message\" (string) is required" });
  }
  const result = await askCopilot({ message, villageId, siteId, waterLevelM });
  res.json(result);
}
