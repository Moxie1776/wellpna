import { builder } from '../../builder'

export const Rods = builder.prismaObject('Rods', {
  fields: (t) => ({
    id: t.exposeID('id'),
    api: t.exposeString('api'),
    well: t.relation('well'),
  }),
})