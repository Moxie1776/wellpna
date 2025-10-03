import { describe, it, expect } from '@jest/globals'
import { prisma } from '../src/client'

describe('Prisma Minimal Test', () => {
  it('should connect and count users', async () => {
    console.log('Jest DATABASE_URL:', process.env.DATABASE_URL)
    const count = await prisma.user.count()
    expect(typeof count).toBe('number')
  })
})
