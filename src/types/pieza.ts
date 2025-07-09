export interface Pieza {
  id: number;
  nombre: string;
  descripcion?: string;
  precio: number;
  stock: number;
  estado?: string;
  imagen_url?: string;
  categoria?: string;
  id_vehiculo?: number;
  datos_adicionales?: {
    marca?: string;
    modelo?: string;
    version?: string;
    anio?: string;
    año?: string;
    combustible?: string;
    kilometraje?: number;
    color?: string;
    bastidor?: string;
    matricula?: string;
    [key: string]: any;
  } | null;
  notas?: string;
  especificaciones?: string;
  compatibilidad?: string;
  fecha_creacion?: string;
  fecha_actualizacion?: string;
}
