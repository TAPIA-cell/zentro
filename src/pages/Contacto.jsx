import { useState } from "react";

export default function Contacto() {
  const [form, setForm] = useState({
    nombre: "",
    email: "",
    comentario: ""
  });

  const [enviando, setEnviando] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEnviando(true);

    try {
      const res = await fetch(`${API_URL}/contacto`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });

      if (res.ok) {
        alert("✅ ¡Mensaje recibido! Nos pondremos en contacto contigo.");
        setForm({ nombre: "", email: "", comentario: "" });
      } else {
        alert("❌ Hubo un error al enviar el mensaje.");
      }
    } catch (error) {
      console.error("Error envío:", error);
      alert("Error de conexión.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="container my-5 text-center">

      {/* LOGO */}
      <div className="mb-4">
        <img 
          src="/img/logo.png" 
          alt="Logo Empresa" 
          width="120" 
          className="opacity-75"
        />
      </div>

      <h2 className="fw-bold mb-4 display-6">📬 Contáctanos</h2>

      <p className="text-muted mb-5">
        Si tienes dudas, sugerencias o necesitas ayuda, envíanos un mensaje.
      </p>

      <div className="row justify-content-center">
        <div className="col-md-8">

          {/* TARJETA */}
          <div 
            className="p-4 rounded shadow-lg bg-light"
            style={{ border: "1px solid #e5e5e5" }}
          >
            <form onSubmit={handleSubmit}>

              {/* NOMBRE */}
              <div className="mb-3 text-start">
                <label className="form-label fw-bold">Nombre</label>
                <input
                  type="text"
                  name="nombre"
                  className="form-control"
                  placeholder="Tu nombre"
                  required
                  maxLength={100}
                  value={form.nombre}
                  onChange={handleChange}
                />
              </div>

              {/* CORREO */}
              <div className="mb-3 text-start">
                <label className="form-label fw-bold">Correo</label>
                <input
                  type="email"
                  name="email"
                  className="form-control"
                  placeholder="correo@ejemplo.com"
                  required
                  maxLength={100}
                  value={form.email}
                  onChange={handleChange}
                />
              </div>

              {/* COMENTARIO */}
              <div className="mb-3 text-start">
                <label className="form-label fw-bold">Comentario</label>
                <textarea
                  className="form-control"
                  name="comentario"
                  placeholder="Escribe tu mensaje aquí..."
                  rows="4"
                  required
                  maxLength={500}
                  value={form.comentario}
                  onChange={handleChange}
                ></textarea>
              </div>

              {/* BOTÓN */}
              <button
                type="submit"
                className="btn btn-dark w-100 fw-bold py-2"
                disabled={enviando}
                style={{ borderRadius: "10px" }}
              >
                {enviando ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Enviando...
                  </>
                ) : (
                  "Enviar Mensaje"
                )}
              </button>

            </form>
          </div>

        </div>
      </div>
    </div>
  );
}
