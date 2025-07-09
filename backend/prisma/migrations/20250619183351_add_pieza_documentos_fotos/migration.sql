/*
  Warnings:

  - You are about to drop the `PiezaDocumento` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PiezaFoto` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `VehiculoDocumento` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `VehiculoFoto` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `descripcion` on the `HuellaCarbono` table. All the data in the column will be lost.
  - You are about to drop the column `valor_co2` on the `HuellaCarbono` table. All the data in the column will be lost.
  - Added the required column `nombre` to the `Documento` table without a default value. This is not possible if the table is not empty.
  - Added the required column `actividad` to the `HuellaCarbono` table without a default value. This is not possible if the table is not empty.
  - Added the required column `gramos_co2` to the `HuellaCarbono` table without a default value. This is not possible if the table is not empty.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "PiezaDocumento";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "PiezaFoto";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "VehiculoDocumento";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "VehiculoFoto";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "Foto" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "id_pieza" INTEGER NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "url" TEXT NOT NULL,
    "tamanio" INTEGER NOT NULL DEFAULT 0,
    "fecha_subida" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "es_principal" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "Foto_id_pieza_fkey" FOREIGN KEY ("id_pieza") REFERENCES "Pieza" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Documento" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "id_vehiculo" INTEGER,
    "id_cliente" INTEGER,
    "id_pieza" INTEGER,
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
    CONSTRAINT "Documento_id_pieza_fkey" FOREIGN KEY ("id_pieza") REFERENCES "Pieza" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Documento" ("estado_validacion", "fecha_caducidad", "fecha_subida", "fecha_validacion", "firmado", "id", "id_cliente", "id_vehiculo", "tipo", "url", "validado_por") SELECT "estado_validacion", "fecha_caducidad", "fecha_subida", "fecha_validacion", "firmado", "id", "id_cliente", "id_vehiculo", "tipo", "url", "validado_por" FROM "Documento";
DROP TABLE "Documento";
ALTER TABLE "new_Documento" RENAME TO "Documento";
CREATE TABLE "new_HuellaCarbono" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "id_pieza" INTEGER NOT NULL,
    "gramos_co2" REAL NOT NULL,
    "fecha" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actividad" TEXT NOT NULL,
    CONSTRAINT "HuellaCarbono_id_pieza_fkey" FOREIGN KEY ("id_pieza") REFERENCES "Pieza" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_HuellaCarbono" ("fecha", "id", "id_pieza") SELECT "fecha", "id", "id_pieza" FROM "HuellaCarbono";
DROP TABLE "HuellaCarbono";
ALTER TABLE "new_HuellaCarbono" RENAME TO "HuellaCarbono";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
