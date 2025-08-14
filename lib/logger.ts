type LogLevel = 'info' | 'warn' | 'error' | 'debug'

interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
  data?: any
  userId?: string
  requestId?: string
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development'

  private formatLog(level: LogLevel, message: string, data?: any, meta?: { userId?: string; requestId?: string }): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
      userId: meta?.userId,
      requestId: meta?.requestId
    }
  }

  info(message: string, data?: any, meta?: { userId?: string; requestId?: string }) {
    const logEntry = this.formatLog('info', message, data, meta)
    
    if (this.isDevelopment) {
      console.log(`ℹ️ [${logEntry.timestamp}] ${message}`, data || '')
    } else {
      console.log(JSON.stringify(logEntry))
    }
  }

  warn(message: string, data?: any, meta?: { userId?: string; requestId?: string }) {
    const logEntry = this.formatLog('warn', message, data, meta)
    
    if (this.isDevelopment) {
      console.warn(`⚠️ [${logEntry.timestamp}] ${message}`, data || '')
    } else {
      console.warn(JSON.stringify(logEntry))
    }
  }

  error(message: string, error?: Error | any, meta?: { userId?: string; requestId?: string }) {
    const logEntry = this.formatLog('error', message, {
      error: error instanceof Error ? {
        message: error.message,
        stack: error.stack,
        name: error.name
      } : error
    }, meta)
    
    if (this.isDevelopment) {
      console.error(`❌ [${logEntry.timestamp}] ${message}`, error)
    } else {
      console.error(JSON.stringify(logEntry))
    }
  }

  debug(message: string, data?: any, meta?: { userId?: string; requestId?: string }) {
    if (!this.isDevelopment) return
    
    const logEntry = this.formatLog('debug', message, data, meta)
    console.debug(`🐛 [${logEntry.timestamp}] ${message}`, data || '')
  }
}

export const logger = new Logger()

export function createRequestLogger(requestId: string) {
  return {
    info: (message: string, data?: any, userId?: string) => 
      logger.info(message, data, { requestId, userId }),
    warn: (message: string, data?: any, userId?: string) => 
      logger.warn(message, data, { requestId, userId }),
    error: (message: string, error?: Error | any, userId?: string) => 
      logger.error(message, error, { requestId, userId }),
    debug: (message: string, data?: any, userId?: string) => 
      logger.debug(message, data, { requestId, userId })
  }
}