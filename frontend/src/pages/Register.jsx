import { motion } from "framer-motion";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }

    setLoading(true);

    try {
      await register(name, email, password);
      navigate("/");
    } catch (err) {
      setError(
        err.response?.data?.detail || "Impossible de créer le compte."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg px-4">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="w-full max-w-sm"
      >
        {/* Logo */}
        <div className="flex items-center gap-2 justify-center mb-8">
          <img
            src="https://api.iconify.design/lucide:brain-circuit.svg?color=%2310b981"
            alt="SecondBrain"
            className="w-6 h-6"
          />

          <span className="font-display font-semibold text-lg">
            SecondBrain
          </span>
        </div>

        <div className="card p-6">
          <h1 className="font-display font-semibold text-xl mb-1">
            Créer ton espace
          </h1>

          <p className="text-sm text-muted mb-6">
            Centralise notes, tâches et objectifs en un endroit.
          </p>

          {error && (
            <div className="mb-4 text-sm text-danger bg-danger/10 border border-danger/20 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div>
              <label className="text-xs font-medium text-muted mb-1 block">
                Nom complet
              </label>

              <input
                required
                className="input-field"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
              <label className="text-xs font-medium text-muted mb-1 block">
                Email
              </label>

              <input
                type="email"
                required
                className="input-field"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="text-xs font-medium text-muted mb-1 block">
                Mot de passe
              </label>

              <input
                type="password"
                required
                minLength={8}
                className="input-field"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary mt-2"
            >
              {loading ? "Création..." : "Créer mon compte"}
            </button>
          </form>
        </div>

        <p className="text-sm text-muted text-center mt-5">
          Déjà un compte ?{" "}
          <Link to="/login" className="text-accent font-medium">
            Se connecter
          </Link>
        </p>
      </motion.div>
    </div>
  );
}