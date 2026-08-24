import { useEffect, useState } from "react";
import RiskMap from "../components/RiskMap.jsx";
import OfflineBanner from "../components/OfflineBanner.jsx";
import LoadingState from "../components/LoadingState.jsx";
import { fetchWithOfflineFallback } from "../services/offlineStore.js";
import { getServices } from "../services/api.js";

const TYPE_LABEL = {
  shelter: "Shelter",
  hospital: "Hospital",
  police: "Police Station",
  relief_centre: "Relief Centre"
};

const TYPE_ICON = {
  shelter: "🏠",
  hospital: "🏥",
  police: "🚓",
  relief_centre: "📦"
};

export default function PublicLocations() {
  const [services, setServices] = useState([]);
  const [filter, setFilter] = useState("all");
  const [syncedAt, setSyncedAt] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWithOfflineFallback("public:services", () => getServices()).then((res) => {
      setServices(res.data);
      setSyncedAt(res.syncedAt);
      setLoading(false);
    });
  }, []);

  if (loading) return <LoadingState label="Loading safe locations…" />;

  const filtered = filter === "all" ? services : services.filter((s) => s.type === filter);
  const mapVillages = filtered.map((s) => ({
    id: s.id,
    name: s.name,
    location: s.location,
    population: 0,
    risk: { riskCategory: "GREEN", riskScore: 0 }
  }));

  return (
    <div className="space-y-4">
      <OfflineBanner syncedAt={syncedAt} />
      <div>
        <h1 className="text-xl font-bold text-brand-900">Safe Locations &amp; Essential Services</h1>
        <p className="text-sm text-slate-500">Shelters, hospitals, police stations and relief centres.</p>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {["all", "shelter", "hospital", "police", "relief_centre"].map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium ${
              filter === t ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-600"
            }`}
          >
            {t === "all" ? "All" : TYPE_LABEL[t]}
          </button>
        ))}
      </div>

      <div className="h-72">
        <RiskMap villages={mapVillages} fitToData />
      </div>

      <div className="space-y-2">
        {filtered.map((s) => (
          <div key={s.id} className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="text-xl">{TYPE_ICON[s.type]}</span>
              <div>
                <p className="text-sm font-medium text-slate-800">{s.name}</p>
                <p className="text-xs text-slate-400">
                  {TYPE_LABEL[s.type]}
                  {s.capacity ? ` · Capacity ${s.capacity.toLocaleString()}` : ""}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
