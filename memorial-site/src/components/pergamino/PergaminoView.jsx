// ====================================
// src/components/pergamino/PergaminoView.jsx - El pergamino tal como se ve e imprime
// ====================================
// Lo usan la página pública del QR, la vista previa del editor y la impresión.
// Recibe el pergamino del backend (vista admin o pública: comparten los campos).
//
// Estilo de la referencia del cliente: crema cálido, dorado suave, lirios en el
// borde izquierdo y el logo de la funeraria arriba y abajo. Todas las
// funerarias usan los mismos colores.
import React, { createContext, useContext } from 'react';
import {
  FaRegCalendarAlt, FaChurch, FaLeaf, FaSpa, FaCross, FaRegClock, FaBookOpen, FaRegHeart,
} from 'react-icons/fa';
import { GiLaurels, GiEgyptianUrns } from 'react-icons/gi';
import { urlArchivo, urlParaPdf } from '../../services/pergaminoService';

// Dentro de las hojas del PDF las imágenes se piden con CORS (ver urlParaPdf)
const ModoPdf = createContext(false);
export const ProveedorModoPdf = ({ children }) => <ModoPdf.Provider value>{children}</ModoPdf.Provider>;
export const useUrlImagen = () => (useContext(ModoPdf) ? urlParaPdf : urlArchivo);

// Imagen ajustada dentro de una caja, dibujada como fondo: html2canvas (PDF)
// no entiende object-fit, y con un <img> la foto o el logo salían estirados
export const ImagenAjustada = ({ src, ajuste = 'contain', className = '', style, etiqueta }) => (
  <div
    role={etiqueta ? 'img' : undefined}
    aria-label={etiqueta}
    aria-hidden={etiqueta ? undefined : true}
    className={className}
    style={{ backgroundImage: `url("${src}")`, backgroundSize: ajuste, backgroundPosition: 'center', backgroundRepeat: 'no-repeat', ...style }}
  />
);

const ICONOS = {
  calendario: FaRegCalendarAlt,
  iglesia: FaChurch,
  hoja: FaLeaf,
  flor: FaSpa,
  urna: GiEgyptianUrns,
  cruz: FaCross,
  reloj: FaRegClock,
};

export const FLORES_URL = '/pergamino/flores.webp';

// Paleta única para todas las funerarias (la de la referencia del cliente)
const PALETA = {
  primario: '#A8875A',
  texto: '#2A2420',
  fondo: '#F6F1EA',
  linea: 'rgba(168, 135, 90, 0.35)',
};

// Colores como variables CSS (también los usan las hojas A4).
// Los estilos guardados por pergamino se ignoran: todos llevan la misma paleta.
export const variablesPergamino = () => ({
  '--perg-primario': PALETA.primario,
  '--perg-texto': PALETA.texto,
  '--perg-fondo': PALETA.fondo,
  '--perg-linea': PALETA.linea,
});

export const logoPergamino = (pergamino, funeraria) => (pergamino?.pie?.mostrarLogo === false
  ? null
  : pergamino?.pie?.logoUrl || funeraria?.branding?.logoUrl || null);

// Lirios en el borde izquierdo, desvanecidos hacia el centro para no tapar el texto
export const Flores = ({ ancho = '58%', opacidad = 0.9 }) => (
  <img
    src={FLORES_URL}
    alt=""
    aria-hidden
    className="pergamino-flores pointer-events-none absolute left-0 top-0 select-none"
    style={{
      width: ancho,
      maxWidth: 460,
      opacity: opacidad,
    }}
  />
);

// Separador "— ♡ —" de la referencia
const Separador = ({ className = '' }) => (
  <div className={`mx-auto flex w-56 items-center gap-3 ${className}`} aria-hidden>
    <span className="h-px flex-1" style={{ background: 'var(--perg-linea)' }} />
    <FaRegHeart size={12} className="block shrink-0" style={{ color: 'var(--perg-primario)' }} />
    <span className="h-px flex-1" style={{ background: 'var(--perg-linea)' }} />
  </div>
);

