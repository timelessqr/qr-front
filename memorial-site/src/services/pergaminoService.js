// ====================================
// src/services/pergaminoService.js - Cliente del backend de pergaminos
// ====================================
// Es otro backend (lazos-pergamino), pero usa el mismo login: el token de
// core-qr viaja igual y ese backend lo verifica con el mismo JWT_SECRET.
import axios from 'axios';

export const PERGAMINO_API_URL =
  import.meta.env.VITE_PERGAMINO_API_URL || 'http://localhost:3100/api';

// Origen del backend, para las URLs de archivos que devuelve relativas (/uploads/...)
const PERGAMINO_ORIGIN = PERGAMINO_API_URL.replace(/\/api\/?$/, '');

export const urlArchivo = (url) => {
  if (!url) return '';
  return url.startsWith('/') ? `${PERGAMINO_ORIGIN}${url}` : url;
};

// Render free se duerme: el primer pedido puede tardar cerca de un minuto
const TIMEOUT = 70000;

const privado = axios.create({ baseURL: PERGAMINO_API_URL, timeout: TIMEOUT });

// En /funeraria/... viaja el token de la cuenta de funeraria; en el admin, el de core-qr
const enModuloFuneraria = () => {
  const ruta = window.location.pathname;
  return ruta === '/funeraria' || ruta.startsWith('/funeraria/');
};

privado.interceptors.request.use((config) => {
  const token = localStorage.getItem(enModuloFuneraria() ? 'funeraria_token' : 'admin_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

privado.interceptors.response.use(
  (response) => response,
  (error) => {
    // 401 = token vencido o inválido: se cierra esa sesión y se vuelve al login.
    // 403 = sin acceso a ese recurso; la sesión sigue.
    if (error.response?.status === 401) {
      if (enModuloFuneraria()) {
        localStorage.removeItem('funeraria_token');
        localStorage.removeItem('funeraria_sesion');
      } else {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
      }
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

// Sin token: lo que abre el QR de la sala
const publico = axios.create({ baseURL: PERGAMINO_API_URL, timeout: TIMEOUT });

const datos = (response) => response.data?.data;

export const mensajeError = (error) =>
  error.response?.data?.message ||
  (error.code === 'ECONNABORTED' ? 'El servidor tardó demasiado en responder' : error.message) ||
  'Error desconocido';

export const pergaminoAdmin = {
  // Funerarias
  listarFunerarias: (params) => privado.get('/funerarias', { params }).then(datos),
  obtenerFuneraria: (id) => privado.get(`/funerarias/${id}`).then(datos),
  crearFuneraria: (data) => privado.post('/funerarias', data).then(datos),

  // Logo y colores: el backend los aplica a los pergaminos de las 4 salas
  actualizarMarca: (funerariaId, data) => privado.put(`/funerarias/${funerariaId}/marca`, data).then(datos),
  subirLogo: (funerariaId, archivo) => {
    const form = new FormData();
    form.append('archivo', archivo);
    return privado.post(`/funerarias/${funerariaId}/logo`, form).then(datos);
  },

  // Salas (las 4 de la funeraria, con su QR y su pergamino)
  listarSalas: (funerariaId) => privado.get(`/funerarias/${funerariaId}/salas`).then(datos),
  obtenerSala: (salaId) => privado.get(`/salas/${salaId}`).then(datos),

  // Pergamino
  obtenerPergamino: (salaId) => privado.get(`/pergaminos/sala/${salaId}`).then(datos),
  opciones: () => privado.get('/pergaminos/opciones').then(datos),
  actualizarPergamino: (id, data) => privado.put(`/pergaminos/${id}`, data).then(datos),
  publicar: (id) => privado.put(`/pergaminos/${id}/publicar`).then(datos),
  reiniciar: (id) => privado.post(`/pergaminos/${id}/reiniciar`).then(datos),

  subirFoto: (salaId, archivo, seccion = 'retrato') => {
    const form = new FormData();
    form.append('archivo', archivo);
    form.append('seccion', seccion);
    return privado.post(`/media/upload/${salaId}`, form).then(datos);
  },

  // QR
  qrDataUrl: (qrId) => privado.get(`/qr/${qrId}/dataurl`).then(datos),

  // Libro de condolencias (vista admin)
  listarCondolencias: (salaId, params) =>
    privado.get(`/condolencias/sala/${salaId}`, { params }).then(datos),
  borrarCondolencia: (id) => privado.delete(`/condolencias/${id}`).then(datos),

  // Cuentas de funeraria (solo superadmin)
  listarCuentas: (funerariaId) => privado.get(`/funerarias/${funerariaId}/cuentas`).then(datos),
  crearCuenta: (funerariaId, data) => privado.post(`/funerarias/${funerariaId}/cuentas`, data).then(datos),
  actualizarCuenta: (id, data) => privado.put(`/cuentas/${id}`, data).then(datos),
  restablecerPassword: (id, password) => privado.post(`/cuentas/${id}/password`, { password }).then(datos),

  // La cuenta de funeraria logueada
  yo: () => privado.get('/auth/yo').then(datos),
  cambiarPassword: (actual, nueva) => privado.put('/auth/password', { actual, nueva }).then(datos),
};

export const pergaminoPublico = {
  ver: (code) => publico.get(`/pergamino/${code}`).then(datos),
  configLibro: (code) => publico.get(`/pergamino/${code}/condolencias/config`).then(datos),
  condolencias: (code, params) =>
    publico.get(`/pergamino/${code}/condolencias`, { params }).then(datos),
  // Devuelve también el mensaje: dice si el texto queda pendiente de moderación
  dejarCondolencia: (code, data) =>
    publico.post(`/pergamino/${code}/condolencias`, data).then((r) => r.data),
};
