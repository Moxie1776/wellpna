import { SIGN_UP_MUTATION } from '../../src/graphql/mutations/signUpMutation'
import { SIGN_IN_MUTATION } from '../../src/graphql/mutations/signInMutation'
import { VERIFY_EMAIL_MUTATION } from '../../src/graphql/mutations/verifyEmailMutation'
import { GET_VERIFICATION_CODE_QUERY } from '../../src/graphql/queries/getVerificationCodeQuery'
import { USERS_QUERY } from '../../src/graphql/queries/usersQuery'
import { User, AuthResponse } from '../../src/graphql'

// Test-specific type for managing test user sessions
interface TestUserSession {
  user: User
  token: string
  email: string
}

// Global test user sessions storage
const testUserSessions = new Map<string, TestUserSession>()

// GraphQL endpoint
const GRAPHQL_ENDPOINT =
  process.env.VITE_GRAPHQL_ENDPOINT || 'http://localhost:4000/graphql'

/**
 * Execute a GraphQL request
 */
async function executeGraphQL<T = any>(
  query: string,
  variables?: Record<string, any>,
  authToken?: string,
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (authToken) {
    headers.authorization = `Bearer ${authToken}`
  }

  const response = await fetch(GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      query,
      variables,
    }),
  })

  const result = await response.json()

  if (result.errors) {
    const error = result.errors[0]
    throw new Error(error.message || 'GraphQL error')
  }

  return result.data
}

/**
 * Create a test user via real GraphQL signUp mutation
 */
export async function createTestUser(
  email: string,
  password: string,
  name: string,
  phoneNumber?: string,
  autoVerify: boolean = true,
): Promise<AuthResponse> {
  try {
    const signUpData = {
      email,
      password,
      name,
      phoneNumber: phoneNumber || '',
    }

    const result = await executeGraphQL(
      SIGN_UP_MUTATION.loc?.source.body || '',
      {
        data: signUpData,
      },
    )

    if (!result?.signUp) {
      throw new Error('No data returned from signUp mutation')
    }

    const authResponse: AuthResponse = result.signUp

    // Store session
    testUserSessions.set(email, {
      user: authResponse.user,
      token: authResponse.token,
      email,
    })

    // Auto-verify if requested
    if (autoVerify) {
      try {
        const verificationCode = await getVerificationCode(email)
        await verifyTestUser(email, verificationCode)
      } catch (error) {
        console.warn(`Auto-verification failed for ${email}:`, error)
        // Don't fail the user creation if verification fails
      }
    }

    return authResponse
  } catch (error) {
    throw new Error(
      `Failed to create test user: ${error instanceof Error ? error.message : 'Unknown error'}`,
    )
  }
}

/**
 * Get verification code using debug GraphQL query
 */
export async function getVerificationCode(email: string): Promise<string> {
  try {
    const result = await executeGraphQL(
      GET_VERIFICATION_CODE_QUERY.loc?.source.body || '',
      {
        email,
      },
    )

    if (!result?.getVerificationCode) {
      throw new Error('No verification code returned')
    }

    return result.getVerificationCode
  } catch (error) {
    throw new Error(
      `Failed to get verification code: ${error instanceof Error ? error.message : 'Unknown error'}`,
    )
  }
}

/**
 * Verify test user email using verification code
 */
export async function verifyTestUser(
  email: string,
  code: string,
): Promise<AuthResponse> {
  try {
    const verifyData = {
      email,
      code,
    }

    const result = await executeGraphQL(
      VERIFY_EMAIL_MUTATION.loc?.source.body || '',
      {
        data: verifyData,
      },
    )

    if (!result?.verifyEmail) {
      throw new Error('No data returned from verifyEmail mutation')
    }

    const authResponse: AuthResponse = result.verifyEmail

    // Update stored session
    const session = testUserSessions.get(email)
    if (session) {
      session.token = authResponse.token
      session.user = authResponse.user
    }

    return authResponse
  } catch (error) {
    throw new Error(
      `Failed to verify test user: ${error instanceof Error ? error.message : 'Unknown error'}`,
    )
  }
}

/**
 * Sign in a test user and return JWT token
 */
export async function signInTestUser(
  email: string,
  password: string,
): Promise<AuthResponse> {
  try {
    const signInData = {
      email,
      password,
    }

    const result = await executeGraphQL(
      SIGN_IN_MUTATION.loc?.source.body || '',
      {
        data: signInData,
      },
    )

    if (!result?.signIn) {
      throw new Error('No data returned from signIn mutation')
    }

    const authResponse: AuthResponse = result.signIn

    // Update stored session
    testUserSessions.set(email, {
      user: authResponse.user,
      token: authResponse.token,
      email,
    })

    return authResponse
  } catch (error) {
    throw new Error(
      `Failed to sign in test user: ${error instanceof Error ? error.message : 'Unknown error'}`,
    )
  }
}

/**
 * Remove test users by email pattern (@example.com) to maintain clean test database state
 */
export async function cleanupTestUsers(
  pattern: string = '@example.com',
): Promise<void> {
  try {
    // Get all users
    const result = await executeGraphQL(USERS_QUERY.loc?.source.body || '')

    if (!result?.users) {
      console.warn('No users found to cleanup')
      return
    }

    const usersToDelete = result.users.filter(
      (user: User & { registeredAt: string }) =>
        user.email.endsWith(pattern),
    )

    if (usersToDelete.length === 0) {
      console.log(`No test users found with pattern ${pattern}`)
      return
    }

    console.log(`Found ${usersToDelete.length} test users to cleanup`)

    // Note: The current GraphQL schema doesn't have a deleteUser mutation
    // This would need to be implemented in the backend for full cleanup
    // For now, we'll just clear our local session storage
    usersToDelete.forEach((user: User & { registeredAt: string }) => {
      testUserSessions.delete(user.email)
    })

    console.log(`Cleaned up ${usersToDelete.length} test user sessions`)
  } catch (error) {
    console.warn(
      `Failed to cleanup test users: ${error instanceof Error ? error.message : 'Unknown error'}`,
    )
    // Don't throw error for cleanup failures
  }
}

/**
 * Get stored test user session
 */
export function getTestUserSession(email: string): TestUserSession | undefined {
  return testUserSessions.get(email)
}

/**
 * Get all stored test user sessions
 */
export function getAllTestUserSessions(): TestUserSession[] {
  return Array.from(testUserSessions.values())
}

/**
 * Clear all stored test user sessions
 */
export function clearTestUserSessions(): void {
  testUserSessions.clear()
}

/**
 * Create multiple test users with sequential emails
 */
export async function createMultipleTestUsers(
  count: number,
  baseEmail: string = 'test@example.com',
  password: string = 'password123',
  namePrefix: string = 'Test User',
  autoVerify: boolean = true,
): Promise<TestUserSession[]> {
  const sessions: TestUserSession[] = []

  for (let i = 1; i <= count; i++) {
    const email = baseEmail.replace('@', `${i}@`)
    const name = `${namePrefix} ${i}`

    try {
      const authResponse = await createTestUser(
        email,
        password,
        name,
        undefined,
        autoVerify,
      )
      sessions.push({
        user: authResponse.user,
        token: authResponse.token,
        email,
      })
    } catch (error) {
      console.error(`Failed to create test user ${email}:`, error)
    }
  }

  return sessions
}
