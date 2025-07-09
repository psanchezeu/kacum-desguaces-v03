import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { 
  getWooCommerceApi, 
  getWooCommerceConfig, 
  saveWooCommerceConfig, 
  testWooCommerceConnection, 
  WooCommerceConfig, 
  WooCommerceRestApiVersion,
  WooCommerceProduct 
} from '../services/woocommerce.service.js';

// Interfaces para resultados de importación
interface ImportPiezaResult {
  success: boolean;
  message: string;
  piezaId?: number;
  error?: string;
}

interface ImportacionWooCommerceDetail {
  producto: string;
  resultado: ImportPiezaResult;
}

interface ImportacionWooCommerceStats {
  total: number;
  importadas: number;
  errores: number;
  detalles: ImportacionWooCommerceDetail[];
}

const router = Router();
const prisma = new PrismaClient();

// Esquema de validación para la configuración de WooCommerce
const wooCommerceConfigSchema = z.object({
  url: z.string().url(),
  consumer_key: z.string().min(1),
  consumer_secret: z.string().min(1),
  version: z.enum(['wc/v1', 'wc/v2', 'wc/v3', 'wc-api/v1', 'wc-api/v2', 'wc-api/v3']).default('wc/v3')
});

// Esquema para validar productos de WooCommerce
// Usamos el tipo WooCommerceProduct del adaptador para mantener consistencia
const wooCommerceProductSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().optional(),
  short_description: z.string().optional(),
  price: z.string().optional(),
  regular_price: z.string().optional(),
  sale_price: z.string().optional(),
  stock_quantity: z.number().optional(),
  sku: z.string().optional(),
  permalink: z.string().optional(),
  images: z.array(
    z.object({
      id: z.number(),
      src: z.string(),
      name: z.string().optional(),
      alt: z.string().optional(),
    })
  ).optional(),
  categories: z.array(
    z.object({
      id: z.number(),
      name: z.string(),
      slug: z.string().optional(),
    })
  ).optional(),
  attributes: z.array(
    z.object({
      id: z.number(),
      name: z.string(),
      options: z.array(z.string()),
    })
  ).optional(),
  meta_data: z.array(
    z.object({
      id: z.number(),
      key: z.string(),
      value: z.union([z.string(), z.number(), z.boolean(), z.null()]),
    })
  ).optional(),
});

// Endpoints para la gestión de WooCommerce

// Endpoint para obtener la configuración de WooCommerce
router.get('/config', async (req, res) => {
  try {
    const config = await getWooCommerceConfig();
    
    // Devolver la configuración completa sin enmascarar
    res.json({
      data: config,
      success: true
    });
  } catch (error) {
    console.error('Error al obtener configuración de WooCommerce:', error);
    res.status(500).json({ error: 'Error al obtener configuración de WooCommerce' });
  }
});

// Endpoint para guardar la configuración de WooCommerce
router.post('/config', async (req, res) => {
  try {
    const config = wooCommerceConfigSchema.parse(req.body);
    
    // Convertir explícitamente a WooCommerceConfig para evitar errores de tipo
    const typedConfig: WooCommerceConfig = {
      url: config.url,
      consumer_key: config.consumer_key,
      consumer_secret: config.consumer_secret,
      version: config.version
    };
    
    // El servicio saveWooCommerceConfig ya maneja el caso de consumer_secret enmascarado
    await saveWooCommerceConfig(typedConfig);
    res.json({ success: true, message: 'Configuración guardada correctamente' });
  } catch (error) {
    console.error('Error al guardar configuración de WooCommerce:', error);
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Datos de configuración inválidos', details: error.errors });
    } else {
      res.status(500).json({ error: 'Error al guardar configuración de WooCommerce' });
    }
  }
});

