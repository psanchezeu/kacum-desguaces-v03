-- CreateTable
CREATE TABLE "PiezaFoto" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "id_pieza" INTEGER NOT NULL,
    "nombre_archivo" TEXT NOT NULL,
    "fecha_subida" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tamanio" INTEGER NOT NULL,
    "es_principal" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "PiezaFoto_id_pieza_fkey" FOREIGN KEY ("id_pieza") REFERENCES "Pieza" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PiezaDocumento" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "id_pieza" INTEGER NOT NULL,
    "nombre" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "nombre_archivo" TEXT NOT NULL,
    "fecha_subida" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tamanio" INTEGER NOT NULL,
    CONSTRAINT "PiezaDocumento_id_pieza_fkey" FOREIGN KEY ("id_pieza") REFERENCES "Pieza" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
