import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

function Perfil() {
  const { usuario, logout } = useContext(AuthContext);

  // Si por alguna razón no hay usuario, no mostramos nada (aunque la ruta protegida ya lo maneja)
  if (!usuario) return null;

  return (
    <div className="container my-5">
      <div className="card shadow-sm mx-auto" style={{ maxWidth: "600px" }}>
        
        {/* Encabezado de la tarjeta (Avatar e Info Principal) */}
        <div className="card-header bg-primary text-white text-center py-4">
          <div 
            className="bg-white text-primary rounded-circle d-inline-flex align-items-center justify-content-center mb-3 shadow-sm" 
            style={{ width: '80px', height: '80px', fontSize: '2rem', fontWeight: 'bold' }}
          >
            {/* Inicial del nombre en mayúscula */}
            {usuario.nombre ? usuario.nombre.charAt(0).toUpperCase() : "?"}
          </div>
          <h3 className="mb-0">{usuario.nombre}</h3>
          <span className="badge bg-light text-primary mt-2">{usuario.rol}</span>
        </div>
        
        {/* Cuerpo de la tarjeta (Detalles) */}
        <div className="card-body p-4">
          <h5 className="text-muted mb-3 border-bottom pb-2">Datos de la Cuenta</h5>
          
          <div className="mb-3">
            <label className="fw-bold text-secondary small">CORREO ELECTRÓNICO</label>
            <p className="fs-5 m-0">{usuario.email}</p>
          </div>

          <div className="mb-4">
            <label className="fw-bold text-secondary small">ID DE USUARIO</label>
            <p className="font-monospace bg-light p-2 rounded text-muted m-0 text-break">
              {usuario.id}
            </p>
          </div>

          {/* Botón de cerrar sesión */}
          <button 
            className="btn btn-outline-danger w-100 mt-3 fw-bold" 
            onClick={logout}
          >
            Cerrar Sesión
          </button>
        </div>
      </div>
    </div>
  );
}

export default Perfil;