// ====================================
// src/hooks/useClients.js - Hook para gestión de clientes
// ====================================
import { useState, useEffect } from 'react';
import { clientService } from '../services';

export const useClients = (autoLoad = true) => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });

  // Cargar clientes con paginación
  const loadClients = async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const requestParams = {
        page: pagination.page,
        limit: pagination.limit,
        ...params
      };

      const data = await clientService.getClients(requestParams);
      
      setClients(data.clients || data);
      setPagination(prev => ({
        ...prev,
        ...data.pagination,
        ...params
      }));

      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Buscar clientes
  const searchClients = async (query) => {
    try {
      setLoading(true);
      setError(null);
      const data = await clientService.searchClients(query);
      setClients(data);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Crear cliente
  const createClient = async (clientData) => {
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
  };

  // Actualizar cliente
  const updateClient = async (clientId, clientData) => {
    try {
      setLoading(true);
      setError(null);
      const updatedClient = await clientService.updateClient(clientId, clientData);
      
      // Actualizar en la lista
      setClients(prev => 
        prev.map(client => 
          client._id === clientId ? updatedClient : client
        )
      );
      
      return updatedClient;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Eliminar cliente
  const deleteClient = async (clientId) => {
    try {
      setLoading(true);
      setError(null);
      await clientService.deleteClient(clientId);
      
      // Remover de la lista
      setClients(prev => prev.filter(client => client._id !== clientId));
      
      return true;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Cambiar página
  const changePage = (newPage) => {
    loadClients({ page: newPage });
  };

  // Cambiar tamaño de página
  const changePageSize = (newLimit) => {
    loadClients({ page: 1, limit: newLimit });
  };

  // Cargar al montar el componente
  useEffect(() => {
    if (autoLoad) {
      loadClients();
    }
  }, [autoLoad]);

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
    setError
  };
};

export default useClients;
