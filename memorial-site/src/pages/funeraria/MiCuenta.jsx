// ====================================
// src/pages/funeraria/MiCuenta.jsx - La cuenta de funeraria cambia su contraseña
// ====================================
import React, { useState } from 'react';
import { pergaminoAdmin, mensajeError } from '../../services/pergaminoService';
import { funerariaSesion } from '../../services/funerariaSesion';
import { btn, input, Campo, Aviso } from '../../components/admin/pergaminos/ui';

const MiCuenta = () => {
  const sesion = funerariaSesion.datos();
  const [form, setForm] = useState({ actual: '', nueva: '', repetir: '' });
  const [guardando, setGuardando] = useState(false);
  const [aviso, setAviso] = useState(null);

  const cambiar = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const enviar = async (e) => {
    e.preventDefault();
    if (form.nueva !== form.repetir) {
      setAviso({ tipo: 'error', texto: 'Las contraseñas nuevas no coinciden' });
      return;
    }
    setGuardando(true);
    setAviso(null);
    try {
      // El cambio invalida el token anterior: se guarda el nuevo
      const r = await pergaminoAdmin.cambiarPassword(form.actual, form.nueva);
      funerariaSesion.guardar(r.token);
      setForm({ actual: '', nueva: '', repetir: '' });
      setAviso({ tipo: 'ok', texto: 'Contraseña actualizada' });
    } catch (err) {
      setAviso({ tipo: 'error', texto: mensajeError(err) });
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Mi cuenta</h2>
        <p className="mt-1 text-sm text-gray-500">{sesion?.cuenta?.nombre} · {sesion?.cuenta?.email}</p>
      </div>
      <form onSubmit={enviar} className="bg-white shadow sm:rounded-lg p-6 space-y-4">
        <h3 className="text-base font-semibold text-gray-900">Cambiar contraseña</h3>
        {aviso && <Aviso tipo={aviso.tipo} onCerrar={() => setAviso(null)}>{aviso.texto}</Aviso>}
        <Campo label="Contraseña actual">
          <input className={input} type="password" autoComplete="current-password" value={form.actual} onChange={cambiar('actual')} required />
        </Campo>
        <Campo label="Contraseña nueva" ayuda="Mínimo 8 caracteres">
          <input className={input} type="password" autoComplete="new-password" minLength={8} value={form.nueva} onChange={cambiar('nueva')} required />
        </Campo>
        <Campo label="Repetir contraseña nueva">
          <input className={input} type="password" autoComplete="new-password" minLength={8} value={form.repetir} onChange={cambiar('repetir')} required />
        </Campo>
        <div className="flex justify-end">
          <button type="submit" className={btn.primario} disabled={guardando}>{guardando ? 'Guardando...' : 'Cambiar contraseña'}</button>
        </div>
      </form>
    </div>
  );
};

export default MiCuenta;
