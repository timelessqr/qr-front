// ====================================
// src/pages/admin/MediaManagement.jsx - Gestión completa de media
// ====================================
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import MediaGallery from '../../components/admin/media/MediaGallery';
import MediaBackgrounds from '../../components/admin/media/MediaBackgrounds';
import MediaMusic from '../../components/admin/media/MediaMusic';
import memorialService from '../../services/memorialService';

const MediaManagement = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('galeria');
  const [memoriales, setMemoriales] = useState([]);
  const [selectedMemorial, setSelectedMemorial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalMedia: 0,
    totalFotos: 0,
    totalVideos: 0,
    totalFondos: 0,
    totalMusica: 0
  });

  const tabs = [
    {
      id: 'galeria',
      name: 'Galería',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      description: 'Fotos y videos principales'
    },
    {
      id: 'fondos',
      name: 'Fondos',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 0h10M7 4v16m10-16v16M7 20H5a1 1 0 01-1-1V5a1 1 0 011-1h2m10 16h2a1 1 0 001-1V5a1 1 0 00-1-1h-2" />
        </svg>
      ),
      description: 'Imágenes de fondo del memorial'
    },
    {
      id: 'musica',
      name: 'Música',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
        </svg>
      ),
      description: 'Música del recuerdo (YouTube)'
    }
  ];

  useEffect(() => {
    loadMemoriales();
  }, []);

  // 🆕 NUEVO: Cargar estadísticas cuando cambia el memorial seleccionado
  useEffect(() => {
    if (selectedMemorial) {
      // Reset stats when memorial changes
      setStats({
        totalMedia: 0,
        totalFotos: 0,
        totalVideos: 0,
        totalFondos: 0,
        totalMusica: 0
      });
      console.log('📊 Memorial cambiado, reseteando stats para:', selectedMemorial._id);
    }
  }, [selectedMemorial]);

  const loadMemoriales = async () => {
    try {
      setLoading(true);
      const response = await memorialService.getMemorials();
      
      // El API de memoriales devuelve {profiles: [...], pagination: {...}}
      console.log('📋 Respuesta del API:', response); // Debug
      const memorialesData = response.data?.profiles || response.profiles || [];
      
      console.log('🎯 Memoriales procesados:', memorialesData); // Debug
      setMemoriales(memorialesData);
      
      // Si hay memoriales, seleccionar el primero por defecto
      if (memorialesData.length > 0) {
        setSelectedMemorial(memorialesData[0]);
        console.log('✅ Memorial seleccionado:', memorialesData[0]); // Debug
      }
    } catch (error) {
      console.error('❌ Error cargando memoriales:', error);
      setMemoriales([]); // Asegurar que memoriales sea un array
    } finally {
      setLoading(false);
    }
  };

  const updateStats = (newStats) => {
    console.log('📊 Actualizando stats en MediaManagement:', newStats);
    setStats(prevStats => ({
      ...prevStats,
      ...newStats
    }));
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
              Administra fotos, videos, fondos y música de los memoriales
            </p>
          </div>
          
          {/* Selector de Cliente */}
          <div className="min-w-64">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Memorial Seleccionado
            </label>
            <select
              value={selectedMemorial?._id || ''}
              onChange={(e) => {
                const memorial = memoriales.find(m => m._id === e.target.value);
                console.log('🔄 Cambiando memorial a:', memorial);
                setSelectedMemorial(memorial);
              }}
              className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
            >
              <option value="">Seleccionar memorial...</option>
              {Array.isArray(memoriales) && memoriales.map(memorial => (
                <option key={memorial._id} value={memorial._id}>
                  {memorial.nombre} - {memorial.fechaNacimiento ? new Date(memorial.fechaNacimiento).getFullYear() : 'S/F'}
                  {memorial.cliente ? ` (Cliente: ${memorial.cliente.nombre} ${memorial.cliente.apellido})` : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Estadísticas */}
        {selectedMemorial && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-blue-600">Total</p>
                  <p className="text-2xl font-bold text-blue-900">{stats.totalMedia}</p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-600">Fotos</p>
                  <p className="text-2xl font-bold text-green-900">{stats.totalFotos}</p>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-purple-600">Videos</p>
                  <p className="text-2xl font-bold text-purple-900">{stats.totalVideos}</p>
                </div>
              </div>
            </div>

            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 0h10M7 4v16m10-16v16M7 20H5a1 1 0 01-1-1V5a1 1 0 011-1h2m10 16h2a1 1 0 001-1V5a1 1 0 00-1-1h-2" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-orange-600">Fondos</p>
                  <p className="text-2xl font-bold text-orange-900">{stats.totalFondos}</p>
                </div>
              </div>
            </div>

            <div className="bg-red-50 p-4 rounded-lg">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-red-600">Música</p>
                  <p className="text-2xl font-bold text-red-900">{stats.totalMusica}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {selectedMemorial ? (
      <>
          {/* Tabs */}
          <div className="bg-white shadow rounded-lg">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-red-500 text-red-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <span className={`mr-2 ${activeTab === tab.id ? 'text-red-500' : 'text-gray-400 group-hover:text-gray-500'}`}>
                      {tab.icon}
                    </span>
                    <span>{tab.name}</span>
                    <span className="ml-2 text-xs text-gray-400">
                      {tab.description}
                    </span>
                  </button>
                ))}
              </nav>
            </div>

            {/* Contenido de las tabs */}
            <div className="p-6">
              {activeTab === 'galeria' && (
                <MediaGallery 
                  selectedMemorial={selectedMemorial} 
                  onStatsUpdate={updateStats}
                />
              )}
              {activeTab === 'fondos' && (
                <MediaBackgrounds 
                  selectedMemorial={selectedMemorial} 
                  onStatsUpdate={updateStats}
                />
              )}
              {activeTab === 'musica' && (
                <MediaMusic 
                  selectedMemorial={selectedMemorial} 
                  onStatsUpdate={updateStats}
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