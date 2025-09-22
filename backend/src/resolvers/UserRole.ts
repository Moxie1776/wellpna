export const UserRole = {
  users: async (parent: any, _: any, { prisma }: any) => {
    return await prisma.user.findMany({
      where: { roleId: parent.role },
    });
  },
};

export const Query = {
  userRoles: async (_: any, __: any, { prisma }: any) => {
    return await prisma.userRole.findMany();
  },
};

export const Mutation = {
  createRole: async (_: any, { role }: { role: string }, { prisma }: any) => {
    return await prisma.userRole.create({
      data: { role },
    });
  },
  deleteRole: async (_: any, { role }: { role: string }, { prisma }: any) => {
    return await prisma.userRole.delete({
      where: { role },
    });
  },
};
