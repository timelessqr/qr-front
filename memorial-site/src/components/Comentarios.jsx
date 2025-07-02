import React, { useState, useEffect, useCallback } from 'react';
import { comentarioService } from '../services';

const Comentarios = ({ qrCode, comentarios: comentariosIniciales = [], configuracion: configInicial = {} }) => {
  
  // ===============================
  // 🎛️ ESTADOS SIMPLIFICADOS
  // ===============================
  const [comentarios, setComentarios] = useState([]);
  const [configuracion, setConfiguracion] = useState(configInicial);
  const [loading, setLoading] = useState(false);
  const [loadingComentarios, setLoadingComentarios] = useState(false);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');
  
  // Estados para validación de código
  const [mostrarValidacion, setMostrarValidacion] = useState(false);
  const [codigoFamiliar, setCodigoFamiliar] = useState('');
  const [validandoCodigo, setValidandoCodigo] = useState(false);
  
  // Estado de acceso simplificado
  const [acceso, setAcceso] = useState({
    tieneAcceso: false,
    nivel: '',
    puedeResponder: false
  });
  
  // Estado para el nuevo comentario
  const [nuevoComentario, setNuevoComentario] = useState({
    nombre: "",
    mensaje: "",
    relacion: "familiar"
  });
  const [enviandoComentario, setEnviandoComentario] = useState(false);
  
  // Estados para respuestas - SIMPLIFICADO
  const [respuestaActiva, setRespuestaActiva] = useState(null);
  const [nuevaRespuesta, setNuevaRespuesta] = useState({
    nombre: "",
    mensaje: "",
    relacion: "familiar"
  });
  const [enviandoRespuesta, setEnviandoRespuesta] = useState(false);
  
  // Estados para paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [totalComentarios, setTotalComentarios] = useState(0);

  // ===============================
  // 🔄 EFECTOS
  // ===============================
  
  useEffect(() => {
    if (qrCode) {
      inicializarComentarios();
      verificarAccesoExistente();
    }
  }, [qrCode]);

  const verificarAccesoExistente = useCallback(() => {
    if (!qrCode) return;
    
    if (comentarioService.tieneAcceso(qrCode)) {
      const nivel = comentarioService.obtenerNivel(qrCode) || 'familiar';
      const puedeResponder = comentarioService.puedeResponder(qrCode);
      
      setAcceso({
        tieneAcceso: true,
        nivel,
        puedeResponder
      });
    }
  }, [qrCode]);

  // ===============================
  // 🔧 FUNCIONES PRINCIPALES
  // ===============================

  const inicializarComentarios = async () => {
    if (loading) return;
    
    setLoading(true);
    setError('');
    
    try {
      const configResult = await comentarioService.obtenerConfiguracion(qrCode);
      
      if (configResult.success) {
        setConfiguracion(configResult.config);
        
        if (configResult.config.habilitados) {
          await cargarComentarios();
        }
      } else {
        setError(configResult.message || 'Error al cargar configuración');
      }
      
    } catch (err) {
      console.error('❌ Error inicializando comentarios:', err);
      setError('Error al inicializar los comentarios');
    } finally {
      setLoading(false);
    }
  };

  const cargarComentarios = async (page = 1) => {
    if (loadingComentarios) return;
    
    setLoadingComentarios(true);
    setError('');
    
    try {
      const result = await comentarioService.obtenerComentarios(qrCode, page, 10);
      
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
      setLoadingComentarios(false);
    }
  };

  // 🔧 SIMPLIFICADO: Validar código sin re-renders
  const validarCodigoFamiliar = async (e) => {
    e.preventDefault();
    
    if (!codigoFamiliar.trim()) {
      setError('Por favor ingrese el código familiar');
      return;
    }
    
    if (validandoCodigo) return;
    
    setValidandoCodigo(true);
    setError('');
    
    try {
      const result = await comentarioService.validarCodigo(qrCode, codigoFamiliar);
      
      if (result.success) {
        comentarioService.guardarDatosValidacion(qrCode, {
          token: result.token,
          nivel: result.nivel,
          permisos: result.permisos
        });
        
        setAcceso({
          tieneAcceso: true,
          nivel: result.nivel,
          puedeResponder: result.permisos.includes('responder')
        });
        
        setMostrarValidacion(false);
        setCodigoFamiliar('');
        
        const mensajeNivel = result.nivel === 'cliente' 
          ? '👑 Código de cliente validado. Puedes comentar y responder.' 
          : '✅ Código familiar validado. Puedes comentar.';
        
        setMensaje(mensajeNivel);
        setTimeout(() => setMensaje(''), 3000);
        
      } else {
        setError(result.message || 'Código incorrecto');
      }
      
    } catch (err) {
      console.error('❌ Error validando código:', err);
      setError('Error al validar el código');
    } finally {
      setValidandoCodigo(false);
    }
  };

  const agregarComentario = async (e) => {
    e.preventDefault();
    
    if (!nuevoComentario.mensaje.trim()) {
      setError('Por favor escriba un mensaje');
      return;
    }
    
    if (configuracion.requiereCodigo && !acceso.tieneAcceso) {
      setError('Debe validar el código familiar primero');
      return;
    }
    
    if (enviandoComentario) return;
    
    setEnviandoComentario(true);
    setError('');
    
    try {
      const token = comentarioService.obtenerToken(qrCode);
      if (!token) {
        setError('Token expirado. Por favor valide el código nuevamente');
        setAcceso({ tieneAcceso: false, nivel: '', puedeResponder: false });
        return;
      }
      
      const comentarioData = {
        nombre: nuevoComentario.nombre.trim() || 'Anónimo',
        mensaje: nuevoComentario.mensaje.trim(),
        relacion: nuevoComentario.relacion || 'familiar'
      };
      
      const result = await comentarioService.crearComentario(qrCode, comentarioData, token);
      
      if (result.success) {
        setNuevoComentario({ nombre: "", mensaje: "", relacion: "familiar" });
        await cargarComentarios(1);
        setMensaje('✅ Comentario publicado correctamente');
        setTimeout(() => setMensaje(''), 3000);
      } else {
        setError(result.message || 'Error al publicar comentario');
      }
      
    } catch (err) {
      console.error('❌ Error creando comentario:', err);
      setError('Error al publicar el comentario');
    } finally {
      setEnviandoComentario(false);
    }
  };

  const crearRespuesta = async (comentarioId) => {
    if (!nuevaRespuesta.mensaje.trim()) {
      setError('Por favor escriba una respuesta');
      return;
    }
    
    if (enviandoRespuesta) return;
    
    setEnviandoRespuesta(true);
    setError('');
    
    try {
      const token = comentarioService.obtenerToken(qrCode);
      if (!token) {
        setError('Token expirado. Por favor valide el código nuevamente');
        setAcceso({ tieneAcceso: false, nivel: '', puedeResponder: false });
        return;
      }
      
      const respuestaData = {
        nombre: nuevaRespuesta.nombre.trim() || 'Anónimo',
        mensaje: nuevaRespuesta.mensaje.trim(),
        relacion: nuevaRespuesta.relacion || 'familiar'
      };
      
      const result = await comentarioService.crearRespuesta(qrCode, comentarioId, respuestaData, token);
      
      if (result.success) {
        setNuevaRespuesta({ nombre: "", mensaje: "", relacion: "familiar" });
        setRespuestaActiva(null);
        await cargarComentarios(1);
        setMensaje('✅ Respuesta publicada correctamente');
        setTimeout(() => setMensaje(''), 3000);
      } else {
        setError(result.message || 'Error al publicar respuesta');
      }
      
    } catch (err) {
      console.error('❌ Error creando respuesta:', err);
      setError('Error al publicar la respuesta');
    } finally {
      setEnviandoRespuesta(false);
    }
  };

  const toggleRespuesta = (comentarioId) => {
    if (!acceso.puedeResponder) {
      setError('Solo el cliente puede responder a comentarios');
      setTimeout(() => setError(''), 3000);
      return;
    }
    
    if (respuestaActiva === comentarioId) {
      setRespuestaActiva(null);
      setNuevaRespuesta({ nombre: "", mensaje: "", relacion: "familiar" });
    } else {
      setRespuestaActiva(comentarioId);
      setNuevaRespuesta({ nombre: "", mensaje: "", relacion: "familiar" });
    }
  };

  const darLike = async (id) => {
    try {
      const result = await comentarioService.darLike(qrCode, id);
      
      if (result.success) {
        setComentarios(comentarios.map(comentario => {
          if (comentario._id === id || comentario.id === id) {
            return {...comentario, likes: result.likes};
          }
          if (comentario.respuestas) {
            comentario.respuestas = comentario.respuestas.map(respuesta => 
              respuesta._id === id || respuesta.id === id ? 
                {...respuesta, likes: result.likes} : 
                respuesta
            );
          }
          return comentario;
        }));
      } else {
        setError(result.message || 'Error al dar like');
        setTimeout(() => setError(''), 3000);
      }
    } catch (err) {
      console.error('❌ Error dando like:', err);
      setError('Error al dar like');
      setTimeout(() => setError(''), 3000);
    }
  };

  const cargarMasComentarios = () => {
    if (paginaActual < totalPaginas && !loadingComentarios) {
      cargarComentarios(paginaActual + 1);
    }
  };

  // ===============================
  // 🎯 RENDERIZADO PRINCIPAL
  // ===============================

  if (loading) {
    return (
      <div className="animate-fadeIn">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando comentarios...</p>
        </div>
      </div>
    );
  }

  if (!configuracion.habilitados) {
    return (
      <div className="animate-fadeIn">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="mx-auto h-16 w-16 text-gray-400 mb-4">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.477 8-10 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.477-8 10-8s10 3.582 10 8z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Comentarios no disponibles</h3>
          <p className="text-gray-600">Los comentarios están deshabilitados para este memorial.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn">
      <div className="bg-white rounded-lg shadow-md">
        <h2 className="font-memorial text-2xl font-semibold text-gray-800 mb-6 text-center pt-4">Mensajes de condolencia</h2>
        
        {/* Indicador del nivel de usuario */}
        {acceso.tieneAcceso && (
          <div className="mx-6 mb-4 text-center">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
              acceso.nivel === 'cliente' 
                ? 'bg-blue-100 text-blue-800' 
                : 'bg-green-100 text-green-800'
            }`}>
              {acceso.nivel === 'cliente' ? '👑 Cliente' : '👥 Familiar'}
              {acceso.puedeResponder && ' • Puede responder comentarios'}
              <span className="ml-2 text-xs opacity-70">• Token válido por 2 minutos</span>
            </span>
          </div>
        )}
        
        {/* Mostrar mensajes de estado */}
        {error && (
          <div className="mx-6 mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 text-sm">❌ {error}</p>
          </div>
        )}
        
        {mensaje && (
          <div className="mx-6 mb-4 bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-800 text-sm">{mensaje}</p>
          </div>
        )}
        
        {/* Formulario para escribir comentario */}
        <div className="px-6 pb-6 border-b border-gray-200">
          
          {/* Validación de código */}
          {configuracion.requiereCodigo && !acceso.tieneAcceso && !mostrarValidacion && (
            <div className="text-center mb-6">
              <button
                onClick={() => setMostrarValidacion(true)}
                className="font-memorial bg-slate-600 hover:bg-slate-700 text-white font-medium py-2 px-6 rounded-lg transition duration-300"
              >
                🔐 Ingresar código de acceso
              </button>
            </div>
          )}
          
          {/* 🔧 SIMPLIFICADO: Formulario de validación */}
          {mostrarValidacion && (
            <div className="bg-orange-50 rounded-lg p-4 border border-orange-100 mb-4">
              <h3 className="font-memorial text-gray-800 font-medium mb-3">🔐 Código de Acceso</h3>
              <p className="font-memorial text-gray-600 text-sm mb-4">
                Para dejar comentarios necesitas el código proporcionado por la familia.
              </p>
              
              <form onSubmit={validarCodigoFamiliar}>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={codigoFamiliar}
                    onChange={(e) => setCodigoFamiliar(e.target.value)}
                    className="flex-1 border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Ingrese el código de acceso"
                    disabled={validandoCodigo}
                    autoComplete="off"
                    spellCheck={false}
                  />
                  <button
                    type="submit"
                    disabled={validandoCodigo || !codigoFamiliar.trim()}
                    className="font-memorial bg-slate-600 hover:bg-slate-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition duration-300"
                  >
                    {validandoCodigo ? 'Validando...' : 'Validar'}
                  </button>
                </div>
              </form>
            </div>
          )}
          
          {/* Formulario principal */}
          {(acceso.tieneAcceso || !configuracion.requiereCodigo) && (
            <div className="bg-orange-50 rounded-lg p-4 border border-orange-100">
              <h3 className="font-memorial text-gray-800 font-medium mb-3">Comparte tu mensaje</h3>
              <form onSubmit={agregarComentario}>
                <input
                  type="text"
                  value={nuevoComentario.nombre}
                  onChange={(e) => setNuevoComentario(prev => ({...prev, nombre: e.target.value}))}
                  className="w-full mb-3 border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Tu nombre (opcional)"
                  disabled={enviandoComentario}
                />
                <textarea
                  value={nuevoComentario.mensaje}
                  onChange={(e) => setNuevoComentario(prev => ({...prev, mensaje: e.target.value}))}
                  className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none"
                  rows="3"
                  placeholder="Escribe un mensaje en memoria..."
                  required
                  disabled={enviandoComentario}
                />
                <div className="mt-4 flex justify-end">
                  <button 
                    type="submit"
                    disabled={enviandoComentario || !nuevoComentario.mensaje.trim()}
                    className="bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white font-medium py-2 px-6 rounded-md transition duration-300 shadow-sm"
                  >
                    {enviandoComentario ? 'Publicando...' : 'Publicar mensaje'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
        
        {/* Lista de comentarios con respuestas anidadas */}
        <div className="px-6 py-6">
          <div className="space-y-6">
            
            {/* Comentarios */}
            {comentarios.map((comentario) => {
              const fechaFormateada = comentario.fechaCreacion ? 
                new Date(comentario.fechaCreacion).toLocaleDateString('es-ES', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                }) : comentario.tiempo || 'Hace unos momentos';

              return (
                <div key={comentario._id || comentario.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:border-orange-200 transition-colors duration-200">
                  
                  {/* Comentario principal */}
                  <div className="flex">
                    <div className="flex-shrink-0 mr-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-lg ${
                        comentario.nivelUsuario === 'cliente' 
                          ? 'bg-gradient-to-br from-blue-500 to-purple-500' 
                          : 'bg-gradient-to-br from-red-500 to-orange-500'
                      }`}>
                        {comentario.nombre ? comentario.nombre.charAt(0).toUpperCase() : 'A'}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-gray-900">{comentario.nombre}</h3>
                          {comentario.nivelUsuario === 'cliente' && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                              👑 Cliente
                            </span>
                          )}
                        </div>
                        <span className="text-gray-500 text-sm">{fechaFormateada}</span>
                      </div>
                      <p className="mt-2 text-gray-700">{comentario.mensaje}</p>
                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center text-gray-500">
                          <button 
                            className="flex items-center hover:text-red-600 transition-colors duration-200 mr-4"
                            onClick={() => darLike(comentario._id || comentario.id)}
                          >
                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                            </svg>
                            {comentario.likes || 0} Me gusta
                          </button>
                          
                          {/* Botón responder */}
                          {acceso.puedeResponder && !comentario.esRespuesta && (
                            <button 
                              className="flex items-center hover:text-blue-600 transition-colors duration-200"
                              onClick={() => toggleRespuesta(comentario._id || comentario.id)}
                            >
                              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clipRule="evenodd" />
                              </svg>
                              Responder
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Respuestas anidadas */}
                  {comentario.respuestas && comentario.respuestas.length > 0 && (
                    <div className="mt-4 ml-16 space-y-3">
                      {comentario.respuestas.map((respuesta) => {
                        const fechaRespuesta = respuesta.fechaCreacion ? 
                          new Date(respuesta.fechaCreacion).toLocaleDateString('es-ES', {
                            day: 'numeric',
                            month: 'short'
                          }) : 'Ahora';

                        return (
                          <div key={respuesta._id || respuesta.id} className="bg-gray-50 p-3 rounded-lg border-l-4 border-blue-400">
                            <div className="flex items-start">
                              <div className="flex-shrink-0 mr-3">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold text-sm">
                                  {respuesta.nombre ? respuesta.nombre.charAt(0).toUpperCase() : 'A'}
                                </div>
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <h4 className="font-medium text-gray-800 text-sm">{respuesta.nombre}</h4>
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                      👑 Cliente
                                    </span>
                                  </div>
                                  <span className="text-gray-500 text-xs">{fechaRespuesta}</span>
                                </div>
                                <p className="mt-1 text-gray-700 text-sm">{respuesta.mensaje}</p>
                                <button 
                                  className="mt-2 flex items-center text-gray-500 hover:text-red-600 transition-colors duration-200 text-xs"
                                  onClick={() => darLike(respuesta._id || respuesta.id)}
                                >
                                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                                  </svg>
                                  {respuesta.likes || 0}
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  
                  {/* 🔧 SIMPLIFICADO: Formulario de respuesta */}
                  {respuestaActiva === (comentario._id || comentario.id) && (
                    <div className="mt-4 ml-16 bg-blue-50 rounded-lg p-4 border border-blue-100">
                      <h4 className="text-gray-800 font-medium mb-3">💬 Responder</h4>
                      <div>
                        <input
                          type="text"
                          value={nuevaRespuesta.nombre}
                          onChange={(e) => setNuevaRespuesta(prev => ({...prev, nombre: e.target.value}))}
                          className="w-full mb-3 border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Tu nombre (opcional)"
                          disabled={enviandoRespuesta}
                          autoComplete="off"
                          spellCheck={false}
                        />
                        <textarea
                          value={nuevaRespuesta.mensaje}
                          onChange={(e) => setNuevaRespuesta(prev => ({...prev, mensaje: e.target.value}))}
                          className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                          rows="3"
                          placeholder="Escribe tu respuesta..."
                          disabled={enviandoRespuesta}
                          autoComplete="off"
                        />
                        <div className="mt-3 flex justify-end gap-2">
                          <button 
                            type="button"
                            onClick={() => toggleRespuesta(comentario._id || comentario.id)}
                            className="bg-gray-400 hover:bg-gray-500 text-white font-medium py-2 px-4 rounded-md transition duration-300"
                          >
                            Cancelar
                          </button>
                          <button 
                            type="button"
                            onClick={() => crearRespuesta(comentario._id || comentario.id)}
                            disabled={enviandoRespuesta || !nuevaRespuesta.mensaje.trim()}
                            className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-md transition duration-300"
                          >
                            {enviandoRespuesta ? 'Enviando...' : 'Enviar respuesta'}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            
            {/* Estado vacío */}
            {comentarios.length === 0 && !loadingComentarios && (
              <div className="text-center py-8">
                <div className="mx-auto h-16 w-16 text-gray-400 mb-4">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.477 8-10 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.477-8 10-8s10 3.582 10 8z" />
                  </svg>
                </div>
                <h3 className="font-memorial text-lg font-medium text-gray-900 mb-2">Aún no hay comentarios</h3>
                <p className="font-memorial text-gray-600">Sé el primero en dejar un mensaje de condolencia.</p>
              </div>
            )}
            
            {/* Ver más comentarios */}
            {paginaActual < totalPaginas && (
              <div className="text-center">
                <button 
                  onClick={cargarMasComentarios}
                  disabled={loadingComentarios}
                  className="font-memorial bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 text-gray-700 font-medium py-2 px-6 rounded-md transition duration-300 inline-flex items-center"
                >
                  {loadingComentarios ? (
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
        </div>
      </div>
    </div>
  );
};

export default Comentarios;