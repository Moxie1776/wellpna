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
    }

    // Final fallback: if auto-verify attempted but we still don't have an
    // AuthResponse, try signing in once more. This helps when verification
    // succeeded on the server but our debug/code-based checks had timing
    // issues.
    if (!authResponse) {
      try {
        const signInResp = await signInTestUser(email, password)
        if (signInResp?.user) {
          testUserSessions.set(email, {
            user: signInResp.user,
            token: signInResp.token,
            email,
          })
          authResponse = signInResp
        }
      } catch (err) {
        // ignore — we'll return whatever we have below
      }
    }

    // If we still don't have an AuthResponse (for example signUp returned a
    // confirmation string and autoVerify ultimately failed), return a
    // best-effort value: prefer AuthResponse, otherwise return the raw
    // signUp payload so callers can inspect the server reply.
    return (authResponse as any) || (signUpPayload as any)
 * Intended to be called from the test global teardown.
 */
export async function runQueuedCleanups(): Promise<void> {
  for (const pattern of Array.from(cleanupQueue)) {
    try {
      // call the existing cleanup implementation

      await cleanupTestUsers(pattern)
    } catch (err) {
      // log and continue

      logger.warn(`Queued cleanup failed for ${pattern}:`, err)
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
  const DEFAULT_RETRIES = 3
  // Increase default timeout to accommodate CI/backends starting slowly.
  const DEFAULT_TIMEOUT_MS = 15000 // 15s
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
        // Pause briefly to reduce signup/verification race conditions.

        await new Promise((r) => setTimeout(r, 300))
        // Try debug-verify mutation first.
        // Otherwise fall back to code-based verification.
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
        logger.warn(`Auto-verification failed for ${email}:`, error)
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

    // Retry on transient 'user not found' errors (propagation delay).
    if (result && (result as any).errors) {
      lastErr = (result as any).errors[0]
    }

    // small backoff before next attempt

    await new Promise((r) => setTimeout(r, BASE_DELAY_MS * attempt))
  }

  // Last-resort: try force-verify via debug mutation; return '' if verified.

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
    // Call debug cleanup mutation (guarded by NODE_ENV === 'debug').
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
      // cleanup succeeded; result.cleanupTestUsers contains the count
    } else {
      logger.warn('cleanupTestUsers did not return a count')
    }
  } catch (error) {
    logger.warn(
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
      logger.error(`Failed to create test user ${email}:`, error)
    }
  }

  return sessions
}

/** Promote user in client for UI tests (keeps backend-issued tokens). */
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

/** Create or promote an admin test user via debug mutation. */
export async function createAdminTestUser(
  email?: string,
  password: string = 'password',
  name: string = 'Admin Test User',
  phoneNumber: string = '',
): Promise<AuthResponse> {
  const mutation = `
    mutation DebugCreateAdminUser($email: String!, $password: String,
      $name: String, $phoneNumber: String) {
      debugCreateAdminUser(email: $email, password: $password, name: $name,
      phoneNumber: $phoneNumber) {
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
        // Use higher retries/timeouts for admin creation since it's used at
        // the start of integration tests and may encounter cold-starts.
        retries: 3,
        timeoutMs: 15000,
      })

      if (!result?.debugCreateAdminUser) {
        throw new Error(
          'debugCreateAdminUser not responding—backend running in debug mode?',
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
        localStorage.setItem('token', authResp.token)
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

//  Create and sign in a test user, set up the auth store and localStorage
//  for frontend tests. Returns the test user session.
export async function setupSignedInTestUser(
  email?: string,
  password: string = 'Password1!',
  name: string = 'Test User',
  phone: string = '555-123-4567',
): Promise<TestUserSession> {
  const testEmail = email || `test-${Date.now()}@example.com`
  await createTestUser(testEmail, password, name, phone)
  await signInTestUser(testEmail, password)
  const session = getTestUserSession(testEmail)
  if (!session) {
    throw new Error('Failed to get test user session')
  }
  useAuthStore.setState({ user: session.user, token: session.token })
  localStorage.setItem('token', session.token)
  return session
}
