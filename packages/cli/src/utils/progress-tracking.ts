import { hooks } from "task-o-matic-core";

/**
 * Progress event payload from AI operations
 */
export interface ProgressEvent {
  taskId?: string;
  operation?: string;
  step?: string;
  progress?: number;
  message?: string;
  phase?: string;
  [key: string]: any;
}

/**
 * Display progress information to the console
 */
function displayProgress(payload: ProgressEvent): void {
  const { operation, step, message, phase } = payload;

  if (phase) {
    console.log(`[${phase}]`, message || step || operation || "");
  } else if (operation && step) {
    console.log(`${operation}: ${step}`);
  } else if (message) {
    console.log(message);
  }
}

/**
 * Execute an async function with automatic progress tracking
 * Registers a progress handler, executes the function, and cleans up
 *
 * @param fn - The async function to execute with progress tracking
 * @returns The result of the function
 *
 * @example
 * ```typescript
 * const result = await withProgressTracking(async () => {
 *   return await taskService.enhanceTask(taskId);
 * });
 * ```
 */
export async function withProgressTracking<T>(
  fn: () => Promise<T>
): Promise<T> {
  const progressHandler = (payload: ProgressEvent) => displayProgress(payload);
  hooks.on("task:progress", progressHandler);

  try {
    return await fn();
  } finally {
    hooks.off("task:progress", progressHandler);
  }
}
