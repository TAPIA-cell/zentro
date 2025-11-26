import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

function Registro() {
  const { registrar } = useContext(AuthContext);
  const navigate = useNavigate();

  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); // 🆕 Estado de carga

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // 1. Llamamos a la función del Context (que hace fetch a AWS)
    const resultado = await registrar(nombre, correo, password);

    if (resultado.ok) {
      // ✅ Éxito
      alert("✅ Registro exitoso. Ahora puedes iniciar sesión con tu nueva cuenta.");
      navigate("/login");
    } else {
      // ❌ Error (Ej: "El correo ya está registrado")
      setError(resultado.msg || "Ocurrió un error al registrar.");
    }

    setLoading(false);
  };

  return (
    <main className="container my-5 text-center">
      <div className="mb-3">
        <img src="/img/logo.png" alt="Logo" width="120" className="img-fluid" />
      </div>
      <h2 className="mb-4">Crear Cuenta</h2>

      <form 
        onSubmit={handleSubmit} 
        className="mx-auto border p-4 rounded shadow-sm bg-light" 
        style={{ maxWidth: "400px" }}
      >
        <div className="mb-3 text-start">
          <label htmlFor="nombre" className="form-label fw-bold">Nombre completo</label>
          <input
            type="text"
            id="nombre"
            className="form-control"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
            placeholder="Ej: Juan Pérez"
          />
        </div>
        <div className="mb-3 text-start">
          <label htmlFor="correo" className="form-label fw-bold">Correo electrónico</label>
          <input
            type="email"
            id="correo"
            className="form-control"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            required
            placeholder="juan@ejemplo.com"
          />
        </div>
        <div className="mb-4 text-start">
          <label htmlFor="password" className="form-label fw-bold">Contraseña</label>
          <input
            type="password"
            id="password"
            className="form-control"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="******"
          />
        </div>

        {error && <div className="alert alert-danger py-2 small">{error}</div>}

        <button 
            type="submit" 
            className="btn btn-success w-100 fw-bold"
            disabled={loading}
        >
          {loading ? (
            <>
                <span className="spinner-border spinner-border-sm me-2"></span>
                Registrando...
            </>
          ) : "REGISTRARME"}
        </button>

        <hr className="my-4"/>

        <p className="text-center mb-0">
          ¿Ya tienes cuenta? <Link to="/login" className="fw-bold text-decoration-none">Inicia sesión aquí</Link>
        </p>
      </form>
    </main>
  );
}

export default Registro;