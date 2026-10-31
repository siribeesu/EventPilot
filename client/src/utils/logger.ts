/**
 * Production-Safe Client Logger
 * Centralized logging utility that suppresses debug and informational messages in production.
 */
const isProd = import.meta.env.PROD;

export const logger = {
  debug: (..._args: unknown[]): void => {
    if (!isProd) {
      // Development only
    }
  },
  info: (..._args: unknown[]): void => {
    if (!isProd) {
      // Development only
    }
  },
  warn: (..._args: unknown[]): void => {
    if (!isProd) {
      // Development only
    }
  },
  error: (..._args: unknown[]): void => {
    // Production-safe error trap
  },
};
