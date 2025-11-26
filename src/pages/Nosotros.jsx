import React from "react";

export default function Nosotros() {
  return (
    <div className="container my-5">
      {/* Encabezado */}
      <div className="text-center mb-5">
        <h2 className="fw-bold display-5 text-dark">🏢 Sobre Nosotros</h2>
        <p className="lead text-secondary mx-auto" style={{ maxWidth: "700px" }}>
          Somos un equipo apasionado de desarrolladores que creó <strong>Zentro E-commerce</strong> con el objetivo de demostrar el poder de las arquitecturas Cloud modernas.
        </p>
      </div>

      <div className="row justify-content-center">
        <div className="col-lg-8">
            <div className="card shadow-lg border-0">
                <div className="card-header bg-dark text-white py-3 text-center">
                    <h5 className="mb-0 fw-bold">👨‍💻 Nuestro Equipo de Desarrollo</h5>
                </div>
                
                <div className="card-body p-4">
                    <div className="list-group list-group-flush">
                        
                        {/* Integrante 1 */}
                        <div className="list-group-item d-flex flex-column flex-sm-row justify-content-between align-items-center py-3">
                            <div className="d-flex align-items-center mb-2 mb-sm-0">
                                <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-3 shadow-sm" style={{width: '45px', height: '45px', fontSize: '1.2rem'}}>
                                    DZ
                                </div>
                                <div>
                                    <h6 className="mb-0 fw-bold">Demis Zuñiga</h6>
                                    <small className="text-muted">Desarrollador Full Stack</small>
                                </div>
                            </div>
                            <a href="mailto:dem.zuniga@duocuc.cl" className="btn btn-outline-primary btn-sm rounded-pill px-3">
                                📧 Enviar Correo
                            </a>
                        </div>

                        {/* Integrante 2 */}
                        <div className="list-group-item d-flex flex-column flex-sm-row justify-content-between align-items-center py-3">
                            <div className="d-flex align-items-center mb-2 mb-sm-0">
                                <div className="bg-success text-white rounded-circle d-flex align-items-center justify-content-center me-3 shadow-sm" style={{width: '45px', height: '45px', fontSize: '1.2rem'}}>
                                    GC
                                </div>
                                <div>
                                    <h6 className="mb-0 fw-bold">Gabriel Colmenares</h6>
                                    <small className="text-muted">Desarrollador Backend</small>
                                </div>
                            </div>
                            <a href="mailto:ga.colmenares@duocuc.cl" className="btn btn-outline-success btn-sm rounded-pill px-3">
                                📧 Enviar Correo
                            </a>
                        </div>

                        {/* Integrante 3 */}
                        <div className="list-group-item d-flex flex-column flex-sm-row justify-content-between align-items-center py-3">
                            <div className="d-flex align-items-center mb-2 mb-sm-0">
                                <div className="bg-warning text-dark rounded-circle d-flex align-items-center justify-content-center me-3 shadow-sm" style={{width: '45px', height: '45px', fontSize: '1.2rem'}}>
                                    JT
                                </div>
                                <div>
                                    <h6 className="mb-0 fw-bold">José Tapia</h6>
                                    <small className="text-muted">Desarrollador Frontend</small>
                                </div>
                            </div>
                            <a href="mailto:jn.tapia@duocuc.cl" className="btn btn-outline-warning btn-sm rounded-pill px-3 text-dark">
                                📧 Enviar Correo
                            </a>
                        </div>

                    </div>
                </div>
                <div className="card-footer text-center text-muted bg-light py-3">
                    <small>© {new Date().getFullYear()} Proyecto Académico Duoc UC</small>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}