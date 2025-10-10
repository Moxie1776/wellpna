import { createServer } from 'node:http'

import {
  createInlineSigningKeyProvider,
  useJWT,
} from '@graphql-yoga/plugin-jwt'
import dotenv from 'dotenv'
import { createYoga } from 'graphql-yoga'

import { prisma } from './client'
import { schema } from './schema'
import { getJwtSecret } from './utils/constants'
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

// Initialize JWT secret
let jwtSecret: string
let yogaInstance: ReturnType<typeof createYoga<GraphQLContext>> | null = null

// Create a Yoga instance with a GraphQL schema.
// Note: JWT secret will be initialized asynchronously
const createYogaInstance = async () => {
  if (!jwtSecret) {
    jwtSecret = await getJwtSecret()
  }

  return createYoga<GraphQLContext>({
    schema,
    graphiql: true,
    maskedErrors: false, // Show actual error messages in development/tests
    plugins: [
      useJWT({
        signingKeyProviders: [createInlineSigningKeyProvider(jwtSecret)],
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
  })
}

// Export a getter that ensures yoga is initialized
export const getYoga = async () => {
  if (!yogaInstance) {
    yogaInstance = await createYogaInstance()
  }
  return yogaInstance
}

// For backward compatibility, we'll initialize on first access
export const yoga = new Proxy({} as any, {
  get(target, prop) {
    return async (...args: any[]) => {
      const instance = await getYoga()
      const value = (instance as any)[prop]
      return typeof value === 'function' ? value.apply(instance, args) : value
    }
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
    logger.info('Server started on 0.0.0.0:4000')
  })
}
