import { PrismaPg } from '@prisma/adapter-pg'
import { config } from 'dotenv'

import { PrismaClient } from './generated/prisma/client'

config()

const adapter = new PrismaPg(
  { connectionString: process.env.DATABASE_URL },
  { schema: 'public' },
)
export const prisma = new PrismaClient({
  adapter,
  log:
    process.env.NODE_ENV === 'development'
      ? ['query', 'error', 'warn']
      : ['error'],
})
