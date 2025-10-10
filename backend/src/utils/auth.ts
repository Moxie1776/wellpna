import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import { getJwtSecret } from './constants';

export interface JwtPayload {
  id: string;
  email: string;
  name: string;
  roleId: string;
}

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, 12);
};

export const comparePassword = async (
  password: string,
  hash: string
): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

export const signJwt = async (payload: object, options?: jwt.SignOptions): Promise<string> => {
  const secret = await getJwtSecret();
  return jwt.sign(payload, secret, { expiresIn: '14d', ...options });
};

export const verifyToken = async (token: string): Promise<JwtPayload> => {
  try {
    const secret = await getJwtSecret();
    const decoded = jwt.verify(token, secret) as JwtPayload;
    return decoded;
  } catch {
    throw new Error('Invalid token');
  }
};

export const generate6DigitCode = (): string => {
  return String(Math.floor(100000 + Math.random() * 900000));
};
