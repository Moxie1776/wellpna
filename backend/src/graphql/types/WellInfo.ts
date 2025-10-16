import { builder } from '../../builder'

export const WellInfo = builder.prismaObject('WellInfo', {
  fields: (t) => ({
    id: t.exposeID('id'),
    api: t.exposeString('api'),
    well: t.relation('well'),
  }),
})