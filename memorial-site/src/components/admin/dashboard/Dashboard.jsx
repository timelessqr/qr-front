// ====================================
// src/components/admin/dashboard/Dashboard.jsx - Dashboard principal del admin
// ====================================
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService, clientService, qrService } from '../../../services';
import StatsCards from './StatsCards';
import RecentActivity from './RecentActivity';

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalClients: 0,
      totalMemorials: 0,
      totalQRs: 0,
      totalViews: 0
    },
    recentClients: [],
    recentMemorials: [],
    systemHealth: {}
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      // Cargar dashboard data del backend
      const data = await adminService.getDashboard();
      setDashboardData(data);

    } catch (err) {
      setError(err.message);
      console.error('Error cargando dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAction = (action, id = null) => {
    switch (action) {
      case 'new-client':
        navigate('/admin/clients/new');
        break;
      case 'new-memorial':
        if (id) {
          navigate(`/admin/memorials/new/${id}`);
        } else {
          navigate('/admin/clients');
        }
        break;
      case 'view-client':
        navigate(`/admin/clients/${id}`);
        break;
      case 'view-memorial':
        navigate(`/admin/memorials/${id}`);
        break;
      case 'print-qr':
        navigate(`/admin/memorials/${id}/print-qr`);
        break;
      default:
        break;
    }
  };

  if (loading) {
    return (
      <div>
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white p-6 rounded-lg shadow">
                  <div className="h-4 bg-gray-300 rounded mb-2"></div>
                  <div className="h-8 bg-gray-300 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="max-w-7xl mx-auto">
        {/* 🔧 FIX: Asegurar que no haya elementos con altura excesiva */}
        <style jsx>{`
          .dashboard-container * {
            max-height: none;
          }
          .dashboard-container .overflow-hidden {
            max-height: fit-content;
          }
        `}</style>
        <div className="dashboard-container">
        {/* Header */}
        <div className="md:flex md:items-center md:justify-between mb-6">
          <div className="flex-1 min-w-0">
            <p className="mt-1 text-sm text-gray-500">
              Resumen general del sistema de memoriales digitales
            </p>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4">
            <button
              type="button"
              onClick={() => handleQuickAction('new-client')}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Nuevo Cliente
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-md bg-red-50 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Tarjetas de estadísticas */}
        <StatsCards 
          stats={dashboardData.stats} 
          onQuickAction={handleQuickAction} 
        />

        {/* Actividad reciente */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <RecentActivity
            title="Clientes Recientes"
            items={dashboardData.recentClients}
            type="clients"
            onAction={handleQuickAction}
          />
          <RecentActivity
            title="Memoriales Recientes"
            items={dashboardData.recentMemorials}
            type="memorials"
            onAction={handleQuickAction}
          />
        </div>

        {/* Acciones rápidas */}
        <div className="mt-8 bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Acciones Rápidas
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => handleQuickAction('new-client')}
                className="relative block w-full border-2 border-gray-300 border-dashed rounded-lg p-6 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <svg className="mx-auto h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                <span className="mt-2 block text-sm font-medium text-gray-900">
                  Registrar Cliente
                </span>
              </button>

              <button
                onClick={() => navigate('/admin/clients')}
                className="relative block w-full border-2 border-gray-300 border-dashed rounded-lg p-6 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <svg className="mx-auto h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <span className="mt-2 block text-sm font-medium text-gray-900">
                  Crear Memorial
                </span>
              </button>

              <button
                onClick={() => navigate('/admin/qr-codes')}
                className="relative block w-full border-2 border-gray-300 border-dashed rounded-lg p-6 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <svg className="mx-auto h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
                <span className="mt-2 block text-sm font-medium text-gray-900">
                  Gestionar QR
                </span>
              </button>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
