import { describe, expect, it } from 'vitest'

import { prisma } from '../src/client'
import { yoga } from '../src/server'
import { generate6DigitCode } from '../src/utils/auth'
import { createTestUserAndJwt, generateTestUserData } from './testHelpers'
// import logger from './utils/logger';

describe('Authentication', () => {
  // Use the yoga instance from the server which has JWT plugin configured

  // afterEach(async () => {
  //   await testUtils.cleanupTestUsers();
  // });

  describe('signUp', () => {
    it('should create a new user and send verification email', async () => {
      // Generate unique test user data
      const userData = generateTestUserData()

      const mutation = `
        mutation SignUp(
          $email: String!,
          $password: String!,
          $name: String!,
          $phoneNumber: String!
        ) {
          signUp(
            email: $email,
            password: $password,
            name: $name,
            phoneNumber: $phoneNumber
          ) {
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
        email: userData.email,
        password: 'password123',
        name: userData.name,
        phoneNumber: '555-123-4567',
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

      expect(result.data.signUp).toBeDefined()
      expect(result.data.signUp.user.email).toBe(userData.email)
      expect(result.data.signUp.user.name).toBe(userData.name)
      expect(result.data.signUp.user.phoneNumber).toBe('555-123-4567')
      expect(result.data.signUp.token).toBeDefined()

      // Verify user was created in database
      const user = await prisma.user.findUnique({
        where: { email: userData.email },
      })

      expect(user).toBeDefined()
      expect(user?.name).toBe(userData.name)
      expect(user?.verificationCode).toBeDefined()
      expect(user?.verificationCodeExpiresAt).toBeDefined()
    })

    it('should not allow duplicate emails', async () => {
      // Create first user
      await createTestUserAndJwt(prisma, { email: 'duplicate@example.com' })

      const mutation = `
        mutation SignUp(
          $email: String!,
          $password: String!,
          $name: String!,
          $phoneNumber: String!
        ) {
          signUp(
            email: $email,
            password: $password,
            name: $name,
            phoneNumber: $phoneNumber
          ) {
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
        email: 'duplicate@example.com',
        password: 'password123',
        name: 'Another User',
        phoneNumber: '555-987-6543',
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
        prisma,
        {
          email: 'signin@example.com',
        },
        'password123',
        true,
      ) // password, validated=true

      const mutation = `
        mutation SignIn($email: String!, $password: String!) {
          signIn(email: $email, password: $password) {
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
        email: 'signin@example.com',
        password: 'password123',
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
        mutation SignIn($email: String!, $password: String!) {
          signIn(email: $email, password: $password) {
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
        email: 'nonexistent@example.com',
        password: 'wrongpassword',
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
        prisma,
        { email: 'unverified@example.com' },
        'password123',
        false, // validated=false
      )

      const mutation = `
        mutation SignIn($email: String!, $password: String!) {
          signIn(email: $email, password: $password) {
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
        email: 'unverified@example.com',
        password: 'password123',
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
      const testUser = await createTestUserAndJwt(
        prisma,
        {},
        'password123',
        true,
      ) // Create a verified user with default data

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
          Authorization: `Bearer ${testUser.jwt}`,
        },
        body: JSON.stringify({
          query,
        }),
      })

      const result = await response.json()

      // logger.info('Me query result:', { result, testUser });

      expect(result.data.me).toBeDefined()
      expect(result.data.me.email).toBe(testUser.email)
      expect(result.data.me.name).toBe(testUser.name)
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
      prisma,
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
      prisma,
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
      mutation ResetPassword($code: String!, $newPassword: String!) {
        resetPassword(code: $code, newPassword: $newPassword) {
          token
          user {
            id
            email
          }
        }
      }
    `

    const variables = {
      code: resetCode,
      newPassword: 'newpassword123',
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
      mutation ResetPassword($code: String!, $newPassword: String!) {
        resetPassword(code: $code, newPassword: $newPassword) {
          token
          user {
            id
            email
          }
        }
      }
    `

    const variables = {
      code: 'invalid',
      newPassword: 'newpassword123',
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
