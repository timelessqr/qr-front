import React, { useState, useEffect } from "react";

const Contenido = ({ memorialData }) => {
  const [tipoContenido, setTipoContenido] = useState("fotos"); // Estado para tipo de contenido
  
  // Debug: Ver qué datos estamos recibiendo
  console.log('🖼️ Contenido - memorialData completo:', memorialData);
  console.log('🖼️ Contenido - galeria array:', memorialData?.galeria);
  console.log('🖼️ Contenido - videos array:', memorialData?.videos);
  console.log('🖼️ Contenido - fondos array:', memorialData?.fondos);
  
  // Obtener fotos reales del memorial (ahora ya vienen filtradas por sección galeria)
  const fotosRecuerdos = memorialData?.galeria?.filter(item => {
    const esFoto = (item.tipo === 'foto' || item.tipo === 'imagen');
    
    // Debug para ver qué está pasando
    if (esFoto) {
      console.log('🖼️ Contenido - Foto en galeria:', {
        titulo: item.titulo,
        tipo: item.tipo,
        seccion: item.seccion,
        esValidaParaGaleria: esFoto
      });
    }
    
    return esFoto;
  }) || [];
  
  console.log('🖼️ Contenido - Total fotos en galeria:', fotosRecuerdos.length);
  
  const videosRecuerdos = memorialData?.videos?.filter(item => 
    item.tipo === 'video'
  ) || [];

  const fotosPorPagina = 8;
  const videosPorPagina = 6;
  const [paginaActual, setPaginaActual] = useState(1);
  const [fade, setFade] = useState(true);
  const [imagenAmpliada, setImagenAmpliada] = useState(null);
  const [videoActual, setVideoActual] = useState(null);
  const [modalAnimation, setModalAnimation] = useState(false);

  // Función para obtener contenido actual según el tipo
  const obtenerContenidoActual = () => {
    if (tipoContenido === "fotos") {
      return fotosRecuerdos;
    } else {
      return videosRecuerdos;
    }
  };

  const contenidoActual = obtenerContenidoActual();
  const itemsPorPagina = tipoContenido === "fotos" ? fotosPorPagina : videosPorPagina;
  const totalPaginas = Math.ceil(contenidoActual.length / itemsPorPagina);

  const contenidoMostrado = contenidoActual.slice(
    (paginaActual - 1) * itemsPorPagina,
    paginaActual * itemsPorPagina
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

  const cambiarTipoContenido = (tipo) => {
    if (tipo !== tipoContenido) {
      setFade(false);
      setTimeout(() => {
        setTipoContenido(tipo);
        setPaginaActual(1); // Reiniciar a la primera página
        setFade(true);
      }, 200);
    }
  };

  const abrirImagen = (foto) => {
    setImagenAmpliada(foto);
    setModalAnimation(true);
  };

  const abrirVideo = (video) => {
    setVideoActual(video);
    setModalAnimation(true);
  };

  const cerrarModal = () => {
    setModalAnimation(false);
    setTimeout(() => {
      setImagenAmpliada(null);
      setVideoActual(null);
    }, 300);
  };

  useEffect(() => {
    setFade(true);
  }, [paginaActual, tipoContenido]);

  return (
    <div className="animate-fadeIn">
      {/* Modal para imagen ampliada */}
      {imagenAmpliada && (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${
            modalAnimation
              ? "bg-opacity-100 backdrop-blur-sm"
              : "bg-opacity-0 backdrop-blur-0"
          }`}
          style={{ backgroundColor: "rgba(0,0,0,0.9)" }}
          onClick={cerrarModal}
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
              onClick={cerrarModal}
              className="absolute -top-12 right-0 text-white text-3xl hover:text-gray-300 transition-colors duration-200 z-10"
            >
              &times;
            </button>
            <img
              src={imagenAmpliada.url || imagenAmpliada.archivo?.url}
              alt={imagenAmpliada.titulo || "Imagen del memorial"}
              className="w-full max-h-[80vh] object-contain"
              onError={(e) => {
                // Si falla la imagen, mostrar mensaje con emoji
                e.target.style.display = 'none';
                if (!e.target.nextElementSibling || !e.target.nextElementSibling.classList.contains('emoji-fallback')) {
                  const errorDiv = document.createElement('div');
                  errorDiv.className = 'emoji-fallback w-full h-64 flex flex-col items-center justify-center text-white';
                  errorDiv.innerHTML = '<div class="text-6xl mb-4">📸</div><div class="text-lg">Imagen no disponible</div>';
                  e.target.parentNode.appendChild(errorDiv);
                }
              }}
            />
            {/* Título removido para vista más limpia */}
          </div>
        </div>
      )}

      {/* Modal para video */}
      {videoActual && (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${
            modalAnimation
              ? "bg-opacity-100 backdrop-blur-sm"
              : "bg-opacity-0 backdrop-blur-0"
          }`}
          style={{ backgroundColor: "rgba(0,0,0,0.9)" }}
          onClick={cerrarModal}
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
              onClick={cerrarModal}
              className="absolute -top-12 right-0 text-white text-3xl hover:text-gray-300 transition-colors duration-200 z-10"
            >
              &times;
            </button>
            <video
              src={videoActual.url || videoActual.archivo?.url}
              controls
              autoPlay
              className="w-full max-h-[80vh] object-contain"
            >
              Tu navegador no soporta el elemento video.
            </video>
            {/* Título removido para vista más limpia */}
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-lg border border-gray-100">
        <h2 className="font-memorial text-memorial-subtitle sm:text-memorial-title text-gray-800 mb-4 sm:mb-6 text-center pt-6 font-semibold tracking-wide">
          Galería de Recuerdos
        </h2>

        {/* Navegación horizontal - SOLO fotos y videos */}
        <div className="flex px-3 sm:px-6 overflow-x-auto border-b mb-4 sm:mb-6">
          <button 
            onClick={() => cambiarTipoContenido("fotos")}
            className={`font-memorial px-3 sm:px-4 py-2 font-medium focus:outline-none mr-2 sm:mr-4 border-b-2 transition-colors duration-200 whitespace-nowrap text-sm sm:text-base ${
              tipoContenido === "fotos" 
                ? "text-red-600 border-red-500" 
                : "text-gray-500 hover:text-gray-700 border-transparent hover:border-gray-300"
            }`}
          >
            📸 Fotografías
          </button>
          <button 
            onClick={() => cambiarTipoContenido("videos")}
            className={`font-memorial px-3 sm:px-4 py-2 font-medium focus:outline-none border-b-2 transition-colors duration-200 whitespace-nowrap text-sm sm:text-base ${
              tipoContenido === "videos" 
                ? "text-red-600 border-red-500" 
                : "text-gray-500 hover:text-gray-700 border-transparent hover:border-gray-300"
            }`}
          >
            🎥 Videos
          </button>
        </div>

        {/* Contenido dinámico según el tipo seleccionado */}
        <div className="px-3 sm:px-6 pb-6 sm:pb-8">
          {tipoContenido === "fotos" ? (
            // Cuadrícula de fotos
            <div
              className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4 transition-opacity duration-300 ${
                fade ? "opacity-100" : "opacity-0"
              }`}
            >
              {contenidoMostrado.map((foto, i) => (
                <div
                  key={foto.id || foto._id || i}
                  className="group relative cursor-pointer overflow-hidden rounded-lg shadow-md transition-transform duration-300 hover:shadow-lg"
                  onClick={() => abrirImagen(foto)}
                >
                  <img
                    src={foto.url || foto.archivo?.url}
                    alt={foto.titulo || `Recuerdo ${(paginaActual - 1) * itemsPorPagina + i + 1}`}
                    className="w-full h-32 sm:h-40 md:h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                    onError={(e) => {
                      // Si falla la imagen, mostrar emoji
                      e.target.style.display = 'none';
                      if (!e.target.nextElementSibling || !e.target.nextElementSibling.classList.contains('emoji-fallback')) {
                        const emojiDiv = document.createElement('div');
                        emojiDiv.className = 'emoji-fallback w-full h-32 sm:h-40 md:h-48 flex items-center justify-center text-2xl sm:text-3xl md:text-4xl bg-gray-100';
                        emojiDiv.textContent = '📸';
                        e.target.parentNode.appendChild(emojiDiv);
                      }
                    }}
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <span className="text-white font-medium">📸 Ver foto</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // Cuadrícula de videos
            <div
              className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 transition-opacity duration-300 ${
                fade ? "opacity-100" : "opacity-0"
              }`}
            >
              {contenidoMostrado.map((video, i) => (
                <div
                  key={video.id || video._id || i}
                  className="group relative cursor-pointer overflow-hidden rounded-lg shadow-md transition-transform duration-300 hover:shadow-lg"
                  onClick={() => abrirVideo(video)}
                >
                  <div className="relative bg-gray-800 h-48">
                    {/* Video como preview */}
                    <video
                      src={video.url || video.archivo?.url}
                      className="w-full h-full object-cover"
                      preload="metadata"
                      muted
                      onError={(e) => {
                        // Si falla el video, mostrar emoji
                        e.target.style.display = 'none';
                        if (!e.target.nextElementSibling || !e.target.nextElementSibling.classList.contains('emoji-fallback')) {
                          const emojiDiv = document.createElement('div');
                          emojiDiv.className = 'emoji-fallback w-full h-full flex items-center justify-center text-4xl bg-gray-800 text-white';
                          emojiDiv.textContent = '🎥';
                          e.target.parentNode.appendChild(emojiDiv);
                        }
                      }}
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-30 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                      <span className="text-white font-medium text-lg">🎥 Reproducir video</span>
                    </div>
                  </div>
                  {/* Info del video removida para vista más limpia */}
                </div>
              ))}
            </div>
          )}

          {/* Paginación horizontal */}
          {totalPaginas > 1 && (
            <div className="flex justify-center mt-6 sm:mt-8">
              <nav className="inline-flex rounded-md shadow text-sm">
                <button
                  onClick={() => cambiarPagina(paginaActual - 1)}
                  disabled={paginaActual === 1}
                  className="font-memorial px-2 sm:px-3 py-2 rounded-l-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 transition-colors duration-200 text-xs sm:text-sm"
                >
                  Anterior
                </button>
                {[...Array(totalPaginas)].map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => cambiarPagina(idx + 1)}
                    className={`font-memorial px-2 sm:px-3 py-2 border-t border-b border-gray-300 bg-white transition-colors duration-200 text-xs sm:text-sm ${
                      paginaActual === idx + 1
                        ? "text-gray-700 font-medium bg-gray-50"
                        : "text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    {idx + 1}
                  </button>
                ))}
                <button
                  onClick={() => cambiarPagina(paginaActual + 1)}
                  disabled={paginaActual === totalPaginas}
                  className="font-memorial px-2 sm:px-3 py-2 rounded-r-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 transition-colors duration-200 text-xs sm:text-sm"
                >
                  Siguiente
                </button>
              </nav>
            </div>
          )}
        </div>

        {/* Mensaje si no hay contenido */}
        {contenidoMostrado.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">
              {tipoContenido === "fotos" ? "📸" : "🎥"}
            </div>
            <h3 className="font-memorial text-lg font-medium text-gray-900 mb-2">
              No hay {tipoContenido} disponibles
            </h3>
            <p className="font-memorial text-gray-600 leading-relaxed">
              Los {tipoContenido} aparecerán aquí cuando se agreguen al memorial.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Contenido;