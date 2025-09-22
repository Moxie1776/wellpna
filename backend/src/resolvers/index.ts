import * as UserResolvers from './User';
import * as UserRoleResolvers from './UserRole';

export const resolvers = {
  Query: {
    ...UserResolvers.Query,
    ...UserRoleResolvers.Query,
  },
  Mutation: {
    ...UserResolvers.Mutation,
    ...UserRoleResolvers.Mutation,
  },
  User: UserResolvers.User,
  UserRole: UserRoleResolvers.UserRole,
};
