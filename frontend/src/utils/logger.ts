import { Logger } from '../graphql/types/logger'

const isTestEnv =
  typeof process !== 'undefined' &&
  process.env &&
  (process.env.NODE_ENV === 'test' || (process.env as any).VITEST === 'true')

const makeOut = (level: string, msg: string) =>
  isTestEnv
    ? `[${level}] ${msg}`
    : `[${new Date().toISOString()}] ${level}: ${msg}`

const loggerImpl: Logger = {
  error: (message: string, ...args: any[]) => {
    ;(globalThis as any).console.error(
      makeOut('ERROR', String(message)),
      ...args,
    )
  },
  warn: (message: string, ...args: any[]) => {
    ;(globalThis as any).console.warn(makeOut('WARN', String(message)), ...args)
  },
  info: (message: string, ...args: any[]) => {
    ;(globalThis as any).console.info(makeOut('INFO', String(message)), ...args)
  },
  debug: (message: string, ...args: any[]) => {
    ;(globalThis as any).console.debug(
      makeOut('DEBUG', String(message)),
      ...args,
    )
  },
}

export const logger = loggerImpl
export default loggerImpl
