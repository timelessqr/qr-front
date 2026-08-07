// ====================================
// src/pages/admin/QRManagement.jsx - Página de gestión de códigos QR
// ====================================
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { qrService } from '../../services';

const QRManagement = () => {
  const navigate = useNavigate();
  const [qrs, setQrs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
    search: ''
  });
  const paginationRef = useRef(pagination);
  const latestRequestRef = useRef(0);

  const loadQRData = useCallback(async (params = {}) => {
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
      const qrData = await qrService.getAllQRs(requestParams);

      if (requestId !== latestRequestRef.current) {
        return;
      }

      const nextPagination = {
        page: Number(qrData.currentPage ?? requestParams.page),
        limit: requestParams.limit,
        total: Number(qrData.totalQRs ?? qrData.qrs?.length ?? 0),
        totalPages: Number(qrData.totalPages ?? 0),
        hasNext: qrData.hasNextPage ?? false,
        hasPrev: qrData.hasPrevPage ?? requestParams.page > 1,
        search: requestParams.search
      };

      setQrs(qrData.qrs || []);
      paginationRef.current = nextPagination;
      setPagination(nextPagination);

    } catch (err) {
      if (requestId === latestRequestRef.current) {
        setError(err.message);
      }
    } finally {
      if (requestId === latestRequestRef.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadQRData({ page: 1, search: searchTerm.trim() });
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, loadQRData]);

  const handleViewMemorial = (qrCode) => {
    // Abrir el memorial público en nueva pestaña
    window.open(`/memorial/${qrCode}`, '_blank');
  };

  const handleViewQRPage = (qr) => {
    // Navegar a la página individual del QR usando el ID del memorial
    const memorialId = qr.referencia?._id || qr.referencia;
    navigate(`/admin/memorials/${memorialId}/print-qr`);
  };

  const changePage = (newPage) => {
    loadQRData({ page: newPage });
  };

  if (loading && qrs.length === 0 && pagination.total === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-1/4 mb-6"></div>
          <div className="bg-white rounded-lg shadow">
            <div className="h-64 bg-gray-300 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl">
            Gestión de Códigos QR
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Administra todos los códigos QR de los memoriales digitales
          </p>
          <p className="mt-2 text-sm font-medium text-gray-700">
            {pagination.total} {pagination.total === 1 ? 'código QR activo' : 'códigos QR activos'}
          </p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <button
            onClick={() => loadQRData()}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Actualizar
          </button>
        </div>
      </div>

      {loading && (
        <p className="mb-4 text-sm text-gray-500" aria-live="polite">
          Cargando códigos QR...
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

      {/* Buscador */}
      <div className="mb-6">
        <div className="max-w-lg">
          <label htmlFor="search" className="sr-only">Buscar QRs</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              id="search"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-red-500 focus:border-red-500"
              placeholder="Buscar por código o memorial..."
            />
          </div>
        </div>
      </div>

      {/* Lista de QRs */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {qrs.length === 0 ? (
            <li className="px-6 py-12 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No hay códigos QR</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm ? 'No se encontraron QRs que coincidan con tu búsqueda.' : 'Comienza creando memoriales para generar códigos QR.'}
              </p>
            </li>
          ) : (
            qrs.map((qr) => (
              <li key={qr.id || qr._id} className="hover:bg-gray-50 transition-colors duration-150">
                <div className="px-6 py-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start flex-1 sm:items-center">
                      <div className="flex-shrink-0">
                        <div className="h-16 w-16 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-gray-200">
                          <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                          </svg>
                        </div>
                      </div>
                      <div className="ml-6 flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">
                              {qr.referencia?.nombre || 'Memorial sin nombre'}
                            </h3>
                            <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                qr.estado === 'activo' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                              }`}>
                                {qr.estado || 'activo'}
                              </span>
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                QR: {qr.code}
                              </span>
                            </div>
                            <div className="text-sm text-gray-600">
                              <p>Creado: {qr.fechaCreacion ? new Date(qr.fechaCreacion).toLocaleDateString() : 'N/A'}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 w-full sm:flex sm:w-auto sm:items-center sm:space-x-3 sm:ml-6">
                      <button
                        onClick={() => handleViewMemorial(qr.code)}
                        className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 rounded-lg shadow-sm transition-colors duration-200"
                        title="Ver muro público"
                      >
                        <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        Ver Muro
                      </button>
                      <button
                        onClick={() => handleViewQRPage(qr)}
                        className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg shadow-sm transition-colors duration-200"
                        title="Ver código QR"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                        </svg>
                        QR
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>

      {!loading && qrs.length > 0 && (
        <div className="bg-white px-4 py-3 flex flex-col gap-3 border-t border-gray-200 sm:px-6 sm:flex-row sm:items-center sm:justify-between mt-6">
          <p className="text-sm text-gray-700">
            Mostrando{' '}
            <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span>
            {' '}a{' '}
            <span className="font-medium">
              {Math.min(pagination.page * pagination.limit, pagination.total)}
            </span>
            {' '}de <span className="font-medium">{pagination.total}</span> resultados
          </p>

          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between gap-3 sm:justify-end">
              <button
                onClick={() => changePage(pagination.page - 1)}
                disabled={!pagination.hasPrev}
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
                disabled={!pagination.hasNext}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Siguiente
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default QRManagement;
