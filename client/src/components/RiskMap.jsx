import { MapContainer, TileLayer, GeoJSON, CircleMarker, Tooltip, Polyline, useMap } from "react-leaflet";
import { useEffect, useMemo } from "react";

const RISK_COLOR = {
  YELLOW: "#e6b800",
  ORANGE: "#e07a1f",
  RED: "#c62828"
};

const ZONE_FILL = {
  yellow: "#e6b800",
  orange: "#e07a1f",
  red: "#c62828"
};

const ZONE_OPACITY = {
  yellow: 0.12,
  orange: 0.18,
  red: 0.28
};

function FitBounds({ points }) {
  const map = useMap();
  useEffect(() => {
    if (points && points.length) {
      map.fitBounds(points, { padding: [30, 30] });
    }
  }, [points]); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}

export default function RiskMap({
  villages = [],
  floodZones,
  river,
  sites = [],
  selectedVillageId,
  onVillageClick,
  onSiteClick,
  height = "100%",
  fitToData = true
}) {
  const riverLine = useMemo(
    () => (river?.features?.[0]?.geometry?.coordinates || []).map(([lng, lat]) => [lat, lng]),
    [river]
  );

  const fitPoints = useMemo(() => {
    const pts = villages.map((v) => [v.location.lat, v.location.lng]);
    return pts.length ? pts : [[25.9, 86.7]];
  }, [villages]);

  return (
    <div style={{ height }} className="overflow-hidden rounded-xl border border-slate-200">
      <MapContainer center={[25.9, 86.7]} zoom={9} scrollWheelZoom style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {floodZones?.features?.map((f) => (
          <GeoJSON
            key={f.properties.level}
            data={f}
            style={{
              color: ZONE_FILL[f.properties.level],
              weight: 1,
              fillColor: ZONE_FILL[f.properties.level],
              fillOpacity: ZONE_OPACITY[f.properties.level]
            }}
          />
        ))}

        {riverLine.length > 0 && (
          <Polyline positions={riverLine} pathOptions={{ color: "#1d6fa5", weight: 3 }} />
        )}

        {villages.map((v) => {
          const category = v.risk?.riskCategory || "YELLOW";
          const isSelected = v.id === selectedVillageId;
          return (
            <CircleMarker
              key={v.id}
              center={[v.location.lat, v.location.lng]}
              radius={isSelected ? 11 : 7}
              pathOptions={{
                color: isSelected ? "#0f3d5c" : "#ffffff",
                weight: isSelected ? 3 : 1.5,
                fillColor: RISK_COLOR[category],
                fillOpacity: 0.9
              }}
              eventHandlers={{ click: () => onVillageClick && onVillageClick(v) }}
            >
              <Tooltip direction="top" offset={[0, -6]}>
                <div className="text-xs">
                  <p className="font-semibold">{v.name}</p>
                  <p>Pop: {v.population.toLocaleString()}</p>
                  {v.risk && <p>Risk: {v.risk.riskCategory} ({Math.round(v.risk.riskScore * 100)}%)</p>}
                </div>
              </Tooltip>
            </CircleMarker>
          );
        })}

        {sites.map((s) => (
          <CircleMarker
            key={s.id}
            center={[s.location.lat, s.location.lng]}
            radius={9}
            pathOptions={{ color: "#0f3d5c", weight: 2, fillColor: "#3fa9f5", fillOpacity: 0.85 }}
            eventHandlers={{ click: () => onSiteClick && onSiteClick(s) }}
          >
            <Tooltip direction="top" offset={[0, -6]}>
              <div className="text-xs">
                <p className="font-semibold">{s.name}</p>
                <p>Candidate relocation site</p>
              </div>
            </Tooltip>
          </CircleMarker>
        ))}

        {fitToData && <FitBounds points={fitPoints} />}
      </MapContainer>
    </div>
  );
}
