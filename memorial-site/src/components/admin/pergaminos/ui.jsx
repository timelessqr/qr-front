// ====================================
// src/components/admin/pergaminos/ui.jsx - Piezas comunes de la sección Pergaminos
// ====================================
import React, { useCallback, useEffect, useState } from 'react';
import { mensajeError } from '../../../services/pergaminoService';

export const btn = {
  primario: 'inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed',
  secundario: 'inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed',
  peligro: 'inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium text-red-700 bg-white border border-red-300 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed',
  link: 'text-sm font-medium text-red-600 hover:text-red-700',
};

export const input = 'block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500';

export const Campo = ({ label, ayuda, children }) => (
  <label className="block">
    <span className="block text-sm font-medium text-gray-700 mb-1">{label}</span>
    {children}
    {ayuda && <span className="block mt-1 text-xs text-gray-500">{ayuda}</span>}
  </label>
);

export const Cargando = ({ texto = 'Cargando...' }) => (
  <div className="p-8 text-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto" />
    <p className="mt-3 text-sm text-gray-500">{texto}</p>
    <p className="mt-1 text-xs text-gray-400">Si el servidor estaba dormido, puede tardar hasta un minuto.</p>
  </div>
);

export const Aviso = ({ tipo = 'error', children, onCerrar }) => {
  const estilos = tipo === 'ok'
    ? 'bg-green-50 text-green-800 border-green-200'
    : 'bg-red-50 text-red-800 border-red-200';
  return (
    <div className={`rounded-md border px-4 py-3 text-sm flex items-start justify-between gap-4 ${estilos}`}>
      <span>{children}</span>
      {onCerrar && <button onClick={onCerrar} className="opacity-60 hover:opacity-100" aria-label="Cerrar">✕</button>}
    </div>
  );
};

// Diálogo de confirmación: la acción solo corre si se aprieta el botón rojo
export const Confirmar = ({ abierto, titulo, children, textoConfirmar = 'Confirmar', ocupado, onConfirmar, onCancelar }) => {
  if (!abierto) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-gray-900/50" onClick={ocupado ? undefined : onCancelar} />
      <div className="relative w-full max-w-md rounded-lg bg-white shadow-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900">{titulo}</h3>
        <div className="mt-2 text-sm text-gray-600">{children}</div>
        <div className="mt-6 flex justify-end gap-3">
          <button className={btn.secundario} onClick={onCancelar} disabled={ocupado}>Cancelar</button>
          <button className={btn.primario} onClick={onConfirmar} disabled={ocupado}>
            {ocupado ? 'Procesando...' : textoConfirmar}
          </button>
        </div>
      </div>
    </div>
  );
};

// Carga datos con estado de carga/error y una función para recargar
export const useCarga = (cargar, deps) => {
  const [estado, setEstado] = useState({ datos: null, cargando: true, error: null });

  const recargar = useCallback(async () => {
    setEstado((e) => ({ ...e, cargando: true, error: null }));
    try {
      const datos = await cargar();
      setEstado({ datos, cargando: false, error: null });
    } catch (error) {
      setEstado({ datos: null, cargando: false, error: mensajeError(error) });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => { recargar(); }, [recargar]);

  return { ...estado, recargar };
};

export const EstadoPergamino = ({ estado }) => {
  const mapa = {
    publicado: ['Publicado', 'bg-green-100 text-green-800'],
    borrador: ['Borrador', 'bg-yellow-100 text-yellow-800'],
    archivado: ['Archivado', 'bg-gray-100 text-gray-700'],
  };
  const [texto, clase] = mapa[estado] || [estado || '—', 'bg-gray-100 text-gray-700'];
  return <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${clase}`}>{texto}</span>;
};
