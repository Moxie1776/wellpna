/** Global teardown — remove test data created during tests. */
export default async function teardown() {
  const { default: logger } = await import('./utils/logger')

  try {
    // Prisma instance from setup
    const prisma = (global as any).testPrisma

    if (!prisma) {
      logger.info('Global teardown: Prisma not available, skipping cleanup')
      return
    }

    const deletedUsers = await prisma.user.deleteMany({
      where: { email: { endsWith: '@example.com' } },
    })

    logger.info(`Global teardown: Cleaned up ${deletedUsers.count} test users`)
    await prisma.$disconnect()
  } catch (error) {
    logger.error(`Global teardown: Error during cleanup - ${error}`)
  }
}
