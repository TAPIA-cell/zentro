import { useParams, useNavigate } from "react-router-dom";
import { useContext, useEffect, useState, useMemo } from "react";
import { CartContext } from "../context/CartContext.jsx";
import { AuthContext } from "../context/AuthContext.jsx";

// Toast moderno
const Toast = ({ mensaje, onClose }) => (
  <div className="toast-container position-fixed bottom-0 end-0 p-4" style={{ zIndex: 2000 }}>
    <div className="toast show text-white bg-success shadow-lg">
      <div className="toast-body d-flex justify-content-between align-items-center">
        <span>{mensaje}</span>
        <button className="btn-close btn-close-white" onClick={onClose}></button>
      </div>
    </div>
  </div>
);

function DetalleProducto() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { agregarAlCarrito } = useContext(CartContext);
  const { isLogged } = useContext(AuthContext);

  const [producto, setProducto] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);

  const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
  const BASE_URL = BACKEND_URL.replace("/api", "");

  // ======================================================
  // resolverURL — MISMA FUNCIÓN PRO QUE USA TU ADMIN
  // ======================================================
  const resolverURL = (img) => {
    if (!img) return "/img/placeholder.jpg";
    if (img.startsWith("http")) return img;
    if (img.startsWith("/img/")) return BASE_URL + img;
    if (img.startsWith("img/")) return BASE_URL + "/" + img;

    const limpio = img
      .replace("backend/public/", "")
      .replace("public/", "")
      .replace(/^\/+/, "");

    return BASE_URL + "/img/" + limpio;
  };

  // ======================================================
  // Cargar producto con AbortController
  // ======================================================
  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    setProducto(null);
    setCargando(true);
    setError(false);

    fetch(`${BACKEND_URL}/productos/${id}`, { signal })
      .then((res) => {
        if (!res.ok) throw new Error("Producto no encontrado");
        return res.json();
      })
      .then((data) => {
        setProducto(data);
        document.title = `${data.nombre} | Zentro Store`;
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          console.error(err);
          setError(true);
        }
      })
      .finally(() => {
        if (!signal.aborted) setCargando(false);
      });

    return () => controller.abort();
  }, [id]);

  // ======================================================
  // Procesar imágenes solo una vez
  // ======================================================
  const imagenesValidas = useMemo(() => {
    if (!producto) return [];

    let imgs = [];

    if (Array.isArray(producto.imagenes)) {
      imgs = producto.imagenes;
    } else if (typeof producto.imagenes === "string") {
      try {
        imgs = JSON.parse(producto.imagenes);
      } catch {
        imgs = [];
      }
    }

    return imgs
      .map((i) => resolverURL(i))
      .filter((i) => typeof i === "string" && i.trim() !== "");
  }, [producto]);

  // ======================================================
  // Añadir al carrito
  // ======================================================
  const handleAgregar = () => {
    if (!isLogged()) {
      if (window.confirm("🔒 Para comprar necesitas iniciar sesión. ¿Ir ahora?")) {
        navigate("/login");
      }
      return;
    }

    agregarAlCarrito(producto);
    setToastMsg(`🛒 ${producto.nombre} agregado al carrito`);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // ======================================================
  // Render Cargando / Error
  // ======================================================
  if (cargando) {
    return (
      <div className="container text-center py-5">
        <div className="spinner-border text-primary"></div>
        <p className="mt-2 text-muted">Cargando detalles...</p>
      </div>
    );
  }

  if (error || !producto) {
    return (
      <div className="container text-center py-5">
        <h2 className="text-danger">Producto no encontrado</h2>
        <p className="text-muted">Puede haber sido eliminado o el enlace es incorrecto.</p>
        <button className="btn btn-dark mt-3" onClick={() => navigate("/productos")}>
          Volver al catálogo
        </button>
      </div>
    );
  }

  // ======================================================
  // Lógica STOCK
  // ======================================================
  const stock = Number(producto.stock) || 0;
  const stockDisponible = stock > 0;

  let stockBadge = { class: "bg-danger", text: "Agotado" };

  if (stockDisponible) {
    if (stock <= 5) stockBadge = { class: "bg-warning text-dark", text: `¡Últimas ${stock} unidades!` };
    else stockBadge = { class: "bg-success", text: "En Stock" };
  }

  return (
    <div className="container py-5">
      <div className="row align-items-start g-5">

        {/* IMAGENES */}
        <div className="col-md-6">
          <div className="carousel slide border rounded shadow overflow-hidden" id="carouselProducto">
            <div className="carousel-inner bg-white">
              {imagenesValidas.length > 0 ? (
                imagenesValidas.map((img, i) => (
                  <div key={i} className={`carousel-item ${i === 0 ? "active" : ""}`}>
                    <div className="d-flex justify-content-center align-items-center" style={{ height: "450px" }}>
                      <img
                        src={img}
                        onError={(e) => (e.target.src = "/img/placeholder.jpg")}
                        className="d-block"
                        alt={`Vista ${i + 1}`}
                        style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div className="carousel-item active">
                  <div className="d-flex justify-content-center align-items-center" style={{ height: "450px" }}>
                    <img
                      src="/img/placeholder.jpg"
                      className="d-block opacity-50"
                      alt="Sin imagen"
                      style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
                    />
                  </div>
                </div>
              )}
            </div>

            {imagenesValidas.length > 1 && (
              <>
                <button className="carousel-control-prev" type="button" data-bs-target="#carouselProducto" data-bs-slide="prev">
                  <span className="carousel-control-prev-icon bg-dark rounded-circle p-3"></span>
                </button>
                <button className="carousel-control-next" type="button" data-bs-target="#carouselProducto" data-bs-slide="next">
                  <span className="carousel-control-next-icon bg-dark rounded-circle p-3"></span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* INFO */}
        <div className="col-md-6">
          <small className="text-muted text-uppercase fw-bold">Código #{producto.id}</small>
          <h1 className="fw-bold mt-2 mb-3">{producto.nombre}</h1>

          <p className="lead text-secondary">{producto.descripcion}</p>

          <div className="d-flex align-items-center mb-4">
            <h2 className="fw-bold text-dark me-3">
              ${Number(producto.precio).toLocaleString("es-CL")}
            </h2>
            <span className={`badge ${stockBadge.class} px-3 py-2 rounded-pill`}>
              {stockBadge.text}
            </span>
          </div>

          <div className="d-flex gap-3 mt-4">
            <button
              className={`btn btn-lg flex-grow-1 ${stockDisponible ? "btn-dark" : "btn-secondary disabled"}`}
              onClick={handleAgregar}
              disabled={!stockDisponible}
            >
              {stockDisponible ? "🛒 Añadir al carrito" : "🚫 Agotado"}
            </button>

            <button className="btn btn-lg btn-outline-secondary" onClick={() => navigate(-1)}>
              Volver
            </button>
          </div>
        </div>
      </div>

      {toastMsg && <Toast mensaje={toastMsg} onClose={() => setToastMsg(null)} />}

      {/* ESTILOS EXTRA */}
      <style>{`
        .carousel-control-prev-icon,
        .carousel-control-next-icon {
          background-size: 50%;
        }
        .carousel-item img {
          transition: transform .3s ease;
        }
        .carousel-item:hover img {
          transform: scale(1.02);
        }
      `}</style>
    </div>
  );
}

export default DetalleProducto;
