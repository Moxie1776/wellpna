import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { prisma } from './prismaClient';
import { getTokenPayload } from './utils';
import { resolvers } from './resolvers';
import { typeDefs } from './graphql/schema';
import { User as UserModel } from './generated/client';

// Define the context type
interface MyContext {
  prisma: typeof prisma;
  user?: UserModel | null;
}

const server = new ApolloServer<MyContext>({
  typeDefs,
  resolvers,
});

const startServer = async () => {
  const { url } = await startStandaloneServer(server, {
    listen: { port: 4000 },
    context: async ({ req }) => {
      const token = req.headers.authorization || '';

      if (token) {
        try {
          // Extract and validate token
          const payload = getTokenPayload(token.replace('Bearer ', ''));

          // Fetch the full user information including role
          const user = await prisma.user.findUnique({
            where: { id: payload.userId.toString() },
            include: { role: true },
          });
          return { prisma, user };
        } catch (error) {
          console.error('Token validation error:', error);
          // Return context without user if token is invalid
          return { prisma };
        }
      }
      // Return context without user if no token is provided
      return { prisma };
    },
  });
  console.log(`🚀  Server ready at: ${url}`);
};

startServer();
