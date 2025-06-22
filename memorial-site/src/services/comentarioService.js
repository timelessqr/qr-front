// ====================================
// src/services/comentarioService.js - Frontend ACTUALIZADO CON TIEMPO CORRECTO
// ====================================
import api, { handleApiError, getApiData } from './api';

class ComentarioService {
  
  // 🔐 Validar código familiar/cliente
  async validarCodigo(qrCode, codigo) {
    try {
      console.log(`🔐 Validando código para memorial: ${qrCode}`);
      
      const response = await api.post(`/memorial/${qrCode}/validar-codigo`, {
        codigoComentarios: codigo
      });
      
      const data = getApiData(response);
      console.log('✅ Código validado exitosamente:', data);
      
      // El backend ahora devuelve nivel y permisos
      return {
        success: true,
        token: data.token,
        nivel: data.nivel, // 🆕 'familiar' o 'cliente'
        permisos: data.permisos, // 🆕 ['comentar'] o ['comentar', 'responder']
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

  // 🆕 Dar like a un comentario
  async darLike(qrCode, comentarioId) {
    try {
      console.log(`❤️ Dando like a comentario: ${comentarioId}`);
      
      const response = await api.post(`/memorial/${qrCode}/comentarios/${comentarioId}/like`);
      
      const data = getApiData(response);
      console.log('✅ Like agregado exitosamente:', data);
      
      return {
        success: true,
        likes: data.likes,
        message: data.message || 'Like agregado correctamente'
      };
      
    } catch (error) {
      console.error('❌ Error dando like:', error);
      return {
        success: false,
        message: handleApiError(error)
      };
    }
  }

  // 📝 Crear nuevo comentario principal (requiere token)
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

  // 🆕 Crear respuesta a un comentario (solo nivel 'cliente')
  async crearRespuesta(qrCode, comentarioId, respuestaData, token) {
    try {
      console.log(`💬 Creando respuesta para comentario: ${comentarioId}`);
      
      const payload = {
        ...respuestaData,
        token: token
      };
      
      const response = await api.post(`/memorial/${qrCode}/comentarios/${comentarioId}/responder`, payload);
      
      const data = getApiData(response);
      console.log('✅ Respuesta creada exitosamente:', data);
      
      return {
        success: true,
        respuesta: data.respuesta || data,
        message: data.message || 'Respuesta publicada correctamente'
      };
      
    } catch (error) {
      console.error('❌ Error creando respuesta:', error);
      return {
        success: false,
        message: handleApiError(error)
      };
    }
  }

  // 📖 Obtener comentarios públicos con respuestas anidadas
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

  // 🆕 Obtener respuestas de un comentario específico
  async obtenerRespuestas(qrCode, comentarioId, page = 1, limit = 20) {
    try {
      console.log(`📖 Obteniendo respuestas para comentario: ${comentarioId}`);
      
      const response = await api.get(`/memorial/${qrCode}/comentarios/${comentarioId}/respuestas`, {
        params: { page, limit }
      });
      
      const data = getApiData(response);
      console.log('✅ Respuestas obtenidas:', data);
      
      return {
        success: true,
        respuestas: data.respuestas || [],
        total: data.total || 0
      };
      
    } catch (error) {
      console.error('❌ Error obteniendo respuestas:', error);
      return {
        success: false,
        respuestas: [],
        total: 0,
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

  // 🔧 Configurar códigos de comentarios (solo admin)
  async configurarCodigos(profileId, configuracion) {
    try {
      console.log(`🔧 Configurando códigos para profile: ${profileId}`);
      
      const response = await api.put(`/admin/profiles/${profileId}/codigo-comentarios`, configuracion);
      
      const data = getApiData(response);
      console.log('✅ Códigos configurados exitosamente:', data);
      
      return {
        success: true,
        config: data.config || data,
        message: data.message || 'Configuración actualizada correctamente'
      };
      
    } catch (error) {
      console.error('❌ Error configurando códigos:', error);
      return {
        success: false,
        message: handleApiError(error)
      };
    }
  }

  // 🎲 Generar códigos automáticos (solo admin)
  async generarCodigos(profileId) {
    try {
      console.log(`🎲 Generando códigos automáticos para profile: ${profileId}`);
      
      const response = await api.post(`/admin/profiles/${profileId}/generar-codigo`);
      
      const data = getApiData(response);
      console.log('✅ Códigos generados exitosamente:', data);
      
      return {
        success: true,
        codigoComentarios: data.codigoComentarios,
        codigoCliente: data.codigoCliente,
        message: data.message || 'Códigos generados correctamente'
      };
      
    } catch (error) {
      console.error('❌ Error generando códigos:', error);
      return {
        success: false,
        message: handleApiError(error)
      };
    }
  }

  // 🆕 Generar solo código de cliente (solo admin)
  async generarCodigoCliente(profileId) {
    try {
      console.log(`🎲 Generando código de cliente para profile: ${profileId}`);
      
      const response = await api.post(`/admin/profiles/${profileId}/generar-codigo-cliente`);
      
      const data = getApiData(response);
      console.log('✅ Código de cliente generado:', data);
      
      return {
        success: true,
        codigoCliente: data.codigoCliente,
        message: data.message || 'Código de cliente generado correctamente'
      };
      
    } catch (error) {
      console.error('❌ Error generando código de cliente:', error);
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
  async eliminarComentario(comentarioId) {
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
  // 🔧 HELPERS ACTUALIZADOS - TIEMPO CORREGIDO A 2 MINUTOS
  // ===============================

  // 💾 Guardar datos de validación en localStorage
  guardarDatosValidacion(qrCode, { token, nivel, permisos }) {
    const key = `comentario_data_${qrCode}`;
    const data = {
      token,
      nivel,
      permisos,
      timestamp: Date.now()
    };
    
    localStorage.setItem(key, JSON.stringify(data));
    
    // 🔧 CORREGIDO: Auto-eliminar después de 2 minutos (igual que el backend)
    setTimeout(() => {
      this.eliminarDatosValidacion(qrCode);
    }, 2 * 60 * 1000); // 🔧 ARREGLADO: 2 minutos en vez de 5
    
    console.log(`💾 Datos de validación guardados para ${qrCode}:`, { nivel, permisos, tiempoExpiracion: '2 minutos' });
  }

  // 🔑 Obtener datos de validación guardados
  obtenerDatosValidacion(qrCode) {
    const key = `comentario_data_${qrCode}`;
    const dataStr = localStorage.getItem(key);
    
    if (!dataStr) {
      return null;
    }
    
    try {
      const data = JSON.parse(dataStr);
      
      // 🔧 CORREGIDO: Verificar si ha expirado (2 minutos en vez de 5)
      if (Date.now() - data.timestamp > 2 * 60 * 1000) {
        console.log(`⏰ Token expirado para ${qrCode} (más de 2 minutos)`);
        this.eliminarDatosValidacion(qrCode);
        return null;
      }
      
      console.log(`🔑 Datos de validación obtenidos para ${qrCode}:`, { 
        nivel: data.nivel, 
        permisos: data.permisos,
        tiempoRestante: Math.round((2 * 60 * 1000 - (Date.now() - data.timestamp)) / 1000) + ' segundos'
      });
      
      return data;
    } catch (error) {
      console.error('Error parseando datos de validación:', error);
      this.eliminarDatosValidacion(qrCode);
      return null;
    }
  }

  // 🗑️ Eliminar datos de validación
  eliminarDatosValidacion(qrCode) {
    const key = `comentario_data_${qrCode}`;
    localStorage.removeItem(key);
    console.log(`🗑️ Datos de validación eliminados para ${qrCode}`);
  }

  // ✅ Verificar si tiene acceso válido
  tieneAcceso(qrCode) {
    const data = this.obtenerDatosValidacion(qrCode);
    return !!data;
  }

  // 🆕 Verificar si puede responder (nivel cliente)
  puedeResponder(qrCode) {
    const data = this.obtenerDatosValidacion(qrCode);
    return data && data.nivel === 'cliente' && data.permisos.includes('responder');
  }

  // 🆕 Obtener nivel del usuario
  obtenerNivel(qrCode) {
    const data = this.obtenerDatosValidacion(qrCode);
    return data ? data.nivel : null;
  }

  // 🔑 Obtener token (método legacy para compatibilidad)
  obtenerToken(qrCode) {
    const data = this.obtenerDatosValidacion(qrCode);
    return data ? data.token : null;
  }

  // ✅ Verificar si tiene token válido (método legacy para compatibilidad)
  tieneToken(qrCode) {
    return this.tieneAcceso(qrCode);
  }

  // 💾 Guardar token (método legacy para compatibilidad)
  guardarToken(qrCode, token) {
    // Para compatibilidad, guardar solo el token sin nivel/permisos
    const data = {
      token,
      nivel: 'familiar', // Por defecto
      permisos: ['comentar']
    };
    this.guardarDatosValidacion(qrCode, data);
  }

  // 🗑️ Eliminar token (método legacy para compatibilidad)
  eliminarToken(qrCode) {
    this.eliminarDatosValidacion(qrCode);
  }

  // 🆕 Obtener tiempo restante del token (en segundos)
  obtenerTiempoRestante(qrCode) {
    const data = this.obtenerDatosValidacion(qrCode);
    if (!data) return 0;
    
    const tiempoTranscurrido = Date.now() - data.timestamp;
    const tiempoRestante = (2 * 60 * 1000) - tiempoTranscurrido; // 2 minutos
    
    return Math.max(0, Math.round(tiempoRestante / 1000));
  }

  // 🆕 Verificar si el token está próximo a expirar (menos de 30 segundos)
  tokenProximoAExpirar(qrCode) {
    const tiempoRestante = this.obtenerTiempoRestante(qrCode);
    return tiempoRestante > 0 && tiempoRestante < 30;
  }
}

// Exportar instancia única
const comentarioService = new ComentarioService();
export default comentarioService;