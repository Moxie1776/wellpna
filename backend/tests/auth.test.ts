import { describe, expect, it } from '@jest/globals'

import { yoga } from '../src/server'
import { prisma } from '../src/client'
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
        mutation SignUp($email: String!, $password: String!, $name: String!) {
          signUp(email: $email, password: $password, name: $name) {
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
        email: userData.email,
        password: 'password123',
        name: userData.name,
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
        mutation SignUp($email: String!, $password: String!, $name: String!) {
          signUp(email: $email, password: $password, name: $name) {
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

// The global teardown function in teardown.ts will handle cleanup of test users
