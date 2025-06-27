import axios from 'axios';

// Configure with your logging service URL
const LOGGING_SERVICE_URL = process.env.LOGGING_SERVICE_URL || '';

// Determine if we should attempt remote logging
const ENABLE_REMOTE_LOGGING = !!LOGGING_SERVICE_URL && process.env.NODE_ENV === 'production';

interface LogEntry {
  level: 'error' | 'warn' | 'info' | 'debug';
  message: string;
  context?: Record<string, any>;
  timestamp?: Date;
}

export const logger = {
  error: (message: string, context?: Record<string, any>) => {
    log({ level: 'error', message, context });
  },
  warn: (message: string, context?: Record<string, any>) => {
    log({ level: 'warn', message, context });
  },
  info: (message: string, context?: Record<string, any>) => {
    log({ level: 'info', message, context });
  },
  debug: (message: string, context?: Record<string, any>) => {
    log({ level: 'debug', message, context });
  }
};

async function log(entry: LogEntry) {
  const timestamp = new Date();
  const fullEntry = { ...entry, timestamp };
  
  // Log to console
  console[entry.level](`[${timestamp.toISOString()}] ${entry.level.toUpperCase()}: ${entry.message}`, entry.context || '');
  
  // Only attempt remote logging if enabled and URL is configured
  if (ENABLE_REMOTE_LOGGING) {
    try {
      // Send to remote logging service
      await axios.post(LOGGING_SERVICE_URL, fullEntry, {
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      // Don't log this error to avoid creating noise in development
      if (process.env.NODE_ENV === 'production') {
        console.error('Failed to send log to remote service:', error);
      }
    }
  }
}
