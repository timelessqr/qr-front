// ====================================
// src/pages/admin/pergaminos/PergaminoEditor.jsx - Editar el pergamino de una sala
// ====================================
import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { pergaminoAdmin, mensajeError, urlArchivo } from '../../../services/pergaminoService';
import PergaminoView from '../../../components/pergamino/PergaminoView';
import {
  btn, input, Campo, Cargando, Aviso, Confirmar, EstadoPergamino, useCarga,
} from '../../../components/admin/pergaminos/ui';

const CAMPOS_SERVICIO = ['_id', 'tipo', 'titulo', 'icono', 'fechaTexto', 'horaTexto', 'lugar', 'direccion', 'orden', 'visible'];

const NOMBRES_TIPO = {
  velatorio: 'Velatorio', ceremonia_religiosa: 'Ceremonia religiosa', misa: 'Misa',
  cremacion: 'Cremación', sepultura: 'Sepultura', responso: 'Responso', otro: 'Otro',
};

// Del pergamino del backend al estado editable del formulario
const aFormulario = (p) => ({
  encabezado: { titulo: p.encabezado?.titulo || 'EN MEMORIA DE' },
  difunto: {
    nombre: p.difunto?.nombre || '',
    apellido: p.difunto?.apellido || '',
    fechasTexto: p.difunto?.fechasTexto || '',
    fotoUrl: p.difunto?.fotoUrl || '',
    fotoMarco: p.difunto?.fotoMarco || 'ovalo',
  },
  frase: p.frase || '',
  serviciosTitulo: p.serviciosTitulo || 'INFORMACIÓN DEL SERVICIO',
  servicios: [...(p.servicios || [])]
    .sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0))
    .map((s) => Object.fromEntries(CAMPOS_SERVICIO.map((k) => [k, s[k] ?? (k === 'visible' ? true : '')]))),
  pie: { texto: p.pie?.texto || '' },
});

// Del formulario a lo que acepta PUT /pergaminos/:id
const aPayload = (f) => ({
  encabezado: f.encabezado,
  difunto: f.difunto,
  frase: f.frase,
  serviciosTitulo: f.serviciosTitulo,
  servicios: f.servicios.map((s, i) => {
    const limpio = { ...s, orden: i };
    if (!limpio._id) delete limpio._id;
    return limpio;
  }),
  pie: f.pie,
});

const EditorServicio = ({ servicio, opciones, onCambio, onQuitar, onSubir, onBajar, primero, ultimo }) => {
  const cambiar = (campo) => (e) => onCambio({ ...servicio, [campo]: e.target.value });
  return (
    <div className="border border-gray-200 rounded-md p-4 space-y-3">
      <div className="flex items-center gap-2">
        <input className={`${input} font-medium`} value={servicio.titulo} onChange={cambiar('titulo')} placeholder="VELATORIO" />
        <button type="button" className="px-2 text-gray-400 hover:text-gray-700 disabled:opacity-30" onClick={onSubir} disabled={primero} aria-label="Subir">↑</button>
        <button type="button" className="px-2 text-gray-400 hover:text-gray-700 disabled:opacity-30" onClick={onBajar} disabled={ultimo} aria-label="Bajar">↓</button>
        <button type="button" className="px-2 text-gray-400 hover:text-red-600" onClick={onQuitar} aria-label="Quitar">✕</button>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Campo label="Tipo">
          <select className={input} value={servicio.tipo || 'otro'} onChange={cambiar('tipo')}>
            {(opciones?.tiposServicio || Object.keys(NOMBRES_TIPO)).map((t) => <option key={t} value={t}>{NOMBRES_TIPO[t] || t}</option>)}
          </select>
        </Campo>
        <Campo label="Icono">
          <select className={input} value={servicio.icono || 'calendario'} onChange={cambiar('icono')}>
            {(opciones?.iconos || ['calendario', 'iglesia', 'hoja', 'flor', 'urna', 'cruz', 'reloj']).map((i) => <option key={i} value={i}>{i}</option>)}
          </select>
        </Campo>
        <Campo label="Fecha"><input className={input} value={servicio.fechaTexto} onChange={cambiar('fechaTexto')} placeholder="Jueves 16 de mayo de 2024" /></Campo>
        <Campo label="Hora"><input className={input} value={servicio.horaTexto} onChange={cambiar('horaTexto')} placeholder="15:00 a 22:00 hrs." /></Campo>
        <Campo label="Lugar"><input className={input} value={servicio.lugar} onChange={cambiar('lugar')} placeholder="Salón principal" /></Campo>
        <Campo label="Dirección"><input className={input} value={servicio.direccion} onChange={cambiar('direccion')} /></Campo>
      </div>
    </div>
  );
};

