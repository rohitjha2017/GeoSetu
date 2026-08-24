import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import OfflineBanner from "../components/OfflineBanner.jsx";
import { fetchWithOfflineFallback } from "../services/offlineStore.js";
import { getDashboardStats } from "../services/api.js";

export default function PublicHome() {
  const [stats, setStats] = useState(null);
  const [syncedAt, setSyncedAt] = useState(null);

  useEffect(() => {
    fetchWithOfflineFallback("public:overview", () => getDashboardStats(8.0)).then((res) => {
      setStats(res.data);
      setSyncedAt(res.syncedAt);
    });
  }, []);

  return (
    <div className="space-y-6">
      <OfflineBanner syncedAt={syncedAt} />

      <div className="rounded-2xl bg-brand-700 px-6 py-8 text-white">
        <h1 className="text-2xl font-bold">Check your flood risk</h1>
        <p className="mt-2 text-sm text-white/80">
          Find out if your village is at risk from Koshi river flooding, what to do about it, and
          where the nearest safe locations are.
        </p>
        <Link
          to="/public/check"
          className="mt-5 inline-block rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-brand-700 hover:bg-white/90"
        >
          Check my area →
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Link
          to="/public/safety"
          className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:border-brand-300"
        >
          <p className="text-sm font-semibold text-brand-700">Safety Guidance</p>
          <p className="mt-1 text-xs text-slate-500">Before, during and after a flood.</p>
        </Link>
        <Link
          to="/public/locations"
          className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:border-brand-300"
        >
          <p className="text-sm font-semibold text-brand-700">Safe Locations</p>
          <p className="mt-1 text-xs text-slate-500">Shelters, hospitals and relief centres near you.</p>
        </Link>
      </div>

      {stats && (
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Current district-wide snapshot
          </p>
          <div className="mt-3 grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-lg font-bold text-slate-800">{stats.totalMonitoredVillages}</p>
              <p className="text-[11px] text-slate-500">Villages monitored</p>
            </div>
            <div>
              <p className="text-lg font-bold text-orange-600">{stats.highRiskVillages}</p>
              <p className="text-[11px] text-slate-500">Currently at elevated risk</p>
            </div>
            <div>
              <p className="text-lg font-bold text-red-600">{stats.criticalVillages}</p>
              <p className="text-[11px] text-slate-500">Critical risk</p>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
        This is a Scenario-based Relocation, not an official evacuation or alert system. Always follow
        instructions from local disaster-management authorities.
      </div>
    </div>
  );
}
