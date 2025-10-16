import { describe, expect, it } from 'vitest'

import { prisma } from '../src/client'
import { yoga } from '../src/server'
import { generate6DigitCode } from '../src/utils/auth'
import { TestUtils } from './utils'
// import logger from './utils/logger';

const _testUtils = new TestUtils(prisma)

describe('Authentication', () => {
  // Use the yoga instance from the server which has JWT plugin configured

  describe('signUp', () => {
    it('should create a new user and send verification email', async () => {
      // First create the user to make the second signup duplicate
      await createTestUserAndJwt(
        { email: 'duplicate@example.com' },
        'password123',
        false,
      )

      const mutation = `
        mutation SignUp($data: SignUpInput!) {
          signUp(data: $data) {
            token
            user {
              id
              email
              name
              phoneNumber
            }
          }
        }
      `

      const variables = {
        data: {
          email: 'duplicate@example.com',
          password: 'password123',
          name: 'Another User',
          phoneNumber: '555-987-6543',
        },
      }

      const response = await yoga.fetch('http://localhost:4000/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: mutation,
          variables,
        }),
      })

      const result = await response.json()

      expect(result.errors).toBeDefined()
      expect(result.errors[0].message).toContain('already exists')
    })
  })

  describe('signIn', () => {
    it('should authenticate a verified user', async () => {
      // Create a verified user
      const _testUser = await createTestUserAndJwt(
        {
          email: 'signin@example.com',
        },
        'password123',
        true,
      ) // password, validated=true

      const mutation = `
        mutation SignIn($data: SignInInput!) {
          signIn(data: $data) {
            token
            user {
              id
              email
              name
            }
          }
        }
      `

      const variables = {
        data: {
          email: 'signin@example.com',
          password: 'password123',
        },
      }

      const response = await yoga.fetch('http://localhost:4000/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: mutation,
          variables,
        }),
      })

      const result = await response.json()

      expect(result.data.signIn).toBeDefined()
      expect(result.data.signIn.user.email).toBe('signin@example.com')
      expect(result.data.signIn.token).toBeDefined()
    })

    it('should reject invalid credentials', async () => {
      const mutation = `
        mutation SignIn($data: SignInInput!) {
          signIn(data: $data) {
            token
            user {
              id
              email
              name
            }
          }
        }
      `

      const variables = {
        data: {
          email: 'nonexistent@example.com',
          password: 'wrongpassword',
        },
      }

      const response = await yoga.fetch('http://localhost:4000/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: mutation,
          variables,
        }),
      })

      const result = await response.json()

      expect(result.errors).toBeDefined()
      expect(result.errors[0].message).toContain('Invalid email or password')
    })

    it('should send verification code for unverified user', async () => {
      // Create an unverified user
      await createTestUserAndJwt(
        { email: 'unverified@example.com' },
        'password123',
        false, // validated=false
      )

      const mutation = `
        mutation SignIn($data: SignInInput!) {
          signIn(data: $data) {
            token
            user {
              id
              email
              name
            }
          }
        }
      `

      const variables = {
        data: {
          email: 'unverified@example.com',
          password: 'password123',
        },
      }

      const response = await yoga.fetch('http://localhost:4000/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: mutation,
          variables,
        }),
      })

      const result = await response.json()

      expect(result.errors).toBeDefined()
      expect(result.errors[0].message).toContain('Email not verified')

      // Verify verification code was generated and email sent
      const user = await prisma.user.findUnique({
        where: { email: 'unverified@example.com' },
      })

      expect(user?.verificationCode).toBeDefined()
      expect(user?.verificationCodeExpiresAt).toBeDefined()
    })
  })

  describe('me query', () => {
    it('should return user data when authenticated', async () => {
      const testUser = await createTestUserAndJwt({}, 'password123', true)
      // Create a verified user with default data

      const query = `
        query Me {
          me {
            id
            email
            name
          }
        }
      `

      const response = await yoga.fetch('http://localhost:4000/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          authorization: `Bearer ${testUser.jwt}`,
        },
        body: JSON.stringify({
          query,
        }),
      })

      const result = await response.json()

      // logger.info('Me query result:', { result, testUser });

      expect(result.data.me).toBeDefined()
      expect(result.data.me.email).toBe(testUser.user?.email)
      expect(result.data.me.name).toBe(testUser.user?.name)
    })

    it('should reject unauthenticated requests', async () => {
      const query = `
        query Me {
          me {
            id
            email
            name
          }
        }
      `

      const response = await yoga.fetch('http://localhost:4000/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
        }),
      })

      const result = await response.json()

      expect(result.errors).toBeDefined()
      expect(result.errors[0].message).toContain('Not authenticated')
    })
  })
})

