import { PrismaClient } from '../src/generated/prisma/client'
import { signJwt } from '../src/utils/auth'
import { hashPassword } from '../src/utils/auth'

export interface TestUser {
  id: string
  email: string
  name: string
  role: string
  jwt: string
}

export class TestUtils {
  constructor(private prisma: PrismaClient) {}

  /**
   * Creates a test user with a random email and returns the user data with JWT
   */
  async createTestUser(
    overrides: Partial<{
      email: string
      name: string
      password: string
      role: string
    }> = {},
  ): Promise<TestUser> {
    const email = overrides.email || `test-${Date.now()}@example.com`
    const name = overrides.name || 'Test User'
    const password = overrides.password || 'password123'
    const role = overrides.role || 'user'

    const hashedPassword = await hashPassword(password)

    const user = await this.prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role,
      },
    })

    const jwt = signJwt({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    })

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      jwt,
    }
  }

  /**
   * Creates a verified test user (with validatedAt set)
   */
  async createVerifiedTestUser(
    overrides: Partial<{
      email: string
      name: string
      password: string
      role: string
    }> = {},
  ): Promise<TestUser> {
    const user = await this.createTestUser(overrides)

    // Mark as verified
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        validatedAt: new Date(),
        verificationCode: null,
        verificationCodeExpiresAt: null,
      },
    })

    return user
  }

  /**
   * Cleans up test users created during tests
   */
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
