import {
  CheckSquare,
  Info,
  LayoutDashboard,
  Loader2,
  MessageSquare,
  Settings,
  StickyNote,
  Target,
  X,
} from "lucide-react";
import { NavLink } from "react-router-dom";

const NAV_ITEMS = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/notes", label: "Notes", icon: StickyNote },
  { to: "/tasks", label: "Tasks", icon: CheckSquare },
  { to: "/goals", label: "Goals", icon: Target },
  { to: "/assistant", label: "AI Assistant", icon: MessageSquare },
  { to: "/settings", label: "Settings", icon: Settings },
  { to: "/about", label: "Support & À propos", icon: Info },
];

export default function Sidebar({ open, onClose }) {
  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <aside
        className={`fixed lg:sticky top-0 h-screen w-64 shrink-0 border-r border-border bg-surface z-40
        transform transition-transform lg:translate-x-0
        ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex items-center justify-between px-5 py-5">
          <div className="flex items-center gap-2">
            <span className="text-accent text-lg">✦</span>
            <span className="font-display font-semibold text-[15px] tracking-tight">
              SecondBrain
            </span>
          </div>
          <button className="lg:hidden text-muted" onClick={onClose} aria-label="Fermer le menu">
            <X size={18} />
          </button>
        </div>

        <nav className="px-3 flex flex-col gap-0.5" aria-label="Navigation principale">
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-accent-soft text-accent"
                    : "text-muted hover:text-ink hover:bg-surface-raised"
                }`
              }
            >
              <Icon size={17} strokeWidth={2} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="absolute bottom-5 left-3 right-3 px-2">
          <div className="text-xs text-muted flex items-center gap-1.5">
            <Loader2 size={12} className="text-spark" />
            Mode IA : démonstration
          </div>
        </div>
      </aside>
    </>
  );
}
