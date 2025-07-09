import axios from 'axios';

// Configuración de la API
import { API_URL } from '../config';

// Crear instancia de axios
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 segundos de timeout
});

// Interceptor para peticiones
api.interceptors.request.use(
  (config) => {
    // Podemos añadir tokens de autenticación u otras cabeceras aquí si es necesario
    return config;
  },
  (error) => {
    console.error('Error en la solicitud API:', error);
    return Promise.reject(error);
  }
);

// Interceptor para respuestas
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Manejar errores comunes
    if (error.code === 'ECONNABORTED') {
      console.error('Timeout en la conexión al servidor. Verifique que el backend esté en ejecución.');
    } else if (!error.response) {
      console.error('No se pudo conectar con el servidor. Verifique que el backend esté en ejecución en:', API_URL);
    } else {
      console.error(`Error ${error.response.status}: ${error.response.statusText}`);
    }
    return Promise.reject(error);
  }
);

// Función para verificar si el backend está disponible
export const checkBackendStatus = async (): Promise<boolean> => {
  try {
    await api.get('/health');
    return true;
  } catch (error) {
    console.error('El backend no está disponible:', error);
    return false;
  }
};

export default api;
