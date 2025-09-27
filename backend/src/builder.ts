import SchemaBuilder from '@pothos/core';
import PrismaPlugin, { PrismaClient } from '@pothos/plugin-prisma';
import ScopeAuthPlugin from '@pothos/plugin-scope-auth';
import { DateResolver, DateTimeResolver, ByteResolver } from 'graphql-scalars';
import { GraphQLScalarType, Kind } from 'graphql';
import { Decimal } from './generated/prisma/internal/prismaNamespace';

import { prisma } from './client';
import PrismaTypes from './generated/pothos';
import { getDatamodel } from './generated/pothos';

// ----------------------------------------------------------------------------
export const builder = new SchemaBuilder<{
  PrismaTypes: PrismaTypes;
  Context: {
    req: any;
    prisma: PrismaClient;
    jwt?: any;
    user?: {
      id: string;
      email: string;
      name: string;
      role: string;
    };
  };
  AuthScopes: {
    authenticated: boolean;
  };
  Scalars: {
    DateTime: {
      Input: Date;
      Output: Date;
    };
    Date: {
      Input: Date;
      Output: Date;
    };
    Decimal: {
      Input: Decimal;
      Output: Decimal;
    };
    Bytes: {
      Input: string;
      Output: string;
    };
  };
}>({
  plugins: [PrismaPlugin, ScopeAuthPlugin],
  scopeAuth: {
    defaultStrategy: 'any',
    treatErrorsAsUnauthorized: true,
    authScopes: () => {
      return {
        authenticated: false, // Will be overridden in context
      };
    },
  },
  prisma: {
    client: prisma,
    dmmf: getDatamodel(),
  },
});

builder.queryType({});
builder.mutationType({});

builder.addScalarType('DateTime', DateTimeResolver);
builder.addScalarType('Date', DateResolver);
builder.addScalarType('Bytes', ByteResolver);

// Custom Decimal Scalar
const DecimalResolver = new GraphQLScalarType({
  name: 'Decimal',
  description: 'A custom decimal scalar',
  serialize(value: unknown): number {
    if (value instanceof Decimal) {
      return value.toNumber();
    }
    return parseFloat(String(value));
  },
  parseValue(value: unknown): Decimal | null {
    if (typeof value === 'string' || typeof value === 'number') {
      return new Decimal(value);
    }
    return null;
  },
  parseLiteral(ast): Decimal | null {
    if (ast.kind === Kind.FLOAT || ast.kind === Kind.INT) {
      return new Decimal(ast.value);
    }
    return null;
  },
});

builder.addScalarType('Decimal', DecimalResolver);
