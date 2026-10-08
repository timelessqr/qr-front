// ====================================
// src/pages/admin/pergaminos/ImprimirPergamino.jsx - Hoja para imprimir
// ====================================
// Solo el pergamino con su información, en una A4 color pergamino: sin
// comentarios del libro y sin el menú del admin. Abre el diálogo de impresión.
import React, { useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { pergaminoAdmin } from '../../../services/pergaminoService';
import HojasPergamino from '../../../components/pergamino/HojasPergamino';
import { imprimir } from '../../../components/pergamino/imprimir';
import { Cargando, Aviso, useCarga } from '../../../components/admin/pergaminos/ui';

const ImprimirPergamino = () => {
  const { salaId } = useParams();
  const { datos, cargando, error } = useCarga(() => pergaminoAdmin.obtenerPergamino(salaId), [salaId]);
  const listo = useCallback(() => imprimir(), []);

  if (cargando) return <Cargando texto="Preparando impresión..." />;
  if (error) return <div className="p-6"><Aviso>{error}</Aviso></div>;

  return (
    <div className="min-h-screen bg-stone-200 print:bg-transparent">
      <p className="pt-4 text-center text-sm text-gray-600 print:hidden">
        Si no se abrió el diálogo, <button className="text-red-600 underline" onClick={() => window.print()}>imprime desde aquí</button>.
      </p>
      <HojasPergamino pergamino={datos} onListo={listo} />
    </div>
  );
};

export default ImprimirPergamino;
