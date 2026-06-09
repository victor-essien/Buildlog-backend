
import winston from 'winston';
import path from 'path';
import fs from 'fs';

// Create logs directory if it doesn't exist
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

/**
 * Custom log format
 */
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

/**
 * Console log format (colorized for development)
 */
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let msg = `${timestamp} [${level}]: ${message}`;

    // Add metadata if present
    if (Object.keys(meta).length > 0) {
      msg += ` ${JSON.stringify(meta, null, 2)}`;
    }

    return msg;
  })
);

/**
 * Log levels
 * error: 0, warn: 1, info: 2, http: 3, verbose: 4, debug: 5, silly: 6
 */
const level = () => {
  const env = process.env.NODE_ENV || 'development';
  const isDevelopment = env === 'development';
  return isDevelopment ? 'debug' : 'info';
};

/**
 * Define transports
 */
const transports: winston.transport[] = [
  // Console transport
  new winston.transports.Console({
    format: consoleFormat,
  }),

  // Error log file
  new winston.transports.File({
    filename: path.join(logsDir, process.env.LOG_FILE_ERROR || 'error.log'),
    level: 'error',
    maxsize: 10485760, // 10MB
    maxFiles: 7, // Keep 7 days of logs
  }),

  // Combined log file
  new winston.transports.File({
    filename: path.join(
      logsDir,
      process.env.LOG_FILE_COMBINED || 'combined.log'
    ),
    maxsize: 10485760, // 10MB
    maxFiles: 7, // Keep 7 days of logs
  }),
];

/**
 * Create Winston logger instance
 */
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || level(),
  format: logFormat,
  transports,
  exitOnError: false,
});

/**
 * Stream for Morgan HTTP logging
 */
export const morganStream = {
  write: (message: string) => {
    logger.http(message.trim());
  },
};

/**
 * Log authentication events
 */
export const logAuth = (
  event: 'signup' | 'login' | 'logout' | 'password_reset' | 'token_refresh',
  userId?: string,
  details?: any
) => {
  logger.info('Auth Event', {
    event,
    userId,
    timestamp: new Date(),
    ...details,
  });
};