// ====================================
// src/pages/admin/pergaminos/DescargarLibro.jsx - Libro de condolencias en PDF A4
// ====================================
// Todas las hojas color pergamino, con el sello de agua y el logo al pie:
// la portada es el pergamino y después van los mensajes del servicio en curso.
// Baja el PDF solo; también se puede imprimir.
import React from 'react';
import { useParams } from 'react-router-dom';
import { pergaminoAdmin } from '../../../services/pergaminoService';
import HojasPergamino from '../../../components/pergamino/HojasPergamino';
import BarraPdf, { useDescargaPdf } from '../../../components/pergamino/BarraPdf';
import { Cargando, Aviso, useCarga } from '../../../components/admin/pergaminos/ui';

const DescargarLibro = () => {
  const { salaId } = useParams();
  const { datos, cargando, error } = useCarga(async () => {
    const [pergamino, libro] = await Promise.all([
      pergaminoAdmin.obtenerPergamino(salaId),
      // Solo los mensajes visibles en el libro (aprobados) del servicio en curso
      pergaminoAdmin.listarCondolencias(salaId, { estado: 'aprobada', limit: 1000 }),
    ]);
    return { pergamino, mensajes: [...(libro.condolencias || [])].reverse() };
  }, [salaId]);

  const nombre = datos && (datos.pergamino.nombreCompletoDifunto ||
    [datos.pergamino.difunto?.nombre, datos.pergamino.difunto?.apellido].filter(Boolean).join(' '));
  const { estado, descargar } = useDescargaPdf(`Libro de condolencias - ${nombre || 'sin nombre'}`);

  if (cargando) return <Cargando texto="Preparando el libro..." />;
  if (error) return <div className="p-6"><Aviso>{error}</Aviso></div>;

  return (
    <div className="min-h-screen bg-stone-200 print:bg-transparent">
      <BarraPdf estado={estado} onDescargar={descargar} />
      <HojasPergamino pergamino={datos.pergamino} mensajes={datos.mensajes} conLibro onListo={descargar} />
    </div>
  );
};

export default DescargarLibro;
