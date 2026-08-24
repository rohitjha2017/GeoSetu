import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import CopilotChat from "../components/CopilotChat.jsx";
import { searchVillages } from "../services/api.js";

export default function Copilot() {
  const [searchParams, setSearchParams] = useSearchParams();
  const villageId = searchParams.get("villageId") || "";
  const siteId = searchParams.get("siteId") || "";
  const waterLevel = parseFloat(searchParams.get("waterLevel")) || 8.0;

  const [villages, setVillages] = useState([]);

  useEffect(() => {
    searchVillages("").then(setVillages);
  }, []);

  return (
    <div className="flex h-full flex-col gap-4">
      <div>
        <h1 className="text-xl font-bold text-brand-900">AI Relocation Copilot</h1>
        <p className="text-sm text-slate-500">
          Ask questions grounded in this application's real village and site data.
        </p>
      </div>

      <div className="max-w-sm">
        <label className="text-xs font-medium uppercase tracking-wide text-slate-400">
          Focus village (optional)
        </label>
        <select
          value={villageId}
          onChange={(e) =>
            setSearchParams((prev) => {
              const next = new URLSearchParams(prev);
              if (e.target.value) next.set("villageId", e.target.value);
              else next.delete("villageId");
              return next;
            })
          }
          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
        >
          <option value="">— General question —</option>
          {villages.map((v) => (
            <option key={v.id} value={v.id}>
              {v.name}
            </option>
          ))}
        </select>
      </div>

      <div className="min-h-[28rem] flex-1">
        <CopilotChat villageId={villageId} siteId={siteId} waterLevelM={waterLevel} />
      </div>
    </div>
  );
}
