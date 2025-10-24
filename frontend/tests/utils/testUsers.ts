import { DocumentNode } from 'graphql'
import { print } from 'graphql'

import { logger } from '@/utils'

import { AuthResponse, User } from '../../src/graphql'
import {
  GetVerificationCodeDocument,
  SignInDocument,
  SignUpDocument,
  VerifyEmailDocument,
} from '../../src/graphql/generated/graphql'
import { useAuthStore } from '../../src/store/auth'

// Test-specific type for managing test user sessions
interface TestUserSession {
  user: User
  token: string
  email: string
}

// Global test user sessions storage
const testUserSessions = new Map<string, TestUserSession>()

const cleanupQueue = new Set<string>()

/**
 * Enqueue a cleanup pattern to be executed in global teardown instead of
 * running immediate deletions during tests.
 */
export function enqueueCleanup(pattern: string = '@example.com') {
  cleanupQueue.add(pattern)
}

/**
 * Run all queued cleanup operations sequentially and clear the queue.
 * Intended to be called from the test global teardown.
 */
export async function runQueuedCleanups(): Promise<void> {
  for (const pattern of Array.from(cleanupQueue)) {
    try {
      // call the existing cleanup implementation

      await cleanupTestUsers(pattern)
    } catch (err) {
      // log and continue

      console.warn(`Queued cleanup failed for ${pattern}:`, err)
    }
  }
  cleanupQueue.clear()
}

// GraphQL endpoint
const GRAPHQL_ENDPOINT =
  process.env.VITE_GRAPHQL_ENDPOINT || 'http://localhost:4000/graphql'

/**
 * Execute a GraphQL request
 */
