import { builder } from '../../builder'

export const Perforation = builder.prismaObject('Perforation', {
  fields: (t) => ({
    id: t.exposeID('id'),
    api: t.exposeString('api'),
    well: t.relation('well'),
  }),
})