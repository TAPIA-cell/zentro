import { Router } from "express";
import db from "../database.js";

const router = Router();

// POST /api/contacto
router.post("/", async (req, res) => {
  const { nombre, email, comentario } = req.body;

  if (!nombre || !email || !comentario) {
    return res.status(400).json({ error: "Todos los campos son obligatorios" });
  }

  try {
    await db.query(
      "INSERT INTO contactos (nombre, email, comentario) VALUES (?, ?, ?)",
      [nombre, email, comentario]
    );
    res.status(201).json({ message: "Mensaje enviado con éxito" });
  } catch (error) {
    console.error("Error en contacto:", error);
    res.status(500).json({ error: "Error interno al guardar mensaje" });
  }
});

export default router;