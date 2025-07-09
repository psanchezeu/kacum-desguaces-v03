/*
  Warnings:

  - You are about to drop the column `actividad` on the `HuellaCarbono` table. All the data in the column will be lost.
  - You are about to drop the column `gramos_co2` on the `HuellaCarbono` table. All the data in the column will be lost.
  - Added the required column `valor_co2` to the `HuellaCarbono` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "VehiculoFoto" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "id_vehiculo" INTEGER NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "nombre_archivo" TEXT NOT NULL,
    "fecha_subida" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tamanio" INTEGER NOT NULL,
    "es_principal" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "VehiculoFoto_id_vehiculo_fkey" FOREIGN KEY ("id_vehiculo") REFERENCES "Vehiculo" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "VehiculoDocumento" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "id_vehiculo" INTEGER NOT NULL,
    "nombre" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "nombre_archivo" TEXT NOT NULL,
    "fecha_subida" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tamanio" INTEGER NOT NULL,
    CONSTRAINT "VehiculoDocumento_id_vehiculo_fkey" FOREIGN KEY ("id_vehiculo") REFERENCES "Vehiculo" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_HuellaCarbono" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "id_pieza" INTEGER NOT NULL,
    "valor_co2" REAL NOT NULL,
    "fecha" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "descripcion" TEXT,
    CONSTRAINT "HuellaCarbono_id_pieza_fkey" FOREIGN KEY ("id_pieza") REFERENCES "Pieza" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_HuellaCarbono" ("fecha", "id", "id_pieza") SELECT "fecha", "id", "id_pieza" FROM "HuellaCarbono";
DROP TABLE "HuellaCarbono";
ALTER TABLE "new_HuellaCarbono" RENAME TO "HuellaCarbono";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
