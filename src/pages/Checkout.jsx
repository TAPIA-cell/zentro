import { useState, useContext, useEffect, useRef } from "react";
import { CartContext } from "../context/CartContext.jsx";
import { AuthContext } from "../context/AuthContext.jsx";
import { Link, useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

function Checkout() {
  const { carrito, total, vaciarCarrito } = useContext(CartContext);
  const { token, isLogged, usuario } = useContext(AuthContext);
  const navigate = useNavigate();

  const formRef = useRef(null);

  const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

  // ===============================
  // FORMULARIO
  // ===============================
  const [form, setForm] = useState({
    nombre: usuario?.nombre || "",
    apellido: "",
    correo: usuario?.email || "",
    calle: "",
    depto: "",
    region: "",
    comuna: "",
    indicaciones: "",
  });

  const [errors, setErrors] = useState({});
  const [estadoCompra, setEstadoCompra] = useState(null);
  const [procesando, setProcesando] = useState(false);
  const [detalleCompra, setDetalleCompra] = useState(null);

  // Focus automático a errores
  useEffect(() => {
    if (Object.keys(errors).length > 0 && formRef.current) {
      formRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [errors]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors((prev) => ({ ...prev, [e.target.name]: null }));
    }
  };

  // ===============================
  // VALIDACIÓN
  // ===============================
  const validarFormulario = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!form.nombre.trim()) newErrors.nombre = "El nombre es obligatorio";
    if (!form.apellido.trim()) newErrors.apellido = "El apellido es obligatorio";

    if (!form.correo.trim()) {
      newErrors.correo = "El correo es obligatorio";
    } else if (!emailRegex.test(form.correo)) {
      newErrors.correo = "Formato de correo no válido";
    }

    if (!form.calle.trim()) newErrors.calle = "La calle es obligatoria";
    if (!form.region) newErrors.region = "Selecciona una región";
    if (!form.comuna.trim()) newErrors.comuna = "La comuna es obligatoria";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ===============================
  // PAGAR AHORA
  // ===============================
  const pagarAhora = async () => {
    if (!validarFormulario()) return;

    if (carrito.length === 0) {
      alert("Tu carrito está vacío.");
      return;
    }

    if (!isLogged()) {
      alert("Debes iniciar sesión para pagar.");
      navigate("/login");
      return;
    }

    setProcesando(true);

    try {
      const payload = {
        items: carrito.map((p) => ({
          id_producto: p.id,
          cantidad: p.cantidad || 1,
          precio: p.precio,
          nombre: p.nombre,
          imagen: p.imagenes?.[0] || "/img/placeholder.jpg",
        })),
        total,
      };

      const res = await fetch(`${BACKEND_URL}/ventas`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Error al procesar pago");
      }

      const ventaOK = {
        id: data.id,
        usuario: `${form.nombre} ${form.apellido}`,
        correo: form.correo,
        fecha: new Date().toLocaleString("es-CL"),
        items: payload.items,
        total,
      };

      setDetalleCompra(ventaOK);
      setEstadoCompra("exito");
      vaciarCarrito();

      await generarPDF(ventaOK);
    } catch (error) {
      console.error(error);
      alert("Error inesperado: " + error.message);
    } finally {
      setProcesando(false);
    }
  };
const generarPDF = async (ventaData) => {
  const venta = ventaData || detalleCompra;
  if (!venta || !venta.items || venta.items.length === 0) {
    alert("No hay productos para generar boleta.");
    return;
  }

  // =====================================================================
  // Función auxiliar → Cargar imagen a Base64
  // =====================================================================
  const loadImageAsBase64 = (url) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "Anonymous";
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        resolve({
          dataUrl: canvas.toDataURL("image/png"),
          width: img.width,
          height: img.height,
        });
      };
      img.onerror = () => resolve({ dataUrl: null });
      img.src = url.startsWith("http")
        ? url
        : `${window.location.origin}${url}`;
    });
  };

  // =====================================================================
  // Logo + Imágenes de productos
  // =====================================================================
  const logo = await loadImageAsBase64("/img/logo.png");

  const itemsConImagenes = await Promise.all(
    venta.items.map(async (p) => {
      const img = await loadImageAsBase64(p.imagen);
      return { ...p, imagenBase64: img.dataUrl };
    })
  );

  // =====================================================================
  // Crear documento
  // =====================================================================
  const doc = new jsPDF({
    unit: "pt",
    format: "letter",
  });

  // =====================================================================
  // Encabezado Premium
  // =====================================================================
  if (logo.dataUrl) {
    const w = 90;
    const h = (logo.height / logo.width) * w;
    doc.addImage(logo.dataUrl, "PNG", 40, 30, w, h);
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("BOLETA ELECTRÓNICA", 220, 45);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);

  doc.text("ZENTRO E-COMMERCE", 220, 70);
  doc.text("RUT: 76.999.999-9", 220, 85);
  doc.text("Giro: Comercio Minorista", 220, 100);
  doc.text("Dirección: Santiago, Chile", 220, 115);

  doc.setLineWidth(1);
  doc.line(40, 140, 550, 140);

  // =====================================================================
  // Información cliente
  // =====================================================================
  doc.setFont("helvetica", "bold");
  doc.text("Información del Cliente:", 40, 165);

  doc.setFont("helvetica", "normal");
  doc.text(`Nombre: ${venta.usuario}`, 40, 185);
  doc.text(`Correo: ${venta.correo}`, 40, 200);
  doc.text(`Fecha: ${venta.fecha}`, 40, 215);

  doc.setLineWidth(0.5);
  doc.line(40, 230, 550, 230);

  // =====================================================================
  // Tabla con imágenes PRO
  // =====================================================================
  const columnas = ["Imagen", "Producto", "Cant.", "Precio", "Subtotal"];

  const filas = itemsConImagenes.map((p) => [
    { content: "", imagen: p.imagenBase64 },
    p.nombre,
    p.cantidad,
    `$${p.precio.toLocaleString("es-CL")}`,
    `$${(p.precio * p.cantidad).toLocaleString("es-CL")}`,
  ]);

  autoTable(doc, {
    startY: 245,
    head: [columnas],
    headStyles: {
      fillColor: [0, 0, 0],
      textColor: 255,
      halign: "center",
      fontSize: 11,
    },
    body: filas,
    bodyStyles: {
      fontSize: 10,
      minCellHeight: 35,
    },
    styles: {
      cellPadding: 6,
      lineWidth: 0.2,
    },
    columnStyles: {
      0: { cellWidth: 45 },
      1: { cellWidth: 200 },
      2: { halign: "center" },
      3: { halign: "right" },
      4: { halign: "right" },
    },

    didDrawCell: (data) => {
      if (data.column.index === 0 && data.cell.section === "body") {
        const img = data.cell.raw.imagen;
        if (img) {
          const size = 28;
          const x = data.cell.x + (data.cell.width - size) / 2;
          const y = data.cell.y + (data.cell.height - size) / 2;
          doc.addImage(img, "PNG", x, y, size, size);
        }
      }
    },
  });

  // =====================================================================
  // TOTAL — Estilo limpio
  // =====================================================================
  const finalY = doc.lastAutoTable.finalY + 20;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.text(
    `TOTAL A PAGAR: $${venta.total.toLocaleString("es-CL")}`,
    350,
    finalY
  );

  // Línea separadora
  doc.setLineWidth(1);
  doc.line(40, finalY + 5, 550, finalY + 5);

  // =====================================================================
  // (AQUÍ SE ELIMINÓ EL QR)
  // =====================================================================

  // =====================================================================
  // Pie de página PRO
  // =====================================================================
  doc.setFont("helvetica", "italic");
  doc.setFontSize(9);

  doc.text(
    "Gracias por tu compra. Esta boleta es un documento válido generado electrónicamente.",
    40,
    750
  );

  doc.text(
    "© ZENTRO E-Commerce — Todos los derechos reservados.",
    40,
    765
  );

  // =====================================================================
  // Guardar PDF
  // =====================================================================
  doc.save(`boleta_${venta.id}.pdf`);
};


  const totalCL = total.toLocaleString("es-CL");

  // ===============================
  // UI MEJORADA (YA DENTRO DE LA FUNCIÓN)
  // ===============================
  return (
    <div className="container py-5">

      <div className="text-center mb-4">
        <h2 className="fw-bold display-6">🛒 Finalizar Compra</h2>
        <p className="text-muted">
          Total a pagar:{" "}
          <strong className="text-dark fs-4">${totalCL}</strong>
        </p>
      </div>

      <div
        className="card shadow-lg border-0 rounded-4"
        ref={formRef}
        style={{ overflow: "hidden" }}
      >
        <div
          className="p-4 text-white"
          style={{
            background: "linear-gradient(45deg, #0d6efd, #6610f2)",
          }}
        >
          <h4 className="fw-bold m-0">
            {estadoCompra === "exito"
              ? "🎉 ¡Compra Exitosa!"
              : "📝 Información de Envío"}
          </h4>
        </div>

        <div className="card-body p-4">
          {estadoCompra === "exito" ? (
            <div className="text-center p-4">
              <h3 className="text-success fw-bold mb-3">
                ¡Tu orden #{detalleCompra.id} ha sido registrada!
              </h3>

              <p className="text-muted">
                Tu boleta se descargó automáticamente.
              </p>

              <div className="mt-4 d-flex gap-3 justify-content-center">
                <button
                  className="btn btn-outline-primary rounded-pill px-4"
                  onClick={() => generarPDF(detalleCompra)}
                >
                  📄 Descargar Boleta
                </button>

                <Link to="/productos" className="btn btn-success rounded-pill px-4">
                  🛍️ Seguir Comprando
                </Link>
              </div>
            </div>
          ) : (
            <>
              <h5 className="fw-bold mb-3 mt-2">👤 Datos del Cliente</h5>

              <fieldset disabled={procesando}>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="fw-bold">Nombre*</label>
                    <input
                      type="text"
                      name="nombre"
                      className={`form-control rounded-3 ${errors.nombre ? "is-invalid" : ""}`}
                      value={form.nombre}
                      onChange={handleChange}
                    />
                    {errors.nombre && <div className="invalid-feedback">{errors.nombre}</div>}
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="fw-bold">Apellido*</label>
                    <input
                      type="text"
                      name="apellido"
                      className={`form-control rounded-3 ${errors.apellido ? "is-invalid" : ""}`}
                      value={form.apellido}
                      onChange={handleChange}
                    />
                    {errors.apellido && <div className="invalid-feedback">{errors.apellido}</div>}
                  </div>
                </div>

                <div className="mb-3">
                  <label className="fw-bold">Correo*</label>
                  <input
                    type="email"
                    name="correo"
                    className={`form-control rounded-3 ${errors.correo ? "is-invalid" : ""}`}
                    value={form.correo}
                    onChange={handleChange}
                  />
                  {errors.correo && <div className="invalid-feedback">{errors.correo}</div>}
                </div>

                <hr className="my-4" />

                <h5 className="fw-bold mb-3">📦 Dirección de Envío</h5>

                <div className="row">
                  <div className="col-md-8 mb-3">
                    <label className="fw-bold">Calle*</label>
                    <input
                      type="text"
                      name="calle"
                      className={`form-control rounded-3 ${errors.calle ? "is-invalid" : ""}`}
                      value={form.calle}
                      onChange={handleChange}
                    />
                    {errors.calle && <div className="invalid-feedback">{errors.calle}</div>}
                  </div>

                  <div className="col-md-4 mb-3">
                    <label className="fw-bold">N° / Depto</label>
                    <input
                      type="text"
                      name="depto"
                      className="form-control rounded-3"
                      value={form.depto}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="fw-bold">Región*</label>
                    <select
                      name="region"
                      className={`form-select rounded-3 ${errors.region ? "is-invalid" : ""}`}
                      value={form.region}
                      onChange={handleChange}
                    >
                      <option value="">Seleccionar...</option>
                      <option value="RM">Región Metropolitana</option>
                      <option value="V">Valparaíso</option>
                      <option value="VIII">Biobío</option>
                    </select>
                    {errors.region && <div className="invalid-feedback">{errors.region}</div>}
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="fw-bold">Comuna*</label>
                    <input
                      type="text"
                      name="comuna"
                      className={`form-control rounded-3 ${errors.comuna ? "is-invalid" : ""}`}
                      value={form.comuna}
                      onChange={handleChange}
                    />
                    {errors.comuna && <div className="invalid-feedback">{errors.comuna}</div>}
                  </div>
                </div>
              </fieldset>

              <div className="d-flex justify-content-end mt-4">
                <button
                  className="btn btn-primary btn-lg rounded-pill shadow px-5"
                  onClick={pagarAhora}
                  disabled={procesando}
                >
                  {procesando ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Procesando...
                    </>
                  ) : (
                    `Pagar $${totalCL}`
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Checkout;
