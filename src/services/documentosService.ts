import api from './api';

export interface Documento {
  id: number;
  id_pieza: number;
  pieza?: any; // Relación con Pieza
  nombre: string;
  tipo: string;
  url: string;
  fecha_subida: string;
  tamanio: number;
}

export const documentosService = {
  /**
   * Obtiene todos los documentos de una pieza
   * @param piezaId ID de la pieza
   * @returns Promise con array de documentos
   */
  getByPiezaId: async (piezaId: number): Promise<Documento[]> => {
    const response = await api.get(`/documentos?id_pieza=${piezaId}`);
    return response.data;
  },

  /**
   * Obtiene un documento por su ID
   * @param id ID del documento
   * @returns Promise con el documento
   */
  getById: async (id: number): Promise<Documento> => {
    const response = await api.get(`/documentos/${id}`);
    return response.data;
  },

  /**
   * Sube un nuevo documento para una pieza
   * @param piezaId ID de la pieza
   * @param formData FormData con el archivo y metadatos
   * @returns Promise con el documento creado
   */
  upload: async (piezaId: number, formData: FormData): Promise<Documento> => {
    console.log(`Subiendo documento para pieza ${piezaId}`, formData);
    try {
      const response = await api.post(`/documentos/upload/${piezaId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error al subir documento:', error);
      throw error;
    }
  },

  /**
   * Elimina un documento
   * @param id ID del documento a eliminar
   * @returns Promise con respuesta de confirmación
   */
  delete: async (id: number): Promise<void> => {
    await api.delete(`/documentos/${id}`);
  }
};
