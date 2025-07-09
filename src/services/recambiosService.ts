import { piezasService } from './piezasService';
import { vehiculosService } from './vehiculosService';
import { fotosService, Foto } from './fotosService';

// Definición del tipo PiezaTienda aquí para evitar problemas de importación
export interface PiezaTienda {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  estado: string;
  imagen_url: string;
  categoria: string;
  id_vehiculo?: number;
  datos_adicionales: Record<string, any>;
  notas: string;
  fecha_creacion: string;
  // Campos adicionales para la vista detalle
  especificaciones?: string[];
  compatibilidad?: string[];
  // Fotos de la pieza
  fotos?: Foto[];
  foto_principal?: Foto | null;
}

import type { Pieza as PiezaOriginal, Vehiculo } from '@/types';

/**
 * Convierte una pieza del formato original al formato de la tienda
 * @param pieza Pieza original del sistema
 * @param vehiculos Lista de vehículos para obtener datos adicionales
 * @param incluirFotos Si es true, incluye las fotos de la pieza
 */
const convertirPieza = async (pieza: PiezaOriginal, vehiculos: Vehiculo[] = [], incluirFotos: boolean = false): Promise<PiezaTienda> => {
  // Intentar encontrar el vehículo asociado a la pieza
  const vehiculo = vehiculos.find(v => v.id === pieza.id_vehiculo);
  
  // Extraer datos adicionales del vehículo si existe
  const datosAdicionales = vehiculo ? {
    marca: vehiculo.marca || '',
    modelo: vehiculo.modelo || '',
    version: vehiculo.version || '',
    anio: vehiculo.anio_fabricacion?.toString() || '',
    combustible: vehiculo.tipo_combustible || '',
    kilometraje: vehiculo.kilometros || 0,
    color: vehiculo.color || '',
    bastidor: vehiculo.vin || '',
    matricula: vehiculo.matricula || ''
  } : {};

  // Intentar extraer datos adicionales del JSON si existe
  let datosJson = {};
  if (pieza.datos_adicionales) {
    try {
      if (typeof pieza.datos_adicionales === 'string') {
        console.log(`Parseando datos_adicionales como string para pieza ${pieza.id}:`, pieza.datos_adicionales);
        datosJson = JSON.parse(pieza.datos_adicionales);
      } else if (typeof pieza.datos_adicionales === 'object') {
        console.log(`Usando datos_adicionales como objeto para pieza ${pieza.id}`);
        datosJson = pieza.datos_adicionales;
      }
      console.log(`Datos adicionales procesados para pieza ${pieza.id}:`, datosJson);
    } catch (e) {
      console.error(`Error al parsear datos_adicionales para pieza ${pieza.id}:`, e);
      // Intentar recuperar datos parciales si es posible
      try {
        // Intentar limpiar el string y volver a parsear
        if (typeof pieza.datos_adicionales === 'string') {
          const cleanedString = pieza.datos_adicionales
            .replace(/\\\\n/g, '')
            .replace(/\\n/g, '')
            .replace(/\\\\r/g, '')
            .replace(/\\r/g, '')
            .replace(/\\\\t/g, '')
            .replace(/\\t/g, '');
          datosJson = JSON.parse(cleanedString);
          console.log(`Recuperación exitosa de datos_adicionales para pieza ${pieza.id}`);
        }
      } catch (innerError) {
        console.error(`No se pudo recuperar datos_adicionales para pieza ${pieza.id}`);
      }
    }
  }

  // Generar especificaciones basadas en los datos disponibles
  const especificaciones = [
    `Estado: ${pieza.estado === 'nueva' ? 'Nuevo' : 'Usado'}`,
    `Tipo: ${pieza.tipo_pieza || 'No especificado'}`,
    `Ubicación: ${pieza.ubicacion_almacen || 'Almacén principal'}`,
    `Referencia: ${pieza.codigo_qr || pieza.rfid || `REF-${pieza.id}`}`
  ];

  // Generar información de compatibilidad
  const compatibilidad = vehiculo ? [
    `${vehiculo.marca || ''} ${vehiculo.modelo || ''} ${vehiculo.version || ''}`,
    `Año: ${vehiculo.anio_fabricacion || 'No especificado'}`,
    `Motor: ${vehiculo.tipo_combustible || 'No especificado'}`
  ] : [
    'Pieza universal',
    'Consultar compatibilidad específica'
  ];

  // Extraer referencia de los datos disponibles
  const referencia = pieza.codigo_qr || pieza.rfid || `REF-${pieza.id}`;
  
  // Preparar los datos adicionales combinando todas las fuentes
  let datosJsonReferencia = typeof datosJson === 'object' ? (datosJson as any)?.referencia : undefined;
  let datosJsonCodigo = typeof datosJson === 'object' ? (datosJson as any)?.codigo : undefined;
  
  // Asegurarnos que los datos adicionales incluyan la referencia
  const datosAdicionalesCompletos = { 
    ...datosAdicionales,     // Datos del vehículo
    ...datosJson,           // Datos del JSON
    // Asegurar que estos campos críticos siempre existan
    referencia: referencia || datosJsonReferencia || `REF-${pieza.id}`,
    codigo: referencia || datosJsonCodigo || `REF-${pieza.id}`
  };

  // Objeto base de la pieza para la tienda
  const piezaTienda: PiezaTienda = {
    id: pieza.id,
    nombre: pieza.descripcion || 'Pieza sin nombre',
    descripcion: pieza.descripcion || '',
    precio: pieza.precio_venta || pieza.precio_coste || 0,
    stock: 1, // Por defecto asumimos stock 1 para cada pieza
    estado: pieza.estado === 'nueva' ? 'Nuevo' : 'Usado',
    imagen_url: '', // Se actualizará con la foto principal
    categoria: pieza.tipo_pieza || '',
    id_vehiculo: pieza.id_vehiculo,
    datos_adicionales: datosAdicionalesCompletos,
    notas: pieza.observaciones || '',
    fecha_creacion: new Date().toISOString(),
    especificaciones,
    compatibilidad
  };
  
  // Si se solicita incluir fotos, las obtenemos del servicio
  if (incluirFotos) {
    try {
      // Obtener todas las fotos de la pieza
      const fotos = await fotosService.getByPiezaId(pieza.id);
      piezaTienda.fotos = fotos;
      
      // Obtener la foto principal
      const fotoPrincipal = fotos.find(f => f.es_principal) || fotos[0] || null;
      piezaTienda.foto_principal = fotoPrincipal;
      
      // Actualizar la URL de la imagen principal
      if (fotoPrincipal) {
        piezaTienda.imagen_url = fotoPrincipal.url;
      }
    } catch (error) {
      console.error(`Error al obtener fotos para pieza ${pieza.id}:`, error);
    }
  }
  
  return piezaTienda;
};

