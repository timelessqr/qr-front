// ====================================
// src/components/admin/pergaminos/MarcaFuneraria.jsx - Logo de una funeraria
// ====================================
// El logo se aplica a los pergaminos de sus 4 salas: va en el pie y como sello
// de agua. Los colores son los mismos para todas las funerarias.
import React, { useState } from 'react';
import { pergaminoAdmin, mensajeError, urlArchivo } from '../../../services/pergaminoService';
import { btn, Aviso } from './ui';

const MarcaFuneraria = ({ funeraria }) => {
  const [logo, setLogo] = useState(funeraria.branding?.logoUrl || '');
  const [ocupado, setOcupado] = useState(false);
  const [aviso, setAviso] = useState(null);

  const correr = async (accion, ok) => {
    setOcupado(true);
    setAviso(null);
    try {
      const r = await accion();
      setAviso({ tipo: 'ok', texto: ok });
      return r;
    } catch (err) {
      setAviso({ tipo: 'error', texto: mensajeError(err) });
      return null;
    } finally {
      setOcupado(false);
    }
  };

  const subirLogo = async (e) => {
    const archivo = e.target.files?.[0];
    e.target.value = '';
    if (!archivo) return;
    const r = await correr(() => pergaminoAdmin.subirLogo(funeraria.id, archivo),
      'Logo aplicado a los pergaminos de las 4 salas');
    if (r) setLogo(r.funeraria?.branding?.logoUrl || '');
  };

  const quitarLogo = async () => {
    const r = await correr(() => pergaminoAdmin.actualizarMarca(funeraria.id, { logoUrl: '' }),
      'Logo quitado de los pergaminos');
    if (r) setLogo('');
  };

  return (
    <section className="bg-white shadow sm:rounded-lg p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="w-24 h-24 shrink-0 rounded border border-dashed border-gray-300 bg-gray-50 flex items-center justify-center overflow-hidden">
          {logo
            ? <img src={urlArchivo(logo)} alt="Logo de la funeraria" className="max-w-full max-h-full object-contain" />
            : <span className="text-xs text-gray-400">Sin logo</span>}
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-medium text-gray-900">Logo de la funeraria</h3>
          <p className="text-sm text-gray-500">
            Va en el pie del pergamino y como sello de agua, en las 4 salas. Mejor PNG con fondo transparente.
          </p>
          <div className="mt-3 flex items-center gap-4">
            <label className={`${btn.secundario} cursor-pointer ${ocupado ? 'opacity-50 pointer-events-none' : ''}`}>
              {ocupado ? 'Procesando...' : logo ? 'Cambiar logo' : 'Subir logo'}
              <input type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={subirLogo} />
            </label>
            {logo && (
              <button type="button" className="text-sm text-gray-500 hover:text-red-600" onClick={quitarLogo} disabled={ocupado}>
                Quitar logo
              </button>
            )}
          </div>
        </div>
      </div>
      {aviso && <div className="mt-4"><Aviso tipo={aviso.tipo} onCerrar={() => setAviso(null)}>{aviso.texto}</Aviso></div>}
    </section>
  );
};

export default MarcaFuneraria;
