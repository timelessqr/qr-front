// ====================================
// src/components/admin/search/MediaSearch.jsx
// Búsqueda de memorial por nombre del memorial o del cliente
// ====================================
import React, { useState } from 'react';

const MediaSearch = ({ onMemorialChange, memoriales, clients, selectedMemorial }) => {
  const [memorialSearch, setMemorialSearch] = useState('');
  const normalizedSearch = memorialSearch.trim().toLowerCase();

  // Filtrar memoriales por nombre del memorial o del cliente asociado
  const filteredMemoriales = memoriales.filter(memorial => 
    (memorial.nombre || '').toLowerCase().includes(normalizedSearch) ||
    (memorial.cliente?.nombre || memorial.client?.nombre || '').toLowerCase().includes(normalizedSearch) ||
    (memorial.cliente?.apellido || memorial.client?.apellido || '').toLowerCase().includes(normalizedSearch)
  );

  const memorialClientIds = new Set(
    memoriales
      .map(memorial => memorial.cliente?._id || memorial.client?._id || memorial.cliente || memorial.client)
      .filter(Boolean)
      .map(String)
  );
  const clientsWithoutMemorial = normalizedSearch
    ? clients.filter(client => {
        const fullName = `${client.nombre || ''} ${client.apellido || ''}`.trim().toLowerCase();
        const matchesSearch = fullName.includes(normalizedSearch) ||
          (client.codigoCliente || '').toLowerCase().includes(normalizedSearch);
        const clientId = client._id || client.id;

        return matchesSearch && clientId && !memorialClientIds.has(String(clientId));
      })
    : [];

  const clearMemorialSearch = () => {
    setMemorialSearch('');
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Memorial Seleccionado
      </label>
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Buscar memorial o cliente..."
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
          className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 text-sm sm:w-80"
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

      {clientsWithoutMemorial.length > 0 && (
        <div className="mt-3 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800" role="status">
          {clientsWithoutMemorial.length === 1 ? (
            <>
              <span className="font-medium">
                {clientsWithoutMemorial[0].nombre} {clientsWithoutMemorial[0].apellido}
              </span>{' '}
              existe como cliente, pero todavía no tiene un memorial asociado.
            </>
          ) : (
            <>
              {clientsWithoutMemorial.length} clientes coinciden con la búsqueda, pero todavía no tienen un memorial asociado.
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default MediaSearch;
