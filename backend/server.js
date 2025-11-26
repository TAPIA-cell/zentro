// backend/server.js
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import "./database.js";

// Importar rutas
import uploadRoutes from "./routes/upload.js";
import productosRoutes from "./routes/productos.js";
import blogsRoutes from "./routes/blogs.js";
import authRoutes from "./routes/auth.js";
import usuariosRoutes from "./routes/usuarios.js";
import carritoRoutes from "./routes/carrito.js";
import ventasRoutes from "./routes/ventas.js";
import contactoRoutes from "./routes/contacto.js";

// Para __dirname en ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Crear app
const app = express();
const PUERTO = process.env.PORT || 3000;

// CORS optimizado
app.use(
  cors({
    origin: "*", // Puedes poner: "https://tuprojecto.vercel.app"
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

// 🟢 Servir imágenes desde la carpeta correcta
// Esto funciona SIEMPRE sin hardcodear rutas absolutas
app.use("/img", express.static(path.join(__dirname, "public", "img")));

// Rutas API
app.use("/api/upload", uploadRoutes);
app.use("/api/productos", productosRoutes);
app.use("/api/ventas", ventasRoutes);
app.use("/api/blogs", blogsRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/usuarios", usuariosRoutes);
app.use("/api/carrito", carritoRoutes);
app.use("/api/contacto", contactoRoutes);

// 🔵 Healthcheck
app.get("/", (req, res) => {
  res.send("API Zentro funcionando en la nube ☁️");
});

// 🛑 Manejo de errores global (evita caídas silenciosas)
app.use((err, req, res, next) => {
  console.error("❌ Error interno:", err);
  res.status(500).json({
    ok: false,
    mensaje: "Error interno del servidor",
    detalle: err.message,
  });
});

// Iniciar servidor
app.listen(PUERTO, () => {
  console.log(`🚀 Backend Zentro corriendo en puerto ${PUERTO}`);
});
