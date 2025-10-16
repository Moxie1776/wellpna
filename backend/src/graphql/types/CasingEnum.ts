import { builder } from '../../builder'

export const CasingEnum = builder.prismaObject('CasingEnum', {
  fields: (t) => ({
    id: t.exposeID('id'),
    internalDiameter: t.exposeFloat('internalDiameter'),
    externalDiameter: t.exposeFloat('externalDiameter'),
    tocDepth: t.exposeInt('tocDepth'),
    casings: t.relation('casings'),
  }),
})