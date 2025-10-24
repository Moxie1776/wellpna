import { config } from 'dotenv'

import { prisma } from '../src/client'
import logger from '../src/utils/logger'

config()

async function main() {
  try {
    logger.info('Seeding: Creating user role...')
    const userRole = await prisma.userRole.upsert({
      where: { role: 'user' },
      update: {},
      create: { role: 'user' },
    })
    logger.info('User role result:', userRole)

    logger.info('Seeding: Creating admin role...')
    const adminRole = await prisma.userRole.upsert({
      where: { role: 'admin' },
      update: {},
      create: { role: 'admin' },
    })
    logger.info('Admin role result:', adminRole)

    logger.info('Database seeded successfully')
  } catch (error) {
    logger.error('Seeding error:', error)
    throw error
  }
}

main()
  .catch((e) => {
    logger.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
