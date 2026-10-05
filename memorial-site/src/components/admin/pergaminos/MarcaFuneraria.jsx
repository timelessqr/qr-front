// ====================================
// src/components/admin/pergaminos/MarcaFuneraria.jsx - Logo y colores de una funeraria
// ====================================
// Lo que se guarda acá se aplica a los pergaminos de sus 4 salas.
import React, { useState } from 'react';
import { pergaminoAdmin, mensajeError, urlArchivo } from '../../../services/pergaminoService';
import { btn, Aviso } from './ui';

const PALETAS = [
  { nombre: 'Dorado clásico', colorPrimario: '#8C7B5A', colorTexto: '#4A443B', colorFondo: '#F4F1E8' },
  { nombre: 'Vino', colorPrimario: '#7A1F2B', colorTexto: '#3F2A2A', colorFondo: '#F7F2EA' },
  { nombre: 'Azul noche', colorPrimario: '#2C3E50', colorTexto: '#2E3440', colorFondo: '#F2F1EC' },
  { nombre: 'Verde salvia', colorPrimario: '#5B6B4E', colorTexto: '#3B4034', colorFondo: '#F3F2EA' },
  { nombre: 'Gris piedra', colorPrimario: '#5E5A55', colorTexto: '#3A3835', colorFondo: '#F2F0EC' },
];

const COLORES = [
  ['colorPrimario', 'Principal', 'Adornos, títulos y líneas'],
  ['colorTexto', 'Texto', 'Nombre, fechas y servicios'],
  ['colorFondo', 'Fondo', 'El papel del pergamino'],
];

const coloresDe = (branding = {}) => ({
  colorPrimario: (branding.colorPrimario || PALETAS[0].colorPrimario).toUpperCase(),
  colorTexto: (branding.colorTexto || PALETAS[0].colorTexto).toUpperCase(),
  colorFondo: (branding.colorFondo || PALETAS[0].colorFondo).toUpperCase(),
});

