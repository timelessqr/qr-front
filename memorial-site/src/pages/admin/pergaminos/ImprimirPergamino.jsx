// ====================================
// src/pages/admin/pergaminos/ImprimirPergamino.jsx - Hoja para imprimir
// ====================================
// Solo el pergamino con su información: sin comentarios del libro y sin el
// menú del admin. Abre el diálogo de impresión apenas carga.
import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { pergaminoAdmin } from '../../../services/pergaminoService';
import PergaminoView from '../../../components/pergamino/PergaminoView';
import { Cargando, Aviso, useCarga } from '../../../components/admin/pergaminos/ui';

const ImprimirPergamino = () => {
  const { salaId } = useParams();
  const { datos, cargando, error } = useCarga(() => pergaminoAdmin.obtenerPergamino(salaId), [salaId]);

  useEffect(() => {
    if (!datos) return;
    // Esperar a que carguen la foto y la tipografía antes de imprimir
    const imagenes = [...document.images].filter((img) => !img.complete);
    Promise.all([
      document.fonts?.ready,
      ...imagenes.map((img) => new Promise((ok) => { img.onload = ok; img.onerror = ok; })),
    ]).then(() => window.print());
  }, [datos]);

  if (cargando) return <Cargando texto="Preparando impresión..." />;
  if (error) return <div className="p-6"><Aviso>{error}</Aviso></div>;

  return (
    <div className="pergamino-impresion min-h-screen bg-white py-8 print:py-0">
      <p className="text-center text-sm text-gray-500 mb-6 print:hidden">
        Si no se abrió el diálogo, <button className="text-red-600 underline" onClick={() => window.print()}>imprime desde aquí</button>.
      </p>
      <PergaminoView pergamino={datos} />
    </div>
  );
};

export default ImprimirPergamino;
