import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import type { Usuario } from "../types/Usuarios";

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
    setUser(null);
    setToken(null);
    setRole(null);
  };

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
