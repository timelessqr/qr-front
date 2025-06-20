// ====================================
// src/components/admin/layout/Header.jsx - Header del panel administrativo
// ====================================
import React, { useState } from 'react';
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

const Header = ({ user, onMenuClick, onLogout }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
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

        {/* Acciones del usuario */}
        <div className="flex items-center space-x-3">
          {/* Notificaciones */}
          <button
            type="button"
            className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            <span className="sr-only">Ver notificaciones</span>
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </button>

          {/* Dropdown del perfil */}
          <div className="relative">
            <button
              type="button"
              className="flex items-center text-sm rounded-md p-2 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <span className="sr-only">Abrir menú de usuario</span>
              <div className="h-7 w-7 rounded-full bg-red-100 flex items-center justify-center">
                <span className="text-xs font-medium text-red-600">
                  {user?.nombre?.charAt(0)?.toUpperCase() || 'A'}
                </span>
              </div>
              <span className="ml-2 text-sm font-medium text-gray-700 hidden sm:block">
                {user?.nombre || 'Admin'}
              </span>
              <svg className="ml-1 h-4 w-4 text-gray-400 hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                <div className="py-1">
                  <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-100">
                    <p className="font-medium">{user?.nombre}</p>
                    <p className="text-gray-500 text-xs">{user?.email}</p>
                  </div>
                  
                  <button
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setDropdownOpen(false)}
                  >
                    Mi Perfil
                  </button>
                  
                  <button
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setDropdownOpen(false)}
                  >
                    Configuración
                  </button>
                  
                  <div className="border-t border-gray-100">
                    <button
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                      onClick={() => {
                        setDropdownOpen(false);
                        onLogout();
                      }}
                    >
                      Cerrar Sesión
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
