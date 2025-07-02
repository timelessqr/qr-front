// ====================================
// src/components/admin/clients/ClientList.jsx - Lista de clientes
// ====================================
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useClients } from '../../../hooks';
import ClientSearch from '../search/ClientSearch'; // ✅ Búsqueda simple

const ClientList = () => {
  const navigate = useNavigate();
  const { 
    clients, 
    loading, 
    error, 
    pagination, 
    loadClients, 
    searchClients, 
    deleteClient 
  } = useClients();
  
  // DEBUG: Ver qué datos están llegando del backend
  useEffect(() => {
    if (clients.length > 0) {
      console.log('=== CLIENTES CARGADOS ===');
      console.log('Primer cliente:', clients[0]);
      console.log('Campos disponibles:', Object.keys(clients[0]));
      console.log('ID del primer cliente:', clients[0].id || clients[0]._id);
    }
  }, [clients]);
  
  // ✅ BÚSQUEDA SIMPLE: Solo manejar búsqueda por nombre (estabilizada)
  const handleSearch = useCallback((searchTerm) => {
    if (searchTerm && searchTerm.trim()) {
      searchClients(searchTerm);
    } else {
      loadClients();
    }
  }, [searchClients, loadClients]);

  const handleDeleteClient = async (clientId) => {
    if (window.confirm('¿Está seguro de eliminar este cliente? Esta acción no se puede deshacer.')) {
      try {
        await deleteClient(clientId);
      } catch (error) {
        alert('Error al eliminar cliente: ' + error.message);
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Sin fecha';
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  return (
    <div>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="md:flex md:items-center md:justify-between mb-6">
          <div className="flex-1 min-w-0">
            <p className="mt-1 text-sm text-gray-500">
              Gestiona los clientes registrados en el sistema
            </p>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4">
            <button
              type="button"
              onClick={() => navigate('/admin/clients/new')}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
            >
              <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Nuevo Cliente
            </button>
          </div>
        </div>

        {/* ✅ BÚSQUEDA SIMPLE */}
        <ClientSearch 
          onSearch={handleSearch}
        />

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

        {/* Tabla de clientes */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          {loading ? (
            <div className="p-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto"></div>
              <p className="mt-2 text-gray-500">Cargando clientes...</p>
            </div>
          ) : clients.length === 0 ? (
            <div className="p-6 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No hay clientes</h3>
              <p className="mt-1 text-sm text-gray-500">
                Comienza registrando tu primer cliente.
              </p>
              <div className="mt-6">
                <button
                  onClick={() => navigate('/admin/clients/new')}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                >
                  <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Agregar Cliente
                </button>
              </div>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {clients.map((client) => (
                <li key={client.id || client._id} className="hover:bg-gray-50 transition-colors duration-150">
                  <div className="px-6 py-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center flex-1">
                        <div className="flex-shrink-0">
                          <div className="h-16 w-16 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md">
                            <span className="text-white font-bold text-xl">
                              {client.nombre?.charAt(0)?.toUpperCase() || 'C'}
                            </span>
                          </div>
                        </div>
                        <div className="ml-6 flex-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                {client.nombre && client.apellido 
                                  ? `${client.nombre} ${client.apellido}`
                                  : client.nombre || 'Cliente sin nombre'
                                }
                              </h3>
                              <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  {client.codigoCliente || client.codigo || 'Sin código'}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 mb-1">
                                {client.telefono} • {client.email}
                              </p>
                              <div className="flex items-center space-x-4 text-xs text-gray-500">
                                <span>Registrado: {formatDate(client.fechaRegistro || client.createdAt)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 ml-6">
                        <button
                          onClick={() => {
                            const clientId = client.id || client._id;
                            if (clientId) {
                              navigate(`/admin/clients/${clientId}`);
                            }
                          }}
                          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-lg shadow-sm transition-colors duration-200"
                          title="Ver detalles del cliente"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          Ver
                        </button>
                        
                        {/* ✅ BOTÓN SIMPLE DE MEMORIAL */}
                        <button
                          onClick={() => {
                            const clientId = client.id || client._id;
                            if (clientId) {
                              navigate(`/admin/memorials/new/${clientId}`);
                            }
                          }}
                          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-lg shadow-sm transition-colors duration-200"
                          title="Crear memorial"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                          Memorial
                        </button>
                        
                        <button
                          onClick={() => {
                            const clientId = client.id || client._id;
                            if (clientId) {
                              navigate(`/admin/clients/${clientId}/edit`);
                            }
                          }}
                          className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg shadow-sm transition-colors duration-200"
                          title="Editar cliente"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Editar
                        </button>
                        <button
                          onClick={() => {
                            const clientId = client.id || client._id;
                            if (clientId && window.confirm('¿Está seguro de eliminar este cliente?')) {
                              handleDeleteClient(clientId);
                            }
                          }}
                          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm transition-colors duration-200"
                          title="Eliminar cliente"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Paginación */}
        {pagination.totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 mt-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => changePage(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Anterior
              </button>
              <button
                onClick={() => changePage(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Siguiente
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Mostrando{' '}
                  <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span>
                  {' '}a{' '}
                  <span className="font-medium">
                    {Math.min(pagination.page * pagination.limit, pagination.total)}
                  </span>
                  {' '}de{' '}
                  <span className="font-medium">{pagination.total}</span>
                  {' '}resultados
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  {/* Aquí puedes agregar números de página si quieres */}
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientList;
