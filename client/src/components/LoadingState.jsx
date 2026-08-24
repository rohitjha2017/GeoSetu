export default function LoadingState({ label = "Loading…" }) {
  return (
    <div className="flex h-40 w-full flex-col items-center justify-center gap-2 text-slate-400">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-brand-600" />
      <p className="text-sm">{label}</p>
    </div>
  );
}
