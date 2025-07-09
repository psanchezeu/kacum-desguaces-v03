import express from 'express';
import { prisma } from '../index.js';
import { z } from 'zod';

const router = express.Router();

// Schema de validación para Cliente
const ClienteSchema = z.object({
  nombre: z.string().min(1, "El nombre es obligatorio"),
  apellidos: z.string().min(1, "Los apellidos son obligatorios"),
  dni_nif: z.string().min(1, "El DNI/NIF es obligatorio"),
  telefono: z.string().min(1, "El teléfono es obligatorio"),
  email: z.string().email("Email inválido"),
  direccion: z.string().min(1, "La dirección es obligatoria"),
  tipo_cliente: z.enum(["particular", "empresa"], {
    errorMap: () => ({ message: "Tipo de cliente debe ser 'particular' o 'empresa'" }),
  }),
  razon_social: z.string().optional(),
  cif: z.string().optional(),
  acepta_comunicaciones: z.boolean(),
  observaciones: z.string().optional(),
});

// GET - Obtener todos los clientes
router.get('/', async (req, res, next) => {
  try {
    const clientes = await prisma.cliente.findMany();
    res.json(clientes);
  } catch (error) {
    next(error);
  }
});

// GET - Obtener un cliente por ID
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const cliente = await prisma.cliente.findUnique({
      where: { id: Number(id) },
      include: {
        vehiculos: true,
        pedidos: true,
      },
    });

    if (!cliente) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    res.json(cliente);
  } catch (error) {
    next(error);
  }
});

// POST - Crear un nuevo cliente
router.post('/', async (req, res, next) => {
  try {
    const validationResult = ClienteSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ 
        error: 'Datos de cliente inválidos',
        details: validationResult.error.format() 
      });
    }

    const clienteData = validationResult.data;
    
    // Verificar si ya existe un cliente con el mismo DNI/NIF
    const existingCliente = await prisma.cliente.findUnique({
      where: { dni_nif: clienteData.dni_nif },
    });

    if (existingCliente) {
      return res.status(409).json({ error: 'Ya existe un cliente con ese DNI/NIF' });
    }

    const nuevoCliente = await prisma.cliente.create({
      data: clienteData,
    });

    res.status(201).json(nuevoCliente);
  } catch (error) {
    next(error);
  }
});

// PUT - Actualizar un cliente existente
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const validationResult = ClienteSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ 
        error: 'Datos de cliente inválidos',
        details: validationResult.error.format() 
      });
    }

    const clienteData = validationResult.data;
    
    // Verificar si el cliente existe
    const existingCliente = await prisma.cliente.findUnique({
      where: { id: Number(id) },
    });

    if (!existingCliente) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    // Verificar si el DNI/NIF actualizado ya existe en otro cliente
    if (clienteData.dni_nif !== existingCliente.dni_nif) {
      const clienteConMismoDNI = await prisma.cliente.findUnique({
        where: { dni_nif: clienteData.dni_nif },
      });

      if (clienteConMismoDNI) {
        return res.status(409).json({ error: 'Ya existe otro cliente con ese DNI/NIF' });
      }
    }

    const clienteActualizado = await prisma.cliente.update({
      where: { id: Number(id) },
      data: clienteData,
    });

    res.json(clienteActualizado);
  } catch (error) {
    next(error);
  }
});

// DELETE - Eliminar un cliente
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const clienteId = Number(id);
    
    // Verificar si el cliente existe
    const existingCliente = await prisma.cliente.findUnique({
      where: { id: clienteId },
      include: { vehiculos: true }
    });

    if (!existingCliente) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    // Verificar si tiene vehículos asociados
    if (existingCliente.vehiculos && existingCliente.vehiculos.length > 0) {
      return res.status(400).json({ 
        error: 'No se puede eliminar el cliente porque tiene vehículos asociados',
        vehiculosCount: existingCliente.vehiculos.length
      });
    }

    // Verificar si tiene pedidos asociados
    const pedidosCount = await prisma.pedido.count({
      where: { id_cliente: clienteId },
    });

    if (pedidosCount > 0) {
      return res.status(400).json({ 
        error: 'No se puede eliminar el cliente porque tiene pedidos asociados',
        pedidosCount
      });
    }

    // Eliminar el cliente completamente
    await prisma.cliente.delete({
      where: { id: clienteId },
    });

    res.json({ message: 'Cliente eliminado correctamente' });
  } catch (error) {
    next(error);
  }
});

export default router;
