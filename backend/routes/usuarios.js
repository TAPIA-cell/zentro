import express from "express";
import db from "../database.js";
import { authRequired, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET: Listar usuarios
router.get("/", authRequired, adminOnly, async (req, res) => {
  try {
    const [rows] = await db.query("SELECT id, nombre, email, rol FROM usuarios");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Error interno" });
  }
});

// DELETE: Eliminar usuario
router.delete("/:id", authRequired, adminOnly, async (req, res) => {
    try {
        await db.query("DELETE FROM usuarios WHERE id = ?", [req.params.id]);
        res.json({ message: "Usuario eliminado" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PUT: Editar usuario (Rol o Datos básicos)
router.put("/:id", authRequired, adminOnly, async (req, res) => {
    const { nombre, email, rol } = req.body;
    try {
        await db.query(
            "UPDATE usuarios SET nombre = ?, email = ?, rol = ? WHERE id = ?",
            [nombre, email, rol, req.params.id]
        );
        res.json({ message: "Usuario actualizado" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;