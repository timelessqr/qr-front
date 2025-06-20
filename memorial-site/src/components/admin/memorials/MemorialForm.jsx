// ====================================
// src/components/admin/memorials/MemorialForm.jsx - Formulario de memorial
// ====================================
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { memorialService, clientService, qrService } from '../../../services';

const MemorialForm = () => {
  const navigate = useNavigate();
  const params = useParams();
  const { clientId, memorialId } = params;
  const isEdit = !!memorialId;
  
  // Debug: Ver qué parámetros estamos recibiendo
  console.log('=== DEBUG MEMORIAL FORM ===');
  console.log('Todos los params:', params);
  console.log('clientId:', clientId);
  console.log('memorialId:', memorialId);
  console.log('isEdit:', isEdit);
  console.log('window.location.pathname:', window.location.pathname);
  
  const [client, setClient] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    fechaNacimiento: '',
    fechaFallecimiento: '',
    profesion: '',
    frase: '',
    biografia: '',
    ubicacion: {
      ciudad: '',
      pais: '',
      cementerio: ''
    },
    familia: {
      conyuge: '',
      hijos: [],
      padres: []
    }
  });
  
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState('');
  const [qrGenerated, setQrGenerated] = useState(false);

  useEffect(() => {
    console.log('=== useEffect ejecutándose ===');
    console.log('clientId en useEffect:', clientId);
    console.log('memorialId en useEffect:', memorialId);
    
    if (clientId && clientId !== 'undefined') {
      console.log('Cargando cliente con ID:', clientId);
      loadClient();
    } else {
      console.warn('clientId es undefined o inválido:', clientId);
    }
    
    if (isEdit && memorialId && memorialId !== 'undefined') {
      console.log('Cargando memorial para edición con ID:', memorialId);
      loadMemorial();
    }
  }, [clientId, memorialId, isEdit]);

  const loadClient = async () => {
    if (!clientId || clientId === 'undefined') {
      console.error('No se puede cargar cliente: clientId es undefined');
      setError('ID de cliente no válido. Por favor regresa a la lista de clientes.');
      return;
    }
    
    // Validar que el clientId tiene formato de MongoDB ObjectId
    const mongoIdRegex = /^[0-9a-fA-F]{24}$/;
    if (!mongoIdRegex.test(clientId)) {
      console.error('clientId no tiene formato válido de MongoDB:', clientId);
      setError('ID de cliente con formato inválido. Por favor regresa a la lista de clientes.');
      return;
    }
    
    try {
      setLoading(true);
      console.log('Llamando a clientService.getClientById con:', clientId);
      const clientData = await clientService.getClientById(clientId);
      console.log('Cliente cargado:', clientData);
      setClient(clientData);
      
      // Pre-llenar algunos datos del cliente
      setFormData(prev => ({
        ...prev,
        ubicacion: {
          ...prev.ubicacion,
          ciudad: clientData.ciudad || ''
        }
      }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadMemorial = async () => {
    try {
      setLoading(true);
      const memorial = await memorialService.getMemorialById(memorialId);
      setFormData(memorial);
      setClient(memorial.client);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleArrayChange = (field, index, value) => {
    setFormData(prev => {
      const newArray = [...prev.familia[field]];
      if (value === '') {
        newArray.splice(index, 1);
      } else {
        newArray[index] = value;
      }
      return {
        ...prev,
        familia: {
          ...prev.familia,
          [field]: newArray
        }
      };
    });
  };

  const addArrayField = (field) => {
    setFormData(prev => ({
      ...prev,
      familia: {
        ...prev.familia,
        [field]: [...prev.familia[field], '']
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('=== ENVIANDO MEMORIAL ===');
    console.log('clientId al enviar:', clientId);
    console.log('formData al enviar:', formData);
    
    try {
      setSubmitLoading(true);
      setError('');
      
      if (!clientId || clientId === 'undefined') {
        throw new Error('No se puede crear memorial: ID de cliente no válido');
      }
      
      const memorialData = {
        ...formData,
        clientId: clientId
      };
      
      console.log('Datos finales a enviar:', memorialData);
      
      let memorial;
      if (isEdit) {
        memorial = await memorialService.updateMemorial(memorialId, memorialData);
      } else {
        memorial = await memorialService.createMemorial(memorialData);
      }
      
      // Generar QR automáticamente si es nuevo memorial
      if (!isEdit) {
        try {
          await qrService.generateQR(memorial._id);
          setQrGenerated(true);
        } catch (qrError) {
          console.warn('No se pudo generar QR automáticamente:', qrError);
        }
      }
      
      // Redirigir a la lista de memoriales o mostrar QR
      if (qrGenerated && !isEdit) {
        navigate(`/admin/memorials/${memorial._id}/print-qr`);
      } else {
        navigate('/admin/memorials');
      }
      
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-6">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/4 mb-6"></div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="space-y-4">
                {[...Array(8)].map((_, i) => (
                  <div key={i}>
                    <div className="h-4 bg-gray-300 rounded w-1/4 mb-2"></div>
                    <div className="h-10 bg-gray-300 rounded"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <nav className="flex mb-4" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-4">
              <li>
                <button
                  onClick={() => navigate('/admin/memorials')}
                  className="text-gray-400 hover:text-gray-500"
                >
                  Memoriales
                </button>
              </li>
              <li>
                <div className="flex items-center">
                  <svg className="flex-shrink-0 h-5 w-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="ml-4 text-sm font-medium text-gray-500">
                    {isEdit ? 'Editar Memorial' : 'Nuevo Memorial'}
                  </span>
                </div>
              </li>
            </ol>
          </nav>
          
          <h1 className="text-2xl font-bold text-gray-900">
            {isEdit ? 'Editar Memorial' : 'Crear Nuevo Memorial'}
          </h1>
          {client && (
            <p className="mt-1 text-sm text-gray-500">
              Cliente: {client.nombre} • {client.telefono}
            </p>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-md bg-red-50 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Información básica */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Información Básica
              </h3>
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">
                    Nombre completo *
                  </label>
                  <input
                    type="text"
                    name="nombre"
                    id="nombre"
                    required
                    value={formData.nombre}
                    onChange={handleChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm"
                    placeholder="Nombre completo de la persona fallecida"
                  />
                </div>

                <div>
                  <label htmlFor="fechaNacimiento" className="block text-sm font-medium text-gray-700">
                    Fecha de nacimiento
                  </label>
                  <input
                    type="date"
                    name="fechaNacimiento"
                    id="fechaNacimiento"
                    value={formData.fechaNacimiento?.split('T')[0] || ''}
                    onChange={handleChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="fechaFallecimiento" className="block text-sm font-medium text-gray-700">
                    Fecha de fallecimiento
                  </label>
                  <input
                    type="date"
                    name="fechaFallecimiento"
                    id="fechaFallecimiento"
                    value={formData.fechaFallecimiento?.split('T')[0] || ''}
                    onChange={handleChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="profesion" className="block text-sm font-medium text-gray-700">
                    Profesión u ocupación
                  </label>
                  <input
                    type="text"
                    name="profesion"
                    id="profesion"
                    value={formData.profesion}
                    onChange={handleChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm"
                    placeholder="Ej: Profesor, Médico, Ama de casa..."
                  />
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="frase" className="block text-sm font-medium text-gray-700">
                    Frase memorable
                  </label>
                  <input
                    type="text"
                    name="frase"
                    id="frase"
                    value={formData.frase}
                    onChange={handleChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm"
                    placeholder="Una frase que la representaba o que le gustaba decir"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Ubicación */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Ubicación
              </h3>
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="ubicacion.ciudad" className="block text-sm font-medium text-gray-700">
                    Ciudad
                  </label>
                  <input
                    type="text"
                    name="ubicacion.ciudad"
                    id="ubicacion.ciudad"
                    value={formData.ubicacion.ciudad}
                    onChange={handleChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="ubicacion.pais" className="block text-sm font-medium text-gray-700">
                    País
                  </label>
                  <input
                    type="text"
                    name="ubicacion.pais"
                    id="ubicacion.pais"
                    value={formData.ubicacion.pais}
                    onChange={handleChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="ubicacion.cementerio" className="block text-sm font-medium text-gray-700">
                    Cementerio
                  </label>
                  <input
                    type="text"
                    name="ubicacion.cementerio"
                    id="ubicacion.cementerio"
                    value={formData.ubicacion.cementerio}
                    onChange={handleChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm"
                    placeholder="Nombre del cementerio donde descansa"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Familia */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Información Familiar
              </h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="familia.conyuge" className="block text-sm font-medium text-gray-700">
                    Cónyuge
                  </label>
                  <input
                    type="text"
                    name="familia.conyuge"
                    id="familia.conyuge"
                    value={formData.familia.conyuge}
                    onChange={handleChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm"
                    placeholder="Nombre del esposo/esposa"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hijos
                  </label>
                  {formData.familia.hijos.map((hijo, index) => (
                    <div key={index} className="flex items-center space-x-2 mb-2">
                      <input
                        type="text"
                        value={hijo}
                        onChange={(e) => handleArrayChange('hijos', index, e.target.value)}
                        className="flex-1 border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm"
                        placeholder="Nombre del hijo/hija"
                      />
                      <button
                        type="button"
                        onClick={() => handleArrayChange('hijos', index, '')}
                        className="text-red-600 hover:text-red-800"
                      >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addArrayField('hijos')}
                    className="text-sm text-red-600 hover:text-red-800"
                  >
                    + Agregar hijo
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Biografía */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Biografía
              </h3>
              <div>
                <label htmlFor="biografia" className="block text-sm font-medium text-gray-700">
                  Historia de vida
                </label>
                <textarea
                  id="biografia"
                  name="biografia"
                  rows={8}
                  value={formData.biografia}
                  onChange={handleChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm"
                  placeholder="Escribe la historia de vida de la persona. Incluye aspectos importantes como su personalidad, logros, momentos especiales, lo que más le gustaba hacer, su legado, etc."
                />
                <p className="mt-2 text-sm text-gray-500">
                  Esta biografía aparecerá en el memorial público. Sé respetuoso y cariñoso.
                </p>
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate('/admin/memorials')}
              className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitLoading}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
            >
              {submitLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="m12 2v4m0 12v4m8-10h-4M6 12H2"></path>
                  </svg>
                  {isEdit ? 'Actualizando...' : 'Creando...'}
                </>
              ) : (
                <>
                  {isEdit ? 'Actualizar Memorial' : 'Crear Memorial'}
                  {!isEdit && ' y Generar QR'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MemorialForm;
