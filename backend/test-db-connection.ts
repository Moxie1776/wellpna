// test-db-connection.ts
import { getPrisma } from './src/client.js'

async function testDatabaseConnection() {
  try {
    console.log('🧪 Testing database connection...')

    // First, let's check what the database URL looks like
    const secretManager = (await import('./src/utils/secret.js')).default
    const dbUrl = await secretManager.getDatabaseUrl()
    console.log('📋 Database URL:', dbUrl)

    const prisma = await getPrisma()

    // Test basic connection with a simple query
    const result = await prisma.$queryRaw`SELECT 1 as test`
    console.log('✅ Database connection successful')
    console.log('   Query result:', result)

    // Test if we can access the users table (if it exists)
    try {
      const userCount = await prisma.user.count()
      console.log('✅ Users table accessible')
      console.log('   Total users:', userCount)
    } catch (error) {
      console.log(
        '⚠️  Users table not accessible ' +
          '(this is expected if migrations haven\'t run)',
      )
      console.log(
        '   Error:',
        error instanceof Error ? error.message : String(error),
      )
    }

    console.log('🎉 Database connection test completed!')
  } catch (error) {
    console.error('❌ Database connection failed:', error)
    process.exit(1)
  }
}

testDatabaseConnection()