const Marco = ({ marco, children }) => {
  const forma = marco === 'rectangulo'
    ? 'rounded-md aspect-[4/5]'
    : marco === 'ovalo'
      ? 'rounded-[50%] aspect-[4/5]'
      : 'rounded-full aspect-square';
  return (
    <div
      className={`mx-auto w-44 sm:w-52 overflow-hidden ${forma}`}
      style={{ boxShadow: '0 0 0 4px #FFFDF9, 0 0 0 5px var(--perg-primario), 0 8px 20px -10px rgba(60,45,25,.35)' }}
    >
      {children}
    </div>
  );
};

const Servicio = ({ servicio }) => {
  const Icono = ICONOS[servicio.icono] || FaRegCalendarAlt;
  const tieneFecha = servicio.fechaTexto || servicio.horaTexto;
  const tieneLugar = servicio.lugar || servicio.direccion;

  // Centrado como una esquela: ícono y título al medio; fecha y lugar a cada
  // lado de una línea que cae justo en el centro
  return (
    <div className="pergamino-servicio py-5 first:pt-0 last:pb-0 text-center">
      <Icono size={24} className="mx-auto block mb-1.5" style={{ color: 'var(--perg-primario)' }} aria-hidden />
      <h4 className="text-sm font-semibold tracking-[0.18em] mb-2">{servicio.titulo}</h4>
      <div className="grid grid-cols-2 text-sm leading-snug">
        <div className="pr-4 text-right border-r" style={{ borderColor: 'var(--perg-linea)' }}>
          {tieneFecha ? (
            <>
              {servicio.fechaTexto && <p>{servicio.fechaTexto}</p>}
              {servicio.horaTexto && <p className="opacity-80">{servicio.horaTexto}</p>}
            </>
          ) : <p className="opacity-40">Fecha por confirmar</p>}
        </div>
        <div className="pl-4 text-left">
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

// Tarjeta que lleva al libro de condolencias (solo en la página del QR)
const TarjetaLibro = ({ href }) => (
  <a
    href={href}
    className="mx-auto flex w-full max-w-md items-center gap-4 rounded-lg px-5 py-4 text-left transition hover:shadow-md"
    style={{ background: 'rgba(255, 253, 249, 0.75)', boxShadow: '0 1px 3px rgba(60,45,25,.10)' }}
  >
    <FaBookOpen size={32} className="block shrink-0" style={{ color: 'var(--perg-primario)' }} aria-hidden />
    <span className="pl-4 border-l" style={{ borderColor: 'var(--perg-linea)' }}>
      <span className="block text-sm font-semibold tracking-[0.14em]">LIBRO DE CONDOLENCIAS</span>
      <span className="block text-sm opacity-80">Deja aquí un mensaje, recuerdo o palabra de cariño para su familia.</span>
    </span>
  </a>
);

// plano: solo el contenido, sin el papel, las flores, el filete, el sello ni el pie.
// Lo usa la hoja A4 de impresión, que pone esas partes por su cuenta.
// enlaceLibro: si viene, muestra la tarjeta que lleva al libro de condolencias.
const PergaminoView = ({ pergamino, funeraria, className = '', plano = false, enlaceLibro }) => {
  const url = useUrlImagen();
  if (!pergamino) return null;

  const difunto = pergamino.difunto || {};
  const nombre = difunto.nombreCompleto ||
    pergamino.nombreCompletoDifunto ||
    [difunto.nombre, difunto.apellido].filter(Boolean).join(' ');
  const servicios = (pergamino.servicios || [])
    .filter((s) => s.visible !== false)
    .sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0));
  const textoPie = pergamino.pie?.texto || funeraria?.nombre;
  const logo = logoPergamino(pergamino, funeraria);

  // Visibilidad por sección (el orden es el de la referencia)
  const visible = (key) => {
    const s = (pergamino.secciones || []).find((x) => x.key === key);
    return !s || s.visible !== false;
  };

  const contenido = (
    <div className="space-y-6 text-center">
      {visible('encabezado') && (
        <header>
          {logo ? (
            <ImagenAjustada src={url(logo)} etiqueta={funeraria?.nombre || 'Logo de la funeraria'}
              className="mx-auto h-20 sm:h-24 w-[70%] mb-4" />
          ) : (
            <GiLaurels size={40} className="mx-auto block mb-2" style={{ color: 'var(--perg-primario)' }} aria-hidden />
          )}
          <p className="text-xs sm:text-sm tracking-[0.32em]">
            {pergamino.encabezado?.titulo || 'EN MEMORIA DE'}
          </p>
          <Separador className="my-3" />
          <h1 className="text-3xl sm:text-4xl font-medium leading-tight">
            {nombre || 'Nombre del difunto'}
          </h1>
          {pergamino.encabezado?.subtitulo && (
            <p className="mt-1 text-sm opacity-80">{pergamino.encabezado.subtitulo}</p>
          )}
        </header>
      )}

      {visible('fechas') && difunto.fechasTexto && (
        <p className="text-sm sm:text-base tracking-[0.18em]">{difunto.fechasTexto}</p>
      )}

      {visible('retrato') && difunto.fotoUrl && (
        <Marco marco={difunto.fotoMarco}>
          <ImagenAjustada src={url(difunto.fotoUrl)} ajuste="cover" className="w-full h-full" etiqueta={nombre} />
        </Marco>
      )}

      {visible('frase') && pergamino.frase && (
        <p className="italic text-base sm:text-lg leading-relaxed max-w-md mx-auto">“{pergamino.frase}”</p>
      )}

      {(enlaceLibro || (visible('servicios') && servicios.length > 0)) && <Separador />}

      {enlaceLibro && <TarjetaLibro href={enlaceLibro} />}

      {visible('servicios') && servicios.length > 0 && (
        <section className="mx-auto w-full max-w-md">
          <p className="text-center text-xs tracking-[0.28em] mb-4" style={{ color: 'var(--perg-primario)' }}>
            {pergamino.serviciosTitulo || 'INFORMACIÓN DEL SERVICIO'}
          </p>
          <div className="divide-y" style={{ borderColor: 'var(--perg-linea)' }}>
            {servicios.map((s, i) => <Servicio key={s._id || s.id || i} servicio={s} />)}
          </div>
        </section>
      )}

      {!plano && visible('pie_funeraria') && (logo || textoPie) && (
        <footer className="pt-2">
          <Separador className="mb-5" />
          {logo && <ImagenAjustada src={url(logo)} className="mx-auto h-28 sm:h-32 w-[80%] mb-3" />}
          {textoPie && <p className="text-xs tracking-[0.25em]" style={{ color: 'var(--perg-primario)' }}>{textoPie}</p>}
        </footer>
      )}
    </div>
  );

  if (plano) {
    return (
      <article className={`pergamino font-serif ${className}`} style={{ ...variablesPergamino(), color: 'var(--perg-texto)' }}>
        {contenido}
      </article>
    );
  }

  return (
    <article
      className={`pergamino font-serif ${className}`}
      style={{ ...variablesPergamino(), color: 'var(--perg-texto)' }}
    >
      <div
        className="pergamino-hoja relative mx-auto max-w-xl overflow-hidden px-6 py-10 sm:px-12 sm:py-14 rounded-sm"
        style={{ background: 'var(--perg-fondo)', boxShadow: '0 1px 2px rgba(60,50,30,.10), 0 12px 32px -12px rgba(60,50,30,.30)' }}
      >
        <Flores />
        {/* Sello de agua: el logo de la funeraria, tenue, detrás del contenido */}
        {logo && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center" aria-hidden>
            <ImagenAjustada src={url(logo)} className="pergamino-sello w-3/5 h-[40%] opacity-[0.05] grayscale mix-blend-multiply" />
          </div>
        )}
        {/* Filete interior fino, como el borde impreso de una esquela */}
        <div className="pointer-events-none absolute inset-3 sm:inset-4 border" style={{ borderColor: 'var(--perg-linea)' }} />
        <div className="relative">{contenido}</div>
      </div>
    </article>
  );
};

export default PergaminoView;