const MarcaFuneraria = ({ funeraria, onActualizada }) => {
  const [colores, setColores] = useState(coloresDe(funeraria.branding));
  const [guardados, setGuardados] = useState(coloresDe(funeraria.branding));
  const [logo, setLogo] = useState(funeraria.branding?.logoUrl || '');
  const [ocupado, setOcupado] = useState(null);
  const [aviso, setAviso] = useState(null);

  const sinGuardar = JSON.stringify(colores) !== JSON.stringify(guardados);

  const correr = async (nombre, accion, ok) => {
    setOcupado(nombre);
    setAviso(null);
    try {
      const r = await accion();
      setAviso({ tipo: 'ok', texto: ok });
      onActualizada?.(r?.funeraria);
      return r;
    } catch (err) {
      setAviso({ tipo: 'error', texto: mensajeError(err) });
      return null;
    } finally {
      setOcupado(null);
    }
  };

  const guardarColores = async () => {
    const r = await correr('colores', () => pergaminoAdmin.actualizarMarca(funeraria.id, colores),
      'Colores aplicados a los pergaminos de las 4 salas');
    if (r) setGuardados(colores);
  };

  const subirLogo = async (e) => {
    const archivo = e.target.files?.[0];
    e.target.value = '';
    if (!archivo) return;
    const r = await correr('logo', () => pergaminoAdmin.subirLogo(funeraria.id, archivo),
      'Logo aplicado a los pergaminos de las 4 salas');
    if (r) setLogo(r.funeraria?.branding?.logoUrl || '');
  };

  const quitarLogo = async () => {
    const r = await correr('logo', () => pergaminoAdmin.actualizarMarca(funeraria.id, { logoUrl: '' }),
      'Logo quitado de los pergaminos');
    if (r) setLogo('');
  };

  return (
    <section className="bg-white shadow sm:rounded-lg p-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
        <h3 className="text-lg font-medium text-gray-900">Logo y colores del pergamino</h3>
        <p className="text-sm text-gray-500">Se aplican a los pergaminos de las 4 salas.</p>
      </div>

      {aviso && <div className="mt-4"><Aviso tipo={aviso.tipo} onCerrar={() => setAviso(null)}>{aviso.texto}</Aviso></div>}

      <div className="mt-5 grid grid-cols-1 lg:grid-cols-[1fr_1fr_220px] gap-6">
        {/* Logo */}
        <div>
          <p className="text-sm font-medium text-gray-700">Logo</p>
          <p className="text-xs text-gray-500 mb-3">Va en el pie y como sello de agua. Mejor PNG con fondo transparente.</p>
          <div className="flex items-center gap-4">
            <div className="w-24 h-24 rounded border border-dashed border-gray-300 bg-gray-50 flex items-center justify-center overflow-hidden">
              {logo
                ? <img src={urlArchivo(logo)} alt="Logo de la funeraria" className="max-w-full max-h-full object-contain" />
                : <span className="text-xs text-gray-400">Sin logo</span>}
            </div>
            <div className="flex flex-col gap-2">
              <label className={`${btn.secundario} cursor-pointer ${ocupado ? 'opacity-50 pointer-events-none' : ''}`}>
                {ocupado === 'logo' ? 'Subiendo...' : logo ? 'Cambiar logo' : 'Subir logo'}
                <input type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={subirLogo} />
              </label>
              {logo && (
                <button type="button" className="text-xs text-gray-500 hover:text-red-600 text-left" onClick={quitarLogo} disabled={!!ocupado}>
                  Quitar logo
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Colores */}
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Colores</p>
          <div className="flex flex-wrap gap-2 mb-4">
            {PALETAS.map((p) => (
              <button key={p.nombre} type="button" title={p.nombre}
                onClick={() => setColores({ colorPrimario: p.colorPrimario, colorTexto: p.colorTexto, colorFondo: p.colorFondo })}
                className="flex items-center gap-1.5 rounded-full border border-gray-200 px-2.5 py-1 text-xs text-gray-700 hover:border-gray-400">
                <span className="w-3.5 h-3.5 rounded-full" style={{ background: p.colorPrimario }} />
                {p.nombre}
              </button>
            ))}
          </div>
          <div className="space-y-2">
            {COLORES.map(([clave, nombre, ayuda]) => (
              <label key={clave} className="flex items-center gap-3">
                <input type="color" value={colores[clave]}
                  onChange={(e) => setColores({ ...colores, [clave]: e.target.value.toUpperCase() })}
                  className="w-9 h-9 rounded border border-gray-300 cursor-pointer bg-white p-0.5" />
                <span className="text-sm text-gray-800 w-20">{nombre}</span>
                <code className="text-xs text-gray-500 w-16">{colores[clave]}</code>
                <span className="text-xs text-gray-400 hidden sm:inline">{ayuda}</span>
              </label>
            ))}
          </div>
          <div className="mt-4 flex items-center gap-3">
            <button className={btn.primario} onClick={guardarColores} disabled={!!ocupado || !sinGuardar}>
              {ocupado === 'colores' ? 'Aplicando...' : 'Aplicar colores'}
            </button>
            {sinGuardar && (
              <button type="button" className="text-xs text-gray-500 hover:text-gray-800" onClick={() => setColores(guardados)}>
                Deshacer
              </button>
            )}
          </div>
        </div>

        {/* Muestra */}
        <div className="font-serif">
          <p className="text-sm font-medium text-gray-700 mb-2 font-sans">Muestra</p>
          <div className="relative rounded-sm px-4 py-6 text-center shadow-inner overflow-hidden"
            style={{ background: colores.colorFondo, color: colores.colorTexto }}>
            {logo && (
              <img src={urlArchivo(logo)} alt="" aria-hidden
                className="absolute inset-0 m-auto w-3/5 max-h-[60%] object-contain opacity-[0.07] pointer-events-none" />
            )}
            <div className="relative">
              <p className="text-[10px] tracking-[0.3em]" style={{ color: colores.colorPrimario }}>EN MEMORIA DE</p>
              <p className="mt-1 text-lg font-semibold leading-tight">Nombre del difunto</p>
              <div className="my-3 h-px" style={{ background: colores.colorPrimario, opacity: 0.4 }} />
              <p className="text-[10px] tracking-[0.2em] font-semibold" style={{ color: colores.colorPrimario }}>VELATORIO</p>
              <p className="text-xs mt-1">Lunes 5 de octubre · 15:00 hrs.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MarcaFuneraria;
