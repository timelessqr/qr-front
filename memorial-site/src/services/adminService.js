// ====================================
// src/services/adminService.js - Servicio de administración general
// ====================================
import api, { handleApiError, getApiData } from './api';

class AdminService {
  // 📊 Obtener dashboard principal
  async getDashboard() {
    try {
      const response = await api.get('/admin/dashboard');
      return getApiData(response);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  // 🏗️ Registro completo (cliente + memorial)
  async registerComplete(data) {
    try {
      const response = await api.post('/admin/register-complete', data);
      return getApiData(response);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  // 🔍 Búsqueda global en el sistema
  async globalSearch(query) {
    try {
      const response = await api.get('/admin/search', {
        params: { q: query }
      });
      return getApiData(response);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  // 📊 Métricas del sistema
  async getMetrics() {
    try {
      const response = await api.get('/admin/metrics');
      return getApiData(response);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  // 🏥 Estado del sistema
  async getHealth() {
    try {
      const response = await api.get('/admin/health');
      return getApiData(response);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  // ⚙️ Configuración del sistema
  async getConfig() {
    try {
      const response = await api.get('/admin/config');
      return getApiData(response);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
}

export default new AdminService();
