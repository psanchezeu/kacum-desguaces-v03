import express from 'express';
import { prisma } from '../index.js';
import { z } from 'zod';

const router = express.Router();

// Schema de validación para Vehículo
const VehiculoSchema = z.object({
  id_cliente: z.number().int().positive("ID de cliente inválido").optional().nullable(),
  marca: z.string().min(1, "La marca es obligatoria"),
  modelo: z.string().min(1, "El modelo es obligatorio"),
  version: z.string().optional().nullable(),
  anio_fabricacion: z.number().int().min(1900).max(new Date().getFullYear() + 1),
  color: z.string().min(1, "El color es obligatorio"),
  matricula: z.string().min(1, "La matrícula es obligatoria"),
  vin: z.string().length(17, "El VIN debe tener 17 caracteres").optional().nullable(),
  tipo_combustible: z.string().min(1, "El tipo de combustible es obligatorio"),
  kilometros: z.number().int().nonnegative("Los kilómetros no pueden ser negativos"),
  fecha_matriculacion: z.coerce.date(),
  estado: z.string().min(1, "El estado es obligatorio"),
  ubicacion_actual: z.string().min(1, "La ubicación actual es obligatoria"),
  ubicacion_gps: z.string().optional().nullable(),
  observaciones: z.string().optional().nullable(),
});

const UpdateVehiculoSchema = VehiculoSchema.partial();

// GET - Obtener todos los vehículos con paginación
router.get('/', async (req, res, next) => {
  try {
    const { page = '1', limit = '50', count = 'false' } = req.query;
    
    // Convertir parámetros a números
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const offset = (pageNum - 1) * limitNum;
    const needCount = count === 'true';
    
    // Obtener el total de registros si se solicita
    let total = 0;
    if (needCount) {
      total = await prisma.vehiculo.count();
    }
    
    // Obtener vehículos paginados
    const vehiculos = await prisma.vehiculo.findMany({
      skip: offset,
      take: limitNum,
      include: {
        cliente: {
          select: {
            id: true,
            nombre: true,
            apellidos: true,
            telefono: true,
            email: true,
          },
        },
      },
    });
    
    // Devolver resultados con metadatos de paginación
    res.json({
      data: vehiculos,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: needCount ? total : undefined,
        totalPages: needCount ? Math.ceil(total / limitNum) : undefined
      }
    });
  } catch (error) {
    next(error);
  }
});

// GET - Obtener vehículos por cliente
router.get('/cliente/:clienteId', async (req, res, next) => {
  try {
    const { clienteId } = req.params;
    const clienteIdNum = parseInt(clienteId, 10);
    
    if (isNaN(clienteIdNum)) {
      return res.status(400).json({ error: 'ID de cliente inválido' });
    }
    
    const vehiculos = await prisma.vehiculo.findMany({
      where: {
        id_cliente: clienteIdNum
      },
      include: {
        cliente: {
          select: {
            id: true,
            nombre: true,
            apellidos: true,
            dni_nif: true,
          },
        },
      },
    });
    
    res.json(vehiculos);
  } catch (error) {
    next(error);
  }
});

// GET - Obtener un vehículo por ID
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const vehiculo = await prisma.vehiculo.findUnique({
      where: { id: Number(id) },
      include: {
        cliente: true,
        piezas: true,
        documentos: true,
        solicitudesRecogida: true,
      },
    });

    if (!vehiculo) {
      return res.status(404).json({ error: 'Vehículo no encontrado' });
    }

    res.json(vehiculo);
  } catch (error) {
    next(error);
  }
});

// GET - Obtener vehículos por cliente
router.get('/cliente/:clienteId', async (req, res, next) => {
  try {
    const { clienteId } = req.params;
    const vehiculos = await prisma.vehiculo.findMany({
      where: { id_cliente: Number(clienteId) },
    });
    res.json(vehiculos);
  } catch (error) {
    next(error);
  }
});

