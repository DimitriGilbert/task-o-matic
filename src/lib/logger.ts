/**
 * Logger - Thin wrapper that emits log events to the hooks system
 *
 * This decouples logging from direct console output, allowing:
 * - CLI to render styled chalk output by subscribing to events
 * - Web/TUI to handle logs differently
 * - Testing without console pollution
 */

import { hooks } from "./hooks";

export interface Logger {
  info(message: string, context?: Record<string, unknown>): void;
  warn(message: string, context?: Record<string, unknown>): void;
  error(message: string, context?: Record<string, unknown>): void;
  success(message: string, context?: Record<string, unknown>): void;
  progress(message: string, context?: Record<string, unknown>): void;
}

/**
 * Event-based logger that emits to the hooks system
 */
export const logger: Logger = {
  info(message: string, context?: Record<string, unknown>) {
    hooks.emit("log:info", { message, context });
  },

  warn(message: string, context?: Record<string, unknown>) {
    hooks.emit("log:warn", { message, context });
  },

  error(message: string, context?: Record<string, unknown>) {
    hooks.emit("log:error", { message, context });
  },

  success(message: string, context?: Record<string, unknown>) {
    hooks.emit("log:success", { message, context });
  },

  progress(message: string, context?: Record<string, unknown>) {
    hooks.emit("log:progress", { message, context });
  },
};
