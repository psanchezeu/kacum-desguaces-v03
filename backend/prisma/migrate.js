const { exec } = require('child_process');

console.log('Iniciando migración de Prisma...');

exec('npx prisma migrate dev --name add_woocommerce_config', (error, stdout, stderr) => {
  if (error) {
    console.error(`Error al ejecutar la migración: ${error.message}`);
    return;
  }
  if (stderr) {
    console.error(`Error en la migración: ${stderr}`);
    return;
  }
  console.log(`Migración completada con éxito: ${stdout}`);
});
