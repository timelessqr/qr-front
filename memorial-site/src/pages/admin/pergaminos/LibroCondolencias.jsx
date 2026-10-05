// ====================================
// src/pages/admin/pergaminos/LibroCondolencias.jsx - Mensajes del libro de una sala
// ====================================
// Muestra el servicio en curso. La funeraria borra desde aquí, con confirmación.
import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { pergaminoAdmin, mensajeError } from '../../../services/pergaminoService';
import { btn, Cargando, Aviso, Confirmar, useCarga } from '../../../components/admin/pergaminos/ui';

const fecha = (iso) => new Date(iso).toLocaleString('es-CL', {
  day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
});

const LibroCondolencias = () => {
  const { salaId } = useParams();
  const [aBorrar, setABorrar] = useState(null);
  const [borrando, setBorrando] = useState(false);
  const [aviso, setAviso] = useState(null);

  const { datos, cargando, error, recargar } = useCarga(async () => {
    const [sala, libro] = await Promise.all([
      pergaminoAdmin.obtenerSala(salaId),
      pergaminoAdmin.listarCondolencias(salaId, { limit: 100 }),
    ]);
    return { sala, libro };
  }, [salaId]);

  const borrar = async () => {
    setBorrando(true);
    try {
      await pergaminoAdmin.borrarCondolencia(aBorrar._id || aBorrar.id);
      setAviso({ tipo: 'ok', texto: 'Mensaje borrado' });
      setABorrar(null);
      await recargar();
    } catch (err) {
      setAviso({ tipo: 'error', texto: mensajeError(err) });
    } finally {
      setBorrando(false);
    }
  };

  if (cargando) return <Cargando texto="Cargando libro..." />;
  if (error) return <Aviso>{error} <button className={btn.link} onClick={recargar}>Reintentar</button></Aviso>;

  const { sala, libro } = datos;
  const mensajes = libro.condolencias || [];
  const difunto = [sala.pergamino?.difunto?.nombre, sala.pergamino?.difunto?.apellido].filter(Boolean).join(' ');

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <Link to={`/admin/pergaminos/funerarias/${sala.funeraria}`} className="text-sm text-gray-500 hover:text-gray-700">← Salas</Link>
        <h2 className="mt-2 text-2xl font-bold text-gray-900">Libro de condolencias · {sala.nombre}</h2>
        <p className="mt-1 text-sm text-gray-500">
          {difunto ? `Servicio de ${difunto}. ` : ''}
          {libro.pagination?.totalItems ?? mensajes.length} mensaje{(libro.pagination?.totalItems ?? mensajes.length) === 1 ? '' : 's'} en el servicio actual.
        </p>
      </div>

      {aviso && <Aviso tipo={aviso.tipo} onCerrar={() => setAviso(null)}>{aviso.texto}</Aviso>}

      <div className="bg-white shadow sm:rounded-md">
        {mensajes.length === 0 ? (
          <p className="p-8 text-center text-sm text-gray-500">Todavía no hay mensajes en este servicio.</p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {mensajes.map((m) => (
              <li key={m._id || m.id} className="px-6 py-4 flex gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    {m.nombre}
                    {m.relacion && <span className="font-normal text-gray-500"> · {m.relacion}</span>}
                  </p>
                  <p className="mt-1 text-sm text-gray-700 whitespace-pre-line break-words">{m.mensaje}</p>
                  <p className="mt-1 text-xs text-gray-400">
                    {fecha(m.createdAt || m.fecha)}
                    {m.estado && m.estado !== 'aprobada' && ` · ${m.estado}`}
                  </p>
                </div>
                <button className={`${btn.peligro} self-start`} onClick={() => setABorrar(m)}>Borrar</button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Confirmar
        abierto={!!aBorrar}
        titulo="¿Seguro que quieres borrar este mensaje?"
        textoConfirmar="Sí, borrar"
        ocupado={borrando}
        onConfirmar={borrar}
        onCancelar={() => setABorrar(null)}
      >
        {aBorrar && (
          <>
            <p className="font-medium text-gray-800">{aBorrar.nombre}</p>
            <p className="mt-1 italic line-clamp-3">“{aBorrar.mensaje}”</p>
            <p className="mt-3">No se puede deshacer.</p>
          </>
        )}
      </Confirmar>
    </div>
  );
};

export default LibroCondolencias;
