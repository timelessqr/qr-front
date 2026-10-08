// ====================================
// src/components/admin/pergaminos/CuentasFuneraria.jsx - Usuarios de una funeraria
// ====================================
// Solo lo ve el admin de Lazos. Cada cuenta entra por el mismo login del panel
// y cae en /funeraria, donde solo ve las salas de esta funeraria.
import React, { useState } from 'react';
import { pergaminoAdmin, mensajeError } from '../../../services/pergaminoService';
import { btn, input, Campo, Aviso, Confirmar, useCarga } from './ui';

const URL_LOGIN = `${window.location.origin}/admin/login`;

// Contraseña inicial legible para dictar o copiar: sin 0/O ni 1/l/I
const generarPassword = () => {
  const letras = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const valores = crypto.getRandomValues(new Uint32Array(12));
  return Array.from(valores, (v) => letras[v % letras.length]).join('');
};

const fecha = (iso) => (iso
  ? new Date(iso).toLocaleString('es-CL', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
  : 'Nunca');

// Datos para pasarle a la funeraria, una sola vez (la contraseña no se vuelve a mostrar)
const Credenciales = ({ email, password, onCerrar }) => {
  const texto = `Panel Lazos de Vida\n${URL_LOGIN}\nEmail: ${email}\nContraseña: ${password}`;
  const [copiado, setCopiado] = useState(null);
  const copiar = (que, valor) => navigator.clipboard?.writeText(valor).then(() => setCopiado(que));
  return (
    <div className="rounded-md border border-green-200 bg-green-50 p-4 text-sm text-green-900">
      <p className="font-medium">Pásale estos datos a la funeraria antes de cerrar este cuadro.</p>
      <p className="text-xs text-green-800">
        Por seguridad la contraseña no se guarda a la vista: después no se puede volver a ver.
        Si se pierde, se pone una nueva con «Restablecer contraseña».
      </p>
      <dl className="mt-3 grid grid-cols-[auto_1fr_auto] items-center gap-x-3 gap-y-2 rounded bg-white/70 px-3 py-2 text-gray-800">
        <dt className="text-xs text-gray-500">Entrar en</dt>
        <dd className="font-mono text-xs break-all">{URL_LOGIN}</dd><span />
        <dt className="text-xs text-gray-500">Email</dt>
        <dd className="font-mono text-sm break-all">{email}</dd>
        <button type="button" className="text-xs text-green-800 hover:underline" onClick={() => copiar('email', email)}>
          {copiado === 'email' ? 'Copiado' : 'Copiar'}
        </button>
        <dt className="text-xs text-gray-500">Contraseña</dt>
        <dd className="font-mono text-base tracking-wide">{password}</dd>
        <button type="button" className="text-xs text-green-800 hover:underline" onClick={() => copiar('password', password)}>
          {copiado === 'password' ? 'Copiada' : 'Copiar'}
        </button>
      </dl>
      <div className="mt-3 flex gap-3">
        <button type="button" className={btn.secundario} onClick={() => copiar('todo', texto)}>
          {copiado === 'todo' ? 'Copiado' : 'Copiar todo'}
        </button>
        <button type="button" className="text-sm text-green-800 hover:underline" onClick={onCerrar}>Listo, ya los pasé</button>
      </div>
    </div>
  );
};

const CuentasFuneraria = ({ funeraria }) => {
  const { datos, cargando, error, recargar } = useCarga(() => pergaminoAdmin.listarCuentas(funeraria.id), [funeraria.id]);
  const cuentas = datos || [];

  const [form, setForm] = useState(null); // { nombre, email, password } mientras se agrega
  const [guardando, setGuardando] = useState(false);
  const [aviso, setAviso] = useState(null);
  const [credenciales, setCredenciales] = useState(null);
  const [aDesactivar, setADesactivar] = useState(null);
  const [aEliminar, setAEliminar] = useState(null);
  const [aRestablecer, setARestablecer] = useState(null); // { cuenta, password }

  const correr = async (accion) => {
    setGuardando(true);
    setAviso(null);
    try {
      await accion();
      await recargar();
      return true;
    } catch (err) {
      setAviso(mensajeError(err));
      return false;
    } finally {
      setGuardando(false);
    }
  };

  const crear = async (e) => {
    e.preventDefault();
    const ok = await correr(() => pergaminoAdmin.crearCuenta(funeraria.id, form));
    if (ok) {
      setCredenciales({ email: form.email.trim().toLowerCase(), password: form.password });
      setForm(null);
    }
  };

  const cambiarEstado = async (cuenta, isActive) => {
    const ok = await correr(() => pergaminoAdmin.actualizarCuenta(cuenta.id, { isActive }));
    if (ok) setADesactivar(null);
  };

  const eliminar = async () => {
    const ok = await correr(() => pergaminoAdmin.eliminarCuenta(aEliminar.id));
    if (ok) setAEliminar(null);
  };

  const restablecer = async () => {
    const { cuenta, password } = aRestablecer;
    const ok = await correr(() => pergaminoAdmin.restablecerPassword(cuenta.id, password));
    if (ok) {
      setCredenciales({ email: cuenta.email, password });
      setARestablecer(null);
    }
  };

  return (
    <section className="bg-white shadow sm:rounded-lg p-6 space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Usuarios de la funeraria</h3>
          <p className="text-sm text-gray-500">
            Entran por el mismo login del panel y solo ven las salas de esta funeraria.
          </p>
        </div>
        {!form && (
          <button className={btn.secundario} onClick={() => { setCredenciales(null); setForm({ nombre: '', email: '', password: generarPassword() }); }}>
            + Agregar usuario
          </button>
        )}
      </div>

      {aviso && <Aviso onCerrar={() => setAviso(null)}>{aviso}</Aviso>}
      {credenciales && <Credenciales {...credenciales} onCerrar={() => setCredenciales(null)} />}

      {form && (
        <form onSubmit={crear} className="rounded-md border border-gray-200 p-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Campo label="Nombre"><input className={input} value={form.nombre} required minLength={2}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })} /></Campo>
            <Campo label="Email"><input className={input} type="email" value={form.email} required
              onChange={(e) => setForm({ ...form, email: e.target.value })} /></Campo>
            <Campo label="Contraseña inicial" ayuda="Mínimo 8 caracteres. La funeraria puede cambiarla.">
              <div className="flex gap-2">
                <input className={`${input} font-mono`} value={form.password} required minLength={8}
                  onChange={(e) => setForm({ ...form, password: e.target.value })} />
                <button type="button" className="text-xs text-gray-500 hover:text-gray-800 shrink-0"
                  onClick={() => setForm({ ...form, password: generarPassword() })}>Generar</button>
              </div>
            </Campo>
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" className={btn.secundario} onClick={() => setForm(null)} disabled={guardando}>Cancelar</button>
            <button type="submit" className={btn.primario} disabled={guardando}>{guardando ? 'Creando...' : 'Crear usuario'}</button>
          </div>
        </form>
      )}

      {error ? <Aviso>{error}</Aviso> : cargando ? (
        <p className="text-sm text-gray-500">Cargando usuarios...</p>
      ) : cuentas.length === 0 ? (
        <p className="text-sm text-gray-500">Todavía no tiene usuarios.</p>
      ) : (
        <ul className="divide-y divide-gray-200 border-t border-gray-200">
          {cuentas.map((c) => (
            <li key={c.id} className="py-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900">
                  {c.nombre}
                  {!c.isActive && <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-normal text-gray-600">Desactivado</span>}
                </p>
                <p className="text-sm text-gray-500 truncate">{c.email} · último acceso: {fecha(c.ultimoAcceso)}</p>
              </div>
              <div className="flex gap-3 shrink-0">
                <button className={btn.link} disabled={guardando}
                  onClick={() => { setCredenciales(null); setARestablecer({ cuenta: c, password: generarPassword() }); }}>
                  Restablecer contraseña
                </button>
                {c.isActive ? (
                  <button className="text-sm font-medium text-gray-500 hover:text-red-600" disabled={guardando}
                    onClick={() => setADesactivar(c)}>Desactivar</button>
                ) : (
                  <button className="text-sm font-medium text-gray-500 hover:text-gray-800" disabled={guardando}
                    onClick={() => cambiarEstado(c, true)}>Activar</button>
                )}
                <button className="text-sm font-medium text-gray-500 hover:text-red-600" disabled={guardando}
                  onClick={() => setAEliminar(c)}>Eliminar</button>
              </div>
            </li>
          ))}
        </ul>
      )}
      {cuentas.length > 0 && (
        <p className="text-xs text-gray-500">
          Las contraseñas no se pueden ver después de guardarlas. Si alguien olvida la suya, usa «Restablecer contraseña» y pásale la nueva.
        </p>
      )}

      <Confirmar
        abierto={!!aDesactivar}
        titulo="¿Desactivar este usuario?"
        textoConfirmar="Sí, desactivar"
        ocupado={guardando}
        onConfirmar={() => cambiarEstado(aDesactivar, false)}
        onCancelar={() => setADesactivar(null)}
      >
        {aDesactivar && <p><span className="font-medium">{aDesactivar.email}</span> no va a poder entrar, y si tiene la sesión abierta se le cierra. Se puede volver a activar.</p>}
      </Confirmar>

      <Confirmar
        abierto={!!aEliminar}
        titulo="¿Eliminar este usuario?"
        textoConfirmar="Sí, eliminar"
        ocupado={guardando}
        onConfirmar={eliminar}
        onCancelar={() => setAEliminar(null)}
      >
        {aEliminar && <p><span className="font-medium">{aEliminar.email}</span> deja de existir y no va a poder entrar. Los pergaminos y el libro de la funeraria no se tocan. No se puede deshacer.</p>}
      </Confirmar>

      <Confirmar
        abierto={!!aRestablecer}
        titulo="Restablecer contraseña"
        textoConfirmar="Guardar contraseña"
        ocupado={guardando}
        onConfirmar={restablecer}
        onCancelar={() => setARestablecer(null)}
      >
        {aRestablecer && (
          <div className="space-y-3">
            <p>Para <span className="font-medium">{aRestablecer.cuenta.email}</span>. Su sesión abierta se cierra.</p>
            <div className="flex gap-2">
              <input className={`${input} font-mono`} value={aRestablecer.password} minLength={8}
                onChange={(e) => setARestablecer({ ...aRestablecer, password: e.target.value })} />
              <button type="button" className="text-xs text-gray-500 hover:text-gray-800 shrink-0"
                onClick={() => setARestablecer({ ...aRestablecer, password: generarPassword() })}>Generar</button>
            </div>
          </div>
        )}
      </Confirmar>
    </section>
  );
};

export default CuentasFuneraria;
