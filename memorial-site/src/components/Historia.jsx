import React from 'react'

const Historia = ({ memorialData }) => {
  return (
    <div className="animate-fadeIn">
      <div className="bg-orange-50 rounded-lg p-6 border border-orange-100">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">Biografía</h2>
        <div className="flex flex-col md:flex-row gap-8">
          <div className="md:w-1/3">
            <div className="aspect-square rounded-lg overflow-hidden shadow-md mb-4">
              {/* 🔧 FIX: Usar foto real del memorial */}
              <img 
                src={memorialData?.fotoPerfil || memorialData?.galeria?.[0]?.url || '/img/default-profile.jpg'} 
                alt={`Foto de ${memorialData?.nombre || 'joven'}`} 
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback a imagen por defecto si la imagen del memorial falla
                  e.target.src = '/img/foto-abuelita-joven.jpg';
                }}
              />
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
              <h3 className="font-medium text-gray-800 mb-2">Datos personales</h3>
              <ul className="space-y-2 text-gray-700">
                {memorialData?.fechaNacimiento && (
                  <li className="flex">
                    <span className="font-medium w-24">Nacimiento:</span>
                    <span>{new Date(memorialData.fechaNacimiento).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  </li>
                )}
                {memorialData?.fechaFallecimiento && (
                  <li className="flex">
                    <span className="font-medium w-24">Fallecimiento:</span>
                    <span>{new Date(memorialData.fechaFallecimiento).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  </li>
                )}
                {memorialData?.edadAlFallecer && (
                  <li className="flex">
                    <span className="font-medium w-24">Edad:</span>
                    <span>{memorialData.edadAlFallecer} años</span>
                  </li>
                )}
                {memorialData?.profesion && (
                  <li className="flex">
                    <span className="font-medium w-24">Profesión:</span>
                    <span>{memorialData.profesion}</span>
                  </li>
                )}
                {memorialData?.familia?.hijos && (
                  <li className="flex">
                    <span className="font-medium w-24">Hijos:</span>
                    <span>{memorialData.familia.hijos.join(', ')}</span>
                  </li>
                )}
                {memorialData?.familia?.conyuge && (
                  <li className="flex">
                    <span className="font-medium w-24">Cónyuge:</span>
                    <span>{memorialData.familia.conyuge}</span>
                  </li>
                )}
              </ul>
            </div>
          </div>
          
          <div className="md:w-2/3">
            <div className="prose max-w-none text-gray-700">
              <div className="prose max-w-none text-gray-700">
                {memorialData?.biografia ? (
                  memorialData.biografia.split('\n').map((paragraph, index) => (
                    paragraph.trim() && (
                      <p key={index} className="text-lg leading-relaxed mt-4 first:mt-0">
                        {paragraph}
                      </p>
                    )
                  ))
                ) : (
                  <p className="text-lg leading-relaxed text-gray-500">
                    No hay biografía disponible para este memorial.
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex justify-end mt-6">
              <button className="text-red-600 hover:text-red-800 font-medium flex items-center">
                Leer biografía completa
                <svg className="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Historia;