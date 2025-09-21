import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { prisma } from './prismaClient';
import { getTokenPayload } from './utils';
import { signup, login } from './auth';
import { minePdf, mineExcel } from './services/dataMiner';
import path from 'path';



const typeDefs = `#graphql
  scalar JSON

  type Query {
    hello: String
  }

  type Mutation {
    signup(email: String!, password: String!): AuthPayload!
    login(email: String!, password: String!): AuthPayload!
    mineData(fileName: String!): JSON
  }

  type User {
    id: Int!
    email: String!
  }

  type AuthPayload {
    token: String!
    user: User!
  }
`;

const resolvers = {
  Query: {
    hello: () => 'Hello world!',
  },
  Mutation: {
    signup,
    login,
    mineData: async (_: any, { fileName }: { fileName: string }) => {
      const filePath = path.join(__dirname, '..', '..', 'data', fileName);
      if (fileName.endsWith('.pdf')) {
        return minePdf(filePath);
      } else if (fileName.endsWith('.xlsm') || fileName.endsWith('.xlsx')) {
        return mineExcel(filePath);
      } else {
        throw new Error('Unsupported file type');
      }
    },
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

const startServer = async () => {
  const { url } = await startStandaloneServer(server, {
    listen: { port: 4000 },
    context: async ({ req }) => {
      const token = req.headers.authorization || '';
      if (token) {
        const { userId } = getTokenPayload(token.replace('Bearer ', ''));
        return { prisma, userId };
      }
      return { prisma };
    },
  });
  console.log(`🚀  Server ready at: ${url}`);
};

startServer();
