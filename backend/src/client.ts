// import { PrismaPg } from '@prisma/adapter-pg'

// import { PrismaClient } from './generated/prisma/client'

// const connectionString = `${process.env.DATABASE_URL}`

// const adapter: PrismaPg = new PrismaPg({ connectionString, schema: 'public' })
// export const prisma = new PrismaClient({
//   adapter,
//   log:
//     process.env.NODE_ENV === 'development'
//       ? ['query', 'error', 'warn']
//       : ['error'],
// })

import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import { config } from 'dotenv'
import { PrismaClient } from './generated/prisma/client'
import logger from './utils/logger'

config()

// Create pool with better timeout settings
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 3, // Small pool
  idleTimeoutMillis: 5000, // 5 seconds
  connectionTimeoutMillis: 3000, // 3 seconds
})

const adapter = new PrismaPg(pool, { schema: 'public' })

export const prisma = new PrismaClient({
  adapter,
  log:
    process.env.NODE_ENV === 'development'
      ? ['query', 'error', 'info', 'warn']
      : ['info', 'error'],
})

// Log pool events for debugging
pool.on('error', (err) => {
  logger.error('Pool error:', err)
})

pool.on('connect', () => {
  logger.info('Pool connected to database')
})
