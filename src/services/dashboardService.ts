import api from './api';
import { DashboardStats, ActivityItem, Pedido, Pieza, Cliente } from '@/types';
import { vehiculosService } from './vehiculosService';
import { piezasService } from './piezasService';
import { clientesService } from './clientesService';
import { pedidosService } from './pedidosService';

/**
 * Servicio para obtener datos del dashboard
 */
export const dashboardService = {
  /**
   * Obtiene las estadísticas para el dashboard
   * @returns Promise con las estadísticas del dashboard
   */
  getStats: async (): Promise<DashboardStats> => {
    try {
      // Intentamos obtener las estadísticas directamente del endpoint
      const response = await api.get('/dashboard/stats');
      if (response.data) {
        return response.data;
      }
    } catch (error) {
      console.error('Error al obtener estadísticas del dashboard desde el endpoint:', error);
      console.log('Calculando estadísticas a partir de datos individuales...');
    }

    // Si no hay endpoint específico o falló, calculamos las estadísticas manualmente
    try {
      // Obtenemos los datos necesarios de cada servicio con parámetros para obtener todos los registros
      const [vehiculos, piezas, clientes, pedidos] = await Promise.all([
        vehiculosService.getAll({ page: 1, limit: 10000, count: true }),
        piezasService.getAll(undefined, { page: 1, limit: 10000, count: true }),
        clientesService.getAll(),
        pedidosService.getAll()
      ]);
      
      // Extraer datos de las respuestas paginadas y obtener los totales reales
      const vehiculosTotal = vehiculos.pagination?.total || vehiculos.data.length;
      const piezasTotal = piezas.pagination?.total || piezas.data.length;

      // Calculamos las estadísticas
      // Contamos cada pedido como una pieza vendida (simplificación)
      const piezasVendidas = pedidos.length;

      // Calculamos las ventas del mes actual
      const hoy = new Date();
      const primerDiaMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
      
      const ventasMes = pedidos
        .filter(pedido => {
          // Usamos fecha_pedido que es la propiedad correcta según la interfaz Pedido
          const fechaPedido = new Date(pedido.fecha_pedido);
          return fechaPedido >= primerDiaMes && fechaPedido <= hoy;
        })
        .reduce((total, pedido) => total + (pedido.total || 0), 0);

      // Contamos incidencias abiertas (si tenemos acceso a ese dato)
      let incidenciasAbiertas = 0;
      try {
        const response = await api.get('/incidencias?estado=abierta');
        if (response.data && Array.isArray(response.data)) {
          incidenciasAbiertas = response.data.length;
        }
      } catch (error) {
        console.error('Error al obtener incidencias abiertas:', error);
      }

      // Extraer datos de las respuestas paginadas
      const vehiculosData = vehiculos.data || [];
      const piezasData = piezas.data || [];
      
      // Calcular la proporción de piezas disponibles (no bloqueadas) del total
      const piezasDisponiblesRatio = piezasData.length > 0 
        ? piezasData.filter(p => !p.bloqueada_venta).length / piezasData.length 
        : 0;
      
      // Construimos y devolvemos el objeto de estadísticas
      return {
        vehiculosTotal: vehiculosTotal,
        piezasDisponibles: Math.round(piezasTotal * piezasDisponiblesRatio),
        piezasVendidas,
        clientesActivos: clientes.length, // Consideramos todos los clientes como activos
        ventasMes,
        incidenciasAbiertas
      };
    } catch (error) {
      console.error('Error al calcular estadísticas del dashboard:', error);
      throw error;
    }
  },

  /**
   * Obtiene la actividad reciente para el dashboard
   * @returns Promise con la lista de actividades recientes
   */
  getRecentActivity: async (): Promise<ActivityItem[]> => {
    try {
      // Intentamos obtener la actividad reciente del endpoint
      const response = await api.get('/dashboard/activity');
      if (response.data && Array.isArray(response.data)) {
        return response.data;
      }
    } catch (error) {
      console.error('Error al obtener actividad reciente:', error);
      
      // Si no hay endpoint específico o falló, generamos actividad a partir de los datos más recientes
      try {
        const activities: ActivityItem[] = [];
        
        // Obtenemos los últimos pedidos
        const pedidos = await pedidosService.getAll();
        const recentPedidos = pedidos
          .sort((a, b) => new Date(b.fecha_pedido).getTime() - new Date(a.fecha_pedido).getTime())
          .slice(0, 3);
          
        // Convertimos pedidos a actividades
        recentPedidos.forEach(pedido => {
          activities.push({
            id: Number(`${pedido.id}`),
            tipo: 'pedido',
            descripcion: `Nuevo pedido #${pedido.id} - Total: ${pedido.total?.toLocaleString('es-ES')}€`,
            fecha: new Date(pedido.fecha_pedido),
            entidad_id: pedido.id,
            entidad_tipo: 'pedido',
            usuario: 'Sistema'
          });
        });
        
        // Obtenemos las últimas piezas añadidas
        const piezasResponse = await piezasService.getAll();
        const piezasData = piezasResponse.data || [];
        const recentPiezas = piezasData
          .sort((a, b) => new Date(b.fecha_extraccion || '').getTime() - new Date(a.fecha_extraccion || '').getTime())
          .slice(0, 3);
          
        // Convertimos piezas a actividades
        recentPiezas.forEach(pieza => {
          activities.push({
            id: Number(`${pieza.id}00`), // Añadimos 00 para evitar duplicados con IDs de pedidos
            tipo: 'pieza',
            descripcion: `Nueva pieza: ${pieza.tipo_pieza} - ${pieza.descripcion?.substring(0, 50) || 'Sin descripción'}${pieza.descripcion && pieza.descripcion.length > 50 ? '...' : ''}`,
            fecha: pieza.fecha_extraccion,
            entidad_id: pieza.id,
            entidad_tipo: 'pieza',
            usuario: 'Sistema'
          });
        });
        
        // Ordenamos todas las actividades por fecha
        return activities.sort((a, b) => 
          b.fecha.getTime() - a.fecha.getTime()
        );
      } catch (innerError) {
        console.error('Error al generar actividad reciente a partir de datos:', innerError);
        return [];
      }
    }
    
    return [];
  }
};
