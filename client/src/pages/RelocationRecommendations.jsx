import { useEffect, useState } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import LoadingState from "../components/LoadingState.jsx";
import RiskBadge from "../components/RiskBadge.jsx";
import { getVillageRelocationOptions, getVillageComparison } from "../services/api.js";

function SubScoreBar({ label, score }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-24 shrink-0 text-slate-500">{label}</span>
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-brand-500" style={{ width: `${score.value}%` }} />
      </div>
      <span className="w-16 text-right text-slate-500">{score.label}</span>
    </div>
  );
}

export default function RelocationRecommendations() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const waterLevel = parseFloat(searchParams.get("waterLevel")) || 8.0;

  const [data, setData] = useState(null);
  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getVillageRelocationOptions(id, waterLevel).then((res) => {
      setData(res);
      setLoading(false);
      const top = res.candidateSites[0];
      if (top) {
        getVillageComparison(id, top.siteId, waterLevel).then(setComparison);
      }
    });
  }, [id, waterLevel]);

  if (loading || !data) return <LoadingState label="Ranking relocation sites…" />;

  const { village, candidateSites } = data;

  return (
    <div className="space-y-6">
      <div>
        <Link to={`/authority/village/${village.id}`} className="text-xs text-brand-600 hover:underline">
          ← Back to {village.name}
        </Link>
        <h1 className="mt-1 text-xl font-bold text-brand-900">
          Relocation Recommendations — {village.name}
        </h1>
        <p className="text-sm text-slate-500">
          Population {village.population.toLocaleString()} · Scenario water level {waterLevel.toFixed(1)} m
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {candidateSites.map((site) => (
          <div
            key={site.siteId}
            className={`rounded-xl border bg-white p-5 shadow-sm ${
              site.recommended ? "border-brand-400 ring-2 ring-brand-100" : "border-slate-200"
            }`}
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Site {String.fromCharCode(65 + site.rank - 1)}
              </p>
              {site.recommended && (
                <span className="rounded-full bg-brand-600 px-2.5 py-0.5 text-[10px] font-bold uppercase text-white">
                  Recommended
                </span>
              )}
            </div>
            <p className="mt-1 text-base font-bold text-slate-800">{site.siteName}</p>
            <p className="mt-1 text-2xl font-extrabold text-brand-700">
              {site.suitabilityScore}<span className="text-sm font-medium text-slate-400">/100</span>
            </p>

            <div className="mt-4 space-y-1.5">
              <SubScoreBar label="Safety" score={site.subScores.safety} />
              <SubScoreBar label="Capacity" score={site.subScores.capacity} />
              <SubScoreBar label="Road access" score={site.subScores.accessibility} />
              <SubScoreBar label="Healthcare" score={site.subScores.healthcare} />
              <SubScoreBar label="Schools" score={site.subScores.education} />
              <SubScoreBar label="Water" score={site.subScores.water} />
            </div>

            <div className="mt-4 border-t border-slate-100 pt-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Distance</span>
                <span className="font-medium">{site.distanceFromVillageKm} km</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Net available capacity</span>
                <span className="font-medium">{site.capacity.netAvailableCapacity.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Sufficient for village?</span>
                <span className={`font-medium ${site.capacity.sufficient ? "text-emerald-600" : "text-amber-600"}`}>
                  {site.capacity.sufficient ? "Yes" : `Shortfall: ${site.capacity.shortfall.toLocaleString()}`}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
          Estimated carrying capacity — {candidateSites[0].siteName}
        </p>
        <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-5">
          {Object.entries(candidateSites[0].capacity.factors).map(([k, v]) => (
            <div key={k} className="rounded-lg bg-slate-50 p-3 text-center">
              <p className="text-[11px] uppercase text-slate-400">{k}</p>
              <p className="text-lg font-bold text-slate-800">{v.toLocaleString()}</p>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-slate-500">
          Practical capacity is constrained by the weakest factor (
          <span className="font-semibold">{candidateSites[0].capacity.weakestFactor}</span>), then reduced
          by the {candidateSites[0].capacity.existingPopulation.toLocaleString()} people already living
          there — giving a net available capacity of{" "}
          <span className="font-semibold">{candidateSites[0].capacity.netAvailableCapacity.toLocaleString()}</span>.
          Estimated prototype calculation.
        </p>
      </div>

      {comparison && (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Post-relocation impact — {village.name} vs. {candidateSites[0].siteName}
          </p>
          <div className="mt-3 grid gap-4 md:grid-cols-2">
            <ComparisonCard title={village.name} data={comparison.comparison.village} isOrigin />
            <ComparisonCard title={candidateSites[0].siteName} data={comparison.comparison.site} />
          </div>
          <div className="mt-4">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Potential challenges</p>
            <ul className="mt-2 space-y-1.5">
              {comparison.comparison.challenges.map((c, i) => (
                <li key={i} className="flex gap-2 text-sm text-slate-600">
                  <span className="text-amber-500">•</span>
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </div>
          <p className="mt-4 text-[11px] text-slate-400">
            This is a prototype decision-support illustration, not a rigorous socioeconomic model.
          </p>
        </div>
      )}

      <Link
        to={`/authority/copilot?villageId=${village.id}&siteId=${candidateSites[0].siteId}&waterLevel=${waterLevel}`}
        className="inline-block rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
      >
        Ask Copilot why {candidateSites[0].siteName} is recommended →
      </Link>
    </div>
  );
}

function ComparisonCard({ title, data, isOrigin }) {
  return (
    <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-800">{title}</p>
        {isOrigin ? (
          <RiskBadge category={data.floodRisk} />
        ) : (
          <span className="risk-pill bg-emerald-100 text-emerald-800 ring-1 ring-emerald-300">
            <span className="h-2 w-2 rounded-full bg-risk-green" /> Low
          </span>
        )}
      </div>
      <dl className="mt-3 space-y-1.5 text-sm">
        <div className="flex justify-between"><dt className="text-slate-500">Agricultural access</dt><dd>{data.agriculturalAccess}</dd></div>
        <div className="flex justify-between"><dt className="text-slate-500">School distance</dt><dd>{data.schoolDistanceKm} km</dd></div>
        <div className="flex justify-between"><dt className="text-slate-500">Market distance</dt><dd>{data.marketDistanceKm} km</dd></div>
        <div className="flex justify-between"><dt className="text-slate-500">Healthcare distance</dt><dd>{data.healthcareDistanceKm} km</dd></div>
      </dl>
    </div>
  );
}
