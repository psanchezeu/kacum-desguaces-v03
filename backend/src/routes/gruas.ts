import express from 'express';
import { prisma } from '../index.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Configuración de multer para subida de documentos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(process.cwd(), 'uploads', 'documentos-gruas');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB límite
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif|pdf|doc|docx|xls|xlsx/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error("Error: Archivo no válido. Solo se permiten imágenes y documentos."));
  }
});

// Obtener todas las grúas
router.get('/', async (req, res) => {
  try {
    const gruas = await prisma.grua.findMany({
      orderBy: { id: 'asc' }
    });
    res.json(gruas);
  } catch (error) {
    console.error('Error al obtener grúas:', error);
    res.status(500).json({ error: 'Error al obtener grúas' });
  }
});

// Obtener una grúa por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const grua = await prisma.grua.findUnique({
      where: { id: Number(id) },
      include: {
        mantenimientos: true,
        solicitudesRecogida: {
          include: {
            cliente: true,
            vehiculo: true
          }
        }
      }
    });
    
    if (!grua) {
      return res.status(404).json({ error: 'Grúa no encontrada' });
    }
    
    res.json(grua);
  } catch (error) {
    console.error('Error al obtener grúa:', error);
    res.status(500).json({ error: 'Error al obtener grúa' });
  }
});

// Crear una nueva grúa
router.post('/', async (req, res) => {
  try {
    const { 
      matricula, 
      modelo, 
      capacidad_kg, 
      conductor_asignado, 
      estado, 
      gps_ultimo_punto, 
      fecha_ultimo_mantenimiento, 
      kilometraje, 
      itv_estado, 
      itv_fecha 
    } = req.body;
    
    // Validar datos obligatorios
    if (!matricula || !modelo || !capacidad_kg || !conductor_asignado || !estado) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }
    
    // Comprobar si ya existe una grúa con la misma matrícula
    const existingGrua = await prisma.grua.findUnique({
      where: { matricula }
    });
    
    if (existingGrua) {
      return res.status(400).json({ error: 'Ya existe una grúa con esa matrícula' });
    }
    
    const nuevaGrua = await prisma.grua.create({
      data: {
        matricula,
        modelo,
        capacidad_kg: Number(capacidad_kg),
        conductor_asignado,
        estado,
        gps_ultimo_punto,
        fecha_ultimo_mantenimiento: new Date(fecha_ultimo_mantenimiento),
        kilometraje: Number(kilometraje),
        itv_estado,
        itv_fecha: new Date(itv_fecha)
      }
    });
    
    res.status(201).json(nuevaGrua);
  } catch (error) {
    console.error('Error al crear grúa:', error);
    res.status(500).json({ error: 'Error al crear grúa' });
  }
});

// Actualizar una grúa existente
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      matricula, 
      modelo, 
      capacidad_kg, 
      conductor_asignado, 
      estado, 
      gps_ultimo_punto, 
      fecha_ultimo_mantenimiento, 
      kilometraje, 
      itv_estado, 
      itv_fecha 
    } = req.body;
    
    // Validar datos obligatorios
    if (!matricula || !modelo || !capacidad_kg || !conductor_asignado || !estado) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }
    
    // Comprobar si ya existe otra grúa con la misma matrícula
    const existingGrua = await prisma.grua.findFirst({
      where: { 
        matricula,
        NOT: { id: Number(id) }
      }
    });
    
    if (existingGrua) {
      return res.status(400).json({ error: 'Ya existe otra grúa con esa matrícula' });
    }
    
    const gruaActualizada = await prisma.grua.update({
      where: { id: Number(id) },
      data: {
        matricula,
        modelo,
        capacidad_kg: Number(capacidad_kg),
        conductor_asignado,
        estado,
        gps_ultimo_punto,
        fecha_ultimo_mantenimiento: new Date(fecha_ultimo_mantenimiento),
        kilometraje: Number(kilometraje),
        itv_estado,
        itv_fecha: new Date(itv_fecha)
      }
    });
    
    res.json(gruaActualizada);
  } catch (error) {
    console.error('Error al actualizar grúa:', error);
    res.status(500).json({ error: 'Error al actualizar grúa' });
  }
});

