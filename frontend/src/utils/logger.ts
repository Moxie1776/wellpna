import { Logger } from '../graphql/types/logger'

const isTestEnv =
  typeof process !== 'undefined' &&
  process.env &&
  // Treat vitest and debug runs test-like for logger output stable for tests
  (process.env.NODE_ENV === 'test' ||
    process.env.NODE_ENV === 'debug' ||
    (process.env as any).VITEST === 'true')

const logger: Logger = {
  error: (message: string, ...args: any[]) => {
    const out = isTestEnv
      ? `[ERROR] ${message}`
      : `[${new Date().toISOString()}] ERROR: ${message}`
    // Use console.error so test spies (vi.spyOn(console, 'error')) work
    // and avoid recursive calls to logger.error.
    // Keep args forwarded for structured logging.
    // eslint-disable-next-line no-console
    ;(globalThis as any).console.error(out, ...args)
  },
  warn: (message: string, ...args: any[]) => {
    const out = isTestEnv
      ? `[WARN] ${message}`
      : `[${new Date().toISOString()}] WARN: ${message}`
    // eslint-disable-next-line no-console
    ;(globalThis as any).console.warn(out, ...args)
  },
  info: (message: string, ...args: any[]) => {
    const out = isTestEnv
      ? `[INFO] ${message}`
      : `[${new Date().toISOString()}] INFO: ${message}`
    // eslint-disable-next-line no-console
    ;(globalThis as any).console.info(out, ...args)
  },
  debug: (message: string, ...args: any[]) => {
    const out = isTestEnv
      ? `[DEBUG] ${message}`
      : `[${new Date().toISOString()}] DEBUG: ${message}`
    // eslint-disable-next-line no-console
    ;(globalThis as any).console.debug(out, ...args)
  },
}

export default logger
