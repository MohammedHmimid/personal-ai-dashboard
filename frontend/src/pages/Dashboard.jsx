import { motion } from "framer-motion";
import {
  CheckCircle2,
  CheckSquare,
  Loader2,
  MessageSquare,
  Plus,
  StickyNote,
  Target,
  TrendingUp,
  Upload,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import EmptyState from "../components/EmptyState";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

function KpiCard({ icon: Icon, label, value, hint }) {
  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-muted">{label}</span>
        <Icon size={16} className="text-accent" />
      </div>
      <p className="font-display text-2xl font-semibold">{value}</p>
      {hint && <p className="text-xs text-muted mt-1">{hint}</p>}
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/api/dashboard/summary")
      .then(({ data }) => setSummary(data))
      .catch(() => setError("Impossible de charger le dashboard."));
  }, []);

  const firstName = user?.name?.split(" ")[0] || "";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Bonjour" : hour < 18 ? "Bon après-midi" : "Bonsoir";

  if (error) {
    return (
      <EmptyState
        title="Une erreur est survenue"
        description={error}
        action={
          <button className="btn-secondary" onClick={() => window.location.reload()}>
            Réessayer
          </button>
        }
      />
    );
  }

  if (!summary) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="animate-spin text-accent" size={24} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-6 bg-gradient-to-br from-accent-soft to-transparent"
      >
        <h1 className="font-display text-xl font-semibold">
          {greeting}, {firstName} 👋
        </h1>
        <p className="text-sm text-muted mt-1">
          Voici ce qui se passe dans ton espace aujourd'hui.
        </p>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          icon={CheckSquare}
          label="Tasks"
          value={summary.total_tasks}
          hint={`${summary.tasks_change_pct >= 0 ? "+" : ""}${summary.tasks_change_pct}% cette semaine`}
        />
        <KpiCard icon={CheckCircle2} label="Completed" value={summary.completed_tasks} />
        <KpiCard icon={StickyNote} label="Notes" value={summary.total_notes} />
        <KpiCard
          icon={Target}
          label="Goals Progress"
          value={`${summary.avg_goal_progress}%`}
          hint={`${summary.active_goals} objectif(s) actif(s)`}
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-sm">Productivity</h2>
            <TrendingUp size={16} className="text-accent" />
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={summary.productivity}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--color-border))" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: "rgb(var(--color-muted))" }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "rgb(var(--color-muted))" }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  background: "rgb(var(--color-surface-raised))",
                  border: "1px solid rgb(var(--color-border))",
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Bar dataKey="created" name="Créées" fill="rgb(var(--color-border))" radius={[4, 4, 0, 0]} />
              <Bar dataKey="completed" name="Terminées" fill="#5B5FEF" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5">
          <h2 className="font-display font-semibold text-sm mb-4">Quick Actions</h2>
          <div className="flex flex-col gap-2">
            <Link to="/notes" className="btn-secondary flex items-center gap-2 justify-start">
              <Plus size={15} /> New Note
            </Link>
            <Link to="/tasks" className="btn-secondary flex items-center gap-2 justify-start">
              <Plus size={15} /> New Task
            </Link>
            <Link to="/goals" className="btn-secondary flex items-center gap-2 justify-start">
              <Plus size={15} /> New Goal
            </Link>
            <Link to="/assistant" className="btn-secondary flex items-center gap-2 justify-start">
              <MessageSquare size={15} /> Ask AI
            </Link>
            <button className="btn-secondary flex items-center gap-2 justify-start opacity-60 cursor-not-allowed" disabled>
              <Upload size={15} /> Upload Document (Phase 2)
            </button>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card p-5">
          <h2 className="font-display font-semibold text-sm mb-3">Today's Tasks</h2>
          {summary.today_tasks.length === 0 ? (
            <EmptyState
              icon={CheckSquare}
              title="Rien de prévu aujourd'hui"
              description="Profites-en, ou ajoute une tâche."
            />
          ) : (
            <ul className="flex flex-col divide-y divide-border">
              {summary.today_tasks.map((task) => (
                <li key={task.id} className="py-2.5 flex items-center gap-3">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      task.priority === "urgent"
                        ? "bg-danger"
                        : task.priority === "high"
                        ? "bg-spark"
                        : "bg-muted"
                    }`}
                  />
                  <span className="text-sm flex-1 truncate">{task.title}</span>
                  <span className="text-xs text-muted capitalize">{task.priority}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card p-5">
          <h2 className="font-display font-semibold text-sm mb-3">Recent Notes</h2>
          {summary.recent_notes.length === 0 ? (
            <EmptyState
              icon={StickyNote}
              title="Aucune note pour l'instant"
              description="Commence à capturer tes idées."
            />
          ) : (
            <ul className="flex flex-col divide-y divide-border">
              {summary.recent_notes.map((note) => (
                <li key={note.id} className="py-2.5">
                  <Link to="/notes" className="text-sm font-medium hover:text-accent transition">
                    {note.title}
                  </Link>
                  <p className="text-xs text-muted truncate mt-0.5">
                    {note.content?.slice(0, 80) || "Note vide"}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
