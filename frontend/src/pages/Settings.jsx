import { Check, Laptop, Moon, Sun } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import api from "../services/api";

const THEME_OPTIONS = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Laptop },
];

export default function Settings() {
  const { user, updateUser } = useAuth();
  const { theme, setTheme } = useTheme();
  const [name, setName] = useState(user?.name || "");
  const [saved, setSaved] = useState(false);

  const saveProfile = async (e) => {
    e.preventDefault();
    const { data } = await api.put("/api/auth/me", { name });
    updateUser(data);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="flex flex-col gap-6 max-w-xl">
      <h1 className="font-display font-semibold text-lg">Settings</h1>

      <section className="card p-5">
        <h2 className="font-medium text-sm mb-4">Profile</h2>
        <form onSubmit={saveProfile} className="flex flex-col gap-3">
          <div>
            <label className="text-xs font-medium text-muted mb-1 block">Nom</label>
            <input className="input-field" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-medium text-muted mb-1 block">Email</label>
            <input className="input-field opacity-60" value={user?.email || ""} disabled />
          </div>
          <button type="submit" className="btn-primary self-start flex items-center gap-1.5">
            {saved && <Check size={14} />} {saved ? "Enregistré" : "Enregistrer"}
          </button>
        </form>
      </section>

      <section className="card p-5">
        <h2 className="font-medium text-sm mb-4">Appearance</h2>
        <div className="flex gap-2">
          {THEME_OPTIONS.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              onClick={() => setTheme(value)}
              className={`flex-1 flex flex-col items-center gap-1.5 py-3 rounded-lg border text-xs font-medium transition ${
                theme === value ? "border-accent text-accent bg-accent-soft" : "border-border text-muted"
              }`}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </div>
      </section>

      <section className="card p-5">
        <h2 className="font-medium text-sm mb-2">AI</h2>
        <p className="text-sm text-muted">
          L'assistant fonctionne actuellement en <strong className="text-ink">mode démonstration</strong>{" "}
          (aucune clé API configurée). Pour activer OpenAI ou Anthropic, renseigne{" "}
          <code className="text-xs bg-surface-raised px-1 py-0.5 rounded">AI_PROVIDER</code>,{" "}
          <code className="text-xs bg-surface-raised px-1 py-0.5 rounded">OPENAI_API_KEY</code> ou{" "}
          <code className="text-xs bg-surface-raised px-1 py-0.5 rounded">ANTHROPIC_API_KEY</code> dans le{" "}
          <code className="text-xs bg-surface-raised px-1 py-0.5 rounded">.env</code> du backend, puis redémarre le
          serveur.
        </p>
      </section>
    </div>
  );
}
