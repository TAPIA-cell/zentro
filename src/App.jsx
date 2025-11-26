import { Routes, Route } from "react-router-dom";
import Navbar from "./components/organisms/Navbar";
import FooterInfo from "./components/molecules/FooterInfo";

import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";

// Páginas públicas
import Home from "./pages/Home";
import Productos from "./pages/Productos";
import Nosotros from "./pages/Nosotros";
import Blogs from "./pages/Blogs";
import BlogDetalle from "./pages/BlogsDetalle";  // ✅ NOMBRE CORREGIDO
import Contacto from "./pages/Contacto";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Login from "./pages/Login";
import Register from "./pages/Registro";
import DetalleProducto from "./pages/DetalleProducto";
import Perfil from "./pages/Perfil";


// Admin
import AdminHome from "./pages/AdminHome";
import AdminUsuarios from "./pages/AdminUsuarios";
import AdminProductos from "./pages/AdminProductos";
import AdminBlogs from "./pages/AdminBlogs";
import AdminVentas from "./pages/AdminVentas";

function App() {
  return (
    <div className="app-layout d-flex flex-column min-vh-100">
      <Navbar />
      <main className="flex-grow-1">
        <Routes>

          {/* Públicas */}
          <Route path="/" element={<Home />} />
          <Route path="/productos" element={<Productos />} />
          <Route path="/producto/:id" element={<DetalleProducto />} />
          <Route path="/nosotros" element={<Nosotros />} />
          <Route path="/blogs" element={<Blogs />} />
          <Route path="/blogs/:id" element={<BlogDetalle />} /> {/* ✔ RUTA CORRECTA */}
          <Route path="/contacto" element={<Contacto />} />
          <Route path="/carrito" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Register />} />


          {/* Protegidas */}
          <Route path="/perfil" element={
            <ProtectedRoute>
              <Perfil />
            </ProtectedRoute>
          }/>

          {/* Admin */}
          <Route path="/admin" element={<AdminRoute><AdminHome /></AdminRoute>} />
          <Route path="/admin/usuarios" element={<AdminRoute><AdminUsuarios /></AdminRoute>} />
          <Route path="/admin/productos" element={<AdminRoute><AdminProductos /></AdminRoute>} />
          <Route path="/admin/blogs" element={<AdminRoute><AdminBlogs /></AdminRoute>} />
          <Route path="/admin/ventas" element={<AdminRoute><AdminVentas /></AdminRoute>} />

        </Routes>
      </main>

      <FooterInfo />
    </div>
  );
}

export default App;