/**
 * Servicio para gestionar la tienda de recambios
 */
export const recambiosService = {
  /**
   * Obtiene todos los recambios disponibles para la tienda con paginación
   * @param page Número de página (1 por defecto)
   * @param limit Límite de elementos por página (15 por defecto)
   * @returns Promise con array de piezas y datos de paginación
   */
  async getRecambios(page: number = 1, limit: number = 15): Promise<{items: PiezaTienda[], pagination: {page: number, limit: number, total: number, totalPages: number}}> {
    try {
      // Obtener datos paginados
      const [piezasResponse, vehiculosResponse] = await Promise.all([
        piezasService.getAll(undefined, {page, limit, count: true}),
        vehiculosService.getAll()
      ]);
      
      // Extraer los arrays de datos de las respuestas paginadas
      const piezasOriginales = piezasResponse.data || [];
      const vehiculos = vehiculosResponse.data || [];
      
      console.log(`Obtenidas ${piezasOriginales.length} piezas (página ${page}/${piezasResponse.pagination.totalPages || 1}) y ${vehiculos.length} vehículos del backend`);
      
      // Convertir y filtrar piezas disponibles
      const piezasPromises = piezasOriginales.map(async pieza => {
        const piezaTienda = await convertirPieza(pieza, vehiculos, true);
        return piezaTienda;
      });
      
      const piezasTienda = await Promise.all(piezasPromises);
      const itemsFiltrados = piezasTienda.filter(pieza => pieza.stock > 0);
      
      // Devolver los items y la información de paginación
      return {
        items: itemsFiltrados,
        pagination: {
          page: piezasResponse.pagination.page || page,
          limit: piezasResponse.pagination.limit || limit,
          total: piezasResponse.pagination.total || itemsFiltrados.length,
          totalPages: piezasResponse.pagination.totalPages || Math.ceil(itemsFiltrados.length / limit)
        }
      };
    } catch (error) {
      console.error('Error al obtener recambios:', error);
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
   * Obtiene un recambio por su ID
   * @param id ID del recambio
   * @returns Promise con la pieza o null si no existe
   */
  async getRecambioById(id: number): Promise<PiezaTienda | null> {
    try {
      const pieza = await piezasService.getById(id);
      if (!pieza) return null;
      
      // Obtener vehículos y extraer el array de datos
      const vehiculosResponse = await vehiculosService.getAll();
      const vehiculos = vehiculosResponse.data || [];
      
      return await convertirPieza(pieza, vehiculos, true);
    } catch (error) {
      console.error(`Error al obtener recambio con ID ${id}:`, error);
      return null;
    }
  },

  /**
   * Busca recambios por término de búsqueda
   * @param searchTerm Término de búsqueda
   * @param page Número de página (1 por defecto)
   * @param limit Límite de elementos por página (15 por defecto)
   * @returns Promise con array de piezas que coinciden con la búsqueda y datos de paginación
   */
  async buscarRecambios(searchTerm: string, page: number = 1, limit: number = 15): Promise<{items: PiezaTienda[], pagination: {page: number, limit: number, total: number, totalPages: number}}> {
    const response = await recambiosService.getRecambios(page, limit);
    if (!searchTerm) return response;
    
    const term = searchTerm.toLowerCase();
    const itemsFiltrados = response.items.filter(pieza => {
      // Buscar en nombre, descripción, categoría y datos del vehículo
      return (
        pieza.nombre.toLowerCase().includes(term) ||
        pieza.descripcion.toLowerCase().includes(term) ||
        pieza.categoria.toLowerCase().includes(term) ||
        (pieza.datos_adicionales && 
          Object.values(pieza.datos_adicionales).some(valor => 
            String(valor).toLowerCase().includes(term)
          )
        )
      ) && pieza.stock > 0;
    });
    
    // Actualizar la paginación con los nuevos totales
    return {
      items: itemsFiltrados,
      pagination: {
        ...response.pagination,
        total: itemsFiltrados.length,
        totalPages: Math.ceil(itemsFiltrados.length / limit)
      }
    };
  },

  /**
   * Filtra recambios por categoría
   * @param categoria Categoría a filtrar
   * @param page Número de página (1 por defecto)
   * @param limit Límite de elementos por página (15 por defecto)
   * @returns Promise con array de piezas filtradas y datos de paginación
   */
  async filtrarPorCategoria(categoria: string, page: number = 1, limit: number = 15): Promise<{items: PiezaTienda[], pagination: {page: number, limit: number, total: number, totalPages: number}}> {
    const response = await recambiosService.getRecambios(page, limit);
    const itemsFiltrados = response.items.filter(pieza => 
      pieza.categoria.toLowerCase().includes(categoria.toLowerCase()) && pieza.stock > 0
    );
    
    // Actualizar la paginación con los nuevos totales
    return {
      items: itemsFiltrados,
      pagination: {
        ...response.pagination,
        total: itemsFiltrados.length,
        totalPages: Math.ceil(itemsFiltrados.length / limit)
      }
    };
  },

  /**
   * Filtra recambios por marca de vehículo
   * @param marca Marca del vehículo
   * @param page Número de página (1 por defecto)
   * @param limit Límite de elementos por página (15 por defecto)
   * @returns Promise con array de piezas de la marca especificada y datos de paginación
   */
  async filtrarPorMarca(marca: string, page: number = 1, limit: number = 15): Promise<{items: PiezaTienda[], pagination: {page: number, limit: number, total: number, totalPages: number}}> {
    const response = await recambiosService.getRecambios(page, limit);
    const itemsFiltrados = response.items.filter(pieza => {
      return pieza.datos_adicionales && 
        pieza.datos_adicionales.marca && 
        pieza.datos_adicionales.marca.toLowerCase().includes(marca.toLowerCase()) &&
        pieza.stock > 0;
    });
    
    // Actualizar la paginación con los nuevos totales
    return {
      items: itemsFiltrados,
      pagination: {
        ...response.pagination,
        total: itemsFiltrados.length,
        totalPages: Math.ceil(itemsFiltrados.length / limit)
      }
    };
  },

  /**
   * Filtra recambios por rango de precio
   * @param min Precio mínimo
   * @param max Precio máximo
   * @param page Número de página (1 por defecto)
   * @param limit Límite de elementos por página (15 por defecto)
   * @returns Promise con array de piezas dentro del rango de precio y datos de paginación
   */
  async filtrarPorPrecio(min: number, max: number, page: number = 1, limit: number = 15): Promise<{items: PiezaTienda[], pagination: {page: number, limit: number, total: number, totalPages: number}}> {
    const response = await this.getRecambios(page, limit);
    const itemsFiltrados = response.items.filter(pieza => {
      return pieza.precio >= min && pieza.precio <= max;
    });
    
    // Actualizar la paginación con los nuevos totales
    return {
      items: itemsFiltrados,
      pagination: {
        ...response.pagination,
        total: itemsFiltrados.length,
        totalPages: Math.ceil(itemsFiltrados.length / limit)
      }
    };
  },

  /**
   * Obtiene todas las piezas asociadas a un vehículo específico
   * @param vehiculoId ID del vehículo
   * @returns Promise con array de piezas del vehículo
   */
  async getByVehiculoId(vehiculoId: number): Promise<PiezaTienda[]> {
    try {
      console.log(`Obteniendo piezas para el vehículo ID: ${vehiculoId}`);
      
      // Obtener todas las piezas originales usando el método específico
      const piezasOriginales = await piezasService.getByVehiculoId(vehiculoId);
      console.log(`Piezas originales obtenidas: ${piezasOriginales.length}`, piezasOriginales[0]);
      
      // Obtener el vehículo específico
      const vehiculo = await vehiculosService.getById(vehiculoId);
      console.log(`Vehículo obtenido:`, vehiculo ? `ID: ${vehiculo.id}` : 'No encontrado');
      
      // Convertir las piezas al formato de tienda
      const piezasPromises = piezasOriginales.map(async pieza => {
        const piezaConvertida = await convertirPieza(pieza, vehiculo ? [vehiculo] : [], true);
        console.log(`Pieza ${pieza.id} convertida:`, {
          id: piezaConvertida.id,
          nombre: piezaConvertida.nombre,
          precio: piezaConvertida.precio,
          referencia: piezaConvertida.datos_adicionales?.referencia
        });
        return piezaConvertida;
      });
      
      const resultado = await Promise.all(piezasPromises);
      console.log(`Total de piezas convertidas: ${resultado.length}`);
      return resultado;
    } catch (error) {
      console.error(`Error al obtener piezas del vehículo ${vehiculoId}:`, error);
      return [];
    }
  }
};
