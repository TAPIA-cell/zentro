import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function AdminBlogs() {
  const [blogs, setBlogs] = useState([]);
  const [imagenFile, setImagenFile] = useState(null);

  const [blogActual, setBlogActual] = useState({
    id: null,
    titulo: "",
    autor: "",
    fecha: "",
    contenido: "",
    imagen: "",
  });

  const { token } = useContext(AuthContext);

  const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
  const API_URL = `${BACKEND_URL}/blogs`;

  // ============================
  // CARGAR BLOGS
  // ============================
  const cargarBlogs = async () => {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      setBlogs(data);
    } catch (err) {
      console.error("Error cargando blogs:", err);
    }
  };

  useEffect(() => {
    cargarBlogs();
  }, []);

  // ============================
  // SUBIR IMAGEN
  // ============================
  const subirImagen = async () => {
    if (!imagenFile) return blogActual.imagen;

    const formData = new FormData();
    formData.append("imagen", imagenFile);

    const res = await fetch(`${BACKEND_URL}/upload`, {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    return data.url; // "/img/archivo-123.jpg"
  };

  // ============================
  // GUARDAR / ACTUALIZAR BLOG
  // ============================
  const handleSubmit = async (e) => {
    e.preventDefault();

    let imagenFinal = blogActual.imagen;

    // Si sube nueva imagen → reemplazar
    if (imagenFile) {
      imagenFinal = await subirImagen();
    }

    const formData = {
      ...blogActual,
      imagen: imagenFinal,
    };

    const metodo = blogActual.id ? "PUT" : "POST";
    const url = blogActual.id ? `${API_URL}/${blogActual.id}` : API_URL;

    try {
      await fetch(url, {
        method: metodo,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      cargarBlogs();
      limpiarFormulario();
    } catch (err) {
      console.error("Error guardando blog:", err);
      alert("Error al guardar el blog");
    }
  };

  // ============================
  // EDITAR BLOG
  // ============================
  const handleEditar = (blog) => {
    setBlogActual({
      ...blog,
      fecha: blog.fecha.split("T")[0],
    });
    setImagenFile(null);
  };

  // ============================
  // ELIMINAR BLOG
  // ============================
  const handleEliminar = async (id) => {
    if (!confirm("¿Eliminar blog?")) return;

    try {
      await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      cargarBlogs();
    } catch (err) {
      alert("No autorizado");
    }
  };

  // ============================
  // LIMPIAR FORM
  // ============================
  const limpiarFormulario = () => {
    setBlogActual({
      id: null,
      titulo: "",
      autor: "",
      fecha: "",
      contenido: "",
      imagen: "",
    });
    setImagenFile(null);
  };

  return (
    <div className="container mt-4">
      <h2 className="fw-bold text-center mb-4">📰 Gestión de Blogs</h2>

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="row g-3 bg-light p-4 rounded shadow">

        <div className="col-md-6">
          <input
            type="text"
            placeholder="Título"
            className="form-control"
            value={blogActual.titulo}
            onChange={(e) => setBlogActual({ ...blogActual, titulo: e.target.value })}
            required
          />
        </div>

        <div className="col-md-6">
          <input
            type="text"
            placeholder="Autor"
            className="form-control"
            value={blogActual.autor}
            onChange={(e) => setBlogActual({ ...blogActual, autor: e.target.value })}
            required
          />
        </div>

        <div className="col-md-6">
          <input
            type="date"
            className="form-control"
            value={blogActual.fecha}
            onChange={(e) => setBlogActual({ ...blogActual, fecha: e.target.value })}
            required
          />
        </div>

        <div className="col-md-6">
          <input
            type="file"
            className="form-control"
            accept="image/*"
            onChange={(e) => setImagenFile(e.target.files[0])}
          />
        </div>

        {blogActual.imagen && (
          <div className="text-center">
            <img
              src={blogActual.imagen}
              height="100"
              className="rounded border"
            />
          </div>
        )}

        <div className="col-12">
          <textarea
            className="form-control"
            rows="4"
            placeholder="Contenido..."
            value={blogActual.contenido}
            onChange={(e) => setBlogActual({ ...blogActual, contenido: e.target.value })}
          />
        </div>

        <div className="col-12 d-flex gap-2">
          <button className="btn btn-success">💾 Guardar</button>
          <button type="button" className="btn btn-secondary" onClick={limpiarFormulario}>
            Cancelar
          </button>
        </div>

      </form>

      {/* Tabla */}
      <div className="table-responsive mt-4">
        <table className="table table-bordered shadow-sm align-middle">
          <thead className="table-dark">
            <tr>
              <th>ID</th>
              <th>Título</th>
              <th>Imagen</th>
              <th>Autor</th>
              <th>Fecha</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {blogs.map((b) => (
              <tr key={b.id}>
                <td>{b.id}</td>
                <td>{b.titulo}</td>
                <td>
                  {b.imagen ? (
                    <img src={b.imagen} width="80" className="rounded" />
                  ) : "No imagen"}
                </td>
                <td>{b.autor}</td>
                <td>{new Date(b.fecha).toLocaleDateString()}</td>
                <td>
                  <button
                    className="btn btn-warning btn-sm me-2"
                    onClick={() => handleEditar(b)}
                  >
                    ✏️
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleEliminar(b.id)}
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>

        </table>
      </div>
    </div>
  );
}
