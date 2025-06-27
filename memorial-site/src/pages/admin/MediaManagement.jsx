// ====================================
// src/pages/admin/MediaManagement.jsx - Gestión completa de media
// ====================================
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import MediaGallery from '../../components/admin/media/MediaGallery';
import MediaVideos from '../../components/admin/media/MediaVideos';
import MediaBackgrounds from '../../components/admin/media/MediaBackgrounds';
import MediaMusic from '../../components/admin/media/MediaMusic';
import MediaProfilePhotos from '../../components/admin/media/MediaProfilePhotos';
import memorialService from '../../services/memorialService';

const MediaManagement = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('perfil');
  const [memoriales, setMemoriales] = useState([]);
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
      const response = await memorialService.getMemorials();
      
      const memorialesData = response.data?.profiles || response.profiles || [];
      setMemoriales(memorialesData);
      
      // Si hay memoriales, seleccionar el primero por defecto
      if (memorialesData.length > 0) {
        setSelectedMemorial(memorialesData[0]);
      }
    } catch (error) {
      console.error('❌ Error cargando memoriales:', error);
      setMemoriales([]);
    } finally {
      setLoading(false);
    }
  };

  const updateStats = (newStats) => {
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
  };

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
          
          {/* Selector de Memorial */}
          <div className="min-w-64">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Memorial Seleccionado
            </label>
            <select
              value={selectedMemorial?._id || ''}
              onChange={(e) => {
                const memorial = memoriales.find(m => m._id === e.target.value);
                setSelectedMemorial(memorial);
              }}
              className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
            >
              <option value="">Seleccionar memorial...</option>
              {Array.isArray(memoriales) && memoriales.map(memorial => (
                <option key={memorial._id} value={memorial._id}>
                  {memorial.nombre} - {memorial.fechaNacimiento ? new Date(memorial.fechaNacimiento).getFullYear() : 'S/F'}
                  {memorial.cliente ? ` (${memorial.cliente.nombre} ${memorial.cliente.apellido})` : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

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