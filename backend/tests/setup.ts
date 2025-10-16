import { config } from 'dotenv'
import { createServer } from 'net'
import { afterAll, beforeAll, vi } from 'vitest'

import { prisma } from '../src/client'
import { server } from '../src/server'
import logger from './utils/logger'

const checkPortInUse = (port: number): Promise<boolean> => {
  return new Promise((resolve) => {
    const testServer = createServer()
      .once('error', (err: any) => {
        if (err.code === 'EADDRINUSE') {
          resolve(true) // Port is in use
        } else {
          resolve(false)
        }
      })
      .once('listening', () => {
        testServer.close()
        resolve(false) // Port is free
      })
      .listen(port)
  })
}

// Load test environment variables
config()

// Suppress console.log and console.error in tests globally
// Use logger.info, logger.debug, etc. for debugging instead
const originalLog = console.log
const originalError = console.error
beforeAll(() => {
  console.log = vi.fn()
  console.error = vi.fn()
})

afterAll(() => {
  console.log = originalLog
  console.error = originalError
})

// Mock nodemailer
// Renamed to avoid conflict with the mock target
// import nodemailerMock from 'nodemailer-mock'

// Mock nodemailer to return an object with a createTransporter method
vi.mock('nodemailer', () => ({
  default: {
    createTransport: vi.fn(() => {
      // Ensure a global place to collect sent emails for tests to inspect
      ;(global as any).sentEmails = (global as any).sentEmails || []

      // Create a mock transporter object
      const mockTransporter: any = {
        sendMail: vi.fn().mockImplementation((mailOptions: any) => {
          // Push the sent email data into global.sentEmails
          ;(global as any).sentEmails.push(mailOptions)
          return Promise.resolve({
            messageId: 'mock-message-id',
            envelope: {
              from: mailOptions.from || 'test@example.com',
              to: mailOptions.to || ['user@example.com'],
            },
          })
        }),
      }
      return mockTransporter
    }),
  },
}))

// Global test database client
// Use imported prisma from src/client

beforeAll(async () => {
  // Set global test prisma for server context
  ;(global as any).testPrisma = prisma

  // Ensure roles exist (don't delete them)
  await prisma.userRole.upsert({
    where: { role: 'user' },
    update: {},
    create: { role: 'user' },
  })

  await prisma.userRole.upsert({
    where: { role: 'admin' },
    update: {},
    create: { role: 'admin' },
  })

  // Check if server is already running on port 4000
  const portInUse = await checkPortInUse(4000)
  // Track whether this setup started the server so we only close it if started
  ;(global as any).__testServerStartedByThisProcess = false
  if (!portInUse) {
    // Start the test server if not already running
    server.listen(4000)
    ;(global as any).__testServerStartedByThisProcess = true
    logger.info('Started test server on port 4000')
  } else {
    logger.info('Using existing server running on port 4000')
  }
})

afterAll(async () => {
  // Call the teardown script for cleanup
  const teardown = (await import('./teardown')).default
  await teardown()
  // Only close the server if this setup started it
  if ((global as any).__testServerStartedByThisProcess) {
    try {
      server.close()
    } catch (err) {
      logger.error('Error closing test server', err)
    }
  }
})

export { prisma }
