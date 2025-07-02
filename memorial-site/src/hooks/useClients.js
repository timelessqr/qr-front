// ====================================
// src/hooks/useClients.js - Hook para gestión de clientes (CORREGIDO)
// ====================================
import { useState, useEffect, useCallback } from 'react';
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

  // 🔧 MEMOIZAR: Cargar clientes con paginación
  const loadClients = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const requestParams = {
        page: pagination.page,
        limit: pagination.limit,
        ...params
      };

      const data = await clientService.getClients(requestParams);
      
      // 🚨 DEBUG: Ver estructura de datos del backend
      console.log('=== DEBUG useClients loadClients ===');
      console.log('Data recibida del service:', data);
      console.log('¿Tiene data.clients?', !!data.clients);
      console.log('¿Es data un array?', Array.isArray(data));
      
      // 🔧 FIX: Extraer clientes de forma inteligente
      const clientsArray = data.clients || data || [];
      console.log('Clients array procesado:', clientsArray);
      console.log('Primer cliente (si existe):', clientsArray[0]);
      if (clientsArray[0]) {
        console.log('Propiedades del primer cliente:', Object.keys(clientsArray[0]));
        console.log('ID del primer cliente:', clientsArray[0].id || clientsArray[0]._id);
      }
      
      setClients(clientsArray);
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
  }, [pagination.page, pagination.limit]); // ✅ Solo dependencias necesarias

  // 🔧 MEMOIZAR: Buscar clientes
  const searchClients = useCallback(async (query) => {
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
  }, []); // ✅ Sin dependencias porque no usa state

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
  }, []);

  // 🔧 MEMOIZAR: Eliminar cliente
  const deleteClient = useCallback(async (clientId) => {
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
  }, [autoLoad]); // ✅ NO incluir loadClients aquí - solo autoLoad

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