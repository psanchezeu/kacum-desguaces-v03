import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';
import apiRouter from './routes/api.js';

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

// Rutas de la API
// El proxy de Coolify gestiona el enrutamiento /api.
// El backend escucha en la ruta raíz.
app.use('/', apiRouter);

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
