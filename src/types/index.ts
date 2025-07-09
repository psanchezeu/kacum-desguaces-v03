// Tipos existentes
export interface Cliente {
  id: number;
  nombre: string;
  apellidos: string;
  dni_nif: string;
  telefono: string;
  email: string;
  direccion: string;
  tipo_cliente: 'particular' | 'empresa';
  razon_social?: string;
  cif?: string;
  acepta_comunicaciones: boolean;
  fecha_alta: Date;
  fecha_baja?: Date;
  observaciones?: string;
}

export interface Vehiculo {
  id: number;
  id_cliente?: number;
  marca: string;
  modelo: string;
  version: string;
  anio_fabricacion: number;
  color: string;
  matricula: string;
  vin: string;
  tipo_combustible: string;
  kilometros: number;
  fecha_matriculacion: Date;
  estado: string;
  ubicacion_actual: string;
  ubicacion_gps?: string;
  observaciones?: string;
  // Propiedades adicionales para la vista de vehículos de origen
  imagen_url?: string;
  bastidor?: string; // Alias para vin para compatibilidad
  kilometraje?: number; // Alias para kilometros para compatibilidad
  num_piezas?: number; // Número de piezas asociadas al vehículo
  datos_adicionales?: Record<string, any>; // Datos adicionales en formato JSON
  
  // Especificaciones técnicas adicionales
  motor?: string;
  cilindrada?: number;
  potencia?: number;
  transmision?: string;
}

export interface Pieza {
  id: number;
  id_vehiculo?: number;
  tipo_pieza: string;
  descripcion: string;
  estado: 'nueva' | 'usada' | 'dañada' | 'en_revision';
  ubicacion_almacen: string;
  codigo_qr?: string;
  rfid?: string;
  fecha_extraccion: Date;
  fecha_caducidad?: Date;
  lote?: string;
  precio_coste: number;
  precio_venta: number;
  reciclable: boolean;
  bloqueada_venta: boolean;
  observaciones?: string;
  datos_adicionales?: string; // JSON con metadatos de WooCommerce
}

export interface Pedido {
  id: number;
  id_cliente: number;
  id_pieza: number;
  tipo_venta: 'online' | 'presencial';
  fecha_pedido: Date;
  estado: 'pendiente' | 'pagado' | 'enviado' | 'entregado' | 'cancelado' | 'devuelto';
  metodo_pago: string;
  direccion_envio: string;
  empresa_envio: string;
  total: number;
}

export interface Incidencia {
  id: number;
  tipo: 'reclamacion' | 'logistica' | 'operacion' | 'seguridad' | 'otro';
  descripcion: string;
  id_usuario_reporta: number;
  id_entidad_afectada: number;
  entidad_tipo: 'pieza' | 'pedido' | 'vehiculo' | 'usuario' | 'grua';
  estado: 'abierta' | 'en_proceso' | 'cerrada';
  fecha_apertura: Date;
  fecha_cierre?: Date;
  resolucion?: string;
}

export interface ActivityItem {
  id: number;
  tipo: string;
  descripcion: string;
  fecha: Date;
  usuario: string;
  entidad_id?: number;
  entidad_tipo?: string;
}

export interface DashboardStats {
  vehiculosTotal: number;
  piezasDisponibles: number;
  piezasVendidas: number;
  clientesActivos: number;
  ventasMes: number;
  incidenciasAbiertas: number;
}

// Nuevas interfaces
export interface Usuario {
  id: number;
  nombre: string;
  apellidos: string;
  email: string;
  telefono: string;
  rol: string;
  mfa_activado: boolean;
  activo: boolean;
  fecha_alta: Date;
  observaciones?: string;
}

export interface Documento {
  id: number;
  id_vehiculo?: number;
  id_cliente?: number;
  tipo: string;
  url: string;
  fecha_subida: Date;
  fecha_caducidad?: Date;
  firmado: boolean;
  estado_validacion: string;
  fecha_validacion?: Date;
  validado_por?: number;
}

export interface Grua {
  id: number;
  matricula: string;
  modelo: string;
  capacidad_kg: number;
  conductor_asignado: string;
  estado: string;
  gps_ultimo_punto?: string;
  fecha_ultimo_mantenimiento: Date;
  kilometraje: number;
  itv_estado: string;
  itv_fecha: Date;
}

export interface MantenimientoGrua {
  id: number;
  id_grua: number;
  tipo: string;
  fecha: Date;
  realizado_por: string;
  url_documento?: string;
}

export interface SolicitudRecogida {
  id: number;
  id_cliente: number;
  id_vehiculo: number;
  id_grua?: number;
  fecha_solicitud: Date;
  estado: 'pendiente' | 'en_proceso' | 'finalizada' | 'cancelada';
  direccion_recogida: string;
  contacto_recogida: string;
  fecha_recogida?: Date;
  firmado_por?: string;
  url_firma?: string;
}

