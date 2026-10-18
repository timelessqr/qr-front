// ====================================
// src/components/pergamino/BarraPdf.jsx - Descarga automática del PDF A4
// ====================================
// Cuando las hojas están listas baja el PDF solo; deja botones para bajarlo
// otra vez o imprimir. No sale en la impresión.
import React, { useCallback, useState } from 'react';
import { descargarPdf } from './pdf';

export const useDescargaPdf = (nombreArchivo) => {
  const [estado, setEstado] = useState({ fase: 'preparando' });

  const descargar = useCallback(async () => {
    setEstado({ fase: 'generando' });
    try {
      const archivo = await descargarPdf(nombreArchivo);
      setEstado({ fase: 'listo', archivo });
    } catch (error) {
      console.error('Error generando el PDF:', error);
      setEstado({ fase: 'error' });
    }
  }, [nombreArchivo]);

  return { estado, descargar };
};

const BarraPdf = ({ estado, onDescargar }) => {
  const textos = {
    preparando: 'Preparando las hojas…',
    generando: 'Generando el PDF…',
    listo: `Listo: se descargó ${estado.archivo || 'el PDF'}.`,
    error: 'No se pudo generar el PDF. Prueba de nuevo o usa Imprimir.',
  };
  const ocupado = estado.fase === 'preparando' || estado.fase === 'generando';

  return (
    <div className="print:hidden sticky top-0 z-10 flex flex-wrap items-center justify-center gap-3 bg-white/90 px-4 py-3 text-sm shadow-sm backdrop-blur">
      <span className={estado.fase === 'error' ? 'text-red-700' : 'text-gray-700'}>{textos[estado.fase]}</span>
      <button onClick={onDescargar} disabled={ocupado}
        className="rounded-md bg-[#A8875A] px-4 py-2 font-medium text-white hover:bg-[#93754C] disabled:opacity-50">
        Descargar PDF
      </button>
      <button onClick={() => window.print()} disabled={ocupado}
        className="rounded-md border border-gray-300 bg-white px-4 py-2 font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50">
        Imprimir
      </button>
    </div>
  );
};

export default BarraPdf;
