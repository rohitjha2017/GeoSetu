import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import RiskBadge from "../components/RiskBadge.jsx";
import OfflineBanner from "../components/OfflineBanner.jsx";
import LoadingState from "../components/LoadingState.jsx";
import { fetchWithOfflineFallback } from "../services/offlineStore.js";
import { getVillage, getServices } from "../services/api.js";

function haversineKm(a, b) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.asin(Math.sqrt(h));
}

const WHY_REASONS = {
  RED: ["Low elevation", "High flood exposure", "Frequent historical flood events", "Close to floodplain"],
  ORANGE: ["Moderate elevation", "Elevated flood exposure", "Some historical flood events", "Near the floodplain"],
  YELLOW: ["Relatively higher elevation", "Lower current flood exposure", "Occasional historical flooding"]
};

export default function PublicVillage() {
  const { id } = useParams();
  const [village, setVillage] = useState(null);
  const [nearestService, setNearestService] = useState(null);
  const [syncedAt, setSyncedAt] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchWithOfflineFallback(`public:village:${id}`, () => getVillage(id, 8.0)).then(async (res) => {
      setVillage(res.data);
      setSyncedAt(res.syncedAt);
      setLoading(false);

      try {
        const services = await getServices("shelter");
        if (services.length && res.data.location) {
          const withDist = services
            .map((s) => ({ ...s, distanceKm: haversineKm(res.data.location, s.location) }))
            .sort((a, b) => a.distanceKm - b.distanceKm);
          setNearestService(withDist[0]);
        }
      } catch {
        // offline — nearest-service lookup simply unavailable this session
      }
    });
  }, [id]);

  if (loading || !village) return <LoadingState label="Loading village risk…" />;

  const category = village.risk.riskCategory;
  const reasons = WHY_REASONS[category] || WHY_REASONS.YELLOW;

  return (
    <div className="space-y-5">
      <OfflineBanner syncedAt={syncedAt} />

      <Link to="/public/check" className="text-xs text-brand-600 hover:underline">
        ← Search another village
      </Link>

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-brand-900">{village.name}</h1>
            <p className="text-sm text-slate-500">Population: {village.population.toLocaleString()}</p>
          </div>
          <RiskBadge category={category} size="lg" />
        </div>

        <div className="mt-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Why?</p>
          <ul className="mt-2 space-y-1">
            {reasons.map((r) => (
              <li key={r} className="flex gap-2 text-sm text-slate-600">
                <span className="text-brand-500">•</span>
                {r}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">What should I do?</p>
        <ul className="mt-2 space-y-1.5 text-sm text-slate-600">
          {category === "RED" && (
            <>
              <li>• Be ready to move toward a designated safe location if officially instructed.</li>
              <li>• Keep emergency supplies, documents and medicines ready now.</li>
            </>
          )}
          {category === "ORANGE" && (
            <>
              <li>• Monitor official updates closely and prepare essential supplies.</li>
              <li>• Identify your nearest safe location in advance.</li>
            </>
          )}
          {category === "YELLOW" && (
            <li>• Stay informed and follow general flood-preparedness guidance.</li>
          )}
        </ul>
        <Link to="/public/safety" className="mt-3 inline-block text-xs font-medium text-brand-600 hover:underline">
          View full safety guidance →
        </Link>
      </div>

      {nearestService && (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Nearest safe location</p>
          <div className="mt-2 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-800">{nearestService.name}</p>
              <p className="text-xs text-slate-400">Shelter · Capacity {nearestService.capacity?.toLocaleString()}</p>
            </div>
            <p className="text-sm font-medium text-brand-700">{nearestService.distanceKm.toFixed(1)} km</p>
          </div>
          <Link to="/public/locations" className="mt-3 inline-block text-xs font-medium text-brand-600 hover:underline">
            View all nearby services →
          </Link>
        </div>
      )}

      <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
        This risk level comes from a Scenario-based Relocation model. It is not an official evacuation
        order — always follow instructions from local disaster-management authorities.
      </div>
    </div>
  );
}
