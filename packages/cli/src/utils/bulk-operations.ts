import chalk from "chalk";
import { taskService, Task } from "@task-o-matic/core";

/**
 * Configuration for bulk operation execution
 */
export interface BulkOperationConfig<T = void> {
  /** Name of the operation (e.g., "Enhancing", "Splitting") */
  operationName: string;

  /** Emoji to display before operation name (optional) */
  operationEmoji?: string;

  /** Custom success message function (optional) */
  successMessage?: (taskId: string, result: T) => string;

  /** Custom error message function (optional) */
  errorMessage?: (taskId: string, error: Error) => string;

  /** Optional filters for task selection */
  filters?: {
    status?: string;
    tag?: string;
  };
}

/**
 * Result of a bulk operation execution
 */
export interface BulkOperationResult {
  /** Task IDs that succeeded */
  succeeded: string[];

  /** Tasks that failed with their errors */
  failed: Array<{ id: string; error: Error }>;
}

/**
 * Execute an operation on multiple tasks with consistent error handling and progress reporting
 *
 * @param operation - The async function to execute for each task
 * @param config - Configuration for the bulk operation
 * @returns Result containing succeeded and failed task IDs
 *
 * @example
 * ```typescript
 * const result = await executeBulkOperation(
 *   (taskId) => taskService.enhanceTask(taskId),
 *   {
 *     operationName: "Enhancing",
 *     operationEmoji: "🤖",
 *     filters: { status: "todo", tag: "bug" },
 *   }
 * );
 * ```
 */
export async function executeBulkOperation<T>(
  operation: (taskId: string) => Promise<T>,
  config: BulkOperationConfig<T>
): Promise<BulkOperationResult> {
  // Fetch tasks with optional filters
  const tasks = await taskService.listTasks(config.filters || {});

  if (tasks.length === 0) {
    console.log(
      chalk.yellow(`No tasks found to ${config.operationName.toLowerCase()}`)
    );
    return { succeeded: [], failed: [] };
  }

  const emoji = config.operationEmoji || "🔄";
  console.log(
    chalk.blue(`${emoji} ${config.operationName} ${tasks.length} tasks...`)
  );

  const succeeded: string[] = [];
  const failed: Array<{ id: string; error: Error }> = [];

  // Process each task
  for (let i = 0; i < tasks.length; i++) {
    const task = tasks[i];
    console.log(
      chalk.cyan(
        `\n[${i + 1}/${tasks.length}] ${config.operationName} ${task.title}`
      )
    );

    try {
      const result = await operation(task.id);
      succeeded.push(task.id);

      const msg = config.successMessage
        ? config.successMessage(task.id, result)
        : `✓ ${config.operationName} task ${task.id}`;
      console.log(chalk.green(msg));
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      failed.push({ id: task.id, error: err });

      const msg = config.errorMessage
        ? config.errorMessage(task.id, err)
        : `❌ Failed to ${config.operationName.toLowerCase()} ${task.id}: ${
            err.message
          }`;
      console.log(chalk.red(msg));
    }
  }

  // Print summary
  console.log(chalk.blue(`\n${"=".repeat(60)}`));
  console.log(chalk.green(`✓ ${succeeded.length} tasks succeeded`));
  if (failed.length > 0) {
    console.log(chalk.red(`❌ ${failed.length} tasks failed`));
  }
  console.log(chalk.blue(`${"=".repeat(60)}\n`));

  return { succeeded, failed };
}
