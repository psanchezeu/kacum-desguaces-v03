import { vehiculosService } from './vehiculosService';
import { piezasService } from './piezasService';
import { fotosService, Foto } from './fotosService';
import { Vehiculo } from '@/types';

// Extender el tipo Vehiculo para incluir múltiples imágenes
export interface VehiculoConImagenes extends Vehiculo {
  imagenes?: Foto[];
}

/**
 * Servicio para gestionar los vehículos de origen y sus piezas asociadas
 */
export const vehiculosOrigenService = {
  /**
   * Obtiene las últimas imágenes para el vehículo a partir de sus piezas asociadas
   * @param vehiculoId ID del vehículo
   * @param limite Número máximo de imágenes a devolver (por defecto 3)
   * @returns Promise con array de fotos ordenadas por fecha (más recientes primero)
   */
  async getImagenesVehiculo(vehiculoId: number, limite: number = 3): Promise<Foto[]> {
    try {
      console.log(`Obteniendo imágenes para el vehículo ${vehiculoId}`);
      
      // Obtener piezas asociadas al vehículo
      const piezas = await piezasService.getByVehiculoId(vehiculoId);
      
      // Si no hay piezas, devolver array vacío
      if (!piezas || piezas.length === 0) {
        console.log(`No se encontraron piezas para el vehículo ${vehiculoId}`);
        return [];
      }
      
      console.log(`Encontradas ${piezas.length} piezas para el vehículo ${vehiculoId}`);
      
      // Recolectar todas las fotos de todas las piezas
      let todasLasFotos: Foto[] = [];
      
      for (const pieza of piezas) {
        try {
          // Asegurarnos de que pieza.id existe y es válido
          if (!pieza || !pieza.id) {
            console.warn('Pieza inválida o sin ID, omitiendo:', pieza);
            continue;
          }
          
          const fotosPieza = await fotosService.getByPiezaId(pieza.id);
          if (fotosPieza && fotosPieza.length > 0) {
            todasLasFotos = [...todasLasFotos, ...fotosPieza];
          }
        } catch (err) {
          console.warn(`Error al obtener fotos para pieza ${pieza.id}:`, err);
        }
      }
      
      // Si hay fotos, ordenarlas por fecha de subida (más reciente primero)
      if (todasLasFotos.length > 0) {
        todasLasFotos.sort((a, b) => {
          // Convertir fechas a objetos Date para comparación
          const fechaA = new Date(a.fecha_subida).getTime();
          const fechaB = new Date(b.fecha_subida).getTime();
          return fechaB - fechaA; // Orden descendente (más reciente primero)
        });
        
        // Devolver las fotos más recientes limitadas por el parámetro
        return todasLasFotos.slice(0, limite);
      }
      
      // Si llegamos aquí, no se encontró ninguna foto
      return [];
    } catch (error) {
      console.error(`Error al obtener imágenes para vehículo ${vehiculoId}:`, error);
      return [];
    }
  },
  
  /**
   * Obtiene una imagen para el vehículo a partir de sus piezas asociadas
   * @param vehiculoId ID del vehículo
   * @returns Promise con la URL de la imagen o null
   */
  async getImagenVehiculo(vehiculoId: number): Promise<string | null> {
    try {
      const imagenes = await this.getImagenesVehiculo(vehiculoId, 1);
      return imagenes.length > 0 ? imagenes[0].url : null;
    } catch (error) {
      console.error(`Error al obtener imagen para vehículo ${vehiculoId}:`, error);
      return null;
    }
  },

  /**
   * Obtiene todos los vehículos con información adicional para la vista de origen
   * @param page Número de página (1 por defecto)
   * @param limit Límite de elementos por página (15 por defecto)
   * @returns Promise con array de vehículos enriquecidos y datos de paginación
   */
  async getAll(page: number = 1, limit: number = 15): Promise<{items: Vehiculo[], pagination: {page: number, limit: number, total: number, totalPages: number}}> {
    try {
      console.log(`Obteniendo vehículos de origen (página ${page}, límite ${limit})...`);
      
      // Obtener todos los vehículos con paginación
      const vehiculosResponse = await vehiculosService.getAll({page, limit, count: true});
      const vehiculos = vehiculosResponse.data || [];
      console.log(`Obtenidos ${vehiculos.length} vehículos del backend (página ${page}/${vehiculosResponse.pagination?.totalPages || 1})`);
      
      if (vehiculos.length === 0 && page === 1) {
        console.warn('No se encontraron vehículos en el backend. Verifica que el servidor esté funcionando correctamente.');
        return {
          items: [],
          pagination: {
            page: page,
            limit: limit,
            total: 0,
            totalPages: 0
          }
        };
      }
      
      // IMPLEMENTACIÓN INSPIRADA EN RECAMBIOS: Cargar imágenes y piezas al mismo tiempo
      // Esto acelera significativamente la carga porque se hace todo en paralelo
      
      // 1. Preparar todas las promesas para obtener piezas para cada vehículo
      const piezasPromises = vehiculos.map(vehiculo => 
        piezasService.getByVehiculoId(vehiculo.id)
          .then(piezas => ({ vehiculoId: vehiculo.id, piezas: piezas || [] }))
          .catch(() => ({ vehiculoId: vehiculo.id, piezas: [] }))
      );
      
      // 2. Resolverlas todas en paralelo
      const piezasPorVehiculo = await Promise.all(piezasPromises);
      
      // 3. Crear un mapa para acceso rápido
      const piezasMap = new Map<number, any[]>();
      piezasPorVehiculo.forEach(({ vehiculoId, piezas }) => {
        piezasMap.set(vehiculoId, piezas);
      });
      
      // 4. Para cada vehículo, obtener su imagen principal (en paralelo)
      const vehiculosConDatos = await Promise.all(vehiculos.map(async vehiculo => {
        // Obtener las piezas del mapa
        const piezas = piezasMap.get(vehiculo.id) || [];
        
        // Buscar si alguna pieza tiene fotos
        let imagen_url = '/assets/logo-kacum.svg'; // Valor por defecto
        const piezasConPotencialFoto = piezas.filter(p => p && p.id);
        
        if (piezasConPotencialFoto.length > 0) {
          // Tomar la pieza más reciente primero (asumiendo que es la de mejor calidad)
          // Nota: Aquí podríamos ordenar por fecha si fuera necesario
          const piezasFotos = await fotosService.getByPiezaId(piezasConPotencialFoto[0].id);
          if (piezasFotos && piezasFotos.length > 0) {
            imagen_url = piezasFotos[0].url;
          }
        }
        
        // Devolver el vehículo enriquecido
        return {
          ...vehiculo,
          bastidor: vehiculo.vin || '', // Alias para compatibilidad 
          kilometraje: vehiculo.kilometros || 0, // Alias para compatibilidad
          num_piezas: piezas.length,
          imagen_url: imagen_url
        };
      }));
      
      console.log(`Procesados ${vehiculosConDatos.length} vehículos con imágenes para la página ${page}`);
      
      // Devolver los vehículos ya enriquecidos con todas sus imágenes y datos
      return {
        items: vehiculosConDatos as Vehiculo[],
        pagination: {
          page: vehiculosResponse.pagination?.page || page,
          limit: vehiculosResponse.pagination?.limit || limit,
          total: vehiculosResponse.pagination?.total || vehiculosConDatos.length,
          totalPages: vehiculosResponse.pagination?.totalPages || Math.ceil(vehiculosConDatos.length / limit)
        }
      };
    } catch (error) {
      console.error('Error al obtener vehículos de origen:', error);
      // Mostrar un mensaje más descriptivo en la consola
      if (error.code === 'ECONNABORTED' || !error.response) {
        console.error('No se pudo conectar con el servidor backend. Verifica que esté en ejecución.');
      }
      return {
        items: [],
        pagination: {
          page: page,
          limit: limit,
          total: 0,
          totalPages: 0
        }
      };
    }
  },

  /**
   * Obtiene un vehículo por su ID con información adicional para la vista de origen
   * @param id ID del vehículo
   * @returns Promise con el vehículo enriquecido o null si no existe
   */
  async getById(id: number): Promise<VehiculoConImagenes | null> {
    try {
      // Obtener el vehículo
      const vehiculo = await vehiculosService.getById(id);
      
      if (!vehiculo) return null;
      
      // Obtener piezas asociadas al vehículo
      const piezas = await piezasService.getByVehiculoId(vehiculo.id);
      
      // Obtener las 3 últimas imágenes del vehículo
      const imagenes = await this.getImagenesVehiculo(vehiculo.id, 3);
      
      // Intentar obtener una imagen del vehículo a partir de sus piezas
      let imagenUrl = vehiculo.datos_adicionales?.imagen_url;
      
      // Si no hay imagen en datos_adicionales, usar la primera de las imágenes obtenidas
      if (!imagenUrl && imagenes.length > 0) {
        imagenUrl = imagenes[0].url;
      }
      
      // Enriquecer el vehículo con datos adicionales
      return {
        ...vehiculo,
        bastidor: vehiculo.vin, // Alias para compatibilidad
        kilometraje: vehiculo.kilometros, // Alias para compatibilidad
        num_piezas: piezas.length, // Número de piezas asociadas
        imagen_url: imagenUrl || '/assets/logo-kacum.svg',
        imagenes: imagenes.length > 0 ? imagenes : undefined,
      };
    } catch (error) {
      console.error(`Error al obtener vehículo de origen ${id}:`, error);
      return null;
    }
  },

  /**
   * Filtra vehículos por marca
   * @param marca Marca del vehículo
   * @param page Número de página (1 por defecto)
   * @param limit Límite de elementos por página (15 por defecto)
   * @returns Promise con array de vehículos filtrados y datos de paginación
   */
  async filtrarPorMarca(marca: string, page: number = 1, limit: number = 15): Promise<{items: Vehiculo[], pagination: {page: number, limit: number, total: number, totalPages: number}}> {
    try {
      if (!marca) return this.getAll(page, limit);
      
      // Obtenemos todos los vehículos paginados
      const response = await vehiculosService.getAll({ page, limit });
      
      // Filtramos por marca en el lado del cliente (hasta que el backend soporte filtros)
      const filtrados = response.data ? response.data.filter(v => 
        v.marca.toLowerCase().includes(marca.toLowerCase())
      ) : [];
      
      // Calculamos la paginación manual
      const startIndex = 0; // Ya tenemos la página correcta del backend
      const endIndex = Math.min(filtrados.length, limit);
      const paginatedItems = filtrados.slice(startIndex, endIndex);
      
      // Enriquecer cada vehículo con su imagen principal
      const vehiculosConImagen = await Promise.all(
        paginatedItems.map(async (vehiculo) => {
          try {
            // Solo obtener la imagen principal para mejorar rendimiento
            const imagenUrl = await this.getImagenVehiculo(vehiculo.id);
            return {
              ...vehiculo,
              imagenUrl
            };
          } catch (err) {
            console.warn(`Error al obtener imagen para vehículo ${vehiculo.id}:`, err);
            return vehiculo;
          }
        })
      );
      
      // Aseguramos que los valores de paginación sean números definidos
      const total = filtrados.length;
      const totalPages = Math.ceil(total / limit) || 1;
      
      return {
        items: vehiculosConImagen,
        pagination: {
          page,
          limit,
          total,
          totalPages
        }
      };
    } catch (error) {
      console.error(`Error al filtrar vehículos por marca "${marca}":`, error);
      return {
        items: [],
        pagination: {
          page: page,
          limit: limit,
          total: 0,
          totalPages: 0
        }
      };
    }
  },

  /**
   * Filtra vehículos por modelo
   * @param modelo Modelo del vehículo
   * @param page Número de página (1 por defecto)
   * @param limit Límite de elementos por página (15 por defecto)
   * @returns Promise con array de vehículos filtrados y datos de paginación
   */
  async filtrarPorModelo(modelo: string, page: number = 1, limit: number = 15): Promise<{items: Vehiculo[], pagination: {page: number, limit: number, total: number, totalPages: number}}> {
    try {
      if (!modelo) return this.getAll(page, limit);
      
      // Obtenemos todos los vehículos paginados
      const response = await vehiculosService.getAll({ page, limit });
      
      // Filtramos por modelo en el lado del cliente (hasta que el backend soporte filtros)
      const filtrados = response.data ? response.data.filter(v => 
        v.modelo.toLowerCase().includes(modelo.toLowerCase())
      ) : [];
      
      // Calculamos la paginación manual
      const startIndex = 0; // Ya tenemos la página correcta del backend
      const endIndex = Math.min(filtrados.length, limit);
      const paginatedItems = filtrados.slice(startIndex, endIndex);
      
      // Enriquecer cada vehículo con su imagen principal
      const vehiculosConImagen = await Promise.all(
        paginatedItems.map(async (vehiculo) => {
          try {
            // Solo obtener la imagen principal para mejorar rendimiento
            const imagenUrl = await this.getImagenVehiculo(vehiculo.id);
            return {
              ...vehiculo,
              imagenUrl
            };
          } catch (err) {
            console.warn(`Error al obtener imagen para vehículo ${vehiculo.id}:`, err);
            return vehiculo;
          }
        })
      );
      
      // Aseguramos que los valores de paginación sean números definidos
      const total = filtrados.length;
      const totalPages = Math.ceil(total / limit) || 1;
      
      return {
        items: vehiculosConImagen,
        pagination: {
          page,
          limit,
          total,
          totalPages
        }
      };
    } catch (error) {
      console.error(`Error al filtrar vehículos por modelo "${modelo}":`, error);
      return {
        items: [],
        pagination: {
          page: page,
          limit: limit,
          total: 0,
          totalPages: 0
        }
      };
    }
  },

  /**
   * Filtra vehículos por año de fabricación
   * @param anio Año de fabricación
   * @param page Número de página (1 por defecto)
   * @param limit Límite de elementos por página (15 por defecto)
   * @returns Promise con array de vehículos filtrados y datos de paginación
   */
  async filtrarPorAnio(anio: number, page: number = 1, limit: number = 15): Promise<{items: Vehiculo[], pagination: {page: number, limit: number, total: number, totalPages: number}}> {
    try {
      if (!anio) return this.getAll(page, limit);
      
      // Obtenemos todos los vehículos paginados
      const response = await vehiculosService.getAll({ page, limit });
      
      // Filtramos por año en el lado del cliente (hasta que el backend soporte filtros)
      const filtrados = response.data ? response.data.filter(v => 
        v.anio_fabricacion === anio
      ) : [];
      
      // Calculamos la paginación manual
      const startIndex = 0; // Ya tenemos la página correcta del backend
      const endIndex = Math.min(filtrados.length, limit);
      const paginatedItems = filtrados.slice(startIndex, endIndex);
      
      // Enriquecer cada vehículo con su imagen principal
      const vehiculosConImagen = await Promise.all(
        paginatedItems.map(async (vehiculo) => {
          try {
            // Solo obtener la imagen principal para mejorar rendimiento
            const imagenUrl = await this.getImagenVehiculo(vehiculo.id);
            return {
              ...vehiculo,
              imagenUrl
            };
          } catch (err) {
            console.warn(`Error al obtener imagen para vehículo ${vehiculo.id}:`, err);
            return vehiculo;
          }
        })
      );
      
      // Aseguramos que los valores de paginación sean números definidos
      const total = filtrados.length;
      const totalPages = Math.ceil(total / limit) || 1;
      
      return {
        items: vehiculosConImagen,
        pagination: {
          page,
          limit,
          total,
          totalPages
        }
      };
    } catch (error) {
      console.error(`Error al filtrar vehículos por año ${anio}:`, error);
      return {
        items: [],
        pagination: {
          page: page,
          limit: limit,
          total: 0,
          totalPages: 0
        }
      };
    }
  },

  /**
   * Filtra vehículos por tipo de combustible
   * @param combustible Tipo de combustible
   * @param page Número de página (1 por defecto)
   * @param limit Límite de elementos por página (15 por defecto)
   * @returns Promise con array de vehículos filtrados y datos de paginación
   */
  async filtrarPorCombustible(combustible: string, page: number = 1, limit: number = 15): Promise<{items: Vehiculo[], pagination: {page: number, limit: number, total: number, totalPages: number}}> {
    try {
      if (!combustible) return this.getAll(page, limit);
      
      // Obtenemos todos los vehículos paginados
      const response = await vehiculosService.getAll({ page, limit });
      
      // Filtramos por combustible en el lado del cliente (hasta que el backend soporte filtros)
      const filtrados = response.data ? response.data.filter(v => 
        v.tipo_combustible?.toLowerCase() === combustible.toLowerCase()
      ) : [];
      
      // Calculamos la paginación manual
      const startIndex = 0; // Ya tenemos la página correcta del backend
      const endIndex = Math.min(filtrados.length, limit);
      const paginatedItems = filtrados.slice(startIndex, endIndex);
      
      // Enriquecer cada vehículo con su imagen principal
      const vehiculosConImagen = await Promise.all(
        paginatedItems.map(async (vehiculo) => {
          try {
            // Solo obtener la imagen principal para mejorar rendimiento
            const imagenUrl = await this.getImagenVehiculo(vehiculo.id);
            return {
              ...vehiculo,
              imagenUrl
            };
          } catch (err) {
            console.warn(`Error al obtener imagen para vehículo ${vehiculo.id}:`, err);
            return vehiculo;
          }
        })
      );
      
      // Aseguramos que los valores de paginación sean números definidos
      const total = filtrados.length;
      const totalPages = Math.ceil(total / limit) || 1;
      
      return {
        items: vehiculosConImagen,
        pagination: {
          page,
          limit,
          total,
          totalPages
        }
      };
    } catch (error) {
      console.error(`Error al filtrar vehículos por combustible "${combustible}":`, error);
      return {
        items: [],
        pagination: {
          page: page,
          limit: limit,
          total: 0,
          totalPages: 0
        }
      };
    }
  },

  /**
   * Busca vehículos por término de búsqueda en varios campos
   * @param searchTerm Término de búsqueda
   * @param vehiculos Array de vehículos a enriquecer
   * @param page Página actual para registrar en logs
   * @private
   */
  async enriquecerVehiculos(vehiculos: Vehiculo[], page: number): Promise<void> {
    try {
      console.log(`Iniciando enriquecimiento en segundo plano para ${vehiculos.length} vehículos (página ${page})`);
      
      // OPTIMIZACIÓN: Obtener todas las imágenes en un lote
      const vehiculoIds = vehiculos.map(v => v.id);
      const imagenesMap = await this.obtenerImagenesEnLote(vehiculoIds);
      
      // Actualizar imágenes primero (más prioritario para la UI)
      for (const vehiculo of vehiculos) {
        if (imagenesMap.has(vehiculo.id)) {
          vehiculo.imagen_url = imagenesMap.get(vehiculo.id) || '/assets/logo-kacum.svg';
          
          // Notificar actualización de imagen inmediatamente
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('vehiculo-actualizado', { 
              detail: { id: vehiculo.id, vehiculo } 
            }));
          }
        }
      }
      
      // Obtener conteo de piezas en segundo plano
      for (const vehiculo of vehiculos) {
        try {
          const piezasResponse = await piezasService.getByVehiculoId(vehiculo.id);
          vehiculo.num_piezas = piezasResponse?.length || 0;
          
          // Notificar actualización del conteo de piezas
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('vehiculo-actualizado', { 
              detail: { id: vehiculo.id, vehiculo } 
            }));
          }
        } catch (err) {
          console.error(`Error al obtener piezas para vehículo ${vehiculo.id}:`, err);
        }
        
        // Pequeña pausa para no saturar el servidor
        await new Promise(resolve => setTimeout(resolve, 20));
      }
      
      console.log(`Enriquecimiento en segundo plano completado para página ${page}`);
    } catch (error) {
      console.error('Error general en enriquecimiento de vehículos:', error);
    }
  },

  /**
   * Obtiene marcas únicas de vehículos
   * @returns Promise con array de marcas únicas
   */
  async getMarcasUnicas(): Promise<string[]> {
    try {
      const response = await this.getAll();
      const marcasSet = new Set<string>(
        response.items.map(v => v.marca).filter((marca): marca is string => !!marca)
      );
      return Array.from(marcasSet).sort();
    } catch (error) {
      console.error('Error al obtener marcas únicas:', error);
      return [];
    }
  },

  /**
   * Obtiene modelos únicos de vehículos, opcionalmente filtrados por marca
   * @param marca Marca para filtrar modelos (opcional)
   * @returns Promise con array de modelos únicos
   */
  async getModelosUnicos(marca?: string): Promise<string[]> {
    try {
      const response = await this.getAll();
      
      // Filtrar por marca si se proporciona
      let filtrados = response.items;
      if (marca) {
        filtrados = filtrados.filter(v => 
          v.marca.toLowerCase() === marca.toLowerCase()
        );
      }
      
      const modelosSet = new Set<string>(
        filtrados.map(v => v.modelo).filter((modelo): modelo is string => !!modelo)
      );
      return Array.from(modelosSet).sort();
    } catch (error) {
      console.error('Error al obtener modelos únicos:', error);
      return [];
    }
  },

  /**
   * Obtiene años únicos de fabricación de vehículos
   * @returns Promise con array de años únicos
   */
  async getAniosUnicos(): Promise<number[]> {
    try {
      const response = await this.getAll();
      const aniosSet = new Set<number>(
        response.items.map(v => v.anio_fabricacion).filter((anio): anio is number => typeof anio === 'number')
      );
      return Array.from(aniosSet).sort((a, b) => b - a); // Orden descendente
    } catch (error) {
      console.error('Error al obtener años únicos:', error);
      return [];
    }
  },

  /**
   * Obtiene tipos de combustible únicos
   * @returns Promise con array de tipos de combustible únicos
   */
  async getCombustiblesUnicos(): Promise<string[]> {
    try {
      const response = await this.getAll();
      const combustiblesSet = new Set<string>(
        response.items.map(v => v.tipo_combustible).filter((combustible): combustible is string => !!combustible)
      );
      return Array.from(combustiblesSet).sort();
    } catch (error) {
      console.error('Error al obtener combustibles únicos:', error);
      return [];
    }
  }
};
