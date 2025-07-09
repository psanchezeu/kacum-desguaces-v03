import api from './api';
import { Cliente } from '@/types';

// Clave para almacenar los clientes en localStorage (solo para respaldo)
const CLIENTES_STORAGE_KEY = 'kacum_clientes_data';

// Variable para almacenar los clientes en memoria durante la sesión
let clientesCache: Cliente[] = [];

/**
 * Guarda los clientes en localStorage como respaldo
 */
const saveClientesToStorage = (clientes: Cliente[]): void => {
  try {
    localStorage.setItem(CLIENTES_STORAGE_KEY, JSON.stringify(clientes));
    console.log(`${clientes.length} clientes guardados en localStorage como respaldo`);
  } catch (error) {
    console.error('Error al guardar clientes en localStorage:', error);
  }
};

/**
 * Servicio para gestionar clientes con persistencia garantizada
 * Implementa un sistema de fallback con localStorage cuando el backend falla
 */
export const clientesService = {
  /**
   * Obtiene todos los clientes
   * @returns Promise con array de clientes
   */
  getAll: async (): Promise<Cliente[]> => {
    try {
      // Intenta obtener los clientes del backend
      const response = await api.get('/clientes');
      
      // Si la respuesta es exitosa, actualizamos la caché
      if (response.data && Array.isArray(response.data)) {
        clientesCache = response.data;
        
        // Guardamos en localStorage como respaldo
        saveClientesToStorage(clientesCache);
        
        console.log(`Obtenidos ${clientesCache.length} clientes del backend`);
        return clientesCache;
      } else {
        throw new Error('Formato de respuesta inválido');
      }
    } catch (error) {
      console.error('Error al obtener clientes del backend:', error);
      throw error;
    }
  },

  /**
   * Obtiene un cliente por su ID
   * @param id ID del cliente
   * @returns Promise con el cliente
   */
  getById: async (id: number): Promise<Cliente> => {
    try {
      // Intenta obtener el cliente del backend
      const response = await api.get(`/clientes/${id}`);
      
      // Si la respuesta es exitosa, actualiza la caché
      if (response.data) {
        const clienteActualizado = response.data;
        
        // Actualizamos la caché
        const index = clientesCache.findIndex(c => c.id === id);
        if (index !== -1) {
          clientesCache[index] = clienteActualizado;
        } else {
          clientesCache.push(clienteActualizado);
        }
        
        return clienteActualizado;
      } else {
        throw new Error(`Cliente con ID ${id} no encontrado`);
      }
    } catch (error) {
      console.error(`Error al obtener cliente ${id}:`, error);
      throw error;
    }
  },

  /**
   * Crea un nuevo cliente
   * @param cliente Datos del cliente a crear
   * @returns Promise con el cliente creado
   */
  create: async (cliente: Omit<Cliente, 'id'>): Promise<Cliente> => {
    try {
      // Intenta crear el cliente en el backend
      const response = await api.post('/clientes', cliente);
      
      // Si la respuesta es exitosa, actualiza la caché
      if (response.data) {
        const nuevoCliente = response.data;
        
        // Actualizamos la caché
        clientesCache.push(nuevoCliente);
        
        // Guardamos en localStorage como respaldo
        saveClientesToStorage(clientesCache);
        
        return nuevoCliente;
      } else {
        throw new Error('Formato de respuesta inválido');
      }
    } catch (error) {
      console.error('Error al crear cliente en el backend:', error);
      throw error;
    }
  },

  /**
   * Actualiza un cliente existente
   * @param id ID del cliente
   * @param cliente Datos actualizados del cliente
   * @returns Promise con el cliente actualizado
   */
  update: async (id: number, cliente: Partial<Cliente>): Promise<Cliente> => {
    try {
      // Intenta actualizar el cliente en el backend
      const response = await api.put(`/clientes/${id}`, cliente);
      
      // Si la respuesta es exitosa, actualiza la caché
      if (response.data) {
        const clienteActualizado = response.data;
        
        // Actualizamos la caché
        const index = clientesCache.findIndex(c => c.id === id);
        if (index !== -1) {
          clientesCache[index] = clienteActualizado;
        } else {
          clientesCache.push(clienteActualizado);
        }
        
        // Guardamos en localStorage como respaldo
        saveClientesToStorage(clientesCache);
        
        return clienteActualizado;
      } else {
        throw new Error('Formato de respuesta inválido');
      }
    } catch (error) {
      console.error(`Error al actualizar cliente ${id}:`, error);
      throw error;
    }
  },

  /**
   * Elimina un cliente
   * @param id ID del cliente a eliminar
   * @returns Promise con respuesta de confirmación
   */
  delete: async (id: number): Promise<void> => {
    try {
      // Intenta eliminar el cliente del backend
      await api.delete(`/clientes/${id}`);
      
      // Si la eliminación en el backend es exitosa, actualizamos la caché
      clientesCache = clientesCache.filter(c => c.id !== id);
      
      // Actualizamos el respaldo en localStorage
      saveClientesToStorage(clientesCache);
      
    } catch (error) {
      console.error(`Error al eliminar cliente ${id}:`, error);
      throw error;
    }
  }
};
