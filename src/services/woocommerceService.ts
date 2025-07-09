import api from './api';

export interface WooCommerceConfig {
  url: string;
  consumer_key: string;
  consumer_secret: string;
  version: string;
}

export interface WooCommerceProduct {
  id: number;
  name: string;
  slug: string;
  permalink: string;
  date_created: string;
  type: string;
  status: string;
  featured: boolean;
  catalog_visibility: string;
  description: string;
  short_description: string;
  sku: string;
  price: string;
  regular_price: string;
  sale_price: string;
  stock_quantity: number;
  stock_status: string;
  categories: Array<{
    id: number;
    name: string;
    slug: string;
  }>;
  images: Array<{
    id: number;
    src: string;
    name: string;
    alt: string;
  }>;
  attributes: Array<{
    id: number;
    name: string;
    position: number;
    visible: boolean;
    variation: boolean;
    options: string[];
  }>;
  meta_data: Array<{
    id: number;
    key: string;
    value: any;
  }>;
}

export interface ImportPiezaResult {
  success: boolean;
  message: string;
  piezaId?: number;
  error?: string;
}

export interface ImportacionWooCommerceStats {
  total: number;
  importadas: number;
  errores: number;
  detalles: Array<{
    producto: string;
    resultado: ImportPiezaResult;
  }>;
}

