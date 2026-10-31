/**
 * Structured Enterprise Logger
 * Formats server events with timestamps, levels, and contextual metadata.
 * Automatically silences informational logs in test mode for clean CI runs.
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

class Logger {
  private isTest = process.env.NODE_ENV === 'test';

  private formatMessage(level: LogLevel, message: string, meta?: Record<string, unknown>): string {
    const timestamp = new Date().toISOString();
    const metaStr = meta ? ` ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${metaStr}`;
  }

  debug(message: string, meta?: Record<string, unknown>): void {
    if (this.isTest && !process.env.DEBUG) return;
    console.debug(this.formatMessage('debug', message, meta));
  }

  info(message: string, meta?: Record<string, unknown>): void {
    if (this.isTest && !process.env.DEBUG) return;
    console.info(this.formatMessage('info', message, meta));
  }

  warn(message: string, meta?: Record<string, unknown>): void {
    console.warn(this.formatMessage('warn', message, meta));
  }

  error(message: string, error?: unknown, meta?: Record<string, unknown>): void {
    const errObj = error instanceof Error ? { errorName: error.name, message: error.message, stack: error.stack } : { rawError: error };
    console.error(this.formatMessage('error', message, { ...meta, ...errObj }));
  }
}

export const logger = new Logger();
