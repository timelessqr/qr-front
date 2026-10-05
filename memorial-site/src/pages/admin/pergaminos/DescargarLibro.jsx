// ====================================
// src/pages/admin/pergaminos/DescargarLibro.jsx - Libro de condolencias para imprimir o guardar en PDF
// ====================================
// Portada: el pergamino. Después, los mensajes del servicio en curso, con los
// mismos colores. Abre el diálogo de impresión, donde se elige "Guardar como PDF".
import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { pergaminoAdmin } from '../../../services/pergaminoService';
import PergaminoView from '../../../components/pergamino/PergaminoView';
import { ajustarAHoja, imprimirCuandoCargue } from '../../../components/pergamino/imprimir';
import { Cargando, Aviso, useCarga } from '../../../components/admin/pergaminos/ui';

const fecha = (iso) => new Date(iso).toLocaleDateString('es-CL', {
  day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
});

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

  useEffect(() => {
    if (!datos) return undefined;
    const tituloAnterior = document.title;
    // El navegador usa el título como nombre del PDF
    document.title = `Libro de condolencias - ${nombre || 'Pergamino'}`;
    imprimirCuandoCargue();
    return () => { document.title = tituloAnterior; };
  }, [datos, nombre]);

  if (cargando) return <Cargando texto="Preparando el libro..." />;
  if (error) return <div className="p-6"><Aviso>{error}</Aviso></div>;

  const { pergamino, mensajes } = datos;
  const estilos = pergamino.estilos || {};
  const primario = estilos.colorPrimario || '#8C7B5A';
  const texto = estilos.colorTexto || '#4A443B';

  return (
    <div className="libro-impresion min-h-screen bg-white py-8 print:py-0">
      <p className="text-center text-sm text-gray-500 mb-6 print:hidden">
        Para guardarlo como archivo, elige «Guardar como PDF» en el diálogo de impresión.
        Si no se abrió, <button className="text-red-600 underline" onClick={() => { ajustarAHoja(); window.print(); }}>ábrelo desde aquí</button>.
      </p>

      {/* Portada */}
      <PergaminoView pergamino={pergamino} />

      {/* Mensajes */}
      <section className="libro-mensajes mx-auto max-w-xl px-6 sm:px-0 mt-12 font-serif" style={{ color: texto }}>
        <header className="text-center mb-8">
          <p className="text-sm tracking-[0.3em]" style={{ color: primario }}>LIBRO DE CONDOLENCIAS</p>
          {nombre && <h2 className="mt-2 text-2xl font-semibold">{nombre}</h2>}
          <p className="mt-1 text-sm opacity-70">
            {mensajes.length} mensaje{mensajes.length === 1 ? '' : 's'}
          </p>
          <div className="mx-auto mt-4 h-px w-24" style={{ background: primario, opacity: 0.5 }} />
        </header>

        {mensajes.length === 0 ? (
          <p className="text-center italic opacity-70">Todavía no hay mensajes en el libro.</p>
        ) : (
          <ol className="space-y-6">
            {mensajes.map((m) => (
              <li key={m._id || m.id} className="libro-mensaje pb-6 border-b" style={{ borderColor: `${primario}40` }}>
                <p className="text-base leading-relaxed whitespace-pre-line break-words">{m.mensaje}</p>
                <p className="mt-2 text-sm">
                  <span className="font-semibold">{m.nombre}</span>
                  {m.relacion && <span className="opacity-80">, {m.relacion}</span>}
                </p>
                <p className="text-xs opacity-60">{fecha(m.createdAt || m.fecha)}</p>
              </li>
            ))}
          </ol>
        )}

        {pergamino.pie?.texto && (
          <p className="mt-10 text-center text-xs tracking-[0.25em]" style={{ color: primario }}>{pergamino.pie.texto}</p>
        )}
      </section>
    </div>
  );
};

export default DescargarLibro;
