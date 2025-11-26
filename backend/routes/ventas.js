// backend/routes/ventas.js
import express from "express";
import db from "../database.js";
import { authRequired, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

/* ======================================================
   GET TODAS LAS VENTAS (solo admin)
   ====================================================== */
router.get("/", authRequired, adminOnly, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT v.id, v.id_usuario, u.nombre AS usuario, v.total, v.fecha
      FROM ventas v
      JOIN usuarios u ON u.id = v.id_usuario
      ORDER BY v.fecha DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error("Error en GET ventas:", err);
    res.status(500).json({ error: "Error interno" });
  }
});

/* ======================================================
   GET UNA VENTA POR ID (PÚBLICO para QR y /orden/:id)
   ====================================================== */
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const [venta] = await db.query("SELECT * FROM ventas WHERE id = ?", [id]);
    if (venta.length === 0)
      return res.status(404).json({ error: "Venta no encontrada" });

    const [items] = await db.query(`
      SELECT 
        d.id_producto,
        d.cantidad,
        d.subtotal,
        p.nombre,
        p.precio,
        p.imagen
      FROM ventas_detalle d
      JOIN productos p ON p.id = d.id_producto
      WHERE d.id_venta = ?
    `, [id]);

    res.json({
      id: venta[0].id,
      nombre: venta[0].nombre_cliente ?? "Cliente",
      correo: venta[0].correo_cliente ?? "—",
      fecha: venta[0].fecha,
      total: venta[0].total,
      items
    });

  } catch (err) {
    console.error("Error en GET venta/:id:", err);
    res.status(500).json({ error: "Error interno" });
  }
});

/* ======================================================
   POST REGISTRAR VENTA (requiere login)
   ====================================================== */
router.post("/", authRequired, async (req, res) => {
  const { items, total } = req.body;
  const userId = req.user.id;

  if (!items || items.length === 0)
    return res.status(400).json({ error: "Carrito vacío" });

  try {
    // Insertar cabecera de la venta
    const [venta] = await db.query(
      "INSERT INTO ventas (id_usuario, total, fecha) VALUES (?, ?, NOW())",
      [userId, total]
    );

    const ventaId = venta.insertId;

    // Insertar detalle + descontar stock
    for (const item of items) {
      await db.query(
        `INSERT INTO ventas_detalle (id_venta, id_producto, cantidad, subtotal)
         VALUES (?, ?, ?, ?)`,
        [ventaId, item.id_producto, item.cantidad, item.precio * item.cantidad]
      );

      await db.query(
        "UPDATE productos SET stock = stock - ? WHERE id = ?",
        [item.cantidad, item.id_producto]
      );
    }

    res.status(201).json({ id: ventaId });

  } catch (err) {
    console.error("Error registrando venta:", err);
    res.status(500).json({ error: "Error interno" });
  }
});

export default router;
