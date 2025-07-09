import express from 'express';
import { prisma } from '../index.js';
import { z } from 'zod';

const router = express.Router();

// Schema de validación para Pieza
const PiezaSchema = z.object({
  id_vehiculo: z.number().int().positive("ID de vehículo inválido"),
  tipo_pieza: z.string().min(1, "El tipo de pieza es obligatorio"),
  descripcion: z.string().min(1, "La descripción es obligatoria"),
  estado: z.enum(["nueva", "usada", "dañada", "en_revision"], {
    errorMap: () => ({ message: "Estado debe ser 'nueva', 'usada', 'dañada' o 'en_revision'" }),
  }),
  ubicacion_almacen: z.string().min(1, "La ubicación en almacén es obligatoria"),
  codigo_qr: z.string().optional(),
  rfid: z.string().optional(),
  fecha_extraccion: z.coerce.date().optional(),
  fecha_caducidad: z.coerce.date().optional(),
  lote: z.string().optional(),
  precio_coste: z.number().nonnegative("El precio de coste no puede ser negativo"),
  precio_venta: z.number().nonnegative("El precio de venta no puede ser negativo"),
  reciclable: z.boolean(),
  bloqueada_venta: z.boolean(),
  observaciones: z.string().optional(),
});

// GET - Obtener todas las piezas o filtrar por vehículo con paginación
router.get('/', async (req, res, next) => {
  try {
    const { id_vehiculo, page = '1', limit = '50', count = 'false' } = req.query;
    
    // Convertir parámetros a números
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const offset = (pageNum - 1) * limitNum;
    const needCount = count === 'true';
    
    // Si se proporciona id_vehiculo, filtrar por ese vehículo
    const where = id_vehiculo ? { id_vehiculo: Number(id_vehiculo) } : {};
    
    // Obtener el total de registros si se solicita
    let total = 0;
    if (needCount) {
      total = await prisma.pieza.count({ where });
    }
    
    // Obtener piezas paginadas
    const piezas = await prisma.pieza.findMany({
      where,
      skip: offset,
      take: limitNum,
      include: {
        vehiculo: {
          select: {
            id: true,
            marca: true,
            modelo: true,
            matricula: true,
          },
        },
      },
    });
    
    // Devolver resultados con metadatos de paginación
    res.json({
      data: piezas,
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

// GET - Obtener una pieza por ID
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const pieza = await prisma.pieza.findUnique({
      where: { id: Number(id) },
      include: {
        vehiculo: true,
        historialEstados: true,
        pedidos: true,
      },
    });

    if (!pieza) {
      return res.status(404).json({ error: 'Pieza no encontrada' });
    }

    res.json(pieza);
  } catch (error) {
    next(error);
  }
});

// GET - Obtener piezas por vehículo
router.get('/vehiculo/:vehiculoId', async (req, res, next) => {
  try {
    const { vehiculoId } = req.params;
    const piezas = await prisma.pieza.findMany({
      where: { id_vehiculo: Number(vehiculoId) },
    });
    res.json(piezas);
  } catch (error) {
    next(error);
  }
});

// GET - Buscar piezas por tipo
router.get('/buscar/tipo/:tipoPieza', async (req, res, next) => {
  try {
    const { tipoPieza } = req.params;
    const piezas = await prisma.pieza.findMany({
      where: { 
        tipo_pieza: {
          contains: tipoPieza,
          // Eliminado mode: 'insensitive' que causa error de TypeScript
          // Prisma por defecto hace búsquedas case-insensitive en PostgreSQL
        },
        bloqueada_venta: false,
      },
      include: {
        vehiculo: {
          select: {
            marca: true,
            modelo: true,
            anio_fabricacion: true,
          },
        },
      },
    });
    res.json(piezas);
  } catch (error) {
    next(error);
  }
});

// POST - Crear una nueva pieza
router.post('/', async (req, res, next) => {
  try {
    const validationResult = PiezaSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ 
        error: 'Datos de pieza inválidos',
        details: validationResult.error.format() 
      });
    }

    const piezaData = validationResult.data;
    
    // Verificar si el vehículo existe
    const vehiculoExiste = await prisma.vehiculo.findUnique({
      where: { id: piezaData.id_vehiculo },
    });

    if (!vehiculoExiste) {
      return res.status(404).json({ error: 'Vehículo no encontrado' });
    }

    // Si no se proporciona fecha de extracción, usar la fecha actual
    if (!piezaData.fecha_extraccion) {
      piezaData.fecha_extraccion = new Date();
    }

    const nuevaPieza = await prisma.pieza.create({
      data: piezaData,
    });

    // Crear el primer registro en el historial de estados
    await prisma.historialEstadoPieza.create({
      data: {
        id_pieza: nuevaPieza.id,
        estado: piezaData.estado,
        usuario: 'sistema', // Idealmente, esto vendría del usuario autenticado
        motivo: 'Creación inicial de la pieza',
      },
    });

    res.status(201).json(nuevaPieza);
  } catch (error) {
    next(error);
  }
});

