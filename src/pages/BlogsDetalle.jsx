import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";

export default function BlogDetalle() {
  const { id } = useParams();

  const [blog, setBlog] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(false);

  const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
  const API_BASE = BACKEND_URL.replace("/api", ""); 
  const PLACEHOLDER = "/img/placeholder.jpg";

  // =========================================================
  // 🖼 FUNCIÓN ROBUSTA PARA IMÁGENES
  // =========================================================
  const imagenSegura = (src) => {
    if (!src || src.trim() === "") return PLACEHOLDER;

    // Imágenes externas
    if (src.startsWith("http")) return src;

    // Imagen cargada por upload en /img/archivo.jpg
    if (src.startsWith("/img/")) return `${API_BASE}${src}`;

    return PLACEHOLDER;
  };

  const fechaLinda = (f) =>
    new Date(f).toLocaleDateString("es-CL", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  // =========================================================
  // 📌 Cargar Blog
  // =========================================================
  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    const fetchBlog = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/blogs/${id}`, { signal });
        if (!res.ok) throw new Error("Blog no encontrado");

        const data = await res.json();
        setBlog(data);
      } catch (err) {
        if (err.name !== "AbortError") setError(true);
      } finally {
        if (!signal.aborted) setCargando(false);
      }
    };

    fetchBlog();
    return () => controller.abort();
  }, [id]);

  // =========================================================
  // LOADING
  // =========================================================
  if (cargando) {
    return (
      <div className="container text-center py-5">
        <div className="spinner-border text-primary"></div>
        <p className="mt-3 text-muted fs-5">Cargando artículo...</p>
      </div>
    );
  }

  // =========================================================
  // ERROR / BLOG NO EXISTE
  // =========================================================
  if (error || !blog) {
    return (
      <div className="container text-center py-5">
        <h1 className="display-5 fw-bold mb-3">😕 Blog no encontrado</h1>
        <p className="text-muted mb-4">El artículo puede haber sido eliminado.</p>
        <Link to="/blogs" className="btn btn-outline-primary rounded-pill px-4">
          ← Volver al Blog
        </Link>
      </div>
    );
  }
  {/* IMAGEN PRINCIPAL */}
<div className="d-flex justify-content-center mb-4">
  <div
    className="p-2 bg-light rounded shadow-sm"
    style={{
      maxWidth: "550px",
      width: "100%",
      borderRadius: "15px",
    }}
  >
    <img
      src={imagenSegura(blog.imagen)}
      alt={blog.titulo}
      className="img-fluid rounded"
      onError={(e) => (e.target.src = "/img/placeholder.jpg")}
      style={{
        width: "100%",
        height: "auto",
        objectFit: "contain",
        borderRadius: "12px",
      }}
    />
  </div>
</div>


  // =========================================================
  // VISTA PRINCIPAL
  // =========================================================
  return (
    <div className="container my-5" style={{ maxWidth: "950px" }}>
      
      {/* TÍTULO */}
      <h1 className="fw-bold text-center mb-3" style={{ fontSize: "2.7rem" }}>
        {blog.titulo}
      </h1>

      {/* AUTOR + FECHA */}
      <p className="text-center text-muted mb-4" style={{ fontSize: "0.95rem" }}>
        ✍️ <strong>{blog.autor}</strong> · {fechaLinda(blog.fecha)}
      </p>

      {/* IMAGEN PRINCIPAL */}
      <div className="rounded shadow-lg overflow-hidden mb-4">
        <img
          src={imagenSegura(blog.imagen)}
          alt={blog.titulo}
          className="img-fluid w-100"
          style={{ maxHeight: "480px", objectFit: "cover" }}
          onError={(e) => (e.target.src = PLACEHOLDER)}
        />
      </div>

      {/* CONTENIDO */}
      <div
        className="p-4 rounded shadow-sm bg-white"
        style={{
          fontSize: "1.18rem",
          lineHeight: "1.9rem",
          color: "#333",
          borderLeft: "5px solid #0d6efd",
          whiteSpace: "pre-line",
        }}
      >
        {blog.contenido}
      </div>

      {/* BOTÓN VOLVER */}
      <div className="text-center mt-5">
        <Link
          to="/blogs"
          className="btn btn-primary rounded-pill px-4 py-2 shadow-sm"
        >
          ← Volver al Blog
        </Link>
      </div>

    </div>
  );
}

