import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';
import clientesRoutes from './routes/clientes.js';
import vehiculosRoutes from './routes/vehiculos.js';
import piezasRoutes from './routes/piezas.js';
import pedidosRoutes from './routes/pedidos.js';
import documentosRoutes from './routes/documentos.js';
import fotosRoutes from './routes/fotos.js';
import configuracionRoutes from './routes/configuracion.js';
import gruasRoutes from './routes/gruas.js';
import campasRoutes from './routes/campas.js';
import { default as woocommerceRoutes } from './routes/woocommerce.js';

// Configuración de variables de entorno
dotenv.config();

// Inicialización de Prisma
export const prisma = new PrismaClient();

// Configuración del servidor Express
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Servir archivos estáticos
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Rutas
app.use('/api/clientes', clientesRoutes);
app.use('/api/vehiculos', vehiculosRoutes);
app.use('/api/piezas', piezasRoutes);
app.use('/api/pedidos', pedidosRoutes);
app.use('/api/documentos', documentosRoutes);
app.use('/api/fotos', fotosRoutes);
app.use('/api/configuracion', configuracionRoutes);
app.use('/api/gruas', gruasRoutes);
app.use('/api/campas', campasRoutes);
app.use('/api/woocommerce', woocommerceRoutes);

// Ruta de prueba
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Manejador de errores global
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Error interno del servidor',
    message: err.message || 'Algo salió mal',
  });
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor backend ejecutándose en http://localhost:${PORT}`);
});

// Manejo de cierre limpio
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  console.log('Conexión a la base de datos cerrada');
  process.exit(0);
});