export interface Almacen {
  id: number;
  nombre: string;
  ubicacion: string;
  responsable: string;
  tipo: 'principal' | 'secundario';
  estado: string;
}

export interface Campa {
  id: number;
  nombre: string;
  ubicacion: string;
  gps?: string;
  tipo: 'propia' | 'externa';
  responsable: string;
  estado: string;
}

export interface HistorialEstadoPieza {
  id: number;
  id_pieza: number;
  estado: string;
  fecha: Date;
  usuario: string;
  motivo: string;
}

export interface Factura {
  id: number;
  id_cliente: number;
  id_pedido: number;
  fecha_emision: Date;
  importe_total: number;
  estado: 'emitida' | 'pagada' | 'anulada';
  url_pdf?: string;
  iva: number;
  base_imponible: number;
}

export interface Devolucion {
  id: number;
  id_pedido: number;
  id_cliente: number;
  motivo: string;
  fecha: Date;
  estado: string;
  importe: number;
  responsable: string;
  url_documento?: string;
}

export interface Garantia {
  id: number;
  id_pieza: number;
  id_cliente: number;
  fecha_inicio: Date;
  fecha_fin: Date;
  condiciones: string;
  estado: string;
  url_documento?: string;
}

export interface Transferencia {
  id: number;
  id_pieza: number;
  id_almacen_origen: number;
  id_almacen_destino: number;
  id_usuario: number;
  fecha: Date;
  motivo: string;
  tipo: 'entrada' | 'salida' | 'traslado' | 'campa';
}

export interface Proveedor {
  id: number;
  nombre: string;
  cif: string;
  direccion: string;
  contacto: string;
  email: string;
  telefono: string;
  estado: string;
  tipo: 'piezas' | 'reciclaje' | 'servicios' | 'transporte';
}

export interface ProveedorProducto {
  id: number;
  id_proveedor: number;
  nombre: string;
  descripcion: string;
  precio_unitario: number;
  codigo_proveedor: string;
}

export interface Compra {
  id: number;
  id_proveedor: number;
  fecha_compra: Date;
  importe_total: number;
  estado: string;
}

export interface CompraDetalle {
  id: number;
  id_compra: number;
  id_prov_prod: number;
  cantidad: number;
  precio_unitario: number;
}

export interface MaterialReciclado {
  id: number;
  tipo_material: string;
  peso_kg: number;
  fecha_reciclaje: Date;
  id_pieza: number;
  destino: string;
  empresa_gestora: string;
}

export interface HuellaCarbono {
  id: number;
  id_pieza: number;
  gramos_co2: number;
  fecha: Date;
  actividad: string;
}

export interface SensorIOT {
  id: number;
  tipo: string;
  ubicacion: string;
  descripcion: string;
  activo: boolean;
}

export interface MedidaSensor {
  id: number;
  id_sensor: number;
  valor: number;
  unidad: string;
  fecha: Date;
  evento: 'alerta' | 'normal';
}

export interface IAEvento {
  id: number;
  tipo: string;
  entidad_afectada_id: number;
  resultado: string;
  fecha: Date;
  comentario: string;
}

export interface Notificacion {
  id: number;
  id_usuario: number;
  mensaje: string;
  fecha_envio: Date;
  leido: boolean;
  tipo: string;
  canal: string;
}

export interface RankingOperario {
  id: number;
  id_usuario: number;
  puntos: number;
  piezas_despiezadas: number;
  tiempo_medio: number;
  periodo: Date;
}

export interface AuditLog {
  id: number;
  tabla: string;
  registro_id: number;
  campo: string;
  valor_anterior: string;
  valor_nuevo: string;
  usuario_id: number;
  fecha: Date;
  tipo_operacion: string;
}

// Nuevos tipos para Plantillas Vehículos
export interface PlantillaVehiculo {
  id: number;
  nombre: string;
  marca: string;
  modelo: string;
  version: string;
  piezas: PiezaPlantilla[];
  observaciones?: string;
  fecha_creacion: Date;
  fecha_modificacion?: Date;
  activa: boolean;
}

export interface PiezaPlantilla {
  id: number;
  nombre: string;
  descripcion: string;
  categoria: string;
  obligatoria: boolean;
}

// Tipos para Campas de Almacenamiento
export interface CampaAlmacenamiento {
  id: number;
  nombre: string;
  direccion: string;
  ubicacion_gps?: string;
  capacidad_maxima: number;
  estado: 'activa' | 'inactiva' | 'mantenimiento';
  observaciones?: string;
  fecha_creacion: Date;
  vehiculos_asignados: VehiculoCampa[];
}

export interface VehiculoCampa {
  id: number;
  id_vehiculo: number;
  vehiculo_info: {
    marca: string;
    modelo: string;
    matricula: string;
  };
  fecha_asignacion: Date;
  estado: 'almacenado' | 'en_proceso' | 'listo_despiece';
}
