// ====================================
// src/pages/Pergamino.jsx - Lo que se abre al escanear el QR de la sala
// ====================================
// Pergamino del servicio en curso y, debajo, el libro de condolencias.
import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { pergaminoPublico, mensajeError } from '../services/pergaminoService';
import PergaminoView from '../components/pergamino/PergaminoView';

const campo = 'block w-full rounded-md border border-stone-300 bg-white/80 px-3 py-2 text-base text-stone-800 focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-500';

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
        className="w-full sm:w-auto px-6 py-2.5 rounded-md bg-stone-700 text-white text-sm font-medium hover:bg-stone-800 disabled:opacity-50">
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
    <section className="mx-auto max-w-xl px-4 sm:px-0 mt-10 font-serif text-stone-800 print:hidden">
      <h2 className="text-center text-sm tracking-[0.25em] text-stone-600">LIBRO DE CONDOLENCIAS</h2>
      {config.mensajeBienvenida && (
        <p className="mt-2 text-center text-stone-600 italic">{config.mensajeBienvenida}</p>
      )}
      <div className="mt-6">
        <FormularioCondolencia code={code} config={config} onEnviada={cargarMensajes} />
      </div>
      {mensajes.length > 0 && (
        <ul className="mt-8 space-y-4">
          {mensajes.map((m) => (
            <li key={m.id} className="rounded-md bg-white/70 border border-stone-200 px-4 py-3">
              <p className="whitespace-pre-line break-words leading-relaxed">{m.mensaje}</p>
              <p className="mt-2 text-sm text-stone-600">
                — {m.nombre}{m.relacion ? `, ${m.relacion}` : ''}
                <span className="text-stone-400"> · {fecha(m.fecha)}</span>
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
    <main className="min-h-screen bg-stone-100 py-8 sm:py-12">
      {error ? (
        <div className="mx-auto max-w-md px-6 text-center font-serif text-stone-700">
          <p className="text-lg">No pudimos mostrar este pergamino.</p>
          <p className="mt-2 text-sm text-stone-500">{error}</p>
        </div>
      ) : !pergamino ? (
        <div className="text-center font-serif text-stone-500 pt-24">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stone-500 mx-auto" />
          <p className="mt-4">Cargando…</p>
        </div>
      ) : (
        <>
          <div className="px-3 sm:px-0">
            <PergaminoView pergamino={pergamino} funeraria={pergamino.funeraria} />
          </div>
          {(pergamino.secciones || []).some((s) => s.key === 'condolencias' && s.visible !== false) && (
            <LibroCondolencias code={code} />
          )}
        </>
      )}
    </main>
  );
};

export default Pergamino;
