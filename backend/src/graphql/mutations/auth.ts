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

builder.mutationFields((t) => ({
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

  signUp: t.field({
    type: AuthPayload,
    args: {
      email: t.arg.string({ required: true }),
      password: t.arg.string({ required: true }),
      name: t.arg.string({ required: true }),
      phoneNumber: t.arg.string({ required: true }),
    },
    resolve: async (_root, args, _ctx) => {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: args.email },
      })

      if (existingUser) {
        throw new Error('User with this email already exists')
      }

      // Hash the password
      const hashedPassword = await hashPassword(args.password)

      // Generate verification code
      const verificationCode = generate6DigitCode()
      const verificationCodeExpiresAt = new Date(
        Date.now() + 24 * 60 * 60 * 1000,
      ) // 24 hours

      // Create the user
      const user = await prisma.user.create({
        data: {
          email: args.email,
          password: hashedPassword,
          name: args.name,
          phoneNumber: args.phoneNumber,
          verificationCode,
          verificationCodeExpiresAt,
        },
      })

      // Send verification email
      try {
        await emailService.sendVerificationEmail(user.email, verificationCode)
      } catch (error) {
        logger.error('Failed to send verification email:', error)
        // Don't fail signup if email fails, but log it
      }

      // Generate JWT token (but user needs to verify email first)
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

  sendVerificationEmail: t.field({
    type: 'Boolean',
    args: {
      email: t.arg.string({ required: true }),
    },
    resolve: async (_root, args, _ctx) => {
      const user = await prisma.user.findUnique({
        where: { email: args.email },
      })

      if (!user) {
        // Don't reveal if email exists or not for security
        return true
      }

      if (user.validatedAt) {
        throw new Error('Email already verified')
      }

      // Generate verification code
      const verificationCode = generate6DigitCode()
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

      await prisma.user.update({
        where: { id: user.id },
        data: {
          verificationCode,
          verificationCodeExpiresAt: expiresAt,
        },
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
      email: t.arg.string({ required: true }),
      code: t.arg.string({ required: true }),
    },
    resolve: async (_root, args, _ctx) => {
      const user = await prisma.user.findUnique({
        where: { email: args.email },
      })

      if (!user) {
        throw new Error('Invalid verification code')
      }

      if (user.validatedAt) {
        throw new Error('Email already verified')
      }

      if (!user.verificationCode || !user.verificationCodeExpiresAt) {
        throw new Error('No verification code found')
      }

      if (user.verificationCode !== args.code) {
        throw new Error('Invalid verification code')
      }

      if (user.verificationCodeExpiresAt < new Date()) {
        throw new Error('Verification code expired')
      }

      // Mark email as verified
      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: {
          validatedAt: new Date(),
          verificationCode: null,
          verificationCodeExpiresAt: null,
        },
      })

      // Generate JWT token
      const token = signJwt({
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        role: updatedUser.role,
      })

      return {
        token,
        user: updatedUser,
      }
    },
  }),

  requestPasswordReset: t.field({
    type: 'Boolean',
    args: {
      email: t.arg.string({ required: true }),
    },
    resolve: async (_root, args, _ctx) => {
      const user = await prisma.user.findUnique({
        where: { email: args.email },
      })

      if (!user) {
        // Don't reveal if email exists or not for security
        return true
      }

      // Generate reset code
      const resetCode = generate6DigitCode()
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

      await prisma.user.update({
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
      code: t.arg.string({ required: true }),
      newPassword: t.arg.string({ required: true }),
    },
    resolve: async (_root, args, _ctx) => {
      const user = await prisma.user.findFirst({
        where: {
          passwordResetToken: args.code,
          passwordResetTokenExpiresAt: {
            gt: new Date(),
          },
        },
      })

      if (!user) {
        throw new Error('Invalid or expired reset code')
      }

      // Hash new password
      const hashedPassword = await hashPassword(args.newPassword)

      // Update password and clear reset token
      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: {
          password: hashedPassword,
          passwordResetToken: null,
          passwordResetTokenExpiresAt: null,
        },
      })

      // Generate JWT token
      const token = signJwt({
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        role: updatedUser.role,
      })

      return {
        token,
        user: updatedUser,
      }
    },
  }),

  updateUser: t.field({
    type: User,
    args: {
      name: t.arg.string(),
      phoneNumber: t.arg.string(),
    },
    resolve: async (_root, args, ctx) => {
      // Check if user is authenticated
      if (!ctx.user) {
        throw new Error('Authentication required')
      }

      // Users can only update their own profile
      const userId = ctx.user.id

      // Prepare update data
      const updateData: any = {}
      if (args.name !== undefined) {
        updateData.name = args.name
      }
      if (args.phoneNumber !== undefined) {
        updateData.phoneNumber = args.phoneNumber
      }

      // Update the user
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: updateData,
      })

      return updatedUser
    },
  }),

  updateUserRole: t.field({
    type: User,
    args: {
      userId: t.arg.string({ required: true }),
      role: t.arg.string({ required: true }),
    },
    resolve: async (_root, args, ctx) => {
      // Check if user is authenticated and is admin
      if (!ctx.user) {
        throw new Error('Authentication required')
      }

      if (ctx.user.role !== 'admin') {
        throw new Error('Admin access required')
      }

      // Validate role
      if (!['user', 'admin'].includes(args.role)) {
        throw new Error('Invalid role')
      }

      // Update the user's role
      const updatedUser = await prisma.user.update({
        where: { id: args.userId },
        data: { role: args.role },
      })

      return updatedUser
    },
  }),
}))
