import { builder } from '../../builder'

export const OperatorEnum = builder.prismaObject('OperatorEnum', {
  fields: (t) => ({
    company: t.exposeID('company'),
    operators: t.relation('operators'),
  }),
})
