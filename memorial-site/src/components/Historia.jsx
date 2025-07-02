import React, { useState, useRef, useEffect } from 'react';

const Historia = ({ memorialData }) => {
  const [mostrarCompleta, setMostrarCompleta] = useState(false);
  const [necesitaColapsar, setNecesitaColapsar] = useState(false);
  const biografiaRef = useRef(null);

  useEffect(() => {
    if (biografiaRef.current) {
      // Verificar si el contenido excede la altura máxima
      const necesita = biografiaRef.current.scrollHeight > 300;
      setNecesitaColapsar(necesita);
      // Si no necesita colapsar, mostrar todo
      if (!necesita) {
        setMostrarCompleta(true);
      }
    }
  }, [memorialData?.biografia]);

  const toggleBiografia = () => {
    setMostrarCompleta(!mostrarCompleta);
  };

  return (
    <div className="animate-fadeIn">
      <div className="bg-orange-50 rounded-lg p-4 sm:p-6 border border-orange-100">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4 sm:mb-6 text-center">Biografía</h2>
        <div className="flex flex-col md:flex-row gap-4 sm:gap-6 md:gap-8">
          <div className="md:w-1/3">
            <div className="aspect-square rounded-lg overflow-hidden shadow-md mb-4 bg-gray-100">
              {/* Verificar si hay imagen para mostrar */}
              {(memorialData?.fotoJoven || memorialData?.fotoPerfil || memorialData?.galeria?.[0]?.url) ? (
                <img 
                  src={
                    // Prioridad 1: fotoJoven
                    memorialData?.fotoJoven ||
                    // Prioridad 2: fotoPerfil
                    memorialData?.fotoPerfil ||
                    // Prioridad 3: primera foto de la galería
                    memorialData?.galeria?.[0]?.url
                  } 
                  alt={`Foto de ${memorialData?.nombre || 'persona'} en su juventud`} 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Si falla la imagen, mostrar emoji
                    e.target.style.display = 'none';
                    e.target.nextElementSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div 
                className={`w-full h-full flex items-center justify-center text-6xl ${
                  (memorialData?.fotoJoven || memorialData?.fotoPerfil || memorialData?.galeria?.[0]?.url) ? 'hidden' : 'flex'
                }`}
                style={{ 
                  display: (memorialData?.fotoJoven || memorialData?.fotoPerfil || memorialData?.galeria?.[0]?.url) ? 'none' : 'flex' 
                }}
              >
                📸
              </div>
            </div>
            <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-800 mb-3 sm:mb-4 text-sm sm:text-base">Datos personales</h3>
              <div className="space-y-2 sm:space-y-3">
                {memorialData?.fechaNacimiento && (
                  <div className="flex flex-col sm:flex-row sm:items-start">
                    <span className="font-bold text-gray-600 text-sm sm:w-28 flex-shrink-0 mb-1 sm:mb-0">Nacimiento:</span>
                    <span className="text-gray-800 text-sm sm:text-base">
                      {new Date(memorialData.fechaNacimiento).toLocaleDateString('es-ES', { 
                        day: 'numeric', 
                        month: 'long', 
                        year: 'numeric' 
                      })}
                    </span>
                  </div>
                )}
                
                {memorialData?.fechaFallecimiento && (
                  <div className="flex flex-col sm:flex-row sm:items-start">
                    <span className="font-bold text-gray-600 text-sm sm:w-28 flex-shrink-0 mb-1 sm:mb-0">Fallecimiento:</span>
                    <span className="text-gray-800 text-sm sm:text-base">
                      {new Date(memorialData.fechaFallecimiento).toLocaleDateString('es-ES', { 
                        day: 'numeric', 
                        month: 'long', 
                        year: 'numeric' 
                      })}
                    </span>
                  </div>
                )}
                
                {memorialData?.edadAlFallecer && (
                  <div className="flex flex-col sm:flex-row sm:items-start">
                    <span className="font-bold text-gray-600 text-sm sm:w-28 flex-shrink-0 mb-1 sm:mb-0">Edad:</span>
                    <span className="text-gray-800 text-sm sm:text-base">{memorialData.edadAlFallecer} años</span>
                  </div>
                )}
                
                {memorialData?.profesion && (
                  <div className="flex flex-col sm:flex-row sm:items-start">
                    <span className="font-bold text-gray-600 text-sm sm:w-28 flex-shrink-0 mb-1 sm:mb-0">Profesión:</span>
                    <span className="text-gray-800 text-sm sm:text-base">{memorialData.profesion}</span>
                  </div>
                )}
                
                {memorialData?.familia?.conyuge && (
                  <div className="flex flex-col sm:flex-row sm:items-start">
                    <span className="font-bold text-gray-600 text-sm sm:w-28 flex-shrink-0 mb-1 sm:mb-0">Cónyuge:</span>
                    <span className="text-gray-800 text-sm sm:text-base">{memorialData.familia.conyuge}</span>
                  </div>
                )}
                
                {memorialData?.familia?.hijos && (
                  <div className="flex flex-col sm:flex-row sm:items-start">
                    <span className="font-bold text-gray-600 text-sm sm:w-28 flex-shrink-0 mb-1 sm:mb-0">Hijos:</span>
                    <div className="flex flex-wrap gap-1 text-gray-800">
                      {memorialData.familia.hijos.map((hijo, index) => (
                        <span key={index} className="bg-gray-100 px-2 py-1 rounded-md text-xs sm:text-sm">
                          {hijo}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="md:w-2/3">
            <div 
              ref={biografiaRef}
              className={`prose max-w-none text-gray-700 ${!mostrarCompleta && necesitaColapsar ? 'max-h-[400px] sm:max-h-[600px] overflow-hidden' : ''}`}
            >
              {memorialData?.biografia ? (
                memorialData.biografia.split('\n').map((paragraph, index) => (
                  paragraph.trim() && (
                    <p key={index} className="text-sm sm:text-base md:text-lg leading-relaxed mt-3 sm:mt-4 first:mt-0">
                      {paragraph}
                    </p>
                  )
                ))
              ) : (
                <p className="text-sm sm:text-base md:text-lg leading-relaxed text-gray-500">
                  No hay biografía disponible para este memorial.
                </p>
              )}
            </div>
            
            {/* Efecto de degradado cuando está colapsado */}
            {!mostrarCompleta && necesitaColapsar && (
              <div className="h-16 bg-gradient-to-t  to-transparent -mt-16 relative"></div>
            )}

            {/* Botón "Leer más/menos" solo si es necesario */}
            {necesitaColapsar && (
              <div className="flex justify-end mt-2">
                <button 
                  onClick={toggleBiografia}
                  className="text-red-600 hover:text-red-800 font-medium flex items-center"
                >
                  {mostrarCompleta ? 'Mostrar menos' : 'Leer biografía completa'}
                  <svg 
                    className={`w-4 h-4 ml-1 ${mostrarCompleta ? 'transform rotate-180' : ''}`} 
                    fill="currentColor" 
                    viewBox="0 0 20 20"
                  >
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"></path>
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Historia;