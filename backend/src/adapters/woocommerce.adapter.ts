/**
 * Adaptador para la API de WooCommerce
 * Este archivo proporciona una interfaz compatible con módulos ES para la biblioteca WooCommerce
 */

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
  meta_data?: Array<{
    id: number;
    key: string;
    value: string;
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
