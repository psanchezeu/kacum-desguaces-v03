import express from 'express';
import { prisma } from '../index.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Configuración de multer para subida de archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads', 'logos');
    // Crear directorio si no existe
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueFilename = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueFilename);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Formato de archivo no soportado. Solo se permiten JPG, PNG, GIF y WEBP.') as any);
    }
  }
});

/**
 * @route GET /api/configuracion
 * @desc Obtener todas las configuraciones
 */
router.get('/', async (req, res) => {
  try {
    const configuraciones = await prisma.configuracion.findMany({
      orderBy: { categoria: 'asc' }
    });
    
    // Organizamos las configuraciones por categoría para facilitar su uso en el frontend
    const configuracionesPorCategoria: Record<string, any> = {};
    
    configuraciones.forEach(config => {
      if (!configuracionesPorCategoria[config.categoria]) {
        configuracionesPorCategoria[config.categoria] = {};
      }
      
      // Convertimos el valor según su tipo
      let valorProcesado: string | number | boolean | object = config.valor;
      if (config.tipo === 'numero') {
        valorProcesado = parseFloat(config.valor);
      } else if (config.tipo === 'booleano') {
        valorProcesado = config.valor === 'true';
      } else if (config.tipo === 'json') {
        try {
          valorProcesado = JSON.parse(config.valor);
        } catch (error) {
          console.error(`Error al parsear JSON para la configuración ${config.clave}:`, error);
        }
      }
      
      configuracionesPorCategoria[config.categoria][config.clave] = valorProcesado;
    });
    
    res.json(configuracionesPorCategoria);
  } catch (error) {
    console.error('Error al obtener configuraciones:', error);
    res.status(500).json({ error: 'Error al obtener configuraciones' });
  }
});

/**
 * @route GET /api/configuracion/categoria/:categoria
 * @desc Obtener configuraciones por categoría
 */
router.get('/categoria/:categoria', async (req, res) => {
  try {
    const { categoria } = req.params;
    
    const configuraciones = await prisma.configuracion.findMany({
      where: { categoria }
    });
    
    // Convertimos a un objeto más fácil de usar
    const configuracionesObj: Record<string, any> = {};
    
    configuraciones.forEach(config => {
      // Convertimos el valor según su tipo
      let valorProcesado: string | number | boolean | object = config.valor;
      if (config.tipo === 'numero') {
        valorProcesado = parseFloat(config.valor);
      } else if (config.tipo === 'booleano') {
        valorProcesado = config.valor === 'true';
      } else if (config.tipo === 'json') {
        try {
          valorProcesado = JSON.parse(config.valor);
        } catch (error) {
          console.error(`Error al parsear JSON para la configuración ${config.clave}:`, error);
        }
      }
      
      configuracionesObj[config.clave] = valorProcesado;
    });
    
    res.json(configuracionesObj);
  } catch (error) {
    console.error(`Error al obtener configuraciones de categoría ${req.params.categoria}:`, error);
    res.status(500).json({ error: 'Error al obtener configuraciones por categoría' });
  }
});

/**
 * @route POST /api/configuracion
 * @desc Guardar una configuración
 */
router.post('/', async (req, res) => {
  try {
    const { clave, valor, tipo, categoria, descripcion } = req.body;
    
    if (!clave || !valor || !tipo || !categoria) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }
    
    // Convertimos el valor a string para almacenarlo
    let valorString: string;
    if (typeof valor === 'object') {
      valorString = JSON.stringify(valor);
    } else {
      valorString = String(valor);
    }
    
    // Intentamos actualizar primero, si no existe lo creamos
    const configuracion = await prisma.configuracion.upsert({
      where: { clave },
      update: { 
        valor: valorString,
        tipo,
        categoria,
        descripcion,
        fecha_actualizacion: new Date(),
        usuario_actualizacion: req.body.usuario_actualizacion || 'sistema'
      },
      create: {
        clave,
        valor: valorString,
        tipo,
        categoria,
        descripcion,
        usuario_actualizacion: req.body.usuario_actualizacion || 'sistema'
      }
    });
    
    res.json(configuracion);
  } catch (error) {
    console.error('Error al guardar configuración:', error);
    res.status(500).json({ error: 'Error al guardar configuración' });
  }
});

