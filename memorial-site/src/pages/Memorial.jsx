// ====================================
// src/pages/Memorial.jsx - Página pública del memorial (con datos dinámicos)
// ====================================
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMemorial } from '../hooks';

// Importar componentes existentes
import Banner from '../components/Banner';
import Footer from '../components/Footer';
import NavBar from '../components/NavBar';
import ProfileHeader from '../components/ProfileHeader';
import TabsNavigation from '../components/TabsNavigation';
import Historia from '../components/Historia';
import Contenido from '../components/Contenido';
import Comentarios from '../components/Comentarios';

const Memorial = () => {
  const { qrCode } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("historia");
  const [memorialData, setMemorialData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!qrCode) {
      navigate('/');
      return;
    }
    loadMemorialData();
  }, [qrCode]);

  const loadMemorialData = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('📋 DEBUG: Cargando memorial público');
      console.log('qrCode:', qrCode);
      
      // 🔧 FIX: Usar variable de entorno en lugar de localhost hardcodeado
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      const baseUrl = apiUrl.replace('/api', ''); // Remover /api del final si existe
      const requestUrl = `${baseUrl}/api/memorial/${qrCode}`;
      
      console.log('🔗 API URL configurada:', apiUrl);
      console.log('🔗 Base URL:', baseUrl);
      console.log('🔗 Request URL final:', requestUrl);
      
      // Usar el servicio para obtener datos del memorial
      const response = await fetch(requestUrl);
      console.log('📡 Response status:', response.status);
      
      const data = await response.json();
      console.log('📊 Response data:', data);
      
      if (data.success) {
        setMemorialData(data.data);
        
        // Aplicar CSS del dashboard automáticamente
        if (data.data.memorial?.dashboard?.css) {
          applyDashboardCSS(data.data.memorial.dashboard);
        }
      } else {
        throw new Error(data.message || 'Memorial no encontrado');
      }
    } catch (err) {
      setError(err.message);
      console.error('❌ Error cargando memorial:', err);
    } finally {
      setLoading(false);
    }
  };

  const applyDashboardCSS = (dashboard) => {
    // Crear elemento style si no existe
    let styleElement = document.getElementById('memorial-styles');
    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = 'memorial-styles';
      document.head.appendChild(styleElement);
    }
    
    // Aplicar CSS del dashboard
    styleElement.innerHTML = dashboard.css || '';
    
    // También aplicar variables CSS
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

  // Estados de carga y error
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando memorial...</p>
        </div>
      </div>
    );
  }

  if (error || !memorialData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto">
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
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  const memorial = memorialData.memorial;
  const theme = memorial.dashboard?.tema || 'clasico';

  return (
    <div className={`min-h-screen flex flex-col memorial theme-${theme}`}>
      <NavBar />
      <Banner />
      <ProfileHeader memorialData={memorial} />
      <TabsNavigation 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        secciones={memorial.dashboard?.secciones || ['biografia', 'galeria_fotos', 'videos_memoriales', 'condolencias']}
      />
      
      {/* Contenido dinámico según la pestaña seleccionada */}
      <div className="flex-grow container mx-auto px-4 py-8">
        {renderTabContent()}
      </div>
      
      <Footer />
    </div>
  );
};

export default Memorial;
