import api from './api';
import { Pedido } from '@/types';

export const pedidosService = {
  /**
   * Obtiene todos los pedidos
   * @returns Promise con array de pedidos
   */
  getAll: async (): Promise<Pedido[]> => {
    const response = await api.get('/pedidos');
    return response.data;
  },

  /**
   * Obtiene pedidos por ID de cliente
   * @param clienteId ID del cliente
   * @returns Promise con array de pedidos del cliente
   */
  getByClienteId: async (clienteId: number): Promise<Pedido[]> => {
    const response = await api.get(`/pedidos?id_cliente=${clienteId}`);
    return response.data;
  },

  /**
   * Obtiene pedidos por ID de pieza
   * @param piezaId ID de la pieza
   * @returns Promise con array de pedidos que contienen la pieza
   */
  getByPiezaId: async (piezaId: number): Promise<Pedido[]> => {
    const response = await api.get(`/pedidos?id_pieza=${piezaId}`);
    return response.data;
  },

  /**
   * Obtiene un pedido por su ID
   * @param id ID del pedido
   * @returns Promise con el pedido
   */
  getById: async (id: number): Promise<Pedido> => {
    const response = await api.get(`/pedidos/${id}`);
    return response.data;
  },

  /**
   * Crea un nuevo pedido
   * @param pedido Datos del pedido a crear
   * @returns Promise con el pedido creado
   */
  create: async (pedido: Omit<Pedido, 'id'>): Promise<Pedido> => {
    const response = await api.post('/pedidos', pedido);
    return response.data;
  },

  /**
   * Actualiza un pedido existente
   * @param id ID del pedido
   * @param pedido Datos actualizados del pedido
   * @returns Promise con el pedido actualizado
   */
  update: async (id: number, pedido: Partial<Pedido>): Promise<Pedido> => {
    const response = await api.put(`/pedidos/${id}`, pedido);
    return response.data;
  },

  /**
   * Elimina un pedido
   * @param id ID del pedido a eliminar
   * @returns Promise con respuesta de confirmación
   */
  delete: async (id: number): Promise<void> => {
    await api.delete(`/pedidos/${id}`);
  }
};
