import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Script para inicializar la configuración del sistema con valores predeterminados
 */
async function initConfig() {
  console.log('Inicializando configuración del sistema...');
  
  // Configuración general
  const configGeneral = {
    nombre_empresa: 'Kacum Desguaces',
    identificacion_fiscal: 'B12345678',
    direccion: 'Calle Principal 123',
    ciudad: 'Madrid',
    codigo_postal: '28001',
    telefono: '912345678',
    email: 'info@kacum-desguaces.com',
    sitio_web: 'https://kacum-desguaces.com',
    modo_oscuro: false
  };
  
  // Configuración de notificaciones
  const configNotificaciones = {
    email_nuevos_pedidos: true,
    email_nuevas_incidencias: true,
    email_nuevos_clientes: false,
    notif_stock_bajo: true,
    notif_seguridad: true
  };
  
  try {
    // Guardar configuración general
    for (const [clave, valor] of Object.entries(configGeneral)) {
      // Determinar el tipo de dato
      let tipo = 'texto';
      if (typeof valor === 'number') {
        tipo = 'numero';
      } else if (typeof valor === 'boolean') {
        tipo = 'booleano';
      } else if (typeof valor === 'object') {
        tipo = 'json';
      }
      
      // Convertir el valor a string para almacenarlo
      let valorString: string;
      if (typeof valor === 'object') {
        valorString = JSON.stringify(valor);
      } else {
        valorString = String(valor);
      }
      
      // Crear o actualizar la configuración
      await prisma.configuracion.upsert({
        where: { clave },
        update: { 
          valor: valorString,
          tipo,
          categoria: 'general',
          fecha_actualizacion: new Date()
        },
        create: {
          clave,
          valor: valorString,
          tipo,
          categoria: 'general',
          descripcion: `Configuración general: ${clave}`
        }
      });
      
      console.log(`Configuración general '${clave}' guardada.`);
    }
    
    // Guardar configuración de notificaciones
    for (const [clave, valor] of Object.entries(configNotificaciones)) {
      // Convertir el valor a string para almacenarlo
      const valorString = String(valor);
      
      // Crear o actualizar la configuración
      await prisma.configuracion.upsert({
        where: { clave },
        update: { 
          valor: valorString,
          tipo: 'booleano',
          categoria: 'notificaciones',
          fecha_actualizacion: new Date()
        },
        create: {
          clave,
          valor: valorString,
          tipo: 'booleano',
          categoria: 'notificaciones',
          descripcion: `Configuración de notificaciones: ${clave}`
        }
      });
      
      console.log(`Configuración de notificaciones '${clave}' guardada.`);
    }
    
    console.log('Inicialización de configuración completada con éxito.');
  } catch (error) {
    console.error('Error al inicializar la configuración:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar el script
initConfig();
