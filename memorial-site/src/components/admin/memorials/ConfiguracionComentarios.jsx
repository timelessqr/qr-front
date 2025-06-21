import React, { useState, useEffect } from 'react';
import { comentarioService } from '../../../services';

const ConfiguracionComentarios = ({ memorial, onActualizar }) => {
  
  // ===============================
  // 🎛️ ESTADOS
  // ===============================
  const [configuracion, setConfiguracion] = useState({
    habilitados: false,
    requiereCodigo: true,
    codigo: '',
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
          ...result.config,
          // Si el memorial ya tiene un código en la BD, lo mostramos
          codigo: memorial.codigoComentarios || prev.codigo || ''
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
        codigoComentarios: configuracion.codigo.trim(),
        comentariosHabilitados: configuracion.habilitados,
        // requiereCodigo se determina automáticamente según si hay código
        mensaje: configuracion.mensaje.trim()
      };
      
      const result = await comentarioService.configurarCodigo(memorial.id, configData);
      
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

  const generarCodigoAutomatico = async () => {
    setGuardando(true);
    setError('');
    
    try {
      const result = await comentarioService.generarCodigo(memorial.id);
      
      if (result.success) {
        setConfiguracion(prev => ({
          ...prev,
          codigo: result.codigo
        }));
        
        setMensaje(`✅ Código generado: ${result.codigo}`);
        
        // Limpiar mensaje después de 5 segundos
        setTimeout(() => setMensaje(''), 5000);
        
      } else {
        setError(result.message || 'Error al generar código');
      }
      
    } catch (err) {
      console.error('❌ Error generando código:', err);
      setError('Error al generar el código');
    } finally {
      setGuardando(false);
    }
  };

  const eliminarComentario = async (comentarioId) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este comentario?')) {
      return;
    }
    
    try {
      const result = await comentarioService.eliminarComentario(memorial.id, comentarioId);
      
      if (result.success) {
        // Remover de la lista local
        setComentarios(prev => prev.filter(c => c._id !== comentarioId));
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

  const TarjetaComentario = ({ comentario }) => {
    const fechaFormateada = new Date(comentario.fecha).toLocaleDateString('es-ES', {
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

    return (
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:border-red-200 transition-colors duration-200">
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-white font-semibold text-sm">
              {comentario.nombre ? comentario.nombre.charAt(0).toUpperCase() : 'A'}
            </div>
            <div>
              <h4 className="font-medium text-gray-900">{comentario.nombre}</h4>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>{getRelacionIcon(comentario.relacion)} {comentario.relacion}</span>
                <span>•</span>
                <span>{fechaFormateada}</span>
              </div>
            </div>
          </div>
          
          <button
            onClick={() => eliminarComentario(comentario._id)}
            className="text-gray-400 hover:text-red-500 transition-colors duration-200 p-1"
            title="Eliminar comentario"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
        
        <p className="text-gray-700 leading-relaxed mb-2">{comentario.mensaje}</p>
        
        {comentario.email && (
          <p className="text-sm text-gray-500">📧 {comentario.email}</p>
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
          💌 Configuración de Comentarios
        </h2>
        <p className="text-gray-600">
          Memorial: <strong>{memorial.nombreCompleto}</strong> ({memorial.qrCode})
        </p>
      </div>

      {/* Mensajes de estado */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 text-sm">❌ {error}</p>
        </div>
      )}
      
      {mensaje && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800 text-sm">{mensaje}</p>
        </div>
      )}

      {/* Configuración */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">⚙️ Configuración</h3>
        
        <form onSubmit={guardarConfiguracion} className="space-y-4">
          
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

          {/* Requerir código */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="requiereCodigo"
              checked={configuracion.requiereCodigo}
              onChange={(e) => setConfiguracion(prev => ({ ...prev, requiereCodigo: e.target.checked }))}
              className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
            />
            <label htmlFor="requiereCodigo" className="ml-2 block text-sm text-gray-900">
              Requerir código familiar para comentar
            </label>
          </div>

          {/* Código familiar */}
          {configuracion.requiereCodigo && (
            <div>
              <label htmlFor="codigo" className="block text-sm font-medium text-gray-700 mb-2">
                Código Familiar
              </label>
              <div className="flex gap-3">
                <input
                  type="text"
                  id="codigo"
                  value={configuracion.codigo}
                  onChange={(e) => setConfiguracion(prev => ({ ...prev, codigo: e.target.value }))}
                  className="flex-1 border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="Ej: FAMILIA-2025-ABC"
                />
                <button
                  type="button"
                  onClick={generarCodigoAutomatico}
                  disabled={guardando}
                  className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition duration-300"
                >
                  🎲 Generar
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Este código lo compartirás con la familia para que puedan dejar comentarios
              </p>
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

      {/* Lista de comentarios */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">📝 Comentarios Recibidos</h3>
          {totalComentarios > 0 && (
            <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
              {totalComentarios} {totalComentarios === 1 ? 'comentario' : 'comentarios'}
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
              <TarjetaComentario key={comentario._id} comentario={comentario} />
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