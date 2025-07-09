-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Vehiculo" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "id_cliente" INTEGER,
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
    CONSTRAINT "Vehiculo_id_cliente_fkey" FOREIGN KEY ("id_cliente") REFERENCES "Cliente" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Vehiculo" ("anio_fabricacion", "color", "estado", "fecha_matriculacion", "id", "id_cliente", "kilometros", "marca", "matricula", "modelo", "observaciones", "tipo_combustible", "ubicacion_actual", "ubicacion_gps", "version", "vin") SELECT "anio_fabricacion", "color", "estado", "fecha_matriculacion", "id", "id_cliente", "kilometros", "marca", "matricula", "modelo", "observaciones", "tipo_combustible", "ubicacion_actual", "ubicacion_gps", "version", "vin" FROM "Vehiculo";
DROP TABLE "Vehiculo";
ALTER TABLE "new_Vehiculo" RENAME TO "Vehiculo";
CREATE UNIQUE INDEX "Vehiculo_matricula_key" ON "Vehiculo"("matricula");
CREATE UNIQUE INDEX "Vehiculo_vin_key" ON "Vehiculo"("vin");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
