import { getErrorMessage, formatError } from "./error-utils";

/**
 * TaskOMaticError - Standardized error class for TaskOMatic
 *
 * Provides consistent error handling with context, suggestions, and typing.
 * All errors in the system should use this class or one of the helper functions
 * to ensure consistent error reporting and debugging experience.
 *
 * @example Basic usage
 * ```typescript
 * throw new TaskOMaticError("Task not found", {
 *   code: "TASK_NOT_FOUND",
 *   context: "Attempted to retrieve task ID: 123",
 *   suggestions: [
 *     "Verify the task ID is correct",
 *     "Check if the task was deleted"
 *   ]
 * });
 * ```
 *
 * @example With cause chain
 * ```typescript
 * try {
 *   await storage.getTask(id);
 * } catch (error) {
 *   throw new TaskOMaticError("Failed to retrieve task", {
 *     code: "STORAGE_ERROR",
 *     cause: error instanceof Error ? error : new Error(String(error)),
 *     context: `Task ID: ${id}`,
 *     suggestions: ["Check storage permissions", "Verify storage is initialized"]
 *   });
 * }
 * ```
 *
 * @example With metadata
 * ```typescript
 * throw new TaskOMaticError("AI operation timed out", {
 *   code: "AI_OPERATION_FAILED",
 *   metadata: {
 *     operation: "task-breakdown",
 *     duration: 30000,
 *     retryAttempts: 3
 *   },
 *   suggestions: ["Increase timeout", "Check AI service status"]
 * });
 * ```
 */
export class TaskOMaticError extends Error {
  /**
   * Error code for categorization
   */
  code: string;

  /**
   * Additional context information
   */
  context?: string;

  /**
   * Actionable suggestions for resolving the error
   */
  suggestions?: string[];

  /**
   * Original error that caused this error (if applicable)
   */
  cause?: Error;

  /**
   * Timestamp when the error occurred
   */
  timestamp: number;

  /**
   * Additional metadata for debugging
   */
  metadata?: Record<string, unknown>;

  /**
   * Create a new TaskOMaticError
   *
   * @param message - Error message
   * @param options - Additional error options
   */
  constructor(
    message: string,
    options: {
      code: string;
      context?: string;
      suggestions?: string[];
      cause?: Error;
      metadata?: Record<string, unknown>;
    }
  ) {
    super(message);

    this.name = "TaskOMaticError";
    this.code = options.code;
    this.context = options.context;
    this.suggestions = options.suggestions;
    this.cause = options.cause;
    this.timestamp = Date.now();
    this.metadata = options.metadata;

    // Maintain proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, TaskOMaticError);
    }
  }

  /**
   * Get full error details as a formatted string
   */
  getDetails(): string {
    let details = `[${this.code}] ${this.message}`;

    if (this.context) {
      details += `\nContext: ${this.context}`;
    }

    if (this.suggestions && this.suggestions.length > 0) {
      details += `\nSuggestions:\n- ${this.suggestions.join("\n- ")}`;
    }

    if (this.cause) {
      details += `\nCaused by: ${this.cause.message}`;
    }

    if (this.metadata && Object.keys(this.metadata).length > 0) {
      details += `\nMetadata: ${JSON.stringify(this.metadata, null, 2)}`;
    }

    return details;
  }

  /**
   * Get error details as a structured object
   */
  toJSON(): {
    name: string;
    code: string;
    message: string;
    context?: string;
    suggestions?: string[];
    cause?: string;
    timestamp: number;
    metadata?: Record<string, unknown>;
    stack?: string;
  } {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      context: this.context,
      suggestions: this.suggestions,
      cause: this.cause?.message,
      timestamp: this.timestamp,
      metadata: this.metadata,
      stack: this.stack,
    };
  }
}

/**
 * Standard error codes for TaskOMatic
 */
export const TaskOMaticErrorCodes = {
  // General errors
  UNEXPECTED_ERROR: "TASK_O_MATIC_001",
  INVALID_INPUT: "TASK_O_MATIC_002",
  CONFIGURATION_ERROR: "TASK_O_MATIC_003",

  // Task-related errors
  TASK_NOT_FOUND: "TASK_O_MATIC_101",
  TASK_ALREADY_EXISTS: "TASK_O_MATIC_102",
  INVALID_TASK_STATUS: "TASK_O_MATIC_103",
  TASK_OPERATION_FAILED: "TASK_O_MATIC_104",

  // Storage errors
  STORAGE_ERROR: "TASK_O_MATIC_201",
  STORAGE_NOT_INITIALIZED: "TASK_O_MATIC_202",
  STORAGE_INTEGRITY_ERROR: "TASK_O_MATIC_203",

  // AI operation errors
  AI_OPERATION_FAILED: "TASK_O_MATIC_301",
  AI_CONFIGURATION_ERROR: "TASK_O_MATIC_302",
  AI_RATE_LIMIT: "TASK_O_MATIC_303",

  // Workflow errors
  WORKFLOW_VALIDATION_ERROR: "TASK_O_MATIC_401",
  WORKFLOW_EXECUTION_ERROR: "TASK_O_MATIC_402",

  // PRD errors
  PRD_PARSING_ERROR: "TASK_O_MATIC_501",
  PRD_GENERATION_ERROR: "TASK_O_MATIC_502",
  PRD_VALIDATION_ERROR: "TASK_O_MATIC_503",
} as const;

