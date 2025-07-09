import express from 'express';
import { prisma } from '../index.js';

const router = express.Router();

// Obtener todas las campas
router.get('/', async (req, res) => {
  try {
    const campas = await prisma.campaAlmacenamiento.findMany({
      orderBy: { nombre: 'asc' }
    });
    res.json(campas);
  } catch (error) {
    console.error('Error al obtener campas:', error);
    res.status(500).json({ error: 'Error interno al obtener las campas' });
  }
});

// Obtener una campa por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const campa = await prisma.campaAlmacenamiento.findUnique({
      where: { id: Number(id) },
      include: {
        vehiculos: true // Incluir los vehículos asociados a la campa
      }
    });

    if (!campa) {
      return res.status(404).json({ error: 'Campa no encontrada' });
    }

    res.json(campa);
  } catch (error) {
    console.error(`Error al obtener campa con ID ${req.params.id}:`, error);
    res.status(500).json({ error: 'Error interno al obtener la campa' });
  }
});

// Crear una nueva campa
router.post('/', async (req, res) => {
  try {
    const {
      nombre,
      direccion,
      ubicacion_gps,
      capacidad_maxima,
      estado,
      observaciones
    } = req.body;

    // Validar datos obligatorios
    if (!nombre || !direccion || !capacidad_maxima || !estado) {
      return res.status(400).json({ error: 'Los campos nombre, dirección, capacidad máxima y estado son obligatorios' });
    }

    const nuevaCampa = await prisma.campaAlmacenamiento.create({
      data: {
        nombre,
        direccion,
        ubicacion_gps,
        capacidad_maxima: Number(capacidad_maxima),
        estado,
        observaciones,
      }
    });

    res.status(201).json(nuevaCampa);
  } catch (error) {
    console.error('Error al crear la campa:', error);
    res.status(500).json({ error: 'Error interno al crear la campa' });
  }
});

// Actualizar una campa existente
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nombre,
      direccion,
      ubicacion_gps,
      capacidad_maxima,
      estado,
      observaciones
    } = req.body;

    // Validar datos obligatorios
    if (!nombre || !direccion || !capacidad_maxima || !estado) {
      return res.status(400).json({ error: 'Los campos nombre, dirección, capacidad máxima y estado son obligatorios' });
    }

    const campaActualizada = await prisma.campaAlmacenamiento.update({
      where: { id: Number(id) },
      data: {
        nombre,
        direccion,
        ubicacion_gps,
        capacidad_maxima: Number(capacidad_maxima),
        estado,
        observaciones,
      }
    });

    res.json(campaActualizada);
  } catch (error) {
    console.error(`Error al actualizar la campa con ID ${req.params.id}:`, error);
    res.status(500).json({ error: 'Error interno al actualizar la campa' });
  }
});

// Eliminar una campa
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar si la campa tiene vehículos asociados
    const campaConVehiculos = await prisma.campaAlmacenamiento.findUnique({
        where: { id: Number(id) },
        include: { vehiculos: true }
    });

    if (!campaConVehiculos) {
        return res.status(404).json({ error: 'Campa no encontrada' });
    }

    if (campaConVehiculos.vehiculos.length > 0) {
      return res.status(400).json({
        error: 'No se puede eliminar la campa porque tiene vehículos asociados. Reasigne los vehículos primero.'
      });
    }

    await prisma.campaAlmacenamiento.delete({
      where: { id: Number(id) }
    });

    res.json({ message: 'Campa eliminada correctamente' });
  } catch (error) {
    console.error(`Error al eliminar la campa con ID ${req.params.id}:`, error);
    res.status(500).json({ error: 'Error interno al eliminar la campa' });
  }
});

export default router;
