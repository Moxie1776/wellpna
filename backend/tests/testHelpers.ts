import { PrismaClient } from '../src/generated/prisma/client';
import { signJwt } from '../src/utils/auth';
import { hashPassword } from '../src/utils/auth';

export interface TestUserData {
  email: string;
  name: string;
}

export interface TestUser {
  id: string;
  email: string;
  name: string;
  roleId: string;
  jwt: string;
}

/**
 * Generates unique test user data (email and name)
 */
export function generateTestUserData(): TestUserData {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return {
    email: `test-${timestamp}-${random}@example.com`,
    name: `Test User ${timestamp}-${random}`,
  };
}

/**
 * Creates a test user with a unique email and returns the user data with JWT
 * @param prisma - Prisma client instance
 * @param overrides - Optional overrides for user data
 * @param password - Password for the user (default: 'password123')
 * @param validated - Whether to mark the user as validated (default: true)
 */
export async function createTestUserAndJwt(
  prisma: PrismaClient,
  overrides: Partial<{
    email: string;
    name: string;
    password: string;
    roleId: string;
  }> = {},
  password: string = 'password123',
  validated: boolean = true
): Promise<TestUser> {
  const userData = generateTestUserData();
  const email = overrides.email || userData.email;
  const name = overrides.name || userData.name;
  const roleId = overrides.roleId || 'user';

  // Clean up any existing test user with the same email or name
  // This helps prevent conflicts if a previous test run didn't clean up properly
  await prisma.user.deleteMany({
    where: {
      OR: [{ email }, { name }],
    },
  });

  const hashedPassword = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      email,
      name,
      password: hashedPassword,
      roleId,
      // If validated is true, set validatedAt to current date
      ...(validated && { validatedAt: new Date() }),
    },
  });

  const jwt = signJwt({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.roleId,
  });

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    roleId: user.roleId,
    jwt,
  };
}
