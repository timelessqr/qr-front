// ====================================
// src/pages/admin/pergaminos/DescargarLibro.jsx - Libro de condolencias para imprimir o guardar en PDF
// ====================================
// Todas las hojas color pergamino, con el sello de agua y el logo al pie:
// la portada es el pergamino y después van los mensajes del servicio en curso.
// Abre el diálogo de impresión, donde se elige "Guardar como PDF".
import React, { useCallback, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { pergaminoAdmin } from '../../../services/pergaminoService';
import HojasPergamino from '../../../components/pergamino/HojasPergamino';
import { imprimir } from '../../../components/pergamino/imprimir';
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

  // El navegador usa el título como nombre del PDF
  useEffect(() => {
    if (!datos) return undefined;
    const tituloAnterior = document.title;
    document.title = `Libro de condolencias - ${nombre || 'Pergamino'}`;
    return () => { document.title = tituloAnterior; };
  }, [datos, nombre]);

  const listo = useCallback(() => imprimir(), []);

  if (cargando) return <Cargando texto="Preparando el libro..." />;
  if (error) return <div className="p-6"><Aviso>{error}</Aviso></div>;

  return (
    <div className="min-h-screen bg-stone-200 print:bg-transparent">
      <p className="pt-4 px-4 text-center text-sm text-gray-600 print:hidden">
        Para guardarlo como archivo, elige «Guardar como PDF» en el diálogo de impresión.
        Si no se abrió, <button className="text-red-600 underline" onClick={() => window.print()}>ábrelo desde aquí</button>.
      </p>
      <HojasPergamino pergamino={datos.pergamino} mensajes={datos.mensajes} conLibro onListo={listo} />
    </div>
  );
};

export default DescargarLibro;
