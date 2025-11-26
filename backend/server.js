// backend/server.js
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import "./database.js";

// Rutas
import uploadRoutes from "./routes/upload.js";
import productosRoutes from "./routes/productos.js";
import blogsRoutes from "./routes/blogs.js";
import authRoutes from "./routes/auth.js";
import usuariosRoutes from "./routes/usuarios.js";
import carritoRoutes from "./routes/carrito.js";
import ventasRoutes from "./routes/ventas.js";
import contactoRoutes from "./routes/contacto.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PUERTO = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// 🟢 SERVIR IMÁGENES DESDE LA RUTA REAL DEL REACT
app.use(
  "/img",
  express.static("/home/ubuntu/zentro-react/public/img")
);

// API
app.use("/api/upload", uploadRoutes);
app.use("/api/productos", productosRoutes);
app.use("/api/ventas", ventasRoutes);
app.use("/api/blogs", blogsRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/usuarios", usuariosRoutes);
app.use("/api/carrito", carritoRoutes);
app.use("/api/contacto", contactoRoutes);

// Health
app.get("/", (req, res) => {
  res.send("API Zentro funcionando en la nube ☁️");
});

app.listen(PUERTO, () => {
  console.log(`🚀 Backend corriendo en puerto ${PUERTO}`);
});
