import api from './api';
import { Vehiculo } from "@/types";
import { PaginatedResponse, PaginationParams } from "./piezasService";

// Clave para almacenar los vehículos en localStorage (solo para respaldo)
const VEHICULOS_STORAGE_KEY = 'kacum_vehiculos_data';

// Tiempo de expiración de la caché en milisegundos (5 minutos)
const CACHE_EXPIRY_TIME = 5 * 60 * 1000;

// Variable para almacenar los vehículos en memoria durante la sesión (caché)
let vehiculosCache: Vehiculo[] = [];

// Interfaz para datos cacheados con paginación
interface CachedVehiculosData {
  data: Vehiculo[];
  pagination?: {
    page: number;
    limit: number;
    total?: number;
    totalPages?: number;
  };
  timestamp: number;
}

// Guarda los vehículos en localStorage como respaldo
const saveVehiculosToStorage = (vehiculos: Vehiculo[]): void => {
  try {
    localStorage.setItem(VEHICULOS_STORAGE_KEY, JSON.stringify(vehiculos));
    console.log(`${vehiculos.length} vehículos guardados en localStorage como respaldo`);
  } catch (error) {
    console.error('Error al guardar vehículos en localStorage:', error);
  }
};

export const vehiculosService = {
  /**
   * Obtiene los vehículos asociados a un cliente específico
   * @param clienteId ID del cliente
   * @returns Promise con array de vehículos del cliente
   */
  getByClienteId: async (clienteId: number): Promise<Vehiculo[]> => {
    try {
      // Intenta obtener los vehículos del cliente desde el backend
      const response = await api.get(`/vehiculos/cliente/${clienteId}`);
      
      // Si la respuesta es un array (incluso vacío), la devolvemos directamente
      if (response.data && Array.isArray(response.data)) {
        // Actualizamos la caché con estos vehículos
        const vehiculosCliente = response.data;
        
        // Actualizamos los vehículos en la caché global
        vehiculosCliente.forEach(vehiculo => {
          const index = vehiculosCache.findIndex(v => v.id === vehiculo.id);
          if (index !== -1) {
            vehiculosCache[index] = vehiculo;
          } else {
            vehiculosCache.push(vehiculo);
          }
        });
        
        // Guardamos en localStorage como respaldo
        saveVehiculosToStorage(vehiculosCache);
        
        return vehiculosCliente;
      } else {
        throw new Error(`Formato de respuesta inválido para vehículos del cliente ${clienteId}`);
      }
    } catch (error) {
      console.error(`Error al obtener vehículos del cliente ${clienteId}:`, error);
      throw error;
    }
  },

  /**
   * Obtiene todos los vehículos
   * @returns Promise con array de vehículos
   */
  getAll: async (pagination?: PaginationParams): Promise<PaginatedResponse<Vehiculo>> => {
    try {
      // Construir los parámetros de búsqueda
      const params = new URLSearchParams();
      if (pagination) {
        params.append('page', pagination.page.toString());
        params.append('limit', pagination.limit.toString());
        // Asegurar que se envía el parámetro count si está definido
        if (pagination.count !== undefined) {
          params.append('count', pagination.count.toString());
        }
      }
      // Siempre necesitamos el conteo para la paginación
      if (!params.has('count')) {
        params.append('count', 'true');
      }
      
      // Obtener los vehículos del backend
      const response = await api.get(`/vehiculos?${params.toString()}`);
      
      // Verificar que la respuesta tenga el formato esperado
      if (!response.data || !response.data.data) {
        console.error('Respuesta inválida del servidor:', response.data);
        throw new Error('Formato de respuesta inválido');
      }
      
      // Asegurarse de que la paginación esté correctamente formateada
      if (response.data.pagination) {
        // Si no hay total definido pero tenemos datos, usar la longitud de los datos
        if (response.data.pagination.total === undefined || response.data.pagination.total === null) {
          response.data.pagination.total = response.data.data.length;
        }
        
        // Calcular el número total de páginas si no está definido
        if (response.data.pagination.totalPages === undefined || response.data.pagination.totalPages === null) {
          const pageSize = response.data.pagination.limit || 50;
          response.data.pagination.totalPages = Math.max(1, Math.ceil(response.data.pagination.total / pageSize));
        }
        
        console.log('Información de paginación:', response.data.pagination);
      } else {
        // Si no hay información de paginación, crearla
        response.data.pagination = {
          page: pagination?.page || 1,
          limit: pagination?.limit || 50,
          total: response.data.data.length,
          totalPages: Math.max(1, Math.ceil(response.data.data.length / (pagination?.limit || 50)))
        };
      }
      
      // Guardamos en caché
      const cacheData = {
        data: response.data.data,
        pagination: response.data.pagination,
        timestamp: Date.now()
      };
      localStorage.setItem(VEHICULOS_STORAGE_KEY, JSON.stringify(cacheData));
      
      // Actualizamos la caché
      vehiculosCache = response.data.data;
      
      // Guardamos en localStorage como respaldo
      saveVehiculosToStorage(vehiculosCache);
      
      return response.data;
    } catch (error) {
      console.error('Error fetching vehiculos from API, trying localStorage:', error);
      
      // Si falla, intentar recuperar de localStorage
      const cachedData = localStorage.getItem(VEHICULOS_STORAGE_KEY);
      if (cachedData) {
        const { data, pagination, timestamp } = JSON.parse(cachedData) as CachedVehiculosData;
        
        // Verificar si la caché no ha expirado
        if (Date.now() - timestamp < CACHE_EXPIRY_TIME) {
          console.log('Using cached vehiculos data');
          return { data, pagination: pagination || { page: 1, limit: data.length } };
        }
      }
      
      // Si no hay caché o ha expirado, propagar el error
      throw error;
    }
  },


  /**
   * Obtiene un vehículo por su ID
   * @param id ID del vehículo
   * @returns Promise con el vehículo
   */
  getById: async (id: number): Promise<Vehiculo> => {
    try {
      // Primero, buscar en la caché
      const vehiculoCached = vehiculosCache.find(v => v.id === id);
      if (vehiculoCached) {
        console.log(`Vehículo ${id} obtenido de la caché`);
        return vehiculoCached;
      }
      
      // Si no está en la caché, obtenerlo del backend
      const response = await api.get(`/vehiculos/${id}`);
      
      if (response.data) {
        // Actualizar la caché
        const index = vehiculosCache.findIndex(v => v.id === response.data.id);
        if (index !== -1) {
          vehiculosCache[index] = response.data;
        } else {
          vehiculosCache.push(response.data);
        }
        
        // Guardamos en localStorage como respaldo
        saveVehiculosToStorage(vehiculosCache);
        
        return response.data;
      } else {
        throw new Error(`No se encontró el vehículo con ID ${id}`);
      }
    } catch (error) {
      console.error(`Error al obtener vehículo ${id}:`, error);
      throw error;
    }
  },

  /**
   * Crea un nuevo vehículo
   * @param vehiculo Datos del vehículo a crear
   * @returns Promise con el vehículo creado
   */
  create: async (vehiculo: Omit<Vehiculo, 'id'>): Promise<Vehiculo> => {
    try {
      // Preparamos los datos del vehículo para enviar al backend
      const vehiculoToSend = { ...vehiculo };
      
      // Si no hay cliente asignado, enviamos null en lugar de undefined
      if (vehiculoToSend.id_cliente === undefined) {
        (vehiculoToSend as any).id_cliente = null;
      }
      
      // Intenta crear el vehículo en el backend
      const response = await api.post('/vehiculos', vehiculoToSend);
      
      // Si la respuesta es exitosa, actualiza la caché
      if (response.data) {
        const nuevoVehiculo = response.data;
        
        // Actualizamos la caché
        vehiculosCache.push(nuevoVehiculo);
        
        // Guardamos en localStorage como respaldo
        saveVehiculosToStorage(vehiculosCache);
        
        console.log(`Vehículo creado con ID ${nuevoVehiculo.id}${nuevoVehiculo.id_cliente ? ` y asignado al cliente ${nuevoVehiculo.id_cliente}` : ' sin cliente asignado'}`);
        return nuevoVehiculo;
      } else {
        throw new Error('Formato de respuesta inválido');
      }
    } catch (error) {
      console.error('Error al crear vehículo en el backend:', error);
      throw error;
    }
  },

  /**
   * Actualiza un vehículo existente
   * @param id ID del vehículo
   * @param vehiculo Datos actualizados del vehículo
   * @returns Promise con el vehículo actualizado
   */
  update: async (id: number, vehiculo: Partial<Vehiculo>): Promise<Vehiculo> => {
    try {
      // Preparamos los datos del vehículo para enviar al backend
      const vehiculoToSend = { ...vehiculo };
      
      // Si no hay cliente asignado, enviamos null en lugar de undefined
      if (vehiculoToSend.id_cliente === undefined) {
        (vehiculoToSend as any).id_cliente = null;
      }
      
      // Intenta actualizar el vehículo en el backend
      const response = await api.put(`/vehiculos/${id}`, vehiculoToSend);
      
      // Si la respuesta es exitosa, actualiza la caché
      if (response.data) {
        const vehiculoActualizado = response.data;
        
        // Actualizamos la caché
        const index = vehiculosCache.findIndex(v => v.id === vehiculoActualizado.id);
        if (index !== -1) {
          vehiculosCache[index] = vehiculoActualizado;
        } else {
          vehiculosCache.push(vehiculoActualizado);
        }
        
        // Guardamos en localStorage como respaldo
        saveVehiculosToStorage(vehiculosCache);
        
        console.log(`Vehículo ${id} actualizado correctamente${vehiculoActualizado.id_cliente ? ` y asignado al cliente ${vehiculoActualizado.id_cliente}` : ' sin cliente asignado'}`);
        return vehiculoActualizado;
      } else {
        throw new Error('Formato de respuesta inválido');
      }
    } catch (error) {
      console.error(`Error al actualizar vehículo ${id}:`, error);
      throw error;
    }
  },

  /**
   * Elimina un vehículo
   * @param id ID del vehículo a eliminar
   * @returns Promise void
   */
  delete: async (id: number): Promise<void> => {
    try {
      await api.delete(`/vehiculos/${id}`);
      
      // Si la eliminación es exitosa, actualiza la caché
      vehiculosCache = vehiculosCache.filter(v => v.id !== id);
      
      // Guardamos en localStorage como respaldo
      saveVehiculosToStorage(vehiculosCache);
      
      console.log(`Vehículo ${id} eliminado correctamente`);
    } catch (error) {
      console.error(`Error al eliminar vehículo ${id}:`, error);
      throw error;
    }
  },

  /**
   * Elimina todos los vehículos que no tienen piezas asociadas
   * @returns Promise que se resuelve cuando todos los vehículos disponibles han sido eliminados
   */
  deleteAll: async (): Promise<{
    message: string;
    vehiculosEliminados: number;
    errores: number;
    totalProcesados: number;
    detallesErrores: Array<{id: number; error: string}>;
  }> => {
    try {
      const response = await api.delete('/vehiculos/delete-all');
      
      if (response.data && typeof response.data.vehiculosEliminados === 'number') {
        // Limpiamos la caché
        vehiculosCache = [];
        
        // Actualizamos el localStorage
        saveVehiculosToStorage(vehiculosCache);
        
        console.log(`Todos los vehículos disponibles eliminados correctamente`);
        
        return response.data;
      } else {
        throw new Error('Formato de respuesta inválido');
      }
    } catch (error) {
      console.error('Error al eliminar todos los vehículos:', error);
      throw error;
    }
  },
};
