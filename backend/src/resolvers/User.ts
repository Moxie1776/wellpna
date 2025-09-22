import { prisma } from '../prismaClient';
import { hashPassword } from '../utils';

// Helper function to check if user is authenticated
const checkAuth = (user: any) => {
  if (!user) {
    throw new Error('Unauthorized: Please log in to perform this action');
  }
};

// Helper function to check if user is admin
const checkAdmin = async (user: any) => {
  if (!user) {
    throw new Error('User not found');
  }

  if (!user.role || user.role.role !== 'admin') {
    throw new Error('Forbidden: Only admins can perform this action');
  }
};

export const User = {
  role: async (parent: any, _: any, { prisma }: any) => {
    try {
      return await prisma.userRole.findUnique({
        where: { role: parent.roleId },
      });
    } catch (error: any) {
      throw new Error(`Failed to fetch user role: ${error.message}`);
    }
  },
};

export const Query = {
  users: async (
    _: any,
    __: any,
    { prisma, userId }: { prisma: any; userId?: number }
  ) => {
    // Check authentication
    checkAuth(userId);

    // Check if user is admin
    await checkAdmin(userId!, prisma);

    try {
      return await prisma.user.findMany({
        orderBy: { registeredAt: 'desc' },
      });
    } catch (error: any) {
      throw new Error(`Failed to fetch users: ${error.message}`);
    }
  },
  user: async (
    _: any,
    { id }: { id: string },
    { prisma, userId }: { prisma: any; userId?: number }
  ) => {
    // Check authentication
    checkAuth(userId);

    try {
      const user = await prisma.user.findUnique({
        where: { id },
      });

      if (!user) {
        throw new Error('User not found');
      }

      return user;
    } catch (error: any) {
      if (error.message === 'User not found') {
        throw error;
      }
      throw new Error(`Failed to fetch user: ${error.message}`);
    }
  },
};

export const Mutation = {
  createUser: async (
    _: any,
    args: {
      email: string;
      password: string;
      name: string;
      roleId?: string;
      code?: string;
    },
    { prisma, userId }: { prisma: any; userId?: number }
  ) => {
    // Check authentication
    checkAuth(userId);

    // Check if user is admin
    await checkAdmin(userId!, prisma);

    // Validate input
    if (!args.email || !args.password || !args.name) {
      throw new Error('Email, password, and name are required');
    }

    try {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: args.email },
      });

      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      const hashedPassword = await hashPassword(args.password);
      return await prisma.user.create({
        data: {
          email: args.email,
          password: hashedPassword,
          name: args.name,
          roleId: args.roleId || 'user',
          code: args.code,
        },
      });
    } catch (error: any) {
      if (error.message === 'User with this email already exists') {
        throw error;
      }
      throw new Error(`Failed to create user: ${error.message}`);
    }
  },
  updateUser: async (
    _: any,
    args: {
      id: string;
      email?: string;
      name?: string;
      roleId?: string;
      code?: string;
      validatedAt?: Date;
    },
    { prisma, userId }: { prisma: any; userId?: number }
  ) => {
    // Check authentication
    checkAuth(userId);

    // Check if user is admin
    await checkAdmin(userId!, prisma);

    try {
      // Check if user exists
      const existingUser = await prisma.user.findUnique({
        where: { id: args.id },
      });

      if (!existingUser) {
        throw new Error('User not found');
      }

      // Check if email is being changed and if it's already taken
      if (args.email && args.email !== existingUser.email) {
        const userWithSameEmail = await prisma.user.findUnique({
          where: { email: args.email },
        });

        if (userWithSameEmail) {
          throw new Error('User with this email already exists');
        }
      }

      return await prisma.user.update({
        where: { id: args.id },
        data: {
          email: args.email,
          name: args.name,
          roleId: args.roleId,
          code: args.code,
          validatedAt: args.validatedAt,
        },
      });
    } catch (error: any) {
      if (
        error.message === 'User not found' ||
        error.message === 'User with this email already exists'
      ) {
        throw error;
      }
      throw new Error(`Failed to update user: ${error.message}`);
    }
  },
  deleteUser: async (
    _: any,
    { id }: { id: string },
    { prisma, userId }: { prisma: any; userId?: number }
  ) => {
    // Check authentication
    checkAuth(userId);

    // Check if user is admin
    await checkAdmin(userId!, prisma);

    try {
      // Check if user exists
      const existingUser = await prisma.user.findUnique({
        where: { id },
      });

      if (!existingUser) {
        throw new Error('User not found');
      }

      // Prevent deleting the last admin
      if (existingUser.roleId === 'admin') {
        const adminCount = await prisma.user.count({
          where: { roleId: 'admin' },
        });

        if (adminCount <= 1) {
          throw new Error('Cannot delete the last admin user');
        }
      }

      return await prisma.user.delete({
        where: { id },
      });
    } catch (error: any) {
      if (
        error.message === 'User not found' ||
        error.message === 'Cannot delete the last admin user'
      ) {
        throw error;
      }
      throw new Error(`Failed to delete user: ${error.message}`);
    }
  },
  assignRole: async (
    _: any,
    args: { userId: string; roleId: string },
    { prisma, userId: contextUserId }: { prisma: any; userId?: number }
  ) => {
    // Check authentication
    checkAuth(contextUserId);

    // Check if user is admin
    await checkAdmin(contextUserId!, prisma);

    try {
      // Check if user exists
      const user = await prisma.user.findUnique({
        where: { id: args.userId },
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Check if role exists
      const role = await prisma.userRole.findUnique({
        where: { role: args.roleId },
      });

      if (!role) {
        throw new Error('Role not found');
      }

      // Prevent removing admin role from the last admin
      if (user.roleId === 'admin' && args.roleId !== 'admin') {
        const adminCount = await prisma.user.count({
          where: { roleId: 'admin' },
        });

        if (adminCount <= 1) {
          throw new Error('Cannot remove admin role from the last admin user');
        }
      }

      return await prisma.user.update({
        where: { id: args.userId },
        data: { roleId: args.roleId },
      });
    } catch (error: any) {
      if (
        error.message === 'User not found' ||
        error.message === 'Role not found' ||
        error.message === 'Cannot remove admin role from the last admin user'
      ) {
        throw error;
      }
      throw new Error(`Failed to assign role to user: ${error.message}`);
    }
  },
};
