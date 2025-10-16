import { builder } from '../../builder'

export const Tubing = builder.prismaObject('Tubing', {
  fields: (t) => ({
    id: t.exposeID('id'),
    api: t.exposeString('api'),
    well: t.relation('well'),
  }),
})