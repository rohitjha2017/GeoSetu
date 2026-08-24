/**
 * floodZoneService.js
 *
 * Generates illustrative "risk corridor" polygons around the Koshi
 * river centerline for the current scenario water level. This is a
 * simple geometric buffer for map visualization only — it is NOT a
 * hydrological inundation model. See seed/floodZones.json for the
 * documented prototype buffer assumptions.
 */

import { getRiverGeoJSON, getFloodZoneConfig } from "./dataStore.js";

const KM_PER_DEG_LAT = 111.32;

function kmToDegLat(km) {
  return km / KM_PER_DEG_LAT;
}

function kmToDegLng(km, atLat) {
  return km / (111.32 * Math.cos((atLat * Math.PI) / 180));
}

function lerp(a, b, t) {
  return a + (b - a) * Math.max(0, Math.min(1, t));
}

/**
 * Build a ribbon polygon of `bufferKm` half-width around a LineString of
 * [lng, lat] coordinates by offsetting each vertex perpendicular to its
 * local segment direction. Good enough for illustrative map rendering.
 */
function buildCorridorPolygon(coordinates, bufferKm) {
  const left = [];
  const right = [];

  for (let i = 0; i < coordinates.length; i++) {
    const [lng, lat] = coordinates[i];
    const prev = coordinates[i - 1] || coordinates[i];
    const next = coordinates[i + 1] || coordinates[i];

    const dx = next[0] - prev[0];
    const dy = next[1] - prev[1];
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    // Perpendicular direction (normalized)
    const perpX = -dy / len;
    const perpY = dx / len;

    const offLat = kmToDegLat(bufferKm);
    const offLng = kmToDegLng(bufferKm, lat);

    left.push([lng + perpX * offLng, lat + perpY * offLat]);
    right.push([lng - perpX * offLng, lat - perpY * offLat]);
  }

  const ring = [...left, ...right.reverse(), left[0]];
  return {
    type: "Polygon",
    coordinates: [ring]
  };
}

/**
 * Returns a GeoJSON FeatureCollection with one polygon per risk band
 * (yellow/orange/red) sized according to the scenario water level.
 * Bands are returned widest-first (yellow) so the frontend can layer
 * red on top for correct visual stacking.
 */
export function generateFloodZones(waterLevelM) {
  const river = getRiverGeoJSON();
  const cfg = getFloodZoneConfig();
  const { minM, maxM } = cfg.waterLevelRange;
  const t = (waterLevelM - minM) / (maxM - minM);

  const coords = river.features[0].geometry.coordinates;

  const bands = cfg.bufferBandsKm.map((band) => {
    const bufferKm = lerp(band.bufferAtMinM, band.bufferAtMaxM, t);
    return {
      type: "Feature",
      properties: { level: band.level, bufferKm: Math.round(bufferKm * 100) / 100, waterLevelM },
      geometry: buildCorridorPolygon(coords, bufferKm)
    };
  });

  // Widest band first (yellow), narrowest last (red) for layer stacking.
  const order = { yellow: 0, orange: 1, red: 2 };
  bands.sort((a, b) => order[a.properties.level] - order[b.properties.level]);

  return { type: "FeatureCollection", features: bands };
}