const PergaminoEditor = () => {
  const { salaId } = useParams();
  const { datos, cargando, error, recargar } = useCarga(async () => {
    const [sala, pergamino, opciones] = await Promise.all([
      pergaminoAdmin.obtenerSala(salaId),
      pergaminoAdmin.obtenerPergamino(salaId),
      pergaminoAdmin.opciones().catch(() => null),
    ]);
    return { sala, pergamino, opciones };
  }, [salaId]);

  const [form, setForm] = useState(null);
  const [original, setOriginal] = useState(null);
  const [ocupado, setOcupado] = useState(null);
  const [aviso, setAviso] = useState(null);
  const [confirmarReinicio, setConfirmarReinicio] = useState(false);

  useEffect(() => {
    if (datos?.pergamino) {
      const f = aFormulario(datos.pergamino);
      setForm(f);
      setOriginal(JSON.stringify(f));
    }
  }, [datos]);

  const sinGuardar = form && original !== JSON.stringify(form);

  const vistaPrevia = useMemo(() => form && datos && ({
    ...datos.pergamino,
    ...form,
    difunto: { ...datos.pergamino.difunto, ...form.difunto, nombreCompleto: undefined },
    nombreCompletoDifunto: undefined,
    pie: { ...datos.pergamino.pie, ...form.pie },
  }), [form, datos]);

  if (cargando) return <Cargando texto="Cargando pergamino..." />;
  if (error) return <Aviso>{error} <button className={btn.link} onClick={recargar}>Reintentar</button></Aviso>;
  if (!form) return null;

  const { sala, pergamino, opciones } = datos;
  const set = (parche) => setForm((f) => ({ ...f, ...parche }));
  const setDifunto = (campo) => (e) => set({ difunto: { ...form.difunto, [campo]: e.target.value } });

  const correr = async (nombre, accion, mensajeOk) => {
    setOcupado(nombre);
    setAviso(null);
    try {
      await accion();
      setAviso({ tipo: 'ok', texto: mensajeOk });
      return true;
    } catch (err) {
      setAviso({ tipo: 'error', texto: mensajeError(err) });
      return false;
    } finally {
      setOcupado(null);
    }
  };

  const guardar = () => correr('guardar', async () => {
    const actualizado = await pergaminoAdmin.actualizarPergamino(pergamino.id, aPayload(form));
    const f = aFormulario(actualizado?.pergamino || actualizado || { ...pergamino, ...form });
    setForm(f);
    setOriginal(JSON.stringify(f));
  }, 'Cambios guardados');

  const publicar = () => correr('publicar', async () => {
    if (sinGuardar) await pergaminoAdmin.actualizarPergamino(pergamino.id, aPayload(form));
    await pergaminoAdmin.publicar(pergamino.id);
    await recargar();
  }, 'Pergamino publicado: ya se ve al escanear el QR');

  const reiniciar = async () => {
    const ok = await correr('reiniciar', async () => {
      await pergaminoAdmin.reiniciar(pergamino.id);
      await recargar();
    }, 'Sala lista para un nuevo servicio');
    if (ok) setConfirmarReinicio(false);
  };

  const imprimir = async () => {
    if (sinGuardar && !(await correr('guardar', () => pergaminoAdmin.actualizarPergamino(pergamino.id, aPayload(form)), 'Cambios guardados'))) return;
    setOriginal(JSON.stringify(form));
    window.open(`/admin/pergaminos/salas/${salaId}/imprimir`, '_blank');
  };

  const subirFoto = async (e) => {
    const archivo = e.target.files?.[0];
    e.target.value = '';
    if (!archivo) return;
    await correr('foto', async () => {
      const r = await pergaminoAdmin.subirFoto(salaId, archivo, 'retrato');
      set({ difunto: { ...form.difunto, fotoUrl: r.media?.url || r.url } });
    }, 'Foto subida. Guarda para que quede en el pergamino.');
  };

  const servicios = form.servicios;
  const setServicios = (lista) => set({ servicios: lista });
  const mover = (i, d) => {
    const lista = [...servicios];
    [lista[i], lista[i + d]] = [lista[i + d], lista[i]];
    setServicios(lista);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <Link to={`/admin/pergaminos/funerarias/${sala.funeraria}`} className="text-sm text-gray-500 hover:text-gray-700">← Salas</Link>
          <h2 className="mt-2 text-2xl font-bold text-gray-900 flex items-center gap-3">
            {sala.nombre} <EstadoPergamino estado={pergamino.estado} />
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            QR <code>{sala.qr?.code}</code>
            {pergamino.estado === 'publicado' && sala.qr?.url && (
              <> · <a href={sala.qr.url} target="_blank" rel="noreferrer" className={btn.link}>Ver como visitante</a></>
            )}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button className={btn.peligro} onClick={() => setConfirmarReinicio(true)} disabled={!!ocupado}>Nuevo servicio</button>
          <button className={btn.secundario} onClick={imprimir} disabled={!!ocupado}>Imprimir</button>
          <button className={btn.secundario} onClick={guardar} disabled={!!ocupado || !sinGuardar}>
            {ocupado === 'guardar' ? 'Guardando...' : 'Guardar'}
          </button>
          <button className={btn.primario} onClick={publicar} disabled={!!ocupado}>
            {ocupado === 'publicar' ? 'Publicando...' : pergamino.estado === 'publicado' ? 'Guardar y publicar' : 'Publicar'}
          </button>
        </div>
      </div>

      {aviso && <Aviso tipo={aviso.tipo} onCerrar={() => setAviso(null)}>{aviso.texto}</Aviso>}
      {sinGuardar && <p className="text-xs text-amber-700">Hay cambios sin guardar.</p>}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <div className="bg-white shadow sm:rounded-lg p-6 space-y-6">
          <section className="space-y-4">
            <h3 className="text-base font-semibold text-gray-900">Difunto</h3>
            <div className="grid grid-cols-2 gap-4">
              <Campo label="Nombres"><input className={input} value={form.difunto.nombre} onChange={setDifunto('nombre')} /></Campo>
              <Campo label="Apellidos"><input className={input} value={form.difunto.apellido} onChange={setDifunto('apellido')} /></Campo>
            </div>
            <Campo label="Fechas" ayuda="Tal como se imprime, por ejemplo: 10 ABRIL 1948 - 15 MAYO 2024">
              <input className={input} value={form.difunto.fechasTexto} onChange={setDifunto('fechasTexto')} />
            </Campo>
            <div className="flex items-end gap-4">
              {form.difunto.fotoUrl && (
                <img src={urlArchivo(form.difunto.fotoUrl)} alt="" className="w-16 h-20 object-cover rounded" />
              )}
              <div className="flex-1 grid grid-cols-2 gap-4">
                <Campo label="Foto">
                  <input type="file" accept="image/*" onChange={subirFoto} disabled={!!ocupado}
                    className="block w-full text-sm text-gray-600 file:mr-3 file:rounded-md file:border-0 file:bg-gray-100 file:px-3 file:py-2 file:text-sm hover:file:bg-gray-200" />
                </Campo>
                <Campo label="Marco">
                  <select className={input} value={form.difunto.fotoMarco} onChange={setDifunto('fotoMarco')}>
                    <option value="ovalo">Óvalo</option>
                    <option value="circulo">Círculo</option>
                    <option value="rectangulo">Rectángulo</option>
                  </select>
                </Campo>
              </div>
            </div>
            {form.difunto.fotoUrl && (
              <button type="button" className="text-xs text-gray-500 hover:text-red-600"
                onClick={() => set({ difunto: { ...form.difunto, fotoUrl: '' } })}>
                Quitar foto
              </button>
            )}
          </section>

          <section className="space-y-4">
            <h3 className="text-base font-semibold text-gray-900">Textos</h3>
            <Campo label="Encabezado">
              <input className={input} value={form.encabezado.titulo} onChange={(e) => set({ encabezado: { titulo: e.target.value } })} />
            </Campo>
            <Campo label="Frase" ayuda={`${form.frase.length}/300`}>
              <textarea className={input} rows={2} maxLength={300} value={form.frase} onChange={(e) => set({ frase: e.target.value })} />
            </Campo>
            <Campo label="Pie (nombre de la funeraria)">
              <input className={input} value={form.pie.texto} onChange={(e) => set({ pie: { texto: e.target.value } })} />
            </Campo>
          </section>

          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-gray-900">Información del servicio</h3>
              <button type="button" className={btn.link} disabled={servicios.length >= 10}
                onClick={() => setServicios([...servicios, { tipo: 'otro', titulo: '', icono: 'calendario', fechaTexto: '', horaTexto: '', lugar: '', direccion: '', visible: true }])}>
                + Agregar
              </button>
            </div>
            <Campo label="Título de la sección">
              <input className={input} value={form.serviciosTitulo} onChange={(e) => set({ serviciosTitulo: e.target.value })} />
            </Campo>
            {servicios.map((s, i) => (
              <EditorServicio
                key={s._id || `nuevo-${i}`}
                servicio={s}
                opciones={opciones}
                primero={i === 0}
                ultimo={i === servicios.length - 1}
                onCambio={(nuevo) => setServicios(servicios.map((x, j) => (j === i ? nuevo : x)))}
                onQuitar={() => setServicios(servicios.filter((_, j) => j !== i))}
                onSubir={() => mover(i, -1)}
                onBajar={() => mover(i, 1)}
              />
            ))}
          </section>
        </div>

        <div className="lg:sticky lg:top-0">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500">Vista previa</p>
          <PergaminoView pergamino={vistaPrevia} />
        </div>
      </div>

      <Confirmar
        abierto={confirmarReinicio}
        titulo="¿Preparar la sala para un nuevo servicio?"
        textoConfirmar="Sí, empezar de nuevo"
        ocupado={ocupado === 'reiniciar'}
        onConfirmar={reiniciar}
        onCancelar={() => setConfirmarReinicio(false)}
      >
        <p>Se vacía el pergamino y queda en borrador. El libro de condolencias empieza en blanco: los mensajes de este servicio dejan de mostrarse.</p>
        <p className="mt-2">El QR de la sala no cambia.</p>
      </Confirmar>
    </div>
  );
};

export default PergaminoEditor;
