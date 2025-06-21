// ====================================
// src/services/index.js - Exportación de todos los servicios
// ====================================
export { default as api } from './api';
export { default as authService } from './authService';
export { default as clientService } from './clientService';
export { default as memorialService } from './memorialService';
export { default as qrService } from './qrService';
export { default as adminService } from './adminService';
export { default as comentarioService } from './comentarioService';

// Importar servicios para el objeto de servicios
import authService from './authService';
import clientService from './clientService';
import memorialService from './memorialService';
import qrService from './qrService';
import adminService from './adminService';
import comentarioService from './comentarioService';

// Helper para importar todos los servicios de una vez
export const services = {
  auth: authService,
  client: clientService,
  memorial: memorialService,
  qr: qrService,
  admin: adminService,
  comentario: comentarioService,
};
