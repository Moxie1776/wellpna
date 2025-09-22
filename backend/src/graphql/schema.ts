// GraphQL schema definition
export const typeDefs = `#graphql
  scalar JSON
  scalar DateTime

  type Query {
    hello: String
    users: [User!]!
    user(id: String!): User
    userRoles: [UserRole!]!
  }

  type Mutation {
    signup(email: String!, password: String!): AuthPayload!
    login(email: String!, password: String!): AuthPayload!
    mineData(fileName: String!): JSON
    
    # User management mutations
    createUser(email: String!, password: String!, name: String!, roleId: String, code: String): User!
    updateUser(id: String!, email: String, name: String, roleId: String, code: String, validatedAt: DateTime): User!
    deleteUser(id: String!): User!
    assignRole(userId: String!, roleId: String!): User!
    
    # UserRole management mutations
    createRole(role: String!): UserRole!
    deleteRole(role: String!): UserRole!
  }

  type User {
    id: String!
    email: String!
    name: String!
    roleId: String!
    code: String
    registeredAt: DateTime!
    validatedAt: DateTime
    role: UserRole!
  }

  type UserRole {
    role: String!
    users: [User!]!
  }

  type AuthPayload {
    token: String!
    user: User!
  }
`;
