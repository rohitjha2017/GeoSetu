const SECTIONS = [
  {
    title: "Before flooding",
    color: "bg-emerald-50 border-emerald-200 text-emerald-800",
    items: [
      "Keep important documents protected (waterproof bag/container)",
      "Store drinking water in clean, sealed containers",
      "Keep essential medicines ready and accessible",
      "Charge phones and power banks in advance",
      "Prepare a bag of essential supplies (food, clothes, torch)",
      "Follow official warnings and instructions closely"
    ]
  },
  {
    title: "During flooding",
    color: "bg-orange-50 border-orange-200 text-orange-800",
    items: [
      "Move toward designated safe locations when officially instructed",
      "Avoid walking or driving through flowing floodwater",
      "Do not use damaged electrical equipment or switches",
      "Avoid unnecessary travel until conditions are declared safe"
    ]
  },
  {
    title: "After flooding",
    color: "bg-slate-50 border-slate-200 text-slate-700",
    items: [
      "Avoid contact with contaminated floodwater",
      "Stay away from damaged electrical infrastructure",
      "Follow official health and safety instructions before returning home"
    ]
  }
];

export default function PublicSafety() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-brand-900">Disaster Safety Guidance</h1>
        <p className="text-sm text-slate-500">Practical steps before, during and after flooding.</p>
      </div>

      {SECTIONS.map((section) => (
        <div key={section.title} className={`rounded-xl border p-5 ${section.color}`}>
          <p className="text-sm font-bold">{section.title}</p>
          <ul className="mt-3 space-y-2">
            {section.items.map((item) => (
              <li key={item} className="flex gap-2 text-sm">
                <span>•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}

      <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
        This guidance is general preparedness information. Your area's flood-risk indicator on this
        platform is a scenario-based estimate and is not an official evacuation order — always follow
        instructions from local disaster-management authorities.
      </div>
    </div>
  );
}
