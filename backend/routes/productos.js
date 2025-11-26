// backend/routes/productos.js
import { Router } from "express";
import { authRequired, adminOnly } from "../middleware/authMiddleware.js";
import db from "../database.js";

const router = Router();

// Normaliza imágenes si vienen como JSON string o array
function normalizarImagenes(imagenes) {
  if (!imagenes) return [];

  if (Array.isArray(imagenes)) return imagenes;

  try {
    const arr = JSON.parse(imagenes);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

// ===============================
// GET TODOS LOS PRODUCTOS
// ===============================
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM productos");

    const productos = rows.map((p) => ({
      ...p,
      imagenes: normalizarImagenes(p.imagenes)
    }));

    res.json(productos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===============================
// GET UN PRODUCTO POR ID
// ===============================
router.get("/:id", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM productos WHERE id = ?",
      [req.params.id]
    );

    if (!rows.length) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    const producto = rows[0];
    producto.imagenes = normalizarImagenes(producto.imagenes);

    res.json(producto);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===============================
// CREAR PRODUCTO
// ===============================
router.post("/", authRequired, adminOnly, async (req, res) => {
  try {
    let { nombre, precio, descripcion, stock, imagenes } = req.body;

    if (!nombre || !precio) {
      return res.status(400).json({
        error: "Nombre y precio son obligatorios"
      });
    }

    const imagenesArray = normalizarImagenes(imagenes);

    const [result] = await db.query(
      `INSERT INTO productos (nombre, precio, descripcion, stock, imagenes)
       VALUES (?, ?, ?, ?, ?)`,
      [
        nombre,
        precio,
        descripcion ?? "",
        stock ?? 0,
        JSON.stringify(imagenesArray)
      ]
    );

    res.json({ ok: true, id: result.insertId });
  } catch (err) {
    console.error("Error creando producto:", err);
    res.status(500).json({ error: err.message });
  }
});

// ===============================
// ACTUALIZAR PRODUCTO
// ===============================
router.put("/:id", authRequired, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    let { nombre, precio, descripcion, stock, imagenes } = req.body;

    const imagenesArray = normalizarImagenes(imagenes);

    await db.query(
      `UPDATE productos 
       SET nombre=?, precio=?, descripcion=?, stock=?, imagenes=?
       WHERE id=?`,
      [
        nombre,
        precio,
        descripcion ?? "",
        stock ?? 0,
        JSON.stringify(imagenesArray),
        id
      ]
    );

    res.json({ ok: true });
  } catch (err) {
    console.error("Error actualizando producto:", err);
    res.status(500).json({ error: err.message });
  }
});

// ===============================
// ELIMINAR PRODUCTO
// ===============================
router.delete("/:id", authRequired, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;

    await db.query("DELETE FROM productos WHERE id=?", [id]);

    res.json({ ok: true });
  } catch (err) {
    console.error("Error eliminando producto:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
