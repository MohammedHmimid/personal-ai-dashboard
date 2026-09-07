import { motion } from "framer-motion";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("demo@example.com");
  const [password, setPassword] = useState("Demo123!");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.detail || "Impossible de se connecter.");
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
        <div className="flex items-center gap-2 justify-center mb-8">
          <span className="text-accent text-xl">✦</span>
          <span className="font-display font-semibold text-lg">SecondBrain</span>
        </div>

        <div className="card p-6">
          <h1 className="font-display font-semibold text-xl mb-1">Content de te revoir</h1>
          <p className="text-sm text-muted mb-6">Connecte-toi à ton espace personnel.</p>

          {error && (
            <div className="mb-4 text-sm text-danger bg-danger/10 border border-danger/20 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div>
              <label className="text-xs font-medium text-muted mb-1 block">Email</label>
              <input
                type="email"
                required
                className="input-field"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted mb-1 block">Mot de passe</label>
              <input
                type="password"
                required
                className="input-field"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary mt-2">
              {loading ? "Connexion..." : "Se connecter"}
            </button>
          </form>

          <p className="text-xs text-muted text-center mt-3">
            Compte de démo pré-rempli : demo@example.com / Demo123!
          </p>
        </div>

        <p className="text-sm text-muted text-center mt-5">
          Pas encore de compte ?{" "}
          <Link to="/register" className="text-accent font-medium">
            Créer un compte
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
