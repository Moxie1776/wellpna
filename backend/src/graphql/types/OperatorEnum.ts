import { builder } from '../../builder'

export const OperatorEnum = builder.prismaObject('OperatorEnum', {
  fields: (t) => ({
    id: t.exposeID('id'),
    name: t.exposeString('name'),
    operators: t.relation('operators'),
  }),
})
