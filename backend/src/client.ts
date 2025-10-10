import { PrismaPg } from '@prisma/adapter-pg'
import { config } from 'dotenv'

import { PrismaClient } from './generated/prisma/client'
import secretManager from './utils/secret'

config()

// Initialize database connection asynchronously
let prismaInstance: PrismaClient | null = null

const createPrismaClient = async () => {
  if (!prismaInstance) {
    const databaseUrl = await secretManager.getDatabaseUrl()
    const adapter = new PrismaPg(
      { connectionString: databaseUrl },
      { schema: 'public' },
    )
    prismaInstance = new PrismaClient({
      adapter,
      log:
        process.env.NODE_ENV === 'development'
          ? ['query', 'error', 'warn']
          : ['error'],
    })
  }
  return prismaInstance
}

// Export a getter that ensures prisma is initialized
export const getPrisma = async () => {
  return await createPrismaClient()
}

// For backward compatibility, export a proxy that initializes on first access
export const prisma = new Proxy({} as any, {
  get(target, prop) {
    return async (...args: any[]) => {
      const instance = await getPrisma()
      const value = (instance as any)[prop]
      return typeof value === 'function' ? value.apply(instance, args) : value
    }
  },
})
