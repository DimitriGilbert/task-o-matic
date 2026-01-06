import { ExecuteTaskOptions, TaskExecutionConfig } from "../types";
import { executeTaskCore } from "./task-execution-core";

/**
 * Execute a task using an external coding assistant
 * This is the simplified entry point that delegates to the unified core
 */
export async function executeTask(options: ExecuteTaskOptions): Promise<void> {
  const {
    taskId,
    tool = "opencode",
    message,
    model,
    continueSession,
    dry = false,
    validate = [],
    maxRetries,
    tryModels,
    plan,
    planModel,
    reviewPlan,
    review,
    reviewModel,
    autoCommit,
    includePrd,
  } = options;

  // Build unified task execution config
  const config: TaskExecutionConfig = {
    tool,
    executorConfig: {
      model,
      continueLastSession: continueSession,
    },
    customMessage: message,
    verificationCommands: validate,
    enableRetry: maxRetries !== undefined && maxRetries > 0, // Opt-in retry
    maxRetries: maxRetries || 3,
    tryModels,
    enablePlanPhase: plan,
    planModel,
    reviewPlan,
    enableReviewPhase: review,
    reviewModel,
    autoCommit,
    executeSubtasks: true, // Always execute subtasks in execute command
    includePrd,
    dry,
  };

  // Delegate to unified core execution
  const result = await executeTaskCore(taskId, config);

  // Throw error if execution failed (maintains backward compatibility)
  if (!result.success) {
    const lastAttempt = result.attempts[result.attempts.length - 1];
    throw new Error(lastAttempt?.error || "Task execution failed");
  }
}