// Eliminar una grúa
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar si la grúa tiene mantenimientos o solicitudes asociadas
    const gruaConRelaciones = await prisma.grua.findUnique({
      where: { id: Number(id) },
      include: {
        mantenimientos: true,
        solicitudesRecogida: true
      }
    });
    
    if (!gruaConRelaciones) {
      return res.status(404).json({ error: 'Grúa no encontrada' });
    }
    
    if (gruaConRelaciones.mantenimientos.length > 0 || gruaConRelaciones.solicitudesRecogida.length > 0) {
      return res.status(400).json({ 
        error: 'No se puede eliminar la grúa porque tiene mantenimientos o solicitudes asociadas' 
      });
    }
    
    await prisma.grua.delete({
      where: { id: Number(id) }
    });
    
    res.json({ message: 'Grúa eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar grúa:', error);
    res.status(500).json({ error: 'Error al eliminar grúa' });
  }
});

// Rutas para mantenimientos de grúas

// Obtener todos los mantenimientos de una grúa
router.get('/:id/mantenimientos', async (req, res) => {
  try {
    const { id } = req.params;
    const mantenimientos = await prisma.mantenimientoGrua.findMany({
      where: { id_grua: Number(id) },
      orderBy: { fecha: 'desc' }
    });
    
    res.json(mantenimientos);
  } catch (error) {
    console.error('Error al obtener mantenimientos:', error);
    res.status(500).json({ error: 'Error al obtener mantenimientos' });
  }
});

// Crear un nuevo mantenimiento para una grúa
router.post('/:id/mantenimientos', upload.single('documento'), async (req, res) => {
  try {
    const { id } = req.params;
    const { tipo, fecha, realizado_por } = req.body;
    
    // Validar datos obligatorios
    if (!tipo || !fecha || !realizado_por) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }
    
    // Verificar si la grúa existe
    const grua = await prisma.grua.findUnique({
      where: { id: Number(id) }
    });
    
    if (!grua) {
      return res.status(404).json({ error: 'Grúa no encontrada' });
    }
    
    let url_documento = null;
    if (req.file) {
      url_documento = `/uploads/documentos-gruas/${req.file.filename}`;
    }
    
    const nuevoMantenimiento = await prisma.mantenimientoGrua.create({
      data: {
        id_grua: Number(id),
        tipo,
        fecha: new Date(fecha),
        realizado_por,
        url_documento
      }
    });
    
    // Actualizar la fecha de último mantenimiento de la grúa
    await prisma.grua.update({
      where: { id: Number(id) },
      data: {
        fecha_ultimo_mantenimiento: new Date(fecha)
      }
    });
    
    res.status(201).json(nuevoMantenimiento);
  } catch (error) {
    console.error('Error al crear mantenimiento:', error);
    res.status(500).json({ error: 'Error al crear mantenimiento' });
  }
});

// Eliminar un mantenimiento
router.delete('/mantenimientos/:idMantenimiento', async (req, res) => {
  try {
    const { idMantenimiento } = req.params;
    
    const mantenimiento = await prisma.mantenimientoGrua.findUnique({
      where: { id: Number(idMantenimiento) }
    });
    
    if (!mantenimiento) {
      return res.status(404).json({ error: 'Mantenimiento no encontrado' });
    }
    
    // Si hay un documento asociado, eliminarlo
    if (mantenimiento.url_documento) {
      const filePath = path.join(process.cwd(), mantenimiento.url_documento.replace('/uploads', 'uploads'));
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    
    await prisma.mantenimientoGrua.delete({
      where: { id: Number(idMantenimiento) }
    });
    
    res.json({ message: 'Mantenimiento eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar mantenimiento:', error);
    res.status(500).json({ error: 'Error al eliminar mantenimiento' });
  }
});

export default router;
