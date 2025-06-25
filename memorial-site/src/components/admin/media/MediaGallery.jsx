// ====================================
// src/components/admin/media/MediaGallery.jsx - Gestión de fotografías con funcionalidad de fotoJoven
// ====================================
import React, { useState, useEffect, useCallback } from 'react';
import mediaService from '../../../services/mediaService';
import memorialService from '../../../services/memorialService';

const MediaGallery = ({ selectedMemorial, onStatsUpdate }) => {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [dragOver, setDragOver] = useState(false);
  const [currentFotoJoven, setCurrentFotoJoven] = useState(null);
  const [updatingFotoJoven, setUpdatingFotoJoven] = useState(null);

  // Obtener el profileId del memorial
  const profileId = selectedMemorial?._id;

  useEffect(() => {
    if (profileId) {
      loadPhotos();
      // Obtener la fotoJoven actual del memorial
      setCurrentFotoJoven(selectedMemorial?.fotoJoven);
    }
  }, [profileId]);

  const loadPhotos = async () => {
    try {
      setLoading(true);
      const response = await mediaService.getByProfile(profileId, {
        seccion: 'galeria',
        tipo: 'foto'
      });
      
      console.log('📸 MediaGallery - Respuesta API:', response);
      
      // Extraer el array de media correctamente
      const photosArray = response.data?.media || response.media || [];
      console.log('📸 MediaGallery - Photos array:', photosArray);
      
      setPhotos(Array.isArray(photosArray) ? photosArray : []);
    } catch (error) {
      console.error('❌ Error cargando fotos:', error);
      setPhotos([]); // Asegurar que sea array vacío en caso de error
    } finally {
      setLoading(false);
    }
  };

  const updateStats = useCallback(() => {
    if (!Array.isArray(photos)) {
      console.warn('⚠️ Photos no es un array:', photos);
      return;
    }
    
    const totalFotos = photos.length;
    
    console.log('📊 Gallery Stats calculados:', { totalFotos });
    
    if (onStatsUpdate) {
      onStatsUpdate({
        totalFotos
      });
    }
  }, [photos]); // ← REMOVER onStatsUpdate de las dependencias

  useEffect(() => {
    if (photos.length >= 0) { // Solo cuando photos esté cargado (incluye array vacío)
      updateStats();
    }
  }, [photos.length]); // Solo depende de la longitud

  const handleFileSelect = async (files) => {
    if (!files || files.length === 0) return;

    // Prevenir múltiples uploads simultáneos
    if (uploading) {
      console.warn('⚠️ Upload ya en progreso, ignorando nueva selección');
      return;
    }

    const formData = new FormData();
    formData.append('seccion', 'galeria');
    formData.append('titulo', 'Fotografías del memorial');
    formData.append('descripcion', 'Galería de fotos del memorial');

    // Validar formatos y tamaños
    const validFiles = [];
    const errors = [];
    
    Array.from(files).forEach(file => {
      // Validar formato
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(file.type.toLowerCase())) {
        errors.push(`${file.name}: Solo se permiten archivos JPG y PNG`);
        return;
      }
      
      // Validar tamaño (10MB máximo)
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

    validFiles.forEach((file, index) => {
      formData.append('files', file);
      setUploadProgress(prev => ({
        ...prev,
        [file.name]: 0
      }));
    });

    try {
      setUploading(true);
      console.log('📸 Iniciando upload de', validFiles.length, 'fotos');
      
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
        console.log('✅ Upload exitoso:', response);
        await loadPhotos();
        setUploadProgress({});
        
        // Limpiar el input para permitir subir los mismos archivos de nuevo si es necesario
        const fileInput = document.getElementById('file-upload-photos');
        if (fileInput) {
          fileInput.value = '';
        }
      } else {
        throw new Error(response.message || 'Error en la subida');
      }
    } catch (error) {
      console.error('Error subiendo fotos:', error);
      alert('Error al subir las fotos: ' + error.message);
      setUploadProgress({});
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
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

  const handleDelete = async (photoId) => {
    if (!window.confirm('¿Estás seguro de eliminar esta foto?')) return;

    try {
      await mediaService.deleteMedia(photoId);
      await loadPhotos();
      
      // Si la foto eliminada era la fotoJoven, actualizar el estado
      const deletedPhoto = photos.find(p => p._id === photoId);
      if (deletedPhoto && currentFotoJoven === deletedPhoto.url) {
        setCurrentFotoJoven(null);
      }
    } catch (error) {
      console.error('Error eliminando foto:', error);
    }
  };

  // 🔥 FUNCIONALIDAD CLAVE: Establecer como foto de biografía
  const handleSetFotoJoven = async (photo) => {
    try {
      setUpdatingFotoJoven(photo._id);
      
      // Llamar al servicio para actualizar el memorial
      const result = await memorialService.updateMemorialData(profileId, {
        fotoJoven: photo.url || photo.archivo?.url
      });
      
      // Actualizar el estado local
      setCurrentFotoJoven(photo.url || photo.archivo?.url);
      
      // Mostrar notificación de éxito
      console.log('✅ Foto de biografía actualizada:', result);
      
    } catch (error) {
      console.error('❌ Error estableciendo foto de biografía:', error);
      alert('Error al establecer la foto de biografía. Por favor, inténtalo de nuevo.');
    } finally {
      setUpdatingFotoJoven(null);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getPhotoUrl = (photo) => {
    return photo.url || photo.archivo?.url || '/img/default-photo.jpg';
  };

  const isCurrentFotoJoven = (photo) => {
    const photoUrl = getPhotoUrl(photo);
    return currentFotoJoven === photoUrl;
  };

  return (
    <div className="space-y-6">
      {/* Header con información y botón de upload */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h3 className="text-lg font-medium text-gray-900">
            Galería de Fotografías
          </h3>
          
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <span>Total: {Array.isArray(photos) ? photos.length : 0} fotos</span>
            {currentFotoJoven && (
              <span className="text-blue-600">• Foto de biografía seleccionada</span>
            )}
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
            id="file-upload-photos"
          />
          <label
            htmlFor="file-upload-photos"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 cursor-pointer"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            Subir Fotos
          </label>
        </div>
      </div>

      {/* Información especial sobre foto de biografía */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h4 className="text-sm font-medium text-blue-800">
              Foto de Biografía
            </h4>
            <p className="mt-1 text-sm text-blue-700">
              Usa el botón azul <svg className="inline w-4 h-4 mx-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg> 
              en cualquier foto para establecerla como la imagen principal que acompaña la biografía del memorial.
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
            ? 'border-red-400 bg-red-50'
            : 'border-gray-300 hover:border-gray-400'
        } ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
      >
        <div className="space-y-4">
          <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-gray-100">
            <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h4 className="text-lg font-medium text-gray-900">
              {uploading ? 'Subiendo fotografías...' : 'Arrastra fotografías aquí'}
            </h4>
            <p className="text-gray-500">
              o haz clic en "Subir Fotos" para seleccionar
            </p>
            <p className="text-sm text-gray-400 mt-2">
              Formatos soportados: JPG, PNG • Tamaño máximo: 10MB
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
                    className="bg-red-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Grid de fotografías */}
      {loading ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
        </div>
      ) : photos.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {photos.map((photo) => (
            <div key={photo._id} className="bg-white rounded-lg shadow-sm border overflow-hidden group relative">
              {/* Indicador de fotoJoven */}
              {isCurrentFotoJoven(photo) && (
                <div className="absolute top-2 left-2 z-10">
                  <div className="bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                    Foto Biografía
                  </div>
                </div>
              )}

              {/* Preview */}
              <div className="aspect-square bg-gray-100 relative">
                <img
                  src={getPhotoUrl(photo)}
                  alt={photo.titulo || photo.archivo?.nombreOriginal || 'Foto del memorial'}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = '/img/default-photo.jpg';
                  }}
                />

                {/* Overlay con acciones */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 space-x-2">
                    {/* 🔥 BOTÓN ESPECIAL: Establecer como foto de biografía */}
                    <button
                      onClick={() => handleSetFotoJoven(photo)}
                      disabled={updatingFotoJoven === photo._id || isCurrentFotoJoven(photo)}
                      className={`p-2 rounded-full text-white transition-all ${
                        isCurrentFotoJoven(photo)
                          ? 'bg-blue-600 cursor-not-allowed'
                          : 'bg-blue-500 hover:bg-blue-600'
                      }`}
                      title={isCurrentFotoJoven(photo) ? 'Esta es la foto de biografía actual' : 'Establecer como foto de biografía'}
                    >
                      {updatingFotoJoven === photo._id ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>

                    <button
                      onClick={() => window.open(getPhotoUrl(photo), '_blank')}
                      className="p-2 bg-white rounded-full text-gray-700 hover:bg-gray-100"
                      title="Ver imagen"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                    
                    <button
                      onClick={() => handleDelete(photo._id)}
                      className="p-2 bg-red-600 rounded-full text-white hover:bg-red-700"
                      title="Eliminar foto"
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
                <h4 className="font-medium text-gray-900 text-sm truncate" title={photo.titulo || photo.archivo?.nombreOriginal}>
                  {photo.titulo || photo.archivo?.nombreOriginal || 'Sin título'}
                </h4>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-gray-500">
                    {formatFileSize(photo.archivo?.tamaño || 0)}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(photo.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Sin fotografías
          </h3>
          <p className="text-gray-500">
            Sube fotografías para comenzar a crear la galería del memorial
          </p>
        </div>
      )}
    </div>
  );
};

export default MediaGallery;