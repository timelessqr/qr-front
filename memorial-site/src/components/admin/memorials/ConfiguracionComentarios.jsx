import React, { useState, useEffect } from 'react';
import { comentarioService } from '../../../services';

const ConfiguracionComentarios = ({ memorial, onActualizar }) => {
  
  // ===============================
  // 🎛️ ESTADOS
  // ===============================
  const [configuracion, setConfiguracion] = useState({
    habilitados: false,
    requiereCodigo: true,
    codigoFamiliar: '', // 🆕 Código para familiares (solo comentar)
    codigoCliente: '',  // 🆕 Código para cliente (comentar + responder)
    mensaje: ''
  });
  
  const [comentarios, setComentarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');
  
  // Estados para paginación de comentarios
  const [paginaActual, setPaginaActual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [totalComentarios, setTotalComentarios] = useState(0);
  
  // 🆕 Estados para estadísticas
  const [estadisticas, setEstadisticas] = useState({
    totalComentarios: 0,
    totalRespuestas: 0,
    statsByUserLevel: []
  });

  // ===============================
  // 🔄 EFECTOS
  // ===============================
  
  useEffect(() => {
    if (memorial?.id) {
      cargarConfiguracion();
      cargarComentarios();
    }
  }, [memorial]);

  // ===============================
  // 🔧 FUNCIONES PRINCIPALES
  // ===============================

  const cargarConfiguracion = async () => {
    try {
      const result = await comentarioService.obtenerConfiguracion(memorial.qrCode);
      
      if (result.success) {
        setConfiguracion(prev => ({
          ...prev,
          habilitados: result.config.habilitados || false,
          requiereCodigo: result.config.requiereCodigo || false,
          // 🆕 Cargar ambos códigos desde el memorial
          codigoFamiliar: memorial.codigoComentarios || '',
          codigoCliente: memorial.codigoCliente || '',
          mensaje: result.config.mensaje || ''
        }));
      }
    } catch (err) {
      console.error('❌ Error cargando configuración:', err);
    }
  };

  const cargarComentarios = async (page = 1) => {
    setLoading(true);
    setError('');
    
    try {
      const result = await comentarioService.obtenerComentariosAdmin(memorial.id, page, 10);
      
      if (result.success) {
        if (page === 1) {
          setComentarios(result.comentarios);
        } else {
          setComentarios(prev => [...prev, ...result.comentarios]);
        }
        
        setPaginaActual(result.pagination.page);
        setTotalPaginas(result.pagination.totalPages);
        setTotalComentarios(result.pagination.total);
        
        // 🆕 Cargar estadísticas si están disponibles
        if (result.stats) {
          setEstadisticas(result.stats);
        }
      } else {
        setError(result.message || 'Error al cargar comentarios');
      }
      
    } catch (err) {
      console.error('❌ Error cargando comentarios:', err);
      setError('Error al cargar los comentarios');
    } finally {
      setLoading(false);
    }
  };

  const guardarConfiguracion = async (e) => {
    e.preventDefault();
    
    setGuardando(true);
    setError('');
    
    try {
      const configData = {
        codigoComentarios: configuracion.codigoFamiliar.trim(), // Código familiar
        codigoCliente: configuracion.codigoCliente.trim(),     // 🆕 Código de cliente
        comentariosHabilitados: configuracion.habilitados,
        mensaje: configuracion.mensaje.trim()
      };
      
      const result = await comentarioService.configurarCodigos(memorial.id, configData);
      
      if (result.success) {
        setMensaje('✅ Configuración guardada correctamente');
        
        // Notificar al componente padre si existe
        if (onActualizar) {
          onActualizar(result.config);
        }
        
        // Limpiar mensaje después de 3 segundos
        setTimeout(() => setMensaje(''), 3000);
        
      } else {
        setError(result.message || 'Error al guardar configuración');
      }
      
    } catch (err) {
      console.error('❌ Error guardando configuración:', err);
      setError('Error al guardar la configuración');
    } finally {
      setGuardando(false);
    }
  };

  // 🆕 Generar ambos códigos automáticamente
  const generarCodigosAutomaticos = async () => {
    setGuardando(true);
    setError('');
    
    try {
      const result = await comentarioService.generarCodigos(memorial.id);
      
      if (result.success) {
        setConfiguracion(prev => ({
          ...prev,
          codigoFamiliar: result.codigoComentarios,
          codigoCliente: result.codigoCliente
        }));
        
        setMensaje(`✅ Códigos generados:\n• Familiar: ${result.codigoComentarios}\n• Cliente: ${result.codigoCliente}`);
        
        // Limpiar mensaje después de 5 segundos
        setTimeout(() => setMensaje(''), 5000);
        
      } else {
        setError(result.message || 'Error al generar códigos');
      }
      
    } catch (err) {
      console.error('❌ Error generando códigos:', err);
      setError('Error al generar los códigos');
    } finally {
      setGuardando(false);
    }
  };

  // 🆕 Generar solo código de cliente
  const generarCodigoCliente = async () => {
    setGuardando(true);
    setError('');
    
    try {
      const result = await comentarioService.generarCodigoCliente(memorial.id);
      
      if (result.success) {
        setConfiguracion(prev => ({
          ...prev,
          codigoCliente: result.codigoCliente
        }));
        
        setMensaje(`✅ Código de cliente generado: ${result.codigoCliente}`);
        
        // Limpiar mensaje después de 5 segundos
        setTimeout(() => setMensaje(''), 5000);
        
      } else {
        setError(result.message || 'Error al generar código de cliente');
      }
      
    } catch (err) {
      console.error('❌ Error generando código de cliente:', err);
      setError('Error al generar el código de cliente');
    } finally {
      setGuardando(false);
    }
  };

  const eliminarComentario = async (comentarioId) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este comentario?')) {
      return;
    }
    
    try {
      const result = await comentarioService.eliminarComentario(comentarioId);
      
      if (result.success) {
        // Remover de la lista local
        setComentarios(prev => prev.filter(c => c.id !== comentarioId));
        setTotalComentarios(prev => prev - 1);
        
        setMensaje('✅ Comentario eliminado correctamente');
        setTimeout(() => setMensaje(''), 3000);
        
      } else {
        setError(result.message || 'Error al eliminar comentario');
      }
      
    } catch (err) {
      console.error('❌ Error eliminando comentario:', err);
      setError('Error al eliminar el comentario');
    }
  };

  const cargarMasComentarios = () => {
    if (paginaActual < totalPaginas && !loading) {
      cargarComentarios(paginaActual + 1);
    }
  };

  // ===============================
  // 🎨 COMPONENTES DE UI
  // ===============================

  // 🆕 Componente para mostrar tarjeta de comentario con respuestas
  const TarjetaComentario = ({ comentario }) => {
    const fechaFormateada = new Date(comentario.fechaCreacion).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const getRelacionIcon = (relacion) => {
      switch (relacion) {
        case 'familiar': return '👨‍👩‍👧‍👦';
        case 'amigo': return '👫';
        case 'colega': return '💼';
        case 'vecino': return '🏠';
        default: return '👤';
      }
    };

    // 🆕 Determinar color según nivel de usuario
    const getAvatarColor = (nivelUsuario) => {
      return nivelUsuario === 'cliente' 
        ? 'bg-gradient-to-br from-blue-500 to-purple-500' 
        : 'bg-gradient-to-br from-red-500 to-orange-500';
    };

    const getBadgeColor = (nivelUsuario) => {
      return nivelUsuario === 'cliente' 
        ? 'bg-blue-100 text-blue-800' 
        : 'bg-green-100 text-green-800';
    };

    // Si es una respuesta, renderizar de forma diferente
    if (comentario.esRespuesta) {
      return (
        <div className="ml-8 bg-gray-50 p-3 rounded-lg border-l-4 border-blue-400">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3 flex-1">
              <div className={`w-8 h-8 rounded-full ${getAvatarColor(comentario.nivelUsuario)} flex items-center justify-center text-white font-semibold text-sm`}>
                {comentario.nombre ? comentario.nombre.charAt(0).toUpperCase() : 'A'}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h5 className="font-medium text-gray-800 text-sm">{comentario.nombre}</h5>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getBadgeColor(comentario.nivelUsuario)}`}>
                    {comentario.nivelUsuario === 'cliente' ? '👑 Cliente' : '👥 Familiar'}
                  </span>
                  <span className="text-gray-500 text-xs">• {fechaFormateada}</span>
                </div>
                <p className="text-gray-700 text-sm mb-1">{comentario.mensaje}</p>
                <p className="text-xs text-gray-500">↳ Respondiendo a comentario principal</p>
              </div>
            </div>
            
            <button
              onClick={() => eliminarComentario(comentario.id)}
              className="text-gray-400 hover:text-red-500 transition-colors duration-200 p-1 ml-2"
              title="Eliminar respuesta"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      );
    }

    // Comentario principal
    return (
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:border-red-200 transition-colors duration-200">
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full ${getAvatarColor(comentario.nivelUsuario)} flex items-center justify-center text-white font-semibold text-sm`}>
              {comentario.nombre ? comentario.nombre.charAt(0).toUpperCase() : 'A'}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-medium text-gray-900">{comentario.nombre}</h4>
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getBadgeColor(comentario.nivelUsuario)}`}>
                  {comentario.nivelUsuario === 'cliente' ? '👑 Cliente' : '👥 Familiar'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>{getRelacionIcon(comentario.relacion)} {comentario.relacion}</span>
                <span>•</span>
                <span>{fechaFormateada}</span>
                {comentario.codigoUsado && (
                  <>
                    <span>•</span>
                    <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">
                      {comentario.codigoUsado}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
          
          <button
            onClick={() => eliminarComentario(comentario.id)}
            className="text-gray-400 hover:text-red-500 transition-colors duration-200 p-1"
            title="Eliminar comentario"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
        
        <p className="text-gray-700 leading-relaxed mb-2">{comentario.mensaje}</p>
        
        {comentario.ip && (
          <p className="text-xs text-gray-400">📍 IP: {comentario.ip}</p>
        )}
      </div>
    );
  };

  // 🆕 Componente de estadísticas
  const EstadisticasComentarios = () => (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">📊 Estadísticas</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.477 8-10 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.477-8 10-8s10 3.582 10 8z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-green-600">Comentarios</p>
              <p className="text-2xl font-bold text-green-900">{estadisticas.totalComentarios || totalComentarios}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-blue-600">Respuestas</p>
              <p className="text-2xl font-bold text-blue-900">{estadisticas.totalRespuestas || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-purple-600">Total</p>
              <p className="text-2xl font-bold text-purple-900">{estadisticas.totalGeneral || totalComentarios}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // ===============================
  // 🎯 RENDERIZADO PRINCIPAL
  // ===============================

  if (!memorial) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Selecciona un memorial para configurar los comentarios</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Título */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          💌 Sistema de Comentarios con Dos Códigos
        </h2>
        <p className="text-gray-600">
          Memorial: <strong>{memorial.nombreCompleto}</strong> ({memorial.qrCode})
        </p>
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">📋 Cómo funciona:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• <strong>Código Familiar:</strong> Permite solo comentar (para amigos, familiares lejanos)</li>
            <li>• <strong>Código Cliente:</strong> Permite comentar Y responder (para familia inmediata que contrató)</li>
            <li>• Mismo QR para todos, diferentes permisos según el código usado</li>
          </ul>
        </div>
      </div>

      {/* Mensajes de estado */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 text-sm">❌ {error}</p>
        </div>
      )}
      
      {mensaje && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800 text-sm whitespace-pre-line">{mensaje}</p>
        </div>
      )}

      {/* Configuración */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">⚙️ Configuración</h3>
        
        <form onSubmit={guardarConfiguracion} className="space-y-6">
          
          {/* Habilitar comentarios */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="habilitados"
              checked={configuracion.habilitados}
              onChange={(e) => setConfiguracion(prev => ({ ...prev, habilitados: e.target.checked }))}
              className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
            />
            <label htmlFor="habilitados" className="ml-2 block text-sm text-gray-900">
              Habilitar comentarios en este memorial
            </label>
          </div>

          {/* Configuración de códigos */}
          {configuracion.habilitados && (
            <div className="space-y-6 p-4 bg-gray-50 rounded-lg">
              
              {/* Código Familiar */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  👥 Código Familiar <span className="text-green-600">(Solo comentar)</span>
                </label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={configuracion.codigoFamiliar}
                    onChange={(e) => setConfiguracion(prev => ({ ...prev, codigoFamiliar: e.target.value }))}
                    className="flex-1 border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Ej: FAMILIA-2025-ABC"
                  />
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Para amigos, familiares lejanos, conocidos. Solo pueden dejar comentarios.
                </p>
              </div>

              {/* Código Cliente */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  👑 Código Cliente <span className="text-blue-600">(Comentar + Responder)</span>
                </label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={configuracion.codigoCliente}
                    onChange={(e) => setConfiguracion(prev => ({ ...prev, codigoCliente: e.target.value }))}
                    className="flex-1 border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ej: CLIENTE-2025-XYZ"
                  />
                  <button
                    type="button"
                    onClick={generarCodigoCliente}
                    disabled={guardando}
                    className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition duration-300"
                  >
                    🎲 Generar
                  </button>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Para la familia inmediata que contrató el servicio. Pueden comentar y responder.
                </p>
              </div>

              {/* Botón para generar ambos códigos */}
              <div className="text-center border-t pt-4">
                <button
                  type="button"
                  onClick={generarCodigosAutomaticos}
                  disabled={guardando}
                  className="bg-purple-500 hover:bg-purple-600 disabled:bg-gray-400 text-white font-medium py-3 px-6 rounded-lg transition duration-300"
                >
                  🎲 Generar Ambos Códigos Automáticamente
                </button>
              </div>
            </div>
          )}

          {/* Mensaje personalizado */}
          <div>
            <label htmlFor="mensaje" className="block text-sm font-medium text-gray-700 mb-2">
              Mensaje personalizado (opcional)
            </label>
            <textarea
              id="mensaje"
              value={configuracion.mensaje}
              onChange={(e) => setConfiguracion(prev => ({ ...prev, mensaje: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
              rows="3"
              placeholder="Mensaje que aparecerá en la sección de comentarios..."
            />
          </div>

          {/* Botón guardar */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={guardando}
              className="bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white font-medium py-3 px-6 rounded-lg transition duration-300"
            >
              {guardando ? '💾 Guardando...' : '💾 Guardar Configuración'}
            </button>
          </div>
        </form>
      </div>

      {/* Estadísticas */}
      <EstadisticasComentarios />

      {/* Lista de comentarios y respuestas */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">📝 Comentarios y Respuestas</h3>
          {totalComentarios > 0 && (
            <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
              {totalComentarios} {totalComentarios === 1 ? 'conversación' : 'conversaciones'}
            </span>
          )}
        </div>

        {loading && comentarios.length === 0 ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando comentarios...</p>
          </div>
        ) : comentarios.length === 0 ? (
          <div className="text-center py-8">
            <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.477 8-10 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.477-8 10-8s10 3.582 10 8z" />
              </svg>
            </div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">Aún no hay comentarios</h4>
            <p className="text-gray-600">Los comentarios aparecerán aquí cuando los usuarios los publiquen.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {comentarios.map((comentario) => (
              <TarjetaComentario key={comentario.id} comentario={comentario} />
            ))}
            
            {/* Botón cargar más */}
            {paginaActual < totalPaginas && (
              <div className="text-center">
                <button
                  onClick={cargarMasComentarios}
                  disabled={loading}
                  className="bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 text-gray-700 font-medium py-2 px-4 rounded-lg transition duration-300 inline-flex items-center"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                      Cargando...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                      Ver más comentarios
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ConfiguracionComentarios;