import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

export const APP_SECRET = 'your-secret-key';

export function getTokenPayload(token: string) {
  return jwt.verify(token, APP_SECRET) as { userId: number };
}

export async function hashPassword(password: string) {
  return await bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string) {
  return await bcrypt.compare(password, hash);
}