-- CreateTable
CREATE TABLE "Cliente" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "apellidos" TEXT NOT NULL,
    "dni_nif" TEXT NOT NULL,
    "telefono" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "direccion" TEXT NOT NULL,
    "tipo_cliente" TEXT NOT NULL,
    "razon_social" TEXT,
    "cif" TEXT,
    "acepta_comunicaciones" BOOLEAN NOT NULL,
    "fecha_alta" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_baja" DATETIME,
    "observaciones" TEXT
);

-- CreateTable
CREATE TABLE "Vehiculo" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "id_cliente" INTEGER NOT NULL,
    "marca" TEXT NOT NULL,
    "modelo" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "anio_fabricacion" INTEGER NOT NULL,
    "color" TEXT NOT NULL,
    "matricula" TEXT NOT NULL,
    "vin" TEXT NOT NULL,
    "tipo_combustible" TEXT NOT NULL,
    "kilometros" INTEGER NOT NULL,
    "fecha_matriculacion" DATETIME NOT NULL,
    "estado" TEXT NOT NULL,
    "ubicacion_actual" TEXT NOT NULL,
    "ubicacion_gps" TEXT,
    "observaciones" TEXT,
    CONSTRAINT "Vehiculo_id_cliente_fkey" FOREIGN KEY ("id_cliente") REFERENCES "Cliente" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Pieza" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "id_vehiculo" INTEGER NOT NULL,
    "tipo_pieza" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "estado" TEXT NOT NULL,
    "ubicacion_almacen" TEXT NOT NULL,
    "codigo_qr" TEXT,
    "rfid" TEXT,
    "fecha_extraccion" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_caducidad" DATETIME,
    "lote" TEXT,
    "precio_coste" REAL NOT NULL,
    "precio_venta" REAL NOT NULL,
    "reciclable" BOOLEAN NOT NULL,
    "bloqueada_venta" BOOLEAN NOT NULL,
    "observaciones" TEXT,
    CONSTRAINT "Pieza_id_vehiculo_fkey" FOREIGN KEY ("id_vehiculo") REFERENCES "Vehiculo" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Pedido" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "id_cliente" INTEGER NOT NULL,
    "id_pieza" INTEGER NOT NULL,
    "tipo_venta" TEXT NOT NULL,
    "fecha_pedido" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "estado" TEXT NOT NULL,
    "metodo_pago" TEXT NOT NULL,
    "direccion_envio" TEXT NOT NULL,
    "empresa_envio" TEXT NOT NULL,
    "total" REAL NOT NULL,
    CONSTRAINT "Pedido_id_cliente_fkey" FOREIGN KEY ("id_cliente") REFERENCES "Cliente" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Pedido_id_pieza_fkey" FOREIGN KEY ("id_pieza") REFERENCES "Pieza" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Incidencia" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "tipo" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "id_usuario_reporta" INTEGER NOT NULL,
    "id_entidad_afectada" INTEGER NOT NULL,
    "entidad_tipo" TEXT NOT NULL,
    "estado" TEXT NOT NULL,
    "fecha_apertura" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_cierre" DATETIME,
    "resolucion" TEXT,
    CONSTRAINT "Incidencia_id_usuario_reporta_fkey" FOREIGN KEY ("id_usuario_reporta") REFERENCES "Usuario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ActivityItem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "tipo" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "fecha" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usuario" TEXT NOT NULL,
    "entidad_id" INTEGER,
    "entidad_tipo" TEXT
);

-- CreateTable
CREATE TABLE "Usuario" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "apellidos" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefono" TEXT NOT NULL,
    "rol" TEXT NOT NULL,
    "mfa_activado" BOOLEAN NOT NULL,
    "activo" BOOLEAN NOT NULL,
    "fecha_alta" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "observaciones" TEXT
);

