// ====================================
// src/components/pergamino/pdf.js - PDF A4 del pergamino y del libro
// ====================================
// Cada .hoja-a4 se dibuja en un canvas al doble de resolución y va a una
// página A4 del PDF. Así el archivo sale igual en cualquier teléfono o
// computador, sin depender del diálogo de impresión (que en tamaño carta
// cortaba la hoja). Las librerías se cargan recién al descargar.
// html2canvas dibuja mal los íconos SVG (no salen, o salen corridos). En la copia
// que fotografía, cada ícono se reemplaza por una imagen del mismo tamaño con
// el color ya resuelto.
const iconosComoImagen = (doc) => {
  doc.querySelectorAll('section.hoja-a4 svg').forEach((svg) => {
    const vista = doc.defaultView;
    const estilo = vista.getComputedStyle(svg);
    const { width, height } = svg.getBoundingClientRect();
    if (!width || !height) return;

    const copia = svg.cloneNode(true);
    copia.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    copia.setAttribute('width', width);
    copia.setAttribute('height', height);
    copia.setAttribute('fill', estilo.color);
    copia.removeAttribute('style');
    copia.removeAttribute('class');
    const marcado = new XMLSerializer().serializeToString(copia).replace(/currentColor/g, estilo.color);

    const img = doc.createElement('img');
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(marcado)}`;
    img.setAttribute('class', svg.getAttribute('class') || '');
    img.style.width = `${width}px`;
    img.style.height = `${height}px`;
    img.style.display = 'block';
    img.style.margin = estilo.margin;
    img.style.flexShrink = '0';
    svg.replaceWith(img);
  });
};

export const descargarPdf = async (nombreArchivo) => {
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([import('html2canvas'), import('jspdf')]);

  const hojas = [...document.querySelectorAll('section.hoja-a4')];
  if (!hojas.length) throw new Error('No hay hojas para el PDF');

  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true });

  for (const [i, hoja] of hojas.entries()) {
    const canvas = await html2canvas(hoja, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#F6F1EA',
      logging: false,
      onclone: (doc) => iconosComoImagen(doc),
    });
    if (i > 0) pdf.addPage('a4', 'portrait');
    pdf.addImage(canvas.toDataURL('image/jpeg', 0.9), 'JPEG', 0, 0, 210, 297, undefined, 'FAST');
  }

  const nombre = `${nombreArchivo.replace(/[\\/:*?"<>|]+/g, '').trim() || 'Pergamino'}.pdf`;
  pdf.save(nombre);
  return nombre;
};
