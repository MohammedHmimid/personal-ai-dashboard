import { LogOut, Menu, Moon, Search, Sun } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

export default function Header({ onMenuClick }) {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const initials = (user?.name || "?")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-border bg-surface/90 backdrop-blur px-4 lg:px-6 py-3">
      <button className="lg:hidden text-muted" onClick={onMenuClick} aria-label="Ouvrir le menu">
        <Menu size={20} />
      </button>

      <div className="relative flex-1 max-w-md">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <input
          className="input-field pl-9"
          placeholder="Rechercher notes, tâches, objectifs..."
          onFocus={(e) => e.currentTarget.blur()}
          onClick={() => navigate("/notes")}
          readOnly
        />
      </div>

      <div className="ml-auto flex items-center gap-2">
        <button
          className="p-2 rounded-lg text-muted hover:text-ink hover:bg-surface-raised transition"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          aria-label="Changer de thème"
        >
          {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
        </button>

        <div className="relative">
          <button
            className="w-8 h-8 rounded-full bg-accent text-white text-xs font-semibold flex items-center justify-center"
            onClick={() => setMenuOpen((v) => !v)}
          >
            {initials}
          </button>
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-48 card shadow-lg py-1 text-sm">
              <div className="px-3 py-2 border-b border-border">
                <p className="font-medium truncate">{user?.name}</p>
                <p className="text-muted text-xs truncate">{user?.email}</p>
              </div>
              <button
                className="w-full text-left px-3 py-2 flex items-center gap-2 text-danger hover:bg-surface-raised"
                onClick={logout}
              >
                <LogOut size={14} /> Se déconnecter
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
