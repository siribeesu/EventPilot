/* eslint-disable no-console */
/**
 * Structured Enterprise Logger
 * Formats server events with timestamps, levels, and contextual metadata.
 * Automatically silences informational logs in test mode for clean CI runs.
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

class Logger {
  private isTest = process.env.NODE_ENV === 'test';

  private formatMessage(level: LogLevel, message: string, meta?: unknown): string {
    const timestamp = new Date().toISOString();
    const metaStr = meta ? ` ${typeof meta === 'object' ? JSON.stringify(meta) : String(meta)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${metaStr}`;
  }

  debug(message: string, meta?: unknown): void {
    if (this.isTest && !process.env.DEBUG) return;
    console.debug(this.formatMessage('debug', message, meta));
  }

  info(message: string, meta?: unknown): void {
    if (this.isTest && !process.env.DEBUG) return;
    console.info(this.formatMessage('info', message, meta));
  }

  warn(message: string, meta?: unknown): void {
    console.warn(this.formatMessage('warn', message, meta));
  }

  error(message: string, error?: unknown, meta?: unknown): void {
    const errObj = error instanceof Error ? { errorName: error.name, message: error.message, stack: error.stack } : { rawError: error };
    const combined = typeof meta === 'object' && meta ? { ...meta, ...errObj } : { meta, ...errObj };
    console.error(this.formatMessage('error', message, combined));
  }
}

export const logger = new Logger();
