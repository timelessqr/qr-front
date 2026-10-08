// ====================================
// src/services/api.js - Cliente API base
// ====================================
import axios from 'axios';

// Configuración base de la API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Crear instancia de axios
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token JWT a todas las requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(`📡 ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas y errores
api.interceptors.response.use(
  (response) => {
    console.log(`✅ Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('❌ Response Error:', error.response?.data || error.message);
    
    // Si el token expiró, redirigir a login. En el propio login un 401 es
    // "credenciales incorrectas": no se recarga, así el formulario muestra el error
    if (error.response?.status === 401 && !error.config?.url?.includes('/auth/login')) {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      window.location.href = '/admin/login';
    }
    
    return Promise.reject(error);
  }
);

export default api;

// Helpers para manejo de errores
export const handleApiError = (error) => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.message) {
    return error.message;
  }
  return 'Error desconocido';
};

// Helpers para formatear respuestas
export const getApiData = (response) => {
  console.log('=== DEBUG getApiData ===');
  console.log('Response completa:', response);
  console.log('response.data:', response.data);
  
  const data = response.data?.data || response.data;
  console.log('Data extraída:', data);
  
  // 🔧 NUEVO: Normalizar estructura de datos según endpoint
  if (data && typeof data === 'object') {
    // Para endpoints que devuelven listas paginadas
    if (data.clients) {
      console.log('→ Detectado endpoint de clientes');
      return {
        clients: data.clients,
        pagination: data.pagination
      };
    }
    
    if (data.profiles) {
      console.log('→ Detectado endpoint de profiles/memoriales');
      return {
        profiles: data.profiles,
        pagination: data.pagination
      };
    }
    
    // Para arrays directos
    if (Array.isArray(data)) {
      console.log('→ Detectado array directo');
      return data;
    }
    
    // Para objetos individuales
    console.log('→ Devolviendo objeto individual');
    return data;
  }
  
  return data;
};
