// Global setup for Vitest: set env vars, wait for GraphQL probe,
// and run queued cleanups at teardown.

// no runtime logger usage in global setup; keep file minimal

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
  // Wait up to PROBE_TIMEOUT_MS for GraphQL endpoint; proceed if unreachable.
  const start = Date.now()
  while (Date.now() - start < PROBE_TIMEOUT_MS) {
    if (await probeGraphQL(GRAPHQL_URL)) {
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
    }
  } catch {
    // best-effort
  }

  return async function globalTeardown() {
    try {
      // Run queued cleanups if available
      const utils = await import('./utils/testUsers')
      if (utils && typeof utils.runQueuedCleanups === 'function') {
        await utils.runQueuedCleanups()
      }
    } catch {
      // best-effort
    }
    // Run external teardown script if present
    try {
      const teardown = await import('./teardown')
      if (teardown && typeof teardown.default === 'function') {
        await teardown.default()
      }
    } catch {
      // Don't fail teardown
    }
  }
}
