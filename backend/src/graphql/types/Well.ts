import { builder } from '../../builder'

export const Well = builder.prismaObject('Well', {
  fields: (t) => ({
    api: t.exposeString('api'),
    operator: t.relation('operator'),
    casings: t.relation('casings'),
    geology: t.relation('geology'),
    location: t.relation('location'),
    mechanicalIsolation: t.relation('mechanicalIsolation'),
    perforations: t.relation('perforations'),
    plugSchedules: t.relation('plugSchedules'),
    rods: t.relation('rods'),
    tubings: t.relation('tubings'),
    wellInfo: t.relation('wellInfo'),
  }),
})