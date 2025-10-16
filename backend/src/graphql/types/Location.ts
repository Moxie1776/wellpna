import { builder } from '../../builder'

export const Location = builder.prismaObject('Location', {
  fields: (t) => ({
    id: t.exposeID('id'),
    api: t.exposeString('api'),
    county: t.exposeString('county'),
    well: t.relation('well'),
  }),
})