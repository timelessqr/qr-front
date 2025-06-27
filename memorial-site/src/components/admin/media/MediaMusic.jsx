// ====================================
// src/components/admin/media/MediaMusic.jsx - Gestión de archivos MP3
// ====================================
import React, { useState, useEffect, useCallback } from 'react';
import mediaService from '../../../services/mediaService';

const MediaMusic = ({ selectedMemorial, onStatsUpdate }) => {
  const [musicTracks, setMusicTracks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [playingTrack, setPlayingTrack] = useState(null);

  const profileId = selectedMemorial?._id;

  useEffect(() => {
    if (profileId) {
      loadMusicTracks();
    }
  }, [profileId]);

  const loadMusicTracks = async () => {
    try {
      setLoading(true);
      const response = await mediaService.getByProfile(profileId, {
        seccion: 'musica'
      });
      
      console.log('🎵 MediaMusic - Respuesta API:', response);
      
      // Extraer el array de media correctamente
      const tracksArray = response.data?.media || response.media || [];
      console.log('🎵 MediaMusic - Tracks array:', tracksArray);
      
      setMusicTracks(Array.isArray(tracksArray) ? tracksArray : []);
    } catch (error) {
      console.error('❌ Error cargando música:', error);
      setMusicTracks([]);
    } finally {
      setLoading(false);
    }
  };

  const updateStats = useCallback(() => {
    if (!Array.isArray(musicTracks)) {
      console.warn('⚠️ MusicTracks no es un array:', musicTracks);
      return;
    }
    
    const totalMusica = musicTracks.length;
    
    console.log('📊 Music Stats calculados:', { totalMusica });
    
    if (onStatsUpdate) {
      onStatsUpdate({
        totalMusica
      });
    }
  }, [musicTracks]);

  useEffect(() => {
    if (musicTracks.length >= 0) {
      updateStats();
    }
  }, [musicTracks.length]);

  const handleMp3Upload = async (event) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    console.log('🎵 Archivos seleccionados:', files);

    try {
      setUploading(true);

      // Validar archivos
      const validFiles = [];
      for (let file of files) {
        if (!file.type.startsWith('audio/')) {
          alert(`${file.name} no es un archivo de audio válido`);
          continue;
        }
        if (file.size > 20 * 1024 * 1024) { // 20MB
          alert(`${file.name} excede el tamaño máximo de 20MB`);
          continue;
        }
        validFiles.push(file);
      }

      if (validFiles.length === 0) {
        alert('No hay archivos válidos para subir');
        return;
      }

      // Crear FormData usando la ruta estándar
      const formData = new FormData();
      validFiles.forEach(file => {
        formData.append('files', file);
      });
      formData.append('seccion', 'musica');
      formData.append('descripcion', 'Música del recuerdo');

      console.log('🎵 Subiendo archivos MP3 usando ruta estándar...');

      // Usar el servicio estándar de upload
      const result = await mediaService.uploadFiles(profileId, formData);

      if (result.success) {
        console.log('✅ Upload exitoso:', result);
        await loadMusicTracks(); // Recargar lista
        // Limpiar input
        event.target.value = '';
      } else {
        throw new Error(result.mensaje || 'Error subiendo archivos');
      }

    } catch (error) {
      console.error('❌ Error subiendo MP3s:', error);
      alert('Error al subir los archivos: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (trackId) => {
    if (!window.confirm('¿Estás seguro de eliminar esta canción?')) return;

    try {
      await mediaService.deleteMedia(trackId);
      await loadMusicTracks();
    } catch (error) {
      console.error('Error eliminando música:', error);
    }
  };

  const handlePlayPreview = (track) => {
    if (playingTrack === track._id) {
      setPlayingTrack(null);
    } else {
      setPlayingTrack(track._id);
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">
            Música del Recuerdo
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Sube archivos MP3 que se reproducirán en el memorial
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">
            {musicTracks.length} cancion{musicTracks.length !== 1 ? 'es' : ''}
          </span>
        </div>
      </div>

      {/* Zona de carga de archivos MP3 */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <h4 className="font-medium text-green-900 mb-4 flex items-center">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
          </svg>
          Subir Archivos MP3
        </h4>
        
        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-green-300 border-dashed rounded-md hover:border-green-400 transition-colors">
          <div className="space-y-1 text-center">
            <svg className="mx-auto h-12 w-12 text-green-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
              <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div className="flex text-sm text-gray-600">
              <label htmlFor="mp3-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-green-600 hover:text-green-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-green-500">
                <span>Seleccionar archivos MP3</span>
                <input
                  id="mp3-upload"
                  type="file"
                  multiple
                  accept="audio/*,.mp3,.wav,.ogg,.m4a"
                  onChange={handleMp3Upload}
                  disabled={uploading}
                  className="sr-only"
                />
              </label>
              <p className="pl-1">o arrastra y suelta</p>
            </div>
            <p className="text-xs text-gray-500">
              MP3, WAV, OGG, M4A hasta 20MB cada uno
            </p>
          </div>
        </div>
        
        {uploading && (
          <div className="mt-4 flex items-center justify-center text-sm text-green-600">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600 mr-2"></div>
            Subiendo archivos de audio...
          </div>
        )}

        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-blue-500 mt-0.5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-sm text-blue-700">
              <p className="font-medium mb-1">Formatos soportados:</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>MP3 (recomendado)</li>
                <li>WAV (alta calidad)</li>
                <li>OGG (código abierto)</li>
                <li>M4A (Apple)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de canciones */}
      {loading ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        </div>
      ) : musicTracks.length > 0 ? (
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">
            Canciones Configuradas ({musicTracks.length})
          </h4>
          
          <div className="space-y-3">
            {musicTracks.map((track, index) => (
              <div key={track._id} className="bg-white border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                <div className="flex items-center p-4">
                  {/* Icono de música */}
                  <div className="flex-shrink-0 w-16 h-16 bg-green-100 rounded-lg overflow-hidden mr-4 flex items-center justify-center">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                    </svg>
                  </div>

                  {/* Información de la canción */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h5 className="font-medium text-gray-900 truncate">
                          {track.titulo || track.archivo?.nombreOriginal || 'Canción sin título'}
                        </h5>
                        <p className="text-sm text-gray-500 truncate">
                          {track.descripcion || 'Música del recuerdo'}
                        </p>
                        <div className="flex items-center mt-1 space-x-4">
                          <span className="inline-flex items-center text-xs text-green-600">
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                            </svg>
                            Archivo MP3
                          </span>
                          <span className="text-xs text-gray-400">
                            Orden: {index + 1}
                          </span>
                          {track.archivo?.tamaño && (
                            <span className="text-xs text-gray-400">
                              {formatFileSize(track.archivo.tamaño)}
                            </span>
                          )}
                          {track.dimensiones?.duracion && (
                            <span className="text-xs text-gray-400">
                              {formatDuration(track.dimensiones.duracion)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Controles */}
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => handlePlayPreview(track)}
                      className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                      title="Vista previa"
                    >
                      {playingTrack === track._id ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h8m2-10v.01M6 20v.01M6 4v.01M18 4v.01M6 12V9a3 3 0 013-3h6a3 3 0 013 3v3" />
                        </svg>
                      )}
                    </button>
                    <button
                      onClick={() => handleDelete(track._id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      title="Eliminar"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Player de vista previa */}
                {playingTrack === track._id && track.archivo?.url && (
                  <div className="border-t bg-gray-50 p-4">
                    <div className="max-w-md mx-auto bg-white rounded-lg p-4">
                      <audio
                        controls
                        src={track.archivo.url}
                        className="w-full"
                        autoPlay
                      >
                        Tu navegador no soporta la reproducción de audio.
                      </audio>
                      <p className="text-xs text-gray-500 mt-2 text-center">
                        {track.archivo.nombreOriginal}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Sin música configurada
          </h3>
          <p className="text-gray-500">
            Sube archivos MP3 para crear la banda sonora del memorial
          </p>
        </div>
      )}
    </div>
  );
};

export default MediaMusic;
