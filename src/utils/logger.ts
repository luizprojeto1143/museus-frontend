/**
 * Structured logger for Cultura Viva.
 *
 * - Debug logs are suppressed in production automatically.
 * - Each log includes a module context tag for easy filtering.
 * - Format: [LEVEL] [context] message { ...data }
 *
 * Usage:
 *   import { logger } from '@/utils/logger';
 *   const log = logger.forModule('GamificationContext');
 *   log.info('XP added', { amount: 50, total: 200 });
 */

const isDev = import.meta.env.DEV;

type LogLevel = "debug" | "info" | "warn" | "error";

interface LogEntry {
  level: LogLevel;
  context: string;
  message: string;
  data?: unknown;
  timestamp: string;
}

/** Formats and emits a log entry to the appropriate console method. */
function emit(entry: LogEntry): void {
  const { level, context, message, data, timestamp } = entry;
  const tag = `[${timestamp}] [${level.toUpperCase()}] [${context}]`;

  switch (level) {
    case "debug":
      if (isDev) console.debug(tag, message, ...(data !== undefined ? [data] : []));
      break;
    case "info":
      if (isDev) console.info(tag, message, ...(data !== undefined ? [data] : []));
      break;
    case "warn":
      console.warn(tag, message, ...(data !== undefined ? [data] : []));
      break;
    case "error":
      console.error(tag, message, ...(data !== undefined ? [data] : []));
      break;
  }
}

function makeEntry(level: LogLevel, context: string, message: string, data?: unknown): LogEntry {
  return {
    level,
    context,
    message,
    data,
    timestamp: new Date().toISOString().slice(11, 23), // HH:MM:SS.mmm
  };
}

/** Module-scoped logger. Binds the context tag for all log calls. */
export interface ModuleLogger {
  debug: (message: string, data?: unknown) => void;
  info: (message: string, data?: unknown) => void;
  warn: (message: string, data?: unknown) => void;
  error: (message: string, data?: unknown) => void;
}

export const logger = {
  /**
   * Creates a module-scoped logger.
   * @param context - Short identifier for the calling module, e.g. 'AuthContext'
   */
  forModule(context: string): ModuleLogger {
    return {
      debug: (message, data) => emit(makeEntry("debug", context, message, data)),
      info:  (message, data) => emit(makeEntry("info",  context, message, data)),
      warn:  (message, data) => emit(makeEntry("warn",  context, message, data)),
      error: (message, data) => emit(makeEntry("error", context, message, data)),
    };
  },

  // Convenience methods without context (fallback)
  debug: (msg: string, data?: unknown) => emit(makeEntry("debug", "App", msg, data)),
  info:  (msg: string, data?: unknown) => emit(makeEntry("info",  "App", msg, data)),
  warn:  (msg: string, data?: unknown) => emit(makeEntry("warn",  "App", msg, data)),
  error: (msg: string, data?: unknown) => emit(makeEntry("error", "App", msg, data)),
};