/**
 * @route PUT /api/configuracion/categoria/:categoria
 * @desc Actualizar múltiples configuraciones de una categoría
 */
router.put('/categoria/:categoria', async (req, res) => {
  try {
    const { categoria } = req.params;
    const configuraciones = req.body;
    
    if (!configuraciones || typeof configuraciones !== 'object') {
      return res.status(400).json({ error: 'Formato de datos inválido' });
    }
    
    const resultados = [];
    
    // Procesamos cada configuración
    for (const [clave, valor] of Object.entries(configuraciones)) {
      // Determinamos el tipo de dato
      let tipo = 'texto';
      if (typeof valor === 'number') {
        tipo = 'numero';
      } else if (typeof valor === 'boolean') {
        tipo = 'booleano';
      } else if (typeof valor === 'object') {
        tipo = 'json';
      }
      
      // Convertimos el valor a string para almacenarlo
      let valorString: string;
      if (typeof valor === 'object') {
        valorString = JSON.stringify(valor);
      } else {
        valorString = String(valor);
      }
      
      // Actualizamos o creamos la configuración
      const config = await prisma.configuracion.upsert({
        where: { clave },
        update: { 
          valor: valorString,
          tipo,
          categoria,
          fecha_actualizacion: new Date(),
          usuario_actualizacion: req.body.usuario_actualizacion || 'sistema'
        },
        create: {
          clave,
          valor: valorString,
          tipo,
          categoria,
          descripcion: `Configuración de ${categoria}`,
          usuario_actualizacion: req.body.usuario_actualizacion || 'sistema'
        }
      });
      
      resultados.push(config);
    }
    
    res.json({ mensaje: `${resultados.length} configuraciones actualizadas`, resultados });
  } catch (error) {
    console.error(`Error al actualizar configuraciones de categoría ${req.params.categoria}:`, error);
    res.status(500).json({ error: 'Error al actualizar configuraciones' });
  }
});

/**
 * @route DELETE /api/configuracion/:clave
 * @desc Eliminar una configuración
 */
router.delete('/:clave', async (req, res) => {
  try {
    const { clave } = req.params;
    
    await prisma.configuracion.delete({
      where: { clave }
    });
    
    res.json({ mensaje: `Configuración ${clave} eliminada correctamente` });
  } catch (error) {
    console.error(`Error al eliminar configuración ${req.params.clave}:`, error);
    res.status(500).json({ error: 'Error al eliminar configuración' });
  }
});

/**
 * @route POST /api/configuracion/logo
 * @desc Subir logo de la empresa
 */
router.post('/logo', upload.single('logo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se ha proporcionado ningún archivo' });
    }

    // Construir la URL relativa del logo
    const logoUrl = `/uploads/logos/${req.file.filename}`;

    // Guardar la URL en la configuración
    await prisma.configuracion.upsert({
      where: { clave: 'logo_url' },
      update: {
        valor: logoUrl,
        fecha_actualizacion: new Date(),
        usuario_actualizacion: req.body.usuario_actualizacion || 'sistema'
      },
      create: {
        clave: 'logo_url',
        valor: logoUrl,
        tipo: 'texto',
        categoria: 'general',
        descripcion: 'URL del logo de la empresa',
        usuario_actualizacion: req.body.usuario_actualizacion || 'sistema'
      }
    });

    res.json({ url: logoUrl });
  } catch (error) {
    console.error('Error al subir el logo:', error);
    res.status(500).json({ error: 'Error al subir el logo' });
  }
});

export default router;
