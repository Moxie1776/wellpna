import { builder } from '../../builder'

export const PlugSchedule = builder.prismaObject('PlugSchedule', {
  fields: (t) => ({
    id: t.exposeID('id'),
    api: t.exposeString('api'),
    well: t.relation('well'),
  }),
})