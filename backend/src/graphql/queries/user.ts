import { builder } from '../../builder'
import { prisma } from '../../client'

builder.queryFields((t) => ({
  me: t.prismaField({
    type: 'User',
    resolve: (query, root, args, ctx, _info) => {
      if (!ctx.jwt) {
        throw new Error('Not authenticated')
      }
      return prisma.user.findUnique({
        ...query,
        where: { id: ctx.jwt.payload.id },
      })
    },
  }),
  users: t.prismaField({
    type: ['User'],
    resolve: (query, root, args, ctx, _info) => {
      if (!ctx.jwt || ctx.jwt.payload.role !== 'admin') {
        throw new Error('Not authorized')
      }
      return prisma.user.findMany({
        ...query,
        orderBy: { registeredAt: 'desc' },
      })
    },
  }),
  userRoles: t.prismaField({
    type: ['UserRole'],
    resolve: (query, root, args, ctx, _info) => {
      if (!ctx.jwt || ctx.jwt.payload.role !== 'admin') {
        throw new Error('Not authorized')
      }
      return prisma.userRole.findMany({
        ...query,
        orderBy: { role: 'asc' },
      })
    },
  }),
}))
