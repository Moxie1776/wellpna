import { createServer } from 'node:http'

import {
  createInlineSigningKeyProvider,
  extractFromHeader,
  useJWT,
} from '@graphql-yoga/plugin-jwt'
import { config } from 'dotenv'
import { createYoga } from 'graphql-yoga'

import { prisma } from './client'
import { schema } from './schema'
import { JwtUserPayload } from './utils/auth'
import logger from './utils/logger'

// Load environment variables first
config()

export interface GraphQLContext {
  req: any
  prisma: typeof prisma
  jwt?: any
  user?: JwtUserPayload // User info extracted from JWT
  logger: typeof logger
}

// Create a Yoga instance with a GraphQL schema.
export const yoga = createYoga<GraphQLContext>({
  schema,
  graphiql: process.env.NODE_ENV === 'development' ? true : false,
  maskedErrors: false, // Show actual error messages in development/tests
  logging: {
    debug(message, ...args) {
      logger.debug(message, ...args)
    },
    info(message, ...args) {
      logger.info(message, ...args)
    },
    warn(message, ...args) {
      logger.warn(message, ...args)
    },
    error(message, ...args) {
      logger.error(message, ...args)
    },
  },
  plugins: [
    useJWT({
      signingKeyProviders: [
        createInlineSigningKeyProvider(process.env.JWT_SECRET!),
      ],
      tokenLookupLocations: [
        extractFromHeader({ name: 'authorization', prefix: 'Bearer' }),
      ],
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
    // Create base context
    const context: GraphQLContext = {
      req: request,
      prisma: (global as any).testPrisma || prisma,
      logger: logger,
    }

    // Diagnostic logging: show incoming Authorization header and JWT payload
    const authHeader =
      request.headers.get('authorization') ||
      request.headers.get('Authorization')
    logger.debug(`Incoming Authorization header: ${authHeader}`)
    logger.debug(
      `Context JWT before user mapping: ${JSON.stringify(
        (context as any).jwt?.payload || null,
      )}`,
    )

    return context
  },
  cors: {
    origin: [
      'https://wellpna.com',
      'https://www.wellpna.com',
      'https://3.17.67.172',
      'http://127.0.0.1:5173',
      'https://0.0.0.0:5173',
      'http://localhost:5173',
    ],
  },
})

// Pass it into a server to hook into request handlers.
export const server = createServer(yoga)

// Start the server and you're done!
// Only start if this file is run directly (not imported)
if (import.meta.url === `file://${process.argv[1]}`) {
  server.listen(4000, '0.0.0.0', () => {
    logger.info(`
🚀 Server ready at: http://0.0.0.0:4000
⭐️ See sample queries: http://0.0.0.0:4000/graphql
    `)
  })
}
