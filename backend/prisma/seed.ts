import { config } from 'dotenv'

import { prisma } from '../src/client'

config()

async function main() {
  try {
    console.log('Seeding: Creating user role...')
    const userRole = await prisma.userRole.upsert({
      where: { role: 'user' },
      update: {},
      create: { role: 'user' },
    })
    console.log('User role result:', userRole)

    console.log('Seeding: Creating admin role...')
    const adminRole = await prisma.userRole.upsert({
      where: { role: 'admin' },
      update: {},
      create: { role: 'admin' },
    })
    console.log('Admin role result:', adminRole)

    console.log('Database seeded successfully')
  } catch (error) {
    console.error('Seeding error:', error)
    throw error
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