export async function executeGraphQL<T = any>(
  query: string | DocumentNode,
  variables?: Record<string, any>,
  authToken?: string,
  opts?: { retries?: number; timeoutMs?: number },
): Promise<T> {
  const queryString = typeof query === 'string' ? query : print(query)

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (authToken) {
    headers.authorization = `Bearer ${authToken}`
  }

  // Resilient fetch with retries and timeout to avoid flakes when backend is
  // starting or under load during test runs.
  const DEFAULT_RETRIES = 2
  const DEFAULT_TIMEOUT_MS = 6000 // 6s
  const retries = opts?.retries ?? DEFAULT_RETRIES
  const timeoutMs = opts?.timeoutMs ?? DEFAULT_TIMEOUT_MS

  function sleep(ms: number) {
    return new Promise((res) => setTimeout(res, ms))
  }

  let lastError: unknown = null

  for (let attempt = 1; attempt <= retries; attempt++) {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), timeoutMs)

    try {
      const response = await fetch(GRAPHQL_ENDPOINT, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          query: queryString,
          variables,
        }),
        signal: controller.signal,
      })

      clearTimeout(timeout)

      const result = await response.json()

      if (result.errors) {
        const error = result.errors[0]
        throw new Error(error.message || 'GraphQL error')
      }

      return result.data
    } catch (err) {
      lastError = err

      // If aborted due to timeout or a network failure, retry with backoff
      const isLastAttempt = attempt === retries
      const isAbort = err && (err as Error).name === 'AbortError'

      if (isLastAttempt) {
        // Throw a clearer error for the caller to use in test diagnostics
        const errMsg = isAbort
          ? `Request aborted after ${timeoutMs}ms`
          : err instanceof Error
            ? err.message
            : String(err)
        throw new Error(errMsg)
      }

      // exponential backoff: 300ms, 600ms, 1200ms, ...
      const backoff = 200 * Math.pow(2, attempt - 1)
      // small delay before retrying

      await sleep(backoff)
      // continue to next attempt
    }
  }

  // If we exit loop without returning, throw the last error
  throw new Error(
    lastError instanceof Error ? lastError.message : 'Unknown network error',
  )
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

    const result = await executeGraphQL(SignUpDocument, {
      data: signUpData,
    })

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
        // Small pause to allow backend to finish processing the signup and
        // make debug helpers available. This reduces races where the test
        // immediately queries the debug endpoint and the user record isn't
        // visible yet.

        await new Promise((r) => setTimeout(r, 300))
        // Prefer to force-verify via the debug mutation which is more
        // reliable in test environments. If the debug mutation is not
        // available, fall back to reading the verification code and using
        // the verifyEmail mutation.
        try {
          const verifyMutation = `
            mutation DebugVerifyUser($email: String!) {
              debugVerifyUser(email: $email)
            }
          `
          let debugVerified = false
          for (let vAttempt = 1; vAttempt <= 3; vAttempt++) {
            const verifyResult = await executeGraphQL(
              verifyMutation,
              { email },
              undefined,
              { retries: 1, timeoutMs: 1500 },
            )
            if (verifyResult?.debugVerifyUser) {
              debugVerified = true
              break
            }

            await new Promise((r) => setTimeout(r, 200 * vAttempt))
          }

          if (debugVerified) {
            const signInResp = await signInTestUser(email, password)
            // update stored session with fresh token
            testUserSessions.set(email, {
              user: signInResp.user,
              token: signInResp.token,
              email,
            })
          } else {
            // Fallback to code-based verification
            const verificationCode = await getVerificationCode(email)
            if (verificationCode) {
              try {
                await verifyTestUser(email, verificationCode)
              } catch {
                const fallback = await executeGraphQL(
                  verifyMutation,
                  { email },
                  undefined,
                  { retries: 1, timeoutMs: 1500 },
                )
                if (fallback?.debugVerifyUser) {
                  const signInResp = await signInTestUser(email, password)
                  testUserSessions.set(email, {
                    user: signInResp.user,
                    token: signInResp.token,
                    email,
                  })
                }
              }
            } else {
              const signInResp = await signInTestUser(email, password)
              testUserSessions.set(email, {
                user: signInResp.user,
                token: signInResp.token,
                email,
              })
            }
          }
        } catch {
          // If debug mutation failed, try code-based flow
          const verificationCode = await getVerificationCode(email)
          if (verificationCode) {
            try {
              await verifyTestUser(email, verificationCode)
            } catch {
              // try forcing debug verify and sign in

              const verifyMutation = `
                  mutation DebugVerifyUser($email: String!) {
                    debugVerifyUser(email: $email)
                  }
                `
              const fallback = await executeGraphQL(
                verifyMutation,
                { email },
                undefined,
                { retries: 1, timeoutMs: 1500 },
              )
              if (fallback?.debugVerifyUser) {
                const signInResp = await signInTestUser(email, password)
                testUserSessions.set(email, {
                  user: signInResp.user,
                  token: signInResp.token,
                  email,
                })
              }
            }
          } else {
            // If no code could be retrieved, try forcing debug verify
            // and sign in

            const verifyMutation = `
                mutation DebugVerifyUser($email: String!) {
                  debugVerifyUser(email: $email)
                }
              `
            const verifyResult2 = await executeGraphQL(
              verifyMutation,
              { email },
              undefined,
              { retries: 1, timeoutMs: 1500 },
            )
            if (verifyResult2?.debugVerifyUser) {
              const signInResp = await signInTestUser(email, password)
              testUserSessions.set(email, {
                user: signInResp.user,
                token: signInResp.token,
                email,
              })
            }
          }
        }
      } catch (error) {
        console.warn(`Auto-verification failed for ${email}:`, error)
        // Don't fail the user creation if verification fails
      }
    }

    return authResponse
  } catch (error) {
    throw new Error(
      `Failed to create test user: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`,
    )
  }
}

/**
 * Get verification code using debug GraphQL query
 */
export async function getVerificationCode(email: string): Promise<string> {
  const MAX_ATTEMPTS = 12
  const BASE_DELAY_MS = 400

  let lastErr: unknown = null

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const result = await executeGraphQL(GetVerificationCodeDocument, {
      email,
    })

    if (result?.getVerificationCode) {
      return result.getVerificationCode
    }

    // If the debug query explicitly reports user not found, retry a few
    // times because user creation propagation to the debug query may be
    // slightly delayed.
    if (result && (result as any).errors) {
      lastErr = (result as any).errors[0]
    }

    // small backoff before next attempt

    await new Promise((r) => setTimeout(r, BASE_DELAY_MS * attempt))
  }

  // As a last resort attempt to force-verify the user in debug mode. If the
  // backend marks the user verified, return an empty string to indicate that
  // no code is required.

  const verifyMutation = `
      mutation DebugVerifyUser($email: String!) {
        debugVerifyUser(email: $email)
      }
    `
  const verifyResult = await executeGraphQL(
    verifyMutation,
    { email },
    undefined,
    {
      retries: 1,
      timeoutMs: 1500,
    },
  )
  if (verifyResult?.debugVerifyUser) {
    return ''
  }

  throw new Error(
    `Failed to get verification code: ${
      lastErr instanceof Error ? lastErr.message : String(lastErr)
    }`,
  )
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

    const result = await executeGraphQL(VerifyEmailDocument, {
      data: verifyData,
    })

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
      `Failed to verify test user: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`,
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

    const result = await executeGraphQL(SignInDocument, {
      data: signInData,
    })

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
      `Failed to sign in test user: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`,
    )
  }
}

