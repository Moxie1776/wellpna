import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

import { JWT_SECRET } from './constants'

export interface JwtUserPayload {
  id: string
  email: string
  name: string
  role: string
  phoneNumber: string
}

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, 12)
}

export const comparePassword = async (
  password: string,
  hash: string,
): Promise<boolean> => {
  return bcrypt.compare(password, hash)
}

export const signJwt = (payload: object, options?: jwt.SignOptions) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '14d', ...options })
}

export const verifyToken = (token: string): JwtUserPayload => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtUserPayload
    return decoded
  } catch {
    throw new Error('Invalid token')
  }
}

export const generate6DigitCode = (): string => {
  return String(Math.floor(100000 + Math.random() * 900000))
}
