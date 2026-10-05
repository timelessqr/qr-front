// ====================================
// src/components/pergamino/PergaminoView.jsx - El pergamino tal como se ve e imprime
// ====================================
// Lo usan la página pública del QR, la vista previa del editor y la impresión.
// Recibe el pergamino del backend (vista admin o pública: comparten los campos).
import React from 'react';
import { FaRegCalendarAlt, FaChurch, FaLeaf, FaSpa, FaCross, FaRegClock } from 'react-icons/fa';
import { GiLaurels, GiEgyptianUrns } from 'react-icons/gi';
import { urlArchivo } from '../../services/pergaminoService';

const ICONOS = {
  calendario: FaRegCalendarAlt,
  iglesia: FaChurch,
  hoja: FaLeaf,
  flor: FaSpa,
  urna: GiEgyptianUrns,
  cruz: FaCross,
  reloj: FaRegClock,
};

// Secciones que dibuja este componente; galería y libro los resuelve cada página
const SECCIONES_PROPIAS = ['encabezado', 'retrato', 'fechas', 'frase', 'servicios', 'pie_funeraria'];

const ordenSecciones = (secciones) => {
  const lista = secciones?.length
    ? secciones
    : SECCIONES_PROPIAS.map((key, orden) => ({ key, orden, visible: true }));
  return [...lista]
    .filter((s) => s.visible !== false && SECCIONES_PROPIAS.includes(s.key))
    .sort((a, b) => a.orden - b.orden);
};

const Marco = ({ marco, children }) => {
  const forma = marco === 'circulo'
    ? 'rounded-full aspect-square'
    : marco === 'rectangulo'
      ? 'rounded-md aspect-[4/5]'
      : 'rounded-[50%] aspect-[4/5]';
  return (
    <div
      className={`mx-auto w-40 sm:w-48 overflow-hidden ${forma}`}
      style={{ boxShadow: '0 0 0 3px var(--perg-fondo), 0 0 0 5px var(--perg-primario)' }}
    >
      {children}
    </div>
  );
};

const Servicio = ({ servicio }) => {
  const Icono = ICONOS[servicio.icono] || FaRegCalendarAlt;
  const tieneFecha = servicio.fechaTexto || servicio.horaTexto;
  const tieneLugar = servicio.lugar || servicio.direccion;

  return (
    <div className="pergamino-servicio py-4 first:pt-0 last:pb-0">
      <div className="flex items-center justify-center gap-2 mb-2">
        <Icono className="w-4 h-4 shrink-0" style={{ color: 'var(--perg-primario)' }} aria-hidden />
        <h4 className="text-sm font-semibold tracking-[0.18em]" style={{ color: 'var(--perg-primario)' }}>
          {servicio.titulo}
        </h4>
      </div>
      <div className="grid grid-cols-2 gap-4 text-sm leading-snug">
        <div className="text-right pr-4 border-r" style={{ borderColor: 'var(--perg-linea)' }}>
          {tieneFecha ? (
            <>
              {servicio.fechaTexto && <p>{servicio.fechaTexto}</p>}
              {servicio.horaTexto && <p className="opacity-80">{servicio.horaTexto}</p>}
            </>
          ) : <p className="opacity-40">Fecha por confirmar</p>}
        </div>
        <div className="text-left">
          {tieneLugar ? (
            <>
              {servicio.lugar && <p className="font-medium">{servicio.lugar}</p>}
              {servicio.direccion && <p className="opacity-80">{servicio.direccion}</p>}
            </>
          ) : <p className="opacity-40">Lugar por confirmar</p>}
        </div>
      </div>
    </div>
  );
};

