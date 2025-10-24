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

    const signUpMutation = `
      mutation SignUp($data: SignUpInput!) {
        signUp(data: $data) {
          token
          user { id email name role phoneNumber registeredAt validatedAt }
        }
      }
    `

    const response = await yoga.fetch('http://localhost:4000/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: signUpMutation,
        variables: { data: { email, password, name, phoneNumber } },
      }),
    })

    const result = await response.json()
    if (result.errors) {
      throw new Error('signUp failed: ' + JSON.stringify(result.errors))
    }

    const payload = result.data.signUp
    const user = payload.user as User
    const jwt = payload.token as string
    return { ...user, jwt } as TestUser
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

    // Ensure verification code exists; trigger send if absent
    const dbUser = await this.prisma.user.findUnique({
      where: { id: created.id },
    })
    if (!dbUser) throw new Error('User not found after signUp')

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
          variables: { email: created.email },
        }),
      })
      // refresh
      const refreshed = await this.prisma.user.findUnique({
        where: { id: created.id },
      })
      if (refreshed) Object.assign(dbUser, refreshed)
    }

    if (!dbUser.verificationCode)
      throw new Error('No verification code available to verify user')

    const verifyMutation = `
      mutation VerifyEmail($data: VerifyEmailInput!) {
        verifyEmail(data: $data) {
          token
          user { id email name role phoneNumber registeredAt validatedAt }
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
    if (verifyRes.errors)
      throw new Error('verifyEmail failed: ' + JSON.stringify(verifyRes.errors))

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
