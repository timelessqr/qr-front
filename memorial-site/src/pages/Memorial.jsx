// ====================================
// src/pages/Memorial.jsx - Página pública del memorial
// ====================================
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

// Importar componentes existentes
import Footer from '../components/Footer';
import ProfileHeader from '../components/ProfileHeader';
import TabsNavigation from '../components/TabsNavigation';
import Historia from '../components/Historia';
import Contenido from '../components/Contenido';
import Comentarios from '../components/Comentarios';
import MusicPlayer from '../components/MusicPlayer';
import MiniPlayer from '../components/MiniPlayer';

// Importar servicios
import memorialService from '../services/memorialService';
import mediaService from '../services/mediaService';

const Memorial = () => {
  const { qrCode } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("historia");
  const [memorialData, setMemorialData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Estados para el reproductor de música
  const [showMusicPlayer, setShowMusicPlayer] = useState(false);
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [musicTracks, setMusicTracks] = useState([]);
  const [musicLoading, setMusicLoading] = useState(false);
  const audioRef = useRef(new Audio());

  // Cargar datos reales del memorial
  useEffect(() => {
    const loadMemorialData = async () => {
      if (!qrCode) {
        setError('Código QR no válido');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');
        
        console.log('🔍 Memorial - Cargando datos para QR:', qrCode);
        
        // Llamar a la API pública para obtener el memorial
        const response = await memorialService.getPublicMemorial(qrCode);
        console.log('📊 Memorial - Respuesta de la API:', response);
        
        if (response && response.memorial) {
          console.log('✅ Memorial - Datos cargados correctamente:', response.memorial);
          setMemorialData(response);
          
          // Aplicar CSS personalizado si existe
          if (response.memorial.dashboard) {
            applyDashboardCSS(response.memorial.dashboard);
          }
          
          // Cargar música del memorial
          loadMusicTracks(response.memorial.id);
        } else {
          throw new Error('Memorial no encontrado o inactivo');
        }
        
      } catch (error) {
        console.error('❌ Error cargando memorial:', error);
        setError(error.message || 'Error al cargar el memorial');
      } finally {
        setLoading(false);
      }
    };

    loadMemorialData();

    // Event listeners para el audio
    const audio = audioRef.current;
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [qrCode]);

  // Cargar música del memorial
  const loadMusicTracks = async (profileId) => {
    try {
      setMusicLoading(true);
      
      const response = await mediaService.getPublicMedia(profileId, 'musica');
      
      // Extraer el array de media correctamente
      const tracksArray = response.data?.media || response.media || [];
      
      console.log('🎵 Memorial - Tracks cargados:', tracksArray);
      
      // Formatear tracks para el reproductor (solo MP3s)
      const formattedTracks = tracksArray.map(track => {
        console.log('🎵 Procesando track MP3:', {
          id: track.id || track._id,
          tipo: track.tipo,
          url: track.url,
          archivo: track.archivo
        });
        
        return {
          id: track.id || track._id,
          title: track.titulo || 'Canción sin título',
          url: track.url, // URL directa del archivo
          tipo: track.tipo,
          description: track.descripcion || '',
          archivo: track.archivo,
          dimensiones: track.dimensiones,
          duracion: track.dimensiones?.duracion,
          tamaño: track.archivo?.tamaño
        };
      });
      
      console.log('🎵 Memorial - Tracks formateados:', formattedTracks);
      setMusicTracks(formattedTracks);
      
    } catch (error) {
      console.error('❌ Error cargando música:', error);
      setMusicTracks([]);
    } finally {
      setMusicLoading(false);
    }
  };

  const handleMusicButtonClick = () => {
    setShowMusicPlayer(true);
  };

  const handleCloseMusicPlayer = () => {
    setShowMusicPlayer(false);
  };

  const handleSelectSong = (song) => {
    console.log('🎵 Memorial - Seleccionando canción MP3:', song);
    console.log('🎵 Memorial - URL disponible:', song.url);
    console.log('🎵 Memorial - Tipo de URL:', typeof song.url);
    console.log('🎵 Memorial - URL vacía?:', !song.url);
    
    setCurrentSong(song);
    
    // Solo manejar archivos MP3
    if (song.url) {
      console.log('✅ Memorial - URL válida, reproduciendo MP3:', song.url);
      audioRef.current.src = song.url;
      audioRef.current.play().then(() => {
        console.log('✅ MP3 iniciado correctamente');
        setIsPlaying(true);
      }).catch((error) => {
        console.error('❌ Error reproduciendo MP3:', error);
        console.error('❌ Error completo:', {
          message: error.message,
          name: error.name,
          code: error.code
        });
        alert('Error al reproducir el archivo de audio: ' + error.message);
      });
    } else {
      console.warn('⚠️ URL de audio faltante');
      console.log('🔍 Debug objeto song completo:', song);
      console.log('🔍 Debug keys del objeto:', Object.keys(song));
      alert('No se puede reproducir este archivo de audio');
    }
    
    setShowMusicPlayer(false);
  };

  const handleTogglePlay = () => {
    if (!currentSong) return;
    
    console.log('🎵 Memorial - Toggle play MP3:', { isPlaying });
    
    if (isPlaying) {
      audioRef.current.pause();
      console.log('⏸️ MP3 pausado');
    } else {
      audioRef.current.play().then(() => {
        console.log('▶️ MP3 reanudado');
      }).catch((error) => {
        console.error('❌ Error reanudando MP3:', error);
      });
    }
  };

  const handleStopMusic = () => {
    console.log('🚪 Memorial - Deteniendo música MP3:', currentSong);
    
    // Limpiar audio MP3
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.src = '';
      console.log('⏹️ Audio MP3 detenido y limpiado');
    }
    
    setCurrentSong(null);
    setIsPlaying(false);
    console.log('✅ Música completamente detenida');
  };

  const applyDashboardCSS = (dashboard) => {
    let styleElement = document.getElementById('memorial-styles');
    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = 'memorial-styles';
      document.head.appendChild(styleElement);
    }
    
    styleElement.innerHTML = dashboard.css || '';
    
    // Aplicar variables CSS para colores personalizados
    if (dashboard.colorPrimario) {
      document.documentElement.style.setProperty('--color-primary', dashboard.colorPrimario);
    }
    if (dashboard.colorSecundario) {
      document.documentElement.style.setProperty('--color-secondary', dashboard.colorSecundario);
    }
    if (dashboard.colorAccento) {
      document.documentElement.style.setProperty('--color-accent', dashboard.colorAccento);
    }
  };

  const renderTabContent = () => {
    if (!memorialData) return null;

    switch (activeTab) {
      case "historia":
        return <Historia memorialData={memorialData.memorial} />;
      case "contenido":
        return <Contenido memorialData={memorialData.memorial} />;
      case "comentarios":
        return (
          <Comentarios 
            qrCode={qrCode}
            comentarios={memorialData.comentarios || []}
            configuracion={memorialData.configuracionComentarios}
          />
        );
      default:
        return <Historia memorialData={memorialData.memorial} />;
    }
  };

  // Estados de carga
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Cargando memorial...</p>
          <p className="text-gray-400 text-sm mt-2">Obteniendo datos del servidor</p>
        </div>
      </div>
    );
  }

  if (error || !memorialData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="mx-auto h-16 w-16 text-red-500 mb-4">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Memorial no encontrado
          </h3>
          <p className="text-gray-600 mb-6">
            {error || 'El código QR no corresponde a ningún memorial activo.'}
          </p>
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Volver al inicio
          </button>
          
          {/* Información de debug en desarrollo */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-6 p-4 bg-gray-100 rounded-lg text-left">
              <h4 className="font-medium text-gray-900 mb-2">Debug Info:</h4>
              <p className="text-sm text-gray-600">QR Code: {qrCode}</p>
              <p className="text-sm text-gray-600">Error: {error}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  const memorial = memorialData.memorial;
  const theme = memorial.dashboard?.tema || 'clasico';

  return (
    <div className={`min-h-screen flex flex-col memorial theme-${theme}`}>
      {/* Header con fondos dinámicos */}
      <ProfileHeader 
        memorialData={memorial} 
        onMusicButtonClick={handleMusicButtonClick}
        musicTracks={musicTracks}
      />
      
      {/* Navegación de pestañas */}
      <TabsNavigation 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        secciones={memorial.dashboard?.secciones || ['historia', 'contenido', 'comentarios']}
      />
      
      {/* Contenido dinámico según la pestaña seleccionada */}
      <div className="flex-grow container mx-auto px-4 py-8">
        {renderTabContent()}
      </div>
      
      <Footer />

      {/* Reproductor de música */}
      {showMusicPlayer && (
        <MusicPlayer 
          songs={musicTracks}
          onClose={handleCloseMusicPlayer}
          onSelectSong={handleSelectSong}
          loading={musicLoading}
        />
      )}

      {/* Mini reproductor */}
      {currentSong && (
        <MiniPlayer 
          song={currentSong}
          onStop={handleStopMusic}
          onTogglePlay={handleTogglePlay}
          isPlaying={isPlaying}
        />
      )}

      {/* Información de estado en desarrollo */}
      {process.env.NODE_ENV === 'development' && false && ( // Deshabilitado temporalmente
        <div className="fixed bottom-4 left-4 bg-black/80 text-white text-xs p-2 rounded-lg max-w-xs">
          <p><strong>Memorial ID:</strong> {memorial._id}</p>
          <p><strong>QR Code:</strong> {qrCode}</p>
          <p><strong>Tema:</strong> {theme}</p>
          <p><strong>Fondos:</strong> Dinámicos</p>
        </div>
      )}
    </div>
  );
};

export default Memorial;