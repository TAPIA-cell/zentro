import HeroSection from "../components/organisms/HeroSection";
import ProductSection from "../components/organisms/ProductSection";

export default function Home() {
  return (
    <>
      {/* Hero principal */}
      <section className="bg-light py-5">
        <div className="container">
          <HeroSection />
        </div>
      </section>

      {/* Productos destacados */}
      <section className="bg-body-secondary py-5 border-top">
        <div className="container">
          <h3 className="text-center mb-4 fw-bold text-dark">
            🚀 Productos Destacados
          </h3>
          <ProductSection />
        </div>
      </section>
    </>
  );
}
