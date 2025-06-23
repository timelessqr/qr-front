// ====================================
// src/components/admin/media/MediaMusic.jsx - Gestión de música del recuerdo (YouTube)
// ====================================
import React, { useState, useEffect, useCallback } from 'react';
import mediaService from '../../../services/mediaService';

const MediaMusic = ({ selectedMemorial, onStatsUpdate }) => {
  const [musicTracks, setMusicTracks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [newTrack, setNewTrack] = useState({
    youtubeUrl: '',
    titulo: '',
    descripcion: ''
  });
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
      setMusicTracks(response.data);
      updateStats();
    } catch (error) {
      console.error('Error cargando música:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStats = useCallback(() => {
    if (onStatsUpdate) {
      onStatsUpdate(prev => ({
        ...prev,
        totalMusica: musicTracks.length
      }));
    }
  }, [musicTracks, onStatsUpdate]);

  useEffect(() => {
    updateStats();
  }, [updateStats]);

  // Extraer ID de video de YouTube de diferentes formatos de URL
  const extractYouTubeId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  // Validar URL de YouTube
  const validateYouTubeUrl = (url) => {
    return extractYouTubeId(url) !== null;
  };

  // Obtener información del video de YouTube (simulado - en producción usarías la API de YouTube)
  const getYouTubeInfo = async (videoId) => {
    // En producción, aquí harías una llamada a la API de YouTube
    // Por ahora simulamos la respuesta
    return {
      title: `Video de YouTube ${videoId}`,
      thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
      duration: '3:45'
    };
  };

  const handleAddTrack = async () => {
    if (!newTrack.youtubeUrl.trim()) return;

    if (!validateYouTubeUrl(newTrack.youtubeUrl)) {
      alert('Por favor ingresa una URL válida de YouTube');
      return;
    }

    try {
      setAdding(true);
      
      const videoId = extractYouTubeId(newTrack.youtubeUrl);
      const videoInfo = await getYouTubeInfo(videoId);

      const formData = new FormData();
      formData.append('seccion', 'musica');
      formData.append('titulo', newTrack.titulo || videoInfo.title);
      formData.append('descripcion', newTrack.descripcion || 'Música del recuerdo');
      formData.append('youtubeUrl', newTrack.youtubeUrl);
      formData.append('youtubeId', videoId);
      formData.append('thumbnail', videoInfo.thumbnail);

      const response = await mediaService.addYouTubeTrack(profileId, formData);

      if (response.success) {
        await loadMusicTracks();
        setNewTrack({ youtubeUrl: '', titulo: '', descripcion: '' });
      }
    } catch (error) {
      console.error('Error agregando música:', error);
    } finally {
      setAdding(false);
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">
            Música del Recuerdo
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Agrega canciones de YouTube que se reproducirán en el memorial
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">
            {musicTracks.length} cancion{musicTracks.length !== 1 ? 'es' : ''}
          </span>
        </div>
      </div>

      {/* Formulario para agregar nueva canción */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h4 className="font-medium text-red-900 mb-4 flex items-center">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Agregar Nueva Canción
        </h4>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL de YouTube *
            </label>
            <div className="flex space-x-2">
              <input
                type="url"
                value={newTrack.youtubeUrl}
                onChange={(e) => setNewTrack(prev => ({ ...prev, youtubeUrl: e.target.value }))}
                placeholder="https://www.youtube.com/watch?v=..."
                className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
              <button
                onClick={handleAddTrack}
                disabled={adding || !newTrack.youtubeUrl.trim()}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {adding ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Agregar
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Título personalizado (opcional)
              </label>
              <input
                type="text"
                value={newTrack.titulo}
                onChange={(e) => setNewTrack(prev => ({ ...prev, titulo: e.target.value }))}
                placeholder="Se extraerá automáticamente de YouTube"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción (opcional)
              </label>
              <input
                type="text"
                value={newTrack.descripcion}
                onChange={(e) => setNewTrack(prev => ({ ...prev, descripcion: e.target.value }))}
                placeholder="Ej: Su canción favorita"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>
          </div>
        </div>

        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-blue-500 mt-0.5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-sm text-blue-700">
              <p className="font-medium mb-1">Formatos de URL soportados:</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>https://www.youtube.com/watch?v=VIDEO_ID</li>
                <li>https://youtu.be/VIDEO_ID</li>
                <li>https://www.youtube.com/embed/VIDEO_ID</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de canciones */}
      {loading ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
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
                  {/* Thumbnail */}
                  <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded-lg overflow-hidden mr-4">
                    {track.thumbnail ? (
                      <img
                        src={track.thumbnail}
                        alt="Thumbnail"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Información de la canción */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h5 className="font-medium text-gray-900 truncate">
                          {track.titulo || track.nombreOriginal}
                        </h5>
                        <p className="text-sm text-gray-500 truncate">
                          {track.descripcion || 'Música del recuerdo'}
                        </p>
                        <div className="flex items-center mt-1 space-x-4">
                          <span className="inline-flex items-center text-xs text-gray-400">
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                            YouTube
                          </span>
                          <span className="text-xs text-gray-400">
                            Orden: {index + 1}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Controles */}
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => handlePlayPreview(track)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
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
                      onClick={() => window.open(track.youtubeUrl || `https://www.youtube.com/watch?v=${track.youtubeId}`, '_blank')}
                      className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                      title="Abrir en YouTube"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
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

                {/* Player embed si está siendo reproducido */}
                {playingTrack === track._id && track.youtubeId && (
                  <div className="border-t bg-gray-50 p-4">
                    <div className="aspect-video max-w-md mx-auto">
                      <iframe
                        width="100%"
                        height="100%"
                        src={`https://www.youtube.com/embed/${track.youtubeId}?autoplay=1`}
                        title={track.titulo}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="rounded-lg"
                      ></iframe>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Sin música configurada
          </h3>
          <p className="text-gray-500">
            Agrega canciones de YouTube para crear la banda sonora del memorial
          </p>
        </div>
      )}
    </div>
  );
};

export default MediaMusic;
