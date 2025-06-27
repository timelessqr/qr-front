import React, { useState, useEffect } from 'react';

const ImageSlider = ({ images, interval = 5000, backgroundOpacity = 0.6 }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [validImages, setValidImages] = useState([]);

  // Procesar y validar imágenes cuando cambie el prop
  useEffect(() => {
    if (!images || !Array.isArray(images)) {
      setValidImages([]);
      return;
    }

    // Filtrar y procesar imágenes válidas
    const processedImages = images
      .filter(img => {
        // Verificar si es string (URL directa) o objeto con URL
        if (typeof img === 'string') {
          return img && img.trim() !== '';
        }
        // Si es objeto, verificar URL en diferentes campos posibles
        return img && (img.url || img.archivo?.url || img.src);
      })
      .map(img => {
        // Normalizar a URL string
        if (typeof img === 'string') {
          return img;
        }
        return img.url || img.archivo?.url || img.src || '';
      })
      .filter(url => url && url.trim() !== ''); // Filtrar URLs vacías

    // console.log('🖼️ ImageSlider - Imágenes procesadas:', processedImages);
    setValidImages(processedImages);
    
    // Resetear índice si es necesario
    if (processedImages.length > 0 && currentIndex >= processedImages.length) {
      setCurrentIndex(0);
    }
  }, [images]);

  // Efecto para el slideshow automático
  useEffect(() => {
    if (validImages && validImages.length > 1) {
      const timer = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % validImages.length);
      }, interval);
      return () => clearInterval(timer);
    }
  }, [validImages, interval, currentIndex]);

  // No renderizar si no hay imágenes válidas
  if (!validImages || validImages.length === 0) {
    // console.log('🖼️ ImageSlider - No hay imágenes válidas para mostrar');
    return null;
  }

  // console.log('🖼️ ImageSlider - Renderizando con', validImages.length, 'imágenes, índice actual:', currentIndex);

  return (
    <div className="absolute inset-0 overflow-hidden rounded-b-lg z-0">
      {validImages.map((imageUrl, index) => (
        <img
          key={`${imageUrl}-${index}`} // Key más único
          src={imageUrl}
          alt={`Background ${index + 1}`}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${
            index === currentIndex ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            opacity: index === currentIndex ? backgroundOpacity : 0
          }}
          onError={(e) => {
            // console.error('❌ Error cargando imagen de fondo:', imageUrl);
            // Si la imagen falla, la ocultamos pero no la removemos para mantener el índice
            e.target.style.display = 'none';
          }}
          onLoad={() => {
            // console.log('✅ Imagen de fondo cargada correctamente:', imageUrl);
          }}
        />
      ))}
      
      {/* Indicadores de slideshow (opcional, solo si hay múltiples imágenes) */}
      {validImages.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
          {validImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentIndex 
                  ? 'bg-white scale-125' 
                  : 'bg-white/50 hover:bg-white/75'
              }`}
              title={`Ir a imagen ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageSlider;