import axios from 'axios';
import { API_URL } from '../config';
import { Vehiculo } from '@/types';

export interface VehiculoCampa {
  id: number;
  fecha_asignacion: string;
  estado: string;
  vehiculo: Vehiculo;
}

export interface Campa {
  id: number;
  nombre: string;
  direccion: string;
  ubicacion_gps?: string | null;
  capacidad_maxima: number;
  ocupacion_actual?: number; // Calculado en el backend
  estado: string;
  observaciones?: string | null;
  fecha_creacion: string; // Se recibirá como string
  vehiculos?: VehiculoCampa[];
}

export type CampaFormData = Omit<Campa, 'id' | 'fecha_creacion' | 'vehiculos' | 'ocupacion_actual'>;

class CampasService {
  async getAll(): Promise<Campa[]> {
    try {
      const response = await axios.get(`${API_URL}/campas`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener las campas:', error);
      throw error;
    }
  }

  async getById(id: number): Promise<Campa> {
    try {
      const response = await axios.get(`${API_URL}/campas/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener la campa con ID ${id}:`, error);
      throw error;
    }
  }

  async create(data: CampaFormData): Promise<Campa> {
    try {
      const response = await axios.post(`${API_URL}/campas`, data);
      return response.data;
    } catch (error) {
      console.error('Error al crear la campa:', error);
      throw error;
    }
  }

  async update(id: number, data: CampaFormData): Promise<Campa> {
    try {
      const response = await axios.put(`${API_URL}/campas/${id}`, data);
      return response.data;
    } catch (error) {
      console.error(`Error al actualizar la campa con ID ${id}:`, error);
      throw error;
    }
  }

  async delete(id: number): Promise<void> {
    try {
      await axios.delete(`${API_URL}/campas/${id}`);
    } catch (error) {
      console.error(`Error al eliminar la campa con ID ${id}:`, error);
      throw error;
    }
  }
}

export const campasService = new CampasService();
