import express from 'express';
import { PrismaClient } from '@prisma/client';
import WooCommerceRestApi from '@woocommerce/woocommerce-rest-api';
import { z } from 'zod';

const router = express.Router();
const prisma = new PrismaClient();

/**
 * Esquema de validación para la configuración de WooCommerce
 */
const woocommerceConfigSchema = z.object({
  url: z.string().url('La URL debe ser válida'),
  consumer_key: z.string().min(1, 'La consumer key es requerida'),
  consumer_secret: z.string().min(1, 'El consumer secret es requerido'),
  api_version: z.string().default('v3'),
  activo: z.boolean().default(false)
});

/**
 * Inicializa la API de WooCommerce con la configuración almacenada
 * @returns {Promise<WooCommerceRestApi>} Cliente de la API de WooCommerce
 */
async function initWooCommerceApi() {
  try {
    const config = await prisma.wooCommerceConfig.findFirst();
    
    if (!config) {
      throw new Error('No se ha configurado la conexión con WooCommerce');
    }
    
    return new WooCommerceRestApi({
      url: config.url,
      consumerKey: config.consumer_key,
      consumerSecret: config.consumer_secret,
      version: config.api_version,
      queryStringAuth: true // Force Basic Authentication as query string for legacy servers
    });
  } catch (error) {
    console.error('Error al inicializar la API de WooCommerce:', error);
    throw error;
  }
}

/**
 * Obtener la configuración de WooCommerce
 */
router.get('/config', async (req, res) => {
  try {
    const config = await prisma.wooCommerceConfig.findFirst();
    
    if (!config) {
      return res.status(404).json({
        success: false,
        message: 'No se ha configurado la conexión con WooCommerce'
      });
    }
    
    // No devolvemos el consumer_secret completo por seguridad
    const secureConfig = {
      ...config,
      consumer_secret: config.consumer_secret ? '••••••••' : ''
    };
    
    return res.json({
      success: true,
      data: secureConfig
    });
  } catch (error) {
    console.error('Error al obtener la configuración de WooCommerce:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener la configuración de WooCommerce',
      error: error.message
    });
  }
});

/**
 * Guardar la configuración de WooCommerce
 */
router.post('/config', async (req, res) => {
  try {
    const validationResult = woocommerceConfigSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Datos de configuración inválidos',
        errors: validationResult.error.errors
      });
    }
    
    const configData = validationResult.data;
    
    // Verificar si ya existe una configuración
    const existingConfig = await prisma.wooCommerceConfig.findFirst();
    
    let config;
    if (existingConfig) {
      // Actualizar configuración existente
      config = await prisma.wooCommerceConfig.update({
        where: { id: existingConfig.id },
        data: {
          ...configData,
          fecha_actualizacion: new Date(),
          usuario_actualizacion: req.body.usuario_actualizacion || 'sistema'
        }
      });
    } else {
      // Crear nueva configuración
      config = await prisma.wooCommerceConfig.create({
        data: {
          ...configData,
          usuario_actualizacion: req.body.usuario_actualizacion || 'sistema'
        }
      });
    }
    
    // No devolvemos el consumer_secret completo por seguridad
    const secureConfig = {
      ...config,
      consumer_secret: '••••••••'
    };
    
    return res.json({
      success: true,
      message: 'Configuración guardada correctamente',
      data: secureConfig
    });
  } catch (error) {
    console.error('Error al guardar la configuración de WooCommerce:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al guardar la configuración de WooCommerce',
      error: error.message
    });
  }
});

/**
 * Probar la conexión con WooCommerce
 */
router.post('/test-connection', async (req, res) => {
  try {
    // Si se envían datos de configuración, usamos esos para la prueba
    let api;
    
    if (req.body.url && req.body.consumer_key && req.body.consumer_secret) {
      api = new WooCommerceRestApi({
        url: req.body.url,
        consumerKey: req.body.consumer_key,
        consumerSecret: req.body.consumer_secret,
        version: req.body.api_version || 'v3',
        queryStringAuth: true
      });
    } else {
      // Usar la configuración guardada
      api = await initWooCommerceApi();
    }
    
    // Intentar obtener la información de la tienda
    const response = await api.get('');
    
    return res.json({
      success: true,
      message: 'Conexión exitosa con WooCommerce',
      data: {
        store: response.data
      }
    });
  } catch (error) {
    console.error('Error al probar la conexión con WooCommerce:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al conectar con WooCommerce',
      error: error.message
    });
  }
});

/**
 * Obtener productos de WooCommerce con paginación y búsqueda
 */
router.get('/products', async (req, res) => {
  try {
    const api = await initWooCommerceApi();
    
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.per_page) || 10;
    const search = req.query.search || '';
    
    const params = {
      page,
      per_page: perPage,
      search
    };
    
    const response = await api.get('products', params);
    
    // Obtener el total de productos para la paginación
    const totalProducts = parseInt(response.headers['x-wp-total']) || 0;
    const totalPages = parseInt(response.headers['x-wp-totalpages']) || 1;
    
    return res.json({
      success: true,
      data: {
        products: response.data,
        pagination: {
          total: totalProducts,
          totalPages,
          currentPage: page,
          perPage
        }
      }
    });
  } catch (error) {
    console.error('Error al obtener productos de WooCommerce:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener productos de WooCommerce',
      error: error.message
    });
  }
});

/**
 * Obtener un producto específico de WooCommerce
 */
