import api from './api';
import { Pieza } from '@/types';

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total?: number;
    totalPages?: number;
  };
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  count?: boolean;
}

export const piezasService = {
  /**
   * Obtiene todas las piezas
   * @param vehiculoId ID del vehículo
   * @param pagination Parámetros de paginación
   * @returns Promise con array de piezas
   */
  getAll: async (vehiculoId?: number, pagination?: PaginationParams): Promise<PaginatedResponse<Pieza>> => {
    try {
      const params = {
        ...(vehiculoId ? { id_vehiculo: vehiculoId } : {}),
        ...(pagination?.page ? { page: pagination.page } : {}),
        ...(pagination?.limit ? { limit: pagination.limit } : {}),
        ...(pagination?.count !== undefined ? { count: pagination.count } : {}),
      };
      const response = await api.get('/piezas', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching piezas:', error);
      throw error;
    }
  },
  
  /**
   * Elimina todas las piezas
   * @returns Promise con respuesta de confirmación
   */
  deleteAll: async (): Promise<void> => {
    await api.delete('/piezas/delete-all');
  },

  /**
   * Obtiene piezas por ID de vehículo
   * @param vehiculoId ID del vehículo
   * @returns Promise con array de piezas del vehículo
   */
  getByVehiculoId: async (vehiculoId: number): Promise<Pieza[]> => {
    try {
      const response = await api.get(`/piezas?id_vehiculo=${vehiculoId}`);
      
      // Verificar el formato de la respuesta y extraer los datos
      let piezasData: Pieza[] = [];
      if (Array.isArray(response.data)) {
        piezasData = response.data;
      } else if (response.data && Array.isArray(response.data.data)) {
        // Si la respuesta viene en formato paginado
        piezasData = response.data.data;
      } else {
        console.error('Formato de respuesta inesperado en getByVehiculoId:', response.data);
        return [];
      }
      
      // Procesar las piezas para asegurar que tengan los campos correctos
      console.log(`Procesando ${piezasData.length} piezas para el vehículo ${vehiculoId}`);
      
      // Procesar cada pieza para asegurar que tenga los campos necesarios
      const piezasProcesadas = piezasData.map(pieza => {
        try {
          // Crear una propiedad temporal para almacenar los datos adicionales como objeto
          let datosAdicionalesObj: Record<string, any> = {};
          
          // Procesar datos_adicionales si existe y es un string
          if (pieza.datos_adicionales && typeof pieza.datos_adicionales === 'string') {
            try {
              datosAdicionalesObj = JSON.parse(pieza.datos_adicionales);
            } catch (e) {
              console.warn(`Error al parsear datos_adicionales de la pieza ${pieza.id}:`, e);
              // Si no se puede parsear, usar un objeto vacío
              datosAdicionalesObj = {};
            }
          }
          
          // Asegurar que datosAdicionalesObj tenga una referencia
          if (!datosAdicionalesObj.referencia) {
            datosAdicionalesObj.referencia = `REF-${pieza.id}`;
          }
          if (!datosAdicionalesObj.codigo) {
            datosAdicionalesObj.codigo = datosAdicionalesObj.referencia;
          }
          
          // Guardar los datos adicionales procesados de nuevo como string
          pieza.datos_adicionales = JSON.stringify(datosAdicionalesObj);
          
          // Añadir propiedades directamente a la pieza para facilitar su uso en la UI
          // Usamos una propiedad temporal para evitar problemas de tipado
          const piezaExtendida = pieza as any;
          
          // Asignar referencia y código desde datos adicionales
          piezaExtendida.referencia = datosAdicionalesObj.referencia || `REF-${pieza.id}`;
          piezaExtendida.codigo = datosAdicionalesObj.codigo || piezaExtendida.referencia;
          
          // Asignar nombre usando la descripción si no existe
          if (pieza.descripcion) {
            piezaExtendida.nombre = pieza.descripcion;
          } else {
            piezaExtendida.nombre = `Pieza ${pieza.id}`;
          }
          
          // Asignar precio formateado si existe
          if (typeof pieza.precio_venta === 'number') {
            piezaExtendida.precio = pieza.precio_venta;
            piezaExtendida.precio_formateado = `${pieza.precio_venta.toFixed(2)} €`;
          } else {
            piezaExtendida.precio = 0;
            piezaExtendida.precio_formateado = 'Consultar';
          }
          
          return pieza;
        } catch (err) {
          console.error(`Error al procesar la pieza ${pieza.id}:`, err);
          return pieza; // Devolver la pieza original en caso de error
        }
      });
      
      console.log(`Piezas procesadas para el vehículo ${vehiculoId}:`, piezasProcesadas);
      return piezasProcesadas;
    } catch (error) {
      console.error(`Error al obtener piezas del vehículo ${vehiculoId}:`, error);
      return [];
    }
  },

  /**
   * Obtiene una pieza por su ID
   * @param id ID de la pieza
   * @returns Promise con la pieza
   */
  getById: async (id: number): Promise<Pieza> => {
    const response = await api.get(`/piezas/${id}`);
    return response.data;
  },

  /**
   * Crea una nueva pieza
   * @param pieza Datos de la pieza a crear
   * @returns Promise con la pieza creada
   */
  create: async (pieza: Omit<Pieza, 'id'>): Promise<Pieza> => {
    const response = await api.post('/piezas', pieza);
    return response.data;
  },

  /**
   * Actualiza una pieza existente
   * @param id ID de la pieza
   * @param pieza Datos actualizados de la pieza
   * @returns Promise con la pieza actualizada
   */
  update: async (id: number, pieza: Partial<Pieza>): Promise<Pieza> => {
    const response = await api.put(`/piezas/${id}`, pieza);
    return response.data;
  },

  /**
   * Elimina una pieza
   * @param id ID de la pieza a eliminar
   * @returns Promise con respuesta de confirmación
   */
  delete: async (id: number): Promise<void> => {
    await api.delete(`/piezas/${id}`);
  }
};
