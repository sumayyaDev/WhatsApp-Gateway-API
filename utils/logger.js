import winston from 'winston';
import path from 'path';
import config from '../config/config.js';
import { fileURLToPath } from 'url';
import fs from 'fs';

// === Winston logging system === //
// Helper functions: logInfo, logError, logWarn, logDebug, logHTTP

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure logs directory exists
if (!fs.existsSync(config.logging.logsDir)) {
  fs.mkdirSync(config.logging.logsDir, { recursive: true });
}

// Define log levels with colors
const customLevels = {
  levels: {
    error: 0,
    warn: 1,
    info: 2,
    debug: 3,
    http: 4,
  },
  colors: {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    debug: 'blue',
    http: 'cyan',
  },
};

// Custom format for console
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) =>
      `${info.timestamp} [${info.level}]: ${info.message} ${
        info.details ? JSON.stringify(info.details, null, 2) : ''
      }`
  )
);

// Custom format for file
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(
    (info) =>
      `${info.timestamp} [${info.level}]: ${info.message} ${
        info.details ? JSON.stringify(info.details, null, 2) : ''
      }`
  )
);

// Create logger
const logger = winston.createLogger({
  levels: customLevels.levels,
  format: fileFormat,
  defaultMeta: { service: 'whatsapp-backend' },
  transports: [
    // Console transport
    new winston.transports.Console({
      format: consoleFormat,
      level: config.logging.level,
    }),
    // File transport - all logs
    new winston.transports.File({
      filename: config.logging.logFile,
      level: config.logging.level,
      maxsize: 10485760, // 10MB
      maxFiles: 5,
    }),
    // File transport - error logs only
    new winston.transports.File({
      filename: path.join(config.logging.logsDir, 'error.log'),
      level: 'error',
      maxsize: 10485760,
      maxFiles: 5,
    }),
  ],
});

// Add colors to winston
winston.addColors(customLevels.colors);

export const logInfo = (message, details = {}) => {
  logger.info(message, { details });
};

export const logError = (message, error, details = {}) => {
  const errorDetails = {
    ...details,
    error: error?.message,
    stack: error?.stack,
  };
  logger.error(message, { details: errorDetails });
};

export const logWarn = (message, details = {}) => {
  logger.warn(message, { details });
};

export const logDebug = (message, details = {}) => {
  logger.debug(message, { details });
};

export const logHTTP = (message, details = {}) => {
  logger.log('http', message, { details });
};

export default logger;
