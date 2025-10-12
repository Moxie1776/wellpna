import { builder } from '../../builder'

export const User = builder.prismaObject('User', {
  fields: (t) => ({
    id: t.exposeID('id'),
    email: t.exposeString('email'),
    name: t.exposeString('name'),
    roleId: t.exposeString('roleId'),
    registeredAt: t.expose('registeredAt', { type: 'DateTime' }),
    validatedAt: t.expose('validatedAt', { type: 'DateTime' }),
    role: t.relation('role'),
  }),
})
