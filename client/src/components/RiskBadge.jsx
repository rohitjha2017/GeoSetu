const STYLES = {
  YELLOW: "bg-amber-100 text-amber-800 ring-1 ring-amber-300",
  ORANGE: "bg-orange-100 text-orange-800 ring-1 ring-orange-300",
  RED: "bg-red-100 text-red-800 ring-1 ring-red-300",
  GREEN: "bg-emerald-100 text-emerald-800 ring-1 ring-emerald-300"
};

const DOT = {
  YELLOW: "bg-risk-yellow",
  ORANGE: "bg-risk-orange",
  RED: "bg-risk-red",
  GREEN: "bg-risk-green"
};

const LABEL = {
  YELLOW: "Moderate",
  ORANGE: "High",
  RED: "Critical",
  GREEN: "Safe"
};

export default function RiskBadge({ category, size = "md" }) {
  const cat = (category || "GREEN").toUpperCase();
  const sizeClass = size === "lg" ? "text-sm px-4 py-1.5" : "text-xs px-3 py-1";
  return (
    <span className={`risk-pill ${sizeClass} ${STYLES[cat] || STYLES.GREEN}`}>
      <span className={`h-2 w-2 rounded-full ${DOT[cat] || DOT.GREEN}`} />
      {LABEL[cat] || cat}
    </span>
  );
}
