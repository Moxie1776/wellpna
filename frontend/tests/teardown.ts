/** Global teardown — clean test users created during tests. */
export default async function teardown() {
  // Dynamic import logger for teardown context
  const { default: logger } = await import('../src/utils/logger')

  try {
    // Use GraphQL debug mutation for cleanup
    // cleanup only available in debug backend
    const GRAPHQL_ENDPOINT =
      process.env.VITE_GRAPHQL_ENDPOINT || 'http://localhost:4000/graphql'

    const mutation = `
      mutation CleanupTestUsers($pattern: String!) {
        cleanupTestUsers(pattern: $pattern)
      }
    `

    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: mutation,
        variables: { pattern: '@example.com' },
      }),
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const result = await response.json()
    if (result.errors) {
      throw new Error(result.errors[0].message || 'GraphQL error')
    }

    const count = result.data?.cleanupTestUsers
    if (typeof count === 'number') {
      logger.info(`Global teardown: Cleaned up ${count} test users`)
    } else {
      logger.info('Global teardown: Cleanup completed (no count returned)')
    }
  } catch (error) {
    logger.info(
      `Global teardown: Cleanup failed - ${
        error instanceof Error ? error.message : 'Unknown error'
      }`,
    )
  }
}
