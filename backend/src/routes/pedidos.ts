import express from 'express';
import { prisma } from '../index.js';
import { z } from 'zod';

const router = express.Router();

// Schema de validación para Pedido
const PedidoSchema = z.object({
  id_cliente: z.number().int().positive("ID de cliente inválido"),
  id_pieza: z.number().int().positive("ID de pieza inválido"),
  tipo_venta: z.enum(["online", "presencial"], {
    errorMap: () => ({ message: "Tipo de venta debe ser 'online' o 'presencial'" }),
  }),
  fecha_pedido: z.coerce.date().optional(),
  estado: z.enum(["pendiente", "pagado", "enviado", "entregado", "cancelado", "devuelto"], {
    errorMap: () => ({ message: "Estado inválido" }),
  }),
  metodo_pago: z.string().min(1, "El método de pago es obligatorio"),
  direccion_envio: z.string().min(1, "La dirección de envío es obligatoria"),
  empresa_envio: z.string().min(1, "La empresa de envío es obligatoria"),
  total: z.number().nonnegative("El total no puede ser negativo"),
});

// GET - Obtener todos los pedidos
router.get('/', async (req, res, next) => {
  try {
    const pedidos = await prisma.pedido.findMany({
      include: {
        cliente: {
          select: {
            id: true,
            nombre: true,
            apellidos: true,
            email: true,
          },
        },
        pieza: {
          select: {
            id: true,
            tipo_pieza: true,
            descripcion: true,
            precio_venta: true,
          },
        },
      },
    });
    res.json(pedidos);
  } catch (error) {
    next(error);
  }
});

// GET - Obtener un pedido por ID
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const pedido = await prisma.pedido.findUnique({
      where: { id: Number(id) },
      include: {
        cliente: true,
        pieza: true,
        facturas: true,
        devoluciones: true,
      },
    });

    if (!pedido) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }

    res.json(pedido);
  } catch (error) {
    next(error);
  }
});

// GET - Obtener pedidos por cliente
router.get('/cliente/:clienteId', async (req, res, next) => {
  try {
    const { clienteId } = req.params;
    const pedidos = await prisma.pedido.findMany({
      where: { id_cliente: Number(clienteId) },
      include: {
        pieza: {
          select: {
            tipo_pieza: true,
            descripcion: true,
            precio_venta: true,
          },
        },
      },
    });
    res.json(pedidos);
  } catch (error) {
    next(error);
  }
});

// POST - Crear un nuevo pedido
router.post('/', async (req, res, next) => {
  try {
    const validationResult = PedidoSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ 
        error: 'Datos de pedido inválidos',
        details: validationResult.error.format() 
      });
    }

    const pedidoData = validationResult.data;
    
    // Verificar si el cliente existe
    const clienteExiste = await prisma.cliente.findUnique({
      where: { id: pedidoData.id_cliente },
    });

    if (!clienteExiste) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    // Verificar si la pieza existe
    const pieza = await prisma.pieza.findUnique({
      where: { id: pedidoData.id_pieza },
    });

    if (!pieza) {
      return res.status(404).json({ error: 'Pieza no encontrada' });
    }

    // Verificar si la pieza está bloqueada para venta
    if (pieza.bloqueada_venta) {
      return res.status(400).json({ error: 'La pieza no está disponible para venta' });
    }

    // Si no se proporciona fecha de pedido, usar la fecha actual
    if (!pedidoData.fecha_pedido) {
      pedidoData.fecha_pedido = new Date();
    }

    const nuevoPedido = await prisma.pedido.create({
      data: pedidoData,
    });

    // Bloquear la pieza para venta
    await prisma.pieza.update({
      where: { id: pedidoData.id_pieza },
      data: { bloqueada_venta: true },
    });

    // Si el pedido está pagado, generar factura automáticamente
    if (pedidoData.estado === 'pagado') {
      await prisma.factura.create({
        data: {
          id_cliente: pedidoData.id_cliente,
          id_pedido: nuevoPedido.id,
          importe_total: pedidoData.total,
          estado: 'emitida',
          iva: pedidoData.total * 0.21, // 21% IVA
          base_imponible: pedidoData.total / 1.21,
        },
      });
    }

    res.status(201).json(nuevoPedido);
  } catch (error) {
    next(error);
  }
});

