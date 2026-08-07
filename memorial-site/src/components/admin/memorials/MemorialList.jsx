// ====================================
// src/components/admin/memorials/MemorialList.jsx - Lista de memoriales
// ====================================
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { memorialService } from '../../../services';
import MemorialSearch from '../search/MemorialSearch';

const createInitialPagination = () => ({
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 0,
  hasNext: false,
  hasPrev: false,
  search: ''
});

const normalizePagination = (apiPagination = {}, requestParams, memorialsCount) => {
  const page = Number(apiPagination.currentPage ?? apiPagination.page ?? requestParams.page);
  const limit = Number(apiPagination.itemsPerPage ?? apiPagination.limit ?? requestParams.limit);
  const total = Number(apiPagination.totalItems ?? apiPagination.total ?? memorialsCount);

  return {
    page,
    limit,
    total,
    totalPages: Number(apiPagination.totalPages ?? Math.ceil(total / limit)),
    hasNext: apiPagination.hasNext ?? apiPagination.hasNextPage ?? page * limit < total,
    hasPrev: apiPagination.hasPrev ?? apiPagination.hasPrevPage ?? page > 1,
    search: requestParams.search
  };
};

// 🔧 NUEVO: Agregar función handleDeleteMemorial
const handleDeleteMemorial = async (memorialId, memorialName, loadMemorialsCallback) => {
  if (window.confirm(`¿Estás seguro de eliminar el memorial de "${memorialName}"? Esta acción no se puede deshacer.`)) {
    try {
      await memorialService.deleteMemorial(memorialId);
      // Recargar la lista
      loadMemorialsCallback();
    } catch (err) {
      alert('Error eliminando memorial: ' + err.message);
    }
  }
};

