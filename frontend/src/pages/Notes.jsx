import { motion } from "framer-motion";
import { Loader2, Plus, Search, Sparkles, Star, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import EmptyState from "../components/EmptyState";
import api from "../services/api";

function NoteEditor({ note, onClose, onSaved, onDeleted }) {
  const [title, setTitle] = useState(note?.title || "");
  const [content, setContent] = useState(note?.content || "");
  const [tags, setTags] = useState((note?.tags || []).map((t) => t.name).join(", "));
  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState("");
  const [preview, setPreview] = useState(false);

  const save = async () => {
    setSaving(true);
    const payload = {
      title: title || "Note sans titre",
      content,
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
    };
    try {
      if (note?.id) {
        const { data } = await api.put(`/api/notes/${note.id}`, payload);
        onSaved(data);
      } else {
        const { data } = await api.post("/api/notes", payload);
        onSaved(data);
      }
    } finally {
      setSaving(false);
    }
  };

  const runAi = async (action) => {
    setAiLoading(action);
    try {
      if (action === "summarize") {
        const { data } = await api.post("/api/ai/summarize", { text: content });
        setContent((c) => `${c}\n\n**Résumé IA :** ${data.summary}`);
      } else if (action === "extract-tasks") {
        const { data } = await api.post("/api/ai/extract-tasks", { text: content });
        if (data.tasks.length === 0) {
          setContent((c) => `${c}\n\n_Aucune tâche détectée._`);
        } else {
          await Promise.all(
            data.tasks.map((t) => api.post("/api/tasks", { title: t, status: "todo" }))
          );
          setContent((c) => `${c}\n\n**${data.tasks.length} tâche(s) ajoutée(s) à ta liste.**`);
        }
      }
    } finally {
      setAiLoading("");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="card w-full max-w-2xl max-h-[85vh] flex flex-col"
      >
        <div className="flex items-center justify-between px-5 py-3 border-b border-border">
          <input
            className="font-display font-semibold text-base bg-transparent outline-none flex-1"
            placeholder="Titre de la note"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <button onClick={onClose} className="text-muted hover:text-ink p-1" aria-label="Fermer">
            <X size={18} />
          </button>
        </div>

        <div className="px-5 py-2 border-b border-border flex items-center gap-2 flex-wrap">
          <button
            className="text-xs px-2.5 py-1 rounded-full bg-spark-soft text-spark font-medium flex items-center gap-1 disabled:opacity-50"
            onClick={() => runAi("summarize")}
            disabled={!!aiLoading || !content}
          >
            {aiLoading === "summarize" ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
            Summarize
          </button>
          <button
            className="text-xs px-2.5 py-1 rounded-full bg-spark-soft text-spark font-medium flex items-center gap-1 disabled:opacity-50"
            onClick={() => runAi("extract-tasks")}
            disabled={!!aiLoading || !content}
          >
            {aiLoading === "extract-tasks" ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
            Extract Tasks
          </button>
          <button
            className="text-xs px-2.5 py-1 rounded-full border border-border ml-auto"
            onClick={() => setPreview((v) => !v)}
          >
            {preview ? "Éditer" : "Aperçu Markdown"}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {preview ? (
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <ReactMarkdown>{content || "*Rien à prévisualiser*"}</ReactMarkdown>
            </div>
          ) : (
            <textarea
              className="w-full h-full min-h-[240px] bg-transparent outline-none text-sm resize-none font-mono"
              placeholder="Écris en Markdown : **gras**, # titres, - listes, ```code```..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          )}
        </div>

        <div className="px-5 py-3 border-t border-border flex items-center gap-3">
          <input
            className="input-field flex-1"
            placeholder="tags séparés par des virgules"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />
          {note?.id && (
            <button
              className="text-danger p-2 hover:bg-danger/10 rounded-lg"
              onClick={() => onDeleted(note.id)}
              aria-label="Supprimer"
            >
              <Trash2 size={16} />
            </button>
          )}
          <button className="btn-primary" onClick={save} disabled={saving}>
            {saving ? "Enregistrement..." : "Enregistrer"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default function Notes() {
  const [notes, setNotes] = useState(null);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(null);
  const [creating, setCreating] = useState(false);

  const load = async (q = "") => {
    const { data } = await api.get("/api/notes", { params: q ? { search: q } : {} });
    setNotes(data);
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => load(search), 300);
    return () => clearTimeout(timeout);
  }, [search]);

  const toggleFavorite = async (note) => {
    const { data } = await api.put(`/api/notes/${note.id}`, { is_favorite: !note.is_favorite });
    setNotes((prev) => prev.map((n) => (n.id === note.id ? data : n)));
  };

  const handleSaved = (note) => {
    setNotes((prev) => {
      const exists = prev.some((n) => n.id === note.id);
      return exists ? prev.map((n) => (n.id === note.id ? note : n)) : [note, ...prev];
    });
    setEditing(null);
    setCreating(false);
  };

  const handleDeleted = async (id) => {
    await api.delete(`/api/notes/${id}`);
    setNotes((prev) => prev.filter((n) => n.id !== id));
    setEditing(null);
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            className="input-field pl-9"
            placeholder="Rechercher dans mes notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button className="btn-primary flex items-center gap-1.5 ml-auto" onClick={() => setCreating(true)}>
          <Plus size={15} /> New Note
        </button>
      </div>

      {notes === null ? (
        <div className="flex justify-center py-24">
          <Loader2 className="animate-spin text-accent" size={24} />
        </div>
      ) : notes.length === 0 ? (
        <EmptyState
          title="No notes yet"
          description="Commence à capturer tes idées et tes pensées."
          action={
            <button className="btn-primary" onClick={() => setCreating(true)}>
              Create your first note
            </button>
          }
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {notes.map((note) => (
            <motion.div
              layout
              key={note.id}
              className="card p-4 cursor-pointer hover:border-accent/40 transition flex flex-col gap-2"
              onClick={() => setEditing(note)}
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-medium text-sm line-clamp-1">{note.title}</h3>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(note);
                  }}
                  aria-label="Favori"
                >
                  <Star
                    size={15}
                    className={note.is_favorite ? "fill-spark text-spark" : "text-muted"}
                  />
                </button>
              </div>
              <p className="text-xs text-muted line-clamp-3 flex-1">
                {note.content || "Note vide"}
              </p>
              <div className="flex items-center justify-between text-xs text-muted pt-1">
                <span>{note.category?.name || "Sans catégorie"}</span>
                <span>{new Date(note.updated_at).toLocaleDateString("fr-FR")}</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {(editing || creating) && (
        <NoteEditor
          note={editing}
          onClose={() => {
            setEditing(null);
            setCreating(false);
          }}
          onSaved={handleSaved}
          onDeleted={handleDeleted}
        />
      )}
    </div>
  );
}
