import winston from 'winston';
import path from 'path';

// Create a custom format for log messages
const logFormat = winston.format.printf(({ level, message, timestamp }) => {
  return `${timestamp} [${level.toUpperCase()}]: ${message}`;
});

// Create the logger instance
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(), // Add timestamp to log messages
    logFormat
  ),
  transports: [
    // Write all logs with level `info` and below to `logs/test-YYYY-MM-DD.log`
    new winston.transports.File({
      filename: path.join(
        __dirname,
        '../../logs',
        `test-${new Date().toISOString().split('T')[0]}.log`
      ),
      level: 'info',
    }),
    // Write all logs to the console
    new winston.transports.Console(),
  ],
});

export default logger;
