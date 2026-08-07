// ====================================
// src/hooks/useClients.js - Hook para gestión de clientes (CORREGIDO)
// ====================================
import { useState, useEffect, useCallback, useRef } from 'react';
import { clientService } from '../services';

const createInitialPagination = () => ({
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 0,
  hasNext: false,
  hasPrev: false,
  search: ''
});

const normalizePagination = (apiPagination = {}, requestParams, clientsCount) => {
  const page = Number(apiPagination.currentPage ?? apiPagination.page ?? requestParams.page);
  const limit = Number(apiPagination.itemsPerPage ?? apiPagination.limit ?? requestParams.limit);
  const total = Number(apiPagination.totalItems ?? apiPagination.total ?? clientsCount);

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

export const useClients = (autoLoad = true) => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(createInitialPagination);
  const paginationRef = useRef(createInitialPagination());
  const latestRequestRef = useRef(0);

  // 🔧 MEMOIZAR: Cargar clientes con paginación
  const loadClients = useCallback(async (params = {}) => {
    const requestId = latestRequestRef.current + 1;
    latestRequestRef.current = requestId;

    try {
      setLoading(true);
      setError(null);

      const currentPagination = paginationRef.current;
      const requestParams = {
        page: params.page ?? currentPagination.page,
        limit: params.limit ?? currentPagination.limit,
        search: params.search ?? currentPagination.search
      };

      const data = await clientService.getClients(requestParams);
      const clientsArray = data.clients || data || [];

      if (requestId !== latestRequestRef.current) {
        return data;
      }

      const normalizedPagination = normalizePagination(
        data.pagination,
        requestParams,
        clientsArray.length
      );

      setClients(clientsArray);
      paginationRef.current = normalizedPagination;
      setPagination(normalizedPagination);

      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      if (requestId === latestRequestRef.current) {
        setLoading(false);
      }
    }
  }, []);

  // 🔧 MEMOIZAR: Buscar clientes
  const searchClients = useCallback(async (query) => {
    return loadClients({ page: 1, search: query.trim() });
  }, [loadClients]);

  // 🔧 MEMOIZAR: Crear cliente
  const createClient = useCallback(async (clientData) => {
    try {
      setLoading(true);
      setError(null);
      const newClient = await clientService.createClient(clientData);
      
      // Agregar a la lista actual
      setClients(prev => [newClient, ...prev]);
      
      return newClient;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // 🔧 MEMOIZAR: Actualizar cliente
  const updateClient = useCallback(async (clientId, clientData) => {
    try {
      setLoading(true);
      setError(null);
      const updatedClient = await clientService.updateClient(clientId, clientData);
      
      // Actualizar en la lista
      setClients(prev => 
        prev.map(client => 
          (client.id || client._id) === clientId ? updatedClient : client
        )
      );
      
      return updatedClient;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // 🔧 MEMOIZAR: Eliminar cliente
  const deleteClient = useCallback(async (clientId) => {
    try {
      setLoading(true);
      setError(null);
      await clientService.deleteClient(clientId);
      
      // Remover de la lista
      setClients(prev => prev.filter(client => (client.id || client._id) !== clientId));
      
      return true;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // 🔧 MEMOIZAR: Cambiar página
  const changePage = useCallback((newPage) => {
    loadClients({ page: newPage });
  }, [loadClients]);

  // 🔧 MEMOIZAR: Cambiar tamaño de página
  const changePageSize = useCallback((newLimit) => {
    loadClients({ page: 1, limit: newLimit });
  }, [loadClients]);

  // 🔧 MEMOIZAR: Función para limpiar errores
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // ✅ CARGAR AL MONTAR: Solo una vez con autoLoad
  useEffect(() => {
    if (autoLoad) {
      loadClients();
    }
  }, [autoLoad, loadClients]);

  return {
    clients,
    loading,
    error,
    pagination,
    loadClients,
    searchClients,
    createClient,
    updateClient,
    deleteClient,
    changePage,
    changePageSize,
    setError: clearError
  };
};

export default useClients;
