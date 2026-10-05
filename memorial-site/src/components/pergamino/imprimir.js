// ====================================
// src/components/pergamino/imprimir.js - Preparar la impresión del pergamino
// ====================================

// Alto útil de una hoja A4 con 12 mm de margen arriba y abajo, a 96 dpi
// (297 mm - 24 mm = 273 mm ≈ 1030 px), con un poco de holgura.
const ALTO_HOJA_PX = 1000;

// Si el pergamino es más alto que la hoja (por ejemplo con foto), lo achica
// con zoom para que la portada no se parta en dos páginas.
export const ajustarAHoja = () => {
  const hoja = document.querySelector('.pergamino-hoja');
  const pergamino = hoja?.closest('.pergamino');
  if (!hoja || !pergamino) return;
  pergamino.style.zoom = '';
  const alto = hoja.getBoundingClientRect().height;
  if (alto > ALTO_HOJA_PX) pergamino.style.zoom = String(ALTO_HOJA_PX / alto);
};

// Espera tipografía e imágenes, ajusta y abre el diálogo de impresión
export const imprimirCuandoCargue = () => {
  const pendientes = [...document.images].filter((img) => !img.complete);
  return Promise.all([
    document.fonts?.ready,
    ...pendientes.map((img) => new Promise((ok) => { img.onload = ok; img.onerror = ok; })),
  ]).then(() => {
    ajustarAHoja();
    window.print();
  });
};
