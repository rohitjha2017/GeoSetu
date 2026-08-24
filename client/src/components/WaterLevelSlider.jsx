export default function WaterLevelSlider({ value, onChange, min = 6.0, max = 10.0 }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-700">Koshi River Level — Scenario Model</p>
          <p className="text-xs text-slate-400">
            Scenario-based flood risk model. Not a real-time or verified forecast.
          </p>
        </div>
        <span className="rounded-lg bg-brand-50 px-3 py-1 text-lg font-bold text-brand-700">
          {value.toFixed(1)} m
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={0.1}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="mt-4 w-full accent-brand-600"
      />
      <div className="mt-1 flex justify-between text-xs text-slate-400">
        <span>{min.toFixed(1)} m (lower)</span>
        <span>{max.toFixed(1)} m (higher)</span>
      </div>
    </div>
  );
}
