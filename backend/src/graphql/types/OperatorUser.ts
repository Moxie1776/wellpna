import { builder } from '../../builder'

export const OperatorUser = builder.prismaObject('OperatorUser', {
  fields: (t) => ({
    id: t.exposeID('id'),
    user: t.relation('userId'),
    operator: t.relation('operatorId'),
  }),
})
