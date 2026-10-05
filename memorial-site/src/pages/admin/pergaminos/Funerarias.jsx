// ====================================
// src/pages/admin/pergaminos/Funerarias.jsx - Funerarias con pergaminos
// ====================================
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { pergaminoAdmin, mensajeError } from '../../../services/pergaminoService';
import { btn, input, Campo, Cargando, Aviso, useCarga } from '../../../components/admin/pergaminos/ui';

const VACIA = { nombre: '', telefono: '', email: '', direccion: '', ciudad: '', pais: 'Chile' };

const NuevaFuneraria = ({ onCreada, onCancelar }) => {
  const [form, setForm] = useState(VACIA);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState(null);

  const cambiar = (campo) => (e) => setForm({ ...form, [campo]: e.target.value });

  const enviar = async (e) => {
    e.preventDefault();
    setGuardando(true);
    setError(null);
    try {
      // Los campos opcionales vacíos no se mandan
      const datos = Object.fromEntries(Object.entries(form).filter(([, v]) => v.trim() !== ''));
      const r = await pergaminoAdmin.crearFuneraria(datos);
      onCreada(r.funeraria);
    } catch (err) {
      setError(mensajeError(err));
      setGuardando(false);
    }
  };

  return (
    <form onSubmit={enviar} className="bg-white shadow sm:rounded-lg p-6 space-y-4">
      <div>
        <h3 className="text-lg font-medium text-gray-900">Nueva funeraria</h3>
        <p className="text-sm text-gray-500">Al crearla se generan sus 4 salas, cada una con su QR y su pergamino.</p>
      </div>
      {error && <Aviso>{error}</Aviso>}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Campo label="Nombre *"><input className={input} value={form.nombre} onChange={cambiar('nombre')} required minLength={2} /></Campo>
        <Campo label="Teléfono *"><input className={input} value={form.telefono} onChange={cambiar('telefono')} required placeholder="+56 9 1234 5678" /></Campo>
        <Campo label="Email"><input className={input} type="email" value={form.email} onChange={cambiar('email')} /></Campo>
        <Campo label="Dirección"><input className={input} value={form.direccion} onChange={cambiar('direccion')} /></Campo>
        <Campo label="Ciudad"><input className={input} value={form.ciudad} onChange={cambiar('ciudad')} /></Campo>
        <Campo label="País"><input className={input} value={form.pais} onChange={cambiar('pais')} /></Campo>
      </div>
      <div className="flex justify-end gap-3">
        <button type="button" className={btn.secundario} onClick={onCancelar} disabled={guardando}>Cancelar</button>
        <button type="submit" className={btn.primario} disabled={guardando}>
          {guardando ? 'Creando...' : 'Crear funeraria'}
        </button>
      </div>
    </form>
  );
};

const Funerarias = () => {
  const navigate = useNavigate();
  const [creando, setCreando] = useState(false);
  const { datos, cargando, error, recargar } = useCarga(() => pergaminoAdmin.listarFunerarias({ limit: 100 }), []);
  const funerarias = datos?.funerarias || [];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="md:flex md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Pergaminos</h2>
          <p className="mt-1 text-sm text-gray-500">Funerarias, sus 4 salas y el pergamino de cada una.</p>
        </div>
        {!creando && (
          <button className={`${btn.primario} mt-4 md:mt-0`} onClick={() => setCreando(true)}>
            + Nueva funeraria
          </button>
        )}
      </div>

      {creando && (
        <NuevaFuneraria
          onCancelar={() => setCreando(false)}
          onCreada={(f) => navigate(`/admin/pergaminos/funerarias/${f.id}`)}
        />
      )}

      {error && <Aviso>{error} <button className={btn.link} onClick={recargar}>Reintentar</button></Aviso>}

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        {cargando ? <Cargando texto="Cargando funerarias..." /> : funerarias.length === 0 ? (
          <div className="p-8 text-center">
            <h3 className="text-sm font-medium text-gray-900">Todavía no hay funerarias</h3>
            <p className="mt-1 text-sm text-gray-500">Crea la primera para generar sus salas y QR.</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {funerarias.map((f) => (
              <li key={f.id}>
                <Link to={`/admin/pergaminos/funerarias/${f.id}`} className="block px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{f.nombre}</p>
                      <p className="text-sm text-gray-500 truncate">
                        {[f.codigo, f.ciudad, f.telefono].filter(Boolean).join(' · ')}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 text-sm text-gray-500">
                      <span>{f.totalSalas ?? 4} salas</span>
                      {f.activo === false && <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100">Inactiva</span>}
                      <span aria-hidden>›</span>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Funerarias;
