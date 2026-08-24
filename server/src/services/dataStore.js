/**
 * dataStore.js
 *
 * Abstraction over "where the application data lives".
 *
 * DATA_MODE=memory (default):
 *   Loads the JSON seed files straight into memory. No external database
 *   required. This is the recommended mode for the SIH demo — it always
 *   works, starts instantly, and has zero infra dependencies.
 *
 * DATA_MODE=mongo:
 *   Connects to MongoDB via Mongoose, upserts the same seed JSON into
 *   collections on startup (idempotent), and reads/writes through the
 *   Mongoose models. This demonstrates the production-ready path without
 *   requiring the demo machine to have MongoDB installed.
 *
 * Every route/controller talks to this module only — never to the JSON
 * files or Mongoose models directly — so the storage backend can be
 * swapped later without touching business logic (riskEngine,
 * relocationEngine, capacityEngine, copilot).
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SEED_DIR = path.join(__dirname, "..", "seed");

function readSeed(file) {
  const raw = fs.readFileSync(path.join(SEED_DIR, file), "utf-8");
  return JSON.parse(raw);
}

const DATA_MODE = process.env.DATA_MODE === "mongo" ? "mongo" : "memory";

// In-memory collections (used directly in memory mode; also used as the
// source of truth for seeding Mongo in mongo mode).
const memory = {
  districts: readSeed("districts.json"),
  villages: readSeed("villages.json"),
  relocationSites: readSeed("relocationSites.json"),
  services: readSeed("services.json"),
  historicalDisasters: readSeed("historicalDisasters.json"),
  river: readSeed("rivers.json"),
  floodZoneConfig: readSeed("floodZones.json")
};

let mongoModels = null;

export async function initDataStore() {
  if (DATA_MODE === "mongo") {
    const { connectMongo } = await import("../config/db.js");
    const District = (await import("../models/District.js")).default;
    const Village = (await import("../models/Village.js")).default;
    const RelocationSite = (await import("../models/RelocationSite.js")).default;
    const Service = (await import("../models/Service.js")).default;
    const HistoricalDisaster = (await import("../models/HistoricalDisaster.js")).default;

    await connectMongo(process.env.MONGO_URI);

    // Idempotent upsert-seed so re-running the server doesn't duplicate data.
    for (const d of memory.districts) await District.updateOne({ id: d.id }, d, { upsert: true });
    for (const v of memory.villages) await Village.updateOne({ id: v.id }, v, { upsert: true });
    for (const s of memory.relocationSites) await RelocationSite.updateOne({ id: s.id }, s, { upsert: true });
    for (const s of memory.services) await Service.updateOne({ id: s.id }, s, { upsert: true });
    for (const h of memory.historicalDisasters) await HistoricalDisaster.updateOne({ id: h.id }, h, { upsert: true });

    mongoModels = { District, Village, RelocationSite, Service, HistoricalDisaster };
    console.log("[dataStore] Running in MONGO mode, seed data upserted");
  } else {
    console.log("[dataStore] Running in MEMORY mode (no database required)");
  }
}

export function getMode() {
  return DATA_MODE;
}

export async function getDistricts() {
  if (mongoModels) return (await mongoModels.District.find({}, "-_id -__v").lean());
  return memory.districts;
}

export async function getVillages() {
  if (mongoModels) return (await mongoModels.Village.find({}, "-_id -__v").lean());
  return memory.villages;
}

export async function getVillageById(id) {
  const villages = await getVillages();
  return villages.find((v) => v.id === id) || null;
}

export async function getRelocationSites() {
  if (mongoModels) return (await mongoModels.RelocationSite.find({}, "-_id -__v").lean());
  return memory.relocationSites;
}

export async function getRelocationSiteById(id) {
  const sites = await getRelocationSites();
  return sites.find((s) => s.id === id) || null;
}

export async function getServices() {
  if (mongoModels) return (await mongoModels.Service.find({}, "-_id -__v").lean());
  return memory.services;
}

export async function getHistoricalDisasters() {
  if (mongoModels) return (await mongoModels.HistoricalDisaster.find({}, "-_id -__v").lean());
  return memory.historicalDisasters;
}

export function getRiverGeoJSON() {
  return memory.river;
}

export function getFloodZoneConfig() {
  return memory.floodZoneConfig;
}
