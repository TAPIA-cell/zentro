import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";

/**
 * Ruta exclusiva para administradores
 */
export default function AdminRoute({ children }) {
  const { isLogged, isAdmin, cargando } = useContext(AuthContext);

  // Mostrar cargando mientras se verifica la sesión
  if (cargando) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status"></div>
        <p className="mt-2 text-muted">Verificando credenciales de administrador...</p>
      </div>
    );
  }

  // Si no está logueado, al login
  if (!isLogged()) {
    return <Navigate to="/login" replace />;
  }

  // Si está logueado pero no es admin → redirigir
  if (!isAdmin()) {
    return <Navigate to="/" replace />;
  }

  // Acceso permitido
  return children;
}
