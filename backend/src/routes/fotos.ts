import express from 'express';
import { prisma } from '../index.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Configuración de multer para almacenar archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads', 'fotos');
    
    // Crear directorio si no existe
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generar nombre único para evitar colisiones
    const uniqueName = `${Date.now()}-${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Límite de 10MB
  fileFilter: (req, file, cb) => {
    // Validar que sea una imagen
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos de imagen'));
    }
  }
});

// GET - Obtener fotos por ID de pieza
router.get('/', async (req, res, next) => {
  try {
    const { id_pieza } = req.query;
    
    if (!id_pieza) {
      return res.status(400).json({ error: 'Se requiere el ID de la pieza' });
    }
    
    // Usar prismaAny para evitar errores de TypeScript
    const fotos = await (prisma as any).foto.findMany({
      where: { 
        id_pieza: Number(id_pieza)
      },
    });
    
    // Construir URLs completas para las fotos, distinguiendo entre URLs locales y externas
    const fotosConURL = fotos.map((foto: any) => {
      // Si la foto tiene origen 'woocommerce' o la URL ya es una URL completa, mantenerla tal cual
      if (foto.origen === 'woocommerce' || foto.url.startsWith('http://') || foto.url.startsWith('https://')) {
        return {
          ...foto
        };
      } else {
        // Para fotos locales, construir la URL completa
        return {
          ...foto,
          url: `${req.protocol}://${req.get('host')}/uploads/fotos/${path.basename(foto.url)}`
        };
      }
    });
    
    res.json(fotosConURL);
  } catch (error) {
    next(error);
  }
});

// GET - Obtener una foto por ID
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const foto = await (prisma as any).foto.findUnique({
      where: { id: Number(id) },
    });
    
    if (!foto) {
      return res.status(404).json({ error: 'Foto no encontrada' });
    }
    
    // Construir URL completa, distinguiendo entre URLs locales y externas
    let fotoConURL;
    
    // Si la foto tiene origen 'woocommerce' o la URL ya es una URL completa, mantenerla tal cual
    if (foto.origen === 'woocommerce' || foto.url.startsWith('http://') || foto.url.startsWith('https://')) {
      fotoConURL = {
        ...foto
      };
    } else {
      // Para fotos locales, construir la URL completa
      fotoConURL = {
        ...foto,
        url: `${req.protocol}://${req.get('host')}/uploads/fotos/${path.basename(foto.url)}`
      };
    }
    
    res.json(fotoConURL);
  } catch (error) {
    next(error);
  }
});

// POST - Subir una nueva foto para una pieza
router.post('/upload/:piezaId', upload.single('file'), async (req, res, next) => {
  try {
    const { piezaId } = req.params;
    const file = req.file;
    
    if (!file) {
      return res.status(400).json({ error: 'No se ha proporcionado ningún archivo' });
    }
    
    // Verificar si la pieza existe
    const pieza = await (prisma as any).pieza.findUnique({
      where: { id: Number(piezaId) },
    });
    
    if (!pieza) {
      // Eliminar el archivo subido si la pieza no existe
      fs.unlinkSync(file.path);
      return res.status(404).json({ error: 'Pieza no encontrada' });
    }
    
    // Verificar si hay otras fotos para esta pieza
    const fotosCount = await (prisma as any).foto.count({
      where: { 
        id_pieza: Number(piezaId)
      },
    });
    
    // Si es la primera foto, establecerla como principal
    const esPrincipal = fotosCount === 0;
    
    // Crear el registro de la foto en la base de datos
    const foto = await (prisma as any).foto.create({
      data: {
        id_pieza: Number(piezaId),
        nombre: req.body.nombre || file.originalname,
        descripcion: req.body.descripcion || null,
        url: file.filename,
        tamanio: file.size,
        es_principal: esPrincipal,
        origen: req.body.origen || 'manual', // Usar el origen proporcionado o 'manual' por defecto
      },
    });
    
    // Construir URL completa para la foto
    const fotoConURL = {
      ...foto,
      url: `${req.protocol}://${req.get('host')}/uploads/fotos/${file.filename}`
    };
    
    res.status(201).json(fotoConURL);
  } catch (error) {
    // Si hay un error, eliminar el archivo si se subió
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    next(error);
  }
});

// PUT - Establecer una foto como principal
router.put('/:id/principal', async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Buscar la foto
    const foto = await (prisma as any).foto.findUnique({
      where: { id: Number(id) },
    });
    
    if (!foto) {
      return res.status(404).json({ error: 'Foto no encontrada' });
    }
    
    // Actualizar todas las fotos de la pieza para quitar el estado principal
    await (prisma as any).foto.updateMany({
      where: { 
        id_pieza: foto.id_pieza
      },
      data: { es_principal: false },
    });
    
    // Establecer esta foto como principal
    const fotoActualizada = await (prisma as any).foto.update({
      where: { id: Number(id) },
      data: { es_principal: true },
    });
    
    // Construir URL completa
    const fotoConURL = {
      ...fotoActualizada,
      url: `${req.protocol}://${req.get('host')}/uploads/fotos/${path.basename(fotoActualizada.url)}`
    };
    
    res.json(fotoConURL);
  } catch (error) {
    next(error);
  }
});

// PUT - Actualizar metadatos de una foto
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion } = req.body;
    
    // Buscar la foto
    const foto = await (prisma as any).foto.findUnique({
      where: { id: Number(id) },
    });
    
    if (!foto) {
      return res.status(404).json({ error: 'Foto no encontrada' });
    }
    
    // Actualizar metadatos
    const fotoActualizada = await (prisma as any).foto.update({
      where: { id: Number(id) },
      data: {
        nombre: nombre !== undefined ? nombre : foto.nombre,
        descripcion: descripcion !== undefined ? descripcion : foto.descripcion,
      },
    });
    
    // Construir URL completa
    const fotoConURL = {
      ...fotoActualizada,
      url: `${req.protocol}://${req.get('host')}/uploads/fotos/${path.basename(fotoActualizada.url)}`
    };
    
    res.json(fotoConURL);
  } catch (error) {
    next(error);
  }
});

// DELETE - Eliminar una foto
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Buscar la foto para obtener la ruta del archivo
    const foto = await (prisma as any).foto.findUnique({
      where: { id: Number(id) },
    });
    
    if (!foto) {
      return res.status(404).json({ error: 'Foto no encontrada' });
    }
    
    // Eliminar el archivo físico
    const filePath = path.join(process.cwd(), 'uploads', 'fotos', foto.url);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    // Verificar si es la foto principal
    const esPrincipal = foto.es_principal;
    
    // Eliminar el registro de la base de datos
    await (prisma as any).foto.delete({
      where: { id: Number(id) },
    });
    
    // Si era la foto principal, establecer otra foto como principal
    if (esPrincipal) {
      const otraFoto = await (prisma as any).foto.findFirst({
        where: { 
          id_pieza: foto.id_pieza
        },
      });
      
      if (otraFoto) {
        await (prisma as any).foto.update({
          where: { id: otraFoto.id },
          data: { es_principal: true },
        });
      }
    }
    
    res.json({ message: 'Foto eliminada correctamente' });
  } catch (error) {
    next(error);
  }
});

export default router;
