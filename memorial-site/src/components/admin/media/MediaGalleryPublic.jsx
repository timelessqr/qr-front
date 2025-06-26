// ====================================
// src/components/admin/media/MediaGalleryPublic.jsx - Vista integrada del contenido público en el admin
// ====================================
import React, { useState, useEffect } from 'react';
import mediaService from '../../../services/mediaService';

const MediaGalleryPublic = ({ selectedMemorial, onStatsUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [galleryData, setGalleryData] = useState({
    fotos: [],
    videos: []
  });
  const [activeView, setActiveView] = useState('fotos');
  const [selectedItem, setSelectedItem] = useState(null);

  const profileId = selectedMemorial?._id;

  useEffect(() => {
    if (profileId) {
      loadGalleryData();
    }
  }, [profileId, selectedMemorial?.fotoPerfil, selectedMemorial?.fotoJoven]);

  const loadGalleryData = async () => {
    try {
      setLoading(true);
      
      // Obtener media de la galería usando el mismo método que funciona en otros componentes
      const response = await mediaService.getByProfile(profileId, {
        seccion: 'galeria'
      });
      
      console.log('🎬 MediaGalleryPublic - Respuesta API:', response);
      
      // Extraer el array de media correctamente
      const allMedia = response.data?.media || response.media || [];
      console.log('🎬 MediaGalleryPublic - All media:', allMedia);
      
      // FILTRAR: Excluir fotos que estén siendo usadas como fotoPerfil o fotoJoven
      const currentFotoPerfil = selectedMemorial?.fotoPerfil;
      const currentFotoJoven = selectedMemorial?.fotoJoven;
      
      const mediaFiltrada = allMedia.filter(item => {
        if (item.tipo === 'foto' || item.tipo === 'imagen') {
          const itemUrl = item.url || item.archivo?.url;
          return itemUrl !== currentFotoPerfil && itemUrl !== currentFotoJoven;
        }
        return true; // Mantener videos y otros tipos
      });
      
      console.log('🔍 MediaGalleryPublic - Media filtrada (sin perfil/biografía):', mediaFiltrada.length);
      
      // Filtrar fotos y videos de la media filtrada
      const fotos = mediaFiltrada.filter(item => {
        return item.tipo === 'foto' || item.tipo === 'imagen';
      });
      
      const videos = mediaFiltrada.filter(item => {
        return item.tipo === 'video';
      });
      
      console.log('📸 Fotos encontradas:', fotos.length);
      console.log('🎥 Videos encontrados:', videos.length);
      
      setGalleryData({
        fotos,
        videos
      });
      
      // Actualizar estadísticas
      if (onStatsUpdate) {
        onStatsUpdate({
          totalGallery: fotos.length + videos.length,
          totalFotos: fotos.length,
          totalVideos: videos.length
        });
      }
      
    } catch (error) {
      console.error('❌ Error cargando galería pública:', error);
      setGalleryData({ fotos: [], videos: [] });
      
      // Actualizar estadísticas con 0
      if (onStatsUpdate) {
        onStatsUpdate({
          totalGallery: 0,
          totalFotos: 0,
          totalVideos: 0
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleItemClick = (item) => {
    setSelectedItem(item);
  };

  const closeModal = () => {
    setSelectedItem(null);
  };

  const getItemUrl = (item) => {
    return item.url || item.archivo?.url || '/img/default-photo.jpg';
  };

  const currentData = activeView === 'fotos' ? galleryData.fotos : galleryData.videos;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">
            Vista Pública del Memorial
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Así es como los visitantes ven las fotos y videos del memorial
          </p>
        </div>
        
        <div className="text-sm text-gray-600">
          <span className="mr-4">📸 Fotos: {galleryData.fotos.length}</span>
          <span>🎥 Videos: {galleryData.videos.length}</span>
        </div>
      </div>

      {/* Navegación de pestañas */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveView('fotos')}
            className={`${
              activeView === 'fotos'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center`}
          >
            📸 Fotografías
            <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
              activeView === 'fotos' ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-900'
            }`}>
              {galleryData.fotos.length}
            </span>
          </button>
          
          <button
            onClick={() => setActiveView('videos')}
            className={`${
              activeView === 'videos'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center`}
          >
            🎥 Videos
            <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
              activeView === 'videos' ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-900'
            }`}>
              {galleryData.videos.length}
            </span>
          </button>
        </nav>
      </div>

      {/* Contenido */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <span className="ml-3 text-gray-600">Cargando contenido público...</span>
        </div>
      ) : currentData.length > 0 ? (
        <div className={`grid gap-4 ${
          activeView === 'fotos' 
            ? 'grid-cols-2 md:grid-cols-4' 
            : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
        }`}>
          {currentData.map((item, index) => (
            <div
              key={item._id || item.id || index}
              className="group relative cursor-pointer overflow-hidden rounded-lg shadow-md transition-transform duration-300 hover:shadow-lg bg-white"
              onClick={() => handleItemClick(item)}
            >
              {activeView === 'fotos' ? (
                // Tarjeta de foto
                <>
                  <div className="aspect-square bg-gray-100">
                    <img
                      src={getItemUrl(item)}
                      alt={item.titulo || 'Foto del memorial'}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => {
                        // Si falla la imagen, ocultar y mostrar emoji
                        e.target.style.display = 'none';
                        const emojiDiv = document.createElement('div');
                        emojiDiv.className = 'w-full h-full flex items-center justify-center text-4xl bg-gray-100';
                        emojiDiv.textContent = '📸';
                        e.target.parentNode.appendChild(emojiDiv);
                      }}
                    />
                  </div>
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-opacity duration-300 flex items-center justify-center">
                    <span className="text-white font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      📸 Ver foto
                    </span>
                  </div>
                  
                  {/* Info en la parte inferior */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <p className="text-white text-sm font-medium truncate">
                      {item.titulo || item.archivo?.nombreOriginal || 'Foto del memorial'}
                    </p>
                  </div>
                </>
              ) : (
                // Tarjeta de video
                <>
                  <div className="aspect-video bg-gray-800 relative">
                    {item.thumbnail || item.archivo?.thumbnail ? (
                      <img 
                        src={item.thumbnail || item.archivo?.thumbnail}
                        alt={item.titulo || "Preview del video"}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-700">
                        <div className="text-white text-4xl opacity-70">▶️</div>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black bg-opacity-30 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                      <div className="text-white font-medium text-center">
                        <div className="text-2xl mb-2">▶️</div>
                        <div className="text-sm">Reproducir</div>
                      </div>
                    </div>
                  </div>
                  <div className="p-3">
                    <h4 className="font-medium text-gray-900 text-sm truncate">
                      {item.titulo || item.archivo?.nombreOriginal || 'Video sin título'}
                    </h4>
                    <p className="text-xs text-gray-500 mt-1">
                      {item.descripcion || 'Video memorial'}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-400">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                      {item.archivo?.tamaño && (
                        <span className="text-xs text-gray-400">
                          {(item.archivo.tamaño / (1024 * 1024)).toFixed(1)} MB
                        </span>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
            {activeView === 'fotos' ? (
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            ) : (
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            )}
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Sin {activeView === 'fotos' ? 'fotografías' : 'videos'} públicos
          </h3>
          <p className="text-gray-500 mb-4">
            Los {activeView === 'fotos' ? 'fotos' : 'videos'} aparecerán aquí cuando se suban al memorial
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-sm text-blue-700">
                <p className="font-medium">Tip:</p>
                <p>Sube contenido en las pestañas "Fotografías" y "Videos" para verlo aquí.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal para mostrar contenido ampliado */}
      {selectedItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-90"
          onClick={closeModal}
        >
          <div
            className="relative max-w-4xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeModal}
              className="absolute -top-12 right-0 text-white text-3xl hover:text-gray-300 transition-colors duration-200 z-10"
              title="Cerrar"
            >
              &times;
            </button>
            
            {activeView === 'fotos' ? (
              <img
                src={getItemUrl(selectedItem)}
                alt={selectedItem.titulo || "Imagen del memorial"}
                className="w-full max-h-[80vh] object-contain rounded-lg"
                onError={(e) => {
                  // Si falla la imagen, mostrar mensaje con emoji
                  e.target.style.display = 'none';
                  const errorDiv = document.createElement('div');
                  errorDiv.className = 'w-full h-64 flex flex-col items-center justify-center text-white bg-gray-800 rounded-lg';
                  errorDiv.innerHTML = '<div class="text-6xl mb-4">📸</div><div class="text-lg">Imagen no disponible</div>';
                  e.target.parentNode.appendChild(errorDiv);
                }}
              />
            ) : (
              <video
                src={getItemUrl(selectedItem)}
                controls
                autoPlay
                className="w-full max-h-[80vh] object-contain rounded-lg"
                onError={(e) => {
                  console.error('Error cargando video:', e);
                }}
              >
                <p className="text-white">Tu navegador no soporta el elemento video.</p>
              </video>
            )}
            
            <div className="text-white text-center mt-4">
              <h3 className="text-lg font-medium">
                {selectedItem.titulo || selectedItem.archivo?.nombreOriginal || 'Contenido del memorial'}
              </h3>
              {selectedItem.descripcion && (
                <p className="text-gray-300 mt-2">{selectedItem.descripcion}</p>
              )}
              <div className="text-sm text-gray-400 mt-2">
                Subido el {new Date(selectedItem.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaGalleryPublic;