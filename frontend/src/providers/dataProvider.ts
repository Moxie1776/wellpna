import { buildGraphQLProvider, buildQuery } from 'ra-data-graphql-simple';
import { IntrospectionType } from 'graphql';

const introspection = {
  types: [
    {
      kind: 'OBJECT',
      name: 'User',
      fields: [
        { name: 'id', type: { kind: 'SCALAR', name: 'Int' } },
        { name: 'email', type: { kind: 'SCALAR', name: 'String' } },
      ],
    },
    {
      kind: 'OBJECT',
      name: 'Well',
      fields: [
        { name: 'id', type: { kind: 'SCALAR', name: 'Int' } },
        { name: 'name', type: { kind: 'SCALAR', name: 'String' } },
        { name: 'apiNumber', type: { kind: 'SCALAR', name: 'String' } },
      ],
    },
    {
      kind: 'OBJECT',
      name: 'Bid',
      fields: [
        { name: 'id', type: { kind: 'SCALAR', name: 'Int' } },
        { name: 'wellId', type: { kind: 'SCALAR', name: 'Int' } },
        { name: 'data', type: { kind: 'SCALAR', name: 'Json' } },
      ],
    },
  ],
  queries: [
    { name: 'User', type: { name: 'User' } },
    { name: 'allUsers', type: { name: 'User' } },
    { name: 'Well', type: { name: 'Well' } },
    { name: 'allWells', type: { name: 'Well' } },
    { name: 'Bid', type: { name: 'Bid' } },
    { name: 'allBids', type: { name: 'Bid' } },
  ],
};

export const dataProvider = buildGraphQLProvider({
    clientOptions: {
        uri: 'http://localhost:4000/',
    },
    introspection: {
        schema: introspection as unknown as IntrospectionType,
    },
    buildQuery: buildQuery,
});