import React, { useState, useEffect } from 'react';
import { comentarioService } from '../services';

const Comentarios = ({ qrCode, comentarios: comentariosIniciales = [], configuracion: configInicial = {} }) => {
  
  // ===============================
  // 🎛️ ESTADOS
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
  const [tieneAcceso, setTieneAcceso] = useState(false);
  
  // Estado para el nuevo comentario (manteniendo el diseño original)
  const [nuevoComentario, setNuevoComentario] = useState({
    nombre: "",
    mensaje: "",
    relacion: "familiar"
  });
  const [enviandoComentario, setEnviandoComentario] = useState(false);
  
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
    }
  }, [qrCode]);

  useEffect(() => {
    // Verificar si ya tiene token guardado
    if (qrCode && comentarioService.tieneToken(qrCode)) {
      setTieneAcceso(true);
    }
  }, [qrCode]);

  // ===============================
  // 🔧 FUNCIONES PRINCIPALES
  // ===============================

  const inicializarComentarios = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Obtener configuración de comentarios
      const configResult = await comentarioService.obtenerConfiguracion(qrCode);
      
      if (configResult.success) {
        setConfiguracion(configResult.config);
        
        // Si están habilitados, cargar comentarios
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
    setLoadingComentarios(true);
    setError('');
    
    try {
      const result = await comentarioService.obtenerComentarios(qrCode, page, 10);
      
      if (result.success) {
        if (page === 1) {
          setComentarios(result.comentarios);
        } else {
          // Para páginas adicionales, agregar a la lista existente
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

  const validarCodigoFamiliar = async (e) => {
    e.preventDefault();
    
    if (!codigoFamiliar.trim()) {
      setError('Por favor ingrese el código familiar');
      return;
    }
    
    setValidandoCodigo(true);
    setError('');
    
    try {
      const result = await comentarioService.validarCodigo(qrCode, codigoFamiliar);
      
      if (result.success) {
        // Guardar token
        comentarioService.guardarToken(qrCode, result.token);
        
        setTieneAcceso(true);
        setMostrarValidacion(false);
        setMensaje('✅ Código validado correctamente. Ahora puedes dejar tu comentario.');
        setCodigoFamiliar('');
        
        // Limpiar mensaje después de 3 segundos
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

  // Manejar cambios en el formulario (manteniendo el diseño original)
  const handleChange = (e) => {
    const { name, value } = e.target;
    setNuevoComentario(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Agregar nuevo comentario (conectado con backend)
  const agregarComentario = async (e) => {
    e.preventDefault();
    
    if (!nuevoComentario.mensaje.trim()) {
      setError('Por favor escriba un mensaje');
      return;
    }
    
    if (configuracion.requiereCodigo && !tieneAcceso) {
      setError('Debe validar el código familiar primero');
      return;
    }
    
    setEnviandoComentario(true);
    setError('');
    
    try {
      let result;
      
      if (configuracion.requiereCodigo) {
        const token = comentarioService.obtenerToken(qrCode);
        if (!token) {
          setError('Token expirado. Por favor valide el código nuevamente');
          setTieneAcceso(false);
          return;
        }
        
        const comentarioData = {
          nombre: nuevoComentario.nombre.trim() || 'Anónimo',
          mensaje: nuevoComentario.mensaje.trim(),
          relacion: nuevoComentario.relacion || 'familiar'
        };
        
        result = await comentarioService.crearComentario(qrCode, comentarioData, token);
      } else {
        // Si no requiere código, crear directamente (caso futuro)
        const comentarioData = {
          nombre: nuevoComentario.nombre.trim() || 'Anónimo',
          mensaje: nuevoComentario.mensaje.trim(),
          relacion: nuevoComentario.relacion || 'familiar'
        };
        
        result = await comentarioService.crearComentario(qrCode, comentarioData, 'no-token');
      }
      
      if (result.success) {
        // Limpiar formulario
        setNuevoComentario({ nombre: "", mensaje: "", relacion: "familiar" });
        
        // Recargar comentarios para mostrar el nuevo
        await cargarComentarios(1);
        
        setMensaje('✅ Comentario publicado correctamente');
        
        // Limpiar mensaje después de 3 segundos
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

  // Dar like a un comentario (funcionalidad del dev original)
  const darLike = (id) => {
    setComentarios(comentarios.map(comentario => 
      comentario._id === id || comentario.id === id ? 
        {...comentario, likes: (comentario.likes || 0) + 1} : 
        comentario
    ));
  };

  // Eliminar un comentario (solo para demo en frontend - el admin real está en el panel)
  const eliminarComentario = (id) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este comentario?")) {
      setComentarios(comentarios.filter(comentario => 
        comentario._id !== id && comentario.id !== id
      ));
    }
  };

  const cargarMasComentarios = () => {
    if (paginaActual < totalPaginas && !loadingComentarios) {
      cargarComentarios(paginaActual + 1);
    }
  };

  // ===============================
  // 🎨 COMPONENTE DE VALIDACIÓN
  // ===============================

  const FormularioValidacion = () => (
    <div className="bg-orange-50 rounded-lg p-4 border border-orange-100 mb-4">
      <h3 className="text-gray-800 font-medium mb-3">🔐 Código Familiar</h3>
      <p className="text-gray-600 text-sm mb-4">
        Para dejar un comentario, necesitas el código familiar proporcionado por la familia.
      </p>
      
      <form onSubmit={validarCodigoFamiliar}>
        <div className="flex gap-3">
          <input
            type="text"
            value={codigoFamiliar}
            onChange={(e) => setCodigoFamiliar(e.target.value)}
            className="flex-1 border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            placeholder="Ingrese el código familiar"
            disabled={validandoCodigo}
          />
          <button
            type="submit"
            disabled={validandoCodigo}
            className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition duration-300"
          >
            {validandoCodigo ? 'Validando...' : 'Validar'}
          </button>
        </div>
      </form>
    </div>
  );

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
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center pt-4">Mensajes de condolencia</h2>
        
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
          
          {/* Validación de código (solo si se requiere y no tiene acceso) */}
          {configuracion.requiereCodigo && !tieneAcceso && !mostrarValidacion && (
            <div className="text-center mb-6">
              <button
                onClick={() => setMostrarValidacion(true)}
                className="bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-6 rounded-lg transition duration-300"
              >
                🔐 Ingresar código familiar
              </button>
            </div>
          )}
          
          {/* Formulario de validación */}
          {mostrarValidacion && <FormularioValidacion />}
          
          {/* Formulario principal (diseño original del dev) */}
          {(tieneAcceso || !configuracion.requiereCodigo) && (
            <div className="bg-orange-50 rounded-lg p-4 border border-orange-100">
              <h3 className="text-gray-800 font-medium mb-3">Comparte tu mensaje</h3>
              <form onSubmit={agregarComentario}>
                <input
                  type="text"
                  name="nombre"
                  value={nuevoComentario.nombre}
                  onChange={handleChange}
                  className="w-full mb-3 border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Tu nombre (opcional)"
                  disabled={enviandoComentario}
                />
                <textarea
                  name="mensaje"
                  value={nuevoComentario.mensaje}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none"
                  rows="3"
                  placeholder="Escribe un mensaje en memoria..."
                  required
                  disabled={enviandoComentario}
                ></textarea>
                <div className="mt-4 flex justify-end">
                  <button 
                    type="submit"
                    disabled={enviandoComentario}
                    className="bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white font-medium py-2 px-6 rounded-md transition duration-300 shadow-sm"
                  >
                    {enviandoComentario ? 'Publicando...' : 'Publicar mensaje'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
        
        {/* Lista de comentarios en tarjetas horizontales (diseño original) */}
        <div className="px-6 py-6">
          <div className="space-y-6">
            {/* Filtros horizontales (comentados en el original) */}
            <div className="flex flex-wrap gap-2 mb-6">
              {/* Los filtros están comentados en el diseño original */}
            </div>
            
            {/* Comentarios */}
            {comentarios.map((comentario) => {
              const fechaFormateada = comentario.fecha ? 
                new Date(comentario.fecha).toLocaleDateString('es-ES', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                }) : comentario.tiempo || 'Hace unos momentos';

              return (
                <div key={comentario._id || comentario.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:border-orange-200 transition-colors duration-200">
                  <div className="flex">
                    <div className="flex-shrink-0 mr-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-white font-semibold text-lg">
                        {comentario.nombre ? comentario.nombre.charAt(0).toUpperCase() : 'A'}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-gray-900">{comentario.nombre}</h3>
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
                          <button className="flex items-center hover:text-red-600 transition-colors duration-200">
                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clipRule="evenodd" />
                            </svg>
                            Responder
                          </button>
                        </div>
                        <button 
                          onClick={() => eliminarComentario(comentario._id || comentario.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors duration-200"
                          title="Eliminar comentario"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
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
                <h3 className="text-lg font-medium text-gray-900 mb-2">Aún no hay comentarios</h3>
                <p className="text-gray-600">Sé el primero en dejar un mensaje de condolencia.</p>
              </div>
            )}
            
            {/* Ver más comentarios (del diseño original) */}
            {paginaActual < totalPaginas && (
              <div className="text-center">
                <button 
                  onClick={cargarMasComentarios}
                  disabled={loadingComentarios}
                  className="bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 text-gray-700 font-medium py-2 px-6 rounded-md transition duration-300 inline-flex items-center"
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