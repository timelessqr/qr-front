// ====================================
// src/components/admin/media/MediaBackgrounds.jsx - Gestión de imágenes de fondo del memorial
// ====================================
import React, { useState, useEffect, useCallback } from 'react';
import mediaService from '../../../services/mediaService';

const MediaBackgrounds = ({ selectedMemorial, onStatsUpdate }) => {
  const [backgrounds, setBackgrounds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [selectedForPreview, setSelectedForPreview] = useState(null);

  // Configuración de slideshow
  const [slideshowConfig, setSlideshowConfig] = useState({
    autoPlay: true,
    interval: 5000, // 5 segundos
    fadeEffect: true
  });

  const profileId = selectedMemorial?._id;

  useEffect(() => {
    if (profileId) {
      loadBackgrounds();
    }
  }, [profileId]);

  const loadBackgrounds = async () => {
    try {
      setLoading(true);
      const response = await mediaService.getByProfile(profileId, {
        seccion: 'fondos',
        tipo: 'foto'
      });
      
      console.log('🖼️ MediaBackgrounds - Respuesta API:', response);
      
      // Extraer el array de media correctamente
      const backgroundsArray = response.data?.media || response.media || [];
      console.log('🖼️ MediaBackgrounds - Backgrounds array:', backgroundsArray);
      
      setBackgrounds(Array.isArray(backgroundsArray) ? backgroundsArray : []);
    } catch (error) {
      console.error('❌ Error cargando fondos:', error);
      setBackgrounds([]); // Asegurar que sea array vacío en caso de error
    } finally {
      setLoading(false);
    }
  };

  const updateStats = useCallback(() => {
    if (!Array.isArray(backgrounds)) {
      console.warn('⚠️ Backgrounds no es un array:', backgrounds);
      return;
    }
    
    const totalFondos = backgrounds.length;
    
    console.log('📊 Backgrounds Stats calculados:', { totalFondos });
    
    if (onStatsUpdate) {
      onStatsUpdate({
        totalFondos
      });
    }
  }, [backgrounds]); // ← REMOVER onStatsUpdate de las dependencias

  useEffect(() => {
    if (backgrounds.length >= 0) { // Solo cuando backgrounds esté cargado (incluye array vacío)
      updateStats();
    }
  }, [backgrounds.length]); // Solo depende de la longitud

  const handleFileSelect = async (files) => {
    if (!files || files.length === 0) return;

    // Prevenir múltiples uploads simultáneos
    if (uploading) {
      console.warn('⚠️ Upload ya en progreso, ignorando nueva selección');
      return;
    }

    const formData = new FormData();
    formData.append('seccion', 'fondos');
    formData.append('titulo', 'Fondos del memorial');
    formData.append('descripcion', 'Imágenes de fondo para el slideshow del memorial');

    // Filtrar solo imágenes y evitar duplicados
    const validFiles = Array.from(files).filter(file => {
      if (!file.type.startsWith('image/')) {
        console.warn('Archivo no es imagen:', file.name);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) {
      alert('No se seleccionaron imágenes válidas');
      return;
    }

    validFiles.forEach((file) => {
      formData.append('files', file); // Cambiar 'media' por 'files'
    });

    try {
      setUploading(true);
      console.log('🖼️ Iniciando upload de', validFiles.length, 'fondos');
      
      const response = await mediaService.uploadFiles(profileId, formData);

      if (response.success) {
        console.log('✅ Upload exitoso:', response);
        await loadBackgrounds();
        
        // Limpiar el input
        const fileInput = document.getElementById('file-upload-fondos');
        if (fileInput) {
          fileInput.value = '';
        }
      } else {
        throw new Error(response.message || 'Error en la subida');
      }
    } catch (error) {
      console.error('Error subiendo fondos:', error);
      alert('Error al subir los fondos: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'));
    if (files.length > 0) {
      handleFileSelect(files);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDelete = async (backgroundId) => {
    if (!window.confirm('¿Estás seguro de eliminar esta imagen de fondo?')) return;

    try {
      await mediaService.deleteMedia(backgroundId);
      await loadBackgrounds();
    } catch (error) {
      console.error('Error eliminando fondo:', error);
    }
  };

  const handleReorder = async (dragIndex, hoverIndex) => {
    try {
      const newBackgrounds = [...backgrounds];
      const dragItem = newBackgrounds[dragIndex];
      
      newBackgrounds.splice(dragIndex, 1);
      newBackgrounds.splice(hoverIndex, 0, dragItem);
      
      setBackgrounds(newBackgrounds);

      // Actualizar orden en el servidor
      const mediaIds = newBackgrounds.map(bg => bg._id);
      const orders = newBackgrounds.map((_, index) => index);

      await mediaService.reorderMedia(profileId, {
        seccion: 'fondos',
        mediaIds,
        orders
      });
    } catch (error) {
      console.error('Error reordenando fondos:', error);
      await loadBackgrounds(); // Recargar en caso de error
    }
  };

  const MemorialPreview = ({ background }) => (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="relative max-w-4xl w-full bg-white rounded-lg overflow-hidden">
        {/* Header de preview */}
        <div className="bg-gray-50 p-4 border-b">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">
              Vista Previa del Memorial
            </h3>
            <button
              onClick={() => setSelectedForPreview(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Simulación del memorial */}
        <div className="relative h-96 bg-gray-900 overflow-hidden">
          <img
            src={background.url || background.archivo?.url}
            alt="Fondo del memorial"
            className="w-full h-full object-cover filter blur-sm opacity-60"
          />
          
          {/* Overlay del memorial */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
            <div className="w-24 h-24 bg-white rounded-full mb-4 flex items-center justify-center">
              <span className="text-2xl text-gray-400">👤</span>
            </div>
            <h2 className="text-3xl font-bold mb-2">
            {selectedMemorial?.nombre} {selectedMemorial?.apellidos}
            </h2>
            <p className="text-lg italic mb-4">
              "El amor y los recuerdos nos mantienen vivos más allá del tiempo."
            </p>
            <button className="bg-white bg-opacity-20 px-6 py-2 rounded-full text-sm">
              Visita del Recuerdo
            </button>
          </div>
        </div>

        <div className="p-4 bg-gray-50">
          <p className="text-sm text-gray-600">
            Así se verá esta imagen como fondo en el memorial. El efecto blur y la opacidad se aplican automáticamente.
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">
            Fondos del Memorial
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Imágenes que se mostrarán como fondo rotativo en el memorial
          </p>
        </div>

        {/* Botón de upload */}
        <div className="relative">
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => handleFileSelect(e.target.files)}
            className="hidden"
            id="file-upload-fondos"
          />
          <label
            htmlFor="file-upload-fondos"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 cursor-pointer"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            Subir Fondos
          </label>
        </div>
      </div>

      {/* Configuración del slideshow */}
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
        <h4 className="font-medium text-orange-900 mb-3 flex items-center">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Configuración del Slideshow
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={slideshowConfig.autoPlay}
                onChange={(e) => setSlideshowConfig(prev => ({ ...prev, autoPlay: e.target.checked }))}
                className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
              />
              <span className="ml-2 text-sm text-gray-700">Reproducción automática</span>
            </label>
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Intervalo (segundos)</label>
            <select
              value={slideshowConfig.interval / 1000}
              onChange={(e) => setSlideshowConfig(prev => ({ ...prev, interval: parseInt(e.target.value) * 1000 }))}
              className="w-full border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="3">3 segundos</option>
              <option value="5">5 segundos</option>
              <option value="7">7 segundos</option>
              <option value="10">10 segundos</option>
            </select>
          </div>
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={slideshowConfig.fadeEffect}
                onChange={(e) => setSlideshowConfig(prev => ({ ...prev, fadeEffect: e.target.checked }))}
                className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
              />
              <span className="ml-2 text-sm text-gray-700">Efecto de transición</span>
            </label>
          </div>
        </div>
      </div>

      {/* Zona de drop */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragOver
            ? 'border-orange-400 bg-orange-50'
            : 'border-gray-300 hover:border-gray-400'
        } ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
      >
        <div className="space-y-4">
          <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-orange-100">
            <svg className="h-8 w-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 0h10M7 4v16m10-16v16M7 20H5a1 1 0 01-1-1V5a1 1 0 011-1h2m10 16h2a1 1 0 001-1V5a1 1 0 00-1-1h-2" />
            </svg>
          </div>
          <div>
            <h4 className="text-lg font-medium text-gray-900">
              {uploading ? 'Subiendo imágenes...' : 'Arrastra imágenes de fondo aquí'}
            </h4>
            <p className="text-gray-500">
              Solo imágenes (JPG, PNG) en alta resolución
            </p>
            <p className="text-sm text-gray-400 mt-2">
              Recomendado: 1920x1080 o superior para mejor calidad
            </p>
          </div>
        </div>
      </div>

      {/* Grid de fondos */}
      {loading ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
        </div>
      ) : backgrounds.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-900">
              Fondos Configurados ({backgrounds.length})
            </h4>
            <p className="text-sm text-gray-500">
              Arrastra para reordenar la secuencia
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {backgrounds.map((background, index) => (
              <div key={background._id} className="bg-white rounded-lg shadow-sm border overflow-hidden group">
                {/* Preview con efecto memorial */}
                <div className="aspect-video bg-gray-100 relative overflow-hidden">
                  <img
                    src={background.url || background.archivo?.url}
                    alt={background.titulo || background.archivo?.nombreOriginal || 'Fondo del memorial'}
                    className="w-full h-full object-cover filter blur-sm opacity-60"
                  />
                  
                  {/* Simulación del overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-white">
                      <div className="w-8 h-8 bg-white bg-opacity-30 rounded-full mx-auto mb-2"></div>
                      <p className="text-xs font-medium">Memorial Preview</p>
                    </div>
                  </div>

                  {/* Número de orden */}
                  <div className="absolute top-2 left-2 bg-orange-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                    {index + 1}
                  </div>

                  {/* Overlay con acciones */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 space-x-2">
                      <button
                        onClick={() => setSelectedForPreview(background)}
                        className="p-2 bg-white rounded-full text-gray-700 hover:bg-gray-100"
                        title="Vista previa del memorial"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => window.open(background.url || background.archivo?.url, '_blank')}
                        className="p-2 bg-blue-600 rounded-full text-white hover:bg-blue-700"
                        title="Ver imagen original"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(background._id)}
                        className="p-2 bg-red-600 rounded-full text-white hover:bg-red-700"
                        title="Eliminar"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Info */}
                <div className="p-3">
                  <h4 className="font-medium text-gray-900 text-sm truncate" title={background.titulo || background.archivo?.nombreOriginal}>
                    {background.titulo || background.archivo?.nombreOriginal || 'Fondo sin título'}
                  </h4>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(background.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto bg-orange-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 0h10M7 4v16m10-16v16M7 20H5a1 1 0 01-1-1V5a1 1 0 011-1h2m10 16h2a1 1 0 001-1V5a1 1 0 00-1-1h-2" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Sin fondos configurados
          </h3>
          <p className="text-gray-500">
            Sube imágenes para crear un slideshow de fondo en el memorial
          </p>
        </div>
      )}

      {/* Modal de vista previa */}
      {selectedForPreview && (
        <MemorialPreview background={selectedForPreview} />
      )}
    </div>
  );
};

export default MediaBackgrounds;
