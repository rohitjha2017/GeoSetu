import { NavLink, Outlet, Link } from "react-router-dom";

const NAV = [
  { to: "/authority", label: "Dashboard", end: true },
  { to: "/authority/map", label: "GIS Risk Map" },
  { to: "/authority/copilot", label: "AI Copilot" }
];

export default function AuthorityLayout() {
  return (
    <div className="flex h-screen bg-slate-50">
      <aside className="hidden w-60 flex-col border-r border-slate-200 bg-brand-800 text-white md:flex">
        <div className="px-5 py-5">
          <Link to="/" className="block text-sm font-semibold leading-tight text-white/90">
            Disaster Risk &amp; Relocation
          </Link>
          <p className="mt-0.5 text-xs text-white/50">Authority Mode · Bihar</p>
        </div>
        <nav className="mt-2 flex-1 space-y-1 px-3">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `block rounded-lg px-3 py-2 text-sm transition ${
                  isActive ? "bg-white/10 font-semibold text-white" : "text-white/70 hover:bg-white/5"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-white/10 px-5 py-4">
          <Link to="/public" className="text-xs text-white/60 hover:text-white">
            Switch to Public Mode →
          </Link>
        </div>
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 md:hidden">
          <Link to="/" className="text-sm font-semibold text-brand-700">
            Disaster Risk &amp; Relocation
          </Link>
          <Link to="/public" className="text-xs text-brand-600">
            Public Mode →
          </Link>
        </header>
        <div className="flex gap-1 overflow-x-auto border-b border-slate-200 bg-white px-3 py-2 md:hidden">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `whitespace-nowrap rounded-full px-3 py-1 text-xs ${
                  isActive ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-600"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
