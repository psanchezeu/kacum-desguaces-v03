import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import dotenv from 'dotenv';

// Obtener el equivalente a __dirname en ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar variables de entorno
dotenv.config();

// Inicializar Prisma
const prisma = new PrismaClient();

/**
 * Función para inicializar la base de datos
 */
async function setupDatabase() {
  try {
    console.log('🔄 Configurando la base de datos SQLite...');
    
    // Verificar si el archivo de base de datos existe
    const dbPath = path.resolve(__dirname, '..', 'prisma', 'dev.db');
    const dbExists = fs.existsSync(dbPath);
    
    if (dbExists) {
      console.log('💾 Base de datos existente encontrada.');
    } else {
      console.log('🆕 Creando nueva base de datos SQLite...');
      
      try {
        // Generar el cliente Prisma
        console.log('🔄 Generando cliente Prisma...');
        execSync('npx prisma generate', { stdio: 'inherit' });
        
        // Ejecutar migraciones de Prisma
        console.log('🔄 Aplicando migraciones de Prisma...');
        execSync('npx prisma migrate deploy', { stdio: 'inherit' });
      } catch (migrationError) {
        console.error('❌ Error al ejecutar migraciones:', migrationError);
        console.log('🔄 Intentando crear la base de datos directamente...');
        
        // Si falla la migración, intentamos crear la base de datos directamente
        if (!fs.existsSync(path.dirname(dbPath))) {
          fs.mkdirSync(path.dirname(dbPath), { recursive: true });
        }
        
        // Crear un archivo SQLite vacío
        fs.writeFileSync(dbPath, '');
        console.log(`✅ Archivo de base de datos creado en: ${dbPath}`);
        
        // Ejecutar migraciones de nuevo
        console.log('🔄 Reintentando aplicar migraciones...');
        execSync('npx prisma migrate deploy', { stdio: 'inherit' });
      }
    }
    
    // Verificar la conexión a la base de datos
    await prisma.$connect();
    console.log('✅ Conexión a la base de datos establecida correctamente.');
    
    // Crear datos de ejemplo si la base de datos es nueva
    if (!dbExists) {
      console.log('📊 Creando datos de ejemplo...');
      await createSampleData();
    }
    
    console.log('✅ Configuración de la base de datos completada con éxito.');
  } catch (error) {
    console.error('❌ Error al configurar la base de datos:', error);
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Función para crear datos de ejemplo en la base de datos
 */
async function createSampleData() {
  try {
    // Crear un usuario administrador
    const admin = await prisma.usuario.create({
      data: {
        nombre: 'Admin',
        apellidos: 'Sistema',
        email: 'admin@kacum.com',
        telefono: '600123456',
        rol: 'administrador',
        mfa_activado: false,
        activo: true,
      },
    });
    console.log('👤 Usuario administrador creado:', admin.email);
    
    // Crear un cliente de ejemplo
    const cliente = await prisma.cliente.create({
      data: {
        nombre: 'Juan',
        apellidos: 'Pérez García',
        dni_nif: '12345678Z',
        telefono: '600987654',
        email: 'juan.perez@example.com',
        direccion: 'Calle Principal 123, Madrid',
        tipo_cliente: 'particular',
        acepta_comunicaciones: true,
      },
    });
    console.log('👥 Cliente de ejemplo creado:', cliente.nombre);
    
    // Crear un vehículo de ejemplo
    const vehiculo = await prisma.vehiculo.create({
      data: {
        id_cliente: cliente.id,
        marca: 'Seat',
        modelo: 'León',
        version: '1.6 TDI',
        anio_fabricacion: 2018,
        color: 'Rojo',
        matricula: '1234ABC',
        vin: 'VSSZZZ1PZAR123456',
        tipo_combustible: 'Diésel',
        kilometros: 85000,
        fecha_matriculacion: new Date('2018-06-15'),
        estado: 'Disponible',
        ubicacion_actual: 'Campa Principal',
      },
    });
    console.log('🚗 Vehículo de ejemplo creado:', vehiculo.marca, vehiculo.modelo);
    
    // Crear algunas piezas de ejemplo
    const piezas = await prisma.pieza.createMany({
      data: [
        {
          id_vehiculo: vehiculo.id,
          tipo_pieza: 'Motor',
          descripcion: 'Motor completo 1.6 TDI',
          estado: 'usada',
          ubicacion_almacen: 'Estantería A-12',
          precio_coste: 450,
          precio_venta: 1200,
          reciclable: false,
          bloqueada_venta: false,
        },
        {
          id_vehiculo: vehiculo.id,
          tipo_pieza: 'Puerta',
          descripcion: 'Puerta delantera izquierda',
          estado: 'usada',
          ubicacion_almacen: 'Estantería B-05',
          precio_coste: 120,
          precio_venta: 350,
          reciclable: true,
          bloqueada_venta: false,
        },
        {
          id_vehiculo: vehiculo.id,
          tipo_pieza: 'Faro',
          descripcion: 'Faro delantero derecho LED',
          estado: 'usada',
          ubicacion_almacen: 'Estantería C-08',
          precio_coste: 80,
          precio_venta: 220,
          reciclable: true,
          bloqueada_venta: false,
        },
      ],
    });
    console.log('⚙️ Piezas de ejemplo creadas:', piezas.count);
    
    // Crear un almacén de ejemplo
    const almacen = await prisma.almacen.create({
      data: {
        nombre: 'Almacén Principal',
        ubicacion: 'Polígono Industrial Norte',
        responsable: 'Carlos Rodríguez',
        tipo: 'principal',
        estado: 'activo',
      },
    });
    console.log('🏭 Almacén de ejemplo creado:', almacen.nombre);
    
    console.log('✅ Datos de ejemplo creados con éxito.');
  } catch (error) {
    console.error('❌ Error al crear datos de ejemplo:', error);
    throw error;
  }
}

// Ejecutar la configuración de la base de datos
setupDatabase();
