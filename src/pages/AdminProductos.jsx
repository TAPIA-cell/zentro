import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext.jsx";

export default function AdminProductos() {
  const { token } = useContext(AuthContext);

  const BACKEND_URL =
    import.meta.env.VITE_API_URL || "http://localhost:3000/api";

  const BASE_URL = BACKEND_URL.replace("/api", "");
  const API_URL = `${BACKEND_URL}/productos`;

  const [productos, setProductos] = useState([]);
  const [productoActual, setProductoActual] = useState({
    id: null,
    nombre: "",
    precio: "",
    descripcion: "",
    stock: 0,
    imagenes: [],
  });

  const [isEditing, setIsEditing] = useState(false);
  const [nuevaImagen, setNuevaImagen] = useState("");

  // ======================================================
  // PARSEAR IMÁGENES JSON MYSQL
  // ======================================================
  const parsearImagenes = (imgData) => {
    if (!imgData) return [];
    try {
      if (Array.isArray(imgData)) return imgData;
      const parsed = JSON.parse(imgData);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  // ======================================================
  // CARGAR PRODUCTOS
  // ======================================================
  useEffect(() => {
    cargarProductos();
  }, []);

  const cargarProductos = async () => {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();

      setProductos(
        (Array.isArray(data) ? data : []).map((p) => ({
          ...p,
          imagenes: parsearImagenes(p.imagenes),
        }))
      );
    } catch (err) {
      console.error("Error cargando productos:", err);
    }
  };

  // ======================================================
  // SUBIR ARCHIVO
  // ======================================================
  const subirArchivo = async (e) => {
    const archivo = e.target.files[0];
    if (!archivo) return;

    const formData = new FormData();
    formData.append("imagen", archivo);

    try {
      const res = await fetch(`${BACKEND_URL}/upload`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (data.url) {
        setProductoActual((prev) => ({
          ...prev,
          imagenes: [...prev.imagenes, data.url],
        }));
      }
    } catch (err) {
      console.error("Error subiendo archivo:", err);
    }
  };

  // ======================================================
  // AGREGAR IMAGEN POR URL
  // ======================================================
  const agregarImagen = () => {
    if (!nuevaImagen.trim()) return;

    setProductoActual((prev) => ({
      ...prev,
      imagenes: [...prev.imagenes, nuevaImagen.trim()],
    }));

    setNuevaImagen("");
  };

  // ======================================================
  // QUITAR IMAGEN
  // ======================================================
  const quitarImagen = (index) => {
    setProductoActual((prev) => ({
      ...prev,
      imagenes: prev.imagenes.filter((_, i) => i !== index),
    }));
  };

  // ======================================================
  // GUARDAR / EDITAR PRODUCTO
  // ======================================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      nombre: productoActual.nombre.trim(),
      precio: Number(productoActual.precio),
      descripcion: productoActual.descripcion.trim(),
      stock: Number(productoActual.stock),
      imagenes: productoActual.imagenes,
    };

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };

    try {
      let res;

      if (isEditing) {
        res = await fetch(`${API_URL}/${productoActual.id}`, {
          method: "PUT",
          headers,
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch(API_URL, {
          method: "POST",
          headers,
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Error al guardar");
        return;
      }

      alert(isEditing ? "Producto actualizado" : "Producto creado");

      limpiar();
      cargarProductos();
    } catch (err) {
      console.error("Error guardando:", err);
    }
  };

  // ======================================================
  // EDITAR PRODUCTO
  // ======================================================
  const handleEditar = (prod) => {
    setProductoActual({
      id: prod.id,
      nombre: prod.nombre,
      precio: Number(prod.precio),
      descripcion: prod.descripcion || "",
      stock: Number(prod.stock),
      imagenes: parsearImagenes(prod.imagenes),
    });

    setIsEditing(true);
  };

  // ======================================================
  // LIMPIAR FORMULARIO
  // ======================================================
  const limpiar = () => {
    setProductoActual({
      id: null,
      nombre: "",
      precio: "",
      descripcion: "",
      stock: 0,
      imagenes: [],
    });

    setNuevaImagen("");
    setIsEditing(false);
  };

  // ======================================================
  // RESOLVER URL SOLUCIÓN DEFINITIVA 🔥
  // ======================================================
  const resolverURL = (img) => {
    if (!img) return "https://via.placeholder.com/100?text=IMG";

    // Si es URL completa
    if (img.startsWith("http")) return img;

    // Si ya viene con /img/ → OK
    if (img.startsWith("/img/")) return BASE_URL + img;

    // Si viene "img/archivo.webp"
    if (img.startsWith("img/")) return `${BASE_URL}/${img}`;

    // Cleanup de rutas heredadas
    const limpio = img
      .replace("backend/public/", "")
      .replace("public/", "")
      .replace(/^\/+/, "");

    return `${BASE_URL}/img/${limpio}`;
  };

  // ======================================================
  // ELIMINAR PRODUCTO
  // ======================================================
  const handleEliminar = async (id) => {
    if (!confirm("¿Eliminar producto?")) return;

    try {
      await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      cargarProductos();
    } catch (err) {
      console.error("Error eliminando:", err);
    }
  };

  // ======================================================
  // RENDER
  // ======================================================
  return (
    <div className="container py-4">
      <h2 className="mb-4">🛍️ Gestión de Productos</h2>

      {/* FORMULARIO */}
      <form
        onSubmit={handleSubmit}
        className="p-3 border rounded bg-light shadow-sm"
      >
        <h4>{isEditing ? "✏️ Editar Producto" : "✨ Nuevo Producto"}</h4>

        <div className="row mt-3">
          <div className="col-md-4">
            <label>Nombre</label>
            <input
              className="form-control"
              value={productoActual.nombre}
              onChange={(e) =>
                setProductoActual({ ...productoActual, nombre: e.target.value })
              }
              required
            />
          </div>

          <div className="col-md-3">
            <label>Precio</label>
            <input
              type="number"
              className="form-control"
              value={productoActual.precio}
              onChange={(e) =>
                setProductoActual({ ...productoActual, precio: e.target.value })
              }
              required
            />
          </div>

          <div className="col-md-3">
            <label>Stock</label>
            <input
              type="number"
              className="form-control"
              value={productoActual.stock}
              onChange={(e) =>
                setProductoActual({ ...productoActual, stock: e.target.value })
              }
            />
          </div>

          <div className="col-md-12 mt-3">
            <label>Descripción</label>
            <textarea
              className="form-control"
              rows={2}
              value={productoActual.descripcion}
              onChange={(e) =>
                setProductoActual({
                  ...productoActual,
                  descripcion: e.target.value,
                })
              }
            />
          </div>

          {/* IMÁGENES */}
          <div className="col-12 mt-3">
            <label>Imágenes del producto</label>

            <div className="input-group mb-2">
              <input
                className="form-control"
                placeholder="Pegar URL"
                value={nuevaImagen}
                onChange={(e) => setNuevaImagen(e.target.value)}
              />
              <button
                type="button"
                className="btn btn-primary"
                onClick={agregarImagen}
              >
                ➕ URL
              </button>
            </div>

            <input
              type="file"
              accept="image/*"
              onChange={subirArchivo}
              className="form-control mb-2"
            />

            {/* PREVIEW */}
            <div className="d-flex flex-wrap gap-2">
              {productoActual.imagenes.map((img, i) => (
                <div key={i} className="position-relative">
                  <img
                    src={resolverURL(img)}
                    width="80"
                    height="80"
                    className="border rounded object-fit-cover"
                  />
                  <button
                    type="button"
                    className="btn btn-danger btn-sm position-absolute top-0 end-0 py-0 px-1"
                    onClick={() => quitarImagen(i)}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <button className="btn btn-success mt-3" type="submit">
          {isEditing ? "Guardar cambios" : "Crear producto"}
        </button>
        <button
          className="btn btn-secondary mt-3 ms-2"
          type="button"
          onClick={limpiar}
        >
          Cancelar
        </button>
      </form>

      {/* TABLA */}
      <div className="table-responsive mt-4">
        <table className="table table-hover">
          <thead className="table-dark">
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Precio</th>
              <th>Stock</th>
              <th>Imagenes</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {productos.map((p) => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td>{p.nombre}</td>
                <td>${Number(p.precio).toLocaleString("es-CL")}</td>
                <td>{p.stock}</td>
                <td>
                  {p.imagenes.length ? (
                    <>
                      <img
                        src={resolverURL(p.imagenes[0])}
                        width="50"
                        height="50"
                        className="border rounded object-fit-cover"
                      />
                      {p.imagenes.length > 1 && (
                        <span className="small text-muted ms-1">
                          +{p.imagenes.length - 1}
                        </span>
                      )}
                    </>
                  ) : (
                    <span className="text-muted">Sin imagen</span>
                  )}
                </td>
                <td>
                  <button
                    className="btn btn-warning btn-sm me-2"
                    onClick={() => handleEditar(p)}
                  >
                    ✏️
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleEliminar(p.id)}
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
