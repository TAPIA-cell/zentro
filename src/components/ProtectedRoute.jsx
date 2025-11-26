import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";

/**
 * RUTA PROTEGIDA (requiere estar logueado)
 * Este componente envuelve otros componentes para restringir el acceso.
 */
export default function ProtectedRoute({ children }) {
  const { isLogged, cargando } = useContext(AuthContext);

  // Mostrar loading mientras se carga la sesión
  if (cargando) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status"></div>
        <p className="mt-2 text-muted">Verificando sesión...</p>
      </div>
    );
  }

  // Si no está logueado, enviar al login
  if (!isLogged()) {
    return <Navigate to="/login" replace />;
  }

  // Acceso permitido
  return children;
}
