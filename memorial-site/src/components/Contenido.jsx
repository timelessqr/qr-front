import React from 'react';

const Contenido = () => {
  return (
    <div className="animate-fadeIn">
      <div className="bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center pt-4">Galería de recuerdos</h2>
        
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
        
        {/* Cuadrícula de imágenes horizontal */}
        <div className="px-6 pb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="group relative cursor-pointer overflow-hidden rounded-lg shadow-md">
                <img 
                  src={`/gallery-${i + 1}.jpg`} 
                  alt={`Recuerdo ${i + 1}`} 
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
              <a href="#" className="px-3 py-2 rounded-l-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50">
                Anterior
              </a>
              <a href="#" className="px-3 py-2 border-t border-b border-gray-300 bg-white text-gray-700 font-medium">
                1
              </a>
              <a href="#" className="px-3 py-2 border-t border-b border-gray-300 bg-white text-gray-500 hover:bg-gray-50">
                2
              </a>
              <a href="#" className="px-3 py-2 border-t border-b border-gray-300 bg-white text-gray-500 hover:bg-gray-50">
                3
              </a>
              <a href="#" className="px-3 py-2 rounded-r-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50">
                Siguiente
              </a>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contenido;