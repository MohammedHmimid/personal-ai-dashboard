import { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("sb_user");
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("sb_token");
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .get("/api/auth/me")
      .then(({ data }) => {
        setUser(data);
        localStorage.setItem("sb_user", JSON.stringify(data));
      })
      .catch(() => {
        localStorage.removeItem("sb_token");
        localStorage.removeItem("sb_user");
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const persistSession = (data) => {
    localStorage.setItem("sb_token", data.access_token);
    localStorage.setItem("sb_user", JSON.stringify(data.user));
    setUser(data.user);
  };

  const login = async (email, password) => {
    const { data } = await api.post("/api/auth/login", { email, password });
    persistSession(data);
    return data.user;
  };

  const register = async (name, email, password) => {
    const { data } = await api.post("/api/auth/register", { name, email, password });
    persistSession(data);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem("sb_token");
    localStorage.removeItem("sb_user");
    setUser(null);
  };

  const updateUser = (patch) => {
    setUser((prev) => {
      const next = { ...prev, ...patch };
      localStorage.setItem("sb_user", JSON.stringify(next));
      return next;
    });
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth doit être utilisé dans un AuthProvider");
  return ctx;
}