type TaskOMaticErrorCode =
  (typeof TaskOMaticErrorCodes)[keyof typeof TaskOMaticErrorCodes];

/**
 * Create a standardized error with context and suggestions
 *
 * Helper function to create TaskOMaticError instances with proper error codes
 * from the TaskOMaticErrorCodes constants.
 *
 * @param code - Error code from TaskOMaticErrorCodes
 * @param message - Human-readable error message
 * @param options - Additional error options
 * @returns Configured TaskOMaticError instance
 *
 * @example
 * ```typescript
 * throw createStandardError(
 *   TaskOMaticErrorCodes.TASK_NOT_FOUND,
 *   "Task with ID '123' not found",
 *   {
 *     context: "User attempted to retrieve non-existent task",
 *     suggestions: ["Verify task ID", "List all tasks to see available IDs"]
 *   }
 * );
 * ```
 */
export function createStandardError(
  code: TaskOMaticErrorCode,
  message: string,
  options: {
    context?: string;
    suggestions?: string[];
    cause?: Error;
    metadata?: Record<string, unknown>;
  } = {}
): TaskOMaticError {
  return new TaskOMaticError(message, {
    code,
    context: options.context,
    suggestions: options.suggestions,
    cause: options.cause,
    metadata: options.metadata,
  });
}

/**
 * Format an existing error into a TaskOMaticError with context and suggestions
 *
 * Useful for wrapping caught errors with additional context while preserving
 * the original error as the cause.
 *
 * @param error - Original error to wrap
 * @param code - Error code from TaskOMaticErrorCodes
 * @param options - Additional error options
 * @returns TaskOMaticError wrapping the original error
 *
 * @example
 * ```typescript
 * try {
 *   await dangerousOperation();
 * } catch (error) {
 *   throw formatStandardError(
 *     error,
 *     TaskOMaticErrorCodes.STORAGE_ERROR,
 *     {
 *       context: "Failed during task persistence",
 *       suggestions: ["Check disk space", "Verify write permissions"]
 *     }
 *   );
 * }
 * ```
 */
export function formatStandardError(
  error: unknown,
  code: TaskOMaticErrorCode,
  options: {
    context?: string;
    suggestions?: string[];
    metadata?: Record<string, unknown>;
  } = {}
): TaskOMaticError {
  const message = getErrorMessage(error);
  const cause = error instanceof Error ? error : undefined;

  return new TaskOMaticError(message, {
    code,
    context: options.context,
    suggestions: options.suggestions,
    cause,
    metadata: options.metadata,
  });
}

/**
 * Type guard for TaskOMaticError
 */
export function isTaskOMaticError(error: unknown): error is TaskOMaticError {
  return error instanceof TaskOMaticError;
}

/**
 * Common error formatting functions
 */

export function formatTaskNotFoundError(taskId: string): TaskOMaticError {
  return createStandardError(
    TaskOMaticErrorCodes.TASK_NOT_FOUND,
    `Task with ID "${taskId}" not found`,
    {
      context: `The task "${taskId}" could not be found in the storage.`,
      suggestions: [
        "Verify the task ID is correct",
        "Check if the task was deleted",
        "List all tasks to see available IDs",
      ],
    }
  );
}

export function formatInvalidStatusTransitionError(
  fromStatus: string,
  toStatus: string
): TaskOMaticError {
  return createStandardError(
    TaskOMaticErrorCodes.INVALID_TASK_STATUS,
    `Invalid status transition from "${fromStatus}" to "${toStatus}"`,
    {
      context: `Task status transitions must follow the workflow: todo -> in-progress -> completed.`,
      suggestions: [
        "Use a valid status transition",
        "Check the current task status",
        "Review the workflow documentation",
      ],
    }
  );
}

export function formatStorageError(
  operation: string,
  cause?: Error
): TaskOMaticError {
  return createStandardError(
    TaskOMaticErrorCodes.STORAGE_ERROR,
    `Storage operation "${operation}" failed`,
    {
      context: `The storage operation "${operation}" could not be completed.`,
      suggestions: [
        "Check storage permissions",
        "Verify storage configuration",
        "Review storage logs for details",
      ],
      cause,
    }
  );
}

export function formatAIOperationError(
  operation: string,
  cause?: Error
): TaskOMaticError {
  return createStandardError(
    TaskOMaticErrorCodes.AI_OPERATION_FAILED,
    `AI operation "${operation}" failed`,
    {
      context: `The AI operation "${operation}" could not be completed.`,
      suggestions: [
        "Check AI configuration",
        "Verify API keys and endpoints",
        "Review AI service status",
        "Check rate limits",
      ],
      cause,
    }
  );
}

/**
 * Backward compatibility wrapper
 * Maintains existing error handling patterns while using new error system
 */
export function wrapErrorForBackwardCompatibility(
  error: unknown,
  context?: string
): Error {
  if (isTaskOMaticError(error)) {
    return error;
  }

  if (error instanceof Error) {
    return error;
  }

  return new Error(formatError(error, context));
}
