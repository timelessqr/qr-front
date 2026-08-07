// ====================================
// src/services/qrService.js - Servicio de gestión de códigos QR
// ====================================
import api, { handleApiError, getApiData } from './api';

class QRService {
  // 🏗️ Generar QR para un memorial
  async generateQR(memorialId) {
    try {
      const response = await api.post(`/qr/generate/${memorialId}`);
      return getApiData(response);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  // 📋 Obtener todos los QR
  async getAllQRs(params = {}) {
    try {
      const { page = 1, limit = 20, search = '' } = params;
      const response = await api.get('/qr', {
        params: { page, limit, search }
      });
      return getApiData(response);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  // 📊 Obtener estadísticas de un QR
  async getQRStats(qrCode) {
    try {
      const response = await api.get(`/qr/${qrCode}/stats`);
      return getApiData(response);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  // 📱 Construir URL completa del memorial
  buildMemorialURL(qrCode) {
    const baseURL = window.location.origin;
    return `${baseURL}/memorial/${qrCode}`;
  }

  // 🖨️ Generar datos para impresión
  generatePrintData(memorial, qrData) {
    return {
      qrCode: qrData.code,
      qrImageUrl: qrData.qrImageUrl || qrData.imageUrl,
      memorialName: memorial.nombre,
      memorialURL: this.buildMemorialURL(qrData.code),
      clientName: memorial.client?.nombre || 'Cliente',
      generatedDate: new Date().toLocaleDateString('es-ES'),
      instructions: 'Escanee este código QR para ver el memorial digital'
    };
  }

  // 🎯 Generar QR en Base64 para mostrar en la interfaz
  async generateQRBase64(text, options = {}) {
    const defaultOptions = {
      width: 200,
      height: 200,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    };

    const finalOptions = { ...defaultOptions, ...options };

    try {
      // Si tienes una función para generar QR en el cliente, la usas aquí
      // Por ahora, retornamos la URL del backend que debería generar el QR
      const response = await api.post('/qr/generate-image', {
        text,
        options: finalOptions
      });
      return getApiData(response);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  // 📊 Métricas de uso de QRs
  async getQRMetrics() {
    try {
      const response = await api.get('/admin/metrics');
      const data = getApiData(response);
      return data.qr || {};
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  // 🔍 Validar si un código QR existe
  async validateQRCode(qrCode) {
    try {
      const response = await api.get(`/memorial/${qrCode}`);
      return !!getApiData(response);
    } catch {
      return false;
    }
  }
}

export default new QRService();
