
import { Cliente, Vehiculo, Pieza, Pedido, Incidencia, ActivityItem, DashboardStats } from '../types';

export const clientes: Cliente[] = [];

export const vehiculos: Vehiculo[] = [];

export const piezas: Pieza[] = [];

export const pedidos: Pedido[] = [];

export const incidencias: Incidencia[] = [];

export const actividadReciente: ActivityItem[] = [];

export const estadisticas: DashboardStats = {
  vehiculosTotal: 0,
  piezasDisponibles: 0,
  piezasVendidas: 0,
  clientesActivos: 0,
  ventasMes: 0,
  incidenciasAbiertas: 0,
};
