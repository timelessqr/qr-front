// ====================================
// src/pages/admin/MediaManagement.jsx - Gestión completa de media
// ====================================
import React, { useState, useEffect, useCallback } from 'react';
import MediaGallery from '../../components/admin/media/MediaGallery';
import MediaVideos from '../../components/admin/media/MediaVideos';
import MediaBackgrounds from '../../components/admin/media/MediaBackgrounds';
import MediaMusic from '../../components/admin/media/MediaMusic';
import MediaProfilePhotos from '../../components/admin/media/MediaProfilePhotos';
import MediaSearch from '../../components/admin/search/MediaSearch';
import memorialService from '../../services/memorialService';
import clientService from '../../services/clientService';

const MediaManagement = () => {
  const [activeTab, setActiveTab] = useState('perfil');
  const [memoriales, setMemoriales] = useState([]);
  const [clients, setClients] = useState([]);
  const [selectedMemorial, setSelectedMemorial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalMedia: 0,
    totalFotos: 0,
    totalVideos: 0,
    totalFondos: 0,
    totalMusica: 0,
    totalProfilePhotos: 0
  });

  const tabs = [
    {
      id: 'perfil',
      name: 'Perfil',
      icon: '👤',
      description: 'Fotos de perfil y biografía'
    },
    {
      id: 'galeria',
      name: 'Fotografías',
      icon: '📸',
      description: 'Galería de fotos'
    },
    {
      id: 'videos',
      name: 'Videos',
      icon: '🎥',
      description: 'Videos del memorial'
    },
    {
      id: 'fondos',
      name: 'Fondos',
      icon: '🖼️',
      description: 'Imágenes de fondo'
    },
    {
      id: 'musica',
      name: 'Música',
      icon: '🎵',
      description: 'Archivos de audio'
    }
  ];

  useEffect(() => {
    loadMemoriales();
  }, []);

  useEffect(() => {
    if (selectedMemorial) {
      // Reset stats when memorial changes
      setStats({
        totalMedia: 0,
        totalFotos: 0,
        totalVideos: 0,
        totalFondos: 0,
        totalMusica: 0,
        totalProfilePhotos: 0
      });
    }
  }, [selectedMemorial]);

  const loadMemoriales = async () => {
    try {
      setLoading(true);
      const [firstResponse, firstClientsResponse] = await Promise.all([
        memorialService.getMemorials({ page: 1, limit: 100 }),
        clientService.getClients({ page: 1, limit: 100 })
      ]);
      const firstPage = firstResponse.data?.profiles || firstResponse.profiles || [];
      const totalPages = Number(firstResponse.pagination?.totalPages || 1);
      const firstClientsPage = firstClientsResponse.data?.clients || firstClientsResponse.clients || [];
      const totalClientPages = Number(firstClientsResponse.pagination?.totalPages || 1);
      const [remainingResponses, remainingClientResponses] = await Promise.all([
        totalPages > 1
          ? Promise.all(
            Array.from({ length: totalPages - 1 }, (_, index) =>
              memorialService.getMemorials({ page: index + 2, limit: 100 })
            )
          )
          : [],
        totalClientPages > 1
          ? Promise.all(
            Array.from({ length: totalClientPages - 1 }, (_, index) =>
              clientService.getClients({ page: index + 2, limit: 100 })
            )
          )
          : []
      ]);
      const memorialesData = remainingResponses.reduce((allMemorials, response) => {
        const pageMemorials = response.data?.profiles || response.profiles || [];
        return allMemorials.concat(pageMemorials);
      }, firstPage);
      const clientsData = remainingClientResponses.reduce((allClients, response) => {
        const pageClients = response.data?.clients || response.clients || [];
        return allClients.concat(pageClients);
      }, firstClientsPage);
      setMemoriales(memorialesData);
      setClients(clientsData);
      
      // Si hay memoriales, seleccionar el primero por defecto
      if (memorialesData.length > 0) {
        setSelectedMemorial(memorialesData[0]);
      }
    } catch (error) {
      console.error('❌ Error cargando memoriales:', error);
      setMemoriales([]);
      setClients([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ MANEJAR CAMBIO DE MEMORIAL (simple)
  const handleMemorialChange = useCallback((memorial) => {
    setSelectedMemorial(memorial);
  }, []);

  const updateStats = useCallback((newStats) => {
    setStats(prevStats => {
      const updatedStats = { ...prevStats, ...newStats };
      
      // Calcular total
      updatedStats.totalMedia = 
        (updatedStats.totalFotos || 0) + 
        (updatedStats.totalVideos || 0) + 
        (updatedStats.totalFondos || 0) + 
        (updatedStats.totalMusica || 0) + 
        (updatedStats.totalProfilePhotos || 0);
      
      return updatedStats;
    });
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestión de Media</h1>
            <p className="text-gray-600 mt-1">
              Administra contenido multimedia de los memoriales
            </p>
          </div>
          </div>

      {/* ✅ BÚSQUEDA SIMPLE DE MEDIA */}
      <MediaSearch 
        memoriales={memoriales}
        clients={clients}
        selectedMemorial={selectedMemorial}
        onMemorialChange={handleMemorialChange}
      />

        {/* Estadísticas */}
        {selectedMemorial && (
          <div className="mt-6 grid grid-cols-2 md:grid-cols-6 gap-3">
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-900">{stats.totalMedia}</div>
                <div className="text-xs text-blue-600">Total</div>
              </div>
            </div>

            <div className="bg-indigo-50 p-3 rounded-lg">
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-900">{stats.totalProfilePhotos}</div>
                <div className="text-xs text-indigo-600">Perfil</div>
              </div>
            </div>

            <div className="bg-green-50 p-3 rounded-lg">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-900">{stats.totalFotos}</div>
                <div className="text-xs text-green-600">Fotos</div>
              </div>
            </div>

            <div className="bg-purple-50 p-3 rounded-lg">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-900">{stats.totalVideos}</div>
                <div className="text-xs text-purple-600">Videos</div>
              </div>
            </div>

            <div className="bg-orange-50 p-3 rounded-lg">
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-900">{stats.totalFondos}</div>
                <div className="text-xs text-orange-600">Fondos</div>
              </div>
            </div>

            <div className="bg-red-50 p-3 rounded-lg">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-900">{stats.totalMusica}</div>
                <div className="text-xs text-red-600">Música</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {selectedMemorial ? (
      <>
          {/* Tabs optimizadas */}
          <div className="bg-white shadow rounded-lg">
            <div className="border-b border-gray-200">
              <nav className="flex" aria-label="Tabs">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 group inline-flex items-center justify-center py-4 px-3 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-red-500 text-red-600 bg-red-50'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <span className="text-lg mr-2">{tab.icon}</span>
                    <div className="text-center">
                      <div className="font-medium">{tab.name}</div>
                      <div className="text-xs opacity-75">{tab.description}</div>
                    </div>
                  </button>
                ))}
              </nav>
            </div>

            {/* Contenido de las tabs */}
            <div className="p-6">
              {activeTab === 'perfil' && (
                <MediaProfilePhotos 
                  selectedMemorial={selectedMemorial} 
                  onStatsUpdate={(sectionStats) => updateStats({ totalProfilePhotos: sectionStats.totalProfilePhotos || 0 })}
                />
              )}

              {activeTab === 'galeria' && (
                <MediaGallery 
                  selectedMemorial={selectedMemorial} 
                  onStatsUpdate={(sectionStats) => updateStats({ totalFotos: sectionStats.totalFotos || 0 })}
                />
              )}

              {activeTab === 'videos' && (
                <MediaVideos 
                  selectedMemorial={selectedMemorial} 
                  onStatsUpdate={(sectionStats) => updateStats({ totalVideos: sectionStats.totalVideos || 0 })}
                />
              )}

              {activeTab === 'fondos' && (
                <MediaBackgrounds 
                  selectedMemorial={selectedMemorial} 
                  onStatsUpdate={(sectionStats) => updateStats({ totalFondos: sectionStats.totalFondos || 0 })}
                />
              )}

              {activeTab === 'musica' && (
                <MediaMusic 
                  selectedMemorial={selectedMemorial} 
                  onStatsUpdate={(sectionStats) => updateStats({ totalMusica: sectionStats.totalMusica || 0 })}
                />
              )}
            </div>
          </div>
        </>
      ) : (
        <div className="bg-white shadow rounded-lg p-12 text-center">
          <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Selecciona un Memorial
          </h3>
          <p className="text-gray-500">
            Elige un memorial para gestionar su contenido multimedia
          </p>
        </div>
      )}
    </div>
  );
};

export default MediaManagement;
