// auto-sort-ignore-next

// import fs from 'fs'
// import path from 'path'

// const LOG_DIR = path.resolve(__dirname, '../../logs')
// const ERROR_LOG_FILE = path.join(LOG_DIR, 'logger-error.log')

// function writeErrorLog(message: string) {
//   const logEntry = `[${new Date().toISOString()}] [ERROR] ${message}\n`
//   fs.appendFile(ERROR_LOG_FILE, logEntry, (err) => {
//     if (err) console.error('Failed to write error log:', err)
//   })
// }

const logger = {
  error: (message: string, ...args: any[]) => {
    console.error(`[ERROR] ${message}`, ...args)
    // writeErrorLog(`${message} ${args.map((a) => JSON.stringify(a)).join(' ')}`)
  },
  warn: (message: string, ...args: any[]) => {
    console.warn(`[WARN] ${message}`, ...args)
  },
  info: (message: string, ...args: any[]) => {
    console.info(`[INFO] ${message}`, ...args)
  },
  debug: (message: string, ...args: any[]) => {
    console.debug(`[DEBUG] ${message}`, ...args)
  },
}

export default logger
