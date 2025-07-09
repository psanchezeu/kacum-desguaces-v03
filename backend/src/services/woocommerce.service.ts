/**
 * Servicio para interactuar con la API de WooCommerce
 * Encapsula la lógica de inicialización y uso de la biblioteca
 */
import { PrismaClient } from '@prisma/client';
import axios from 'axios';

// Definimos los tipos necesarios para la API de WooCommerce
export type WooCommerceRestApiVersion = 'wc/v1' | 'wc/v2' | 'wc/v3' | 'wc-api/v1' | 'wc-api/v2' | 'wc-api/v3';

export interface WooCommerceConfig {
  url: string;
  consumer_key: string;
  consumer_secret: string;
  version: WooCommerceRestApiVersion;
}

export interface WooCommerceOptions {
  url: string;
  consumerKey: string;
  consumerSecret: string;
  version: WooCommerceRestApiVersion;
}

export interface WooCommerceProduct {
  id: number;
  name: string;
  description?: string;
  short_description?: string;
  price?: string;
  regular_price?: string;
  sale_price?: string;
  stock_quantity?: number;
  sku?: string;
  permalink?: string;
  images?: Array<{
    id: number;
    src: string;
    name?: string;
    alt?: string;
  }>;
  categories?: Array<{
    id: number;
    name: string;
    slug?: string;
  }>;
  attributes?: Array<{
    id: number;
    name: string;
    options: string[];
  }>;
}

/**
 * Clase adaptadora para la API de WooCommerce
 * Proporciona una interfaz compatible con módulos ES
 */
export class WooCommerceAdapter {
  private api: any;

  constructor(options: WooCommerceOptions) {
    // Importar dinámicamente la biblioteca WooCommerce
    this.initialize(options);
  }

  private async initialize(options: WooCommerceOptions) {
    try {
      const module = await import('@woocommerce/woocommerce-rest-api');
      const WooCommerceRestApi = module.default;
      this.api = new WooCommerceRestApi(options);
    } catch (error) {
      console.error('Error al inicializar WooCommerce API:', error);
      throw new Error('No se pudo inicializar la API de WooCommerce');
    }
  }

  /**
   * Obtiene datos de la API de WooCommerce
   */
  async get(endpoint: string, params?: any) {
    if (!this.api) {
      await this.waitForInitialization();
    }
    return this.api.get(endpoint, params);
  }

  /**
   * Envía datos a la API de WooCommerce
   */
  async post(endpoint: string, data: any, params?: any) {
    if (!this.api) {
      await this.waitForInitialization();
    }
    return this.api.post(endpoint, data, params);
  }

  /**
   * Actualiza datos en la API de WooCommerce
   */
  async put(endpoint: string, data: any, params?: any) {
    if (!this.api) {
      await this.waitForInitialization();
    }
    return this.api.put(endpoint, data, params);
  }

  /**
   * Elimina datos en la API de WooCommerce
   */
  async delete(endpoint: string, params?: any) {
    if (!this.api) {
      await this.waitForInitialization();
    }
    return this.api.delete(endpoint, params);
  }

  /**
   * Espera a que la API se inicialice
   */
  private async waitForInitialization() {
    let attempts = 0;
    const maxAttempts = 10;
    
    while (!this.api && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 100));
      attempts++;
    }
    
    if (!this.api) {
      throw new Error('No se pudo inicializar la API de WooCommerce después de varios intentos');
    }
  }
}

// Instancia de Prisma
const prisma = new PrismaClient();

/**
 * Obtiene la configuración de WooCommerce de la base de datos
 */
export async function getWooCommerceConfig(): Promise<WooCommerceConfig> {
    const configItems = await prisma.configuracion.findMany({ where: { categoria: 'woocommerce' } });
  
  const configData: WooCommerceConfig = {
    url: '',
    consumer_key: '',
    consumer_secret: '',
    version: 'wc/v3' as WooCommerceRestApiVersion
  };
  
  // Mapear los items de configuración a las propiedades del objeto configData
  configItems.forEach(item => {
    if (item.clave === 'url') configData.url = item.valor;
    if (item.clave === 'consumer_key') configData.consumer_key = item.valor;
    if (item.clave === 'consumer_secret') configData.consumer_secret = item.valor;
    if (item.clave === 'version') configData.version = item.valor as WooCommerceRestApiVersion;
  });
  
  return configData;
}

/**
 * Guarda la configuración de WooCommerce en la base de datos
 */
export async function saveWooCommerceConfig(config: WooCommerceConfig): Promise<void> {
  // Guardar cada propiedad de la configuración en la tabla configuracion
  const configEntries = Object.entries(config);
  
  if (configEntries) {
    for (const [key, value] of configEntries) {
      // Solo guardar si hay un valor definido
      if (value !== undefined && value !== null) {
        await prisma.configuracion.upsert({
          where: { clave: key },
          update: { 
            valor: value, 
            fecha_actualizacion: new Date(),
            categoria: 'woocommerce' // Asegurarse de que la categoría sea correcta
          },
          create: { 
            categoria: 'woocommerce', 
            clave: key, 
            valor: value, 
            tipo: 'texto', 
            descripcion: `Configuración de WooCommerce: ${key}` 
          }
        });
      }
    }
  }
}

/**
 * Crea una instancia de la API de WooCommerce con la configuración guardada
 */
export async function getWooCommerceApi() {
  try {
    const config = await getWooCommerceConfig();
    
    // Crear una instancia del adaptador de WooCommerce
    const options: WooCommerceOptions = {
      url: config.url,
      consumerKey: config.consumer_key,
      consumerSecret: config.consumer_secret,
      version: config.version
    };
    
    return new WooCommerceAdapter(options);
  } catch (error) {
    console.error('Error al crear instancia de WooCommerce API:', error);
    throw new Error('No se pudo crear la instancia de WooCommerce API');
  }
}

/**
 * Prueba la conexión con WooCommerce usando la configuración proporcionada
 */
export async function testWooCommerceConnection(config?: WooCommerceConfig): Promise<boolean> {
  try {
    let api;
    
    if (config) {
      // Crear una instancia del adaptador de WooCommerce con la configuración proporcionada
      const options: WooCommerceOptions = {
        url: config.url,
        consumerKey: config.consumer_key,
        consumerSecret: config.consumer_secret,
        version: config.version
      };
      
      api = new WooCommerceAdapter(options);
    } else {
      api = await getWooCommerceApi();
    }
    
    // Intentar obtener un producto para verificar la conexión
    await api.get('products', { per_page: 1 });
    return true;
  } catch (error) {
    console.error('Error al probar conexión con WooCommerce:', error);
    return false;
  }
}