-- CreateTable
CREATE TABLE "Documento" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "id_vehiculo" INTEGER,
    "id_cliente" INTEGER,
    "tipo" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "fecha_subida" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_caducidad" DATETIME,
    "firmado" BOOLEAN NOT NULL,
    "estado_validacion" TEXT NOT NULL,
    "fecha_validacion" DATETIME,
    "validado_por" INTEGER,
    CONSTRAINT "Documento_id_vehiculo_fkey" FOREIGN KEY ("id_vehiculo") REFERENCES "Vehiculo" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Documento_id_cliente_fkey" FOREIGN KEY ("id_cliente") REFERENCES "Cliente" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Grua" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "matricula" TEXT NOT NULL,
    "modelo" TEXT NOT NULL,
    "capacidad_kg" INTEGER NOT NULL,
    "conductor_asignado" TEXT NOT NULL,
    "estado" TEXT NOT NULL,
    "gps_ultimo_punto" TEXT,
    "fecha_ultimo_mantenimiento" DATETIME NOT NULL,
    "kilometraje" INTEGER NOT NULL,
    "itv_estado" TEXT NOT NULL,
    "itv_fecha" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "MantenimientoGrua" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "id_grua" INTEGER NOT NULL,
    "tipo" TEXT NOT NULL,
    "fecha" DATETIME NOT NULL,
    "realizado_por" TEXT NOT NULL,
    "url_documento" TEXT,
    CONSTRAINT "MantenimientoGrua_id_grua_fkey" FOREIGN KEY ("id_grua") REFERENCES "Grua" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SolicitudRecogida" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "id_cliente" INTEGER NOT NULL,
    "id_vehiculo" INTEGER NOT NULL,
    "id_grua" INTEGER,
    "fecha_solicitud" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "estado" TEXT NOT NULL,
    "direccion_recogida" TEXT NOT NULL,
    "contacto_recogida" TEXT NOT NULL,
    "fecha_recogida" DATETIME,
    "firmado_por" TEXT,
    "url_firma" TEXT,
    CONSTRAINT "SolicitudRecogida_id_cliente_fkey" FOREIGN KEY ("id_cliente") REFERENCES "Cliente" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "SolicitudRecogida_id_vehiculo_fkey" FOREIGN KEY ("id_vehiculo") REFERENCES "Vehiculo" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "SolicitudRecogida_id_grua_fkey" FOREIGN KEY ("id_grua") REFERENCES "Grua" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Almacen" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "ubicacion" TEXT NOT NULL,
    "responsable" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "estado" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Campa" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "ubicacion" TEXT NOT NULL,
    "gps" TEXT,
    "tipo" TEXT NOT NULL,
    "responsable" TEXT NOT NULL,
    "estado" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "HistorialEstadoPieza" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "id_pieza" INTEGER NOT NULL,
    "estado" TEXT NOT NULL,
    "fecha" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usuario" TEXT NOT NULL,
    "motivo" TEXT NOT NULL,
    CONSTRAINT "HistorialEstadoPieza_id_pieza_fkey" FOREIGN KEY ("id_pieza") REFERENCES "Pieza" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Factura" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "id_cliente" INTEGER NOT NULL,
    "id_pedido" INTEGER NOT NULL,
    "fecha_emision" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "importe_total" REAL NOT NULL,
    "estado" TEXT NOT NULL,
    "url_pdf" TEXT,
    "iva" REAL NOT NULL,
    "base_imponible" REAL NOT NULL,
    CONSTRAINT "Factura_id_cliente_fkey" FOREIGN KEY ("id_cliente") REFERENCES "Cliente" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Factura_id_pedido_fkey" FOREIGN KEY ("id_pedido") REFERENCES "Pedido" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Devolucion" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "id_pedido" INTEGER NOT NULL,
    "id_cliente" INTEGER NOT NULL,
    "motivo" TEXT NOT NULL,
    "fecha" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "estado" TEXT NOT NULL,
    "importe" REAL NOT NULL,
    "responsable" TEXT NOT NULL,
    "url_documento" TEXT,
    CONSTRAINT "Devolucion_id_pedido_fkey" FOREIGN KEY ("id_pedido") REFERENCES "Pedido" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Devolucion_id_cliente_fkey" FOREIGN KEY ("id_cliente") REFERENCES "Cliente" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Garantia" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "id_pieza" INTEGER NOT NULL,
    "id_cliente" INTEGER NOT NULL,
    "fecha_inicio" DATETIME NOT NULL,
    "fecha_fin" DATETIME NOT NULL,
    "condiciones" TEXT NOT NULL,
    "estado" TEXT NOT NULL,
    "url_documento" TEXT,
    CONSTRAINT "Garantia_id_pieza_fkey" FOREIGN KEY ("id_pieza") REFERENCES "Pieza" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Garantia_id_cliente_fkey" FOREIGN KEY ("id_cliente") REFERENCES "Cliente" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Transferencia" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "id_pieza" INTEGER NOT NULL,
    "id_almacen_origen" INTEGER NOT NULL,
    "id_almacen_destino" INTEGER NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "fecha" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "motivo" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    CONSTRAINT "Transferencia_id_pieza_fkey" FOREIGN KEY ("id_pieza") REFERENCES "Pieza" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Transferencia_id_almacen_origen_fkey" FOREIGN KEY ("id_almacen_origen") REFERENCES "Almacen" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Transferencia_id_almacen_destino_fkey" FOREIGN KEY ("id_almacen_destino") REFERENCES "Almacen" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Proveedor" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "cif" TEXT NOT NULL,
    "direccion" TEXT NOT NULL,
    "contacto" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefono" TEXT NOT NULL,
    "estado" TEXT NOT NULL,
    "tipo" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "ProveedorProducto" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "id_proveedor" INTEGER NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "precio_unitario" REAL NOT NULL,
    "codigo_proveedor" TEXT NOT NULL,
    CONSTRAINT "ProveedorProducto_id_proveedor_fkey" FOREIGN KEY ("id_proveedor") REFERENCES "Proveedor" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Compra" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "id_proveedor" INTEGER NOT NULL,
    "fecha_compra" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "importe_total" REAL NOT NULL,
    "estado" TEXT NOT NULL,
    CONSTRAINT "Compra_id_proveedor_fkey" FOREIGN KEY ("id_proveedor") REFERENCES "Proveedor" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CompraDetalle" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "id_compra" INTEGER NOT NULL,
    "id_prov_prod" INTEGER NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "precio_unitario" REAL NOT NULL,
    CONSTRAINT "CompraDetalle_id_compra_fkey" FOREIGN KEY ("id_compra") REFERENCES "Compra" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "CompraDetalle_id_prov_prod_fkey" FOREIGN KEY ("id_prov_prod") REFERENCES "ProveedorProducto" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MaterialReciclado" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "tipo_material" TEXT NOT NULL,
    "peso_kg" REAL NOT NULL,
    "fecha_reciclaje" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id_pieza" INTEGER NOT NULL,
    "destino" TEXT NOT NULL,
    "empresa_gestora" TEXT NOT NULL,
    CONSTRAINT "MaterialReciclado_id_pieza_fkey" FOREIGN KEY ("id_pieza") REFERENCES "Pieza" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "HuellaCarbono" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "id_pieza" INTEGER NOT NULL,
    "gramos_co2" REAL NOT NULL,
    "fecha" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actividad" TEXT NOT NULL,
    CONSTRAINT "HuellaCarbono_id_pieza_fkey" FOREIGN KEY ("id_pieza") REFERENCES "Pieza" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SensorIOT" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "tipo" TEXT NOT NULL,
    "ubicacion" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL
);

