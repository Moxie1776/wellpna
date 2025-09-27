import winston from 'winston';
import 'winston-daily-rotate-file';

const { combine, timestamp, json, errors } = winston.format;

const fileRotateTransport = new winston.transports.DailyRotateFile({
  filename: 'frontend-error-%DATE%.log',
  dirname: 'frontend/logs',
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d',
  level: 'error',
});

export const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: combine(errors({ stack: true }), timestamp(), json()),
  transports: [
    new winston.transports.Console({
      format: combine(winston.format.colorize(), winston.format.simple()),
    }),
    fileRotateTransport,
  ],
});
