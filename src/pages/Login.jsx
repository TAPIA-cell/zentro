import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false); // Estado para deshabilitar botón

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Llamamos a la función asíncrona del Context
    const resultado = await login(email, password);

    if (resultado.ok) {
      // ✅ Éxito
      // No usamos alert() para que sea más fluido, pero puedes dejarlo si gustas
      navigate("/"); 
    } else {
      // ❌ Error (mostramos el mensaje real que viene del Backend/Context)
      alert("Error: " + (resultado.msg || "Credenciales incorrectas"));
    }
    
    setLoading(false);
  };

  return (
    <main className="container my-5 text-center">
      <div className="mb-3">
        <img src="/img/logo.png" alt="Logo Empresa" width="120" className="img-fluid" />
      </div>
      <h2 className="mb-4">Iniciar Sesión</h2>

      <form
        onSubmit={handleSubmit}
        className="mx-auto border p-4 rounded shadow-sm bg-light"
        style={{ maxWidth: "400px" }}
      >
        <div className="mb-3 text-start">
          <label htmlFor="email" className="form-label fw-bold">
            Correo electrónico
          </label>
          <input
            type="email"
            id="email"
            className="form-control"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="ejemplo@correo.com"
          />
        </div>
        
        <div className="mb-4 text-start">
          <label htmlFor="password" className="form-label fw-bold">
            Contraseña
          </label>
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

        <button 
            type="submit" 
            className="btn btn-primary w-100 fw-bold"
            disabled={loading}
        >
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2"></span>
              Ingresando...
            </>
          ) : (
            "INGRESAR"
          )}
        </button>

        <hr className="my-4" />

        <p className="text-center mb-0">
          ¿No tienes cuenta? <Link to="/registro" className="fw-bold">Regístrate aquí</Link>
        </p>
      </form>
    </main>
  );
}

export default Login;