-- CreateTable
CREATE TABLE "MedidaSensor" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "id_sensor" INTEGER NOT NULL,
    "valor" REAL NOT NULL,
    "unidad" TEXT NOT NULL,
    "fecha" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "evento" TEXT NOT NULL,
    CONSTRAINT "MedidaSensor_id_sensor_fkey" FOREIGN KEY ("id_sensor") REFERENCES "SensorIOT" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "IAEvento" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "tipo" TEXT NOT NULL,
    "entidad_afectada_id" INTEGER NOT NULL,
    "resultado" TEXT NOT NULL,
    "fecha" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "comentario" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Notificacion" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "id_usuario" INTEGER NOT NULL,
    "id_cliente" INTEGER,
    "mensaje" TEXT NOT NULL,
    "fecha_envio" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "leido" BOOLEAN NOT NULL,
    "tipo" TEXT NOT NULL,
    "canal" TEXT NOT NULL,
    CONSTRAINT "Notificacion_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "Usuario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Notificacion_id_cliente_fkey" FOREIGN KEY ("id_cliente") REFERENCES "Cliente" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RankingOperario" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "id_usuario" INTEGER NOT NULL,
    "puntos" INTEGER NOT NULL,
    "piezas_despiezadas" INTEGER NOT NULL,
    "tiempo_medio" REAL NOT NULL,
    "periodo" DATETIME NOT NULL,
    CONSTRAINT "RankingOperario_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "Usuario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "tabla" TEXT NOT NULL,
    "registro_id" INTEGER NOT NULL,
    "campo" TEXT NOT NULL,
    "valor_anterior" TEXT NOT NULL,
    "valor_nuevo" TEXT NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "fecha" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tipo_operacion" TEXT NOT NULL,
    CONSTRAINT "AuditLog_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "Usuario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PlantillaVehiculo" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "marca" TEXT NOT NULL,
    "modelo" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "observaciones" TEXT,
    "fecha_creacion" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_modificacion" DATETIME,
    "activa" BOOLEAN NOT NULL
);

-- CreateTable
CREATE TABLE "PiezaPlantilla" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "id_plantilla" INTEGER NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "obligatoria" BOOLEAN NOT NULL,
    CONSTRAINT "PiezaPlantilla_id_plantilla_fkey" FOREIGN KEY ("id_plantilla") REFERENCES "PlantillaVehiculo" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CampaAlmacenamiento" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "direccion" TEXT NOT NULL,
    "ubicacion_gps" TEXT,
    "capacidad_maxima" INTEGER NOT NULL,
    "estado" TEXT NOT NULL,
    "observaciones" TEXT,
    "fecha_creacion" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "VehiculoCampa" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "id_vehiculo" INTEGER NOT NULL,
    "id_campa" INTEGER NOT NULL,
    "fecha_asignacion" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "estado" TEXT NOT NULL,
    CONSTRAINT "VehiculoCampa_id_campa_fkey" FOREIGN KEY ("id_campa") REFERENCES "CampaAlmacenamiento" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Cliente_dni_nif_key" ON "Cliente"("dni_nif");

-- CreateIndex
CREATE UNIQUE INDEX "Vehiculo_matricula_key" ON "Vehiculo"("matricula");

-- CreateIndex
CREATE UNIQUE INDEX "Vehiculo_vin_key" ON "Vehiculo"("vin");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Grua_matricula_key" ON "Grua"("matricula");

-- CreateIndex
CREATE UNIQUE INDEX "Proveedor_cif_key" ON "Proveedor"("cif");
