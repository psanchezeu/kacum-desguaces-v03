import api from './api';

export interface Foto {
  id: number;
  id_pieza: number;
  pieza?: any; // Relación con Pieza
  url: string;
  nombre: string;
  descripcion: string | null;
  fecha_subida: string;
  tamanio: number;
  es_principal: boolean;
  origen?: string; // 'manual', 'woocommerce', 'bucket', etc.
}

export const fotosService = {
  /**
   * Obtiene todas las fotos de una pieza
   * @param piezaId ID de la pieza
   * @returns Promise con array de fotos
   */
  getByPiezaId: async (piezaId: number): Promise<Foto[]> => {
    const response = await api.get(`/fotos?id_pieza=${piezaId}`);
    return response.data;
  },

  /**
   * Obtiene la foto principal de una pieza
   * @param piezaId ID de la pieza
   * @returns Promise con la foto principal o null si no existe
   */
  getPrincipalByPiezaId: async (piezaId: number): Promise<Foto | null> => {
    try {
      const fotos = await fotosService.getByPiezaId(piezaId);
      return fotos.find(foto => foto.es_principal) || fotos[0] || null;
    } catch (error) {
      console.error(`Error al obtener foto principal de pieza ${piezaId}:`, error);
      return null;
    }
  },

  /**
   * Obtiene una foto por su ID
   * @param id ID de la foto
   * @returns Promise con la foto
   */
  getById: async (id: number): Promise<Foto> => {
    const response = await api.get(`/fotos/${id}`);
    return response.data;
  },

  /**
   * Sube una nueva foto para una pieza
   * @param piezaId ID de la pieza
   * @param formData FormData con la imagen y metadatos
   * @returns Promise con la foto creada
   */
  upload: async (piezaId: number, formData: FormData): Promise<Foto> => {
    console.log(`Subiendo foto para pieza ${piezaId}`, formData);
    
    // Añadir el origen 'manual' al FormData si no existe
    if (!formData.has('origen')) {
      formData.append('origen', 'manual');
    }
    
    try {
      const response = await api.post(`/fotos/upload/${piezaId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error al subir foto:', error);
      throw error;
    }
  },

  /**
   * Establece una foto como principal para la pieza
   * @param id ID de la foto
   * @returns Promise con la foto actualizada
   */
  setAsPrincipal: async (id: number): Promise<Foto> => {
    const response = await api.put(`/fotos/${id}/principal`);
    return response.data;
  },

  /**
   * Actualiza los metadatos de una foto
   * @param id ID de la foto
   * @param data Datos a actualizar
   * @returns Promise con la foto actualizada
   */
  update: async (id: number, data: Partial<Foto>): Promise<Foto> => {
    const response = await api.put(`/fotos/${id}`, data);
    return response.data;
  },

  /**
   * Elimina una foto
   * @param id ID de la foto a eliminar
   * @returns Promise con respuesta de confirmación
   */
  delete: async (id: number): Promise<void> => {
    await api.delete(`/fotos/${id}`);
  }
};