export const woocommerceService = {
  /**
   * Obtiene la configuración actual de WooCommerce
   * @returns Promise con la configuración de WooCommerce
   */
  getConfig: async (): Promise<WooCommerceConfig> => {
    try {
      const response = await api.get('/woocommerce/config');
      return response.data.data;
    } catch (error) {
      console.error('Error al obtener configuración de WooCommerce:', error);
      throw error;
    }
  },

  /**
   * Guarda la configuración de WooCommerce
   * @param config Configuración de WooCommerce
   * @returns Promise con la respuesta del servidor
   */
  saveConfig: async (config: WooCommerceConfig): Promise<any> => {
    try {
      const response = await api.post('/woocommerce/config', config);
      return response.data;
    } catch (error) {
      console.error('Error al guardar configuración de WooCommerce:', error);
      throw error;
    }
  },

  /**
   * Verifica la conexión con WooCommerce
   * @param config Configuración de WooCommerce (opcional, usa la guardada si no se proporciona)
   * @returns Promise con el resultado de la verificación
   */
  testConnection: async (config?: WooCommerceConfig): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await api.post('/woocommerce/test-connection', config || {});
      return response.data;
    } catch (error) {
      console.error('Error al verificar conexión con WooCommerce:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Error desconocido al conectar con WooCommerce' 
      };
    }
  },

  /**
   * Obtiene productos de WooCommerce
   * @param page Número de página
   * @param perPage Productos por página
   * @param search Término de búsqueda
   * @returns Promise con los productos
   */
  getProducts: async (page: number = 1, perPage: number = 50, search: string = ''): Promise<{
    products: WooCommerceProduct[];
    totalPages: number;
    totalProducts: number;
  }> => {
    try {
      const response = await api.get('/woocommerce/products', {
        params: { page, per_page: perPage, search }
      });
      return {
        products: response.data.data.products,
        totalPages: response.data.data.pagination.totalPages,
        totalProducts: response.data.data.pagination.total
      };
    } catch (error) {
      console.error('Error al obtener productos de WooCommerce:', error);
      throw error;
    }
  },

  /**
   * Importa un producto de WooCommerce como pieza
   * @param productId ID del producto en WooCommerce
   * @returns Promise con el resultado de la importación
   */
  importProduct: async (productId: number): Promise<ImportPiezaResult> => {
    try {
      const response = await api.post(`/woocommerce/products/${productId}/import`);
      return {
        success: response.data.success,
        message: response.data.message,
        piezaId: response.data.data?.pieza?.id
      };
    } catch (error) {
      console.error(`Error al importar producto ${productId} de WooCommerce:`, error);
      return {
        success: false,
        message: `Error al importar producto ${productId}`,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  },

  /**
   * Importa múltiples productos de WooCommerce como piezas utilizando procesamiento por lotes
   * @param productIds Array de IDs de productos en WooCommerce
   * @param onProgress Callback para reportar progreso
   * @param parallelBatchSize Tamaño del lote para procesamiento en paralelo (por defecto 20)
   * @returns Promise con estadísticas de la importación
   */
  importMultipleProducts: async (
    productIds: number[],
    onProgress?: (current: number, total: number, lastResult?: ImportPiezaResult) => void,
    parallelBatchSize: number = 20
  ): Promise<ImportacionWooCommerceStats> => {
    try {
      const stats: ImportacionWooCommerceStats = {
        total: productIds.length,
        importadas: 0,
        errores: 0,
        detalles: []
      };

      // Procesar los productos en lotes para no sobrecargar la API
      const BATCH_SIZE = parallelBatchSize; // Tamaño de lote para procesar en paralelo
      let processedCount = 0;
      
      // Caché para almacenar nombres de productos y evitar llamadas repetidas
      const productCache: Record<number, { name: string }> = {};
      
      for (let i = 0; i < productIds.length; i += BATCH_SIZE) {
        // Obtener un lote de productos para procesar
        const batchIds = productIds.slice(i, i + BATCH_SIZE);
        
        // Procesar productos en paralelo con un límite de concurrencia
        const promises = batchIds.map(async (productId) => {
          try {
            // Obtener detalles del producto si no están en caché
            if (!productCache[productId]) {
              try {
                const productDetails = await api.get(`/woocommerce/products/${productId}`);
                productCache[productId] = { 
                  name: productDetails.data.name || `Producto ${productId}`
                };
              } catch (detailError) {
                // Si falla al obtener detalles, usamos un nombre genérico
                productCache[productId] = { 
                  name: `Producto ${productId}`
                };
              }
            }
            
            // Importar el producto
            const result = await woocommerceService.importProduct(productId);
            return {
              productId,
              name: productCache[productId].name,
              result,
              error: null
            };
          } catch (error) {
            return {
              productId,
              name: productCache[productId]?.name || `Producto ${productId}`,
              result: null,
              error: error instanceof Error ? error.message : 'Error desconocido'
            };
          }
        });
        
        // Esperar a que se completen todas las importaciones del lote
        const results = await Promise.all(promises);
        
        // Procesar los resultados
        for (const item of results) {
          processedCount++;
          
          if (item.result && item.result.success) {
            stats.importadas++;
            stats.detalles.push({
              producto: item.name,
              resultado: item.result
            });
          } else {
            stats.errores++;
            const errorResult: ImportPiezaResult = item.result || {
              success: false,
              message: `Error al importar producto ${item.productId}`,
              error: item.error
            };
            
            stats.detalles.push({
              producto: item.name,
              resultado: errorResult
            });
          }
          
          // Informar del progreso
          if (onProgress) {
            const resultToReport = item.result || {
              success: false,
              message: `Error al importar producto ${item.productId}`,
              error: item.error
            };
            onProgress(processedCount, productIds.length, resultToReport);
          }
        }
        
        // Pequeña pausa entre lotes para evitar sobrecargar la API
        if (i + BATCH_SIZE < productIds.length) {
          await new Promise(resolve => setTimeout(resolve, 200));
        }
      }
      
      return stats;
    } catch (error) {
      console.error('Error en la importación múltiple de productos:', error);
      return {
        total: productIds.length,
        importadas: 0,
        errores: 1,
        detalles: [{
          producto: 'Importación múltiple',
          resultado: {
            success: false,
            message: 'Error en la importación múltiple',
            error: error instanceof Error ? error.message : 'Error desconocido'
          }
        }]
      };
    }
  },

  /**
   * Sincroniza una pieza existente con su producto correspondiente en WooCommerce
   * @param piezaId ID de la pieza en el sistema
   * @param productId ID del producto en WooCommerce
   * @returns Promise con el resultado de la sincronización
   */
  syncPiezaWithProduct: async (piezaId: number, productId: number): Promise<{
    success: boolean;
    message: string;
  }> => {
    try {
      const response = await api.post(`/woocommerce/pieces/${piezaId}/sync`);
      return {
        success: response.data.success,
        message: response.data.message
      };
    } catch (error) {
      console.error(`Error al sincronizar pieza ${piezaId} con producto ${productId}:`, error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Error desconocido al sincronizar'
      };
    }
  },

  /**
   * Importa todos los productos de WooCommerce como piezas
   * @param onProgress Callback para reportar progreso
   * @returns Promise con estadísticas de la importación
   */
  importAllProducts: async (
    onProgress?: (current: number, total: number, lastResult?: ImportPiezaResult) => void
  ): Promise<ImportacionWooCommerceStats> => {
    try {
      const { totalProducts } = await woocommerceService.getProducts(1, 1);
      
      const stats: ImportacionWooCommerceStats = {
        total: totalProducts,
        importadas: 0,
        errores: 0,
        detalles: []
      };

      // Llamada al endpoint de importación masiva
      const response = await api.post('/woocommerce/products/import-all', {
        onProgress: true
      });

      // Si el backend soporta importación masiva directamente
      if (response.data && response.data.success) {
        return response.data.stats;
      }

      // Si el backend no soporta importación masiva, lo hacemos por lotes desde el frontend
      const BATCH_SIZE = 200; // Tamaño del lote para obtener productos de WooCommerce
      const PARALLEL_BATCH_SIZE = 50; // Tamaño del lote para procesamiento paralelo
      let processedCount = 0;
      
      // Procesamos los productos en lotes
      for (let page = 1; processedCount < totalProducts; page++) {
        // Obtenemos un lote de productos
        const { products } = await woocommerceService.getProducts(page, BATCH_SIZE);
        
        if (products.length === 0) break;
        
        // Extraemos solo los IDs para la importación
        const productIds = products.map(p => p.id);
        
        // Importamos este lote de productos
        const batchStats = await woocommerceService.importMultipleProducts(
          productIds,
          (current, total, lastResult) => {
            if (onProgress) {
              // Ajustamos el progreso para reflejar el progreso global
              const globalCurrent = processedCount + current;
              onProgress(globalCurrent, totalProducts, lastResult);
            }
          },
          PARALLEL_BATCH_SIZE // Usamos un tamaño de lote mayor para el procesamiento paralelo
        );
        
        // Actualizamos las estadísticas globales
        stats.importadas += batchStats.importadas;
        stats.errores += batchStats.errores;
        stats.detalles = [...stats.detalles, ...batchStats.detalles];
        
        // Actualizamos el contador de procesados
        processedCount += products.length;
        
        // Pequeña pausa para no sobrecargar el servidor
        await new Promise(resolve => setTimeout(resolve, 200)); // Reducimos la pausa para acelerar el proceso
      }
      
      return stats;
    } catch (error) {
      console.error('Error en la importación masiva de productos:', error);
      return {
        total: 0,
        importadas: 0,
        errores: 1,
        detalles: [{
          producto: 'Importación masiva',
          resultado: {
            success: false,
            message: 'Error en la importación masiva',
            error: error instanceof Error ? error.message : 'Error desconocido'
          }
        }]
      };
    }
  }
};

export default woocommerceService;
