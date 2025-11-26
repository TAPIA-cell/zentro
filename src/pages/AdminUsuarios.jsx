import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext.jsx";

function AdminUsuarios() {
  const { token } = useContext(AuthContext);

  // URL desde .env o fallback
  const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

  const [usuarios, setUsuarios] = useState([]);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [usuarioActual, setUsuarioActual] = useState({
    id: null,
    nombre: "",
    email: "",
    rol: "Cliente",
    password: "",
  });

  // ==========================================================
  // 📥 CARGAR USUARIOS DESDE AWS
  // ==========================================================
  const cargarUsuarios = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/usuarios`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) {
        console.error("❌ Error de autenticación o permisos");
        return;
      }

      const data = await res.json();
      setUsuarios(data);
    } catch (error) {
      console.error("Error cargando usuarios:", error);
    }
  };

  useEffect(() => {
    if (token) cargarUsuarios();
  }, [token]);

  // ==========================================================
  // ➕ AGREGAR USUARIO (usa endpoint de REGISTER para hashear)
  // ==========================================================
  const handleAgregar = async (e) => {
    e.preventDefault();

    if (!usuarioActual.nombre || !usuarioActual.email || !usuarioActual.password) {
      alert("⚠️ Todos los campos son obligatorios.");
      return;
    }

    try {
      const res = await fetch(`${BACKEND_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(usuarioActual),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Usuario creado correctamente ✔️");
        limpiarFormulario();
        cargarUsuarios();
      } else {
        alert(data.error || "Error al crear usuario");
      }
    } catch (error) {
      console.error(error);
    }
  };

  // ========================================================
  // ✏️ ACTUALIZAR USUARIO (rol o datos generales)
  // ========================================================
  const handleActualizar = async (e) => {
    e.preventDefault();

    try {
      const body = { ...usuarioActual };

      if (usuarioActual.password === "") {
        delete body.password; // ← no enviar password si no se cambia
      }

      const res = await fetch(`${BACKEND_URL}/usuarios/${usuarioActual.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        alert("Usuario actualizado correctamente ✔️");
        limpiarFormulario();
        cargarUsuarios();
      } else {
        alert("Error al actualizar");
      }
    } catch (error) {
      console.error(error);
    }
  };

  // ========================================================
  // 🗑 ELIMINAR USUARIO
  // ========================================================
  const handleEliminar = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar este usuario?")) return;

    try {
      const res = await fetch(`${BACKEND_URL}/usuarios/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        cargarUsuarios();
      } else {
        alert("Error eliminando usuario");
      }
    } catch (error) {
      console.error(error);
    }
  };

  // ========================================================
  // 🔧 Utilidades
  // ========================================================
  const handleEditar = (usuario) => {
    setModoEdicion(true);
    setUsuarioActual({ ...usuario, password: "" });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUsuarioActual({ ...usuarioActual, [name]: value });
  };

  const limpiarFormulario = () => {
    setModoEdicion(false);
    setUsuarioActual({
      id: null,
      nombre: "",
      email: "",
      rol: "Cliente",
      password: "",
    });
  };

  // ========================================================
  // 📋 RENDER
  // ========================================================
  return (
    <div className="container mt-4">
      <h2 className="fw-bold text-center mb-4">👥 Gestión de Usuarios</h2>

      {/* FORM */}
      <form
        onSubmit={modoEdicion ? handleActualizar : handleAgregar}
        className="p-4 border rounded bg-light mb-4 shadow-sm"
      >
        <div className="row g-3">
          <div className="col-md-3">
            <input
              type="text"
              name="nombre"
              placeholder="Nombre"
              value={usuarioActual.nombre}
              onChange={handleChange}
              className="form-control"
              required
            />
          </div>

          <div className="col-md-3">
            <input
              type="email"
              name="email"
              placeholder="Correo"
              value={usuarioActual.email}
              onChange={handleChange}
              className="form-control"
              required
            />
          </div>

          <div className="col-md-2">
            <select
              name="rol"
              value={usuarioActual.rol}
              onChange={handleChange}
              className="form-select"
            >
              <option value="Cliente">Cliente</option>
              <option value="Admin">Admin</option>
            </select>
          </div>

          <div className="col-md-2">
            <input
              type="password"
              name="password"
              placeholder={modoEdicion ? "(Opcional)" : "Contraseña"}
              value={usuarioActual.password}
              onChange={handleChange}
              className="form-control"
              required={!modoEdicion}
            />
          </div>

          <div className="col-md-2 d-flex gap-1">
            <button className="btn btn-primary w-100">
              {modoEdicion ? "Guardar" : "Agregar"}
            </button>

            {modoEdicion && (
              <button type="button" onClick={limpiarFormulario} className="btn btn-secondary">
                ❌
              </button>
            )}
          </div>
        </div>
      </form>

      {/* TABLA */}
      <div className="table-responsive">
        <table className="table table-hover">
          <thead className="table-dark">
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {usuarios.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center text-muted">
                  No hay usuarios o cargando...
                </td>
              </tr>
            ) : (
              usuarios.map((u) => (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td>{u.nombre}</td>
                  <td>{u.email}</td>
                  <td>
                    <span className={`badge ${u.rol === "Admin" ? "bg-danger" : "bg-secondary"}`}>
                      {u.rol}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn btn-sm btn-warning me-2"
                      onClick={() => handleEditar(u)}
                    >
                      ✏️ Editar
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleEliminar(u.id)}
                    >
                      🗑 Eliminar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminUsuarios;
