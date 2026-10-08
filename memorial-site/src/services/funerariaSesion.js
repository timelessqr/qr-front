// ====================================
// src/services/funerariaSesion.js - Sesión de las cuentas de funeraria
// ====================================
// Una cuenta de funeraria inicia sesión contra el backend de pergaminos, no
// contra core-qr. Su token se guarda con otras claves que el del admin
// (admin_token), así que una sesión nunca se usa en lugar de la otra.
import axios from 'axios';
import { PERGAMINO_API_URL } from './pergaminoService';

const TOKEN = 'funeraria_token';
const DATOS = 'funeraria_sesion';

export const funerariaSesion = {
  token: () => localStorage.getItem(TOKEN),

  // { cuenta: {id, nombre, email}, funeraria: {id, codigo, nombre, logoUrl} }
  datos: () => {
    try {
      return JSON.parse(localStorage.getItem(DATOS) || 'null');
    } catch {
      return null;
    }
  },

  activa: () => !!localStorage.getItem(TOKEN),

  guardar: (token, datos) => {
    if (token) localStorage.setItem(TOKEN, token);
    if (datos) localStorage.setItem(DATOS, JSON.stringify(datos));
  },

  cerrar: () => {
    localStorage.removeItem(TOKEN);
    localStorage.removeItem(DATOS);
  },

  // El backend puede tardar en despertar (Render free): timeout amplio
  login: async (email, password) => {
    const r = await axios.post(`${PERGAMINO_API_URL}/auth/login`, { email, password }, { timeout: 70000 });
    const { token, cuenta, funeraria } = r.data.data;
    funerariaSesion.guardar(token, { cuenta, funeraria });
    return { cuenta, funeraria };
  },
};
