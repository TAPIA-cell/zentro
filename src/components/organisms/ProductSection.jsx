import { useEffect, useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CartContext } from "../../context/CartContext";
import { AuthContext } from "../../context/AuthContext";

export default function ProductSection() {
  const { agregarAlCarrito } = useContext(CartContext);
  const { isLogged } = useContext(AuthContext);
  const navigate = useNavigate();

  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);

  const MAX_PRODUCTOS_DESTACADOS = 4;
  const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

  // ================================
  // Cargar Productos Destacados
  // ================================
  useEffect(() => {
    const fetchDestacados = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/productos`);
        const data = await res.json();

        if (Array.isArray(data)) {
          const destacados = data
            .filter((p) => p.stock > 0)
            .sort(() => Math.random() - 0.5)
            .slice(0, MAX_PRODUCTOS_DESTACADOS);

          setProductos(destacados);
        }
      } catch (error) {
        console.error("Error al cargar destacados:", error);
      } finally {
        setCargando(false);
      }
    };

    fetchDestacados();
  }, []);

  // ================================
  // Agregar al carrito con login
  // ================================
  const handleAgregarCarrito = (producto) => {
    if (!isLogged()) {
      alert("🔒 Inicia sesión para agregar productos al carrito.");
      return navigate("/login");
    }

    agregarAlCarrito(producto);
  };

  // ================================
  // Loading
  // ================================
  if (cargando) {
    return (
      <div className="container my-5 text-center">
        <div className="spinner-border text-primary"></div>
        <p className="mt-2 text-muted">Cargando destacados...</p>
      </div>
    );
  }

  return (
    <section className="container my-5">
      {/* Si no hay productos */}
      {productos.length === 0 ? (
        <div className="text-center py-5">
          <p className="text-muted">
            No hay productos destacados disponibles por ahora.
          </p>
        </div>
      ) : (
        <div className="row g-4">
          {productos.map((p) => (
            <div key={p.id} className="col-sm-6 col-md-4 col-lg-3">
              <div className="card h-100 shadow-sm border-0 product-card position-relative">

                {/* Badge */}
                <span className="badge bg-warning text-dark position-absolute m-2 shadow-sm">
                  ★ Destacado
                </span>

                {/* Imagen */}
                <img
                  src={
                    p.imagenes?.[0] || "/img/placeholder.jpg"
                  }
                  alt={p.nombre}
                  className="card-img-top"
                  style={{
                    height: "230px",
                    objectFit: "contain",
                    backgroundColor: "#fff",
                    padding: "15px",
                  }}
                  onError={(e) => {
                    e.target.src = "/img/placeholder.jpg";
                  }}
                />

                {/* Info */}
                <div className="card-body d-flex flex-column text-center">
                  <h6 className="fw-bold text-dark">{p.nombre}</h6>

                  <p className="fs-5 fw-bold text-primary mb-2">
                    ${p.precio.toLocaleString("es-CL")}
                  </p>

                  <div className="mt-auto">
                    <Link
                      to={`/producto/${p.id}`}
                      className="btn btn-outline-secondary btn-sm me-2"
                    >
                      Ver
                    </Link>

                    <button
                      className="btn btn-dark btn-sm"
                      onClick={() => handleAgregarCarrito(p)}
                    >
                      🛒 Agregar
                    </button>
                  </div>
                </div>

              </div>
            </div>
          ))}
        </div>
      )}

      {/* Ver todo el catálogo */}
      <div className="text-center mt-5">
        <Link
          to="/productos"
          className="btn btn-outline-primary px-4 rounded-pill"
        >
          Ver todo el catálogo →
        </Link>
      </div>
    </section>
  );
}
