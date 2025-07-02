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

  // Función para formatear fechas de manera más elegante
  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-ES', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  // Datos personales organizados - SIN EMOJIS, más compactos
  const datosPersonales = [
    {
      label: 'Nacimiento',
      valor: memorialData?.fechaNacimiento ? formatearFecha(memorialData.fechaNacimiento) : null
    },
    {
      label: 'Fallecimiento', 
      valor: memorialData?.fechaFallecimiento ? formatearFecha(memorialData.fechaFallecimiento) : null
    },
    {
      label: 'Edad al fallecer',
      valor: memorialData?.edadAlFallecer ? `${memorialData.edadAlFallecer} años` : null
    },
    {
      label: 'Profesión',
      valor: memorialData?.profesion
    },
    {
      label: 'Cónyuge',
      valor: memorialData?.familia?.conyuge
    }
  ].filter(item => item.valor); // Solo mostrar items con valor

  return (
    <div className="animate-fadeIn font-memorial">
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 sm:p-6 lg:p-8 border border-amber-100 shadow-sm">
        {/* Título con tipografía elegante */}
        <h2 className="font-memorial text-memorial-subtitle sm:text-memorial-title text-gray-800 mb-6 sm:mb-8 text-center font-semibold tracking-wide">
          Su Historia
        </h2>
        
        <div className="flex flex-col lg:flex-row gap-6 sm:gap-8 lg:gap-12">
          {/* Columna izquierda: Foto y datos personales */}
          <div className="lg:w-2/5 xl:w-1/3">
            {/* Foto */}
            <div className="aspect-square rounded-xl overflow-hidden shadow-lg mb-6 bg-gradient-to-br from-gray-100 to-gray-200">
              {(memorialData?.fotoJoven || memorialData?.fotoPerfil || memorialData?.galeria?.[0]?.url) ? (
                <img 
                  src={
                    memorialData?.fotoJoven ||
                    memorialData?.fotoPerfil ||
                    memorialData?.galeria?.[0]?.url
                  } 
                  alt={`Fotografía de ${memorialData?.nombre || 'persona'}`} 
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextElementSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div 
                className={`w-full h-full flex items-center justify-center text-6xl text-gray-400 ${
                  (memorialData?.fotoJoven || memorialData?.fotoPerfil || memorialData?.galeria?.[0]?.url) ? 'hidden' : 'flex'
                }`}
              >
                📸
              </div>
            </div>
            
            {/* Datos personales rediseñados - COMPACTOS */}
            <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100">
              <h3 className="font-memorial font-semibold text-gray-800 mb-3 text-base flex items-center">
                <span className="mr-2">📋</span>
                Información Personal
              </h3>
              
              {/* Grid de datos personales - MÁS COMPACTO */}
              <div className="space-y-2">
                {datosPersonales.map((dato, index) => (
                  <div key={index} className="flex items-center justify-between py-2 px-3 rounded-md bg-gray-50 hover:bg-gray-100 transition-colors duration-200">
                    <dt className="font-memorial font-medium text-gray-600 text-sm">
                      {dato.label}
                    </dt>
                    <dd className="font-memorial text-gray-900 text-sm font-medium">
                      {dato.valor}
                    </dd>
                  </div>
                ))}
                
                {/* Hijos - tratamiento especial COMPACTO */}
                {memorialData?.familia?.hijos && memorialData.familia.hijos.length > 0 && (
                  <div className="py-2 px-3 rounded-md bg-gray-50 hover:bg-gray-100 transition-colors duration-200">
                    <div className="flex items-start justify-between">
                      <dt className="font-memorial font-medium text-gray-600 text-sm">
                        {memorialData.familia.hijos.length === 1 ? 'Hijo' : 'Hijos'}
                      </dt>
                      <dd className="flex flex-wrap gap-1 justify-end">
                        {memorialData.familia.hijos.map((hijo, index) => (
                          <span 
                            key={index} 
                            className="font-memorial bg-amber-100 text-amber-800 px-2 py-1 rounded text-xs font-medium"
                          >
                            {hijo}
                          </span>
                        ))}
                      </dd>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Mensaje si no hay datos */}
              {datosPersonales.length === 0 && (!memorialData?.familia?.hijos || memorialData.familia.hijos.length === 0) && (
                <div className="text-center py-4">
                  <p className="font-memorial text-gray-500 text-sm">
                    No hay información personal disponible
                  </p>
                </div>
              )}
            </div>
          </div>
          
          {/* Columna derecha: Biografía */}
          <div className="lg:w-3/5 xl:w-2/3">
            <div className="bg-white rounded-xl p-4 sm:p-6 lg:p-8 shadow-md border border-gray-100">
              <h3 className="font-memorial font-semibold text-gray-800 mb-4 sm:mb-6 text-lg sm:text-xl flex items-center">
                <span className="mr-2">📖</span>
                Biografía
              </h3>
              
              <div 
                ref={biografiaRef}
                className={`font-memorial ${!mostrarCompleta && necesitaColapsar ? 'max-h-[400px] sm:max-h-[500px] lg:max-h-[600px] overflow-hidden' : ''}`}
              >
                {memorialData?.biografia ? (
                  memorialData.biografia.split('\n').map((paragraph, index) => (
                    paragraph.trim() && (
                      <p key={index} className="text-memorial-body text-gray-700 leading-relaxed mb-4 first:mt-0 last:mb-0">
                        {paragraph}
                      </p>
                    )
                  ))
                ) : (
                  <div className="text-center py-8">
                    <div className="text-5xl text-gray-300 mb-4">📖</div>
                    <p className="font-memorial text-gray-500 text-base leading-relaxed">
                      La biografía de este memorial se está preparando con cariño.
                    </p>
                  </div>
                )}
              </div>
              
              {/* Efecto de degradado cuando está colapsado */}
              {!mostrarCompleta && necesitaColapsar && (
                <div className="h-16 bg-gradient-to-t from-white to-transparent -mt-16 relative"></div>
              )}

              {/* Botón "Leer más/menos" con color apropiado para memorial */}
              {necesitaColapsar && (
                <div className="flex justify-center mt-6">
                  <button 
                    onClick={toggleBiografia}
                    className="font-memorial bg-slate-600 hover:bg-slate-700 text-white px-6 py-3 rounded-full font-medium flex items-center transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                  >
                    {mostrarCompleta ? (
                      <>
                        <span>Mostrar menos</span>
                        <svg className="w-4 h-4 ml-2 transform rotate-180" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"></path>
                        </svg>
                      </>
                    ) : (
                      <>
                        <span>Leer biografía completa</span>
                        <svg className="w-4 h-4 ml-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"></path>
                        </svg>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Historia;