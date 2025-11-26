import { useContext } from "react";
import { CartContext } from "../context/CartContext.jsx";
import { Link } from "react-router-dom";

function Cart() {
  const { carrito, agregarAlCarrito, eliminarDelCarrito, vaciarCarrito } =
    useContext(CartContext);

  const total = carrito.reduce(
    (sum, p) => sum + (Number(p.precio) || 0) * (Number(p.cantidad) || 1),
    0
  );

  // ========================================================
  // SUMAR +1
  // ========================================================
  const sumarCantidad = (p) => {
    const cantidadActual = Number(p.cantidad) || 1;
    const nuevaCantidad = cantidadActual + 1;

    if (nuevaCantidad > p.stock) {
      alert("Stock máximo alcanzado");
      return;
    }

    agregarAlCarrito({ id: p.id, cantidad: nuevaCantidad });
  };

  // ========================================================
  // RESTAR -1
  // ========================================================
  const restarCantidad = (p) => {
    const cantidadActual = Number(p.cantidad) || 1;
    const nuevaCantidad = cantidadActual - 1;

    if (nuevaCantidad < 1) return;

    agregarAlCarrito({ id: p.id, cantidad: nuevaCantidad });
  };

  // ========================================================
  // SI NO HAY PRODUCTOS
  // ========================================================
  if (carrito.length === 0) {
    return (
      <div className="container text-center py-5">
        <h3 className="text-muted mb-3">🛒 Tu carrito está vacío</h3>
        <Link to="/productos" className="btn btn-primary">
          Ver productos
        </Link>
      </div>
    );
  }

  return (
    <div className="container py-5">

      <div className="alert alert-info shadow-sm mb-4">
        <strong>🛒 Carrito de Compras</strong> | Ajusta cantidades o finaliza tu pedido.
      </div>

      <div className="row g-4">
        <div className="col-md-8">
          <h4 className="fw-bold mb-3 text-light">Productos en tu carrito</h4>

          <div className="table-responsive">
            <table className="table table-dark table-hover align-middle">
              <thead>
                <tr>
                  <th>Imagen</th>
                  <th>Nombre</th>
                  <th>Precio</th>
                  <th>Cantidad</th>
                  <th>Subtotal</th>
                  <th></th>
                </tr>
              </thead>

              <tbody>
                {carrito.map((p, index) => {
                  const cantidadActual = Number(p.cantidad) || 1;
                  const precio = Number(p.precio) || 0;

                  return (
                    <tr key={p.cartItemId || index}>
                      <td>
                        <img
                          src={p.imagenes?.[0] || "/img/placeholder.jpg"}
                          width="60"
                          height="60"
                          style={{
                            objectFit: "cover",
                            background: "#fff",
                            padding: "5px",
                            borderRadius: "5px",
                          }}
                        />
                      </td>

                      <td className="fw-semibold">
                        {p.nombre}
                        <br />
                        <small className="text-warning d-block">
                          Stock disponible: {p.stock}
                        </small>
                      </td>

                      <td>${precio.toLocaleString("es-CL")}</td>

                      <td>
                        <div className="d-flex align-items-center">
                          <button
                            className="btn btn-sm btn-outline-light me-2"
                            onClick={() => restarCantidad(p)}
                            disabled={cantidadActual <= 1}
                          >
                            −
                          </button>

                          <span>{cantidadActual}</span>

                          <button
                            className="btn btn-sm btn-outline-light ms-2"
                            onClick={() => sumarCantidad(p)}
                            disabled={cantidadActual >= p.stock}
                          >
                            +
                          </button>
                        </div>
                      </td>

                      <td>
                        ${(precio * cantidadActual).toLocaleString("es-CL")}
                      </td>

                      <td>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => eliminarDelCarrito(p.cartItemId)}
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>

            </table>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card bg-dark text-light shadow-sm">
            <div className="card-body">

              <h5 className="fw-bold mb-3">Resumen de Compra</h5>

              <p className="d-flex justify-content-between">
                <span>Total productos:</span>
                <strong>{carrito.length}</strong>
              </p>

              <p className="d-flex justify-content-between">
                <span>Total a pagar:</span>
                <strong>${total.toLocaleString("es-CL")}</strong>
              </p>

              <div className="d-grid mt-4 gap-2">
                <button className="btn btn-outline-danger" onClick={vaciarCarrito}>
                  🗑 Vaciar carrito
                </button>

                <Link to="/checkout" className="btn btn-success">
                  💳 Proceder al pago
                </Link>
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Cart;
