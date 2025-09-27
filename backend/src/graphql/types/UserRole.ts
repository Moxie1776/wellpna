import { builder } from '../../builder';

export const UserRole = builder.prismaObject('UserRole', {
  fields: (t) => ({
    role: t.exposeString('role'),
    users: t.relation('users'),
  }),
});
