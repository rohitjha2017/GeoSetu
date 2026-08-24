import { NavLink, Outlet, Link } from "react-router-dom";
import { useOnlineStatus } from "../hooks/useOnlineStatus.js";

const NAV = [
  { to: "/public", label: "Home", end: true },
  { to: "/public/check", label: "Check My Area" },
  { to: "/public/safety", label: "Safety Guidance" },
  { to: "/public/locations", label: "Safe Locations" }
];

export default function PublicLayout() {
  const online = useOnlineStatus();

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
          <Link to="/public" className="flex items-center gap-2">
            <span className="text-sm font-bold text-brand-700">Bihar Flood Safety</span>
            <span
              className={`h-2 w-2 rounded-full ${online ? "bg-emerald-500" : "bg-amber-500"}`}
              title={online ? "Online" : "Offline"}
            />
          </Link>
          <Link to="/authority" className="text-xs text-slate-400 hover:text-brand-600">
            Authority Login →
          </Link>
        </div>
        <nav className="mx-auto flex max-w-4xl gap-1 overflow-x-auto px-4 pb-2">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium transition ${
                  isActive ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </header>
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-5">
        <Outlet />
      </main>
      <footer className="border-t border-slate-200 bg-white px-4 py-3 text-center text-[11px] text-slate-400">
        Scenario-based prototype for SIH demonstration · Not an official emergency alert system
      </footer>
    </div>
  );
}
