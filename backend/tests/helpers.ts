import { prisma as _prisma } from '../src/client'
import { yoga } from '../src/server'

// Helper: generate test user data
export function generateTestUserData(
  overrides: Partial<{
    email: string
    name: string
    phoneNumber: string
  }> = {},
) {
  const timestamp = Date.now()
  const email = overrides.email || 'test-' + String(timestamp) + '@example.com'
  const name = overrides.name || `Test User ${timestamp}`
  const phoneNumber = overrides.phoneNumber || '555-000-0000'

  return { email, name, phoneNumber }
}

// Helper: create a user via GraphQL signUp mutation and optionally verify
export async function createTestUserAndJwt(
  overrides: Partial<{ email: string; name: string; phoneNumber: string }> = {},
  password = 'password123',
  verified = false,
) {
  const data = generateTestUserData(overrides)

  // signUp now returns a simple confirmation String (no token/user).
  // Tests should not select fields from signUp since the GraphQL type is
  // String.
  const signUpMutation = `
      mutation SignUp($data: SignUpInput!) {
        signUp(data: $data)
      }
    `

  const verifyMutation = `
    mutation VerifyEmail($data: VerifyEmailInput!) {
      verifyEmail(data: $data) { token user { id email name } }
    }
  `

  const getVerificationCodeQuery = `
    query GetVerificationCode($email: String!) {
      getVerificationCode(email: $email)
    }
  `

  // Sign up the user via GraphQL API
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
    throw new Error('Failed to signUp user: ' + JSON.stringify(result.errors))
  }

  // signUp returns a confirmation string. Fetch the created user from the
  // database for test helpers so callers receive the created user object.
  const signUpPayload = result.data.signUp
  let createdUser = null
  if (typeof signUpPayload === 'string') {
    // Load the user directly from the DB using Prisma
    createdUser = await _prisma.user.findUnique({
      where: { email: data.email },
    })
  } else {
    // If older behaviour or debug mode returns an object, try to use it
    createdUser = signUpPayload?.user ?? null
  }

  if (verified) {
    // Get verification code using debug query instead of intercepting emails
    const codeResponse = await yoga.fetch('http://localhost:4000/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: getVerificationCodeQuery,
        variables: { email: data.email },
      }),
    })
    const codeResult = await codeResponse.json()
    if (codeResult.errors) {
      throw new Error(
        'Failed to get verification code: ' + JSON.stringify(codeResult.errors),
      )
    }

    const code = codeResult.data.getVerificationCode
    if (!code) {
      throw new Error('No verification code returned')
    }

    // Verify the email via GraphQL API
    const verifyResp = await yoga.fetch('http://localhost:4000/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: verifyMutation,
        variables: { data: { email: data.email, code } },
      }),
    })
    const verifyRes = await verifyResp.json()
    if (verifyRes.errors) {
      throw new Error(
        'Failed to verify user: ' + JSON.stringify(verifyRes.errors),
      )
    }
    return {
      jwt: verifyRes.data.verifyEmail.token,
      user: verifyRes.data.verifyEmail.user,
    }
  }

  return { jwt: null, user: createdUser }
}
