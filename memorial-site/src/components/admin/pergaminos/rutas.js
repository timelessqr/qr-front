// ====================================
// src/components/admin/pergaminos/rutas.js - Rutas de la sección Pergaminos
// ====================================
// Las mismas pantallas se usan en dos lugares:
//   /admin/pergaminos/...  el admin de Lazos, con todas las funerarias
//   /funeraria/...         una cuenta de funeraria, solo con la suya
import { useLocation } from 'react-router-dom';

export const esModuloFuneraria = (pathname = window.location.pathname) =>
  pathname === '/funeraria' || pathname.startsWith('/funeraria/');

export const useRutasPergamino = () => {
  const { pathname } = useLocation();
  const funeraria = esModuloFuneraria(pathname);
  const base = funeraria ? '/funeraria' : '/admin/pergaminos';

  return {
    esFuneraria: funeraria,
    sala: (salaId) => `${base}/salas/${salaId}`,
    libro: (salaId) => `${base}/salas/${salaId}/libro`,
    imprimir: (salaId) => `${base}/salas/${salaId}/imprimir`,
    descargarLibro: (salaId) => `${base}/salas/${salaId}/libro/descargar`,
    // Página con las salas de la funeraria
    salas: (funerariaId) => (funeraria ? '/funeraria' : `/admin/pergaminos/funerarias/${funerariaId}`),
  };
};
