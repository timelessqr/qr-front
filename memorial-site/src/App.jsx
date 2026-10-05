// ====================================
// src/App.jsx - Aplicación principal con routing integrado
// ====================================
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/admin/auth/ProtectedRoute';
import AdminLayout from './components/admin/layout/AdminLayout';

// Páginas públicas
import Memorial from './pages/Memorial';
import Pergamino from './pages/Pergamino';

// Páginas administrativas
import LoginPage from './pages/admin/Login';
import DashboardPage from './pages/admin/Dashboard';
import ClientsPage from './pages/admin/Clients';
import NewClientPage from './pages/admin/NewClient';
import ClientDetailsPage from './pages/admin/ClientDetails';
import MemorialsPage from './pages/admin/Memorials';
import NewMemorialPage from './pages/admin/NewMemorial';
import PrintQRPage from './pages/admin/PrintQR';
import MemorialComentarios from './pages/admin/MemorialComentarios';
import QRManagement from './pages/admin/QRManagement';
import MediaManagement from './pages/admin/MediaManagement';
import PergaminosFunerarias from './pages/admin/pergaminos/Funerarias';
import PergaminosSalas from './pages/admin/pergaminos/FunerariaSalas';
import PergaminoEditor from './pages/admin/pergaminos/PergaminoEditor';
import PergaminoLibro from './pages/admin/pergaminos/LibroCondolencias';
import PergaminoImprimir from './pages/admin/pergaminos/ImprimirPergamino';
import PergaminoDescargarLibro from './pages/admin/pergaminos/DescargarLibro';

// Componentes del memorial original (para mantener compatibilidad)
import Banner from './components/Banner';
import Footer from './components/Footer';
import NavBar from './components/NavBar';
import ProfileHeader from './components/ProfileHeader';
import TabsNavigation from './components/TabsNavigation';
import Historia from './components/Historia';
import Contenido from './components/Contenido';
import Comentarios from './components/Comentarios';

import './App.css';

// 🔧 NUEVO: Componente para manejar clases CSS del body
const BodyClassManager = () => {
  const location = useLocation();
  
  useEffect(() => {
    const body = document.body;
    
    // Limpiar clases anteriores
    body.classList.remove('admin-layout', 'default-layout');
    
    // Aplicar clase según la ruta (el pergamino público ocupa todo el ancho, como el admin)
    if (location.pathname.startsWith('/admin') || location.pathname.startsWith('/pergamino')) {
      body.classList.add('admin-layout');
    } else {
      body.classList.add('default-layout');
    }
    
    // Cleanup al desmontar
    return () => {
      body.classList.remove('admin-layout', 'default-layout');
    };
  }, [location.pathname]);
  
  return null;
};

// Página de inicio temporal (puedes personalizarla)
const HomePage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="mx-auto h-20 w-20 flex items-center justify-center rounded-full bg-red-100 mb-6">
          <svg className="h-12 w-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Lazos de Vida
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Sistema de Memoriales Digitales
        </p>
        <div className="space-x-4">
          <a
            href="/admin"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
          >
            Panel Administrativo
          </a>
        </div>
      </div>
    </div>
  );
};

// Componente para páginas no encontradas
const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-400 mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-6">Página no encontrada</p>
        <a
          href="/"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
        >
          Volver al inicio
        </a>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <BodyClassManager />
          <Routes>
            {/* Ruta de inicio */}
            <Route path="/" element={<HomePage />} />
            
            {/* Rutas públicas de memoriales */}
            <Route path="/memorial/:qrCode" element={<Memorial />} />

            {/* Pergamino de una sala de funeraria (lo que abre su QR) */}
            <Route path="/pergamino/:code" element={<Pergamino />} />
            
            {/* Ruta de login administrativo */}
            <Route path="/admin/login" element={<LoginPage />} />
            
            {/* Hoja para imprimir el pergamino: protegida, pero sin el menú del admin */}
            <Route
              path="/admin/pergaminos/salas/:salaId/imprimir"
              element={<ProtectedRoute><PergaminoImprimir /></ProtectedRoute>}
            />
            <Route
              path="/admin/pergaminos/salas/:salaId/libro/descargar"
              element={<ProtectedRoute><PergaminoDescargarLibro /></ProtectedRoute>}
            />

            {/* Rutas administrativas protegidas */}
            <Route
              path="/admin/*"
              element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              {/* Dashboard principal */}
              <Route index element={<DashboardPage />} />
              
              {/* Gestión de clientes */}
              <Route path="clients" element={<ClientsPage />} />
              <Route path="clients/new" element={<NewClientPage />} />
              <Route path="clients/:id" element={<ClientDetailsPage />} />
              <Route path="clients/:id/edit" element={<NewClientPage />} />
              
              {/* Gestión de memoriales */}
              <Route path="memorials" element={<MemorialsPage />} />
              <Route path="memorials/new/:clientId" element={<NewMemorialPage />} />
              <Route path="memorials/edit/:memorialId" element={<NewMemorialPage />} />
              <Route path="memorials/:memorialId/print-qr" element={<PrintQRPage />} />
              <Route path="memorials/:memorialId/comentarios" element={<MemorialComentarios />} />
              
              {/* Gestión de Media */}
              <Route path="media" element={<MediaManagement />} />
              
              {/* Pergaminos de funerarias (backend lazos-pergamino) */}
              <Route path="pergaminos" element={<PergaminosFunerarias />} />
              <Route path="pergaminos/funerarias/:funerariaId" element={<PergaminosSalas />} />
              <Route path="pergaminos/salas/:salaId" element={<PergaminoEditor />} />
              <Route path="pergaminos/salas/:salaId/libro" element={<PergaminoLibro />} />

              {/* Gestión de QR */}
              <Route path="qr-codes" element={<QRManagement />} />
              
              {/* Reportes */}
              <Route path="reports" element={<div>Reportes (por implementar)</div>} />
              
              {/* Configuración */}
              <Route path="settings" element={<div>Configuración (por implementar)</div>} />
            </Route>
            
            {/* Redirección de /admin a /admin/login si no está autenticado */}
            <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
            
            {/* Página 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;