// PUT - Actualizar una pieza existente
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const validationResult = PiezaSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ 
        error: 'Datos de pieza inválidos',
        details: validationResult.error.format() 
      });
    }

    const piezaData = validationResult.data;
    
    // Verificar si la pieza existe
    const existingPieza = await prisma.pieza.findUnique({
      where: { id: Number(id) },
    });

    if (!existingPieza) {
      return res.status(404).json({ error: 'Pieza no encontrada' });
    }

    // Verificar si el vehículo existe
    const vehiculoExiste = await prisma.vehiculo.findUnique({
      where: { id: piezaData.id_vehiculo },
    });

    if (!vehiculoExiste) {
      return res.status(404).json({ error: 'Vehículo no encontrado' });
    }

    // Si el estado ha cambiado, registrar en el historial
    if (existingPieza.estado !== piezaData.estado) {
      await prisma.historialEstadoPieza.create({
        data: {
          id_pieza: Number(id),
          estado: piezaData.estado,
          usuario: 'sistema', // Idealmente, esto vendría del usuario autenticado
          motivo: 'Actualización de estado',
        },
      });
    }

    const piezaActualizada = await prisma.pieza.update({
      where: { id: Number(id) },
      data: piezaData,
    });

    res.json(piezaActualizada);
  } catch (error) {
    next(error);
  }
});

/**
 * @route DELETE /piezas/delete-all
 * @desc Elimina todas las piezas que no tienen pedidos asociados
 * @access Private
 */
router.delete('/delete-all', async (req, res) => {
  try {
    // Primero, obtener todas las piezas que tienen pedidos asociados para protegerlas
    const piezasConPedidos = await prisma.pedido.findMany({
      select: {
        id_pieza: true
      },
      distinct: ['id_pieza']
    });
    
    const idsProtegidos = piezasConPedidos.map(p => p.id_pieza).filter(id => id !== null);
    
    // Obtener todas las piezas que se pueden eliminar
    const piezasSinPedidos = await prisma.pieza.findMany({
      where: {
        id: {
          notIn: idsProtegidos.length > 0 ? idsProtegidos : undefined
        }
      },
      select: {
        id: true
      }
    });
    
    const idsPiezasSinPedidos = piezasSinPedidos.map(p => p.id);
    
    if (idsPiezasSinPedidos.length === 0) {
      return res.json({
        message: 'No hay piezas disponibles para eliminar',
        piezasEliminadas: 0
      });
    }
    
    console.log(`Iniciando eliminación de ${idsPiezasSinPedidos.length} piezas`);
    
    // Usar una transacción para asegurar consistencia
    const resultado = await prisma.$transaction(async (tx) => {
      let eliminadas = 0;
      let errores = 0;
      let detallesErrores = [];
      
      // Eliminar relaciones primero
      try {
        // Eliminar fotos asociadas a las piezas
        await tx.foto.deleteMany({
          where: {
            id_pieza: {
              in: idsPiezasSinPedidos
            }
          }
        });
        
        // Eliminar historial de estados
        await tx.historialEstadoPieza.deleteMany({
          where: {
            id_pieza: {
              in: idsPiezasSinPedidos
            }
          }
        });
      } catch (e) {
        console.log('Error al eliminar relaciones:', e);
        // Continuamos con la eliminación de piezas aunque falle la eliminación de relaciones
      }
      
      // Eliminar las piezas una por una para tener mejor control
      for (const id of idsPiezasSinPedidos) {
        try {
          await tx.pieza.delete({
            where: { id }
          });
          eliminadas++;
        } catch (err) {
          console.error(`Error al eliminar pieza ${id}:`, err);
          errores++;
          detallesErrores.push({
            id,
            error: err instanceof Error ? err.message : 'Error desconocido'
          });
        }
      }
      
      return {
        eliminadas,
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
      piezasEliminadas: resultado.eliminadas,
      errores: resultado.errores,
      totalProcesadas: idsPiezasSinPedidos.length,
      detallesErrores: resultado.detallesErrores
    });
  } catch (error) {
    console.error('Error al eliminar todas las piezas:', error);
    res.status(500).json({ 
      error: 'Error al eliminar todas las piezas', 
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

// DELETE - Eliminar una pieza
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const piezaId = parseInt(id, 10);
    
    if (isNaN(piezaId)) {
      return res.status(400).json({ error: 'ID de pieza inválido' });
    }
    
    // Verificar si la pieza existe
    const existingPieza = await prisma.pieza.findUnique({
      where: { id: piezaId },
    });

    if (!existingPieza) {
      return res.status(404).json({ error: 'Pieza no encontrada' });
    }

    // Verificar si tiene pedidos asociados
    const pedidosCount = await prisma.pedido.count({
      where: { id_pieza: Number(id) },
    });

    if (pedidosCount > 0) {
      return res.status(400).json({ 
        error: 'No se puede eliminar la pieza porque tiene pedidos asociados',
        pedidosCount
      });
    }

    // Eliminar primero las fotos asociadas a la pieza
    await prisma.foto.deleteMany({
      where: { id_pieza: Number(id) },
    });

    // Eliminar los registros del historial de estados
    await prisma.historialEstadoPieza.deleteMany({
      where: { id_pieza: Number(id) },
    });

    // Eliminar la pieza
    await prisma.pieza.delete({
      where: { id: Number(id) },
    });

    res.json({ message: 'Pieza eliminada correctamente' });
  } catch (error) {
    next(error);
  }
});

// La ruta DELETE /delete-all ya está definida arriba

export default router;