const PergaminoView = ({ pergamino, funeraria, className = '' }) => {
  if (!pergamino) return null;

  const estilos = pergamino.estilos || {};
  const difunto = pergamino.difunto || {};
  const nombre = difunto.nombreCompleto ||
    pergamino.nombreCompletoDifunto ||
    [difunto.nombre, difunto.apellido].filter(Boolean).join(' ');
  const servicios = (pergamino.servicios || [])
    .filter((s) => s.visible !== false)
    .sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0));
  const textoPie = pergamino.pie?.texto || funeraria?.nombre;
  const logo = pergamino.pie?.mostrarLogo === false
    ? null
    : pergamino.pie?.logoUrl || funeraria?.branding?.logoUrl;

  const variables = {
    '--perg-primario': estilos.colorPrimario || '#8C7B5A',
    '--perg-texto': estilos.colorTexto || '#4A443B',
    '--perg-fondo': estilos.colorFondo || '#F4F1E8',
    '--perg-linea': 'rgba(140, 123, 90, 0.35)',
  };

  const bloques = {
    encabezado: (
      <header key="encabezado" className="text-center">
        <GiLaurels className="mx-auto w-10 h-10 mb-2" style={{ color: 'var(--perg-primario)' }} aria-hidden />
        <p className="text-xs sm:text-sm tracking-[0.3em]" style={{ color: 'var(--perg-primario)' }}>
          {pergamino.encabezado?.titulo || 'EN MEMORIA DE'}
        </p>
        <h1 className="mt-2 text-3xl sm:text-4xl font-semibold leading-tight">
          {nombre || 'Nombre del difunto'}
        </h1>
        {pergamino.encabezado?.subtitulo && (
          <p className="mt-1 text-sm opacity-80">{pergamino.encabezado.subtitulo}</p>
        )}
      </header>
    ),
    retrato: difunto.fotoUrl ? (
      <Marco key="retrato" marco={difunto.fotoMarco}>
        <img src={urlArchivo(difunto.fotoUrl)} alt={nombre} className="w-full h-full object-cover" />
      </Marco>
    ) : null,
    fechas: difunto.fechasTexto ? (
      <p key="fechas" className="text-center text-sm sm:text-base tracking-[0.15em]">
        {difunto.fechasTexto}
      </p>
    ) : null,
    frase: pergamino.frase ? (
      <p key="frase" className="text-center italic text-base sm:text-lg leading-relaxed max-w-md mx-auto">
        “{pergamino.frase}”
      </p>
    ) : null,
    servicios: servicios.length ? (
      <section key="servicios">
        <div className="flex items-center gap-3 mb-4">
          <span className="h-px flex-1" style={{ background: 'var(--perg-linea)' }} />
          <h3 className="text-xs sm:text-sm tracking-[0.25em] font-semibold" style={{ color: 'var(--perg-primario)' }}>
            {pergamino.serviciosTitulo || 'INFORMACIÓN DEL SERVICIO'}
          </h3>
          <span className="h-px flex-1" style={{ background: 'var(--perg-linea)' }} />
        </div>
        <div className="divide-y" style={{ borderColor: 'var(--perg-linea)' }}>
          {servicios.map((s, i) => <Servicio key={s._id || s.id || i} servicio={s} />)}
        </div>
      </section>
    ) : null,
    pie_funeraria: textoPie || logo ? (
      <footer key="pie" className="pt-4 border-t text-center" style={{ borderColor: 'var(--perg-linea)' }}>
        {logo && (
          <img src={urlArchivo(logo)} alt="" className="mx-auto h-12 max-w-[60%] mb-2 object-contain" />
        )}
        {textoPie && <p className="text-xs tracking-[0.25em]" style={{ color: 'var(--perg-primario)' }}>{textoPie}</p>}
      </footer>
    ) : null,
  };

  return (
    <article
      className={`pergamino font-serif text-left ${className}`}
      style={{ ...variables, color: 'var(--perg-texto)' }}
    >
      <div
        className="pergamino-hoja relative mx-auto max-w-xl px-6 py-10 sm:px-12 sm:py-14 rounded-sm"
        style={{
          background: 'radial-gradient(ellipse at center, #FBF9F3 0%, var(--perg-fondo) 70%, #E9E2CF 100%)',
          boxShadow: '0 1px 2px rgba(60,50,30,.12), 0 12px 32px -12px rgba(60,50,30,.35)',
        }}
      >
        {/* Sello de agua: el logo de la funeraria, tenue, detrás del contenido */}
        {logo && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden" aria-hidden>
            <img src={urlArchivo(logo)} alt="" className="pergamino-sello w-3/5 max-h-[40%] object-contain opacity-[0.1] grayscale mix-blend-multiply" />
          </div>
        )}
        {/* Filete interior, como el borde impreso de una esquela */}
        <div className="pointer-events-none absolute inset-3 sm:inset-4 border" style={{ borderColor: 'var(--perg-linea)' }} />
        <div className="relative space-y-7">
          {ordenSecciones(pergamino.secciones).map((s) => bloques[s.key]).filter(Boolean)}
        </div>
      </div>
    </article>
  );
};

export default PergaminoView;
