import { config } from 'dotenv';
import { PrismaClient } from '../src/generated/prisma/client';
import { jest, beforeAll, afterAll } from '@jest/globals';
// Load test environment variables
config({ path: '.env.test' });
// Mock nodemailer to return an object with a createTransporter method
jest.mock('nodemailer', () => ({
    createTransport: jest.fn(() => {
        // Create a mock transporter object
        const mockTransporter = {
            sendMail: jest.fn().mockImplementation(() => Promise.resolve({
                messageId: 'mock-message-id',
                envelope: {
                    from: 'test@example.com',
                    to: ['user@example.com'],
                },
            })),
        };
        return mockTransporter;
    }),
}));
// Global test database client
let prisma;
beforeAll(async () => {
    // Use a test database
    process.env.DATABASE_URL = 'file:./test.db';
    prisma = new PrismaClient();
    // Clean up test data only (users with @example.com emails)
    await prisma.user.deleteMany({
        where: {
            email: {
                endsWith: '@example.com',
            },
        },
    });
    // Ensure roles exist (don't delete them)
    await prisma.userRole.upsert({
        where: { role: 'user' },
        update: {},
        create: { role: 'user' },
    });
    await prisma.userRole.upsert({
        where: { role: 'admin' },
        update: {},
        create: { role: 'admin' },
    });
});
afterAll(async () => {
    await prisma.$disconnect();
});
export { prisma };
//# sourceMappingURL=setup.js.map