// POST - Crear un nuevo vehículo
router.post('/', async (req, res, next) => {
  try {
    const validationResult = VehiculoSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ 
        error: 'Datos de vehículo inválidos',
        details: validationResult.error.format() 
      });
    }

    const { data } = validationResult;

    // Prisma espera 'undefined' para los campos nulos opcionales, no 'null'.
    // Transformamos los valores 'null' a 'undefined' para que Prisma los ignore correctamente.
    const vehiculoData = Object.entries(data).reduce((acc, [key, value]) => {
      if (value !== null) {
        acc[key] = value;
      }
      return acc;
    }, {} as any);
    
    // Verificar si el cliente existe
    const clienteExiste = await prisma.cliente.findUnique({
      where: { id: vehiculoData.id_cliente },
    });

    if (!clienteExiste) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    // Verificar si ya existe un vehículo con la misma matrícula o VIN
    const existingVehiculo = await prisma.vehiculo.findFirst({
      where: {
        OR: [
          { matricula: vehiculoData.matricula },
          { vin: vehiculoData.vin }
        ]
      },
    });

    if (existingVehiculo) {
      return res.status(409).json({ 
        error: 'Ya existe un vehículo con esa matrícula o VIN',
        conflicto: existingVehiculo.matricula === vehiculoData.matricula ? 'matricula' : 'vin'
      });
    }

    const nuevoVehiculo = await prisma.vehiculo.create({
      data: vehiculoData,
    });

    res.status(201).json(nuevoVehiculo);
  } catch (error) {
    next(error);
  }
});

// PUT - Actualizar un vehículo existente
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const validationResult = UpdateVehiculoSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ 
        error: 'Datos de vehículo inválidos',
        details: validationResult.error.format() 
      });
    }

    const { data } = validationResult;

    // Prisma espera 'undefined' para los campos nulos opcionales, no 'null'.
    // Transformamos los valores 'null' a 'undefined' para que Prisma los ignore correctamente.
    const vehiculoData = Object.entries(data).reduce((acc, [key, value]) => {
      if (value !== null) {
        acc[key] = value;
      }
      return acc;
    }, {} as any);
    
    // Verificar si el vehículo existe
    const existingVehiculo = await prisma.vehiculo.findUnique({
      where: { id: Number(id) },
    });

    if (!existingVehiculo) {
      return res.status(404).json({ error: 'Vehículo no encontrado' });
    }

    // Verificar si el cliente existe
    const clienteExiste = await prisma.cliente.findUnique({
      where: { id: vehiculoData.id_cliente },
    });

    if (!clienteExiste) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    // Verificar si la matrícula o VIN actualizados ya existen en otro vehículo
    if (vehiculoData.matricula !== existingVehiculo.matricula || vehiculoData.vin !== existingVehiculo.vin) {
      const vehiculoConflicto = await prisma.vehiculo.findFirst({
        where: {
          id: { not: Number(id) },
          OR: [
            { matricula: vehiculoData.matricula },
            { vin: vehiculoData.vin }
          ]
        },
      });

      if (vehiculoConflicto) {
        return res.status(409).json({ 
          error: 'Ya existe otro vehículo con esa matrícula o VIN',
          conflicto: vehiculoConflicto.matricula === vehiculoData.matricula ? 'matricula' : 'vin'
        });
      }
    }

    const vehiculoActualizado = await prisma.vehiculo.update({
      where: { id: Number(id) },
      data: vehiculoData,
    });

    res.json(vehiculoActualizado);
  } catch (error) {
    next(error);
  }
});

/**
 * @route DELETE /vehiculos/delete-all
 * @desc Elimina todos los vehículos que no tienen piezas asociadas
 * @access Private
 */
