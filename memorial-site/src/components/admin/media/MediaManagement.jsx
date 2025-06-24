// ====================================
// src/components/admin/media/MediaManagement.jsx - Panel principal de gestión de medios
// ====================================
import React, { useState, useEffect } from 'react';
import MediaPhotos from './MediaPhotos';
import MediaVideos from './MediaVideos';
import MediaBackgrounds from './MediaBackgrounds';
import MediaMusic from './MediaMusic';

const MediaManagement = ({ selectedMemorial, onStatsUpdate }) => {
  const [activeTab, setActiveTab] = useState('fotos');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalMedia: 0,
    totalFotos: 0,
    totalVideos: 0,
    totalFondos: 0,
    totalMusica: 0
  });

  // Resetear pestaña activa cuando cambia el memorial seleccionado
  useEffect(() => {
    if (selectedMemorial) {
      setActiveTab('fotos');
    }
  }, [selectedMemorial?._id]);

  // Manejar actualizaciones de estadísticas de cada pestaña
  const handleStatsUpdate = (sectionStats) => {
    setStats(prevStats => {
      const newStats = { ...prevStats, ...sectionStats };
      
      // Calcular total
      newStats.totalMedia = newStats.totalFotos + newStats.totalVideos + newStats.totalFondos + newStats.totalMusica;
      
      // Propagar al componente padre
      if (onStatsUpdate) {
        onStatsUpdate(newStats);
      }
      
      return newStats;
    });
  };

  const tabs = [
    {
      id: 'fotos',
      name: 'Fotografías',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      count: stats.totalFotos,
      description: 'Gestión de fotografías de la galería y biografía'
    },
    {
      id: 'videos',
      name: 'Videos',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      ),
      count: stats.totalVideos,
      description: 'Videos del memorial'
    },
    {
      id: 'fondos',
      name: 'Fondos',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 0h10m-9 0a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V6a2 2 0 00-2-2" />
        </svg>
      ),
      count: stats.totalFondos,
      description: 'Imágenes de fondo del slideshow'
    },
    {
      id: 'musica',
      name: 'Música',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
        </svg>
      ),
      count: stats.totalMusica,
      description: 'Enlaces de música de YouTube'
    }
  ];

  if (!selectedMemorial) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="text-center">
          <div className="mx-auto h-24 w-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <svg className="h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Selecciona un Memorial
          </h3>
          <p className="text-gray-500">
            Elige un memorial desde la lista para gestionar sus archivos multimedia
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg">
      {/* Header con información del memorial */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Gestión de Medios
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Memorial de <span className="font-medium">{selectedMemorial.nombre}</span>
            </p>
          </div>
          
          {/* Estadísticas rápidas */}
          <div className="flex items-center space-x-6 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{stats.totalMedia}</div>
              <div className="text-gray-500">Total</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-blue-600">{stats.totalFotos}</div>
              <div className="text-gray-500">Fotos</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-green-600">{stats.totalVideos}</div>
              <div className="text-gray-500">Videos</div>
            </div>
          </div>
        </div>
      </div>

      {/* Sistema de pestañas */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6" aria-label="Tabs">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`${
                  isActive
                    ? 'border-red-500 text-red-600 bg-red-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-3 border-b-2 font-medium text-sm rounded-t-lg transition-all duration-200 flex items-center space-x-2`}
                aria-current={isActive ? 'page' : undefined}
              >
                <span className={isActive ? 'text-red-600' : 'text-gray-400'}>
                  {tab.icon}
                </span>
                <span>{tab.name}</span>
                {tab.count > 0 && (
                  <span className={`${
                    isActive ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'
                  } inline-flex items-center justify-center px-2 py-1 rounded-full text-xs font-medium`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Descripción de la pestaña activa */}
      <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
        <p className="text-sm text-gray-600">
          {tabs.find(tab => tab.id === activeTab)?.description}
        </p>
      </div>

      {/* Contenido de las pestañas */}
      <div className="p-6">
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
          </div>
        ) : (
          <>
            {activeTab === 'fotos' && (
              <MediaPhotos 
                selectedMemorial={selectedMemorial} 
                onStatsUpdate={(sectionStats) => handleStatsUpdate({ totalFotos: sectionStats.totalFotos || 0 })}
              />
            )}
            
            {activeTab === 'videos' && (
              <MediaVideos 
                selectedMemorial={selectedMemorial} 
                onStatsUpdate={(sectionStats) => handleStatsUpdate({ totalVideos: sectionStats.totalVideos || 0 })}
              />
            )}
            
            {activeTab === 'fondos' && (
              <MediaBackgrounds 
                selectedMemorial={selectedMemorial} 
                onStatsUpdate={(sectionStats) => handleStatsUpdate({ totalFondos: sectionStats.totalFondos || 0 })}
              />
            )}
            
            {activeTab === 'musica' && (
              <MediaMusic 
                selectedMemorial={selectedMemorial} 
                onStatsUpdate={(sectionStats) => handleStatsUpdate({ totalMusica: sectionStats.totalMusica || 0 })}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MediaManagement;