const MemorialList = () => {
  const navigate = useNavigate();
  const [memorials, setMemorials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState(createInitialPagination);
  const paginationRef = useRef(createInitialPagination());
  const latestRequestRef = useRef(0);

  const loadMemorials = useCallback(async (params = {}) => {
    const requestId = latestRequestRef.current + 1;
    latestRequestRef.current = requestId;

    try {
      setLoading(true);
      setError('');

      const currentPagination = paginationRef.current;
      const requestParams = {
        page: params.page ?? currentPagination.page,
        limit: params.limit ?? currentPagination.limit,
        search: params.search ?? currentPagination.search
      };

      const data = await memorialService.getMemorials(requestParams);
      const memorialsArray = data.profiles || data || [];

      if (requestId !== latestRequestRef.current) {
        return data;
      }

      const normalizedPagination = normalizePagination(
        data.pagination,
        requestParams,
        memorialsArray.length
      );

      setMemorials(memorialsArray);
      paginationRef.current = normalizedPagination;
      setPagination(normalizedPagination);

      return data;
    } catch (err) {
      setError(err.message);
    } finally {
      if (requestId === latestRequestRef.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    loadMemorials();
  }, [loadMemorials]);

  const formatDate = (dateString) => {
    if (!dateString) return 'Sin fecha';
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  const getMemorialStatus = (memorial) => {
    if (memorial.qr) {
      return { status: 'Activo', color: 'bg-green-100 text-green-800' };
    }
    return { status: 'Sin QR', color: 'bg-yellow-100 text-yellow-800' };
  };

  // ✅ BÚSQUEDA PAGINADA
  const handleSearch = useCallback((searchTerm) => {
    loadMemorials({ page: 1, search: searchTerm.trim() });
  }, [loadMemorials]);

  const changePage = useCallback((newPage) => {
    loadMemorials({ page: newPage });
  }, [loadMemorials]);

  const handleViewMemorial = (qrCode) => {
    // Abrir el memorial público en nueva pestaña
    window.open(`/memorial/${qrCode}`, '_blank');
  };

  const handlePrintQR = (memorialId) => {
    navigate(`/admin/memorials/${memorialId}/print-qr`);
  };

  if (loading && memorials.length === 0 && pagination.total === 0) {
    return (
      <div>
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/4 mb-6"></div>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white p-6 rounded-lg shadow">
                  <div className="h-4 bg-gray-300 rounded mb-2"></div>
                  <div className="h-3 bg-gray-300 rounded w-3/4"></div>
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
        {/* Header */}
        <div className="md:flex md:items-center md:justify-between mb-6">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              Memoriales
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Gestiona los memoriales digitales y sus códigos QR
            </p>
            <p className="mt-2 text-sm font-medium text-gray-700">
              {pagination.total} {pagination.total === 1 ? 'memorial activo' : 'memoriales activos'}
            </p>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4">
            <button
              type="button"
              onClick={() => navigate('/admin/clients')}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
            >
              <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Nuevo Memorial
            </button>
          </div>
        </div>

        {/* ✅ BÚSQUEDA SIMPLE */}
        <MemorialSearch 
          onSearch={handleSearch}
        />

        {loading && (
          <p className="mb-4 text-sm text-gray-500" aria-live="polite">
            Cargando memoriales...
          </p>
        )}

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

        {/* Lista de memoriales */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          {memorials.length === 0 ? (
            <div className="p-6 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No hay memoriales</h3>
              <p className="mt-1 text-sm text-gray-500">
                Crea tu primer memorial desde la lista de clientes.
              </p>
              <div className="mt-6">
                <button
                  onClick={() => navigate('/admin/clients')}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                >
                  <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Ver Clientes
                </button>
              </div>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {memorials.map((memorial) => {
                const status = getMemorialStatus(memorial);
                return (
                  <li key={memorial._id} className="hover:bg-gray-50 transition-colors duration-150">
                    <div className="px-6 py-5">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-start w-full sm:items-center sm:flex-1">
                          <div className="flex-shrink-0">
                            <div className="h-16 w-16 rounded-lg bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-md">
                              <span className="text-white font-bold text-xl">
                                {memorial.nombre?.charAt(0)?.toUpperCase() || 'M'}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4 min-w-0 flex-1 sm:ml-6">
                            <div className="flex items-center justify-between">
                              <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                  {memorial.nombre}
                                </h3>
                                <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600 mb-2">
                                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${status.color}`}>
                                    {status.status}
                                  </span>
                                  {memorial.qr && (
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                      QR: {memorial.qr.code}
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-gray-600 mb-1">
                                  Cliente: {memorial.client?.nombre || memorial.cliente?.nombre || memorial.clientName || 'No especificado'}
                                </p>
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                                  <span>Creado: {formatDate(memorial.createdAt)}</span>
                                  {memorial.fechaNacimiento && (
                                    <span>Nac: {formatDate(memorial.fechaNacimiento)}</span>
                                  )}
                                  {memorial.fechaFallecimiento && (
                                    <span>Fall: {formatDate(memorial.fechaFallecimiento)}</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 w-full sm:flex sm:w-auto sm:items-center sm:space-x-3 sm:ml-6">
                          {memorial.qr && (
                            <>
                              <button
                                onClick={() => handleViewMemorial(memorial.qr.code)}
                                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 rounded-lg shadow-sm transition-colors duration-200"
                                title="Ver memorial público"
                              >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                Ver Muro
                              </button>
                              <button
                                onClick={() => navigate(`/admin/memorials/${memorial._id}/comentarios`)}
                                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-lg shadow-sm transition-colors duration-200"
                                title="Configurar comentarios"
                              >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.477 8-10 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.477-8 10-8s10 3.582 10 8z" />
                                </svg>
                                Comentarios
                              </button>
                              <button
                                onClick={() => handlePrintQR(memorial._id)}
                                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg shadow-sm transition-colors duration-200"
                                title="Ver código QR"
                              >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                                </svg>
                                QR
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => navigate(`/admin/memorials/edit/${memorial._id}`)}
                            className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg shadow-sm transition-colors duration-200"
                            title="Editar memorial"
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Editar
                          </button>
                          <button
                            onClick={() => handleDeleteMemorial(memorial._id, memorial.nombre, loadMemorials)}
                            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm transition-colors duration-200"
                            title="Eliminar memorial"
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
                );
              })}
            </ul>
          )}
        </div>

        {memorials.length > 0 && (
          <div className="bg-white px-4 py-3 flex flex-col gap-3 border-t border-gray-200 sm:px-6 sm:flex-row sm:items-center sm:justify-between mt-6">
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

            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between gap-3 sm:justify-end">
                <button
                  onClick={() => changePage(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Anterior
                </button>
                <span className="text-sm text-gray-600">
                  Página <span className="font-medium">{pagination.page}</span> de{' '}
                  <span className="font-medium">{pagination.totalPages}</span>
                </span>
                <button
                  onClick={() => changePage(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Siguiente
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MemorialList;
