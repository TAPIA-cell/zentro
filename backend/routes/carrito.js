import express from "express";
import db from "../database.js";
import { authRequired } from "../middleware/authMiddleware.js";

const router = express.Router();
const totalItems = carrito.reduce((acc, p) => acc + (Number(p.cantidad) || 1), 0);

const parsearImagenes = (img) => {
  if (!img) return [];
  if (Array.isArray(img)) return img;

  try {
    const arr = JSON.parse(img);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
};

router.get("/", authRequired, async (req, res) => {
  const userId = req.user.id;

  try {
    const [rows] = await db.query(
      `
      SELECT 
        c.id AS cartItemId,
        c.id_producto AS id,
        c.cantidad,
        p.nombre,
        p.precio,
        p.stock,
        p.imagenes
      FROM carrito_items c
      JOIN productos p ON p.id = c.id_producto
      WHERE c.id_usuario = ?
      ORDER BY c.id DESC
    `,
      [userId]
    );

    const items = rows.map((i) => ({
      cartItemId: i.cartItemId,
      id: Number(i.id),
      nombre: i.nombre,
      precio: Number(i.precio),
      stock: Number(i.stock),
      cantidad: Number(i.cantidad) || 1,
      imagenes: parsearImagenes(i.imagenes),
    }));

    res.json(items);
  } catch (err) {
    console.error("❌ Error obteniendo carrito:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

router.post("/", authRequired, async (req, res) => {
  const userId = req.user.id;
  let { id_producto, cantidad } = req.body;

  cantidad = Number(cantidad);
  if (!cantidad || isNaN(cantidad)) cantidad = 1;

  try {
    const [prod] = await db.query("SELECT stock FROM productos WHERE id = ?", [
      id_producto,
    ]);

    if (!prod.length)
      return res.status(404).json({ error: "Producto no encontrado" });

    const stock = Number(prod[0].stock);

    if (cantidad > stock)
      return res.status(400).json({ error: `Stock máximo: ${stock}` });

    const [exist] = await db.query(
      "SELECT id FROM carrito_items WHERE id_usuario = ? AND id_producto = ?",
      [userId, id_producto]
    );

    if (exist.length) {
      await db.query("UPDATE carrito_items SET cantidad = ? WHERE id = ?", [
        cantidad,
        exist[0].id,
      ]);
    } else {
      await db.query(
        "INSERT INTO carrito_items (id_usuario, id_producto, cantidad) VALUES (?,?,?)",
        [userId, id_producto, cantidad]
      );
    }

    res.json({ mensaje: "Cantidad actualizada" });
  } catch (err) {
    console.error("❌ Error actualizando carrito:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

router.delete("/:id", authRequired, async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  try {
    await db.query("DELETE FROM carrito_items WHERE id = ? AND id_usuario = ?", [
      id,
      userId,
    ]);

    res.json({ mensaje: "Item eliminado" });
  } catch (err) {
    console.error("❌ Error eliminando item:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

export default router;
