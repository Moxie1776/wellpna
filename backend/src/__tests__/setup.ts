import { PrismaClient } from '../generated/client';
import { execSync } from 'child_process';

// Create a test Prisma client with a separate database
export const prismaTest = new PrismaClient({
  datasourceUrl: 'file:./prisma/test.db',
});

// Setup before all tests
beforeAll(async () => {
  // Run migrations on test database
  execSync('cd prisma && npx prisma migrate deploy --schema=schema.prisma', {
    env: { ...process.env, DATABASE_URL: 'file:./prisma/test.db' },
    cwd: __dirname + '/../..',
  });

  // Connect to the test database
  await prismaTest.$connect();
});

// Cleanup after each test
afterEach(async () => {
  // Clean up all data
  const tables = [
    'Casing',
    'CasingEnum',
    'Geology',
    'Location',
    'MechanicalIsolation',
    'MechanicalIsolationEnum',
    'Operator',
    'OperatorContact',
    'Perforation',
    'PlugCement',
    'PlugCementEnum',
    'PlugSchedule',
    'Rods',
    'RodEnum',
    'Tubing',
    'TubingEnum',
    'User',
    'UserRole',
    'Well',
    'WellInfo',
  ];

  for (const table of tables) {
    try {
      await prismaTest.$executeRawUnsafe(`DELETE FROM ${table};`);
    } catch (error) {
      // Table might not exist, continue
    }
  }
});

// Cleanup after all tests
afterAll(async () => {
  await prismaTest.$disconnect();
});