router.get('/products/:id', async (req, res) => {
  try {
    const api = await initWooCommerceApi();
    const productId = req.params.id;
    
    const response = await api.get(`products/${productId}`);
    
    return res.json({
      success: true,
      data: response.data
    });
  } catch (error) {
    console.error(`Error al obtener el producto ${req.params.id} de WooCommerce:`, error);
    return res.status(500).json({
      success: false,
      message: `Error al obtener el producto ${req.params.id} de WooCommerce`,
      error: error.message
    });
  }
});

/**
 * Importar un producto de WooCommerce como pieza
 */
router.post('/products/:id/import', async (req, res) => {
  try {
    const api = await initWooCommerceApi();
    const productId = parseInt(req.params.id);
    
    // Verificar si ya existe una pieza con este ID de WooCommerce
    const existingPieza = await prisma.pieza.findFirst({
      where: {
        meta_data: {
          contains: `"woocommerce_id":${productId}`
        }
      }
    });
    
    if (existingPieza) {
      return res.status(409).json({
        success: false,
        message: `El producto ya ha sido importado como la pieza #${existingPieza.id}`,
        piezaId: existingPieza.id
      });
    }
    
    // Obtener el producto de WooCommerce
    const response = await api.get(`products/${productId}`);
    const product = response.data;
    
    // Mapear el producto a una pieza
    const piezaData = {
      nombre: product.name,
      descripcion: product.description || product.short_description || '',
      precio: parseFloat(product.price) || 0,
      estado: 'disponible', // Estado por defecto
      categoria: product.categories.length > 0 ? product.categories[0].name : 'General',
      ubicacion: 'Almacén principal', // Ubicación por defecto
      meta_data: JSON.stringify({
        woocommerce_id: product.id,
        woocommerce_sku: product.sku,
        woocommerce_url: product.permalink,
        woocommerce_attributes: product.attributes,
        woocommerce_categories: product.categories
      })
    };
    
    // Crear la pieza en la base de datos
    const nuevaPieza = await prisma.pieza.create({
      data: piezaData
    });
    
    // Importar imágenes si existen
    if (product.images && product.images.length > 0) {
      for (const image of product.images) {
        await prisma.foto.create({
          data: {
            id_pieza: nuevaPieza.id,
            nombre: image.name || `Imagen ${image.id}`,
            descripcion: image.alt || '',
            url: image.src,
            es_principal: product.images.indexOf(image) === 0 // La primera imagen es la principal
          }
        });
      }
    }
    
    return res.json({
      success: true,
      message: 'Producto importado correctamente como pieza',
      data: {
        pieza: nuevaPieza,
        producto: product
      }
    });
  } catch (error) {
    console.error(`Error al importar el producto ${req.params.id} de WooCommerce:`, error);
    return res.status(500).json({
      success: false,
      message: `Error al importar el producto ${req.params.id} de WooCommerce`,
      error: error.message
    });
  }
});

/**
 * Sincronizar una pieza con su producto de WooCommerce
 */
router.post('/pieces/:id/sync', async (req, res) => {
  try {
    const piezaId = parseInt(req.params.id);
    
    // Obtener la pieza
    const pieza = await prisma.pieza.findUnique({
      where: { id: piezaId }
    });
    
    if (!pieza) {
      return res.status(404).json({
        success: false,
        message: `No se encontró la pieza con ID ${piezaId}`
      });
    }
    
    // Verificar si la pieza tiene un ID de WooCommerce
    let woocommerceId;
    try {
      const metaData = JSON.parse(pieza.meta_data || '{}');
      woocommerceId = metaData.woocommerce_id;
    } catch (e) {
      woocommerceId = null;
    }
    
    if (!woocommerceId) {
      return res.status(400).json({
        success: false,
        message: 'La pieza no está asociada a un producto de WooCommerce'
      });
    }
    
    // Obtener el producto de WooCommerce
    const api = await initWooCommerceApi();
    const response = await api.get(`products/${woocommerceId}`);
    const product = response.data;
    
    // Actualizar la pieza con los datos del producto
    const updatedPieza = await prisma.pieza.update({
      where: { id: piezaId },
      data: {
        nombre: product.name,
        descripcion: product.description || product.short_description || '',
        precio: parseFloat(product.price) || pieza.precio,
        meta_data: JSON.stringify({
          woocommerce_id: product.id,
          woocommerce_sku: product.sku,
          woocommerce_url: product.permalink,
          woocommerce_attributes: product.attributes,
          woocommerce_categories: product.categories,
          woocommerce_last_sync: new Date().toISOString()
        })
      }
    });
    
    // Sincronizar imágenes
    if (product.images && product.images.length > 0) {
      // Eliminar fotos existentes
      await prisma.foto.deleteMany({
        where: { id_pieza: piezaId }
      });
      
      // Crear nuevas fotos
      for (const image of product.images) {
        await prisma.foto.create({
          data: {
            id_pieza: piezaId,
            nombre: image.name || `Imagen ${image.id}`,
            descripcion: image.alt || '',
            url: image.src,
            es_principal: product.images.indexOf(image) === 0 // La primera imagen es la principal
          }
        });
      }
    }
    
    return res.json({
      success: true,
      message: 'Pieza sincronizada correctamente con WooCommerce',
      data: {
        pieza: updatedPieza,
        producto: product
      }
    });
  } catch (error) {
    console.error(`Error al sincronizar la pieza ${req.params.id} con WooCommerce:`, error);
    return res.status(500).json({
      success: false,
      message: `Error al sincronizar la pieza ${req.params.id} con WooCommerce`,
      error: error.message
    });
  }
});

export default router;