// Endpoint para probar la conexión con WooCommerce
router.post('/test-connection', async (req, res) => {
  try {
    // Si se envía una configuración en el cuerpo, usarla para la prueba
    if (Object.keys(req.body).length > 0) {
      const config = wooCommerceConfigSchema.parse(req.body);
      // Usar la función testWooCommerceConnection del servicio
      const testConfig: WooCommerceConfig = {
        url: config.url,
        consumer_key: config.consumer_key,
        consumer_secret: config.consumer_secret,
        version: config.version
      };
      const success = await testWooCommerceConnection(testConfig);
      
      if (success) {
        res.json({
          success: true,
          message: 'Conexión exitosa con WooCommerce'
        });
      } else {
        res.json({
          success: false,
          message: 'Error al conectar con WooCommerce'
        });
      }
    } else {
      // Si no se envió configuración, usar la guardada en la base de datos
      const api = await getWooCommerceApi();
      
      // Intentar obtener un producto para verificar la conexión
      await api.get('products', { per_page: 1 });
      
      res.json({
        success: true,
        message: 'Conexión exitosa con WooCommerce'
      });
    }
  } catch (error) {
    console.error('Error al probar conexión con WooCommerce:', error);
    res.json({
      success: false,
      message: 'Error al conectar con WooCommerce',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

// Endpoint para obtener todos los productos de WooCommerce
router.get('/products', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const perPage = parseInt(req.query.per_page as string) || 50; // Valor predeterminado aumentado a 50
    const search = req.query.search as string || '';
    
    const api = await getWooCommerceApi();
    
    const params: Record<string, any> = {
      page,
      per_page: perPage
    };
    
    if (search) {
      params.search = search;
    }
    
    const response = await api.get('products', params);
    
    // Obtener información de paginación de los headers
    const total = parseInt(response.headers['x-wp-total'] || '0', 10);
    const totalPages = parseInt(response.headers['x-wp-totalpages'] || '1', 10);
    
    // Establecer headers de paginación para compatibilidad
    res.setHeader('X-WP-Total', response.headers['x-wp-total']);
    res.setHeader('X-WP-TotalPages', response.headers['x-wp-totalpages']);
    
    // Devolver la estructura esperada por el frontend
    res.json({
      data: {
        products: response.data,
        pagination: {
          total,
          totalPages,
          page,
          perPage
        }
      },
      success: true
    });
  } catch (error) {
    console.error('Error al obtener productos de WooCommerce:', error);
    res.status(500).json({ error: 'Error al obtener productos de WooCommerce' });
  }
});

// Endpoint para obtener un producto específico de WooCommerce
router.get('/products/:id', async (req, res) => {
  try {
    const productId = req.params.id;
    const api = await getWooCommerceApi();
    
    try {
      const response = await api.get(`products/${productId}`);
      
      // Devolver la estructura esperada por el frontend
      res.json({
        data: response.data,
        success: true
      });
    } catch (apiError: any) {
      // Manejar específicamente errores de la API de WooCommerce
      if (apiError.response && apiError.response.status === 404) {
        return res.status(404).json({
          success: false,
          message: `El producto con ID ${productId} no existe en WooCommerce`,
          error: 'Request failed with status code 404'
        });
      }
      
      // Otros errores de la API
      return res.status(apiError.response?.status || 500).json({
        success: false,
        message: `Error al obtener el producto ${productId} de WooCommerce`,
        error: apiError.message
      });
    }
  } catch (error: any) {
    console.error(`Error al obtener producto ${req.params.id} de WooCommerce:`, error);
    res.status(500).json({ 
      success: false,
      message: `Error al obtener producto ${req.params.id} de WooCommerce`,
      error: error.message
    });
  }
});

/**
 * Convierte un producto de WooCommerce en una pieza en el sistema
 * @param product Producto de WooCommerce validado
 * @returns Resultado de la operación
 */
async function convertProductToPieza(product: z.infer<typeof wooCommerceProductSchema>) {
  try {
    // Extraer datos relevantes del producto
    const nombre = product.name;
    const descripcion = product.description?.replace(/<\/?[^>]+(>|$)/g, '') || nombre; // Eliminar HTML
    const precio = parseFloat(product.price || product.regular_price || '0');
    
    // Extraer metadatos relevantes si existen
    const metaData = product.meta_data || [];
    
    // Función auxiliar para obtener valores de metadatos
    const getMetaValue = (key: string): string => {
      const meta = metaData.find((m: {key: string, value: any}) => m.key === key);
      return meta?.value?.toString() || '';
    };
    
    // Datos del vehículo
    const color = getMetaValue('color');
    const anioVehiculo = getMetaValue('anyoVehiculo');
    const nombreMarca = getMetaValue('nombreMarca');
    const nombreModelo = getMetaValue('nombreModelo');
    const nombreVersion = getMetaValue('nombreVersion');
    const bastidor = getMetaValue('bastidor');
    const matricula = getMetaValue('matricula');
    const combustible = getMetaValue('combustible');
    const kilometraje = getMetaValue('kilometraje');
    const codigoMotor = getMetaValue('codigoMotor');
    const puertas = getMetaValue('puertas');
    const cilindrada = getMetaValue('cilindrada');
    const potenciaHP = getMetaValue('potenciaHP');
    const transmision = getMetaValue('transmision');
    const observacionesPublicas = getMetaValue('observaciones_publicas');
    
    // Crear un objeto con los metadatos de WooCommerce para guardarlos en observaciones
    const wooCommerceData = {
      woocommerce_id: product.id,
      woocommerce_sku: product.sku,
      woocommerce_url: product.permalink,
      woocommerce_images: product.images?.map((img: any) => img.src),
      // Datos adicionales del vehículo
      bastidor,
      matricula,
      color,
      kilometraje,
      anio_vehiculo: anioVehiculo,
      codigo_motor: codigoMotor,
      marca: nombreMarca,
      modelo: nombreModelo,
      version: nombreVersion,
      combustible,
      puertas,
      cilindrada,
      potencia: potenciaHP,
      transmision
    };
    
    // Buscar si existe un vehículo con el mismo bastidor
    let vehiculoId: number | undefined = undefined;
    
    if (bastidor && bastidor.trim() !== '') {
      // Buscar vehículo existente por bastidor
      const vehiculoExistente = await prisma.vehiculo.findFirst({
        where: {
          vin: bastidor
        }
      });
      
      if (vehiculoExistente) {
        console.log(`Vehículo encontrado con bastidor ${bastidor}, ID: ${vehiculoExistente.id}`);
        vehiculoId = vehiculoExistente.id;
      } else {
        // Crear un nuevo vehículo con los datos disponibles
        try {
          // Generar una matrícula única si no viene en los metadatos
          // para evitar conflictos con la restricción @unique
          const matriculaUnica = matricula || `WC-${Date.now().toString().slice(-6)}`;
          
          const nuevoVehiculo = await prisma.vehiculo.create({
            data: {
              marca: nombreMarca || '',
              modelo: nombreModelo || '',
              version: nombreVersion || '',
              anio_fabricacion: parseInt(anioVehiculo) || new Date().getFullYear(),
              color: color || '',
              matricula: matriculaUnica,
              vin: bastidor,
              tipo_combustible: combustible || '',
              kilometros: parseInt(kilometraje) || 0,
              fecha_matriculacion: new Date(),
              estado: 'importado',
              ubicacion_actual: 'Importado de WooCommerce',
              observaciones: `Vehículo creado automáticamente desde WooCommerce. ID producto: ${product.id}`
              // id_cliente es ahora opcional, no necesitamos especificarlo
            }
          });
          console.log(`Nuevo vehículo creado con ID: ${nuevoVehiculo.id}`);
          vehiculoId = nuevoVehiculo.id;
        } catch (error) {
          console.error('Error al crear vehículo:', error);
          // Continuamos sin asociar vehículo si hay error
        }
      }
    }
    
    // Crear la pieza en la base de datos
    // Preparar los datos para crear la pieza
    const piezaData: any = {
      tipo_pieza: product.categories?.[0]?.name || 'Sin categorizar',
      descripcion: `${nombreMarca} ${nombreModelo} - ${nombre}`,
      estado: 'nueva',
      ubicacion_almacen: 'Importado de WooCommerce',
      codigo_qr: product.sku || '',
      fecha_extraccion: new Date(),
      precio_coste: precio * 0.7, // Estimación de precio de coste
      precio_venta: precio,
      reciclable: true,
      bloqueada_venta: false,
      observaciones: observacionesPublicas || product.description || '',
      datos_adicionales: JSON.stringify(wooCommerceData)
    };
    
    // Asignar vehículo si se encontró o creó uno
    if (vehiculoId) {
      piezaData.id_vehiculo = vehiculoId;
    }
    
    const pieza = await prisma.pieza.create({
      data: piezaData
    });
    
    // Si el producto tiene imágenes, guardarlas como fotos de la pieza
    if (product.images && product.images.length > 0) {
      try {
        console.log(`Importando ${product.images.length} imágenes para la pieza ${pieza.id}`);
        
        // Guardar cada imagen como una foto en la base de datos
        for (let i = 0; i < product.images.length; i++) {
          const img = product.images[i];
          const nombre = img.name || `Imagen ${i+1} de WooCommerce`;
          
          // Usamos una aserción de tipo para evitar el error de TypeScript
          // hasta que los tipos de Prisma se actualicen correctamente
          // Asegurarnos de que la URL sea HTTPS para evitar problemas de contenido mixto
          let imageUrl = img.src;
          if (imageUrl.startsWith('http:')) {
            imageUrl = imageUrl.replace('http:', 'https:');
          }
          
          // Guardar la imagen en la base de datos
          await prisma.foto.create({
            data: {
              id_pieza: pieza.id,
              url: imageUrl,
              nombre: nombre,
              descripcion: `Imagen importada de WooCommerce (ID: ${product.id})`,
              fecha_subida: new Date(),
              tamanio: 0, // No podemos determinar el tamaño sin descargar
              es_principal: i === 0, // La primera imagen será la principal
              // @ts-ignore - El campo origen existe en el esquema pero no en los tipos generados
              origen: 'woocommerce' // Para identificar que viene de WooCommerce
            }
          });
          
          console.log(`Foto ${i+1} guardada para la pieza ${pieza.id}: ${img.src}`);
        }
      } catch (error) {
        console.error('Error al guardar las imágenes de WooCommerce:', error);
        // Continuamos aunque falle la importación de imágenes
      }
    }
    
    return {
      success: true,
      message: `Pieza creada correctamente a partir del producto ${product.name}`,
      piezaId: pieza.id
    };
  } catch (error: any) {
    console.error('Error al convertir producto a pieza:', error);
    return {
      success: false,
      message: 'Error al crear la pieza',
      error: error.message
    };
  }
}

// Endpoint para importar todos los productos de WooCommerce como piezas
router.post('/products/import-all', async (req, res) => {
  try {
    const api = await getWooCommerceApi();
    
    // Obtener el total de productos disponibles
    const initialResponse = await api.get('products', { per_page: 1 });
    const totalProducts = parseInt(initialResponse.headers['x-wp-total'] || '0', 10);
    
    if (totalProducts === 0) {
      return res.json({
        success: true,
        message: 'No hay productos disponibles para importar',
        stats: {
          total: 0,
          importadas: 0,
          errores: 0,
          detalles: []
        }
      });
    }
    
    // Configuración para procesamiento por lotes
    const batchSize = 100; // Aumentamos el tamaño del lote para procesar más productos a la vez
    const totalPages = Math.ceil(totalProducts / batchSize);
    
    // Estadísticas de importación
    const stats: ImportacionWooCommerceStats = {
      total: totalProducts,
      importadas: 0,
      errores: 0,
      detalles: []
    };
    
    // Procesar productos por lotes
    for (let page = 1; page <= totalPages; page++) {
      try {
        // Obtener un lote de productos
        const response = await api.get('products', {
          per_page: batchSize,
          page: page
        });
        
        const products = response.data;
        
        // Procesar cada producto del lote
        for (const product of products) {
          try {
            // Verificar si ya existe una pieza con este ID de WooCommerce
            const existingPieza = await prisma.pieza.findFirst({
              where: {
                datos_adicionales: {
                  contains: `"woocommerce_id":${product.id}`
                }
              }
            });
            
            if (existingPieza) {
              stats.detalles.push({
                producto: product.name,
                resultado: {
                  success: false,
                  message: `Ya existe una pieza importada para este producto (ID: ${existingPieza.id})`,
                  piezaId: existingPieza.id
                }
              });
              continue; // Pasar al siguiente producto
            }
            
            // Validar el producto
            const validatedProduct = wooCommerceProductSchema.parse(product);
            
            // Convertir el producto a pieza
            const result = await convertProductToPieza(validatedProduct);
            
            // Actualizar estadísticas
            if (result.success) {
              stats.importadas++;
            } else {
              stats.errores++;
            }
            
            stats.detalles.push({
              producto: product.name,
              resultado: result
            });
          } catch (productError: any) {
            console.error(`Error al procesar producto ${product.id}:`, productError);
            stats.errores++;
            stats.detalles.push({
              producto: product.name || `Producto ${product.id}`,
              resultado: {
                success: false,
                message: `Error al procesar producto ${product.id}`,
                error: productError instanceof Error ? productError.message : 'Error desconocido'
              }
            });
          }
        }
        
        // Pequeña pausa para no sobrecargar el servidor
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (batchError: any) {
        console.error(`Error al procesar lote de productos (página ${page}):`, batchError);
        // Continuamos con el siguiente lote aunque haya error
      }
    }
    
    res.json({
      success: true,
      message: `Importación masiva completada: ${stats.importadas} productos importados, ${stats.errores} errores`,
      stats
    });
  } catch (error: any) {
    console.error('Error en la importación masiva de productos:', error);
    res.status(500).json({
      success: false,
      message: 'Error en la importación masiva de productos',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

// Endpoint para importar un producto como pieza
// Mantenemos ambas rutas para compatibilidad
router.post(['/import-product/:id', '/products/:id/import'], async (req, res) => {
  try {
    const productId = req.params.id;
    const api = await getWooCommerceApi();
    
    // Verificar si ya existe una pieza con este ID de WooCommerce
    const existingPieza = await prisma.pieza.findFirst({
      where: {
        observaciones: {
          contains: `"woocommerce_id":"${productId}"`
        }
      }
    });
    
    if (existingPieza) {
      return res.json({
        success: false,
        message: `Ya existe una pieza importada para este producto (ID: ${existingPieza.id})`,
        piezaId: existingPieza.id
      });
    }
    
    try {
      // Obtener el producto de WooCommerce
      const response = await api.get(`products/${productId}`);
      const product = response.data;
      
      // Validar el producto
      const validatedProduct = wooCommerceProductSchema.parse(product);
      
      // Convertir el producto a pieza
      const result = await convertProductToPieza(validatedProduct);
      
      res.json(result);
    } catch (apiError: any) {
      // Manejar específicamente errores de la API de WooCommerce
      if (apiError.response && apiError.response.status === 404) {
        return res.status(404).json({
          success: false,
          message: `El producto con ID ${productId} no existe en WooCommerce`,
          error: 'Request failed with status code 404'
        });
      }
      
      // Otros errores de la API
      return res.status(apiError.response?.status || 500).json({
        success: false,
        message: `Error al obtener el producto ${productId} de WooCommerce`,
        error: apiError.message
      });
    }
  } catch (error: any) {
    console.error(`Error al importar producto ${req.params.id} de WooCommerce:`, error);
    res.status(500).json({
      success: false,
      message: `Error al importar producto ${req.params.id}`,
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

// Endpoint para sincronizar una pieza con su producto en WooCommerce
router.post('/sync-pieza/:piezaId/:productId', async (req, res) => {
  try {
    const { piezaId, productId } = req.params;
    const api = await getWooCommerceApi();
    
    // Obtener la pieza
    const pieza = await prisma.pieza.findUnique({
      where: {
        id: Number(piezaId)
      }
    });
    
    if (!pieza) {
      return res.status(404).json({
        success: false,
        message: `No se encontró la pieza con ID ${piezaId}`
      });
    }
    
    // Obtener el producto de WooCommerce
    const response = await api.get(`products/${productId}`);
    const product = response.data;
    
    // Validar el producto
    const validatedProduct = wooCommerceProductSchema.parse(product);
    
    // Actualizar la pieza con los datos del producto
    const updatedPieza = await prisma.pieza.update({
      where: { id: Number(piezaId) },
      data: {
        descripcion: product.name,
        tipo_pieza: product.categories && product.categories.length > 0 ? String(product.categories[0].name) : 'General',
        precio_venta: product.price ? parseFloat(product.price) : 0,
        observaciones: JSON.stringify({
          woocommerce_id: product.id.toString(),
          woocommerce_url: product.permalink,
          woocommerce_data: JSON.stringify(product),
          categorias: product.categories ? product.categories.map((c: { name: string }) => c.name) : [],
          caracteristicas: JSON.stringify(product.attributes)
        })
      }
    });

    // Procesar imágenes si existen
    if (product.images && product.images.length > 0) {
      // Eliminar fotos existentes
      await prisma.foto.deleteMany({
        where: { id_pieza: Number(piezaId) }
      });

      // Añadir nuevas fotos
      for (const image of product.images) {
        // Descargar la imagen y guardarla localmente
        try {
          const response = await axios.get(image.src, { responseType: 'arraybuffer' });
          const uploadDir = path.join(process.cwd(), 'uploads', 'piezas', String(piezaId));
          
          // Crear directorio si no existe
          if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
          }
          
          const filename = `${Date.now()}_${path.basename(image.src)}`;
          const filepath = path.join(uploadDir, filename);
          
          fs.writeFileSync(filepath, Buffer.from(response.data));
          
          // Crear registro de foto
          await prisma.foto.create({
            data: {
              id_pieza: Number(piezaId),
              nombre: image.name || filename,
              descripcion: image.alt || 'Imagen importada de WooCommerce',
              es_principal: image === product.images[0], // Primera imagen como principal
              fecha_subida: new Date(),
              url: `/uploads/piezas/${piezaId}/${filename}`,
              tamanio: fs.statSync(filepath).size
            }
          });
        } catch (error) {
          console.error(`Error al procesar imagen ${image.src}:`, error);
        }
      }
    }
    
    res.json({
      success: true,
      message: `Pieza ${piezaId} sincronizada correctamente con el producto ${productId}`
    });
  } catch (error) {
    console.error(`Error al sincronizar pieza ${req.params.piezaId} con producto ${req.params.productId}:`, error);
    res.status(500).json({
      success: false,
      message: `Error al sincronizar pieza ${req.params.piezaId} con producto ${req.params.productId}`,
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

export default router;
