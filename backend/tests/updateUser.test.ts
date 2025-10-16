import { describe, expect, it } from 'vitest'

import { prisma } from '../src/client'
import { yoga } from '../src/server'
import logger from '../src/utils/logger'
import { createTestUserAndJwt } from './helpers'

describe('updateUser mutation', () => {
  it('should reject unauthenticated requests', async () => {
    const mutation = `
      mutation UpdateUser($data: UpdateUserInput) {
        updateUser(data: $data) {
          id
          email
          name
          phoneNumber
        }
      }
    `

    const response = await yoga.fetch('http://localhost:4000/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: mutation,
        variables: {
          data: {
            name: 'Updated Name',
            phoneNumber: '555-987-6543',
          },
        },
      }),
    })

    const result = await response.json()
    // DEBUG: print full GraphQL response via logger (console.log suppressed)
    logger.info('DEBUG updateUser full response: ' + JSON.stringify(result))

    expect(result.errors).toBeDefined()
    expect(result.errors[0].message).toContain('Authentication required')
  })

  it('should update user data when authenticated - full update', async () => {
    const testUser = await createTestUserAndJwt(
      { email: 'fullupdate@example.com' },
      'password123',
      true,
    )

    const mutation = `
      mutation UpdateUser($data: UpdateUserInput) {
        updateUser(data: $data) {
          id
          email
          name
          phoneNumber
        }
      }
    `

    const response = await yoga.fetch('http://localhost:4000/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        authorization: `Bearer ${testUser.jwt}`,
      },
      body: JSON.stringify({
        query: mutation,
        variables: {
          data: {
            name: 'Updated Name',
            phoneNumber: '555-987-6543',
          },
        },
      }),
    })

    const result = await response.json()
    // DEBUG: log full GraphQL response for diagnosis
    logger.info('DEBUG updateUser partial response: ' + JSON.stringify(result))

    expect(result.data.updateUser).toBeDefined()
    expect(result.data.updateUser.name).toBe('Updated Name')
    expect(result.data.updateUser.phoneNumber).toBe('555-987-6543')

    // Verify the update in DB
    const updated = await prisma.user.findUnique({
      where: { id: testUser.user.id },
    })
    expect(updated?.name).toBe('Updated Name')
    expect(updated?.phoneNumber).toBe('555-987-6543')

    // No email change in this flow; skip validatedAt assertion
  })

  it('should update user data when authenticated - partial', async () => {
    // Create a verified user
    const testUser = await createTestUserAndJwt(
      {
        email: 'partialupdate@example.com',
        name: 'Original Name',
        phoneNumber: '555-111-2222',
      },
      'password123',
      true,
    )

    const mutation = `
      mutation UpdateUser($data: UpdateUserInput) {
        updateUser(data: $data) {
          id
          email
          name
          phoneNumber
        }
      }
    `

    const response = await yoga.fetch('http://localhost:4000/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        authorization: `Bearer ${testUser.jwt}`,
      },
      body: JSON.stringify({
        query: mutation,
        variables: {
          data: {
            name: 'Partially Updated Name',
            phoneNumber: '555-333-4444',
          },
        },
      }),
    })

    const result = await response.json()
    logger.info('DEBUG updateUser partial response: ' + JSON.stringify(result))

    expect(result.data.updateUser).toBeDefined()
    expect(result.data.updateUser.name).toBe('Partially Updated Name')
    expect(result.data.updateUser.phoneNumber).toBe('555-333-4444')
    expect(result.data.updateUser.email).toBe('partialupdate@example.com')

    // Verify the update in DB
    const updated = await prisma.user.findUnique({
      where: { id: testUser.user.id },
    })
    logger.info(
      'DEBUG updateUser partial DB record: ' + JSON.stringify(updated),
    )
    expect(updated?.name).toBe('Partially Updated Name')
    expect(updated?.phoneNumber).toBe('555-333-4444')
  })
})
