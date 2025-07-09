import api from './api';

export interface VehiculoDocumento {
  id: number;
  id_vehiculo: number;
  nombre: string;
  tipo: string;
  url: string;
  fecha_subida: string;
  tamanio: number;
}

// Almacenamiento temporal en memoria mientras se implementa el backend
const tempStorage: Record<number, VehiculoDocumento[]> = {};
let nextId = 1;

// Función para simular retraso de red
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Función para determinar el tipo de documento según la extensión
const getDocumentType = (filename: string): string => {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  
  if (['pdf'].includes(ext)) return 'PDF';
  if (['doc', 'docx'].includes(ext)) return 'Word';
  if (['xls', 'xlsx'].includes(ext)) return 'Excel';
  if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) return 'Imagen';
  if (['txt'].includes(ext)) return 'Texto';
  
  return 'Otro';
};

export const vehiculoDocumentosService = {
  /**
   * Obtiene todos los documentos de un vehículo
   * @param vehiculoId ID del vehículo
   * @returns Promise con array de documentos
   */
  getByVehiculoId: async (vehiculoId: number): Promise<VehiculoDocumento[]> => {
    try {
      // Intentar obtener del backend
      const response = await api.get(`/vehiculos/${vehiculoId}/documentos`);
      return response.data;
    } catch (error) {
      console.warn('Backend endpoint no disponible, usando almacenamiento temporal', error);
      // Simular retraso de red
      await delay(300);
      // Devolver datos del almacenamiento temporal
      return tempStorage[vehiculoId] || [];
    }
  },

  /**
   * Obtiene un documento por su ID
   * @param id ID del documento
   * @returns Promise con el documento
   */
  getById: async (id: number): Promise<VehiculoDocumento> => {
    try {
      const response = await api.get(`/vehiculos/documentos/${id}`);
      return response.data;
    } catch (error) {
      console.warn('Backend endpoint no disponible, usando almacenamiento temporal', error);
      // Buscar en el almacenamiento temporal
      for (const vehiculoId in tempStorage) {
        const documento = tempStorage[Number(vehiculoId)]?.find(d => d.id === id);
        if (documento) return documento;
      }
      throw new Error('Documento no encontrado');
    }
  },

  /**
   * Sube un nuevo documento para un vehículo
   * @param vehiculoId ID del vehículo
   * @param formData FormData con el archivo y metadatos
   * @returns Promise con el documento creado
   */
  upload: async (vehiculoId: number, formData: FormData): Promise<VehiculoDocumento> => {
    try {
      const response = await api.post(`/vehiculos/${vehiculoId}/documentos/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.warn('Backend endpoint no disponible, usando almacenamiento temporal', error);
      // Simular retraso de red
      await delay(500);
      
      // Crear un documento temporal
      const file = formData.get('file') as File;
      const nombre = formData.get('nombre') as string || file?.name || 'documento.pdf';
      
      // Determinar tipo de documento
      const tipo = getDocumentType(nombre);
      
      // Generar URL temporal para simular el documento
      const tempUrl = file ? URL.createObjectURL(file) : `https://via.placeholder.com/300?text=${encodeURIComponent(nombre)}`;
      
      // Crear registro temporal
      const newDocumento: VehiculoDocumento = {
        id: nextId++,
        id_vehiculo: vehiculoId,
        nombre: nombre,
        tipo: tipo,
        url: tempUrl,
        fecha_subida: new Date().toISOString(),
        tamanio: file?.size || 0
      };
      
      // Guardar en almacenamiento temporal
      if (!tempStorage[vehiculoId]) {
        tempStorage[vehiculoId] = [];
      }
      tempStorage[vehiculoId].push(newDocumento);
      
      return newDocumento;
    }
  },

  /**
   * Elimina un documento
   * @param id ID del documento a eliminar
   * @returns Promise con respuesta de confirmación
   */
  delete: async (id: number): Promise<void> => {
    try {
      await api.delete(`/vehiculos/documentos/${id}`);
    } catch (error) {
      console.warn('Backend endpoint no disponible, usando almacenamiento temporal', error);
      // Simular retraso de red
      await delay(300);
      
      // Eliminar el documento del almacenamiento temporal
      for (const vehiculoId in tempStorage) {
        const numVId = Number(vehiculoId);
        const index = tempStorage[numVId]?.findIndex(d => d.id === id);
        if (index !== undefined && index >= 0) {
          tempStorage[numVId].splice(index, 1);
          return;
        }
      }
    }
  }
};
