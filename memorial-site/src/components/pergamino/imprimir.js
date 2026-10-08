// ====================================
// src/components/pergamino/imprimir.js - Abrir el diálogo de impresión
// ====================================
// Las hojas (HojasPergamino) ya esperan tipografía e imágenes y se arman
// antes de avisar que están listas; acá solo se deja pintar y se imprime.
export const imprimir = () => {
  requestAnimationFrame(() => requestAnimationFrame(() => window.print()));
};
