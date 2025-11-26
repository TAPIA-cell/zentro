// backend/routes/auth.js
import express from "express";
import db from "../database.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import bcrypt from "bcryptjs"; // <--- IMPORTANTE

dotenv.config();

const router = express.Router();

/* =============================
   POST /api/auth/register
================================ */
router.post("/register", async (req, res) => {
  const { nombre, email, password } = req.body;

  if (!nombre || !email || !password) {
    return res.status(400).json({ error: "Faltan datos" });
  }

  try {
    // 1. Verificar si existe email
    const [existe] = await db.query(
      "SELECT id FROM usuarios WHERE email = ?",
      [email]
    );

    if (existe.length > 0) {
      return res.status(409).json({ error: "El correo ya está registrado" });
    }

    // 2. ENCRIPTAR PASSWORD (NUEVO)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Insertar usuario con la password encriptada
    await db.query(
      "INSERT INTO usuarios (nombre, email, password, rol) VALUES (?, ?, ?, 'Cliente')",
      [nombre, email, hashedPassword] 
    );

    return res.status(201).json({ mensaje: "Usuario registrado correctamente" });
  } catch (err) {
    console.error("Error en register:", err);
    res.status(500).json({ error: "Error interno" });
  }
});

/* =============================
   POST /api/auth/login
================================ */
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Buscar usuario
    const [rows] = await db.query(
      "SELECT id, nombre, email, password, rol FROM usuarios WHERE email = ?",
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    const user = rows[0];

    // 2. COMPARAR PASSWORD ENCRIPTADA (NUEVO)
    // bcrypt compara el texto plano (password) con el hash de la BD (user.password)
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    // 3. Crear token (Igual que antes)
    const token = jwt.sign(
      { id: user.id, email: user.email, rol: user.rol },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES || "1d" }
    );

    return res.json({
      token,
      usuario: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol
      }
    });

  } catch (err) {
    console.error("Error en login:", err);
    res.status(500).json({ error: "Error interno" });
  }
});

export default router;