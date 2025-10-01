import { config } from 'dotenv';

import { PrismaClient } from '../src/generated/prisma/client';

config();

const prisma = new PrismaClient();

async function main() {
  // Create default user role
  await prisma.userRole.upsert({
    where: { role: 'user' },
    update: {},
    create: { role: 'user' },
  });

  // Create admin role
  await prisma.userRole.upsert({
    where: { role: 'admin' },
    update: {},
    create: { role: 'admin' },
  });

  console.log('Database seeded successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
