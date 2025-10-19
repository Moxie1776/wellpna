import { builder } from '../../builder'
import { prisma } from '../../client'
import { emailService } from '../../services/emailService'
import {
  comparePassword,
  generate6DigitCode,
  hashPassword,
  signJwt,
} from '../../utils/auth'
import logger from '../../utils/logger'
import { AuthPayload } from '../types/Auth'
import { User } from '../types/User'

export const SignUpInput = builder.inputType('SignUpInput', {
  fields: (t) => ({
    email: t.string({ required: true }),
    password: t.string({ required: true }),
    name: t.string({ required: true }),
    phoneNumber: t.string({ required: true }),
  }),
})

export const SignInInput = builder.inputType('SignInInput', {
  fields: (t) => ({
    email: t.string({ required: true }),
    password: t.string({ required: true }),
  }),
})

export const VerifyEmailInput = builder.inputType('VerifyEmailInput', {
  fields: (t) => ({
    email: t.string({ required: true }),
    code: t.string({ required: true }),
  }),
})

export const ResetPasswordInput = builder.inputType('ResetPasswordInput', {
  fields: (t) => ({
    code: t.string({ required: true }),
    newPassword: t.string({ required: true }),
  }),
})

export const UpdateUserInput = builder.inputType('UpdateUserInput', {
  fields: (t) => ({
    name: t.string(),
    phoneNumber: t.string(),
  }),
})

export const UpdateUserRoleInput = builder.inputType('UpdateUserRoleInput', {
  fields: (t) => ({
    userId: t.string({ required: true }),
    role: t.string({ required: true }),
  }),
})

