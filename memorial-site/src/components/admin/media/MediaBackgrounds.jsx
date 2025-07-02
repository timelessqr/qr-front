// ====================================
// src/components/admin/media/MediaBackgrounds.jsx - Gestión de imágenes de fondo del memorial
// ====================================
import React, { useState, useEffect, useCallback } from 'react';
import mediaService from '../../../services/mediaService';

const MediaBackgrounds = ({ selectedMemorial, onStatsUpdate }) => {
  const [backgrounds, setBackgrounds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [dragOver, setDragOver] = useState(false);
  const [selectedForPreview, setSelectedForPreview] = useState(null);

  // Obtener el profileId del memorial
  const profileId = selectedMemorial?._id;

  useEffect(() => {
    if (profileId) {
      loadBackgrounds();
    }
  }, [profileId]);

  const loadBackgrounds = async () => {
    try {
      setLoading(true);
      // DEBUG: Mostrar qué estamos pidiendo
      console.log('🖼️ MediaBackgrounds - Pidiendo fondos para profileId:', profileId);
      console.log('🖼️ MediaBackgrounds - Filtros:', { seccion: 'fondos', tipo: 'foto' });
      
      const response = await mediaService.getByProfile(profileId, {
        seccion: 'fondos',
        tipo: 'foto'
      });
      
      console.log('🖼️ MediaBackgrounds - Respuesta API completa:', response);
      
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

    // Validar formatos y tamaños
    const validFiles = [];
    const errors = [];
    
    Array.from(files).forEach(file => {
      // Validar formato - solo imágenes
      if (!file.type.startsWith('image/')) {
        errors.push(`${file.name}: Solo se permiten imágenes (JPG, PNG, GIF, WebP)`);
        return;
      }
      
      // Validar tamaño (10MB máximo para fondos)
      const maxSize = 10 * 1024 * 1024; // 10MB en bytes
      if (file.size > maxSize) {
        errors.push(`${file.name}: Excede el tamaño máximo (10MB)`);
        return;
      }
      
      validFiles.push(file);
    });

    if (errors.length > 0) {
      alert('Errores encontrados:\n' + errors.join('\n'));
      return;
    }

    if (validFiles.length === 0) {
      alert('No se seleccionaron archivos válidos');
      return;
    }

    // Límite de 5 fondos máximo
    if (backgrounds.length + validFiles.length > 5) {
      alert(`Solo se permiten máximo 5 fondos. Actualmente tienes ${backgrounds.length}. Puedes subir solo ${5 - backgrounds.length} más.`);
      return;
    }

    validFiles.forEach((file, index) => {
      formData.append('files', file);
      setUploadProgress(prev => ({
        ...prev,
        [file.name]: 0
      }));
    });

    try {
      setUploading(true);
      console.log('🖼️ Iniciando upload de', validFiles.length, 'fondos a Cloudinary');
      console.log('🖼️ FormData seccion:', formData.get('seccion'));
      console.log('🖼️ FormData titulo:', formData.get('titulo'));
      
      const response = await mediaService.uploadFiles(profileId, formData, (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        // Actualizar progreso para todos los archivos
        validFiles.forEach(file => {
          setUploadProgress(prev => ({
            ...prev,
            [file.name]: percentCompleted
          }));
        });
      });

      if (response.success) {
        console.log('✅ Upload exitoso a Cloudinary:', response);
        await loadBackgrounds();
        setUploadProgress({});
        
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
      setUploadProgress({});
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
    console.log('🔍 Debug background object:', backgroundId); // Debug completo
    
    if (!backgroundId) {
      console.error('❌ Error: backgroundId es undefined');
      alert('Error: No se puede eliminar el fondo (ID no válido)');
      return;
    }
    
    if (!window.confirm('¿Estás seguro de eliminar esta imagen de fondo?')) return;

    try {
      console.log('🗑️ Eliminando fondo ID:', backgroundId);
      
      // Eliminar de Cloudinary y base de datos
      await mediaService.deleteMedia(backgroundId);
      console.log('✅ Fondo eliminado de Cloudinary y base de datos');
      
      // Recargar la lista de fondos
      await loadBackgrounds();
      
    } catch (error) {
      console.error('Error eliminando fondo:', error);
      alert('Error al eliminar el fondo: ' + error.message);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getBackgroundUrl = (background) => {
    return background.url || background.archivo?.url || '';
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
            src={getBackgroundUrl(background)}
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
      {/* Header con información y botón de upload */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h3 className="text-lg font-medium text-gray-900">
            Fondos del Memorial
          </h3>
          
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <span>Total: {Array.isArray(backgrounds) ? backgrounds.length : 0}/5 fondos</span>
          </div>
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
            disabled={backgrounds.length >= 5}
          />
          <label
            htmlFor="file-upload-fondos"
            className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white ${
              backgrounds.length >= 5 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-orange-600 hover:bg-orange-700 cursor-pointer'
            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500`}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            {backgrounds.length >= 5 ? 'Límite alcanzado' : 'Subir Fondos'}
          </label>
        </div>
      </div>

      {/* Información sobre formatos actualizada */}
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.667-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h4 className="text-sm font-medium text-orange-800">
              Límites para Fondos - Cloudinary
            </h4>
            <p className="mt-1 text-sm text-orange-700">
              Máximo: 5 fondos • Tamaño máximo: 10MB cada uno • Formatos: JPG, PNG, GIF, WebP • Recomendado: 1920x1080 o superior
            </p>
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
        } ${uploading || backgrounds.length >= 5 ? 'opacity-50 pointer-events-none' : ''}`}
      >
        <div className="space-y-4">
          <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-orange-100">
            <svg className="h-8 w-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h4 className="text-lg font-medium text-gray-900">
              {uploading ? 'Subiendo fondos a Cloudinary...' : 
               backgrounds.length >= 5 ? 'Límite de fondos alcanzado' :
               'Arrastra imágenes de fondo aquí'}
            </h4>
            <p className="text-gray-500">
              {backgrounds.length >= 5 ? 'Elimina fondos existentes para subir nuevos' : 
               'o haz clic en "Subir Fondos" para seleccionar'}
            </p>
            <p className="text-sm text-gray-400 mt-2">
              JPG, PNG, GIF, WebP • Máx. 10MB • Rotación aleatoria automática
            </p>
          </div>
        </div>

        {/* Progreso de subida */}
        {Object.keys(uploadProgress).length > 0 && (
          <div className="mt-4 space-y-2">
            {Object.entries(uploadProgress).map(([filename, progress]) => (
              <div key={filename} className="bg-white rounded-lg p-3 shadow-sm">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">{filename}</span>
                  <span className="text-sm text-gray-500">{progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-orange-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        )}
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
              Fondos Configurados ({backgrounds.length}/5)
            </h4>
            <p className="text-sm text-gray-500">
              Slideshow automático con rotación aleatoria
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {backgrounds.map((background, index) => (
              <div key={background._id} className="bg-white rounded-lg shadow-sm border overflow-hidden group">
                {/* Preview con efecto memorial */}
                <div className="aspect-video bg-gray-100 relative overflow-hidden">
                  <img
                    src={getBackgroundUrl(background)}
                    alt={background.titulo || background.archivo?.nombreOriginal || 'Fondo del memorial'}
                    className="w-full h-full object-cover filter blur-sm opacity-60"
                    onError={(e) => {
                      console.error('Error cargando imagen:', e);
                      // Si falla la imagen, mostrar emoji
                      e.target.style.display = 'none';
                      if (!e.target.nextElementSibling || !e.target.nextElementSibling.classList.contains('emoji-fallback')) {
                        const emojiDiv = document.createElement('div');
                        emojiDiv.className = 'emoji-fallback w-full h-full flex items-center justify-center text-4xl bg-gray-300 text-gray-600';
                        emojiDiv.textContent = '🖼️';
                        e.target.parentNode.appendChild(emojiDiv);
                      }
                    }}
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
                        className="p-3 bg-white rounded-full text-gray-700 hover:bg-gray-100 transition-colors"
                        title="Vista previa del memorial"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => window.open(getBackgroundUrl(background), '_blank')}
                        className="p-3 bg-blue-600 rounded-full text-white hover:bg-blue-700 transition-colors"
                        title="Ver imagen original"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </button>
                      <button
                        onClick={() => {
                          console.log('🔍 Debug background completo:', background);
                          console.log('🔍 Background._id:', background._id);
                          console.log('🔍 Background.id:', background.id);
                          handleDelete(background._id || background.id);
                        }}
                        className="p-3 bg-red-600 rounded-full text-white hover:bg-red-700 transition-colors"
                        title="Eliminar fondo"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Info del fondo */}
                <div className="p-4">
                  <h4 className="font-medium text-gray-900 text-sm mb-2 line-clamp-2" title={background.titulo || background.archivo?.nombreOriginal}>
                    {background.titulo || background.archivo?.nombreOriginal || 'Fondo sin título'}
                  </h4>
                  
                  <div className="space-y-2 text-xs text-gray-500">
                    <div className="flex items-center justify-between">
                      <span>Tamaño:</span>
                      <span>{formatFileSize(background.archivo?.tamaño || 0)}</span>
                    </div>
                    
                    {background.dimensiones?.ancho && background.dimensiones?.alto && (
                      <div className="flex items-center justify-between">
                        <span>Resolución:</span>
                        <span>{background.dimensiones.ancho}x{background.dimensiones.alto}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <span>Subido:</span>
                      <span>{new Date(background.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {background.descripcion && background.descripcion !== 'Imágenes de fondo para el slideshow del memorial' && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <p className="text-xs text-gray-600 line-clamp-2">
                        {background.descripcion}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto bg-orange-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
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