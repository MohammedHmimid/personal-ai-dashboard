import { motion } from "framer-motion";
import { Kanban, List, Loader2, Plus, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import EmptyState from "../components/EmptyState";
import api from "../services/api";

const COLUMNS = [
  { key: "todo", label: "TODO" },
  { key: "in_progress", label: "IN PROGRESS" },
  { key: "done", label: "DONE" },
];

const PRIORITY_COLORS = {
  low: "bg-muted/20 text-muted",
  medium: "bg-accent-soft text-accent",
  high: "bg-spark-soft text-spark",
  urgent: "bg-danger/15 text-danger",
};

function NewTaskForm({ onCreated, onClose }) {
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("medium");
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    try {
      const { data } = await api.post("/api/tasks", { title, priority, status: "todo" });
      onCreated(data);
      setTitle("");
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      onSubmit={submit}
      className="card p-3 flex items-center gap-2 mb-4"
    >
      <input
        autoFocus
        className="input-field flex-1"
        placeholder="Titre de la nouvelle tâche..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <select className="input-field w-36" value={priority} onChange={(e) => setPriority(e.target.value)}>
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
        <option value="urgent">Urgent</option>
      </select>
      <button type="submit" className="btn-primary" disabled={saving}>
        Ajouter
      </button>
      <button type="button" className="text-muted p-2" onClick={onClose} aria-label="Fermer">
        <X size={16} />
      </button>
    </motion.form>
  );
}

function TaskCard({ task, onToggleDone, onDelete, draggable, onDragStart }) {
  return (
    <div
      draggable={draggable}
      onDragStart={onDragStart}
      className="card p-3 flex flex-col gap-2 cursor-grab active:cursor-grabbing"
    >
      <div className="flex items-start gap-2">
        <input
          type="checkbox"
          checked={task.status === "done"}
          onChange={() => onToggleDone(task)}
          className="mt-0.5 accent-accent"
        />
        <p className={`text-sm flex-1 ${task.status === "done" ? "line-through text-muted" : ""}`}>
          {task.title}
        </p>
        <button className="text-muted hover:text-danger" onClick={() => onDelete(task.id)} aria-label="Supprimer">
          <Trash2 size={14} />
        </button>
      </div>
      <div className="flex items-center gap-2">
        <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium capitalize ${PRIORITY_COLORS[task.priority]}`}>
          {task.priority}
        </span>
        {task.due_date && (
          <span className="text-[11px] text-muted">
            {new Date(task.due_date).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })}
          </span>
        )}
      </div>
    </div>
  );
}

export default function Tasks() {
  const [tasks, setTasks] = useState(null);
  const [view, setView] = useState("board");
  const [showForm, setShowForm] = useState(false);

  const load = async () => {
    const { data } = await api.get("/api/tasks");
    setTasks(data);
  };

  useEffect(() => {
    load();
  }, []);

  const updateTask = async (task, patch) => {
    const { data } = await api.put(`/api/tasks/${task.id}`, patch);
    setTasks((prev) => prev.map((t) => (t.id === task.id ? data : t)));
  };

  const toggleDone = (task) => updateTask(task, { status: task.status === "done" ? "todo" : "done" });

  const deleteTask = async (id) => {
    await api.delete(`/api/tasks/${id}`);
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const handleDrop = (status) => (e) => {
    const id = Number(e.dataTransfer.getData("text/plain"));
    const task = tasks.find((t) => t.id === id);
    if (task && task.status !== status) updateTask(task, { status });
  };

  if (tasks === null) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="animate-spin text-accent" size={24} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <h1 className="font-display font-semibold text-lg">Tasks</h1>
        <div className="ml-auto flex items-center gap-1 bg-surface-raised border border-border rounded-lg p-0.5">
          <button
            className={`p-1.5 rounded-md ${view === "board" ? "bg-accent text-white" : "text-muted"}`}
            onClick={() => setView("board")}
            aria-label="Vue board"
          >
            <Kanban size={15} />
          </button>
          <button
            className={`p-1.5 rounded-md ${view === "list" ? "bg-accent text-white" : "text-muted"}`}
            onClick={() => setView("list")}
            aria-label="Vue liste"
          >
            <List size={15} />
          </button>
        </div>
        <button className="btn-primary flex items-center gap-1.5" onClick={() => setShowForm((v) => !v)}>
          <Plus size={15} /> New Task
        </button>
      </div>

      {showForm && (
        <NewTaskForm
          onClose={() => setShowForm(false)}
          onCreated={(task) => {
            setTasks((prev) => [task, ...prev]);
            setShowForm(false);
          }}
        />
      )}

      {tasks.length === 0 ? (
        <EmptyState
          title="No tasks yet"
          description="Ajoute ta première tâche pour commencer à organiser ta journée."
          action={
            <button className="btn-primary" onClick={() => setShowForm(true)}>
              Create your first task
            </button>
          }
        />
      ) : view === "board" ? (
        <div className="grid md:grid-cols-3 gap-4">
          {COLUMNS.map((col) => (
            <div
              key={col.key}
              className="flex flex-col gap-2 bg-surface-raised/50 rounded-card p-3 min-h-[200px]"
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop(col.key)}
            >
              <p className="text-xs font-semibold text-muted tracking-wide">{col.label}</p>
              {tasks
                .filter((t) => t.status === col.key)
                .map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onToggleDone={toggleDone}
                    onDelete={deleteTask}
                    draggable
                    onDragStart={(e) => e.dataTransfer.setData("text/plain", String(task.id))}
                  />
                ))}
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} onToggleDone={toggleDone} onDelete={deleteTask} />
          ))}
        </div>
      )}
    </div>
  );
}
