import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [token, setToken] = useState(null);
  const [cargando, setCargando] = useState(true);

  const BACKEND_URL = "http://13.217.74.250:3000/api";
  const API_AUTH = `${BACKEND_URL}/auth`;

  // ================================
  // Cargar sesión desde localStorage
  // ================================
  useEffect(() => {
    const u = localStorage.getItem("usuario");
    const t = localStorage.getItem("token");

    if (u && t) {
      setUsuario(JSON.parse(u));
      setToken(t);
    }

    setCargando(false);
  }, []);

  // ================================
  // LOGIN
  // ================================
  const login = async (email, password) => {
    try {
      const res = await fetch(`${API_AUTH}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Credenciales inválidas");
      }

      setUsuario(data.usuario);
      setToken(data.token);

      localStorage.setItem("usuario", JSON.stringify(data.usuario));
      localStorage.setItem("token", data.token);

      return { ok: true };
    } catch (error) {
      return { ok: false, msg: error.message };
    }
  };

  // ================================
  // REGISTRO
  // ================================
  const registrar = async (nombre, email, password) => {
    try {
      const res = await fetch(`${API_AUTH}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Error en registro");
      }

      return { ok: true };
    } catch (err) {
      return { ok: false, msg: err.message };
    }
  };

  // ================================
  // LOGOUT
  // ================================
  const logout = () => {
    setUsuario(null);
    setToken(null);
    localStorage.removeItem("usuario");
    localStorage.removeItem("token");
  };

  // ================================
  // FUNCIONES CLAVE
  // ================================
  const isLogged = () => !!token;

  const isAdmin = () => {
    const rol =
      usuario?.rol ||
      usuario?.role ||
      usuario?.tipo ||
      usuario?.tipo_usuario;

    return rol?.toLowerCase() === "admin";
  };

  return (
    <AuthContext.Provider
      value={{
        usuario,
        token,
        login,
        registrar,
        logout,
        isLogged,
        isAdmin,
        cargando
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
