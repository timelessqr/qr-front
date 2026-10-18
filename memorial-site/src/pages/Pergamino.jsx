// ====================================
// src/pages/Pergamino.jsx - Lo que se abre al escanear el QR de la sala
// ====================================
// Pergamino del servicio en curso y, debajo, el libro de condolencias.
import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { pergaminoPublico, mensajeError } from '../services/pergaminoService';
import PergaminoView from '../components/pergamino/PergaminoView';
import HojasPergamino from '../components/pergamino/HojasPergamino';
import { descargarPdf } from '../components/pergamino/pdf';

// Enlace discreto para guardar el pergamino (sin los mensajes del libro) en
// PDF A4. Arma la hoja fuera de la vista solo al tocarlo.
const DescargarPergamino = ({ pergamino }) => {
  const [fase, setFase] = useState('quieto'); // quieto | armando | error
  const nombre = pergamino.difunto?.nombreCompleto || 'Pergamino';

  const listo = useCallback(async () => {
    try {
      await descargarPdf(`Pergamino - ${nombre}`);
      setFase('quieto');
    } catch (err) {
      console.error('Error generando el PDF:', err);
      setFase('error');
    }
  }, [nombre]);

  return (
    <div className="mx-auto max-w-xl pt-4 text-center font-serif print:hidden">
      <button type="button" onClick={() => setFase('armando')} disabled={fase === 'armando'}
        className="text-sm text-[#8C7F6E] underline decoration-[#C9BBA6] underline-offset-4 hover:text-[#5E544A] disabled:no-underline">
        {fase === 'armando' ? 'Preparando el PDF…' : 'Descargar pergamino (PDF)'}
      </button>
      {fase === 'error' && <p className="mt-1 text-xs text-[#9C8F7E]">No se pudo generar. Intenta de nuevo.</p>}
      {fase === 'armando' && (
        <div aria-hidden style={{ position: 'fixed', left: '-10000px', top: 0 }}>
          <HojasPergamino pergamino={pergamino} funeraria={pergamino.funeraria} onListo={listo} />
        </div>
      )}
    </div>
  );
};

// Mensajes para quien escanea un QR que todavía no muestra nada
const avisoDe = (error) => {
  if (/no está publicado/i.test(error)) {
    return ['Este pergamino todavía no está disponible.', 'La funeraria lo está preparando. Vuelve a escanear el código en unos minutos.'];
  }
  if (/QR no válido|no encontrado/i.test(error)) {
    return ['Este código no corresponde a ningún pergamino.', 'Consulta con la funeraria.'];
  }
  return ['No pudimos mostrar este pergamino.', 'Revisa tu conexión y vuelve a intentarlo.'];
};

const campo = 'block w-full rounded-md border border-[#E3D8C8] bg-[#FBF8F3] px-4 py-3 text-lg text-[#2A2420] placeholder:text-[#9C8F7E] focus:border-[#A8875A] focus:outline-none focus:ring-1 focus:ring-[#A8875A]';

