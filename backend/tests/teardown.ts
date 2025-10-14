/**
 * Global teardown function that runs after all tests have finished
 * This function cleans up test data to prevent the database from
 * accumulating test users
 */
export default async function teardown() {
  // Use dynamic import to avoid ESM issues in teardown context
  const { default: logger } = await import('./utils/logger')

  try {
    // Get prisma from global context (set in setup.ts)
    const prisma = (global as any).testPrisma

    if (prisma) {
      // Clean up all test users (those with @example.com emails)
      // This helps prevent the database from accumulating test data
      const deletedUsers = await prisma.user.deleteMany({
        where: {
          email: {
            endsWith: '@example.com',
          },
        },
      })

      logger.info(
        `Global teardown: Cleaned up ${deletedUsers.count} test users`,
      )

      await prisma.$disconnect()
    } else {
      logger.info('Global teardown: Prisma not available, skipping cleanup')
    }
  } catch (error) {
    logger.error(`Global teardown: Error during cleanup - ${error}`)
  }
}
