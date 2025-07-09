import api from './api';

export interface ConfiguracionGeneral {
  nombre_empresa: string;
  identificacion_fiscal: string;
  direccion: string;
  ciudad: string;
  codigo_postal: string;
  telefono: string;
  email: string;
  sitio_web: string;
  logo_url?: string;
  modo_oscuro: boolean;
}

export interface ConfiguracionNotificaciones {
  email_nuevos_pedidos: boolean;
  email_nuevas_incidencias: boolean;
  email_nuevos_clientes: boolean;
  notif_stock_bajo: boolean;
  notif_seguridad: boolean;
}

export interface ConfiguracionSeguridad {
  autenticacion_doble_factor: boolean;
  longitud_minima_password: number;
  requiere_mayusculas: boolean;
  requiere_numeros: boolean;
  requiere_simbolos: boolean;
  dias_caducidad_password: number;
  intentos_maximos_login: number;
  tiempo_bloqueo_minutos: number;
}

export interface ConfiguracionUsuarios {
  registro_abierto: boolean;
  requiere_aprobacion_admin: boolean;
  tiempo_sesion_minutos: number;
  notificar_nuevos_usuarios: boolean;
  roles_disponibles: string[];
}

export interface ConfiguracionBackup {
  backup_automatico: boolean;
  frecuencia_backup: string; // 'diario' | 'semanal' | 'mensual'
  hora_backup: string;
  dia_semana_backup?: number; // 0-6 (domingo-sábado)
  dia_mes_backup?: number; // 1-31
  mantener_backups: number;
  ubicacion_backup: string;
}

export interface ConfiguracionPermisos {
  permisos_por_rol: Record<string, string[]>;
}

export interface ConfiguracionConexionesAPI {
  api_key_activa: boolean;
  api_key?: string;
  limite_peticiones_por_minuto: number;
  ips_permitidas: string[];
  endpoints_habilitados: string[];
}

export interface ConfiguracionPlantillasVehiculos {
  plantillas_activas: boolean;
  usar_plantilla_por_defecto: boolean;
  plantilla_por_defecto_id?: number;
}

export interface ConfiguracionCampas {
  asignacion_automatica: boolean;
  notificar_capacidad_maxima: boolean;
  porcentaje_alerta_capacidad: number;
  campa_por_defecto_id?: number;
}

