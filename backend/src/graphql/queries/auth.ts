import logger from 'src/utils/logger'
import { builder } from '../../builder'
import { prisma } from '../../client'
import { comparePassword, signJwt } from '../../utils/auth'
import { AuthPayload } from '../types/Auth'

builder.queryFields((t) => ({
  signIn: t.field({
    type: AuthPayload,
    args: {
      email: t.arg.string({ required: true }),
      password: t.arg.string({ required: true }),
    },
    resolve: async (_root, args, _ctx) => {
      // Find the user
      const user = await prisma.user.findUnique({
        where: { email: args.email },
      })

      if (!user) {
        throw new Error('Invalid email or password')
      }

      // Check password
      const isValid = await comparePassword(args.password, user.password)
      if (!isValid) {
        throw new Error('Invalid email or password')
      }

      // Check if email is validated
      if (!user.validatedAt) {
        throw new Error('Email not verified. Please verify your email first.')
      }

      // Generate JWT token
      const token = signJwt({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      })

      return {
        token,
        user,
      }
    },
  }),

  // Debug query to get verification code for testing (only works in debug mode)
  getVerificationCode: t.field({
    type: 'String',
    args: {
      email: t.arg.string({ required: true }),
    },
    resolve: async (_root, args, _ctx) => {
      if (process.env.NODE_ENV !== 'debug') {
        throw new Error('getVerificationCode is only available in debug mode')
      }

      // Find the user
      const user = await prisma.user.findUnique({
        where: { email: args.email },
      })

      if (!user) {
        throw new Error('User not found')
      }

      if (!user.verificationCode) {
        throw new Error('No verification code found for this user')
      }

      return user.verificationCode
    },
  }),

  // Debug query to get password reset code for testing (only works in debug mode)
  getPasswordResetCode: t.field({
    type: 'String',
    args: {
      email: t.arg.string({ required: true }),
    },
    resolve: async (_root, args, _ctx) => {
      if (process.env.NODE_ENV !== 'debug') {
        throw new Error('getPasswordResetCode is only available in debug mode')
      }

      logger.debug('getPasswordResetCode called for email:', args.email)
      // Find the user
      const user = await prisma.user.findUnique({
        where: { email: args.email },
      })

      logger.debug('User found:', user ? 'yes' : 'no')
      if (user) {
        logger.debug('User token:', user.passwordResetToken)
        logger.debug('Token expires:', user.passwordResetTokenExpiresAt)
      }

      if (!user) {
        throw new Error('User not found')
      }

      if (!user.passwordResetToken) {
        throw new Error('No password reset code found for this user')
      }

      logger.debug('Returning token:', user.passwordResetToken)
      return user.passwordResetToken
    },
  }),

  // Health check query
  health: t.field({
    type: 'String',
    resolve: async (_root, _args, _ctx) => {
      return 'ok'
    },
  }),

  // Debug status query (only works in debug mode)
  debugStatus: t.field({
    type: 'String',
    resolve: async (_root, _args, _ctx) => {
      if (process.env.NODE_ENV !== 'debug') {
        throw new Error('debugStatus is only available in debug mode')
      }
      return 'debug'
    },
  }),
}))
