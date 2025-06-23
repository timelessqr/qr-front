// ====================================
// src/pages/admin/MediaManagementTest.jsx - Versión simplificada para debugging
// ====================================
import React from 'react';

const MediaManagementTest = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">
        Gestión de Media - Modo Prueba
      </h1>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600">
          Si puedes ver este mensaje, la ruta está funcionando correctamente.
        </p>
        <div className="mt-4 space-y-2">
          <p>✅ React componente cargado</p>
          <p>✅ Rutas funcionando</p>
          <p>✅ CSS aplicado</p>
        </div>
      </div>
    </div>
  );
};

export default MediaManagementTest;
