/**
 * Modelos para la integración con WooCommerce
 */

/**
 * Configuración para la conexión con WooCommerce
 */
export interface WooCommerceConfig {
  id?: number;
  url: string;
  consumer_key: string;
  consumer_secret: string;
  api_version: string;
  activo: boolean;
  fecha_creacion?: Date;
  fecha_actualizacion?: Date;
  usuario_actualizacion?: string;
}

/**
 * Producto de WooCommerce
 */
export interface WooCommerceProduct {
  id: number;
  name: string;
  slug: string;
  permalink: string;
  date_created: string;
  date_modified: string;
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
  stock_status: string;
  stock_quantity?: number;
  categories: Array<{
    id: number;
    name: string;
    slug: string;
  }>;
  tags: Array<{
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

/**
 * Resultado de la importación de un producto como pieza
 */
export interface ImportPiezaResult {
  success: boolean;
  message: string;
  piezaId?: number;
  error?: string;
}

/**
 * Estadísticas de importación múltiple
 */
export interface ImportacionWooCommerceStats {
  total: number;
  importadas: number;
  errores: number;
  detalles: Array<{
    producto: string;
    resultado: ImportPiezaResult;
  }>;
}
