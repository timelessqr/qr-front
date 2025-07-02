// ====================================
// src/components/admin/search/MediaSearch.jsx
// Búsqueda SIMPLE para media - solo selector de memorial
// ====================================
import React, { useState } from 'react';

const MediaSearch = ({ onMemorialChange, memoriales, selectedMemorial }) => {
  const [memorialSearch, setMemorialSearch] = useState('');

  // Filter memoriales based on search
  const filteredMemoriales = memoriales.filter(memorial => 
    memorial.nombre.toLowerCase().includes(memorialSearch.toLowerCase()) ||
    (memorial.cliente?.nombre || '').toLowerCase().includes(memorialSearch.toLowerCase()) ||
    (memorial.cliente?.apellido || '').toLowerCase().includes(memorialSearch.toLowerCase())
  );

  const clearMemorialSearch = () => {
    setMemorialSearch('');
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Memorial Seleccionado
      </label>
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Buscar memorial..."
            value={memorialSearch}
            onChange={(e) => setMemorialSearch(e.target.value)}
            className="block w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500"
          />
          {memorialSearch && (
            <button
              onClick={clearMemorialSearch}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <svg className="h-4 w-4 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        
        <select
          value={selectedMemorial?._id || ''}
          onChange={(e) => {
            const memorial = memoriales.find(m => m._id === e.target.value);
            if (onMemorialChange) {
              onMemorialChange(memorial);
            }
          }}
          className="w-80 border border-gray-300 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 text-sm"
        >
          <option value="">Seleccionar memorial...</option>
          {filteredMemoriales.map(memorial => (
            <option key={memorial._id} value={memorial._id}>
              {memorial.nombre} 
              {memorial.cliente && ` - ${memorial.cliente.nombre} ${memorial.cliente.apellido}`}
            </option>
          ))}
        </select>
      </div>
      
      {memorialSearch && (
        <div className="mt-2 text-sm text-gray-600">
          {filteredMemoriales.length} memorial{filteredMemoriales.length !== 1 ? 'es' : ''} encontrado{filteredMemoriales.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
};

export default MediaSearch;