// ====================================
// src/pages/admin/MemorialComentarios.jsx - Página de configuración de comentarios
// ====================================
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { memorialService } from '../../services';
import ConfiguracionComentarios from '../../components/admin/memorials/ConfiguracionComentarios';

const MemorialComentarios = () => {
  const { memorialId } = useParams();
  const navigate = useNavigate();
  
  const [memorial, setMemorial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (memorialId) {
      cargarMemorial();
    }
  }, [memorialId]);

  const cargarMemorial = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('🔍 Cargando memorial para comentarios:', memorialId);
      
      // Usar el servicio de memoriales para obtener los datos
      const data = await memorialService.getMemorialById(memorialId);
      
      console.log('📊 Datos del memorial obtenidos:', data);
      
      if (data) {
        // Mapear los datos del memorial al formato esperado por ConfiguracionComentarios
        const memorialMapeado = {
          id: data._id || data.id,
          qrCode: data.qr?.code || data.qrCode,
          nombreCompleto: data.nombre || data.nombreCompleto,
          codigoComentarios: data.codigoComentarios || '',
          comentariosHabilitados: data.comentariosHabilitados || false,
          // Agregar otros campos que puedan ser necesarios
          ...data
        };
        
        console.log('📋 Memorial mapeado:', memorialMapeado);
        
        // Verificar que tenemos los datos esenciales
        if (!memorialMapeado.qrCode) {
          setError('Este memorial no tiene un código QR asociado');
          return;
        }
        
        setMemorial(memorialMapeado);
      } else {
        setError('Memorial no encontrado');
      }
      
    } catch (err) {
      console.error('❌ Error cargando memorial:', err);
      setError(err.message || 'Error al cargar el memorial');
    } finally {
      setLoading(false);
    }
  };

  const handleActualizacion = (nuevaConfig) => {
    console.log('✅ Configuración actualizada:', nuevaConfig);
    // Aquí podrías actualizar el estado local si fuera necesario
  };

  const handleVolver = () => {
    navigate('/admin/memorials');
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="animate-pulse">
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <div className="h-6 bg-gray-300 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-300 rounded w-2/3"></div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="h-4 bg-gray-300 rounded mb-4"></div>
            <div className="h-4 bg-gray-300 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-300 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !memorial) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="mx-auto h-16 w-16 text-red-500 mb-4">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Error al cargar memorial
          </h3>
          <p className="text-gray-600 mb-6">
            {error || 'No se pudo encontrar el memorial especificado.'}
          </p>
          <button
            onClick={handleVolver}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver a Memoriales
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header con navegación */}
      <div className="mb-6">
        <nav className="flex" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-4">
            <li>
              <div>
                <button
                  onClick={() => navigate('/admin/memorials')}
                  className="text-gray-400 hover:text-gray-500 transition-colors duration-200"
                >
                  <svg className="flex-shrink-0 h-5 w-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                  </svg>
                  <span className="sr-only">Memoriales</span>
                </button>
              </div>
            </li>
            <li>
              <div className="flex items-center">
                <svg className="flex-shrink-0 h-5 w-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                <button
                  onClick={() => navigate('/admin/memorials')}
                  className="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors duration-200"
                >
                  Memoriales
                </button>
              </div>
            </li>
            <li>
              <div className="flex items-center">
                <svg className="flex-shrink-0 h-5 w-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                <span className="ml-4 text-sm font-medium text-gray-500" aria-current="page">
                  Comentarios
                </span>
              </div>
            </li>
          </ol>
        </nav>
      </div>

      {/* Contenido principal */}
      <ConfiguracionComentarios 
        memorial={memorial} 
        onActualizar={handleActualizacion} 
      />
    </div>
  );
};

export default MemorialComentarios;