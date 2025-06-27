import React, { useState, useEffect } from 'react';
import ImageSlider from './ImageSlider';

const ProfileHeader = ({ memorialData, onMusicButtonClick }) => {
  const [backgroundImages, setBackgroundImages] = useState([]);

  // Procesar fondos directamente de memorialData
  useEffect(() => {
    console.log('🖼️ ProfileHeader - memorialData recibido:', memorialData);
    console.log('🖼️ ProfileHeader - fondos directos:', memorialData?.fondos);
    
    if (memorialData?.fondos && Array.isArray(memorialData.fondos) && memorialData.fondos.length > 0) {
      // Extraer URLs de los fondos y mezclar aleatoriamente
      const imageUrls = memorialData.fondos
        .map(fondo => fondo.url || fondo.archivo?.url)
        .filter(url => url && url.trim() !== '');
      
      // Mezclar aleatoriamente las imágenes para el slideshow
      const shuffledImages = [...imageUrls].sort(() => Math.random() - 0.5);
      
      console.log('🖼️ ProfileHeader - URLs de fondos procesadas:', shuffledImages);
      setBackgroundImages(shuffledImages);
    } else {
      console.log('🖼️ ProfileHeader - No se encontraron fondos, usando fallback');
      setBackgroundImages([]);
    }
  }, [memorialData?.fondos]);

  // Imágenes de fallback si no hay fondos configurados
  const fallbackImages = [
    '/images/background1.jpg',
    '/images/background2.jpg',
    '/images/background3.jpg'
  ];

  // Determinar qué imágenes usar
  const imagesToDisplay = backgroundImages.length > 0 ? backgroundImages : fallbackImages;

  console.log('🖼️ ProfileHeader - Imágenes a mostrar:', imagesToDisplay);

  return (
    <div className="relative w-full h-[450px] md:h-[500px] overflow-hidden rounded-b-lg shadow-lg">
      {/* ImageSlider con datos reales */}
      <ImageSlider images={imagesToDisplay} interval={5000} />

      {/* Gradiente overlay para mejor legibilidad */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/20 to-transparent z-5"></div>

      {/* Contenido del header */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-10">
        <div className="relative z-20 mt-24 md:mt-32">
          {/* Foto de perfil con indicador de fuente */}
          <div className="relative">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-white shadow-xl bg-gray-100 mx-auto">
              {memorialData?.fotoPerfil ? (
                <img 
                  src={memorialData.fotoPerfil} 
                  alt={`Foto de ${memorialData?.nombre || 'perfil'}`} 
                  className="w-full h-full object-cover object-center"
                  onError={(e) => {
                    console.error('❌ Error cargando foto de perfil:', memorialData.fotoPerfil);
                    e.target.style.display = 'none';
                    e.target.nextElementSibling.style.display = 'flex';
                  }}
                  onLoad={() => {
                    console.log('✅ Foto de perfil cargada correctamente');
                  }}
                />
              ) : null}
              <div 
                className={`w-full h-full flex items-center justify-center text-4xl md:text-5xl text-gray-400 ${memorialData?.fotoPerfil ? 'hidden' : 'flex'}`}
                style={{ display: memorialData?.fotoPerfil ? 'none' : 'flex' }}
              >
                👤
              </div>
            </div>
            
            {/* Badge de fuente de fondos */}
            {backgroundImages.length > 0 && (
              <div className="absolute -bottom-2 -right-2 bg-orange-600 text-white text-xs px-2 py-1 rounded-full shadow-lg">
                {backgroundImages.length} fondos
              </div>
            )}
          </div>
        </div>
        
        {/* Información del memorial */}
        <div className="px-6 text-center w-full mt-4">
          <h1 className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg">
            {memorialData?.nombre || 'Nombre no disponible'} {memorialData?.apellidos || ''}
          </h1>
          <p className="text-gray-200 mt-2 italic font-light text-lg md:text-xl drop-shadow-md">
            "{
              memorialData?.frase ||
              'El amor y los recuerdos nos mantienen vivos más allá del tiempo.'
            }"
          </p>
          
          {/* Ubicación */}
          <div className="flex items-center justify-center mt-4">
            <div className="flex items-center bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-white">
              <span className="text-lg mr-2">🇨🇱</span>
              <p className="text-white">
                {memorialData?.ubicacion?.ciudad && memorialData?.ubicacion?.pais
                  ? `${memorialData.ubicacion.ciudad}, ${memorialData.ubicacion.pais}`
                  : 'Santiago, Chile'
                }
              </p>
            </div>
          </div>
          
          {/* Botón de música */}
          {memorialData?.canciones && memorialData.canciones.length > 0 && (
            <button 
              onClick={onMusicButtonClick}
              className="mt-6 inline-flex items-center justify-center bg-stone-700/80 backdrop-blur-sm hover:bg-stone-800/80 text-white py-2 px-6 rounded-full shadow-lg transition duration-300 z-50 border border-white/20"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M9 18V5l12-2v13"></path>
                <circle cx="6" cy="18" r="3"></circle>
                <circle cx="18" cy="16" r="3"></circle>
              </svg>
              Música del Recuerdo
            </button>
          )}

          {/* Información de fondos en modo debug (solo en desarrollo) */}
          {process.env.NODE_ENV === 'development' && false && ( // Deshabilitado temporalmente
            <div className="mt-4 bg-black/50 backdrop-blur-sm rounded-lg px-3 py-2 text-xs text-white/80">
              <p>Fondos: {backgroundImages.length > 0 ? `${backgroundImages.length} desde Cloudinary` : 'Usando fallback'}</p>
              {backgroundImages.length === 0 && (
                <p>Tip: Sube fondos en el panel admin para personalizar</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;