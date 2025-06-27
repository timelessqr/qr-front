// ====================================
// src/services/mediaService.js - Servicio para gestión de media
// ====================================
import api from './api';

class MediaService {
  // Subir archivos de media
  async uploadFiles(profileId, formData, onProgress = null) {
    try {
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      };

      if (onProgress) {
        config.onUploadProgress = onProgress;
      }

      const response = await api.post(`/media/upload/${profileId}`, formData, config);
      return response.data;
    } catch (error) {
      console.error('Error subiendo archivos:', error);
      throw error;
    }
  }

  // Obtener media por perfil
  async getByProfile(profileId, filters = {}) {
    try {
      const params = new URLSearchParams();
      
      if (filters.tipo) params.append('tipo', filters.tipo);
      if (filters.seccion) params.append('seccion', filters.seccion);
      if (filters.estado) params.append('estado', filters.estado);

      const url = `/media/profile/${profileId}?${params.toString()}`;
      console.log('🔍 MediaService - URL completa:', url);
      console.log('🔍 MediaService - Filtros enviados:', filters);
      
      const response = await api.get(url);
      console.log('🔍 MediaService - Respuesta del servidor:', response.data);
      
      return response.data;
    } catch (error) {
      console.error('❌ MediaService - Error obteniendo media del perfil:', error);
      console.error('❌ MediaService - URL que falló:', `/media/profile/${profileId}?${new URLSearchParams(filters).toString()}`);
      throw error;
    }
  }

  // Obtener media público para memorial
  async getPublicMedia(profileId, seccion = null) {
    try {
      const params = seccion ? `?seccion=${seccion}` : '';
      const response = await api.get(`/media/public/${profileId}${params}`);
      return response.data;
    } catch (error) {
      console.error('Error obteniendo media público:', error);
      throw error;
    }
  }

  // Obtener media específico por ID
  async getById(mediaId) {
    try {
      const response = await api.get(`/media/${mediaId}`);
      return response.data;
    } catch (error) {
      console.error('Error obteniendo media:', error);
      throw error;
    }
  }

  // Actualizar información de media
  async updateMedia(mediaId, updates) {
    try {
      const response = await api.put(`/media/${mediaId}`, updates);
      return response.data;
    } catch (error) {
      console.error('Error actualizando media:', error);
      throw error;
    }
  }

  // Eliminar media
  async deleteMedia(mediaId) {
    try {
      const response = await api.delete(`/media/${mediaId}`);
      return response.data;
    } catch (error) {
      console.error('Error eliminando media:', error);
      throw error;
    }
  }

  // Reordenar media en una sección
  async reorderMedia(profileId, sectionData) {
    try {
      const response = await api.put(`/media/reorder/${profileId}`, sectionData);
      return response.data;
    } catch (error) {
      console.error('Error reordenando media:', error);
      throw error;
    }
  }

  // Obtener estadísticas de media de un perfil
  async getProfileStats(profileId) {
    try {
      const response = await api.get(`/media/stats/${profileId}`);
      return response.data;
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      throw error;
    }
  }

  // Obtener media del usuario actual
  async getUserMedia(filters = {}) {
    try {
      const params = new URLSearchParams();
      
      if (filters.tipo) params.append('tipo', filters.tipo);
      if (filters.estado) params.append('estado', filters.estado);

      const response = await api.get(`/media/my-media?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error obteniendo media del usuario:', error);
      throw error;
    }
  }

  // Obtener estado de procesamiento
  async getProcessingStatus() {
    try {
      const response = await api.get('/media/processing-status');
      return response.data;
    } catch (error) {
      console.error('Error obteniendo estado de procesamiento:', error);
      throw error;
    }
  }

  // === NUEVOS MÉTODOS PARA FUNCIONALIDADES ESPECÍFICAS ===

  // Obtener fondos del memorial
  async getBackgrounds(profileId) {
    try {
      const response = await api.get(`/media/backgrounds/${profileId}`);
      return response.data;
    } catch (error) {
      console.error('Error obteniendo fondos:', error);
      throw error;
    }
  }

  // Obtener música del memorial
  async getMusic(profileId) {
    try {
      const response = await api.get(`/media/music/${profileId}`);
      return response.data;
    } catch (error) {
      console.error('Error obteniendo música:', error);
      throw error;
    }
  }

  // Configurar slideshow de fondos
  async updateSlideshowConfig(profileId, config) {
    try {
      const response = await api.put(`/media/slideshow-config/${profileId}`, config);
      return response.data;
    } catch (error) {
      console.error('Error actualizando configuración de slideshow:', error);
      throw error;
    }
  }

  // Obtener configuración de slideshow
  async getSlideshowConfig(profileId) {
    try {
      const response = await api.get(`/media/slideshow-config/${profileId}`);
      return response.data;
    } catch (error) {
      console.error('Error obteniendo configuración de slideshow:', error);
      throw error;
    }
  }

  // Validar URL de YouTube
  validateYouTubeUrl(url) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  }

  // Extraer ID de YouTube
  extractYouTubeId(url) {
    return this.validateYouTubeUrl(url);
  }

  // Obtener thumbnail de YouTube
  getYouTubeThumbnail(videoId, quality = 'maxresdefault') {
    return `https://img.youtube.com/vi/${videoId}/${quality}.jpg`;
  }

  // Generar URL de embed de YouTube
  getYouTubeEmbedUrl(videoId, autoplay = false, options = {}) {
    const params = new URLSearchParams({
      ...options,
      ...(autoplay && { autoplay: 1 })
    });
    
    return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
  }

  // === MÉTODOS DE UTILIDAD ===

  // Formatear tamaño de archivo
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Validar tipo de archivo
  validateFileType(file, allowedTypes = ['image', 'video']) {
    const fileType = file.type.split('/')[0];
    return allowedTypes.includes(fileType);
  }

  // Validar tamaño de archivo
  validateFileSize(file, maxSizeMB = 100) {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    return file.size <= maxSizeBytes;
  }

  // Procesar archivo antes de subir
  prepareFileForUpload(file, section = 'galeria') {
    const validTypes = section === 'fondos' ? ['image'] : ['image', 'video'];
    
    if (!this.validateFileType(file, validTypes)) {
      throw new Error(`Tipo de archivo no permitido para la sección ${section}`);
    }

    if (!this.validateFileSize(file)) {
      throw new Error('El archivo excede el tamaño máximo permitido (100MB)');
    }

    return {
      file,
      type: file.type.split('/')[0],
      size: file.size,
      name: file.name,
      valid: true
    };
  }

  // Obtener todas las secciones de media
  async getAllSections(profileId) {
    try {
      const [galeria, fondos, musica] = await Promise.all([
        this.getByProfile(profileId, { seccion: 'galeria' }),
        this.getByProfile(profileId, { seccion: 'fondos' }),
        this.getByProfile(profileId, { seccion: 'musica' })
      ]);

      return {
        galeria: galeria.data || [],
        fondos: fondos.data || [],
        musica: musica.data || [],
        stats: {
          totalMedia: (galeria.data?.length || 0) + (fondos.data?.length || 0) + (musica.data?.length || 0),
          totalFotos: galeria.data?.filter(m => m.tipo === 'imagen').length || 0,
          totalVideos: galeria.data?.filter(m => m.tipo === 'video').length || 0,
          totalFondos: fondos.data?.length || 0,
          totalMusica: musica.data?.length || 0
        }
      };
    } catch (error) {
      console.error('Error obteniendo todas las secciones:', error);
      throw error;
    }
  }
}

export const mediaService = new MediaService();
export default mediaService;
