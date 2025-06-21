// ====================================
// src/services/comentarioService.js - Servicio para comentarios
// ====================================
import api, { handleApiError, getApiData } from './api';

class ComentarioService {
  
  // 🔐 Validar código familiar
  async validarCodigo(qrCode, codigo) {
    try {
      console.log(`🔐 Validando código para memorial: ${qrCode}`);
      
      const response = await api.post(`/memorial/${qrCode}/validar-codigo`, {
        codigoComentarios: codigo
      });
      
      const data = getApiData(response);
      console.log('✅ Código validado exitosamente:', data);
      
      // El backend devuelve el token en data.token
      return {
        success: true,
        token: data.token,
        message: data.message || 'Código validado correctamente'
      };
      
    } catch (error) {
      console.error('❌ Error validando código:', error);
      return {
        success: false,
        message: handleApiError(error)
      };
    }
  }

  // 📝 Crear nuevo comentario (requiere token)
  async crearComentario(qrCode, comentarioData, token) {
    try {
      console.log(`📝 Creando comentario para memorial: ${qrCode}`);
      
      // Agregar el token al body según lo que espera el backend
      const payload = {
        ...comentarioData,
        token: token
      };
      
      const response = await api.post(`/memorial/${qrCode}/comentarios`, payload);
      
      const data = getApiData(response);
      console.log('✅ Comentario creado exitosamente:', data);
      
      return {
        success: true,
        comentario: data.comentario || data,
        message: data.message || 'Comentario publicado correctamente'
      };
      
    } catch (error) {
      console.error('❌ Error creando comentario:', error);
      return {
        success: false,
        message: handleApiError(error)
      };
    }
  }

  // 📖 Obtener comentarios públicos con paginación
  async obtenerComentarios(qrCode, page = 1, limit = 10) {
    try {
      console.log(`📖 Obteniendo comentarios para memorial: ${qrCode} (página ${page})`);
      
      const response = await api.get(`/memorial/${qrCode}/comentarios`, {
        params: { page, limit }
      });
      
      const data = getApiData(response);
      console.log('✅ Comentarios obtenidos:', data);
      
      return {
        success: true,
        comentarios: data.comentarios || data.data || [],
        pagination: data.pagination || {
          total: data.total || 0,
          page: data.page || page,
          limit: data.limit || limit,
          totalPages: data.totalPages || 1
        }
      };
      
    } catch (error) {
      console.error('❌ Error obteniendo comentarios:', error);
      return {
        success: false,
        comentarios: [],
        pagination: { total: 0, page: 1, limit: 10, totalPages: 1 },
        message: handleApiError(error)
      };
    }
  }

  // ⚙️ Obtener configuración de comentarios
  async obtenerConfiguracion(qrCode) {
    try {
      console.log(`⚙️ Obteniendo configuración de comentarios para: ${qrCode}`);
      
      const response = await api.get(`/memorial/${qrCode}/comentarios/config`);
      
      const data = getApiData(response);
      console.log('✅ Configuración obtenida:', data);
      
      return {
        success: true,
        config: {
          habilitados: data.habilitados || false,
          requiereCodigo: data.requiereCodigo || false,
          codigo: data.codigoComentarios || data.codigo || '',
          mensaje: data.mensaje || ''
        }
      };
      
    } catch (error) {
      console.error('❌ Error obteniendo configuración:', error);
      return {
        success: false,
        config: {
          habilitados: false,
          requiereCodigo: true,
          mensaje: 'Error al cargar configuración'
        },
        message: handleApiError(error)
      };
    }
  }

  // ===============================
  // 🔧 MÉTODOS PARA ADMIN
  // ===============================

