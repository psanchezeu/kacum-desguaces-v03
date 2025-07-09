import { Router } from 'express';
import clientesRoutes from './clientes.js';
import vehiculosRoutes from './vehiculos.js';
import piezasRoutes from './piezas.js';
import pedidosRoutes from './pedidos.js';
import documentosRoutes from './documentos.js';
import fotosRoutes from './fotos.js';
import configuracionRoutes from './configuracion.js';
import gruasRoutes from './gruas.js';
import campasRoutes from './campas.js';
import woocommerceRoutes from './woocommerce.js';

const apiRouter = Router();

apiRouter.use('/clientes', clientesRoutes);
apiRouter.use('/vehiculos', vehiculosRoutes);
apiRouter.use('/piezas', piezasRoutes);
apiRouter.use('/pedidos', pedidosRoutes);
apiRouter.use('/documentos', documentosRoutes);
apiRouter.use('/fotos', fotosRoutes);
apiRouter.use('/configuracion', configuracionRoutes);
apiRouter.use('/gruas', gruasRoutes);
apiRouter.use('/campas', campasRoutes);
apiRouter.use('/woocommerce', woocommerceRoutes);

// Ruta de salud para verificar que la API está viva
apiRouter.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

export default apiRouter;
