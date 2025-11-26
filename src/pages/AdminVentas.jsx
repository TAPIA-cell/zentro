import { useEffect, useState, useContext } from "react";
import * as XLSX from "xlsx";
import { AuthContext } from "../context/AuthContext";

export default function AdminVentas() {
  const { token } = useContext(AuthContext);
  const [ventas, setVentas] = useState([]);

  const [ventaSeleccionada, setVentaSeleccionada] = useState(null);
  const [detalleVenta, setDetalleVenta] = useState([]);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);

  const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

  // =====================================================
  // 📩 Cargar Lista de Ventas (Resumen)
  // =====================================================
  const cargarVentas = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/ventas`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) {
        console.warn("❌ Error autenticando o solicitando ventas");
        return;
      }

      const data = await res.json();
      setVentas(data);
    } catch (error) {
      console.error("Error cargando ventas:", error);
    }
  };

  useEffect(() => {
    if (token) cargarVentas();

    // Opcional: actualizar cada 10s
    const interval = setInterval(cargarVentas, 10000);
    return () => clearInterval(interval);
  }, [token]);

  // =====================================================
  // 👁️ Ver Detalle de una Venta (Modal)
  // =====================================================
  const verDetalle = async (venta) => {
    setVentaSeleccionada(venta);
    setCargandoDetalle(true);

    try {
      const res = await fetch(`${BACKEND_URL}/ventas/${venta.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json();
      setDetalleVenta(data.detalle);
    } catch (error) {
      console.error(error);
      alert("Error cargando detalles");
    } finally {
      setCargandoDetalle(false);
    }
  };

  const cerrarModal = () => {
    setVentaSeleccionada(null);
    setDetalleVenta([]);
  };

  // =====================================================
  // 📤 Exportar a Excel
  // =====================================================
  const exportarVentas = () => {
    if (ventas.length === 0) return alert("⚠️ No hay ventas para exportar.");

    const datos = ventas.map((v) => ({
      ID: v.id,
      Fecha: new Date(v.fecha).toLocaleString(),
      Cliente: v.usuario,
      Total: v.total,
    }));

    const ws = XLSX.utils.json_to_sheet(datos);
    ws["!cols"] = Object.keys(datos[0]).map((key) => ({
      wch: Math.max(
        key.length,
        ...datos.map((fila) => String(fila[key] || "").length)
      ) + 5,
    }));

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Ventas");

    XLSX.writeFile(wb, "Reporte_Ventas_AWS.xlsx");
  };

  // =====================================================
  // RENDER
  // =====================================================
  return (
    <div className="container mt-4 position-relative">
      <h2 className="fw-bold mb-3 text-center">🧾 Registro de Ventas (AWS)</h2>
      <p className="text-muted text-center mb-4">
        Historial de transacciones almacenadas en la nube
      </p>

      {/* TABLA PRINCIPAL */}
      {ventas.length === 0 ? (
        <div className="alert alert-info text-center">
          ⏳ Cargando ventas o no hay registros...
        </div>
      ) : (
        <div className="table-responsive shadow-sm bg-white rounded">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-dark">
              <tr>
                <th>ID</th>
                <th>Fecha</th>
                <th>Cliente</th>
                <th className="text-end">Total</th>
                <th className="text-center">Detalles</th>
              </tr>
            </thead>

            <tbody>
              {ventas.map((v) => (
                <tr key={v.id}>
                  <td>#{v.id}</td>
                  <td>
                    {new Date(v.fecha).toLocaleDateString()}{" "}
                    {new Date(v.fecha).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td>{v.usuario}</td>
                  <td className="text-end fw-bold text-success">
                    ${v.total.toLocaleString("es-CL")}
                  </td>
                  <td className="text-center">
                    <button
                      className="btn btn-outline-primary btn-sm rounded-circle"
                      onClick={() => verDetalle(v)}
                      title="Ver productos"
                    >
                      👁️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="text-center mt-4">
        <button className="btn btn-success shadow" onClick={exportarVentas}>
          💾 Exportar Resumen a Excel
        </button>
      </div>

      {/* ================= MODAL ================= */}
      {ventaSeleccionada && (
        <div className="modal d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">
                  Ticket de Venta #{ventaSeleccionada.id}
                </h5>
                <button className="btn-close btn-close-white" onClick={cerrarModal}></button>
              </div>

              <div className="modal-body">
                <div className="d-flex justify-content-between mb-3 border-bottom pb-2">
                  <span><strong>Cliente:</strong> {ventaSeleccionada.usuario}</span>
                  <span><strong>Fecha:</strong> {new Date(ventaSeleccionada.fecha).toLocaleDateString()}</span>
                </div>

                {cargandoDetalle ? (
                  <div className="text-center py-3">🌀 Cargando productos...</div>
                ) : (
                  <table className="table table-sm">
                    <thead>
                      <tr className="text-muted small">
                        <th>Producto</th>
                        <th className="text-center">Cant.</th>
                        <th className="text-end">Subtotal</th>
                      </tr>
                    </thead>

                    <tbody>
                      {detalleVenta.map((item, i) => (
                        <tr key={i}>
                          <td>{item.nombre}</td>
                          <td className="text-center">{item.cantidad}</td>
                          <td className="text-end">${item.subtotal.toLocaleString("es-CL")}</td>
                        </tr>
                      ))}
                    </tbody>

                    <tfoot className="table-light">
                      <tr>
                        <td colSpan="2" className="text-end fw-bold">TOTAL:</td>
                        <td className="text-end fw-bold text-success">
                          ${ventaSeleccionada.total.toLocaleString("es-CL")}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                )}
              </div>

              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={cerrarModal}>
                  Cerrar
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
