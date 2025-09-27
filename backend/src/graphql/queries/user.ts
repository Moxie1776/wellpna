import { builder } from '../../builder';
import { prisma } from '../../client';

builder.queryFields((t) => ({
  me: t.prismaField({
    type: 'User',
    resolve: (query, root, args, ctx, info) => {
      if (!ctx.jwt) {
        throw new Error('Not authenticated');
      }
      return prisma.user.findUnique({
        ...query,
        where: { id: ctx.jwt.payload.id },
      });
    },
  }),
}));
