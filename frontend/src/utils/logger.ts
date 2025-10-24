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
    if (isTestEnv) {
      logger.error(`[ERROR] ${message}`, ...args)
    } else {
      logger.error(`[${new Date().toISOString()}] ERROR: ${message}`, ...args)
    }
  },
  warn: (message: string, ...args: any[]) => {
    if (isTestEnv) {
      logger.warn(`[WARN] ${message}`, ...args)
    } else {
      logger.warn(`[${new Date().toISOString()}] WARN: ${message}`, ...args)
    }
  },
  info: (message: string, ...args: any[]) => {
    if (isTestEnv) {
      logger.info(`[INFO] ${message}`, ...args)
    } else {
      logger.info(`[${new Date().toISOString()}] INFO: ${message}`, ...args)
    }
  },
  debug: (message: string, ...args: any[]) => {
    if (isTestEnv) {
      logger.debug(`[DEBUG] ${message}`, ...args)
    } else {
      logger.debug(`[${new Date().toISOString()}] DEBUG: ${message}`, ...args)
    }
  },
}

export default logger