  // 🔧 Configurar código de comentarios (solo admin)
  async configurarCodigo(profileId, configuracion) {
    try {
      console.log(`🔧 Configurando código para profile: ${profileId}`);
      
      const response = await api.put(`/admin/profiles/${profileId}/codigo-comentarios`, configuracion);
      
      const data = getApiData(response);
      console.log('✅ Código configurado exitosamente:', data);
      
      return {
        success: true,
        config: data.config || data,
        message: data.message || 'Configuración actualizada correctamente'
      };
      
    } catch (error) {
      console.error('❌ Error configurando código:', error);
      return {
        success: false,
        message: handleApiError(error)
      };
    }
  }

  // 🎲 Generar código automático (solo admin)
  async generarCodigo(profileId) {
    try {
      console.log(`🎲 Generando código automático para profile: ${profileId}`);
      
      const response = await api.post(`/admin/profiles/${profileId}/generar-codigo`);
      
      const data = getApiData(response);
      console.log('✅ Código generado exitosamente:', data);
      
      return {
        success: true,
        codigo: data.codigoComentarios || data.codigo,
        message: data.message || 'Código generado correctamente'
      };
      
    } catch (error) {
      console.error('❌ Error generando código:', error);
      return {
        success: false,
        message: handleApiError(error)
      };
    }
  }

  // 📋 Obtener todos los comentarios para admin (con moderación)
  async obtenerComentariosAdmin(profileId, page = 1, limit = 20) {
    try {
      console.log(`📋 Obteniendo comentarios admin para profile: ${profileId}`);
      
      const response = await api.get(`/admin/profiles/${profileId}/comentarios`, {
        params: { page, limit }
      });
      
      const data = getApiData(response);
      console.log('✅ Comentarios admin obtenidos:', data);
      
      return {
        success: true,
        comentarios: data.comentarios || data.data || [],
        pagination: data.pagination || {
          total: data.total || 0,
          page: data.page || page,
          limit: data.limit || limit,
          totalPages: data.totalPages || 1
        }
      };
      
    } catch (error) {
      console.error('❌ Error obteniendo comentarios admin:', error);
      return {
        success: false,
        comentarios: [],
        pagination: { total: 0, page: 1, limit: 20, totalPages: 1 },
        message: handleApiError(error)
      };
    }
  }

  // 🗑️ Eliminar comentario (solo admin)
  async eliminarComentario(profileId, comentarioId) {
    try {
      console.log(`🗑️ Eliminando comentario ${comentarioId}`);
      
      const response = await api.delete(`/admin/comentarios/${comentarioId}`);
      
      const data = getApiData(response);
      console.log('✅ Comentario eliminado:', data);
      
      return {
        success: true,
        message: data.message || 'Comentario eliminado correctamente'
      };
      
    } catch (error) {
      console.error('❌ Error eliminando comentario:', error);
      return {
        success: false,
        message: handleApiError(error)
      };
    }
  }

  // ===============================
  // 🔧 HELPERS
  // ===============================

  // 💾 Guardar token de comentario en localStorage temporal
  guardarToken(qrCode, token) {
    const key = `comentario_token_${qrCode}`;
    localStorage.setItem(key, token);
    
    // Auto-eliminar token después de 1 hora
    setTimeout(() => {
      this.eliminarToken(qrCode);
    }, 60 * 60 * 1000); // 1 hora
    
    console.log(`💾 Token guardado para ${qrCode}`);
  }

  // 🔑 Obtener token guardado
  obtenerToken(qrCode) {
    const key = `comentario_token_${qrCode}`;
    const token = localStorage.getItem(key);
    console.log(`🔑 Token obtenido para ${qrCode}:`, token ? 'existe' : 'no existe');
    return token;
  }

  // 🗑️ Eliminar token guardado
  eliminarToken(qrCode) {
    const key = `comentario_token_${qrCode}`;
    localStorage.removeItem(key);
    console.log(`🗑️ Token eliminado para ${qrCode}`);
  }

  // ✅ Verificar si tiene token válido
  tieneToken(qrCode) {
    const token = this.obtenerToken(qrCode);
    return !!token;
  }
}

// Exportar instancia única
const comentarioService = new ComentarioService();
export default comentarioService;