const fecha = (iso) => new Date(iso).toLocaleDateString('es-CL', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' });

const FormularioCondolencia = ({ code, config, onEnviada }) => {
  const [form, setForm] = useState({ nombre: '', relacion: '', mensaje: '', codigoAcceso: '' });
  const [enviando, setEnviando] = useState(false);
  const [estado, setEstado] = useState(null);

  const cambiar = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const enviar = async (e) => {
    e.preventDefault();
    setEnviando(true);
    setEstado(null);
    try {
      const datos = { nombre: form.nombre, mensaje: form.mensaje };
      if (form.relacion.trim()) datos.relacion = form.relacion;
      if (config.requiereCodigo) datos.codigoAcceso = form.codigoAcceso;
      const r = await pergaminoPublico.dejarCondolencia(code, datos);
      setForm({ nombre: '', relacion: '', mensaje: '', codigoAcceso: '' });
      setEstado({ ok: true, texto: r?.message || 'Gracias por tu mensaje.' });
      onEnviada();
    } catch (err) {
      setEstado({ ok: false, texto: mensajeError(err) });
    } finally {
      setEnviando(false);
    }
  };

  return (
    <form onSubmit={enviar} className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input className={campo} placeholder="Tu nombre" value={form.nombre} onChange={cambiar('nombre')} required minLength={2} maxLength={100} />
        <input className={campo} placeholder="Relación (opcional)" value={form.relacion} onChange={cambiar('relacion')} maxLength={80} />
      </div>
      <textarea className={campo} rows={4} placeholder="Escribe tu mensaje para la familia" value={form.mensaje} onChange={cambiar('mensaje')} required minLength={3} maxLength={1000} />
      {config.requiereCodigo && (
        <input className={campo} placeholder="Código de la sala" value={form.codigoAcceso} onChange={cambiar('codigoAcceso')} required />
      )}
      {estado && (
        <p className={`text-sm ${estado.ok ? 'text-emerald-800' : 'text-red-700'}`}>{estado.texto}</p>
      )}
      <button type="submit" disabled={enviando}
        className="w-full px-6 py-3 rounded-md bg-[#A8875A] text-white text-lg hover:bg-[#93754C] disabled:opacity-50">
        {enviando ? 'Enviando...' : 'Dejar mensaje'}
      </button>
    </form>
  );
};

const LibroCondolencias = ({ code }) => {
  const [config, setConfig] = useState(null);
  const [mensajes, setMensajes] = useState([]);

  const cargarMensajes = useCallback(() => {
    pergaminoPublico.condolencias(code, { limit: 50 })
      .then((r) => setMensajes(r.condolencias || []))
      .catch(() => setMensajes([]));
  }, [code]);

  useEffect(() => {
    pergaminoPublico.configLibro(code).then(setConfig).catch(() => setConfig(null));
    cargarMensajes();
  }, [code, cargarMensajes]);

  if (!config || config.habilitado === false) return null;

  return (
    <section id="libro" className="mx-auto max-w-xl mt-8 px-6 py-10 sm:px-12 rounded-sm font-serif text-[#2A2420] bg-[#F6F1EA] scroll-mt-4 print:hidden"
      style={{ boxShadow: '0 1px 2px rgba(60,50,30,.10), 0 12px 32px -12px rgba(60,50,30,.30)' }}>
      <h2 className="text-center text-sm tracking-[0.28em] text-[#A8875A]">LIBRO DE CONDOLENCIAS</h2>
      {config.mensajeBienvenida && (
        <p className="mt-2 text-center text-lg italic text-[#5E544A]">{config.mensajeBienvenida}</p>
      )}
      <div className="mt-6">
        <FormularioCondolencia code={code} config={config} onEnviada={cargarMensajes} />
      </div>
      {mensajes.length > 0 && (
        <ul className="mt-8 space-y-4">
          {mensajes.map((m) => (
            <li key={m.id} className="border-t border-[#E3D8C8] pt-4">
              <p className="whitespace-pre-line break-words text-lg leading-relaxed">{m.mensaje}</p>
              <p className="mt-2 text-base text-[#5E544A]">
                — {m.nombre}{m.relacion ? `, ${m.relacion}` : ''}
                <span className="text-[#9C8F7E]"> · {fecha(m.fecha)}</span>
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

const Pergamino = () => {
  const { code } = useParams();
  const [pergamino, setPergamino] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    pergaminoPublico.ver(code)
      .then(setPergamino)
      .catch((err) => setError(mensajeError(err)));
  }, [code]);

  useEffect(() => {
    const nombre = pergamino?.difunto?.nombreCompleto;
    if (nombre) document.title = `En memoria de ${nombre}`;
  }, [pergamino]);

  return (
    <main className="min-h-screen bg-[#ECE6DC] px-3 py-6 sm:py-12">
      {error ? (
        <div className="mx-auto max-w-md px-6 pt-16 text-center font-serif text-[#2A2420]">
          <p className="text-xl">{avisoDe(error)[0]}</p>
          <p className="mt-3 text-base text-[#5E544A]">{avisoDe(error)[1]}</p>
        </div>
      ) : !pergamino ? (
        <div className="text-center font-serif text-stone-500 pt-24">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stone-500 mx-auto" />
          <p className="mt-4">Cargando…</p>
        </div>
      ) : (
        <>
          {(() => {
            const conLibro = (pergamino.secciones || []).some((s) => s.key === 'condolencias' && s.visible !== false);
            return (
              <>
                <PergaminoView pergamino={pergamino} funeraria={pergamino.funeraria} enlaceLibro={conLibro ? '#libro' : undefined} />
                <DescargarPergamino pergamino={pergamino} />
                {conLibro && <LibroCondolencias code={code} />}
              </>
            );
          })()}
        </>
      )}
    </main>
  );
};

export default Pergamino;
