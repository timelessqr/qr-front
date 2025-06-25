// ====================================
// src/components/admin/media/MediaProfilePhotos.jsx - Gestión de fotos de perfil del memorial
// ====================================
import React, { useState, useEffect, useCallback } from 'react';
import mediaService from '../../../services/mediaService';
import memorialService from '../../../services/memorialService';

const MediaProfilePhotos = ({ selectedMemorial, onStatsUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [currentPhotos, setCurrentPhotos] = useState({
    fotoPerfil: null,
    fotoJoven: null
  });
  const [uploadingType, setUploadingType] = useState(null); // 'perfil' o 'joven'

  const profileId = selectedMemorial?._id;

  useEffect(() => {
    if (profileId) {
      loadCurrentPhotos();
    }
  }, [profileId, selectedMemorial]);

  const loadCurrentPhotos = async () => {
    try {
      setLoading(true);
      
      // Obtener datos actuales del memorial
      const memorial = await memorialService.getMemorialById(profileId);
      
      const fotoPerfil = memorial.data?.fotoPerfil || memorial.fotoPerfil || null;
      const fotoJoven = memorial.data?.fotoJoven || memorial.fotoJoven || null;
      
      setCurrentPhotos({
        fotoPerfil,
        fotoJoven
      });
      
    } catch (error) {
      console.error('❌ Error cargando fotos de perfil:', error);
      setCurrentPhotos({ fotoPerfil: null, fotoJoven: null });
    } finally {
      setLoading(false);
    }
  };

  const updateStats = useCallback(() => {
    if (onStatsUpdate) {
      const totalProfilePhotos = (currentPhotos.fotoPerfil ? 1 : 0) + (currentPhotos.fotoJoven ? 1 : 0);
      onStatsUpdate({
        totalProfilePhotos
      });
    }
  }, [currentPhotos]); // ← REMOVER onStatsUpdate de las dependencias

  useEffect(() => {
    updateStats();
  }, [currentPhotos, updateStats]);

  const handleFileSelect = async (files, type) => {
    if (!files || files.length === 0) return;
    if (uploading) return;

    const file = files[0]; // Solo tomamos el primer archivo

    // Validar que sea imagen
    if (!file.type.startsWith('image/')) {
      alert('Solo se permiten imágenes');
      return;
    }

    const formData = new FormData();
    formData.append('seccion', 'perfil');
    formData.append('titulo', type === 'perfil' ? 'Foto de perfil principal' : 'Foto de biografía');
    formData.append('descripcion', type === 'perfil' ? 'Foto principal del memorial' : 'Foto para la sección de biografía');
    formData.append('files', file);

    try {
      setUploading(true);
      setUploadingType(type);
      
      // Subir archivo
      const uploadResponse = await mediaService.uploadFiles(profileId, formData);
      
      if (uploadResponse.success && uploadResponse.uploaded && uploadResponse.uploaded.length > 0) {
        const uploadedFile = uploadResponse.uploaded[0];
        const imageUrl = uploadedFile.url;
        
        // Actualizar el memorial con la nueva URL
        const updateData = {};
        if (type === 'perfil') {
          updateData.fotoPerfil = imageUrl;
        } else {
          updateData.fotoJoven = imageUrl;
        }
        
        const updateResponse = await memorialService.updateMemorialData(profileId, updateData);
        
        if (updateResponse.success) {
          // Actualizar estado local
          setCurrentPhotos(prev => ({
            ...prev,
            [type === 'perfil' ? 'fotoPerfil' : 'fotoJoven']: imageUrl
          }));
          
          // Limpiar input
          const inputId = type === 'perfil' ? 'file-upload-perfil' : 'file-upload-joven';
          const fileInput = document.getElementById(inputId);
          if (fileInput) {
            fileInput.value = '';
          }
        } else {
          throw new Error('Error actualizando el memorial');
        }
      } else {
        throw new Error('Error en la subida del archivo');
      }
      
    } catch (error) {
      console.error(`Error subiendo ${type}:`, error);
      alert(`Error al subir la foto: ${error.message}`);
    } finally {
      setUploading(false);
      setUploadingType(null);
    }
  };

  const handleRemovePhoto = async (type) => {
    if (!window.confirm(`¿Estás seguro de eliminar la ${type === 'perfil' ? 'foto de perfil' : 'foto de biografía'}?`)) {
      return;
    }

    try {
      const updateData = {};
      updateData[type === 'perfil' ? 'fotoPerfil' : 'fotoJoven'] = null;
      
      const response = await memorialService.updateMemorialData(profileId, updateData);
      
      if (response.success) {
        setCurrentPhotos(prev => ({
          ...prev,
          [type === 'perfil' ? 'fotoPerfil' : 'fotoJoven']: null
        }));
      }
    } catch (error) {
      console.error(`Error eliminando ${type}:`, error);
      alert(`Error al eliminar la foto: ${error.message}`);
    }
  };

  // Si no hay memorial seleccionado
  if (!selectedMemorial) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Memorial no seleccionado
        </h3>
        <p className="text-gray-500">
          Selecciona un memorial para gestionar sus fotos
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header simplificado */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">
            Gestión de Imágenes Principales
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Configura la foto de perfil circular y la imagen de biografía
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
          <span className="ml-3 text-gray-600">Cargando fotos...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Foto de Perfil Principal */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-medium text-gray-900 flex items-center">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-blue-600 text-lg">👤</span>
                </div>
                Imagen Circular
              </h4>
            </div>
            
            <p className="text-sm text-gray-600 mb-4">
              Aparece en la cabecera del memorial
            </p>

            {/* Preview actual */}
            <div className="mb-6">
              <div className="w-32 h-32 mx-auto mb-4">
                {currentPhotos.fotoPerfil ? (
                  <img
                    src={currentPhotos.fotoPerfil}
                    alt="Foto de perfil actual"
                    className="w-full h-full object-cover rounded-full border-4 border-gray-200 shadow-lg"
                    onError={(e) => {
                      e.target.src = '/img/default-profile.jpg';
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 rounded-full border-4 border-gray-200 flex items-center justify-center">
                    <span className="text-3xl text-gray-400">👤</span>
                  </div>
                )}
              </div>
              
              <div className="text-center">
                {currentPhotos.fotoPerfil ? (
                  <span className="text-sm text-green-600 font-medium">✅ Configurada</span>
                ) : (
                  <span className="text-sm text-gray-500">Sin imagen</span>
                )}
              </div>
            </div>

            {/* Controles */}
            <div className="space-y-3">
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileSelect(e.target.files, 'perfil')}
                  className="hidden"
                  id="file-upload-perfil"
                  disabled={uploading}
                />
                <label
                  htmlFor="file-upload-perfil"
                  className={`w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white ${
                    uploading && uploadingType === 'perfil' 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-blue-600 hover:bg-blue-700 cursor-pointer'
                  } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                >
                  {uploading && uploadingType === 'perfil' ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Subiendo...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      {currentPhotos.fotoPerfil ? 'Cambiar' : 'Subir Imagen'}
                    </>
                  )}
                </label>
              </div>

              {currentPhotos.fotoPerfil && (
                <button
                  onClick={() => handleRemovePhoto('perfil')}
                  className="w-full inline-flex items-center justify-center px-4 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  disabled={uploading}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Eliminar
                </button>
              )}
            </div>
          </div>

          {/* Foto de Biografía (Joven) */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-medium text-gray-900 flex items-center">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-purple-600 text-lg">📸</span>
                </div>
                Imagen de Biografía
              </h4>
            </div>
            
            <p className="text-sm text-gray-600 mb-4">
              Acompaña el texto de la biografía
            </p>

            {/* Preview actual */}
            <div className="mb-6">
              <div className="w-48 h-48 mx-auto mb-4">
                {currentPhotos.fotoJoven ? (
                  <img
                    src={currentPhotos.fotoJoven}
                    alt="Foto de biografía actual"
                    className="w-full h-full object-cover rounded-lg border-4 border-gray-200 shadow-lg"
                    onError={(e) => {
                      e.target.src = '/img/default-photo.jpg';
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 rounded-lg border-4 border-gray-200 flex items-center justify-center">
                    <span className="text-4xl text-gray-400">📸</span>
                  </div>
                )}
              </div>
              
              <div className="text-center">
                {currentPhotos.fotoJoven ? (
                  <span className="text-sm text-green-600 font-medium">✅ Configurada</span>
                ) : (
                  <span className="text-sm text-gray-500">Sin imagen</span>
                )}
              </div>
            </div>

            {/* Controles */}
            <div className="space-y-3">
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileSelect(e.target.files, 'joven')}
                  className="hidden"
                  id="file-upload-joven"
                  disabled={uploading}
                />
                <label
                  htmlFor="file-upload-joven"
                  className={`w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white ${
                    uploading && uploadingType === 'joven' 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-purple-600 hover:bg-purple-700 cursor-pointer'
                  } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500`}
                >
                  {uploading && uploadingType === 'joven' ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Subiendo...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      {currentPhotos.fotoJoven ? 'Cambiar' : 'Subir Imagen'}
                    </>
                  )}
                </label>
              </div>

              {currentPhotos.fotoJoven && (
                <button
                  onClick={() => handleRemovePhoto('joven')}
                  className="w-full inline-flex items-center justify-center px-4 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  disabled={uploading}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Eliminar
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Información simplificada */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <span className="text-blue-400 text-lg">💡</span>
          </div>
          <div className="ml-3">
            <h4 className="text-sm font-medium text-blue-800">
              Información importante
            </h4>
            <div className="mt-2 text-sm text-blue-700">
              <ul className="list-disc list-inside space-y-1">
                <li><strong>Imagen Circular:</strong> Se usa en la cabecera y como respaldo en biografía</li>
                <li><strong>Imagen de Biografía:</strong> Tiene prioridad y se muestra en la sección biografía</li>
                <li>Si no hay imagen de biografía, se usa automáticamente la circular</li>
                <li>Formatos: JPG, PNG • Tamaño máximo: 100MB</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MediaProfilePhotos;