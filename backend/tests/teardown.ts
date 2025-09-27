/**
 * Global teardown function that runs after all tests have finished
 * This function cleans up test data to prevent the database from accumulating test users
 */
export default async function teardown() {
  // For now, skip teardown to avoid ESM issues
  // The setup.ts already cleans up test users before each test run
  console.log('Global teardown: Skipping cleanup (handled by setup)');

  // // Use dynamic import to avoid ESM issues in teardown context
  // const { PrismaClient } = await import('../src/generated/prisma/client');
  // const { default: logger } = await import('./utils/logger');

  // // Initialize Prisma Client
  // // Note: We're not using the prisma instance from setup.ts here
  // // because teardown runs in a different process/context
  // const prisma = new PrismaClient();

  // try {
  //   // Clean up all test users (those with @example.com emails)
  //   // This helps prevent the database from accumulating test data
  //   const deletedUsers = await prisma.user.deleteMany({
  //     where: {
  //       email: {
  //         endsWith: '@example.com',
  //       },
  //     },
  //   });

  //   logger.info(`Global teardown: Cleaned up ${deletedUsers.count} test users`);
  // } catch (error) {
  //   logger.error(`Global teardown: Error cleaning up test users - ${error}`);
  // } finally {
  //   await prisma.$disconnect();
  // }
}