builder.mutationFields((t) => ({
  cleanupTestUsers: t.field({
    type: 'Int',
    args: {
      pattern: t.arg.string({ defaultValue: '@example.com' }),
    },
    resolve: async (_root, args, ctx: any) => {
      if (process.env.NODE_ENV !== 'debug') {
        throw new Error('cleanupTestUsers is unavailable')
      }
      const db = ctx?.prisma || prisma
      // Delete all users with emails ending in the pattern
      const result = await db.user.deleteMany({
        where: {
          email: {
            endsWith: args.pattern,
          },
        },
      })
      logger.info(
        `Cleaned up ${result.count} test users with pattern ${args.pattern}`,
      )
      return result.count
    },
  }),

  // Debug mutation to force-verify a user (only available in debug mode)
  debugVerifyUser: t.field({
    type: 'Boolean',
    args: { email: t.arg.string({ required: true }) },
    resolve: async (_root, args, ctx: any) => {
      if (process.env.NODE_ENV !== 'debug') {
        throw new Error('debugVerifyUser is only available in debug mode')
      }
      const db = ctx?.prisma || prisma
      const user = await db.user.findUnique({ where: { email: args.email } })
      if (!user) throw new Error('User not found')
      await db.user.update({
        where: { id: user.id },
        data: {
          validatedAt: new Date(),
          verificationCode: null,
          verificationCodeExpiresAt: null,
        },
      })
      return true
    },
  }),

  signIn: t.field({
    type: AuthPayload,
    args: {
      data: t.arg({ type: SignInInput, required: true }),
    },
    resolve: async (_root, args, ctx: any) => {
      const db = ctx?.prisma || prisma

      // Find the user
      const user = await db.user.findUnique({
        where: { email: args.data.email },
      })
      if (!user) {
        throw new Error('Invalid email or password')
      }

      // Check password
      const isValid = await comparePassword(args.data.password, user.password)
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
        phoneNumber: user.phoneNumber,
      })

      return { token, user }
    },
  }),

  signUp: t.field({
    type: AuthPayload,
    args: {
      data: t.arg({ type: SignUpInput, required: true }),
    },
    resolve: async (_root, args, ctx: any) => {
      const db = ctx?.prisma || prisma

      // Check if user already exists
      const existingUser = await db.user.findUnique({
        where: { email: args.data.email },
      })
      if (existingUser) {
        throw new Error('User with this email already exists')
      }

      // Hash the password
      const hashedPassword = await hashPassword(args.data.password)

      // Generate verification code
      const verificationCode = generate6DigitCode()
      const verificationCodeExpiresAt = new Date(
        Date.now() + 24 * 60 * 60 * 1000,
      ) // 24 hours

      // Create the user
      const user = await db.user.create({
        data: {
          email: args.data.email,
          password: hashedPassword,
          name: args.data.name,
          phoneNumber: args.data.phoneNumber,
          verificationCode,
          verificationCodeExpiresAt,
        },
      })

      // Send verification email (don't fail signup on email failure)
      try {
        await emailService.sendVerificationEmail(user.email, verificationCode)
      } catch (error) {
        logger.error('Failed to send verification email:', error)
      }

      // Generate JWT token (user still needs to verify email)
      const token = signJwt({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        phoneNumber: user.phoneNumber,
      })

      return { token, user }
    },
  }),

  sendVerificationEmail: t.field({
    type: 'Boolean',
    args: { email: t.arg.string({ required: true }) },
    resolve: async (_root, args, ctx: any) => {
      const db = ctx?.prisma || prisma
      const user = await db.user.findUnique({ where: { email: args.email } })
      if (!user) return true // don't reveal existence
      if (user.validatedAt) throw new Error('Email already verified')

      const verificationCode = generate6DigitCode()
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)

      await db.user.update({
        where: { id: user.id },
        data: { verificationCode, verificationCodeExpiresAt: expiresAt },
      })

      try {
        await emailService.sendVerificationEmail(user.email, verificationCode)
      } catch (error) {
        logger.error('Failed to send verification email:', error)
        throw new Error('Failed to send verification email')
      }
      return true
    },
  }),

  verifyEmail: t.field({
    type: AuthPayload,
    args: {
      data: t.arg({ type: VerifyEmailInput, required: true }),
    },
    resolve: async (_root, args, ctx: any) => {
      const db = ctx?.prisma || prisma
      const user = await db.user.findUnique({
        where: { email: args.data.email },
      })
      if (!user) throw new Error('Invalid verification code')
      if (user.validatedAt) throw new Error('Email already verified')
      if (!user.verificationCode || !user.verificationCodeExpiresAt)
        throw new Error('No verification code found')
      if (user.verificationCode !== args.data.code)
        throw new Error('Invalid verification code')
      if (user.verificationCodeExpiresAt < new Date())
        throw new Error('Verification code expired')

      const updatedUser = await db.user.update({
        where: { id: user.id },
        data: {
          validatedAt: new Date(),
          verificationCode: null,
          verificationCodeExpiresAt: null,
        },
      })

      const token = signJwt({
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        role: updatedUser.role,
        phoneNumber: updatedUser.phoneNumber,
      })

      return { token, user: updatedUser }
    },
  }),

  requestPasswordReset: t.field({
    type: 'Boolean',
    args: { email: t.arg.string({ required: true }) },
    resolve: async (_root, args, ctx: any) => {
      const db = ctx?.prisma || prisma
      const user = await db.user.findUnique({ where: { email: args.email } })
      if (!user) return true

      const resetCode = generate6DigitCode()
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000)

      logger.debug(
        'Setting password reset token for user:',
        user.email,
        'token:',
        resetCode,
        'expires:',
        expiresAt,
      )
      await db.user.update({
        where: { id: user.id },
        data: {
          passwordResetToken: resetCode,
          passwordResetTokenExpiresAt: expiresAt,
        },
      })

      try {
        await emailService.sendPasswordResetEmail(user.email, resetCode)
      } catch (error) {
        logger.error('Failed to send password reset email:', error)
        throw new Error('Failed to send password reset email')
      }
      return true
    },
  }),

  resetPassword: t.field({
    type: AuthPayload,
    args: {
      data: t.arg({ type: ResetPasswordInput, required: true }),
    },
    resolve: async (_root, args, ctx: any) => {
      logger.debug('resetPassword called with code:', args.data.code)
      const db = ctx?.prisma || prisma

      const user = await db.user.findFirst({
        where: {
          passwordResetToken: args.data.code,
          passwordResetTokenExpiresAt: { gt: new Date() },
        },
      })

      logger.debug('User found for reset code:', user ? 'yes' : 'no')
      if (user) {
        logger.debug('User token:', user.passwordResetToken)
        logger.debug('Token expires:', user.passwordResetTokenExpiresAt)
        logger.debug('Current time:', new Date())
      }

      if (!user) throw new Error('Invalid or expired reset code')

      const hashedPassword = await hashPassword(args.data.newPassword)
      const updatedUser = await db.user.update({
        where: { id: user.id },
        data: {
          password: hashedPassword,
          passwordResetToken: null,
          passwordResetTokenExpiresAt: null,
        },
      })

      const token = signJwt({
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        role: updatedUser.role,
        phoneNumber: updatedUser.phoneNumber,
      })
      return { token, user: updatedUser }
    },
  }),

  updateUser: t.field({
    type: User,
    args: {
      data: t.arg({ type: UpdateUserInput }),
    },
    resolve: async (_root, args, ctx: any) => {
      if (!ctx?.jwt) throw new Error('Authentication required')
      const db = ctx?.prisma || prisma
      const userId = ctx.jwt.payload.id
      const updateData: any = {}
      if (args.data?.name !== undefined) updateData.name = args.data.name
      if (args.data?.phoneNumber !== undefined)
        updateData.phoneNumber = args.data.phoneNumber

      const updatedUser = await db.user.update({
        where: { id: userId },
        data: updateData,
      })
      return updatedUser
    },
  }),

  updateUserRole: t.field({
    type: User,
    args: {
      data: t.arg({ type: UpdateUserRoleInput, required: true }),
    },
    resolve: async (_root, args, ctx: any) => {
      if (!ctx?.jwt) throw new Error('Authentication required')
      if (ctx.jwt.payload.role !== 'admin')
        throw new Error('Admin access required')
      const db = ctx?.prisma || prisma
      if (!['user', 'admin'].includes(args.data.role))
        throw new Error('Invalid role')
      const updatedUser = await db.user.update({
        where: { id: args.data.userId },
        data: { role: args.data.role },
      })
      return updatedUser
    },
  }),
}))