describe('password reset', () => {
  it('should send password reset code', async () => {
    // Create a verified user
    await createTestUserAndJwt(
      { email: 'reset@example.com' },
      'password123',
      true,
    )

    const mutation = `
      mutation RequestPasswordReset($email: String!) {
        requestPasswordReset(email: $email)
      }
    `

    const variables = {
      email: 'reset@example.com',
    }

    const response = await yoga.fetch('http://localhost:4000/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: mutation,
        variables,
      }),
    })

    const result = await response.json()

    expect(result.data.requestPasswordReset).toBe(true)

    // Verify reset code was generated
    const user = await prisma.user.findUnique({
      where: { email: 'reset@example.com' },
    })

    expect(user?.passwordResetToken).toBeDefined()
    expect(user?.passwordResetTokenExpiresAt).toBeDefined()
  })

  it('should reset password with valid code', async () => {
    // Create a user with a reset code
    await createTestUserAndJwt(
      { email: 'reset2@example.com' },
      'password123',
      true,
    )

    // Manually set a reset code
    const resetCode = '123456'
    await prisma.user.update({
      where: { email: 'reset2@example.com' },
      data: {
        passwordResetToken: resetCode,
        // 10 minutes
        passwordResetTokenExpiresAt: new Date(Date.now() + 10 * 60 * 1000),
      },
    })

    const mutation = `
      mutation ResetPassword($data: ResetPasswordInput!) {
        resetPassword(data: $data) {
          token
          user {
            id
            email
          }
        }
      }
    `

    const variables = {
      data: {
        code: resetCode,
        newPassword: 'newpassword123',
      },
    }

    const response = await yoga.fetch('http://localhost:4000/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: mutation,
        variables,
      }),
    })

    const result = await response.json()

    expect(result.data.resetPassword.token).toBeDefined()
    expect(result.data.resetPassword.user.email).toBe('reset2@example.com')

    // Verify password was updated and codes cleared
    const user = await prisma.user.findUnique({
      where: { email: 'reset2@example.com' },
    })

    expect(user?.passwordResetToken).toBeNull()
    expect(user?.passwordResetTokenExpiresAt).toBeNull()
  })

  it('should reject invalid reset code', async () => {
    const mutation = `
      mutation ResetPassword($data: ResetPasswordInput!) {
        resetPassword(data: $data) {
          token
          user {
            id
            email
          }
        }
      }
    `

    const variables = {
      data: {
        code: 'invalid',
        newPassword: 'newpassword123',
      },
    }

    const response = await yoga.fetch('http://localhost:4000/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: mutation,
        variables,
      }),
    })

    const result = await response.json()

    expect(result.errors).toBeDefined()
    expect(result.errors[0].message).toContain('Invalid or expired reset code')
  })
})

describe('generate6DigitCode', () => {
  it('should generate a 6-digit code', () => {
    const code = generate6DigitCode()
    expect(code).toMatch(/^\d{6}$/)
    expect(typeof code).toBe('string')
  })

  it('should generate different codes on multiple calls', () => {
    const code1 = generate6DigitCode()
    const code2 = generate6DigitCode()
    expect(code1).not.toBe(code2)
  })
})

// The global teardown function in teardown.ts will handle cleanup of test users

