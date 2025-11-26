import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

export default function Blogs() {
  const [blogs, setBlogs] = useState([]);
  const [cargando, setCargando] = useState(true);

  const PLACEHOLDER_IMG =
    "https://placehold.co/600x400/DDDDDD/333333?text=Sin+Imagen+Disponible";

  const BACKEND_URL =
    import.meta.env.VITE_API_URL || "http://localhost:3000/api";

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    const fetchBlogs = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/blogs`, { signal });

        if (!res.ok) throw new Error("Error al obtener noticias");

        const data = await res.json();

        if (Array.isArray(data)) {
          const ordenados = data.sort(
            (a, b) => new Date(b.fecha) - new Date(a.fecha)
          );
          setBlogs(ordenados);
        } else {
          setBlogs([]);
        }
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Error cargando blogs:", error);
          setBlogs([]);
        }
      } finally {
        if (!signal.aborted) setCargando(false);
      }
    };

    fetchBlogs();
    return () => controller.abort();
  }, []);

  // SOPORTE PARA /img/... y URLs externas
  const getImg = (src) => {
    if (!src) return PLACEHOLDER_IMG;

    if (src.startsWith("/img/")) {
      return `${window.location.origin}${src}`;
    }

    if (src.startsWith("http")) {
      return src;
    }

    return PLACEHOLDER_IMG;
  };

  const formatearFecha = (fechaString) => {
    if (!fechaString) return "Fecha no disponible";
    const fecha = new Date(fechaString);
    if (isNaN(fecha.getTime())) return "Fecha inválida";

    return fecha.toLocaleDateString("es-CL", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="container my-5" style={{ minHeight: "60vh" }}>
      <div className="text-center mb-5">
        <h2 className="fw-bold display-6">📰 Blog & Noticias</h2>
        <p className="text-muted">
          Mantente al día con las últimas novedades de nuestra tienda.
        </p>
      </div>

      {cargando ? (
        <div className="d-flex justify-content-center align-items-center py-5">
          <div className="spinner-border text-primary me-3" role="status"></div>
          <span className="text-muted fs-5">Cargando artículos...</span>
        </div>
      ) : blogs.length === 0 ? (
        <div className="text-center py-5 bg-light rounded-3">
          <h1 className="display-1 text-muted">📭</h1>
          <p className="lead text-muted">
            No hay publicaciones disponibles por el momento.
          </p>
        </div>
      ) : (
        <div className="row g-4">
          {blogs.map((blog) => (
            <div className="col-12 col-md-6 col-lg-4" key={blog.id}>
              <div className="card h-100 shadow-sm border-0 blog-card">

                <div style={{ height: "220px", overflow: "hidden" }}>
                  <img
                    src={getImg(blog.imagen)}
                    alt={blog.titulo}
                    className="card-img-top w-100 h-100"
                    onError={(e) => (e.target.src = PLACEHOLDER_IMG)}
                    style={{ objectFit: "cover", transition: "0.3s" }}
                  />
                </div>

                <div className="card-body d-flex flex-column p-4">
                  <small
                    className="text-primary fw-bold text-uppercase mb-2"
                    style={{ fontSize: "0.75rem" }}
                  >
                    {blog.autor || "Redacción"} • {formatearFecha(blog.fecha)}
                  </small>

                  <h5 className="card-title fw-bold mb-3 text-dark">
                    {blog.titulo}
                  </h5>

                  <p
                    className="card-text text-muted flex-grow-1"
                    style={{
                      display: "-webkit-box",
                      WebkitLineClamp: "3",
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {blog.contenido}
                  </p>

                  <div className="mt-3 pt-3 border-top">
                    <Link
                      to={`/blogs/${blog.id}`}
                      className="btn btn-outline-dark btn-sm rounded-pill px-4"
                    >
                      Leer más →
                    </Link>
                  </div>

                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`
        .blog-card { 
          transition: transform .25s ease, box-shadow .25s ease; 
        }
        .blog-card:hover { 
          transform: translateY(-6px);
          box-shadow: 0 10px 25px rgba(0,0,0,.15); 
        }
      `}</style>
    </div>
  );
}
