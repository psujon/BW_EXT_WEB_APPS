const { prisma } = require('./db');

async function main() {
  const desc = await prisma.$queryRawUnsafe('DESCRIBE production');
  console.log('Production columns:', desc);

  const distinctQty = await prisma.$queryRawUnsafe('SELECT DISTINCT quantity FROM production');
  console.log('Distinct quantities:', distinctQty);

  const backups = await prisma.$queryRawUnsafe('SELECT * FROM backup_history');
  console.log('Backups:', backups);
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
