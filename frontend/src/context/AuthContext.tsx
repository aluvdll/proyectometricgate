import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import type { Usuario } from "../types/Usuarios";
import "../services/axiosSetup.js";

const LAST_ACTIVITY_KEY = "last_activity";
const MAX_INACTIVITY_MS = 1 * 60 * 60 * 1000; // 1 hora

interface AuthContextType {
  isLogged: boolean;
  user: Usuario | null;
  token: string | null;
  role: string | null;
  loading: boolean;
  login: (user: Usuario, token: string, role: string) => void;
  logout: () => void;
  updateUser: (data: Partial<Usuario>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // 🔹 Usuario inicial
  const [user, setUser] = useState<Usuario | null>(null);

  // 🔹 Token inicial
  const [token, setToken] = useState<string | null>(null);

  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const isLogged = !!user && !!token;

  // 🔥 Cargar sesión al iniciar la app
  useEffect(() => {
    const storedUser = localStorage.getItem("usuario");
    const storedToken = localStorage.getItem("token");
    const storedRole = localStorage.getItem("role");

    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
      setRole(storedRole ?? null);
    }
    setLoading(false);
  }, []);

  // 🔐 LOGIN CORRECTO
  const login = (userData: Usuario, token: string, role: string) => {
    localStorage.setItem("usuario", JSON.stringify(userData));
    localStorage.setItem("token", token);
    localStorage.setItem("role", role);
    localStorage.setItem(LAST_ACTIVITY_KEY, String(Date.now()));

    setUser(userData);
    setToken(token);
    setRole(role);
  };

  // 🔄 UPDATE USER
  const updateUser = (data: Partial<Usuario>) => {
    setUser((prev) => {
      if (!prev) return prev;

      const updated = { ...prev, ...data };
      localStorage.setItem("usuario", JSON.stringify(updated));
      return updated;
    });
  };

  // 🚪 LOGOUT
  const logout = () => {
    localStorage.removeItem("usuario");
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem(LAST_ACTIVITY_KEY);
    setUser(null);
    setToken(null);
    setRole(null);
  };

  // ⏱ Comprobar inactividad cada "MAX_INACTIVITY_MS" y cerrar sesión si se supera
  useEffect(() => {
    const comprobarInactividad = () => {
      const lastActivity = localStorage.getItem(LAST_ACTIVITY_KEY);
      if (!lastActivity) return;

      const tiempoTranscurrido = Date.now() - Number(lastActivity);
      if (tiempoTranscurrido > MAX_INACTIVITY_MS) {
        logout();
      }
    };

    const intervalo = setInterval(comprobarInactividad, 300 * 1000);
    return () => clearInterval(intervalo);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 🔔 Escuchar evento de sesión expirada por 401 del servidor
  useEffect(() => {
    const handleSessionExpired = () => logout();
    window.addEventListener("session-expired", handleSessionExpired);
    return () => window.removeEventListener("session-expired", handleSessionExpired);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AuthContext.Provider
      value={{ isLogged, user, token, role, loading, login, logout, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Hook seguro
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }

  return context;
};
