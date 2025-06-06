import React, { useState, useEffect } from "react";

const Contenido = () => {
  const fotosRecuerdos = [
    "recuerdo1.jpg",
    "recuerdo2.jpg",
    "recuerdo3.jpg",
    "recuerdo4.jpg",
    "recuerdo5.jpg",
    "recuerdo6.jpg",
    "recuerdo7.jpg",
    "recuerdo8.jpg",
    "recuerdo8.jpg",
    "recuerdo7.jpg",
    "recuerdo6.jpg",
    "recuerdo5.jpg",
    "recuerdo4.jpg",
    "recuerdo3.jpg",
    "recuerdo2.jpg",
    "recuerdo1.jpg",
  ];

  const fotosPorPagina = 8;
  const [paginaActual, setPaginaActual] = useState(1);
  const [fade, setFade] = useState(true);
  const [imagenAmpliada, setImagenAmpliada] = useState(null);
  const [modalAnimation, setModalAnimation] = useState(false);

  const totalPaginas = Math.ceil(fotosRecuerdos.length / fotosPorPagina);

  const fotosMostradas = fotosRecuerdos.slice(
    (paginaActual - 1) * fotosPorPagina,
    paginaActual * fotosPorPagina
  );

  const cambiarPagina = (nuevaPagina) => {
    if (nuevaPagina >= 1 && nuevaPagina <= totalPaginas) {
      setFade(false);
      setTimeout(() => {
        setPaginaActual(nuevaPagina);
        setFade(true);
      }, 200);
    }
  };

  const abrirImagen = (nombreImagen) => {
    setImagenAmpliada(nombreImagen);
    setModalAnimation(true);
  };

  const cerrarImagen = () => {
    setModalAnimation(false);
    setTimeout(() => {
      setImagenAmpliada(null);
    }, 300); // Debe coincidir con la duración de la animación
  };

  useEffect(() => {
    setFade(true);
  }, [paginaActual]);

  return (
    <div className="animate-fadeIn">
      {/* Modal para imagen ampliada con transiciones */}
      {imagenAmpliada && (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${
            modalAnimation
              ? "bg-opacity-100 backdrop-blur-sm"
              : "bg-opacity-0 backdrop-blur-0"
          }`}
          style={{ backgroundColor: "rgba(0,0,0,0.9)" }}
          onClick={cerrarImagen}
        >
          <div
            className={`relative max-w-4xl w-full transform transition-all duration-300 ${
              modalAnimation
                ? "opacity-100 scale-100"
                : "opacity-0 scale-90"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={cerrarImagen}
              className="absolute -top-12 right-0 text-white text-3xl hover:text-gray-300 transition-colors duration-200"
            >
              &times;
            </button>
            <img
              src={`/img/recuerdos/${imagenAmpliada}`}
              alt="Imagen ampliada"
              className="w-full max-h-[80vh] object-contain"
            />
            <div className="text-white text-center mt-4 text-lg">
              {imagenAmpliada.replace(".jpg", "")}
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center pt-4">
          Galería de recuerdos
        </h2>

        {/* Navegación horizontal de subcategorías */}
        <div className="flex px-6 overflow-x-auto border-b mb-6">
          <button className="px-4 py-2 font-medium text-red-600 border-b-2 border-red-500 focus:outline-none mr-4">
            Fotografías
          </button>
          <button className="px-4 py-2 font-medium text-gray-500 hover:text-gray-700 border-b-2 border-transparent hover:border-gray-300 focus:outline-none mr-4">
            Videos
          </button>
          <button className="px-4 py-2 font-medium text-gray-500 hover:text-gray-700 border-b-2 border-transparent hover:border-gray-300 focus:outline-none mr-4">
            Artesanías
          </button>
          <button className="px-4 py-2 font-medium text-gray-500 hover:text-gray-700 border-b-2 border-transparent hover:border-gray-300 focus:outline-none">
            Homenajes
          </button>
        </div>

        {/* Cuadrícula de imágenes con transición */}
        <div className="px-6 pb-8">
          <div
            className={`grid grid-cols-2 md:grid-cols-4 gap-4 transition-opacity duration-300 ${
              fade ? "opacity-100" : "opacity-0"
            }`}
          >
            {fotosMostradas.map((nombre, i) => (
              <div
                key={i}
                className="group relative cursor-pointer overflow-hidden rounded-lg shadow-md transition-transform duration-300 hover:shadow-lg"
                onClick={() => abrirImagen(nombre)}
              >
                <img
                  src={`/img/recuerdos/${nombre}`}
                  alt={`Recuerdo ${(paginaActual - 1) * fotosPorPagina + i + 1}`}
                  className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <span className="text-white font-medium">Ver foto</span>
                </div>
              </div>
            ))}
          </div>

          {/* Paginación horizontal */}
          <div className="flex justify-center mt-8">
            <nav className="inline-flex rounded-md shadow">
              <button
                onClick={() => cambiarPagina(paginaActual - 1)}
                disabled={paginaActual === 1}
                className="px-3 py-2 rounded-l-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 transition-colors duration-200"
              >
                Anterior
              </button>
              {[...Array(totalPaginas)].map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => cambiarPagina(idx + 1)}
                  className={`px-3 py-2 border-t border-b border-gray-300 bg-white transition-colors duration-200 ${
                    paginaActual === idx + 1
                      ? "text-gray-700 font-medium"
                      : "text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
              <button
                onClick={() => cambiarPagina(paginaActual + 1)}
                disabled={paginaActual === totalPaginas}
                className="px-3 py-2 rounded-r-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 transition-colors duration-200"
              >
                Siguiente
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contenido;