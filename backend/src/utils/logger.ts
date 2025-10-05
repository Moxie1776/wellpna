import path from 'path'
import winston from 'winston'

const logFormat = winston.format.printf(({ level, message, timestamp }) => {
  return `${timestamp} [${level.toUpperCase()}]: ${message}`
})

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(winston.format.timestamp(), logFormat),
  transports: [
    new winston.transports.File({
      filename: path.join(
        __dirname,
        '../../../logs',
        `${new Date().toISOString().split('T')[0]}.log`,
      ),
      level: 'error',
    }),
    new winston.transports.Console(),
  ],
})

export default logger
