// ====================================
// src/pages/admin/pergaminos/FunerariaSalas.jsx - Las 4 salas de una funeraria
// ====================================
import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { pergaminoAdmin } from '../../../services/pergaminoService';
import { btn, Cargando, Aviso, EstadoPergamino, useCarga } from '../../../components/admin/pergaminos/ui';
import MarcaFuneraria from '../../../components/admin/pergaminos/MarcaFuneraria';
import CuentasFuneraria from '../../../components/admin/pergaminos/CuentasFuneraria';
import { useRutasPergamino } from '../../../components/admin/pergaminos/rutas';
import { funerariaSesion } from '../../../services/funerariaSesion';

const QRSala = ({ sala }) => {
  const [dataUrl, setDataUrl] = useState(null);

  useEffect(() => {
    let vivo = true;
    if (sala.qr?.id) {
      pergaminoAdmin.qrDataUrl(sala.qr.id)
        .then((r) => vivo && setDataUrl(r.dataUrl))
        .catch(() => vivo && setDataUrl(null));
    }
    return () => { vivo = false; };
  }, [sala.qr?.id]);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="w-32 h-32 bg-gray-50 border border-gray-200 rounded flex items-center justify-center">
        {dataUrl
          ? <img src={dataUrl} alt={`QR ${sala.nombre}`} className="w-full h-full" />
          : <span className="text-xs text-gray-400">QR</span>}
      </div>
      <code className="text-xs text-gray-500">{sala.qr?.code}</code>
      {dataUrl && (
        <a href={dataUrl} download={`QR-${sala.nombre}-${sala.qr.code}.png`} className={btn.link}>
          Descargar QR
        </a>
      )}
    </div>
  );
};

const TarjetaSala = ({ sala }) => {
  const rutas = useRutasPergamino();
  const p = sala.pergamino || {};
  const nombre = [p.difunto?.nombre, p.difunto?.apellido].filter(Boolean).join(' ');
  const libro = sala.libroCondolencias || {};

  return (
    <div className="bg-white shadow sm:rounded-lg p-5 flex flex-col sm:flex-row gap-5">
      <QRSala sala={sala} />
      <div className="flex-1 min-w-0 flex flex-col">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-lg font-semibold text-gray-900">{sala.nombre}</h3>
          <EstadoPergamino estado={p.estado} />
        </div>
        <p className="mt-1 text-sm text-gray-700 truncate">
          {nombre || <span className="text-gray-400">Sin difunto cargado</span>}
        </p>
        <p className="mt-1 text-xs text-gray-500">
          Libro: {libro.totalMensajes ?? 0} mensaje{libro.totalMensajes === 1 ? '' : 's'}
          {libro.habilitado === false && ' · cerrado'}
        </p>
        {sala.qr?.url && (
          <a href={sala.qr.url} target="_blank" rel="noreferrer" className="mt-1 text-xs text-gray-500 hover:text-gray-700 truncate">
            {sala.qr.url}
          </a>
        )}
        <div className="mt-auto pt-4 flex flex-wrap gap-2">
          <Link to={rutas.sala(sala.id)} className={btn.primario}>Editar pergamino</Link>
          <Link to={rutas.libro(sala.id)} className={btn.secundario}>Libro de condolencias</Link>
        </div>
      </div>
    </div>
  );
};

const FunerariaSalas = () => {
  const rutas = useRutasPergamino();
  const params = useParams();
  // En el módulo de la funeraria, la funeraria es la de la sesión, no la de la URL
  const funerariaId = rutas.esFuneraria ? funerariaSesion.datos()?.funeraria?.id : params.funerariaId;
  const { datos, cargando, error, recargar } = useCarga(async () => {
    const [funeraria, salas] = await Promise.all([
      pergaminoAdmin.obtenerFuneraria(funerariaId),
      pergaminoAdmin.listarSalas(funerariaId),
    ]);
    return { funeraria: funeraria?.funeraria || funeraria, salas };
  }, [funerariaId]);

  if (cargando) return <Cargando texto="Cargando salas..." />;
  if (error) return <Aviso>{error} <button className={btn.link} onClick={recargar}>Reintentar</button></Aviso>;

  const { funeraria, salas } = datos;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        {!rutas.esFuneraria && (
          <Link to="/admin/pergaminos" className="text-sm text-gray-500 hover:text-gray-700">← Funerarias</Link>
        )}
        <h2 className="mt-2 text-2xl font-bold text-gray-900">{funeraria?.nombre}</h2>
        <p className="mt-1 text-sm text-gray-500">
          {[funeraria?.codigo, funeraria?.direccion, funeraria?.ciudad, funeraria?.telefono].filter(Boolean).join(' · ')}
        </p>
      </div>
      <MarcaFuneraria key={funeraria?.id} funeraria={funeraria} />
      {!rutas.esFuneraria && <CuentasFuneraria funeraria={funeraria} />}
      <p className="text-sm text-gray-600">
        Cada sala tiene un QR fijo: se imprime una vez y se cuelga en la sala. Entre un servicio y otro
        solo cambia el pergamino.
      </p>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {[...salas].sort((a, b) => a.numero - b.numero).map((s) => <TarjetaSala key={s.id} sala={s} />)}
      </div>
    </div>
  );
};

export default FunerariaSalas;
