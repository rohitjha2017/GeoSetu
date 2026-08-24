import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import RiskMap from "../components/RiskMap.jsx";
import { getVillages, getRiver, getFloodZones } from "../services/api.js";

export default function Landing() {
  const [mapData, setMapData] = useState(null);

  useEffect(() => {
    Promise.all([getVillages(8.0), getRiver(), getFloodZones(8.0)])
      .then(([villagesRes, river, floodZones]) =>
        setMapData({ villages: villagesRes.villages, river, floodZones })
      )
      .catch(() => setMapData(null));
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-700 text-sm font-bold text-white">
              DR
            </div>
            <span className="text-sm font-semibold text-brand-800">
              Disaster Risk &amp; Relocation Intelligence
            </span>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500">
            Scenario-based Relocation
          </span>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 pb-8 pt-10 md:pt-16">
        <div className="grid gap-10 md:grid-cols-2 md:items-center">
          <div>
            <h1 className="text-3xl font-extrabold leading-tight text-brand-900 md:text-4xl">
              Proactive Disaster Risk &amp; Relocation Intelligence
            </h1>
            <p className="mt-4 text-base text-slate-600">
              AI-assisted GIS decision support for safer communities and proactive disaster
              planning — demonstrated on a Koshi river flood scenario for Bihar.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <Link
                to="/authority"
                className="group rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-brand-300 hover:shadow-md"
              >
                <p className="text-sm font-semibold text-brand-700">Authority Dashboard</p>
                <p className="mt-1 text-sm text-slate-500">
                  Analyze risk, prioritize vulnerable settlements and plan relocation.
                </p>
                <span className="mt-3 inline-block text-xs font-medium text-brand-600 group-hover:underline">
                  Enter dashboard →
                </span>
              </Link>
              <Link
                to="/public"
                className="group rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-brand-300 hover:shadow-md"
              >
                <p className="text-sm font-semibold text-brand-700">Public Safety</p>
                <p className="mt-1 text-sm text-slate-500">
                  Check your area's risk and find nearby safe locations.
                </p>
                <span className="mt-3 inline-block text-xs font-medium text-brand-600 group-hover:underline">
                  Check my area →
                </span>
              </Link>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3 text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-risk-yellow" /> Moderate
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-risk-orange" /> High
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-risk-red" /> Critical
              </span>
            </div>
          </div>

          <div className="h-80 md:h-[26rem]">
            {mapData ? (
              <RiskMap villages={mapData.villages} river={mapData.river} floodZones={mapData.floodZones} />
            ) : (
              <div className="flex h-full items-center justify-center rounded-xl border border-slate-200 bg-white text-sm text-slate-400">
                Loading Bihar / Koshi map…
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <h2 className="text-lg font-semibold text-brand-800">About this Platform</h2>
          <p className="mt-2 max-w-3xl text-sm text-slate-600">
            This platform demonstrates a full decision-support workflow — from a flood scenario, to
            dynamic risk zones, to vulnerable-village identification, relocation prioritization,
            candidate site ranking, capacity assessment, and an AI copilot that explains the results
            using the application's actual underlying data.
          </p>
          <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            <strong>Scenario-based reloca:</strong> risk zones are generated from a deterministic
            demo scoring model driven by a user-adjustable water-level scenario. This is not a
            real-time or verified flood prediction system.
          </div>
        </div>
      </section>
    </div>
  );
}
