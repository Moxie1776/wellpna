import fs from 'fs'
import path from 'path'
import winston from 'winston'
import Transport from 'winston-transport'

const logFormat = winston.format.printf(({ level, message, timestamp }) => {
  return `${timestamp} [${level.toUpperCase()}]: ${message}`
})

// Custom transport to log to files organized by level and date
class DailyLevelFileTransport extends Transport {
  constructor(opts: any) {
    super(opts)
    this.source = opts.source || 'backend'
  }

  source: string

  log(info: any, callback: () => void) {
    const date = new Date().toISOString().split('T')[0]
    const level = info.level
    const dir = path.join(__dirname, '../../../logs', this.source, level)
    const filename = path.join(dir, `${date}.log`)

    // Ensure directory exists
    fs.mkdirSync(dir, { recursive: true })

    const logEntry = `${info.timestamp} [${level.toUpperCase()}]: ${
      info.message
    }\n`

    fs.appendFile(filename, logEntry, (err) => {
      if (err) {
        process.stderr.write('Failed to write log: ' + String(err) + '\n')
      }
    })

    callback()
  }
}

const logger = winston.createLogger({
  level: 'debug',
  format: winston.format.combine(winston.format.timestamp(), logFormat),
  transports: [
    new DailyLevelFileTransport({ source: 'backend' }),
    new winston.transports.Console(),
  ],
})

export default logger
