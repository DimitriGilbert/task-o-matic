import chalk from "chalk";

/**
 * Handle command errors with consistent formatting and exit behavior
 *
 * @param operationName - Name of the operation that failed (e.g., "Task enhancement", "Task execution")
 * @param error - The error that occurred
 * @returns Never returns (exits process with code 1)
 *
 * @example
 * ```typescript
 * catch (error) {
 *   handleCommandError("Task enhancement", error);
 * }
 * ```
 */
export function handleCommandError(
  operationName: string,
  error: unknown
): never {
  const message = error instanceof Error ? error.message : "Unknown error";
  console.error(chalk.red(`${operationName} failed:`), message);
  process.exit(1);
}

/**
 * Wrap a command handler function with automatic error handling
 *
 * @param operationName - Name of the operation for error messages
 * @param handler - The async command handler function
 * @returns Wrapped handler function with error handling
 *
 * @example
 * ```typescript
 * .action(wrapCommandHandler("Task enhancement", async (options) => {
 *   // command logic that might throw
 *   await taskService.enhanceTask(options.taskId);
 * }))
 * ```
 */
export function wrapCommandHandler<T extends any[]>(
  operationName: string,
  handler: (...args: T) => Promise<void>
): (...args: T) => Promise<void> {
  return async (...args: T) => {
    try {
      await handler(...args);
    } catch (error) {
      handleCommandError(operationName, error);
    }
  };
}
