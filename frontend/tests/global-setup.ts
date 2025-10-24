// Global setup for Vitest: set env vars, wait for GraphQL probe,
// and run queued cleanups at teardown.

import { logger } from '../src/utils'

process.env.VITE_GRAPHQL_ENDPOINT =
  process.env.VITE_GRAPHQL_ENDPOINT || 'http://localhost:4000/graphql'
process.env.NODE_ENV = process.env.NODE_ENV || 'debug'

const GRAPHQL_URL = process.env.VITE_GRAPHQL_ENDPOINT
const PROBE_TIMEOUT_MS = 30_000
const PROBE_INTERVAL_MS = 500

async function probeGraphQL(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: '{ __typename }' }),
    })
    return res.ok
  } catch {
    return false
  }
}

export default async function globalSetup() {
  // Wait for the GraphQL endpoint to respond (best-effort). Tests assume
  // a debug backend is running at GRAPHQL_URL. We probe for up to
  // PROBE_TIMEOUT_MS and proceed even if the probe never succeeds.
  const start = Date.now()
  while (Date.now() - start < PROBE_TIMEOUT_MS) {
    if (await probeGraphQL(GRAPHQL_URL)) {
      logger.debug('GraphQL endpoint is responding:', GRAPHQL_URL)
      break
    }

    await new Promise((r) => setTimeout(r, PROBE_INTERVAL_MS))
  }

  // Run cleanup at the start to ensure clean state
  try {
    const utils = await import('./utils/testUsers')
    if (utils && typeof utils.runQueuedCleanups === 'function') {
      // Enqueue a cleanup for all test emails and run it immediately
      utils.enqueueCleanup('@example.com')
      await utils.runQueuedCleanups()
      logger.debug('Ran initial test user cleanup')
    }
  } catch {
    // best-effort
  }

  return async function globalTeardown() {
    try {
      // Import dynamically to avoid pulling test helper bundles transform step.
      const utils = await import('./utils/testUsers')
      if (utils && typeof utils.runQueuedCleanups === 'function') {
        await utils.runQueuedCleanups()

        logger.debug('Ran queued test user cleanups')
      }
    } catch {
      // best-effort teardown
    }
    // Also call the standalone teardown script if present. Some CI setups
    // prefer a separate teardown file that calls the GraphQL cleanup mutation.
    try {
      const teardown = await import('./teardown')
      if (teardown && typeof teardown.default === 'function') {
        await teardown.default()
        logger.debug('Ran external teardown script')
      }
    } catch (err) {
      // Don't fail teardown; log and continue
      logger.debug('External teardown script not run:', err instanceof Error ? err.message : String(err))
    }
  }
}
