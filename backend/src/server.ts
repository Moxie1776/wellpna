import { createServer } from 'node:http'

import {
  createInlineSigningKeyProvider,
  useJWT,
} from '@graphql-yoga/plugin-jwt'
import dotenv from 'dotenv'
import { createYoga } from 'graphql-yoga'

import { prisma } from './client'
import { schema } from './schema'
import { JWT_SECRET } from './utils/constants'
import logger from './utils/logger'

// Load environment variables first
dotenv.config()

export interface GraphQLContext {
  req: any
  prisma: typeof prisma
  jwt?: any // JWT payload injected by the plugin
  user?: {
    id: string
    email: string
    name: string
    role: string
  }
}

// Create a Yoga instance with a GraphQL schema.
export const yoga = createYoga<GraphQLContext>({
  schema,
  graphiql: true,
  maskedErrors: false, // Show actual error messages in development/tests
  plugins: [
    useJWT({
      signingKeyProviders: [createInlineSigningKeyProvider(JWT_SECRET)],
      tokenVerification: {
        algorithms: ['HS256'],
      },
      extendContext: true, // Injects ctx.jwt
      reject: {
        missingToken: false,
        invalidToken: false,
      },
    }),
  ],
  context: async ({ request }) => {
    return {
      req: request,
      prisma: (global as any).testPrisma || prisma,
      logger,
    }
  },
  cors: {
    origin: [
      'http://localhost:5173',
      'https://wellpna.com',
      'https://www.wellpna.com',
      'https://3.17.67.172',
    ],
  },
})

// Pass it into a server to hook into request handlers.
export const server = createServer(yoga)

// Start the server and you're done!
// Only start if this file is run directly (not imported)
if (import.meta.url === `file://${process.argv[1]}`) {
  server.listen(4000, '0.0.0.0', () => {
    console.info(`
🚀 Server ready at: http://0.0.0.0:4000
⭐️ See sample queries: http://0.0.0.0:4000/graphql
    `)
    logger.info('Server started on http://0.0.0.0:4000')
  })
}
