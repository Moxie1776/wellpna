import { Logger } from '../graphql/types/logger'

const isTestEnv =
  typeof process !== 'undefined' &&
  process.env &&
  process.env.NODE_ENV === 'test'

const logger: Logger = {
  error: (message: string, ...args: any[]) => {
    if (isTestEnv) {
      console.error(`[ERROR] ${message}`, ...args)
    } else {
      console.error(`[${new Date().toISOString()}] ERROR: ${message}`, ...args)
    }
  },
  warn: (message: string, ...args: any[]) => {
    if (isTestEnv) {
      console.warn(`[WARN] ${message}`, ...args)
    } else {
      console.warn(`[${new Date().toISOString()}] WARN: ${message}`, ...args)
    }
  },
  info: (message: string, ...args: any[]) => {
    if (isTestEnv) {
      console.info(`[INFO] ${message}`, ...args)
    } else {
      console.info(`[${new Date().toISOString()}] INFO: ${message}`, ...args)
    }
  },
  debug: (message: string, ...args: any[]) => {
    if (isTestEnv) {
      console.debug(`[DEBUG] ${message}`, ...args)
    } else {
      console.debug(`[${new Date().toISOString()}] DEBUG: ${message}`, ...args)
    }
  },
}

export default logger
