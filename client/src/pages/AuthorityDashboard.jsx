import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import WaterLevelSlider from "../components/WaterLevelSlider.jsx";
import StatCard from "../components/StatCard.jsx";
import RiskMap from "../components/RiskMap.jsx";
import LoadingState from "../components/LoadingState.jsx";
import RiskBadge from "../components/RiskBadge.jsx";
import PriorityBadge from "../components/PriorityBadge.jsx";
import {
  getDashboardStats,
  getVillages,
  getRiver,
  getFloodZones,
  getSites
} from "../services/api.js";

export default function AuthorityDashboard() {
  const navigate = useNavigate();
  const [waterLevel, setWaterLevel] = useState(8.0);
  const [stats, setStats] = useState(null);
  const [villages, setVillages] = useState([]);
  const [river, setRiver] = useState(null);
  const [floodZones, setFloodZones] = useState(null);
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (level) => {
    const [statsRes, villagesRes, riverRes, zonesRes, sitesRes] = await Promise.all([
      getDashboardStats(level),
      getVillages(level),
      getRiver(),
      getFloodZones(level),
      getSites()
    ]);
    setStats(statsRes);
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

  const priorityVillages = [...villages]
    .filter((v) => v.risk.riskCategory !== "YELLOW")
    .sort((a, b) => b.risk.riskScore - a.risk.riskScore)
    .slice(0, 6);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-brand-900">Authority Dashboard</h1>
          <p className="text-sm text-slate-500">Bihar · Koshi river flood scenario</p>
        </div>
        <div className="w-full max-w-sm">
          <WaterLevelSlider value={waterLevel} onChange={setWaterLevel} />
        </div>
      </div>

      {loading ? (
        <LoadingState label="Loading dashboard…" />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
            <StatCard label="Monitored villages" value={stats.totalMonitoredVillages} icon="🏘️" />
            <StatCard
              label="High-risk villages"
              value={stats.highRiskVillages}
              icon="⚠️"
              accent="text-orange-600"
            />
            <StatCard
              label="Immediate relocation"
              value={stats.immediateRelocationCandidates}
              icon="🚨"
              accent="text-red-600"
            />
            <StatCard
              label="Affected population"
              value={stats.estimatedAffectedPopulation.toLocaleString()}
              icon="👥"
            />
            <StatCard
              label="Relocation capacity"
              value={stats.availableRelocationCapacity.toLocaleString()}
              icon="🏗️"
              accent="text-emerald-600"
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <div className="h-[28rem] lg:col-span-2">
              <RiskMap
                villages={villages}
                river={river}
                floodZones={floodZones}
                sites={sites}
                onVillageClick={(v) => navigate(`/authority/village/${v.id}`)}
                fitToData={false}
              />
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-sm font-semibold text-slate-700">Priority villages at current scenario</p>
              <div className="mt-3 max-h-[24rem] space-y-2 overflow-y-auto pr-1">
                {priorityVillages.length === 0 && (
                  <p className="text-sm text-slate-400">No high-risk villages at this water level.</p>
                )}
                {priorityVillages.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => navigate(`/authority/village/${v.id}`)}
                    className="flex w-full items-center justify-between rounded-lg border border-slate-100 px-3 py-2 text-left hover:bg-slate-50"
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-800">{v.name}</p>
                      <p className="text-xs text-slate-400">Pop. {v.population.toLocaleString()}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <RiskBadge category={v.risk.riskCategory} />
                      <PriorityBadge priority={v.risk.relocationPriority} />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
