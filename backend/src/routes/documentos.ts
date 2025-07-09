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
    const uploadDir = path.join(process.cwd(), 'uploads', 'documentos');
    
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
    // Validar tipos de archivo permitidos
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
      'image/jpeg',
      'image/png'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de archivo no permitido. Solo se permiten PDF, DOC, DOCX, XLS, XLSX, TXT, JPG, JPEG y PNG.'));
    }
  }
});

// GET - Obtener documentos por ID de pieza
router.get('/', async (req, res, next) => {
  try {
    const { id_pieza } = req.query;
    
    if (!id_pieza) {
      return res.status(400).json({ error: 'Se requiere el ID de la pieza' });
    }
    
        const documentos = await (prisma as any).documento.findMany({
      where: { 
        id_pieza: Number(id_pieza)
      }
    });
    
    // Construir URLs completas para los documentos
    const documentosConURL = documentos.map((doc: any) => ({
      ...doc,
      url: `${req.protocol}://${req.get('host')}/uploads/documentos/${doc.url}`,
    }));
    
    res.json(documentosConURL);
  } catch (error) {
    next(error);
  }
});

// GET - Obtener un documento por ID
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const documento = await (prisma as any).documento.findUnique({
      where: { id: Number(id) },
    });
    
    if (!documento) {
      return res.status(404).json({ error: 'Documento no encontrado' });
    }
    
    // Construir URL completa
    const documentoConURL = {
      ...documento,
      url: `${req.protocol}://${req.get('host')}/uploads/documentos/${path.basename(documento.url)}`
    };
    
    res.json(documentoConURL);
  } catch (error) {
    next(error);
  }
});

// POST - Subir un nuevo documento para una pieza
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
    
    // Crear el registro del documento en la base de datos
        const documento = await (prisma as any).documento.create({
      data: {
        id_pieza: Number(piezaId),
        nombre: req.body.nombre || file.originalname,
        tipo: file.mimetype,
        url: file.filename,
        tamanio: file.size,
      }
    });
    
    // Construir URL completa para el documento
    const documentoConURL = {
      ...documento,
      url: `${req.protocol}://${req.get('host')}/uploads/documentos/${file.filename}`
    };
    
    res.status(201).json(documentoConURL);
  } catch (error) {
    // Si hay un error, eliminar el archivo si se subió
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    next(error);
  }
});

// DELETE - Eliminar un documento
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Buscar el documento para obtener la ruta del archivo
    const documento = await (prisma as any).documento.findUnique({
      where: { id: Number(id) },
    });
    
    if (!documento) {
      return res.status(404).json({ error: 'Documento no encontrado' });
    }
    
    // Eliminar el archivo físico
    const filePath = path.join(process.cwd(), 'uploads', 'documentos', documento.url);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    // Eliminar el registro de la base de datos
    await (prisma as any).documento.delete({
      where: { id: Number(id) },
    });
    
    res.json({ message: 'Documento eliminado correctamente' });
  } catch (error) {
    next(error);
  }
});

export default router;