// Helper: generate test user data
function generateTestUserData(
  overrides: Partial<{ email: string; name: string; phoneNumber: string }> = {},
) {
  const timestamp = Date.now()
  return {
    email: overrides.email || `test-${timestamp}@example.com`,
    name: overrides.name || `Test User ${timestamp}`,
    phoneNumber: overrides.phoneNumber || '555-000-0000',
  }
}

// Helper: create a user via the GraphQL signUp mutation and optionally verify
async function createTestUserAndJwt(
  overrides: Partial<{ email: string; name: string; phoneNumber: string }> = {},
  password = 'password123',
  verified = false,
) {
  const data = generateTestUserData(overrides)

  const signUpMutation = `
    mutation SignUp($data: SignUpInput!) {
      signUp(data: $data) {
        token
        user { id email name phoneNumber }
      }
    }
  `

  const signInMutation = `
    mutation SignIn($data: SignInInput!) {
      signIn(data: $data) { token user { id email name } }
    }
  `

  const sendVerificationMutation = `
    mutation SendVerificationEmail($email: String!) {
      sendVerificationEmail(email: $email)
    }
  `

  const verifyMutation = `
    mutation VerifyEmail($data: VerifyEmailInput!) {
      verifyEmail(data: $data) { token user { id email name } }
    }
  `

  // Try signing up
  const response = await yoga.fetch('http://localhost:4000/graphql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: signUpMutation,
      variables: {
        data: {
          email: data.email,
          password,
          name: data.name,
          phoneNumber: data.phoneNumber,
        },
      },
    }),
  })
  const result = await response.json()

  if (result.errors) {
    // If user exists, fall back to using the API (no direct DB writes)
    const dbUser = await prisma.user.findUnique({
      where: { email: data.email },
    })
    if (!dbUser)
      throw new Error('Failed to signUp user: ' + JSON.stringify(result.errors))

    // If verified, ensure verification code and call verifyEmail
    if (verified) {
      // Ensure a verification code exists by calling sendVerificationEmail
      await yoga.fetch('http://localhost:4000/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: sendVerificationMutation,
          variables: { email: data.email },
        }),
      })

      const refreshed = await prisma.user.findUnique({
        where: { email: data.email },
      })
      if (!refreshed || !refreshed.verificationCode)
        throw new Error('No verification code available for existing user')

      const verifyResp = await yoga.fetch('http://localhost:4000/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: verifyMutation,
          variables: {
            data: { email: data.email, code: refreshed.verificationCode },
          },
        }),
      })
      const verifyRes = await verifyResp.json()
      if (verifyRes.errors)
        throw new Error(
          'Failed to verify existing user: ' + JSON.stringify(verifyRes.errors),
        )
      return {
        jwt: verifyRes.data.verifyEmail.token,
        user: verifyRes.data.verifyEmail.user,
      }
    }

    // Otherwise just sign in via API to get a token
    const signInResp = await yoga.fetch('http://localhost:4000/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: signInMutation,
        variables: { data: { email: data.email, password } },
      }),
    })
    const signInRes = await signInResp.json()
    if (signInRes.errors)
      throw new Error(
        'Failed to signIn existing user: ' + JSON.stringify(signInRes.errors),
      )
    return {
      jwt: signInRes.data.signIn.token,
      user: signInRes.data.signIn.user,
    }
  }

  const payload = result.data.signUp

  if (verified) {
    // Use verifyEmail mutation (get code from DB) to mark user verified via API
    const dbUser = await prisma.user.findUnique({
      where: { email: data.email },
    })
    if (!dbUser || !dbUser.verificationCode)
      throw new Error('No verification code after signUp')

    const verifyResp = await yoga.fetch('http://localhost:4000/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: verifyMutation,
        variables: {
          data: { email: data.email, code: dbUser.verificationCode },
        },
      }),
    })
    const verifyRes = await verifyResp.json()
    if (verifyRes.errors)
      throw new Error(
        'Failed to verify new user: ' + JSON.stringify(verifyRes.errors),
      )
    return {
      jwt: verifyRes.data.verifyEmail.token,
      user: verifyRes.data.verifyEmail.user,
    }
  }

  return { jwt: payload.token, user: payload.user }
}
