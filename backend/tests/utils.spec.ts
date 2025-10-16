import { describe, expect,it } from 'vitest'

import { prisma } from '../src/client'
import { TestUtils } from './utils'

const utils = new TestUtils(prisma)

describe('TestUtils basic', () => {
  it('createTestUser signs up and returns a jwt and user', async () => {
    const email = `test-utils-${Date.now()}@example.com`
    const user = await utils.createTestUser({ email })
    expect(user).toBeDefined()
    expect(user.email).toBe(email)
    expect((user as any).jwt).toBeDefined()

    // cleanup
    await prisma.user.delete({ where: { id: user.id } })
  })

  it('createVerifiedTestUser verifies the user via API', async () => {
    const email = `test-utils-verified-${Date.now()}@example.com`
    const user = await utils.createVerifiedTestUser({ email })
    expect(user).toBeDefined()
    // validatedAt should be set
    expect((user as any).validatedAt).toBeTruthy()
    expect((user as any).jwt).toBeDefined()

    // cleanup
    await prisma.user.delete({ where: { id: user.id } })
  })
})
