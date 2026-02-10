const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter, log: ['error'] });

prisma.shipping_zones.findMany({ where: { active: true }, orderBy: { id: 'asc' } })
  .then((r) => {
    console.log('ok', r.length);
  })
  .catch((e) => {
    console.error('err', e);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
