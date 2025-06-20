// ====================================
// src/services/memorialService.js - Servicio de gestión de memoriales
// ====================================
import api, { handleApiError, getApiData } from './api';

class MemorialService {
  // 📋 Obtener todos los memoriales/perfiles
  async getMemorials() {
    try {
      const response = await api.get('/profiles');
      return getApiData(response);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  // 👤 Obtener memorial por ID
  async getMemorialById(memorialId) {
    try {
      const response = await api.get(`/profiles/${memorialId}`);
      return getApiData(response);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  // 📋 Obtener memoriales de un cliente
  async getClientMemorials(clientId) {
    try {
      const response = await api.get(`/profiles/client/${clientId}`);
      return getApiData(response);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  // ➕ Crear nuevo memorial
  async createMemorial(memorialData) {
    try {
      const response = await api.post('/profiles', memorialData);
      return getApiData(response);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  // ⚡ Crear memorial básico/rápido
  async createBasicMemorial(memorialData) {
    try {
      const response = await api.post('/profiles/basic', memorialData);
      return getApiData(response);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  // ⚡ Crear memorial rápido para un cliente
  async createQuickMemorial(clientId, memorialData) {
    try {
      const response = await api.post(`/admin/clients/${clientId}/quick-memorial`, memorialData);
      return getApiData(response);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  // ✏️ Actualizar memorial
  async updateMemorial(memorialId, memorialData) {
    try {
      const response = await api.put(`/profiles/${memorialId}`, memorialData);
      return getApiData(response);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  // 🗑️ Eliminar memorial
  async deleteMemorial(memorialId) {
    try {
      const response = await api.delete(`/profiles/${memorialId}`);
      return getApiData(response);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  // 🌐 Obtener memorial público (sin auth)
  async getPublicMemorial(qrCode) {
    try {
      // Esta llamada no necesita auth, así que creamos una instancia temporal
      const response = await api.get(`/memorial/${qrCode}`);
      return getApiData(response);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  // 🎨 Obtener dashboard de memorial
  async getMemorialDashboard(memorialId) {
    try {
      const response = await api.get(`/dashboard/${memorialId}`);
      return getApiData(response);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  // 🎨 Crear/actualizar dashboard
  async updateDashboard(memorialId, dashboardData) {
    try {
      const response = await api.post(`/dashboard/${memorialId}`, dashboardData);
      return getApiData(response);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  // 🎯 Cambiar tema del memorial
  async changeTheme(memorialId, theme) {
    try {
      const response = await api.put(`/dashboard/${memorialId}/theme`, { tema: theme });
      return getApiData(response);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  // 🔧 Actualizar configuración del dashboard
  async updateDashboardConfig(memorialId, config) {
    try {
      const response = await api.put(`/dashboard/${memorialId}/config`, config);
      return getApiData(response);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
}

export default new MemorialService();
