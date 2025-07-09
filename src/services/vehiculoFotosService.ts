import api from './api';

export interface VehiculoFoto {
  id: number;
  id_vehiculo: number;
  url: string;
  nombre: string;
  descripcion: string | null;
  fecha_subida: string;
  tamanio: number;
  es_principal: boolean;
}

// Almacenamiento temporal en memoria mientras se implementa el backend
const tempStorage: Record<number, VehiculoFoto[]> = {};
let nextId = 1;

// Función para simular retraso de red
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const vehiculoFotosService = {
  /**
   * Obtiene todas las fotos de un vehículo
   * @param vehiculoId ID del vehículo
   * @returns Promise con array de fotos
   */
  getByVehiculoId: async (vehiculoId: number): Promise<VehiculoFoto[]> => {
    try {
      // Intentar obtener del backend
      const response = await api.get(`/vehiculos/${vehiculoId}/fotos`);
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
   * Obtiene una foto por su ID
   * @param id ID de la foto
   * @returns Promise con la foto
   */
  getById: async (id: number): Promise<VehiculoFoto> => {
    try {
      const response = await api.get(`/vehiculos/fotos/${id}`);
      return response.data;
    } catch (error) {
      console.warn('Backend endpoint no disponible, usando almacenamiento temporal', error);
      // Buscar en el almacenamiento temporal
      for (const vehiculoId in tempStorage) {
        const foto = tempStorage[Number(vehiculoId)]?.find(f => f.id === id);
        if (foto) return foto;
      }
      throw new Error('Foto no encontrada');
    }
  },

  /**
   * Sube una nueva foto para un vehículo
   * @param vehiculoId ID del vehículo
   * @param formData FormData con la imagen y metadatos
   * @returns Promise con la foto creada
   */
  upload: async (vehiculoId: number, formData: FormData): Promise<VehiculoFoto> => {
    try {
      const response = await api.post(`/vehiculos/${vehiculoId}/fotos/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.warn('Backend endpoint no disponible, usando almacenamiento temporal', error);
      // Simular retraso de red
      await delay(500);
      
      // Crear una foto temporal
      const file = formData.get('file') as File;
      const nombre = formData.get('nombre') as string || file?.name || 'foto.jpg';
      
      // Generar URL temporal para simular la imagen
      const tempUrl = file ? URL.createObjectURL(file) : `https://via.placeholder.com/300?text=${encodeURIComponent(nombre)}`;
      
      // Crear registro temporal
      const newFoto: VehiculoFoto = {
        id: nextId++,
        id_vehiculo: vehiculoId,
        url: tempUrl,
        nombre: nombre,
        descripcion: null,
        fecha_subida: new Date().toISOString(),
        tamanio: file?.size || 0,
        es_principal: false
      };
      
      // Guardar en almacenamiento temporal
      if (!tempStorage[vehiculoId]) {
        tempStorage[vehiculoId] = [];
      }
      tempStorage[vehiculoId].push(newFoto);
      
      return newFoto;
    }
  },

  /**
   * Establece una foto como principal para el vehículo
   * @param id ID de la foto
   * @returns Promise con la foto actualizada
   */
  setAsPrincipal: async (id: number): Promise<VehiculoFoto> => {
    try {
      const response = await api.put(`/vehiculos/fotos/${id}/principal`);
      return response.data;
    } catch (error) {
      console.warn('Backend endpoint no disponible, usando almacenamiento temporal', error);
      // Simular retraso de red
      await delay(300);
      
      // Buscar la foto y su vehículo
      let targetFoto: VehiculoFoto | null = null;
      let vehiculoId: number | null = null;
      
      for (const vId in tempStorage) {
        const numVId = Number(vId);
        const foto = tempStorage[numVId]?.find(f => f.id === id);
        if (foto) {
          targetFoto = foto;
          vehiculoId = numVId;
          break;
        }
      }
      
      if (!targetFoto || vehiculoId === null) {
        throw new Error('Foto no encontrada');
      }
      
      // Actualizar todas las fotos del vehículo
      tempStorage[vehiculoId] = tempStorage[vehiculoId].map(f => ({
        ...f,
        es_principal: f.id === id
      }));
      
      // Devolver la foto actualizada
      return { ...targetFoto, es_principal: true };
    }
  },

  /**
   * Actualiza los metadatos de una foto
   * @param id ID de la foto
   * @param data Datos a actualizar
   * @returns Promise con la foto actualizada
   */
  update: async (id: number, data: Partial<VehiculoFoto>): Promise<VehiculoFoto> => {
    try {
      const response = await api.put(`/vehiculos/fotos/${id}`, data);
      return response.data;
    } catch (error) {
      console.warn('Backend endpoint no disponible, usando almacenamiento temporal', error);
      // Simular retraso de red
      await delay(300);
      
      // Buscar la foto y su vehículo
      let vehiculoId: number | null = null;
      
      for (const vId in tempStorage) {
        const numVId = Number(vId);
        const fotoIndex = tempStorage[numVId]?.findIndex(f => f.id === id);
        if (fotoIndex !== undefined && fotoIndex >= 0) {
          // Actualizar la foto
          tempStorage[numVId][fotoIndex] = {
            ...tempStorage[numVId][fotoIndex],
            ...data
          };
          return tempStorage[numVId][fotoIndex];
        }
      }
      
      throw new Error('Foto no encontrada');
    }
  },

  /**
   * Elimina una foto
   * @param id ID de la foto a eliminar
   * @returns Promise con respuesta de confirmación
   */
  delete: async (id: number): Promise<void> => {
    try {
      await api.delete(`/vehiculos/fotos/${id}`);
    } catch (error) {
      console.warn('Backend endpoint no disponible, usando almacenamiento temporal', error);
      // Simular retraso de red
      await delay(300);
      
      // Eliminar la foto del almacenamiento temporal
      for (const vehiculoId in tempStorage) {
        const numVId = Number(vehiculoId);
        const index = tempStorage[numVId]?.findIndex(f => f.id === id);
        if (index !== undefined && index >= 0) {
          tempStorage[numVId].splice(index, 1);
          return;
        }
      }
    }
  }
};
