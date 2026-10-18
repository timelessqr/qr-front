// ====================================
// src/components/admin/pergaminos/AccionesFuneraria.jsx - Editar y eliminar una funeraria
// ====================================
// Solo para el admin de Lazos. Eliminar borra todo: salas, QR, pergaminos,
// libro y usuarios de la funeraria; por eso pide escribir el nombre.
import React, { useEffect, useState } from 'react';
import { pergaminoAdmin, mensajeError } from '../../../services/pergaminoService';
import { btn, input, Campo, Aviso } from './ui';

const CAMPOS = ['nombre', 'telefono', 'email', 'direccion', 'ciudad', 'pais'];

const Modal = ({ titulo, children, onCerrar, ocupado }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
    <div className="absolute inset-0 bg-gray-900/50" onClick={ocupado ? undefined : onCerrar} />
    <div className="relative w-full max-w-lg rounded-lg bg-white shadow-xl p-6">
      <h3 className="text-lg font-semibold text-gray-900">{titulo}</h3>
      <div className="mt-4">{children}</div>
    </div>
  </div>
);

export const EditarFuneraria = ({ funeraria, onCerrar, onGuardada }) => {
  const [form, setForm] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState(null);
  const cambiar = (c) => (e) => setForm({ ...form, [c]: e.target.value });

  // La fila del listado no trae todos los campos: se carga la funeraria completa
  // para no borrar sin querer la dirección o el país al guardar
  useEffect(() => {
    pergaminoAdmin.obtenerFuneraria(funeraria.id)
      .then((r) => {
        const completa = r?.funeraria || r;
        setForm(Object.fromEntries(CAMPOS.map((c) => [c, completa[c] || ''])));
      })
      .catch((err) => setError(mensajeError(err)));
  }, [funeraria.id]);

  const guardar = async (e) => {
    e.preventDefault();
    setGuardando(true);
    setError(null);
    try {
      // Los opcionales vacíos se mandan vacíos para poder borrarlos
      const r = await pergaminoAdmin.actualizarFuneraria(funeraria.id, form);
      onGuardada(r?.funeraria || r);
    } catch (err) {
      setError(mensajeError(err));
      setGuardando(false);
    }
  };

  return (
    <Modal titulo="Editar funeraria" onCerrar={onCerrar} ocupado={guardando}>
      {!form ? (
        error ? <Aviso>{error}</Aviso> : <p className="text-sm text-gray-500">Cargando datos...</p>
      ) : (
      <form onSubmit={guardar} className="space-y-4">
        {error && <Aviso>{error}</Aviso>}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Campo label="Nombre *"><input className={input} value={form.nombre} onChange={cambiar('nombre')} required minLength={2} /></Campo>
          <Campo label="Teléfono *"><input className={input} value={form.telefono} onChange={cambiar('telefono')} required /></Campo>
          <Campo label="Email"><input className={input} type="email" value={form.email} onChange={cambiar('email')} /></Campo>
          <Campo label="Dirección"><input className={input} value={form.direccion} onChange={cambiar('direccion')} /></Campo>
          <Campo label="Ciudad"><input className={input} value={form.ciudad} onChange={cambiar('ciudad')} /></Campo>
          <Campo label="País"><input className={input} value={form.pais} onChange={cambiar('pais')} /></Campo>
        </div>
        <p className="text-xs text-gray-500">
          El nombre que sale al pie de los pergaminos se cambia en cada pergamino («Pie»).
        </p>
        <div className="flex justify-end gap-3">
          <button type="button" className={btn.secundario} onClick={onCerrar} disabled={guardando}>Cancelar</button>
          <button type="submit" className={btn.primario} disabled={guardando}>{guardando ? 'Guardando...' : 'Guardar cambios'}</button>
        </div>
      </form>
      )}
    </Modal>
  );
};

export const EliminarFuneraria = ({ funeraria, onCerrar, onEliminada }) => {
  const [confirmacion, setConfirmacion] = useState('');
  const [eliminando, setEliminando] = useState(false);
  const [error, setError] = useState(null);
  const coincide = confirmacion.trim().toLowerCase() === funeraria.nombre.trim().toLowerCase();

  const eliminar = async () => {
    setEliminando(true);
    setError(null);
    try {
      await pergaminoAdmin.eliminarFuneraria(funeraria.id);
      onEliminada();
    } catch (err) {
      setError(mensajeError(err));
      setEliminando(false);
    }
  };

  return (
    <Modal titulo="¿Eliminar esta funeraria?" onCerrar={onCerrar} ocupado={eliminando}>
      <div className="space-y-4 text-sm text-gray-600">
        {error && <Aviso>{error}</Aviso>}
        <p>
          Se borra <span className="font-medium text-gray-900">{funeraria.nombre}</span> por completo: sus 4 salas,
          los pergaminos, los mensajes del libro y sus usuarios.
        </p>
        <p className="font-medium text-red-700">Los QR que ya están impresos dejan de funcionar. No se puede deshacer.</p>
        <Campo label={`Para confirmar, escribe el nombre: ${funeraria.nombre}`}>
          <input className={input} value={confirmacion} onChange={(e) => setConfirmacion(e.target.value)} autoFocus />
        </Campo>
        <div className="flex justify-end gap-3">
          <button type="button" className={btn.secundario} onClick={onCerrar} disabled={eliminando}>Cancelar</button>
          <button type="button" className="inline-flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
            onClick={eliminar} disabled={!coincide || eliminando}>
            {eliminando ? 'Eliminando...' : 'Eliminar funeraria'}
          </button>
        </div>
      </div>
    </Modal>
  );
};
