import { motion } from "framer-motion";
import { Loader2, Plus, Send, Sparkles, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import EmptyState from "../components/EmptyState";
import api from "../services/api";

export default function AIAssistant() {
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  const loadConversations = async () => {
    const { data } = await api.get("/api/ai/conversations");
    setConversations(data);
  };

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (!activeId) {
      setMessages([]);
      return;
    }
    api.get(`/api/ai/conversations/${activeId}`).then(({ data }) => setMessages(data.messages));
  }, [activeId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || sending) return;
    setInput("");
    setMessages((prev) => [...prev, { id: `temp-${Date.now()}`, role: "user", content: text }]);
    setSending(true);
    try {
      const { data } = await api.post("/api/ai/chat", { conversation_id: activeId, message: text });
      setMessages((prev) => [...prev, { id: `reply-${Date.now()}`, role: "assistant", content: data.reply }]);
      if (!activeId) {
        setActiveId(data.conversation_id);
        loadConversations();
      }
    } finally {
      setSending(false);
    }
  };

  const deleteConversation = async (id) => {
    await api.delete(`/api/ai/conversations/${id}`);
    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (activeId === id) setActiveId(null);
  };

  return (
    <div className="grid lg:grid-cols-[220px_1fr] gap-4 h-[calc(100vh-140px)]">
      <div className="card p-3 flex flex-col gap-2 overflow-y-auto">
        <button
          className="btn-secondary flex items-center gap-1.5 justify-center"
          onClick={() => setActiveId(null)}
        >
          <Plus size={14} /> Nouvelle conversation
        </button>
        <div className="flex flex-col gap-1 mt-2">
          {conversations.map((c) => (
            <div
              key={c.id}
              className={`group flex items-center gap-1 px-2 py-1.5 rounded-lg text-sm cursor-pointer ${
                activeId === c.id ? "bg-accent-soft text-accent" : "hover:bg-surface-raised text-muted"
              }`}
              onClick={() => setActiveId(c.id)}
            >
              <span className="truncate flex-1">{c.title}</span>
              <button
                className="opacity-0 group-hover:opacity-100 hover:text-danger"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteConversation(c.id);
                }}
                aria-label="Supprimer la conversation"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="card flex flex-col overflow-hidden">
        <div className="px-4 py-3 border-b border-border flex items-center gap-2">
          <Sparkles size={16} className="text-spark" />
          <h1 className="font-display font-semibold text-sm">AI Assistant</h1>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
          {messages.length === 0 ? (
            <EmptyState
              icon={Sparkles}
              title="Demande-moi tes tâches, tes notes ou tes objectifs"
              description={'Essaie : "Quelles sont mes tâches aujourd\'hui ?"'}
            />
          ) : (
            messages.map((m) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className={`max-w-[80%] px-3.5 py-2 rounded-2xl text-sm ${
                  m.role === "user"
                    ? "bg-accent text-white self-end rounded-br-sm"
                    : "bg-surface-raised self-start rounded-bl-sm"
                }`}
              >
                <div className="prose prose-sm max-w-none dark:prose-invert prose-p:my-1">
                  <ReactMarkdown>{m.content}</ReactMarkdown>
                </div>
              </motion.div>
            ))
          )}
          {sending && (
            <div className="self-start flex items-center gap-2 text-muted text-sm px-1">
              <Loader2 size={14} className="animate-spin" /> L'assistant réfléchit...
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <form onSubmit={send} className="p-3 border-t border-border flex items-center gap-2">
          <input
            className="input-field flex-1"
            placeholder="Ask anything..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button type="submit" className="btn-primary flex items-center gap-1.5" disabled={sending}>
            <Send size={14} /> Send
          </button>
        </form>
      </div>
    </div>
  );
}
