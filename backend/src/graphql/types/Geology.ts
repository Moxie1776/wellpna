import { builder } from '../../builder'

export const Geology = builder.prismaObject('Geology', {
  fields: (t) => ({
    id: t.exposeID('id'),
    wells: t.relation('wells'),
  }),
})