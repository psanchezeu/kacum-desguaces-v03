-- CreateTable
CREATE TABLE "WooCommerceConfig" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "url" TEXT NOT NULL,
    "consumer_key" TEXT NOT NULL,
    "consumer_secret" TEXT NOT NULL,
    "api_version" TEXT NOT NULL DEFAULT 'v3',
    "activo" BOOLEAN NOT NULL DEFAULT false,
    "fecha_creacion" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usuario_actualizacion" TEXT
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Pieza" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "id_vehiculo" INTEGER,
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
    CONSTRAINT "Pieza_id_vehiculo_fkey" FOREIGN KEY ("id_vehiculo") REFERENCES "Vehiculo" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Pieza" ("bloqueada_venta", "codigo_qr", "descripcion", "estado", "fecha_caducidad", "fecha_extraccion", "id", "id_vehiculo", "lote", "observaciones", "precio_coste", "precio_venta", "reciclable", "rfid", "tipo_pieza", "ubicacion_almacen") SELECT "bloqueada_venta", "codigo_qr", "descripcion", "estado", "fecha_caducidad", "fecha_extraccion", "id", "id_vehiculo", "lote", "observaciones", "precio_coste", "precio_venta", "reciclable", "rfid", "tipo_pieza", "ubicacion_almacen" FROM "Pieza";
DROP TABLE "Pieza";
ALTER TABLE "new_Pieza" RENAME TO "Pieza";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
