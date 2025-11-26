import { createContext, useState, useEffect, useContext } from "react";
import { AuthContext } from "./AuthContext.jsx";

export const CartContext = createContext();

export function CartProvider({ children }) {
  const { token } = useContext(AuthContext);
  const [carrito, setCarrito] = useState([]);

  const API = "http://13.217.74.250:3000/api/carrito";

  // ==========================================================
  // 🟢 Cargar carrito desde AWS
  // ==========================================================
  const cargarCarrito = async () => {
    if (!token) return;

    try {
      const res = await fetch(API, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      // Seguridad: si backend manda algo raro -> lo ignoramos
      setCarrito(Array.isArray(data) ? data : []);

    } catch (err) {
      console.error("❌ Error cargando carrito:", err);
    }
  };

  useEffect(() => {
    cargarCarrito();
  }, [token]);

  // ==========================================================
  // 🟢 Agregar o actualizar cantidad
  // ==========================================================
  const agregarAlCarrito = async (producto) => {
    try {
      const body = {
        id_producto: producto.id,
        cantidad: Number(producto.cantidad) || 1,
      };

      await fetch(API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      await cargarCarrito();

    } catch (err) {
      console.error("❌ Error actualizando carrito:", err);
    }
  };

  // ==========================================================
  // 🟢 Eliminar un item del carrito
  // ==========================================================
  const eliminarDelCarrito = async (cartItemId) => {
    try {
      await fetch(`${API}/${cartItemId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      setCarrito((prev) => prev.filter((p) => p.cartItemId !== cartItemId));

    } catch (err) {
      console.error("❌ Error eliminando item:", err);
    }
  };

  // ==========================================================
  // 🟢 Vaciar carrito completo (AWS seguro)
  // ==========================================================
  const vaciarCarrito = async () => {
    try {
      const copia = [...carrito];

      for (const item of copia) {
        await fetch(`${API}/${item.cartItemId}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      setCarrito([]);
    } catch (err) {
      console.error("❌ Error vaciando carrito:", err);
    }
  };

  // ==========================================================
  // 🟢 Totales (fix: convertir strings -> número)
  // ==========================================================
  const totalItems = carrito.reduce(
    (acc, p) => acc + Number(p.cantidad || 0),
    0
  );

  const total = carrito.reduce(
    (acc, p) => acc + (Number(p.precio) || 0) * (Number(p.cantidad) || 1),
    0
  );

  return (
    <CartContext.Provider
      value={{
        carrito,
        agregarAlCarrito,
        eliminarDelCarrito,
        vaciarCarrito,
        totalItems,
        total,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
