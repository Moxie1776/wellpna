import { builder } from '../../builder'

export const Operator = builder.prismaObject('Operator', {
  fields: (t) => ({
    id: t.exposeID('id'),
    company: t.exposeString('company'),
    stateAbbr: t.exposeString('stateAbbr'),
    operatorNo: t.exposeString('operatorNo'),
    wells: t.relation('wells'),
    companyEnum: t.relation('companyEnum'),
    userOperators: t.relation('OperatorUsers'),
  }),
})
