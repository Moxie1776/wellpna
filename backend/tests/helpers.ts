import { prisma as _prisma } from '../src/client'
import { yoga } from '../src/server'

// Helper: generate test user data
export function generateTestUserData(
  overrides: Partial<{ email: string; name: string; phoneNumber: string }> = {},
) {
  const timestamp = Date.now()
  return {
    email: overrides.email || `test-${timestamp}@example.com`,
    name:
      overrides.name || `Test User ${timestamp}`,
    phoneNumber: overrides.phoneNumber || '555-000-0000',
  }
}

// Helper: create a user via GraphQL signUp mutation and optionally verify
export async function createTestUserAndJwt(
  overrides: Partial<{ email: string; name: string; phoneNumber: string }> = {},
  password = 'password123',
  verified = false,
) {
  const data = generateTestUserData(overrides)

  const signUpMutation = `
    mutation SignUp($data: SignUpInput!) {
      signUp(data: $data) {
        token
        user { id email name phoneNumber }
      }
    }
  `

  const verifyMutation = `
    mutation VerifyEmail($data: VerifyEmailInput!) {
      verifyEmail(data: $data) { token user { id email name } }
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

  const payload = result.data.signUp

  if (verified) {
    // Extract verification code from mocked emails
    const sentEmails: any[] = (global as any).sentEmails || []
    const verificationEmail = sentEmails.find((email) =>
      email.to.includes(data.email),
    )
    if (!verificationEmail) {
      throw new Error('Verification email not found')
    }

    // Assume the code is in the email html (mocked nodemailer)
    const codeMatch = verificationEmail.html?.match(/(\d{6})/)
    if (!codeMatch) {
      throw new Error('Verification code not found in email')
    }
    const code = codeMatch[1]

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

  return { jwt: null, user: payload.user }
}
