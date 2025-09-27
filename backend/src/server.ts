import dotenv from 'dotenv';
import { createServer } from 'node:http';
import { createYoga } from 'graphql-yoga';
import {
  useJWT,
  createInlineSigningKeyProvider,
} from '@graphql-yoga/plugin-jwt';
import { schema } from './schema';
import { prisma } from './client';
import { JWT_SECRET } from './utils/constants';

// Load environment variables first
dotenv.config();

export interface GraphQLContext {
  req: any;
  prisma: typeof prisma;
  jwt?: any; // JWT payload injected by the plugin
  user?: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
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
      prisma,
    };
  },
});

// Pass it into a server to hook into request handlers.
const server = createServer(yoga);

// Start the server and you're done!
// Only start if this file is run directly (not imported)
if (import.meta.url === `file://${process.argv[1]}`) {
  server.listen(4000, () => {
    console.info(`
🚀 Server ready at: http://127.0.0.1:4000
⭐️ See sample queries: http://localhost:4000/graphql
    `);
  });
}
