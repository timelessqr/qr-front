// ====================================
// src/pages/admin/pergaminos/ImprimirPergamino.jsx - El pergamino en PDF A4
// ====================================
// Solo el pergamino con su información, en una hoja A4: sin comentarios del
// libro y sin el menú del admin. Baja el PDF solo; también se puede imprimir.
import React from 'react';
import { useParams } from 'react-router-dom';
import { pergaminoAdmin } from '../../../services/pergaminoService';
import HojasPergamino from '../../../components/pergamino/HojasPergamino';
import BarraPdf, { useDescargaPdf } from '../../../components/pergamino/BarraPdf';
import { Cargando, Aviso, useCarga } from '../../../components/admin/pergaminos/ui';

const nombreDe = (p) => p?.nombreCompletoDifunto || [p?.difunto?.nombre, p?.difunto?.apellido].filter(Boolean).join(' ');

const ImprimirPergamino = () => {
  const { salaId } = useParams();
  const { datos, cargando, error } = useCarga(() => pergaminoAdmin.obtenerPergamino(salaId), [salaId]);
  const { estado, descargar } = useDescargaPdf(`Pergamino - ${nombreDe(datos) || 'sin nombre'}`);

  if (cargando) return <Cargando texto="Preparando el pergamino..." />;
  if (error) return <div className="p-6"><Aviso>{error}</Aviso></div>;

  return (
    <div className="min-h-screen bg-stone-200 print:bg-transparent">
      <BarraPdf estado={estado} onDescargar={descargar} />
      <HojasPergamino pergamino={datos} onListo={descargar} />
    </div>
  );
};

export default ImprimirPergamino;
