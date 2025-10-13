import { builder } from '../../builder'

export const Operator = builder.prismaObject('Operator', {
  fields: (t) => ({
    id: t.exposeID('id'),
    operatorEnum: t.exposeString('operatorEnum'),
    stateAbbr: t.exposeString('stateAbbr'),
    operatorNo: t.exposeString('operatorNo'),
    wells: t.relation('wells'),
    operatorEnumId: t.relation('operatorEnumId'),
    userOperators: t.relation('OperatorUsers'),
  }),
})
