// ====================================
// src/components/admin/dashboard/RecentActivity.jsx - Actividad reciente
// ====================================
import React from 'react';

const RecentActivity = ({ title, items = [], type, onAction }) => {
  // 🚨 DEBUG: Ver datos que llegan
  console.log(`=== DEBUG RecentActivity (${type}) ===`);
  console.log('Title:', title);
  console.log('Items:', items);
  console.log('Items length:', items?.length);
  console.log('=====================================');
  const formatDate = (dateString) => {
    if (!dateString) return 'Sin fecha';
    try {
      const date = new Date(dateString);
      // Verificar si la fecha es válida
      if (isNaN(date.getTime())) {
        return 'Fecha inválida';
      }
      return date.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.warn('Error formateando fecha:', dateString, error);
      return 'Fecha no válida';
    }
  };

  const renderItem = (item, index) => {
    // Verificación de seguridad
    if (!item) {
      console.warn(`Item inválido en índice ${index}:`, item);
      return null;
    }
    if (type === 'clients') {
      return (
        <li key={item.id || item._id || index} className="py-4">
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {item.nombre || 'Cliente sin nombre'}
              </p>
              <p className="text-sm text-gray-500 truncate">
                {item.telefono || 'Sin teléfono'} • {item.email || 'Sin email'}
              </p>
              <p className="text-xs text-gray-400">
                Registrado: {formatDate(item.fechaRegistro || item.createdAt)}
              </p>
            </div>
            <div className="flex-shrink-0">
              <button
                onClick={() => {
                  // 🚨 DEBUG: Ver datos del item antes de navegar
                  console.log('=== DEBUG RecentActivity onClick ===');
                  console.log('Item completo:', item);
                  console.log('Item._id:', item._id);
                  console.log('Item.id:', item.id);
                  console.log('Acción:', 'view-client');
                  console.log('=======================================');
                  // 🔧 FIX: Usar item.id en lugar de item._id
                  onAction('view-client', item.id || item._id);
                }}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 hover:bg-blue-200"
              >
                Ver
              </button>
            </div>
          </div>
        </li>
      );
    }

    if (type === 'memorials') {
      return (
        <li key={item.id || item._id || index} className="py-4">
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                <svg className="h-5 w-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {item.nombre || 'Memorial sin nombre'}
              </p>
              <p className="text-sm text-gray-500 truncate">
                Cliente: {item.cliente?.nombre || item.client?.nombre || 'Cliente no especificado'}
              </p>
              <p className="text-xs text-gray-400">
                Creado: {formatDate(item.fechaCreacion || item.createdAt)}
              </p>
            </div>
            <div className="flex-shrink-0 flex space-x-2">
              <button
                onClick={() => {
                  console.log('=== DEBUG Memorial onClick ===');
                  console.log('Memorial item:', item);
                  console.log('Memorial item.id:', item.id);
                  console.log('Memorial item._id:', item._id);
                  console.log('===============================');
                  onAction('view-memorial', item.id || item._id);
                }}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 hover:bg-red-200"
              >
                Ver
              </button>
              {item.qr && (
                <button
                  onClick={() => onAction('print-qr', item.id || item._id)}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 hover:bg-green-200"
                >
                  QR
                </button>
              )}
            </div>
          </div>
        </li>
      );
    }

    return null;
  };

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            {title}
          </h3>
          <button
            onClick={() => onAction(type === 'clients' ? 'view-all-clients' : 'view-all-memorials')}
            className="text-sm font-medium text-red-600 hover:text-red-500"
          >
            Ver todos
          </button>
        </div>

        {items && items.length > 0 ? (
          <div className="flow-root">
            <ul className="-my-4 divide-y divide-gray-200">
              {items.slice(0, 5).map(renderItem)}
            </ul>
          </div>
        ) : (
          <div className="text-center py-6">
            <div className="mx-auto h-12 w-12 text-gray-400">
              {type === 'clients' ? (
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              ) : (
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              )}
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              {type === 'clients' ? 'No hay clientes' : 'No hay memoriales'}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {type === 'clients' 
                ? 'Comienza registrando tu primer cliente.' 
                : 'Crea tu primer memorial para un cliente.'
              }
            </p>
            <div className="mt-6">
              <button
                onClick={() => onAction(type === 'clients' ? 'new-client' : 'new-memorial')}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                {type === 'clients' ? 'Agregar Cliente' : 'Crear Memorial'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentActivity;
