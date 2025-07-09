import axios from 'axios';
import { API_URL } from '../config';

export interface Grua {
  id: number;
  matricula: string;
  modelo: string;
  capacidad_kg: number;
  conductor_asignado: string;
  estado: string;
  gps_ultimo_punto?: string;
  latitud?: number;
  longitud?: number;
  fecha_ultimo_mantenimiento: Date;
  kilometraje: number;
  itv_estado: string;
  itv_fecha: Date;
  mantenimientos?: MantenimientoGrua[];
  solicitudesRecogida?: any[];
}

export interface MantenimientoGrua {
  id: number;
  id_grua: number;
  tipo: string;
  fecha: Date;
  realizado_por: string;
  url_documento?: string;
}

export interface GruaFormData {
  matricula: string;
  modelo: string;
  capacidad_kg: number;
  conductor_asignado: string;
  estado: string;
  gps_ultimo_punto?: string;
  fecha_ultimo_mantenimiento: string;
  kilometraje: number;
  itv_estado: string;
  itv_fecha: string;
}

export interface MantenimientoFormData {
  tipo: string;
  fecha: string;
  realizado_por: string;
  documento?: File;
}

class GruasService {
  async getAll(): Promise<Grua[]> {
    try {
      const response = await axios.get(`${API_URL}/gruas`);
      return response.data.map((grua: any) => ({
        ...grua,
        fecha_ultimo_mantenimiento: new Date(grua.fecha_ultimo_mantenimiento),
        itv_fecha: new Date(grua.itv_fecha)
      }));
    } catch (error) {
      console.error('Error al obtener grúas:', error);
      throw error;
    }
  }

  async getById(id: number): Promise<Grua> {
    try {
      const response = await axios.get(`${API_URL}/gruas/${id}`);
      const grua = response.data;
      return {
        ...grua,
        fecha_ultimo_mantenimiento: new Date(grua.fecha_ultimo_mantenimiento),
        itv_fecha: new Date(grua.itv_fecha),
        mantenimientos: grua.mantenimientos?.map((m: any) => ({
          ...m,
          fecha: new Date(m.fecha)
        }))
      };
    } catch (error) {
      console.error(`Error al obtener grúa con ID ${id}:`, error);
      throw error;
    }
  }

  async create(data: GruaFormData): Promise<Grua> {
    try {
      const response = await axios.post(`${API_URL}/gruas`, data);
      return {
        ...response.data,
        fecha_ultimo_mantenimiento: new Date(response.data.fecha_ultimo_mantenimiento),
        itv_fecha: new Date(response.data.itv_fecha)
      };
    } catch (error) {
      console.error('Error al crear grúa:', error);
      throw error;
    }
  }

  async update(id: number, data: GruaFormData): Promise<Grua> {
    try {
      const response = await axios.put(`${API_URL}/gruas/${id}`, data);
      return {
        ...response.data,
        fecha_ultimo_mantenimiento: new Date(response.data.fecha_ultimo_mantenimiento),
        itv_fecha: new Date(response.data.itv_fecha)
      };
    } catch (error) {
      console.error(`Error al actualizar grúa con ID ${id}:`, error);
      throw error;
    }
  }

  async delete(id: number): Promise<void> {
    try {
      await axios.delete(`${API_URL}/gruas/${id}`);
    } catch (error) {
      console.error(`Error al eliminar grúa con ID ${id}:`, error);
      throw error;
    }
  }

  // Mantenimientos
  async getMantenimientos(gruaId: number): Promise<MantenimientoGrua[]> {
    try {
      const response = await axios.get(`${API_URL}/gruas/${gruaId}/mantenimientos`);
      return response.data.map((mantenimiento: any) => ({
        ...mantenimiento,
        fecha: new Date(mantenimiento.fecha)
      }));
    } catch (error) {
      console.error(`Error al obtener mantenimientos de la grúa ${gruaId}:`, error);
      throw error;
    }
  }

  async createMantenimiento(gruaId: number, data: MantenimientoFormData): Promise<MantenimientoGrua> {
    try {
      const formData = new FormData();
      formData.append('tipo', data.tipo);
      formData.append('fecha', data.fecha);
      formData.append('realizado_por', data.realizado_por);
      
      if (data.documento) {
        formData.append('documento', data.documento);
      }
      
      const response = await axios.post(
        `${API_URL}/gruas/${gruaId}/mantenimientos`, 
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      return {
        ...response.data,
        fecha: new Date(response.data.fecha)
      };
    } catch (error) {
      console.error(`Error al crear mantenimiento para la grúa ${gruaId}:`, error);
      throw error;
    }
  }

  async deleteMantenimiento(mantenimientoId: number): Promise<void> {
    try {
      await axios.delete(`${API_URL}/gruas/mantenimientos/${mantenimientoId}`);
    } catch (error) {
      console.error(`Error al eliminar mantenimiento con ID ${mantenimientoId}:`, error);
      throw error;
    }
  }
}

export const gruasService = new GruasService();
