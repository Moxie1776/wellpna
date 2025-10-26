import { PrismaClient, User } from '../src/generated/prisma/client'
import { yoga } from '../src/server'

// Define a proper type for TestUser that includes JWT
interface TestUser extends User {
  jwt: string
}

export class TestUtils {
  constructor(private prisma: PrismaClient) {}

  /** Create a test user with a random email and return user + jwt. */
  async createTestUser(
    overrides: Partial<{
      email: string
      name: string
      password: string
      role: string
      registeredAt: Date
      phoneNumber: string
    }> = {},
  ): Promise<TestUser> {
    const email = overrides.email || `test-${Date.now()}@example.com`
    const name = overrides.name || 'Test User'
    const password = overrides.password || 'password123'
    // Random phone number for test users
    const phoneNumber =
      overrides.phoneNumber ||
      `555-${Math.floor(1000 + Math.random() * 9000)}-` +
        `${Math.floor(1000 + Math.random() * 9000)}`

    // signUp now returns a confirmation String. Request only the scalar.
    const signUpMutation = `
      mutation SignUp($data: SignUpInput!) {
        signUp(data: $data)
      }
    `

    const response = await yoga.fetch('http://localhost:4000/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: signUpMutation,
        variables: {
          data: { email, password, name, phoneNumber },
        },
      }),
    })

    const result = await response.json()
    if (result.errors) {
      throw new Error('signUp failed: ' + JSON.stringify(result.errors))
    }

    // After signUp, load the created user from the DB. Tests that need a JWT
    // should call verifyEmail to obtain one.
    const created = await this.prisma.user.findUnique({ where: { email } })
    if (!created) throw new Error('User not found after signUp')

    // If the caller needs a JWT, ensure the account is verified via the
    // verifyEmail mutation. For this helper we return a JWT by verifying the
    // fresh user immediately.
    const getVerifyCode = created.verificationCode
    const jwt: string | null = null
    if (!getVerifyCode) {
      // trigger a verification email so a code exists
      const sendVerificationMutation = `
        mutation SendVerificationEmail($email: String!) {
          sendVerificationEmail(email: $email)
        }
      `
      await yoga.fetch('http://localhost:4000/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: sendVerificationMutation,
          variables: { email },
        }),
      })
      // reload
      const refreshed = await this.prisma.user.findUnique({ where: { email } })
      if (refreshed) Object.assign(created, refreshed)
    }

    // Use verifyEmail to obtain a JWT for test usage
    const verifyMutation = `
      mutation VerifyEmail($data: VerifyEmailInput!) {
        verifyEmail(data: $data) {
          token
          user {
            id
            email
            name
            role
            phoneNumber
            registeredAt
            validatedAt
          }
        }
      }
    `

    // If a verification code exists, call verifyEmail to get token/user
    const code = (created as any).verificationCode
    if (code) {
      const verifyResp = await yoga.fetch('http://localhost:4000/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: verifyMutation,
          variables: {
            data: { email, code },
          },
        }),
      })
      const verifyRes = await verifyResp.json()
      if (verifyRes.errors) {
        throw new Error(
          'verifyEmail failed: ' + JSON.stringify(verifyRes.errors),
        )
      }
      const payload = verifyRes.data.verifyEmail
      return { ...payload.user, jwt: payload.token } as TestUser
    }

    // If no code available, return the created user without a JWT.
    return { ...created, jwt: jwt as any } as TestUser
  }

  /** Create a verified test user (sets validatedAt). */
  async createVerifiedTestUser(
    overrides: Partial<{
      email: string
      name: string
      password: string
      role: string
    }> = {},
  ): Promise<TestUser> {
    // Create user via signUp mutation
    const created = await this.createTestUser(overrides)

    // If createTestUser already produced a verified user, return it directly.
    const isValidated = Boolean((created as any).validatedAt)
    const codeMissing = (created as any).verificationCode == null
    if (isValidated || codeMissing) {
      // If the user is already verified (validatedAt set) return early.
      if (isValidated) return created
    }

    // Ensure verification code exists; trigger send if absent
    const dbUser = await this.prisma.user.findUnique({
      where: { id: created.id },
    })
    if (!dbUser) {
      throw new Error('User not found after signUp')
    }

    if (!dbUser.verificationCode) {
      const sendVerificationMutation = `
        mutation SendVerificationEmail($email: String!) {
          sendVerificationEmail(email: $email)
        }
      `
      await yoga.fetch('http://localhost:4000/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: sendVerificationMutation,
          variables: {
            email: created.email,
          },
        }),
      })
      // refresh
      const refreshed = await this.prisma.user.findUnique({
        where: { id: created.id },
      })
      if (refreshed) Object.assign(dbUser, refreshed)
    }

    if (!dbUser.verificationCode) {
      throw new Error('No verification code available to verify user')
    }

    const verifyMutation = `
      mutation VerifyEmail($data: VerifyEmailInput!) {
        verifyEmail(data: $data) {
          token
          user {
            id
            email
            name
            role
            phoneNumber
            registeredAt
            validatedAt
          }
        }
      }
    `

    const verifyResp = await yoga.fetch('http://localhost:4000/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: verifyMutation,
        variables: {
          data: {
            email: created.email,
            code: dbUser.verificationCode,
          },
        },
      }),
    })

    const verifyRes = await verifyResp.json()
    if (verifyRes.errors) {
      throw new Error('verifyEmail failed: ' + JSON.stringify(verifyRes.errors))
    }

    const payload = verifyRes.data.verifyEmail
    return { ...payload.user, jwt: payload.token } as TestUser
  }

  /**
   * Set a verification code directly in the DB.
   * Intended for tests that cannot intercept/mock email delivery.
   */
  async setVerificationCode(email: string, code: string) {
    await this.prisma.user.update({
      where: { email },
      data: {
        verificationCode: code,
        verificationCodeExpiresAt: new Date(Date.now() + 10 * 60 * 1000),
      },
    })
  }

  /** Delete test users created during tests. */
  async cleanupTestUsers(): Promise<void> {
    await this.prisma.user.deleteMany({
      where: {
        email: {
          endsWith: '@example.com',
        },
      },
    })
  }
}
