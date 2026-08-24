import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import WaterLevelSlider from "../components/WaterLevelSlider.jsx";
import RiskBadge from "../components/RiskBadge.jsx";
import PriorityBadge from "../components/PriorityBadge.jsx";
import LoadingState from "../components/LoadingState.jsx";
import { getVillage } from "../services/api.js";

export default function VillageAnalysis() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [waterLevel, setWaterLevel] = useState(8.0);
  const [village, setVillage] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(
    async (level) => {
      const data = await getVillage(id, level);
      setVillage(data);
      setLoading(false);
    },
    [id]
  );

  useEffect(() => {
    setLoading(true);
    load(waterLevel);
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const t = setTimeout(() => load(waterLevel), 150);
    return () => clearTimeout(t);
  }, [waterLevel]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading || !village) return <LoadingState label="Loading village analysis…" />;

  const { risk } = village;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link to="/authority/map" className="text-xs text-brand-600 hover:underline">
            ← Back to map
          </Link>
          <h1 className="mt-1 text-xl font-bold text-brand-900">{village.name}</h1>
          <p className="text-sm text-slate-500">District: {village.districtId.replace("dist-", "")}</p>
        </div>
        <div className="w-full max-w-sm">
          <WaterLevelSlider value={waterLevel} onChange={setWaterLevel} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:col-span-1">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Village information</p>
          <dl className="mt-3 space-y-2 text-sm">
            <Row label="Population" value={village.population.toLocaleString()} />
            <Row label="Elevation" value={`${village.elevationM} m`} />
            <Row label="Distance from river" value={`${village.distanceFromRiverKm} km`} />
            <Row label="Historical flood events" value={village.historicalFloods} />
            <Row
              label="Coordinates"
              value={`${village.location.lat.toFixed(3)}, ${village.location.lng.toFixed(3)}`}
            />
          </dl>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:col-span-1">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Scenario risk</p>
          <div className="mt-3">
            <RiskBadge category={risk.riskCategory} size="lg" />
          </div>
          <p className="mt-4 text-3xl font-extrabold text-brand-900">{Math.round(risk.riskScore * 100)}%</p>
          <p className="text-xs text-slate-400">Flood risk score at {waterLevel.toFixed(1)} m river level</p>

          <div className="mt-4 space-y-1.5">
            {Object.entries(risk.components).map(([key, value]) => (
              <div key={key} className="flex items-center gap-2 text-xs">
                <span className="w-28 shrink-0 capitalize text-slate-500">
                  {key.replace(/([A-Z])/g, " $1")}
                </span>
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-brand-500" style={{ width: `${value * 100}%` }} />
                </div>
                <span className="w-8 text-right text-slate-500">{Math.round(value * 100)}%</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:col-span-1">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Relocation priority</p>
          <div className="mt-3">
            <PriorityBadge priority={risk.relocationPriority} />
          </div>
          <p className="mt-3 text-sm text-slate-500">
            Vulnerability index: <span className="font-medium text-slate-700">{Math.round(risk.components.vulnerability * 100)}%</span>
          </p>
          <button
            onClick={() => navigate(`/authority/relocation/${village.id}?waterLevel=${waterLevel}`)}
            className="mt-6 w-full rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
          >
            Find Suitable Relocation Sites
          </button>
          <Link
            to={`/authority/copilot?villageId=${village.id}&waterLevel=${waterLevel}`}
            className="mt-2 block text-center text-xs text-brand-600 hover:underline"
          >
            Ask the AI Copilot about this village →
          </Link>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between">
      <dt className="text-slate-500">{label}</dt>
      <dd className="font-medium text-slate-800">{value}</dd>
    </div>
  );
}
