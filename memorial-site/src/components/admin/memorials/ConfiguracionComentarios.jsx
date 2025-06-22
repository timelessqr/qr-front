import React, { useState, useEffect } from 'react';
import { comentarioService } from '../../../services';

const ConfiguracionComentarios = ({ memorial, onActualizar }) => {
  
  // ===============================
  // 🎛️ ESTADOS SIMPLIFICADOS
  // ===============================
  const [configuracion, setConfiguracion] = useState({
    habilitados: false,
    requiereCodigo: true,
    codigoFamiliar: '',
    codigoCliente: '',
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
      const result = await comentarioService.obtenerComentariosAdmin(memorial.id, page, 20);
      
      if (result.success) {
        if (page === 1) {
          setComentarios(result.comentarios);
        } else {
          setComentarios(prev => [...prev, ...result.comentarios]);
        }
        
        setPaginaActual(result.pagination.page);
        setTotalPaginas(result.pagination.totalPages);
        setTotalComentarios(result.pagination.total);
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
        codigoComentarios: configuracion.codigoFamiliar.trim(),
        codigoCliente: configuracion.codigoCliente.trim(),
        comentariosHabilitados: configuracion.habilitados,
        mensaje: configuracion.mensaje.trim()
      };
      
      const result = await comentarioService.configurarCodigos(memorial.id, configData);
      
      if (result.success) {
        setMensaje('✅ Configuración guardada correctamente');
        
        if (onActualizar) {
          onActualizar(result.config);
        }
        
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

  // 🔧 ARREGLADO: Eliminación de comentarios y respuestas
  const eliminarComentario = async (comentarioId, esRespuesta = false) => {
    const tipoElemento = esRespuesta ? 'respuesta' : 'comentario';
    
    if (!window.confirm(`¿Estás seguro de que deseas eliminar este ${tipoElemento}?`)) {
      return;
    }
    
    try {
      const result = await comentarioService.eliminarComentario(comentarioId);
      
      if (result.success) {
        // 🔧 ARREGLADO: Recargar la lista completa para reflejar los cambios
        await cargarComentarios(1);
        
        setMensaje(`✅ ${tipoElemento.charAt(0).toUpperCase() + tipoElemento.slice(1)} eliminado correctamente`);
        setTimeout(() => setMensaje(''), 3000);
        
      } else {
        setError(result.message || `Error al eliminar ${tipoElemento}`);
      }
      
    } catch (err) {
      console.error(`❌ Error eliminando ${tipoElemento}:`, err);
      setError(`Error al eliminar el ${tipoElemento}`);
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

    return (
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:border-red-200 transition-colors duration-200">
        {/* Comentario principal */}
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
            onClick={() => eliminarComentario(comentario.id, false)}
            className="text-gray-400 hover:text-red-500 transition-colors duration-200 p-1"
            title="Eliminar comentario"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
        
        <p className="text-gray-700 leading-relaxed mb-2">{comentario.mensaje}</p>
        
        {/* Información adicional */}
        <div className="flex items-center gap-4 text-xs text-gray-500 mb-2">
          {comentario.likes > 0 && (
            <span className="flex items-center">
              <svg className="w-3 h-3 mr-1 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
              </svg>
              {comentario.likes} likes
            </span>
          )}
          {comentario.ip && (
            <span>📍 IP: {comentario.ip}</span>
          )}
        </div>

        {/* Respuestas anidadas */}
        {comentario.respuestas && comentario.respuestas.length > 0 && (
          <div className="mt-4 border-t pt-4">
            <div className="flex items-center mb-3">
              <svg className="w-4 h-4 mr-2 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium text-blue-700">
                {comentario.respuestas.length} {comentario.respuestas.length === 1 ? 'respuesta' : 'respuestas'}
              </span>
            </div>
            
            <div className="space-y-3">
              {comentario.respuestas.map((respuesta) => {
                const fechaRespuesta = new Date(respuesta.fechaCreacion).toLocaleDateString('es-ES', {
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit'
                });

                return (
                  <div key={respuesta.id} className="ml-4 bg-blue-50 p-3 rounded-lg border-l-4 border-blue-400">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3 flex-1">
                        <div className={`w-8 h-8 rounded-full ${getAvatarColor(respuesta.nivelUsuario)} flex items-center justify-center text-white font-semibold text-sm`}>
                          {respuesta.nombre ? respuesta.nombre.charAt(0).toUpperCase() : 'A'}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h5 className="font-medium text-gray-800 text-sm">{respuesta.nombre}</h5>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getBadgeColor(respuesta.nivelUsuario)}`}>
                              {respuesta.nivelUsuario === 'cliente' ? '👑 Cliente' : '👥 Familiar'}
                            </span>
                            <span className="text-gray-500 text-xs">• {fechaRespuesta}</span>
                          </div>
                          <p className="text-gray-700 text-sm mb-1">{respuesta.mensaje}</p>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            {respuesta.likes > 0 && (
                              <span className="flex items-center">
                                <svg className="w-3 h-3 mr-1 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                                </svg>
                                {respuesta.likes} likes
                              </span>
                            )}
                            {respuesta.codigoUsado && (
                              <span className="bg-gray-100 px-2 py-0.5 rounded">
                                {respuesta.codigoUsado}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => eliminarComentario(respuesta.id, true)}
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
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

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