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
}))
