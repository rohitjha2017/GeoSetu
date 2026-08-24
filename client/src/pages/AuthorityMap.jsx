import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import WaterLevelSlider from "../components/WaterLevelSlider.jsx";
import RiskMap from "../components/RiskMap.jsx";
import LoadingState from "../components/LoadingState.jsx";
import RiskBadge from "../components/RiskBadge.jsx";
import { getVillages, getRiver, getFloodZones, getSites } from "../services/api.js";

export default function AuthorityMap() {
  const navigate = useNavigate();
  const [waterLevel, setWaterLevel] = useState(8.0);
  const [villages, setVillages] = useState([]);
  const [river, setRiver] = useState(null);
  const [floodZones, setFloodZones] = useState(null);
  const [sites, setSites] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (level) => {
    const [villagesRes, riverRes, zonesRes, sitesRes] = await Promise.all([
      getVillages(level),
      getRiver(),
      getFloodZones(level),
      getSites()
    ]);
    setVillages(villagesRes.villages);
    setRiver(riverRes);
    setFloodZones(zonesRes);
    setSites(sitesRes);
    setLoading(false);
  }, []);

  useEffect(() => {
    load(waterLevel);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const t = setTimeout(() => load(waterLevel), 150);
    return () => clearTimeout(t);
  }, [waterLevel]); // eslint-disable-line react-hooks/exhaustive-deps

  const counts = villages.reduce(
    (acc, v) => {
      acc[v.risk.riskCategory] = (acc[v.risk.riskCategory] || 0) + 1;
      return acc;
    },
    { YELLOW: 0, ORANGE: 0, RED: 0 }
  );

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-brand-900">Interactive GIS Risk Map</h1>
          <p className="text-sm text-slate-500">
            Move the slider to change the Koshi water-level scenario — risk zones and village colors
            update live.
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-risk-yellow" /> {counts.YELLOW} Moderate</span>
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-risk-orange" /> {counts.ORANGE} High</span>
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-risk-red" /> {counts.RED} Critical</span>
        </div>
      </div>

      <div className="max-w-xl">
        <WaterLevelSlider value={waterLevel} onChange={setWaterLevel} />
      </div>

      {loading ? (
        <LoadingState label="Loading map…" />
      ) : (
        <div className="grid flex-1 gap-4 lg:grid-cols-4">
          <div className="min-h-[26rem] lg:col-span-3">
            <RiskMap
              villages={villages}
              river={river}
              floodZones={floodZones}
              sites={sites}
              selectedVillageId={selected?.id}
              onVillageClick={setSelected}
              fitToData={false}
            />
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            {selected ? (
              <div>
                <p className="text-sm font-semibold text-slate-800">{selected.name}</p>
                <p className="text-xs text-slate-400">District: {selected.districtId.replace("dist-", "")}</p>
                <div className="mt-3">
                  <RiskBadge category={selected.risk.riskCategory} size="lg" />
                </div>
                <dl className="mt-4 space-y-1 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-slate-500">Population</dt>
                    <dd className="font-medium">{selected.population.toLocaleString()}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-slate-500">Risk score</dt>
                    <dd className="font-medium">{Math.round(selected.risk.riskScore * 100)}%</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-slate-500">Elevation</dt>
                    <dd className="font-medium">{selected.elevationM} m</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-slate-500">Distance to river</dt>
                    <dd className="font-medium">{selected.distanceFromRiverKm} km</dd>
                  </div>
                </dl>
                <button
                  onClick={() => navigate(`/authority/village/${selected.id}`)}
                  className="mt-4 w-full rounded-lg bg-brand-600 px-3 py-2 text-sm font-medium text-white hover:bg-brand-700"
                >
                  View full analysis
                </button>
              </div>
            ) : (
              <p className="text-sm text-slate-400">Click a village marker on the map to see its details here.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
