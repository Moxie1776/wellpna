import jwt from 'jsonwebtoken';
import { APP_SECRET, hashPassword, comparePassword } from './utils';
import { prisma } from './prismaClient';

export const signup = async (parent: any, args: any) => {
  const password = await hashPassword(args.password);
  const user = await prisma.user.create({ data: { ...args, password } });

  const token = jwt.sign({ userId: user.id }, APP_SECRET);

  return {
    token,
    user,
  };
};

export const login = async (parent: any, args: any) => {
  const user = await prisma.user.findUnique({ where: { email: args.email } });
  if (!user) {
    throw new Error('No such user found');
  }

  const valid = await comparePassword(args.password, user.password);
  if (!valid) {
    throw new Error('Invalid password');
  }

  const token = jwt.sign({ userId: user.id }, APP_SECRET);

  return {
    token,
    user,
  };
};