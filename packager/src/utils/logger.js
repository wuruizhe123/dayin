import winston from 'winston';
import fs from 'fs';
import path from 'path';

const logDir = path.join(process.cwd(), 'packager', 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

export const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.printf(({ timestamp, level, message }) => {
      return `${timestamp} [${level.toUpperCase()}] ${message}`;
    })
  ),
  transports: [
    new winston.transports.File({
      filename: path.join(logDir, 'packager.log'),
      maxsize: 5 * 1024 * 1024,
      maxFiles: 5,
      tailable: true
    }),
    new winston.transports.File({
      filename: path.join(logDir, 'packager-error.log'),
      level: 'error',
      maxsize: 5 * 1024 * 1024,
      maxFiles: 5,
      tailable: true
    })
  ]
});

export const logToConsole = (message, level = 'info') => {
  const colors = {
    info: '\x1b[34m',
    success: '\x1b[32m',
    warning: '\x1b[33m',
    error: '\x1b[31m',
    debug: '\x1b[36m'
  };
  const reset = '\x1b[0m';
  console.log(`${colors[level] || colors.info}[${level.toUpperCase()}] ${message}${reset}`);
};