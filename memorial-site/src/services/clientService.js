// ====================================
// src/services/clientService.js - Servicio de gestión de clientes
// ====================================
import api, { handleApiError, getApiData } from './api';

class ClientService {
  // 📋 Obtener todos los clientes con paginación
  async getClients(params = {}) {
    try {
      const { page = 1, limit = 20, search = '' } = params;
      const response = await api.get('/clients', {
        params: { page, limit, search }
      });
      return getApiData(response);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  // 👤 Obtener cliente por ID
  async getClientById(clientId) {
    try {
      const response = await api.get(`/clients/${clientId}`);
      return getApiData(response);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  // 🔍 Obtener cliente por código
  async getClientByCode(codigo) {
    try {
      const response = await api.get(`/clients/code/${codigo}`);
      return getApiData(response);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  // ➕ Crear nuevo cliente
  async createClient(clientData) {
    try {
      const response = await api.post('/clients', clientData);
      return getApiData(response);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  // ✏️ Actualizar cliente
  async updateClient(clientId, clientData) {
    try {
      const response = await api.put(`/clients/${clientId}`, clientData);
      return getApiData(response);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  // 🗑️ Eliminar cliente
  async deleteClient(clientId) {
    try {
      const response = await api.delete(`/clients/${clientId}`);
      return getApiData(response);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  // 🔍 Buscar clientes
  async searchClients(query) {
    try {
      const response = await api.get('/clients/search', {
        params: { q: query }
      });
      return getApiData(response);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  // 📊 Estadísticas de clientes
  async getClientStats() {
    try {
      const response = await api.get('/clients/stats');
      return getApiData(response);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  // 📋 Resumen completo de un cliente (con memoriales)
  async getClientSummary(clientId) {
    try {
      const response = await api.get(`/admin/clients/${clientId}/summary`);
      return getApiData(response);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
}

export default new ClientService();
