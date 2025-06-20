// ====================================
// src/pages/admin/ClientDetails.jsx - Detalles del cliente
// ====================================
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { clientService, memorialService } from '../../services';

const ClientDetails = () => {
  const { id: clientId } = useParams(); // 🔧 FIX: La ruta usa :id, no :clientId
  const navigate = useNavigate();
  
  const [client, setClient] = useState(null);
  const [memorials, setMemorials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadClientData();
  }, [clientId]);

  const loadClientData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Cargar datos del cliente
      const clientData = await clientService.getClientById(clientId);
      setClient(clientData);
      
      // Cargar memoriales del cliente
      const memorialsData = await memorialService.getClientMemorials(clientId);
      setMemorials(memorialsData);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Sin fecha';
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  if (loading) {
    return (
      <div className="py-6">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/4 mb-6"></div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="space-y-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i}>
                    <div className="h-4 bg-gray-300 rounded w-1/4 mb-2"></div>
                    <div className="h-6 bg-gray-300 rounded"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-6">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <p className="mt-1 text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="py-6">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-lg font-medium text-gray-900">Cliente no encontrado</h2>
            <p className="mt-1 text-sm text-gray-500">
              El cliente solicitado no existe o ha sido eliminado.
            </p>
            <div className="mt-6">
              <button
                onClick={() => navigate('/admin/clients')}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
              >
                Volver a clientes
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <nav className="flex mb-4" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-4">
              <li>
                <button
                  onClick={() => navigate('/admin/clients')}
                  className="text-gray-400 hover:text-gray-500"
                >
                  Clientes
                </button>
              </li>
              <li>
                <div className="flex items-center">
                  <svg className="flex-shrink-0 h-5 w-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="ml-4 text-sm font-medium text-gray-500">
                    Detalles del Cliente
                  </span>
                </div>
              </li>
            </ol>
          </nav>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {client.nombre} {client.apellido}
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Código: {client.codigoCliente} • Registrado: {formatDate(client.fechaRegistro)}
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => navigate(`/admin/clients/edit/${clientId}`)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                ✏️ Editar Cliente
              </button>
              {memorials.length === 0 && (
                <button
                  onClick={() => navigate(`/admin/memorials/new/${clientId}`)}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
                >
                  🌹 Crear Memorial
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Información del Cliente */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Información del Cliente
                </h3>
                <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Nombre completo</dt>
                    <dd className="mt-1 text-sm text-gray-900">{client.nombre} {client.apellido}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Código de cliente</dt>
                    <dd className="mt-1 text-sm text-gray-900">{client.codigoCliente}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Teléfono</dt>
                    <dd className="mt-1 text-sm text-gray-900">{client.telefono}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Email</dt>
                    <dd className="mt-1 text-sm text-gray-900">{client.email || 'No registrado'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Fecha de registro</dt>
                    <dd className="mt-1 text-sm text-gray-900">{formatDate(client.fechaRegistro)}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Última actualización</dt>
                    <dd className="mt-1 text-sm text-gray-900">{formatDate(client.ultimaActualizacion)}</dd>
                  </div>
                  {client.direccion && (
                    <div className="sm:col-span-2">
                      <dt className="text-sm font-medium text-gray-500">Dirección</dt>
                      <dd className="mt-1 text-sm text-gray-900">{client.direccion}</dd>
                    </div>
                  )}
                  {client.observaciones && (
                    <div className="sm:col-span-2">
                      <dt className="text-sm font-medium text-gray-500">Observaciones</dt>
                      <dd className="mt-1 text-sm text-gray-900">{client.observaciones}</dd>
                    </div>
                  )}
                </dl>
              </div>
            </div>
          </div>

          {/* Memoriales del Cliente */}
          <div>
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Memoriales ({memorials.length})
                </h3>
                
                {memorials.length === 0 ? (
                  <div className="text-center py-4">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    <h4 className="mt-2 text-sm font-medium text-gray-900">Sin memoriales</h4>
                    <p className="mt-1 text-sm text-gray-500">
                      Este cliente aún no tiene memoriales registrados.
                    </p>
                    <div className="mt-4">
                      <button
                        onClick={() => navigate(`/admin/memorials/new/${clientId}`)}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                      >
                        Crear Memorial
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {memorials.map((memorial) => (
                      <div key={memorial.id} className="border border-gray-200 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-sm font-medium text-gray-900">{memorial.nombre}</h4>
                            <p className="text-xs text-gray-500">
                              {formatDate(memorial.fechaNacimiento)} - {formatDate(memorial.fechaFallecimiento)}
                            </p>
                            {memorial.qr && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-1">
                                QR: {memorial.qr.code}
                              </span>
                            )}
                          </div>
                          <div className="flex flex-col space-y-1">
                            {memorial.qr && (
                              <button
                                onClick={() => window.open(`/memorial/${memorial.qr.code}`, '_blank')}
                                className="text-xs text-blue-600 hover:text-blue-800"
                              >
                                Ver Muro
                              </button>
                            )}
                            <button
                              onClick={() => navigate(`/admin/memorials/edit/${memorial.id}`)}
                              className="text-xs text-gray-600 hover:text-gray-800"
                            >
                              Editar
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    <div className="mt-4 text-center">
                      <button
                        onClick={() => {
                          if (window.confirm('¿Quieres crear otro memorial para este cliente?')) {
                            navigate(`/admin/memorials/new/${clientId}`);
                          }
                        }}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-orange-500 hover:bg-orange-600"
                      >
                        + Crear Otro Memorial
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientDetails;