router.delete('/delete-all', async (req, res) => {
  try {
    // Primero, obtener todos los vehículos que tienen piezas asociadas para protegerlos
    const vehiculosConPiezas = await prisma.pieza.findMany({
      select: {
        id_vehiculo: true
      },
      where: {
        id_vehiculo: {
          not: null
        }
      },
      distinct: ['id_vehiculo']
    });
    
    const idsProtegidos = vehiculosConPiezas.map(p => p.id_vehiculo).filter(id => id !== null) as number[];
    
    // Obtener todos los vehículos que se pueden eliminar
    const vehiculosSinPiezas = await prisma.vehiculo.findMany({
      where: {
        id: {
          notIn: idsProtegidos.length > 0 ? idsProtegidos : undefined
        }
      },
      select: {
        id: true
      }
    });
    
    const idsAEliminar = vehiculosSinPiezas.map(v => v.id);
    
    if (idsAEliminar.length === 0) {
      return res.json({
        message: 'No hay vehículos disponibles para eliminar',
        vehiculosEliminados: 0
      });
    }
    
    console.log(`Iniciando eliminación de ${idsAEliminar.length} vehículos`);
    
    // Usar una transacción para asegurar consistencia
    const resultado = await prisma.$transaction(async (tx) => {
      let eliminados = 0;
      let errores = 0;
      let detallesErrores = [];
      
      // Eliminar los vehículos uno por uno para tener mejor control
      for (const id of idsAEliminar) {
        try {
          await tx.vehiculo.delete({
            where: { id }
          });
          eliminados++;
        } catch (err) {
          console.error(`Error al eliminar vehículo ${id}:`, err);
          errores++;
          detallesErrores.push({
            id,
            error: err instanceof Error ? err.message : 'Error desconocido'
          });
        }
      }
      
      return {
        eliminados,
        errores,
        detallesErrores
      };
    }, {
      timeout: 30000 // 30 segundos de timeout para la transacción
    }).catch(err => {
      console.error('Error en la transacción:', err);
      throw err;
    });
    
    res.json({
      message: 'Eliminación masiva completada',
      vehiculosEliminados: resultado.eliminados,
      errores: resultado.errores,
      totalProcesados: idsAEliminar.length,
      detallesErrores: resultado.detallesErrores
    });
  } catch (error) {
    console.error('Error al eliminar todos los vehículos:', error);
    res.status(500).json({ 
      error: 'Error al eliminar todos los vehículos', 
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

// DELETE - Eliminar un vehículo
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Verificar si el vehículo existe
    const existingVehiculo = await prisma.vehiculo.findUnique({
      where: { id: Number(id) },
    });

    if (!existingVehiculo) {
      return res.status(404).json({ error: 'Vehículo no encontrado' });
    }

    // Verificar si tiene piezas asociadas
    const piezasCount = await prisma.pieza.count({
      where: { id_vehiculo: Number(id) },
    });

    if (piezasCount > 0) {
      return res.status(400).json({ 
        error: 'No se puede eliminar el vehículo porque tiene piezas asociadas',
        piezasCount
      });
    }

    // Eliminar el vehículo
    await prisma.vehiculo.delete({
      where: { id: Number(id) },
    });

    res.json({ message: 'Vehículo eliminado correctamente' });
  } catch (error) {
    next(error);
  }
});

// DELETE - Eliminar todos los vehículos
router.delete('/delete-all', async (req, res, next) => {
  try {
    // Verificar si hay vehículos con piezas asociadas
    const vehiculosConPiezas = await prisma.pieza.groupBy({
      by: ['id_vehiculo'],
      _count: {
        id: true
      }
    });

    if (vehiculosConPiezas.length > 0) {
      return res.status(400).json({ 
        error: 'No se pueden eliminar todos los vehículos porque algunos tienen piezas asociadas',
        vehiculosConPiezasCount: vehiculosConPiezas.length
      });
    }

    // Eliminar documentos asociados a vehículos
    const documentosEliminados = await prisma.documento.deleteMany({
      where: {
        id_vehiculo: { not: null }
      }
    });

    // Eliminar solicitudes de recogida asociadas a vehículos
    const solicitudesEliminadas = await prisma.solicitudRecogida.deleteMany({});

    // Eliminar todos los vehículos
    const vehiculosEliminados = await prisma.vehiculo.deleteMany({});

    res.json({ 
      message: 'Todos los vehículos eliminados correctamente',
      stats: {
        vehiculos: vehiculosEliminados.count,
        documentos: documentosEliminados.count,
        solicitudes: solicitudesEliminadas.count
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
