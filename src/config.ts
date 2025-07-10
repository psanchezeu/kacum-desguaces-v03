// API URL configuration
// En Vite, las variables de entorno se acceden mediante import.meta.env
// Usamos la variable de entorno para producción, pero mantenemos un fallback para el desarrollo local.
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
