import React, { useState, useEffect, useContext, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CartContext } from "../context/CartContext.jsx";
import { AuthContext } from "../context/AuthContext.jsx";

// Toast bonito y mejorado
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

function Productos() {
  const [productos, setProductos] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [orden, setOrden] = useState("default");
  const [cargando, setCargando] = useState(true);
  const [mensajeToast, setMensajeToast] = useState(null);

  const { agregarAlCarrito } = useContext(CartContext);
  const { isLogged } = useContext(AuthContext);
  const navigate = useNavigate();

  const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
  const BASE_URL = BACKEND_URL.replace("/api", "");

  // ======================================================
  // 🔧 Resolver URLs de imágenes (100% seguro)
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
  // CARGAR PRODUCTOS
  // ======================================================
  useEffect(() => {
    setCargando(true);
    fetch(`${BACKEND_URL}/productos`)
      .then((res) => res.json())
      .then((data) => {
        setProductos(Array.isArray(data) ? data : []);
      })
      .catch((err) => console.error("Error cargando catálogo:", err))
      .finally(() => setCargando(false));
  }, []);

  // ======================================================
  // FILTRO + ORDENAMIENTO
  // ======================================================
  const productosFiltrados = useMemo(() => {
    let resultado = productos.filter((p) =>
      p.nombre.toLowerCase().includes(busqueda.toLowerCase())
    );

    if (orden === "precioAsc") {
      resultado.sort((a, b) => a.precio - b.precio);
    } else if (orden === "precioDesc") {
      resultado.sort((a, b) => b.precio - a.precio);
    }

    return resultado;
  }, [productos, busqueda, orden]);

  // ======================================================
  // MANEJAR AGREGAR AL CARRITO
  // ======================================================
  const handleAgregar = (producto) => {
    if (!isLogged()) {
      if (window.confirm("🔒 Debes iniciar sesión para comprar. ¿Ir al login?")) {
        navigate("/login");
      }
      return;
    }

    agregarAlCarrito(producto);

    setMensajeToast(`🛒 ${producto.nombre} fue agregado al carrito`);
    setTimeout(() => setMensajeToast(null), 3000);
  };

  // ======================================================
  // RENDER
  // ======================================================
  return (
    <div className="container my-5 position-relative">
      <h2 className="fw-bold text-center mb-4">✨ Nuestros Productos ✨</h2>

      {/* Buscador + Orden */}
      <div className="row mb-4 align-items-center bg-white p-3 rounded shadow-sm border">
        <div className="col-md-6">
          <input
            type="text"
            className="form-control"
            placeholder="🔍 Buscar figuras, katanas, accesorios..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>

        <div className="col-md-6 text-md-end mt-3 mt-md-0">
          <select
            className="form-select w-auto d-inline"
            value={orden}
            onChange={(e) => setOrden(e.target.value)}
          >
            <option value="default">Ordenar por</option>
            <option value="precioAsc">Precio: menor a mayor</option>
            <option value="precioDesc">Precio: mayor a menor</option>
          </select>
        </div>
      </div>

      {/* Loader */}
      {cargando ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status"></div>
          <p className="mt-2 text-muted">Cargando catálogo...</p>
        </div>
      ) : (
        <div className="row g-4">
          {productosFiltrados.length === 0 ? (
            <div className="col-12 text-center text-muted py-5">
              <h4 className="mb-3">😕</h4>
              No encontramos productos que coincidan con tu búsqueda.
            </div>
          ) : (
            productosFiltrados.map((p) => {
              const hayStock = p.stock > 0;
              const imagenPrincipal =
                p.imagenes && p.imagenes.length > 0
                  ? resolverURL(p.imagenes[0])
                  : "/img/placeholder.jpg";

              return (
                <div className="col-sm-6 col-md-4 col-lg-3" key={p.id}>
                  <div className="card h-100 border-0 shadow-sm product-card rounded-3 overflow-hidden">

                    {/* Badge AGOTADO */}
                    {!hayStock && (
                      <span className="badge bg-danger position-absolute top-0 end-0 m-2 shadow">
                        AGOTADO
                      </span>
                    )}

                    {/* Imagen */}
                    <div className="product-img-container">
                      <img
                        src={imagenPrincipal}
                        alt={p.nombre}
                        className="product-img"
                        onError={(e) => (e.target.src = "/img/placeholder.jpg")}
                      />
                    </div>

                    <div className="card-body text-center d-flex flex-column">
                      <h6 className="fw-bold text-truncate" title={p.nombre}>
                        {p.nombre}
                      </h6>

                      <p className="text-primary fw-bold fs-5 mb-2">
                        ${Number(p.precio).toLocaleString("es-CL")}
                      </p>

                      <div className="mt-auto">
                        <Link to={`/producto/${p.id}`} className="btn btn-outline-secondary btn-sm me-2">
                          Ver Detalle
                        </Link>

                        <button
                          className={`btn btn-sm ${hayStock ? "btn-dark" : "btn-light text-muted border"}`}
                          disabled={!hayStock}
                          onClick={() => handleAgregar(p)}
                        >
                          {hayStock ? "🛒 Agregar" : "Sin Stock"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Toast */}
      {mensajeToast && (
        <Toast mensaje={mensajeToast} onClose={() => setMensajeToast(null)} />
      )}

      {/* Estilos mejorados */}
      <style>{`
        .product-img-container {
          height: 230px;
          background: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          position: relative;
        }
        .product-img {
          height: 100%;
          width: 100%;
          object-fit: contain;
          transition: transform .3s ease;
        }
        .product-card:hover .product-img {
          transform: scale(1.05);
        }
      `}</style>
    </div>
  );
}

export default Productos;
