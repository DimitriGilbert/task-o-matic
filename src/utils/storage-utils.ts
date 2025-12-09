import { Task } from "../types/index.js";

/**
 * Ensures a task is not null, throwing an error if it is.
 * Useful for enforcing null checks after storage operations.
 *
 * @param task - Task that may be null
 * @param taskId - ID of the task for error message
 * @returns The task if not null
 * @throws Error if task is null
 *
 * @example
 * ```typescript
 * const task = await storage.getTask(taskId);
 * const validTask = requireTask(task, taskId);
 * console.log(validTask.title); // Safe - never null
 * ```
 */
export function requireTask(task: Task | null, taskId: string): Task {
  if (!task) {
    throw new Error(`Task not found: ${taskId}`);
  }
  return task;
}

/**
 * Ensures multiple tasks are not null, throwing an error if any is null.
 *
 * @param tasks - Array of tasks that may contain nulls
 * @param context - Context for error message (e.g., "subtasks", "dependencies")
 * @returns Array of tasks with nulls filtered out
 * @throws Error if any task is null
 */
export function requireTasks(
  tasks: (Task | null)[],
  context: string = "tasks"
): Task[] {
  const validTasks: Task[] = [];
  const missingIds: string[] = [];

  tasks.forEach((task, index) => {
    if (!task) {
      missingIds.push(`index ${index}`);
    } else {
      validTasks.push(task);
    }
  });

  if (missingIds.length > 0) {
    throw new Error(`Missing ${context}: ${missingIds.join(", ")}`);
  }

  return validTasks;
}

/**
 * Filters out null tasks from an array, with type narrowing.
 *
 * @param tasks - Array of tasks that may contain nulls
 * @returns Array of tasks with nulls removed
 *
 * @example
 * ```typescript
 * const tasks = await Promise.all(ids.map(id => storage.getTask(id)));
 * const validTasks = filterNullTasks(tasks);
 * // validTasks has type Task[] (no null)
 * ```
 */
export function filterNullTasks(tasks: (Task | null)[]): Task[] {
  return tasks.filter((task): task is Task => task !== null);
}

/**
 * Validates that a task ID is a non-empty string.
 *
 * @param taskId - Task ID to validate
 * @throws Error if task ID is invalid
 */
export function validateTaskId(taskId: string): void {
  if (!taskId || typeof taskId !== "string" || !taskId.trim()) {
    throw new Error("Invalid task ID: must be a non-empty string");
  }
}