/**
 * Remove test users by email pattern (@example.com) to maintain
 * clean test database state
 */
export async function cleanupTestUsers(
  pattern: string = '@example.com',
): Promise<void> {
  try {
    // Call the backend debug mutation which deletes test users
    // matching the pattern. This mutation is guarded by
    // NODE_ENV === 'debug' on the backend.
    const mutation = `
      mutation CleanupTestUsers($pattern: String!) {
        cleanupTestUsers(pattern: $pattern)
      }
    `

    const result = await executeGraphQL(mutation, { pattern }, undefined, {
      retries: 1,
      timeoutMs: 2000,
    })

    if (typeof result?.cleanupTestUsers === 'number') {
      const count = result.cleanupTestUsers
      logger.debug(`Cleaned up ${count} test users with pattern ${pattern}`)
    } else {
      console.warn('cleanupTestUsers did not return a count')
    }
  } catch (error) {
    console.warn(
      `Failed to cleanup test users: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`,
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

/**
 * Promote a user in the client test environment by ensuring the user has a
 * backend-issued token (sign in if necessary) and updating the client auth
 * store with the requested role. This keeps tokens real while allowing UI
 * tests to reflect role-based rendering without fabricating tokens.
 */
export async function promoteUserInClient(
  email: string,
  role: 'user' | 'admin',
  password: string = 'password',
): Promise<void> {
  let session = testUserSessions.get(email)

  if (!session) {
    // Attempt to sign in (this will also populate testUserSessions)
    const authResp = await signInTestUser(email, password)
    session = { user: authResp.user, token: authResp.token, email }
    testUserSessions.set(email, session)
  }

  const updatedUser = { ...session.user, role }
  // Update stored session
  testUserSessions.set(email, { ...session, user: updatedUser })

  // Update the client auth store for UI tests
  try {
    useAuthStore.setState({ token: session.token, user: updatedUser })
  } catch (err) {
    // If the store isn't available in this environment, just log and continue
    logger.warn('promoteUserInClient: unable to set auth store', err)
  }
}

/**
 * Create or promote a test user to admin on the server using the debug-only
 * mutation `debugCreateAdminUser`. This mutation is only available when the
 * backend is running in debug mode (NODE_ENV === 'debug'). The function will
 * store the returned token/user in the test sessions map and set the client
 * auth store for UI tests.
 */
export async function createAdminTestUser(
  email?: string,
  password: string = 'password',
  name: string = 'Admin Test User',
  phoneNumber: string = '',
): Promise<AuthResponse> {
  const mutation = `
    mutation DebugCreateAdminUser($email: String!, $password: String, $name: String, $phoneNumber: String) {
      debugCreateAdminUser(email: $email, password: $password, name: $name, phoneNumber: $phoneNumber) {
        token
        user {
          id
          email
          name
          role
          phoneNumber
        }
      }
    }
  `

  // Attempt to create with provided email, otherwise generate a unique one.
  let attempt = 0
  const maxAttempts = 3
  let lastErr: unknown = null

  while (attempt < maxAttempts) {
    attempt++
    const tryEmail = email || `admin-${Date.now()}${attempt}@example.com`

    try {
      const variables = { email: tryEmail, password, name, phoneNumber }

      const result = await executeGraphQL(mutation, variables, undefined, {
        retries: 2,
        timeoutMs: 4000,
      })

      if (!result?.debugCreateAdminUser) {
        throw new Error(
          'debugCreateAdminUser did not return data — is backend running in debug mode?',
        )
      }

      const authResp: AuthResponse = result.debugCreateAdminUser

      // Store session
      testUserSessions.set(authResp.user.email, {
        user: authResp.user,
        token: authResp.token,
        email: authResp.user.email,
      })

      // Update client auth store for UI tests
      try {
        useAuthStore.setState({ token: authResp.token, user: authResp.user })
      } catch (err) {
        logger.warn('createAdminTestUser: unable to set auth store', err)
      }

      return authResp
    } catch (err) {
      lastErr = err
      const msg = err instanceof Error ? err.message : String(err)
      // If the email already exists, try a new unique email and retry.
      if (msg.includes('already exists') && attempt < maxAttempts) {
        // continue to next attempt with generated email
        email = undefined
        await new Promise((r) => setTimeout(r, 100 * attempt))
        continue
      }

      // For other errors or if max attempts reached, throw.
      throw err
    }
  }

  throw new Error(
    `Failed to create admin user: ${
      lastErr instanceof Error ? lastErr.message : String(lastErr)
    }`,
  )
}
