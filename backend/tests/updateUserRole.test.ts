import { describe, expect, it } from 'vitest'

import { prisma } from '../src/client'
import { yoga } from '../src/server'
import { createTestUserAndJwt } from './helpers'

// Tests focused on role updates
describe('updateUserRole mutation', () => {
  it('should reject non-admin users', async () => {
    const normalUser = await createTestUserAndJwt(
      { email: 'normal@example.com' },
      'password123',
      true,
    )

    const mutation = `
      mutation UpdateUserRole($data: UpdateUserRoleInput!) {
        updateUserRole(data: $data) {
          id
          email
          role
        }
      }
    `

    const response = await yoga.fetch('http://localhost:4000/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        authorization: `Bearer ${normalUser.jwt}`,
      },
      body: JSON.stringify({
        query: mutation,
        variables: { data: { userId: normalUser.user.id, role: 'admin' } },
      }),
    })

    const result = await response.json()
    expect(result.errors).toBeDefined()
    expect(result.errors[0].message).toContain('Admin access required')
  })

  it('should allow admin to change a user role', async () => {
    // Create admin user by setting role in DB (test-only helper)
    const adminUser = await createTestUserAndJwt(
      { email: 'admin-test@example.com' },
      'password123',
      true,
    )

    // Promote to admin directly in DB for test purposes
    await prisma.user.update({
      where: { id: adminUser.user.id },
      data: { role: 'admin' },
    })

    // Get a new JWT with the updated role by signing in again
    const signInMutation = `
      mutation SignIn($data: SignInInput!) {
        signIn(data: $data) {
          token
          user { id email name role }
        }
      }
    `
    const signInResponse = await yoga.fetch('http://localhost:4000/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: signInMutation,
        variables: {
          data: { email: 'admin-test@example.com', password: 'password123' },
        },
      }),
    })
    const signInResult = await signInResponse.json()
    expect(signInResult.data.signIn).not.toBeNull()
    const adminJwt = signInResult.data.signIn.token

    // Create a target user to promote
    const targetUser = await createTestUserAndJwt(
      { email: 'target@example.com' },
      'password123',
      true,
    )

    const mutation = `
      mutation UpdateUserRole($data: UpdateUserRoleInput!) {
        updateUserRole(data: $data) {
          id
          email
          role
        }
      }
    `

    const response = await yoga.fetch('http://localhost:4000/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        authorization: `Bearer ${adminJwt}`,
      },
      body: JSON.stringify({
        query: mutation,
        variables: { data: { userId: targetUser.user.id, role: 'admin' } },
      }),
    })

    const result = await response.json()
    expect(result.data.updateUserRole).toBeDefined()
    expect(result.data.updateUserRole.role).toBe('admin')
  })
})
