// ====================================
// src/components/admin/media/MediaGallery.jsx - Gestión de galería de fotos y videos
// ====================================
import React, { useState, useEffect, useCallback } from 'react';
import mediaService from '../../../services/mediaService';

const MediaGallery = ({ selectedMemorial, onStatsUpdate }) => {
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [filter, setFilter] = useState('todos');
  const [dragOver, setDragOver] = useState(false);

  // Obtener el profileId del memorial
  const profileId = selectedMemorial?._id;

  useEffect(() => {
    if (profileId) {
      loadMedia();
    }
  }, [profileId]);

  const loadMedia = async () => {
    try {
      setLoading(true);
      const response = await mediaService.getByProfile(profileId, {
        seccion: 'galeria'
      });
      
      console.log('🖼️ MediaGallery - Respuesta API:', response);
      
      // Extraer el array de media correctamente
      const mediaArray = response.data?.media || response.media || [];
      console.log('🖼️ MediaGallery - Media array:', mediaArray);
      
      setMedia(Array.isArray(mediaArray) ? mediaArray : []);
    } catch (error) {
      console.error('❌ Error cargando media:', error);
      setMedia([]); // Asegurar que sea array vacío en caso de error
    } finally {
      setLoading(false);
    }
  };

  const updateStats = useCallback(() => {
    if (!Array.isArray(media)) {
      console.warn('⚠️ Media no es un array:', media);
      return;
    }
    
    const fotos = media.filter(m => m.tipo === 'foto' || m.tipo === 'imagen').length;
    const videos = media.filter(m => m.tipo === 'video').length;
    
    console.log('📊 Stats calculados:', { media: media.length, fotos, videos });
    
    if (onStatsUpdate) {
      onStatsUpdate({
        totalMedia: media.length,
        totalFotos: fotos,
        totalVideos: videos,
        totalFondos: 0, // Se actualizará desde otros componentes
        totalMusica: 0  // Se actualizará desde otros componentes
      });
    }
  }, [media, onStatsUpdate]);

  useEffect(() => {
    if (media.length >= 0) { // Solo cuando media esté cargado (incluye array vacío)
      updateStats();
    }
  }, [media.length]); // Solo depende de la longitud, no de updateStats para evitar loops

  const handleFileSelect = async (files) => {
    if (!files || files.length === 0) return;

    const formData = new FormData();
    formData.append('seccion', 'galeria');
    formData.append('titulo', 'Galería de fotos y videos');
    formData.append('descripcion', 'Contenido multimedia del memorial');

    Array.from(files).forEach((file, index) => {
      formData.append('files', file); // Cambiar 'media' por 'files' que es lo que espera el backend
      setUploadProgress(prev => ({
        ...prev,
        [file.name]: 0
      }));
    });

    try {
      setUploading(true);
      
      const response = await mediaService.uploadFiles(profileId, formData, (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        // Aquí podrías actualizar el progreso específico de cada archivo
      });

      if (response.success) {
        await loadMedia();
        setUploadProgress({});
        // Mostrar notificación de éxito
      }
    } catch (error) {
      console.error('Error subiendo archivos:', error);
      setUploadProgress({});
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    handleFileSelect(files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDelete = async (mediaId) => {
    if (!window.confirm('¿Estás seguro de eliminar este archivo?')) return;

    try {
      await mediaService.deleteMedia(mediaId);
      await loadMedia();
    } catch (error) {
      console.error('Error eliminando media:', error);
    }
  };

  const filteredMedia = Array.isArray(media) ? media.filter(item => {
    if (filter === 'todos') return true;
    if (filter === 'fotos') return item.tipo === 'foto' || item.tipo === 'imagen';
    if (filter === 'videos') return item.tipo === 'video';
    return true;
  }) : [];

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Header con filtros y upload */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h3 className="text-lg font-medium text-gray-900">
            Galería de Fotos y Videos
          </h3>
          
          {/* Filtros */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setFilter('todos')}
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                filter === 'todos'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Todos ({Array.isArray(media) ? media.length : 0})
            </button>
            <button
              onClick={() => setFilter('fotos')}
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                filter === 'fotos'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Fotos ({Array.isArray(media) ? media.filter(m => m.tipo === 'foto' || m.tipo === 'imagen').length : 0})
            </button>
            <button
              onClick={() => setFilter('videos')}
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                filter === 'videos'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Videos ({Array.isArray(media) ? media.filter(m => m.tipo === 'video').length : 0})
            </button>
          </div>
        </div>

        {/* Botón de upload */}
        <div className="relative">
          <input
            type="file"
            multiple
            accept="image/*,video/*"
            onChange={(e) => handleFileSelect(e.target.files)}
            className="hidden"
            id="file-upload-galeria"
          />
          <label
            htmlFor="file-upload-galeria"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 cursor-pointer"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            Subir Archivos
          </label>
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <div>
            <h4 className="text-lg font-medium text-gray-900">
              {uploading ? 'Subiendo archivos...' : 'Arrastra archivos aquí'}
            </h4>
            <p className="text-gray-500">
              o haz clic en "Subir Archivos" para seleccionar
            </p>
            <p className="text-sm text-gray-400 mt-2">
              Formatos soportados: JPG, PNG, MP4, MOV (máx. 100MB)
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

      {/* Grid de media */}
      {loading ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
        </div>
      ) : filteredMedia.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredMedia.map((item) => (
            <div key={item._id} className="bg-white rounded-lg shadow-sm border overflow-hidden group">
              {/* Preview */}
              <div className="aspect-square bg-gray-100 relative">
                {item.tipo === 'imagen' ? (
                  <img
                    src={item.url}
                    alt={item.nombreOriginal}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-800">
                    <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}

                {/* Overlay con acciones */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 space-x-2">
                    <button
                      onClick={() => window.open(item.url, '_blank')}
                      className="p-2 bg-white rounded-full text-gray-700 hover:bg-gray-100"
                      title="Ver archivo"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(item._id)}
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
                <h4 className="font-medium text-gray-900 text-sm truncate" title={item.nombreOriginal}>
                  {item.nombreOriginal}
                </h4>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-gray-500 capitalize">
                    {item.tipo}
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatFileSize(item.size)}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(item.createdAt).toLocaleDateString()}
                </p>
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
            Sin archivos multimedia
          </h3>
          <p className="text-gray-500">
            Sube fotos y videos para comenzar a crear la galería del memorial
          </p>
        </div>
      )}
    </div>
  );
};

export default MediaGallery;
