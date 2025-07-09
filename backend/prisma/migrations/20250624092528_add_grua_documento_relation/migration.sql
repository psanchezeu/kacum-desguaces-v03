-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Documento" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "id_vehiculo" INTEGER,
    "id_cliente" INTEGER,
    "id_pieza" INTEGER,
    "id_grua" INTEGER,
    "nombre" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "tamanio" INTEGER NOT NULL DEFAULT 0,
    "fecha_subida" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_caducidad" DATETIME,
    "firmado" BOOLEAN NOT NULL DEFAULT false,
    "estado_validacion" TEXT NOT NULL DEFAULT 'pendiente',
    "fecha_validacion" DATETIME,
    "validado_por" INTEGER,
    CONSTRAINT "Documento_id_vehiculo_fkey" FOREIGN KEY ("id_vehiculo") REFERENCES "Vehiculo" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Documento_id_cliente_fkey" FOREIGN KEY ("id_cliente") REFERENCES "Cliente" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Documento_id_pieza_fkey" FOREIGN KEY ("id_pieza") REFERENCES "Pieza" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Documento_id_grua_fkey" FOREIGN KEY ("id_grua") REFERENCES "Grua" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Documento" ("estado_validacion", "fecha_caducidad", "fecha_subida", "fecha_validacion", "firmado", "id", "id_cliente", "id_pieza", "id_vehiculo", "nombre", "tamanio", "tipo", "url", "validado_por") SELECT "estado_validacion", "fecha_caducidad", "fecha_subida", "fecha_validacion", "firmado", "id", "id_cliente", "id_pieza", "id_vehiculo", "nombre", "tamanio", "tipo", "url", "validado_por" FROM "Documento";
DROP TABLE "Documento";
ALTER TABLE "new_Documento" RENAME TO "Documento";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
