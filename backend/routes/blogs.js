import express from "express";
import db from "../database.js";
import { authRequired, adminOnly } from "../middleware/authMiddleware.js";

export const router = express.Router();

// GET /api/blogs
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT id, titulo, autor, fecha, imagen, contenido FROM blogs ORDER BY fecha DESC"
    );
    res.json(rows);
  } catch (err) {
    console.error("Error al obtener blogs:", err);
    res.status(500).json({ error: "Error interno" });
  }
});

// GET /api/blogs/:id
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.query(
      "SELECT id, titulo, autor, fecha, imagen, contenido FROM blogs WHERE id = ?",
      [id]
    );
    if (rows.length === 0)
      return res.status(404).json({ error: "Blog no encontrado" });

    res.json(rows[0]);
  } catch (err) {
    console.error("Error al obtener blog:", err);
    res.status(500).json({ error: "Error interno" });
  }
});

// POST /api/blogs  (crear blog) - solo Admin
router.post("/", authRequired, adminOnly, async (req, res) => {
  const { titulo, autor, fecha, imagen, contenido } = req.body;
  try {
    const [result] = await db.query(
      "INSERT INTO blogs (titulo, autor, fecha, imagen, contenido) VALUES (?, ?, ?, ?, ?)",
      [titulo, autor, fecha, imagen, contenido]
    );
    res.status(201).json({ mensaje: "Blog creado", id: result.insertId });
  } catch (err) {
    console.error("Error al crear blog:", err);
    res.status(500).json({ error: "Error interno" });
  }
});
export default router;
