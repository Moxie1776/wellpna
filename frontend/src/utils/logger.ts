interface Logger {
  error: (message: string, ...args: any[]) => void
  warn: (message: string, ...args: any[]) => void
  info: (message: string, ...args: any[]) => void
  debug: (message: string, ...args: any[]) => void
}

const logger: Logger = {
  error: (message: string, ...args: any[]) => {
    console.error(`[${new Date().toISOString()}] ERROR: ${message}`, ...args)
  },
  warn: (message: string, ...args: any[]) => {
    console.warn(`[${new Date().toISOString()}] WARN: ${message}`, ...args)
  },
  info: (message: string, ...args: any[]) => {
    console.info(`[${new Date().toISOString()}] INFO: ${message}`, ...args)
  },
  debug: (message: string, ...args: any[]) => {
    console.debug(`[${new Date().toISOString()}] DEBUG: ${message}`, ...args)
  },
}

export default logger
