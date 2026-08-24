const STYLES = {
  IMMEDIATE: "bg-red-600 text-white",
  SHORT_TERM: "bg-orange-500 text-white",
  MEDIUM_TERM: "bg-amber-500 text-white",
  MONITOR: "bg-slate-400 text-white"
};

const LABEL = {
  IMMEDIATE: "Immediate",
  SHORT_TERM: "Short-term",
  MEDIUM_TERM: "Medium-term",
  MONITOR: "Monitor"
};

export default function PriorityBadge({ priority }) {
  const p = priority || "MONITOR";
  return (
    <span className={`risk-pill ${STYLES[p] || STYLES.MONITOR}`}>{LABEL[p] || p}</span>
  );
}
