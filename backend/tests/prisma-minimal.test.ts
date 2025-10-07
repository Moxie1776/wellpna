import { describe, expect,it } from '@jest/globals'

import { prisma } from '../src/client'

describe('Prisma Minimal Test', () => {
  it('should connect and count users', async () => {
    const count = await prisma.user.count()
    expect(typeof count).toBe('number')
  })
})
