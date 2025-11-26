import React, { useEffect, useState, useContext, useRef } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";

// Componente StatCard
function StatCard({ title, value, subtitle, colorClass, loading }) {
  return (
    <div className="col-md-4 mb-4">
      <div className={`p-3 rounded shadow-sm text-white ${colorClass}`}>
        <small className="text-uppercase fw-semibold">{title}</small>
        <h3 className="mt-2">
          {loading ? (
            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
          ) : (
            value
          )}
        </h3>
        <p className="mb-0 small">{subtitle}</p>
      </div>
    </div>
  );
}

const BACKEND_URL = "http://13.217.74.250:3000/api";

export default function AdminHome() {
  const { token, logout } = useContext(AuthContext);

  const [stats, setStats] = useState({
    usuarios: [],
    productos: [],
    ventas: []
  });

  const [loading, setLoading] = useState(true);
  const isMounted = useRef(true);

  const cargarDatos = async () => {
    if (!token) {
      if (isMounted.current) setLoading(false);
      return;
    }

    try {
      const headers = { Authorization: `Bearer ${token}` };

      // TODOS LOS FECTH LLEVAN TOKEN
      const results = await Promise.allSettled([
        fetch(`${BACKEND_URL}/usuarios`, { headers }),
        fetch(`${BACKEND_URL}/productos`, { headers }),
        fetch(`${BACKEND_URL}/ventas`, { headers })
      ]);

      if (!isMounted.current) return;

      const [resUsuarios, resProductos, resVentas] = results;

      const processResult = async (result) => {
        if (result.status === "fulfilled" && result.value.ok) {
          return await result.value.json();
        }

        // Manejo de token inválido
        if (result.status === "fulfilled" && result.value.status === 401) {
          console.warn("Token inválido. Cerrando sesión...");
          logout();
        }

        return [];
      };

      const usuariosData = await processResult(resUsuarios);
      const productosData = await processResult(resProductos);
      const ventasData = await processResult(resVentas);

      setStats({
        usuarios: usuariosData,
        productos: productosData,
        ventas: ventasData
      });

    } catch (err) {
      console.error("Error general cargando datos:", err);
    } finally {
      if (isMounted.current) setLoading(false);
    }
  };

  useEffect(() => {
    isMounted.current = true;
    cargarDatos();

    const interval = setInterval(cargarDatos, 10000);

    return () => {
      isMounted.current = false;
      clearInterval(interval);
    };
  }, [token]);

  const totalVentas = stats.ventas.reduce(
    (acc, v) => acc + (Number(v.total) || 0),
    0
  );

  const NavCard = ({ title, icon, color, link, btnText }) => (
    <div className="col-md-3">
      <div className="card h-100 shadow-sm border-0">
        <div className="card-body text-center">
          <h6 className="fw-bold">{icon} {title}</h6>
          <Link to={link} className={`btn btn-outline-${color} btn-sm mt-2 stretched-link`}>
            {btnText}
          </Link>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container-fluid p-4">
      <h2 className="mb-3 fw-bold">Panel de Control</h2>
      <p className="text-muted mb-4">Resumen en tiempo real de tu E-commerce</p>

      <div className="row mb-4">
        <StatCard
          title="Usuarios registrados"
          value={stats.usuarios.length}
          subtitle="Clientes y admins"
          colorClass="bg-primary"
          loading={loading}
        />
        <StatCard
          title="Productos disponibles"
          value={stats.productos.length}
          subtitle="En inventario activo"
          colorClass="bg-success"
          loading={loading}
        />
        <StatCard
          title="Ventas totales"
          value={`$${totalVentas.toLocaleString("es-CL")}`}
          subtitle={`${stats.ventas.length} transacciones`}
          colorClass="bg-warning text-dark"
          loading={loading}
        />
      </div>

      <div className="row g-3">
        <NavCard title="Usuarios" icon="👥" color="primary" link="/admin/usuarios" btnText="Gestionar" />
        <NavCard title="Productos" icon="🛍️" color="success" link="/admin/productos" btnText="Gestionar" />
        <NavCard title="Ventas" icon="💰" color="warning" link="/admin/ventas" btnText="Ver Reportes" />
        <NavCard title="Blogs" icon="📰" color="dark" link="/admin/blogs" btnText="Publicar" />
      </div>
    </div>
  );
}
