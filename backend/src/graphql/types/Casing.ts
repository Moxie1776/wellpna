import { builder } from '../../builder'

export const Casing = builder.prismaObject('Casing', {
  fields: (t) => ({
    id: t.exposeID('id'),
    api: t.exposeString('api'),
    casingEnumId: t.exposeString('casingEnumId'),
    topDepth: t.exposeInt('topDepth'),
    bottomDepth: t.exposeInt('bottomDepth'),
    casingEnum: t.relation('casingEnum'),
    well: t.relation('well'),
  }),
})