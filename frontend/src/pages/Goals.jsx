import { motion } from "framer-motion";
import { Loader2, Plus, Target, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import EmptyState from "../components/EmptyState";
import api from "../services/api";

function NewGoalForm({ onCreated, onClose }) {
  const [title, setTitle] = useState("");
  const [deadline, setDeadline] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    try {
      const { data } = await api.post("/api/goals", {
        title,
        deadline: deadline ? new Date(deadline).toISOString() : null,
      });
      onCreated(data);
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      onSubmit={submit}
      className="card p-3 flex items-center gap-2 mb-4 flex-wrap"
    >
      <input
        autoFocus
        className="input-field flex-1 min-w-[160px]"
        placeholder="Ex : Apprendre le Machine Learning"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <input
        type="date"
        className="input-field w-40"
        value={deadline}
        onChange={(e) => setDeadline(e.target.value)}
      />
      <button type="submit" className="btn-primary" disabled={saving}>
        Ajouter
      </button>
      <button type="button" className="text-muted p-2" onClick={onClose} aria-label="Fermer">
        <X size={16} />
      </button>
    </motion.form>
  );
}

export default function Goals() {
  const [goals, setGoals] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    api.get("/api/goals").then(({ data }) => setGoals(data));
  }, []);

  const updateProgress = async (goal, progress) => {
    const status = progress >= 100 ? "completed" : "active";
    const { data } = await api.put(`/api/goals/${goal.id}`, { progress, status });
    setGoals((prev) => prev.map((g) => (g.id === goal.id ? data : g)));
  };

  const deleteGoal = async (id) => {
    await api.delete(`/api/goals/${id}`);
    setGoals((prev) => prev.filter((g) => g.id !== id));
  };

  if (goals === null) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="animate-spin text-accent" size={24} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <h1 className="font-display font-semibold text-lg">Goals</h1>
        <button className="btn-primary flex items-center gap-1.5 ml-auto" onClick={() => setShowForm((v) => !v)}>
          <Plus size={15} /> New Goal
        </button>
      </div>

      {showForm && (
        <NewGoalForm
          onClose={() => setShowForm(false)}
          onCreated={(g) => {
            setGoals((prev) => [g, ...prev]);
            setShowForm(false);
          }}
        />
      )}

      {goals.length === 0 ? (
        <EmptyState
          icon={Target}
          title="No goals yet"
          description="Définis un objectif pour suivre ta progression dans le temps."
          action={
            <button className="btn-primary" onClick={() => setShowForm(true)}>
              Create your first goal
            </button>
          }
        />
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {goals.map((goal) => (
            <div key={goal.id} className="card p-4 flex flex-col gap-3">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-medium text-sm">{goal.title}</h3>
                <button className="text-muted hover:text-danger" onClick={() => deleteGoal(goal.id)} aria-label="Supprimer">
                  <Trash2 size={14} />
                </button>
              </div>

              <div>
                <div className="flex justify-between text-xs text-muted mb-1">
                  <span>Progress</span>
                  <span>{goal.progress}%</span>
                </div>
                <div className="h-2 rounded-full bg-surface-raised overflow-hidden">
                  <motion.div
                    className="h-full bg-accent rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${goal.progress}%` }}
                  />
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={goal.progress}
                  onChange={(e) => updateProgress(goal, Number(e.target.value))}
                  className="w-full mt-2 accent-accent"
                />
              </div>

              <div className="flex items-center justify-between text-xs text-muted">
                <span className="capitalize">{goal.status}</span>
                {goal.deadline && (
                  <span>Deadline : {new Date(goal.deadline).toLocaleDateString("fr-FR")}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
