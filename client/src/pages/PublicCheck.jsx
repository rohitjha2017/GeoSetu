import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { searchVillages } from "../services/api.js";

export default function PublicCheck() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [locating, setLocating] = useState(false);
  const [locError, setLocError] = useState("");

  async function handleSearch(e) {
    const q = e.target.value;
    setQuery(q);
    if (q.trim().length === 0) {
      setResults([]);
      return;
    }
    const data = await searchVillages(q);
    setResults(data);
  }

  function useMyLocation() {
    setLocError("");
    if (!navigator.geolocation) {
      setLocError("Location services are not available on this device/browser.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async () => {
        // Prototype note: without a live coordinate→village lookup service,
        // we surface the nearest-known demo village list instead of
        // guessing. This keeps the flow honest rather than faking a match.
        const data = await searchVillages("");
        setResults(data);
        setLocating(false);
      },
      () => {
        setLocError("Could not access your location. Please search by name instead.");
        setLocating(false);
      },
      { timeout: 8000 }
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-brand-900">Check your area</h1>
        <p className="text-sm text-slate-500">Search for your village to see its current flood risk.</p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <label className="text-xs font-medium uppercase tracking-wide text-slate-400">
          Enter village name
        </label>
        <input
          value={query}
          onChange={handleSearch}
          placeholder="e.g. Alauli, Nirmali, Simri Bakhtiyarpur…"
          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
        />

        <div className="mt-3 flex items-center gap-2">
          <div className="h-px flex-1 bg-slate-100" />
          <span className="text-xs text-slate-400">or</span>
          <div className="h-px flex-1 bg-slate-100" />
        </div>

        <button
          onClick={useMyLocation}
          disabled={locating}
          className="mt-3 w-full rounded-lg border border-brand-200 bg-brand-50 px-3 py-2.5 text-sm font-medium text-brand-700 hover:bg-brand-100 disabled:opacity-60"
        >
          {locating ? "Locating…" : "📍 Use my location"}
        </button>
        {locError && <p className="mt-2 text-xs text-red-600">{locError}</p>}
      </div>

      {results.length > 0 && (
        <div className="space-y-2">
          {results.map((v) => (
            <button
              key={v.id}
              onClick={() => navigate(`/public/village/${v.id}`)}
              className="flex w-full items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3 text-left shadow-sm hover:border-brand-300"
            >
              <div>
                <p className="text-sm font-medium text-slate-800">{v.name}</p>
                <p className="text-xs text-slate-400">
                  {v.districtId.replace("dist-", "")} district · Pop. {v.population.toLocaleString()}
                </p>
              </div>
              <span className="text-brand-600">→</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
