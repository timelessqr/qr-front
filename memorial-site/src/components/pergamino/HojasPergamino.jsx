// ====================================
// src/components/pergamino/HojasPergamino.jsx - El pergamino y su libro en hojas A4
// ====================================
// Cada hoja es una A4 completa color pergamino, con el sello de agua y el logo
// de la funeraria al pie. La portada es el pergamino; después van los mensajes
// del libro, repartidos entre las hojas sin partir ninguno.
//
// Se imprime con @page margin 0 (index.css): sin márgenes, Chrome no tiene
// dónde poner la fecha, el título y la URL de la página.
import React, { useLayoutEffect, useRef, useState } from 'react';
import PergaminoView, { variablesPergamino, logoPergamino } from './PergaminoView';
import { urlArchivo } from '../../services/pergaminoService';

const MM = 96 / 25.4; // px por milímetro a 96 dpi

// Caja de contenido dentro de la hoja (mm). Abajo queda lugar para el pie.
const CAJA = { arriba: 20, lados: 22, abajo: 36 };
const ALTO_CAJA_PX = (297 - CAJA.arriba - CAJA.abajo) * MM;
const SEPARACION_PX = 24; // entre mensajes (space-y-6)

const fechaMensaje = (iso) => new Date(iso).toLocaleDateString('es-CL', {
  day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
});

// Espera tipografía e imágenes del contenedor antes de medir
const esperarCarga = (raiz) => Promise.all([
  document.fonts?.ready,
  ...[...(raiz?.querySelectorAll('img') || [])]
    .filter((img) => !img.complete)
    .map((img) => new Promise((ok) => { img.onload = ok; img.onerror = ok; })),
]);

export const HojaA4 = ({ pergamino, funeraria, children, centrado = false }) => {
  const logo = logoPergamino(pergamino, funeraria);
  const textoPie = pergamino.pie?.texto || funeraria?.nombre;

  return (
    <section
      className="hoja-a4 relative overflow-hidden font-serif mx-auto"
      style={{
        ...variablesPergamino(pergamino.estilos),
        width: '210mm',
        height: '297mm',
        color: 'var(--perg-texto)',
        background: 'radial-gradient(ellipse at center, #FBF9F3 0%, var(--perg-fondo) 70%, #E9E2CF 100%)',
      }}
    >
      {logo && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center" aria-hidden>
          <img src={urlArchivo(logo)} alt="" className="pergamino-sello w-3/5 max-h-[40%] object-contain opacity-[0.1] grayscale mix-blend-multiply" />
        </div>
      )}
      <div className="pointer-events-none absolute border" style={{ inset: '9mm', borderColor: 'var(--perg-linea)' }} />

      <div
        className={`absolute flex flex-col ${centrado ? 'justify-center' : ''}`}
        style={{ top: `${CAJA.arriba}mm`, left: `${CAJA.lados}mm`, right: `${CAJA.lados}mm`, bottom: `${CAJA.abajo}mm` }}
      >
        {children}
      </div>

      {(logo || textoPie) && (
        <footer className="absolute text-center" style={{ left: `${CAJA.lados}mm`, right: `${CAJA.lados}mm`, bottom: '14mm' }}>
          {logo && <img src={urlArchivo(logo)} alt="" className="mx-auto h-10 max-w-[45%] object-contain mb-1" />}
          {textoPie && <p className="text-[10px] tracking-[0.25em]" style={{ color: 'var(--perg-primario)' }}>{textoPie}</p>}
        </footer>
      )}
    </section>
  );
};

