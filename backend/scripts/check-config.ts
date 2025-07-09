import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkConfig() {
  try {
    const configs = await prisma.configuracion.findMany();
    console.log('Configuraciones encontradas:', configs.length);
    console.log(JSON.stringify(configs, null, 2));
  } catch (error) {
    console.error('Error al consultar configuraciones:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkConfig();
