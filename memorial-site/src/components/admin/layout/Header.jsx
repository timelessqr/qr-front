// ====================================
// src/components/admin/layout/Header.jsx - Header del panel administrativo
// ====================================
import React from 'react';
import { useLocation } from 'react-router-dom';

// Mapeo de rutas a títulos de página
const getPageTitle = (pathname) => {
  if (pathname === '/admin' || pathname === '/admin/') {
    return 'Dashboard';
  }
  if (pathname.startsWith('/admin/clients/new')) {
    return 'Nuevo Cliente';
  }
  if (pathname.startsWith('/admin/clients/') && pathname.includes('/edit')) {
    return 'Editar Cliente';
  }
  if (pathname.startsWith('/admin/clients/') && !pathname.includes('new') && !pathname.includes('edit')) {
    return 'Detalles del Cliente';
  }
  if (pathname === '/admin/clients') {
    return 'Clientes';
  }
  if (pathname.startsWith('/admin/memorials/new')) {
    return 'Nuevo Memorial';
  }
  if (pathname.startsWith('/admin/memorials/edit')) {
    return 'Editar Memorial';
  }
  if (pathname.startsWith('/admin/memorials/') && pathname.includes('/print-qr')) {
    return 'Código QR';
  }
  if (pathname === '/admin/memorials') {
    return 'Memoriales';
  }
  if (pathname === '/admin/qr-codes') {
    return 'Códigos QR';
  }
  if (pathname === '/admin/reports') {
    return 'Reportes';
  }
  if (pathname === '/admin/settings') {
    return 'Configuración';
  }
  
  return 'Panel Administrativo';
};

const Header = ({ onMenuClick }) => {
  const location = useLocation();
  const pageTitle = getPageTitle(location.pathname);

  return (
    <div className="bg-white shadow-sm border-b border-gray-200 flex-shrink-0">
      <div className="flex items-center justify-between h-14 px-4 sm:px-6 lg:px-8">
        {/* Botón de menú móvil */}
        <button
          type="button"
          className="p-2 rounded-md text-gray-500 lg:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-red-500"
          onClick={onMenuClick}
        >
          <span className="sr-only">Abrir sidebar</span>
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Título dinámico de la página */}
        <div className="flex-1 flex items-center lg:ml-0 ml-3">
          <h1 className="text-lg font-medium text-gray-900">
            {pageTitle}
          </h1>
        </div>
      </div>
    </div>
  );
};

export default Header;