// PUT - Actualizar un pedido existente
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const validationResult = PedidoSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ 
        error: 'Datos de pedido inválidos',
        details: validationResult.error.format() 
      });
    }

    const pedidoData = validationResult.data;
    
    // Verificar si el pedido existe
    const existingPedido = await prisma.pedido.findUnique({
      where: { id: Number(id) },
    });

    if (!existingPedido) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }

    // Verificar si el cliente existe
    const clienteExiste = await prisma.cliente.findUnique({
      where: { id: pedidoData.id_cliente },
    });

    if (!clienteExiste) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    // Verificar si la pieza existe
    const pieza = await prisma.pieza.findUnique({
      where: { id: pedidoData.id_pieza },
    });

    if (!pieza) {
      return res.status(404).json({ error: 'Pieza no encontrada' });
    }

    // Si se cambia la pieza, verificar disponibilidad y actualizar bloqueos
    if (existingPedido.id_pieza !== pedidoData.id_pieza) {
      // Verificar si la nueva pieza está bloqueada para venta
      if (pieza.bloqueada_venta) {
        return res.status(400).json({ error: 'La nueva pieza no está disponible para venta' });
      }

      // Desbloquear la pieza anterior
      await prisma.pieza.update({
        where: { id: existingPedido.id_pieza },
        data: { bloqueada_venta: false },
      });

      // Bloquear la nueva pieza
      await prisma.pieza.update({
        where: { id: pedidoData.id_pieza },
        data: { bloqueada_venta: true },
      });
    }

    // Si el estado cambia a pagado y no había factura, crear una
    if (existingPedido.estado !== 'pagado' && pedidoData.estado === 'pagado') {
      const facturaExiste = await prisma.factura.findFirst({
        where: { id_pedido: Number(id) },
      });

      if (!facturaExiste) {
        await prisma.factura.create({
          data: {
            id_cliente: pedidoData.id_cliente,
            id_pedido: Number(id),
            importe_total: pedidoData.total,
            estado: 'emitida',
            iva: pedidoData.total * 0.21, // 21% IVA
            base_imponible: pedidoData.total / 1.21,
          },
        });
      }
    }

    // Si el estado cambia a cancelado, desbloquear la pieza
    if (existingPedido.estado !== 'cancelado' && pedidoData.estado === 'cancelado') {
      await prisma.pieza.update({
        where: { id: pedidoData.id_pieza },
        data: { bloqueada_venta: false },
      });
    }

    const pedidoActualizado = await prisma.pedido.update({
      where: { id: Number(id) },
      data: pedidoData,
    });

    res.json(pedidoActualizado);
  } catch (error) {
    next(error);
  }
});

// DELETE - Eliminar un pedido
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Verificar si el pedido existe
    const existingPedido = await prisma.pedido.findUnique({
      where: { id: Number(id) },
    });

    if (!existingPedido) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }

    // Verificar si tiene facturas asociadas
    const facturasCount = await prisma.factura.count({
      where: { id_pedido: Number(id) },
    });

    if (facturasCount > 0) {
      return res.status(400).json({ 
        error: 'No se puede eliminar el pedido porque tiene facturas asociadas',
        facturasCount
      });
    }

    // Desbloquear la pieza
    await prisma.pieza.update({
      where: { id: existingPedido.id_pieza },
      data: { bloqueada_venta: false },
    });

    // Eliminar el pedido
    await prisma.pedido.delete({
      where: { id: Number(id) },
    });

    res.json({ message: 'Pedido eliminado correctamente' });
  } catch (error) {
    next(error);
  }
});

export default router;