// La portada: el pergamino, achicado si no entra en la hoja (por ejemplo con foto)
const Portada = ({ pergamino, funeraria, onLista }) => {
  const ref = useRef(null);
  const [zoom, setZoom] = useState(1);

  useLayoutEffect(() => {
    let vivo = true;
    esperarCarga(ref.current).then(() => {
      if (!vivo || !ref.current) return;
      ref.current.style.zoom = '1'; // medir al tamaño natural
      const alto = ref.current.scrollHeight;
      setZoom(alto > ALTO_CAJA_PX ? ALTO_CAJA_PX / alto : 1);
      onLista?.();
    });
    return () => { vivo = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pergamino]);

  return (
    <HojaA4 pergamino={pergamino} funeraria={funeraria} centrado>
      <div ref={ref} style={{ zoom }}>
        <PergaminoView pergamino={pergamino} funeraria={funeraria} plano />
      </div>
    </HojaA4>
  );
};

const EncabezadoLibro = ({ nombre, total }) => (
  <header className="text-center mb-8">
    <p className="text-sm tracking-[0.3em]" style={{ color: 'var(--perg-primario)' }}>LIBRO DE CONDOLENCIAS</p>
    {nombre && <h2 className="mt-2 text-2xl font-semibold">{nombre}</h2>}
    <p className="mt-1 text-sm opacity-70">{total} mensaje{total === 1 ? '' : 's'}</p>
    <div className="mx-auto mt-4 h-px w-24" style={{ background: 'var(--perg-primario)', opacity: 0.5 }} />
  </header>
);

const Mensaje = ({ m }) => (
  <article className="pb-5 border-b" style={{ borderColor: 'var(--perg-linea)' }}>
    <p className="text-base leading-relaxed whitespace-pre-line break-words">{m.mensaje}</p>
    <p className="mt-2 text-sm">
      <span className="font-semibold">{m.nombre}</span>
      {m.relacion && <span className="opacity-80">, {m.relacion}</span>}
    </p>
    <p className="text-xs opacity-60">{fechaMensaje(m.createdAt || m.fecha)}</p>
  </article>
);

// Reparte los mensajes en hojas midiendo cada uno con el ancho real de la caja
const usePaginas = (mensajes, medidor) => {
  const [paginas, setPaginas] = useState(null);

  useLayoutEffect(() => {
    let vivo = true;
    esperarCarga(medidor.current).then(() => {
      if (!vivo || !medidor.current) return;
      const [encabezado, ...items] = medidor.current.children;
      const alturas = items.map((el) => el.getBoundingClientRect().height);
      const resultado = [];
      let actual = [];
      let usado = encabezado.getBoundingClientRect().height + 32; // mb-8 del encabezado

      alturas.forEach((alto, i) => {
        const necesita = alto + (actual.length ? SEPARACION_PX : 0);
        if (actual.length && usado + necesita > ALTO_CAJA_PX) {
          resultado.push(actual);
          actual = [];
          usado = 0;
        }
        actual.push(i);
        usado += alto + (actual.length > 1 ? SEPARACION_PX : 0);
      });
      if (actual.length || !resultado.length) resultado.push(actual);
      setPaginas(resultado);
    });
    return () => { vivo = false; };
  }, [mensajes, medidor]);

  return paginas;
};

// Documento completo. conLibro=false: solo la portada (el "flyer").
const HojasPergamino = ({ pergamino, funeraria, mensajes = [], conLibro = false, onListo }) => {
  const medidor = useRef(null);
  const paginas = usePaginas(conLibro ? mensajes : [], medidor);
  const [portadaLista, setPortadaLista] = useState(false);
  const avisado = useRef(false);

  const nombre = pergamino.difunto?.nombreCompleto || pergamino.nombreCompletoDifunto ||
    [pergamino.difunto?.nombre, pergamino.difunto?.apellido].filter(Boolean).join(' ');

  useLayoutEffect(() => {
    if (avisado.current || !portadaLista || (conLibro && !paginas)) return;
    avisado.current = true;
    onListo?.();
  }, [portadaLista, paginas, conLibro, onListo]);

  return (
    <>
    <div className="hojas-pergamino overflow-x-auto">
      <Portada pergamino={pergamino} funeraria={funeraria} onLista={() => setPortadaLista(true)} />

      {conLibro && paginas?.map((indices, n) => (
        <HojaA4 key={n} pergamino={pergamino} funeraria={funeraria}>
          {n === 0 && <EncabezadoLibro nombre={nombre} total={mensajes.length} />}
          {indices.length === 0 && n === 0 ? (
            <p className="text-center italic opacity-70">Todavía no hay mensajes en el libro.</p>
          ) : (
            <div className="space-y-6">
              {indices.map((i) => <Mensaje key={mensajes[i]._id || mensajes[i].id || i} m={mensajes[i]} />)}
            </div>
          )}
        </HojaA4>
      ))}
    </div>

      {/* Medidor invisible, fuera de las hojas: mismo ancho y tipografía que la caja */}
      {conLibro && (
        <div aria-hidden className="font-serif"
          style={{ ...variablesPergamino(pergamino.estilos), position: 'absolute', left: '-10000px', top: 0, visibility: 'hidden', width: `${210 - 2 * CAJA.lados}mm` }}>
          <div ref={medidor}>
            <EncabezadoLibro nombre={nombre} total={mensajes.length} />
            {mensajes.map((m, i) => <div key={m._id || m.id || i}><Mensaje m={m} /></div>)}
          </div>
        </div>
      )}
    </>
  );
};

export default HojasPergamino;
