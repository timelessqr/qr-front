// ====================================
// src/components/admin/search/MemorialSearch.jsx
// Búsqueda SIMPLE para memoriales - solo nombre
// ====================================
import React, { useState, useEffect, useRef } from 'react';

const MemorialSearch = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const lastSearchTerm = useRef(''); // 🔧 Para evitar disparos duplicados
  const isInitialized = useRef(false); // 🔧 Para evitar disparo inicial

  // Debounce search - solo cuando hay cambios reales
  useEffect(() => {
    // No disparar en el primer render si no hay búsqueda inicial
    if (!isInitialized.current && !searchTerm) {
      isInitialized.current = true;
      return;
    }

    // No disparar si el valor no ha cambiado realmente
    if (lastSearchTerm.current === searchTerm) {
      return;
    }

    const timeoutId = setTimeout(() => {
      if (onSearch) {
        onSearch(searchTerm);
        lastSearchTerm.current = searchTerm;
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]); // Solo searchTerm - onSearch debe ser estable

  const clearSearch = () => {
    setSearchTerm('');
  };

  return (
    <div className="mb-6">
      <div className="max-w-md">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Buscar memorial por nombre..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-red-500 focus:border-red-500 sm:text-sm"
          />
          {searchTerm && (
            <button
              onClick={clearSearch}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <svg className="h-4 w-4 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MemorialSearch;