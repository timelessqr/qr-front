// ====================================
// src/components/admin/media/MediaVideos.jsx - Gestión de videos del memorial
// ====================================
import React, { useState, useEffect, useCallback } from 'react';
import mediaService from '../../../services/mediaService';

const MediaVideos = ({ selectedMemorial, onStatsUpdate }) => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [dragOver, setDragOver] = useState(false);

  // Obtener el profileId del memorial
  const profileId = selectedMemorial?._id;

  useEffect(() => {
    if (profileId) {
      loadVideos();
    }
  }, [profileId]);

  const loadVideos = async () => {
    try {
      setLoading(true);
      const response = await mediaService.getByProfile(profileId, {
        seccion: 'galeria',
        tipo: 'video'
      });
      
      console.log('🎥 MediaVideos - Respuesta API:', response);
      
      // Extraer el array de media correctamente
      const videosArray = response.data?.media || response.media || [];
      console.log('🎥 MediaVideos - Videos array:', videosArray);
      
      setVideos(Array.isArray(videosArray) ? videosArray : []);
    } catch (error) {
      console.error('❌ Error cargando videos:', error);
      setVideos([]); // Asegurar que sea array vacío en caso de error
    } finally {
      setLoading(false);
    }
  };

  const updateStats = useCallback(() => {
    if (!Array.isArray(videos)) {
      console.warn('⚠️ Videos no es un array:', videos);
      return;
    }
    
    const totalVideos = videos.length;
    
    console.log('📊 Videos Stats calculados:', { totalVideos });
    
    if (onStatsUpdate) {
      onStatsUpdate({
        totalVideos
      });
    }
  }, [videos, onStatsUpdate]);

  useEffect(() => {
    if (videos.length >= 0) { // Solo cuando videos esté cargado (incluye array vacío)
      updateStats();
    }
  }, [videos.length]); // Solo depende de la longitud

  const handleFileSelect = async (files) => {
    if (!files || files.length === 0) return;

    // Prevenir múltiples uploads simultáneos
    if (uploading) {
      console.warn('⚠️ Upload ya en progreso, ignorando nueva selección');
      return;
    }

    const formData = new FormData();
    formData.append('seccion', 'galeria');
    formData.append('titulo', 'Videos del memorial');
    formData.append('descripcion', 'Videos conmemorativos del memorial');

    // Filtrar solo videos y evitar duplicados
    const validFiles = Array.from(files).filter(file => {
      if (!file.type.startsWith('video/')) {
        console.warn('Archivo no es video:', file.name);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) {
      alert('No se seleccionaron videos válidos');
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
      console.log('🎥 Iniciando upload de', validFiles.length, 'videos');
      
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
        await loadVideos();
        setUploadProgress({});
        
        // Limpiar el input
        const fileInput = document.getElementById('file-upload-videos');
        if (fileInput) {
          fileInput.value = '';
        }
      } else {
        throw new Error(response.message || 'Error en la subida');
      }
    } catch (error) {
      console.error('Error subiendo videos:', error);
      alert('Error al subir los videos: ' + error.message);
      setUploadProgress({});
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('video/'));
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

  const handleDelete = async (videoId) => {
    if (!window.confirm('¿Estás seguro de eliminar este video?')) return;

    try {
      await mediaService.deleteMedia(videoId);
      await loadVideos();
    } catch (error) {
      console.error('Error eliminando video:', error);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (seconds) => {
    if (!seconds) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getVideoUrl = (video) => {
    return video.url || video.archivo?.url || '';
  };

  return (
    <div className="space-y-6">
      {/* Header con información y botón de upload */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h3 className="text-lg font-medium text-gray-900">
            Videos del Memorial
          </h3>
          
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <span>Total: {Array.isArray(videos) ? videos.length : 0} videos</span>
          </div>
        </div>

        {/* Botón de upload */}
        <div className="relative">
          <input
            type="file"
            multiple
            accept="video/*"
            onChange={(e) => handleFileSelect(e.target.files)}
            className="hidden"
            id="file-upload-videos"
          />
          <label
            htmlFor="file-upload-videos"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 cursor-pointer"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            Subir Videos
          </label>
        </div>
      </div>

      {/* Información sobre formatos */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h4 className="text-sm font-medium text-amber-800">
              Consideraciones para Videos
            </h4>
            <p className="mt-1 text-sm text-amber-700">
              Los videos pueden tardar más en procesarse. Formatos recomendados: MP4, MOV, AVI. 
              Tamaño máximo: 100MB por archivo.
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
            ? 'border-green-400 bg-green-50'
            : 'border-gray-300 hover:border-gray-400'
        } ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
      >
        <div className="space-y-4">
          <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-gray-100">
            <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h4 className="text-lg font-medium text-gray-900">
              {uploading ? 'Subiendo videos...' : 'Arrastra videos aquí'}
            </h4>
            <p className="text-gray-500">
              o haz clic en "Subir Videos" para seleccionar
            </p>
            <p className="text-sm text-gray-400 mt-2">
              Formatos soportados: MP4, MOV, AVI, WMV (máx. 100MB)
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
                    className="bg-green-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Grid de videos */}
      {loading ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        </div>
      ) : videos.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video) => (
            <div key={video._id} className="bg-white rounded-lg shadow-sm border overflow-hidden group">
              {/* Preview del video */}
              <div className="aspect-video bg-gray-100 relative">
                <video
                  src={getVideoUrl(video)}
                  controls
                  className="w-full h-full object-cover"
                  preload="metadata"
                  onError={(e) => {
                    console.error('Error cargando video:', e);
                  }}
                >
                  <div className="w-full h-full flex items-center justify-center bg-gray-800">
                    <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                </video>

                {/* Overlay con acciones */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => window.open(getVideoUrl(video), '_blank')}
                      className="p-2 bg-white rounded-full text-gray-700 hover:bg-gray-100 shadow-lg"
                      title="Abrir video en nueva pestaña"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </button>
                    
                    <button
                      onClick={() => handleDelete(video._id)}
                      className="p-2 bg-red-600 rounded-full text-white hover:bg-red-700 shadow-lg"
                      title="Eliminar video"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Badge de duración */}
                {video.dimensiones?.duracion && (
                  <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs">
                    {formatDuration(video.dimensiones.duracion)}
                  </div>
                )}
              </div>

              {/* Info del video */}
              <div className="p-4">
                <h4 className="font-medium text-gray-900 text-sm mb-2 line-clamp-2" title={video.titulo || video.archivo?.nombreOriginal}>
                  {video.titulo || video.archivo?.nombreOriginal || 'Video sin título'}
                </h4>
                
                <div className="space-y-2 text-xs text-gray-500">
                  <div className="flex items-center justify-between">
                    <span>Tamaño:</span>
                    <span>{formatFileSize(video.archivo?.tamaño || 0)}</span>
                  </div>
                  
                  {video.dimensiones?.ancho && video.dimensiones?.alto && (
                    <div className="flex items-center justify-between">
                      <span>Resolución:</span>
                      <span>{video.dimensiones.ancho}x{video.dimensiones.alto}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <span>Subido:</span>
                    <span>{new Date(video.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {video.descripcion && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-xs text-gray-600 line-clamp-2">
                      {video.descripcion}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Sin videos
          </h3>
          <p className="text-gray-500">
            Sube videos para crear una colección multimedia del memorial
          </p>
        </div>
      )}
    </div>
  );
};

export default MediaVideos;