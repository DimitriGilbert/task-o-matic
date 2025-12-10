import {
  createStandardError,
  TaskOMaticErrorCodes,
} from "./task-o-matic-error";

/**
 * Extracts a readable error message from an unknown error value.
 * Handles Error objects, strings, objects with message property, and unknown types.
 *
 * @param error - The error value to extract message from
 * @returns A string error message
 *
 * @example
 * ```typescript
 * try {
 *   throw new Error("Something went wrong");
 * } catch (error) {
 *   console.log(getErrorMessage(error)); // "Something went wrong"
 * }
 * ```
 */
export function getErrorMessage(error: unknown): string {
  // Error instance
  if (error instanceof Error) {
    return error.message;
  }

  // String error
  if (typeof error === "string") {
    return error;
  }

  // Object with message property
  if (error && typeof error === "object" && "message" in error) {
    return String(error.message);
  }

  // Unknown type - convert to string
  return "Unknown error occurred";
}

/**
 * Formats an error with optional context information.
 * Useful for adding context to error messages when rethrowing.
 *
 * @param error - The error value
 * @param context - Optional context string to prepend to the error message
 * @returns Formatted error message
 *
 * @example
 * ```typescript
 * try {
 *   await fetchData();
 * } catch (error) {
 *   throw new Error(formatError(error, "Failed to fetch data"));
 *   // Result: "Failed to fetch data: Connection timeout"
 * }
 * ```
 */
export function formatError(error: unknown, context?: string): string {
  const message = getErrorMessage(error);
  return context ? `${context}: ${message}` : message;
}

/**
 * Creates an error with a formatted message including context.
 *
 * @param error - The original error
 * @param context - Context to add to the error
 * @returns A new TaskOMaticError instance with formatted message
 *
 * @example
 * ```typescript
 * try {
 *   await operation();
 * } catch (error) {
 *   throw createContextError(error, "Operation failed");
 * }
 * ```
 */
export function createContextError(
  error: unknown,
  context: string
): import("./task-o-matic-error").TaskOMaticError {
  return createStandardError(
    TaskOMaticErrorCodes.UNEXPECTED_ERROR,
    formatError(error, context),
    { cause: error instanceof Error ? error : undefined }
  );
}

/**
 * Type guard to check if an error is an Error instance.
 *
 * @param error - Value to check
 * @returns true if error is an Error instance
 */
export function isError(error: unknown): error is Error {
  return error instanceof Error;
}

/**
 * Safely converts any value to an Error instance.
 * If the value is already an Error, returns it unchanged.
 * Otherwise, creates a new Error with the string representation.
 *
 * @param error - Value to convert
 * @returns An Error instance
 */
export function toError(
  error: unknown
): import("./task-o-matic-error").TaskOMaticError {
  if (error instanceof Error) {
    return createStandardError(
      TaskOMaticErrorCodes.UNEXPECTED_ERROR,
      error.message,
      { cause: error }
    );
  }
  return createStandardError(
    TaskOMaticErrorCodes.UNEXPECTED_ERROR,
    getErrorMessage(error)
  );
}
