import { Link } from "react-router-dom"; // 🆕 Importante para navegación SPA

function HeroSection() {
  return (
    <section className="bg-light py-5">
      <div className="container">
        <div className="row align-items-center">
          <div className="col-md-6 order-2 order-md-1">
            <h1 className="fw-bold display-4">Zentro E-commerce</h1>
            <p className="lead text-secondary my-4">
              Descubre la mejor selección de productos con la calidad que mereces, 
              directamente desde nuestra bodega a tu hogar.
            </p>
            
            {/* 🆕 Usamos Link para navegación instantánea sin recarga */}
            <Link to="/productos" className="btn btn-dark btn-lg px-4 shadow-sm">
                📦 Ver Catálogo
            </Link>
          </div>
          
          <div className="col-md-6 text-center order-1 order-md-2 mb-4 mb-md-0">
            <img 
                src="/img/Comercio.jpg" 
                alt="Imagen tienda online" 
                className="img-fluid rounded shadow-lg"
                style={{ maxHeight: '400px', objectFit: 'cover' }} 
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;