export const configuracionService = {
  /**
   * Obtiene todas las configuraciones
   * @returns Promise con todas las configuraciones organizadas por categoría
   */
  getAll: async (): Promise<Record<string, any>> => {
    try {
      const response = await api.get('/configuracion');
      return response.data;
    } catch (error) {
      console.error('Error al obtener configuraciones:', error);
      throw error;
    }
  },

  /**
   * Obtiene las configuraciones de una categoría específica
   * @param categoria Nombre de la categoría
   * @returns Promise con las configuraciones de la categoría
   */
  getByCategoria: async (categoria: string): Promise<Record<string, any>> => {
    try {
      const response = await api.get(`/configuracion/categoria/${categoria}`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener configuraciones de categoría ${categoria}:`, error);
      throw error;
    }
  },

  /**
   * Guarda la configuración general
   * @param config Objeto con la configuración general
   * @returns Promise con la respuesta del servidor
   */
  saveGeneral: async (config: ConfiguracionGeneral): Promise<any> => {
    try {
      const response = await api.put('/configuracion/categoria/general', config);
      return response.data;
    } catch (error) {
      console.error('Error al guardar configuración general:', error);
      throw error;
    }
  },

  /**
   * Guarda la configuración de notificaciones
   * @param config Objeto con la configuración de notificaciones
   * @returns Promise con la respuesta del servidor
   */
  saveNotificaciones: async (config: ConfiguracionNotificaciones): Promise<any> => {
    try {
      const response = await api.put('/configuracion/categoria/notificaciones', config);
      return response.data;
    } catch (error) {
      console.error('Error al guardar configuración de notificaciones:', error);
      throw error;
    }
  },

  /**
   * Guarda la configuración de seguridad
   * @param config Objeto con la configuración de seguridad
   * @returns Promise con la respuesta del servidor
   */
  saveSeguridad: async (config: ConfiguracionSeguridad): Promise<any> => {
    try {
      const response = await api.put('/configuracion/categoria/seguridad', config);
      return response.data;
    } catch (error) {
      console.error('Error al guardar configuración de seguridad:', error);
      throw error;
    }
  },

  /**
   * Guarda la configuración de usuarios
   * @param config Objeto con la configuración de usuarios
   * @returns Promise con la respuesta del servidor
   */
  saveUsuarios: async (config: ConfiguracionUsuarios): Promise<any> => {
    try {
      const response = await api.put('/configuracion/categoria/usuarios', config);
      return response.data;
    } catch (error) {
      console.error('Error al guardar configuración de usuarios:', error);
      throw error;
    }
  },

  /**
   * Guarda la configuración de backup
   * @param config Objeto con la configuración de backup
   * @returns Promise con la respuesta del servidor
   */
  saveBackup: async (config: ConfiguracionBackup): Promise<any> => {
    try {
      const response = await api.put('/configuracion/categoria/backup', config);
      return response.data;
    } catch (error) {
      console.error('Error al guardar configuración de backup:', error);
      throw error;
    }
  },

  /**
   * Guarda la configuración de permisos
   * @param config Objeto con la configuración de permisos
   * @returns Promise con la respuesta del servidor
   */
  savePermisos: async (config: ConfiguracionPermisos): Promise<any> => {
    try {
      const response = await api.put('/configuracion/categoria/permisos', config);
      return response.data;
    } catch (error) {
      console.error('Error al guardar configuración de permisos:', error);
      throw error;
    }
  },

  /**
   * Guarda la configuración de conexiones API
   * @param config Objeto con la configuración de conexiones API
   * @returns Promise con la respuesta del servidor
   */
  saveConexionesAPI: async (config: ConfiguracionConexionesAPI): Promise<any> => {
    try {
      const response = await api.put('/configuracion/categoria/conexiones', config);
      return response.data;
    } catch (error) {
      console.error('Error al guardar configuración de conexiones API:', error);
      throw error;
    }
  },

  /**
   * Guarda la configuración de plantillas de vehículos
   * @param config Objeto con la configuración de plantillas de vehículos
   * @returns Promise con la respuesta del servidor
   */
  savePlantillasVehiculos: async (config: ConfiguracionPlantillasVehiculos): Promise<any> => {
    try {
      const response = await api.put('/configuracion/categoria/plantillas', config);
      return response.data;
    } catch (error) {
      console.error('Error al guardar configuración de plantillas de vehículos:', error);
      throw error;
    }
  },

  /**
   * Guarda la configuración de campas
   * @param config Objeto con la configuración de campas
   * @returns Promise con la respuesta del servidor
   */
  saveCampas: async (config: ConfiguracionCampas): Promise<any> => {
    try {
      const response = await api.put('/configuracion/categoria/campas', config);
      return response.data;
    } catch (error) {
      console.error('Error al guardar configuración de campas:', error);
      throw error;
    }
  },

  /**
   * Sube un logo para la empresa
   * @param file Archivo de imagen del logo
   * @returns Promise con la URL del logo subido
   */
  uploadLogo: async (file: File): Promise<string> => {
    try {
      const formData = new FormData();
      formData.append('logo', file);
      
      const response = await api.post('/configuracion/logo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // Asegurarse de que la URL sea absoluta
      let logoUrl = response.data.url;
      
      // Si la URL no comienza con http o https y no es una ruta absoluta, convertirla
      if (!logoUrl.startsWith('http') && !logoUrl.startsWith('/')) {
        logoUrl = `/${logoUrl}`;
      }
      
      console.log('URL del logo subido:', logoUrl);
      return logoUrl;
    } catch (error) {
      console.error('Error al subir logo:', error);
      throw error;
    }
  }
};
