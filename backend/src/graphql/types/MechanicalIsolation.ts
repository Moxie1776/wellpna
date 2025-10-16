import { builder } from '../../builder'

export const MechanicalIsolation = builder.prismaObject('MechanicalIsolation', {
  fields: (t) => ({
    id: t.exposeID('id'),
    api: t.exposeString('api'),
    well: t.relation('well'),
  }),
})