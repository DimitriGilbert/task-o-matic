import {
  formatTaskNotFoundError,
  createStandardError,
  TaskOMaticErrorCodes,
} from "../utils/task-o-matic-error";
import { taskService } from "../services/tasks";
import {
  TaskExecutionConfig,
  TaskExecutionResult,
  TaskExecutionAttempt,
  ExecutorTool,
  ExecutorConfig,
  Task,
} from "../types";
import { ExecutorFactory } from "./executors/executor-factory";
import { runValidations, formatVerificationError } from "./validation";
import { getContextBuilder } from "../utils/ai-service-factory";
import { hooks } from "./hooks";
import { PromptBuilder } from "./prompt-builder";
import { executePlanningPhase } from "./task-planning";
import { executeReviewPhase } from "./task-review";
import {
  captureGitState,
  extractCommitInfo,
  autoCommit,
  hasNewCommitsSince,
  GitState,
} from "./git-utils";
import { logger } from "./logger";

/**
 * Execute a single task with all features (retry, planning, review, etc.)
 * This is the core unified execution logic used by both execute and execute-loop commands
 */
export async function executeTaskCore(
  taskId: string,
  config: TaskExecutionConfig,
): Promise<TaskExecutionResult> {
  const {
    tool,
    executorConfig,
    customMessage,
    verificationCommands = [],
    enableRetry = false,
    maxRetries = 3,
    tryModels,
    enablePlanPhase = false,
    planModel,
    planTool,
    reviewPlan = false,
    enableReviewPhase = false,
    reviewModel,
    reviewTool,
    autoCommit: enableAutoCommit = false,
    executeSubtasks = true,
    includePrd = false,
    dry = false,
    onPlanReview,
  } = config;

  // Load task
  const task = await taskService.getTask(taskId);
  if (!task) {
    throw formatTaskNotFoundError(taskId);
  }

  // Check if task has subtasks and should execute them recursively
  if (executeSubtasks && !customMessage) {
    const subtasks = await taskService.getSubtasks(taskId);
    if (subtasks.length > 0) {
      return await executeTaskWithSubtasks(task, subtasks, config);
    }
  }

  // ----------------------------------------------------------------------
  // PLANNING PHASE
  // ----------------------------------------------------------------------
  let planContent: string | undefined;

  if (enablePlanPhase) {
    // Ensure full task content is loaded if offloaded to file
    if (task.contentFile && (!task.content || task.content.length < 50)) {
      try {
        const fullContent = await taskService.getTaskContent(task.id);
        if (fullContent) {
          task.content = fullContent;
          logger.info(`📄 Loaded full content for task ${task.id}`);
        }
      } catch (error) {
        logger.warn(
          `⚠️ Failed to load full content for task ${task.id}: ${
            error instanceof Error ? error.message : String(error)
          }`,
        );
      }
    }

    // Fallback: Use explicit planTool, or valid executor part from planModel, or default to main tool
    // We pass undefined as defaultTool to let executePlanningPhase handle the logic if needed,
    // or we resolve it here. Let's resolve it here for clarity.
    const effectivePlanTool = (planTool as ExecutorTool) || tool;

    const planningResult = await executePlanningPhase(task, effectivePlanTool, {
      planModel,
      planTool,
      reviewPlan,
      autoCommit: enableAutoCommit,
      dry,
      onPlanReview,
    });

    if (planningResult.success && planningResult.planContent) {
      planContent = planningResult.planContent;
    }
  }

  // ----------------------------------------------------------------------
  // EXECUTION PHASE (with optional retry logic)
  // ----------------------------------------------------------------------
  const attempts: TaskExecutionAttempt[] = [];

  if (enableRetry || enableReviewPhase) {
    // Execute with retry logic OR if review is enabled (even without retry)
    // If retry is disabled, we force maxRetries to 1 to ensure single execution + review
    const effectiveConfig: TaskExecutionConfig = enableRetry
      ? config
      : { ...config, maxRetries: 1 };

    return await executeTaskWithRetry(
      task,
      effectiveConfig,
      attempts,
      planContent,
    );
  } else {
    // Execute once without retry (simpler path for execute command)
    return await executeSingleAttempt(
      task,
      config,
      attempts,
      planContent,
      1,
      maxRetries,
    );
  }
}

/**
 * Execute task with subtasks recursively
 */
async function executeTaskWithSubtasks(
  task: Task,
  subtasks: Task[],
  config: TaskExecutionConfig,
): Promise<TaskExecutionResult> {
  const { dry, includeCompleted = false } = config;

  logger.info(
    `📋 Task has ${subtasks.length} subtasks, executing recursively...`,
  );

  const subtaskResults: TaskExecutionResult[] = [];
  let allSuccess = true;

  // Execute subtasks one by one
  for (let i = 0; i < subtasks.length; i++) {
    const subtask = subtasks[i];

    // Skip completed subtasks unless includeCompleted is set
    if (!includeCompleted && subtask.status === "completed") {
      logger.info(
        `⏭️  Skipping completed subtask: ${subtask.title} (${subtask.id})`,
      );
      continue;
    }

    logger.progress(
      `\n[${i + 1}/${subtasks.length}] Executing subtask: ${subtask.title} (${
        subtask.id
      })`,
    );

    try {
      const result = await executeTaskCore(subtask.id, config);
      subtaskResults.push(result);

      if (!result.success) {
        allSuccess = false;
        logger.error(
          `❌ Failed to execute subtask ${subtask.id}: ${subtask.title}`,
        );
        break; // Stop on first failure
      }
    } catch (error) {
      allSuccess = false;
      logger.error(
        `❌ Failed to execute subtask ${subtask.id}: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
      break;
    }
  }

  // After all subtasks are done (or on failure), update the main task status
  if (!dry) {
    if (allSuccess) {
      await taskService.setTaskStatus(task.id, "completed");
      logger.success(`✅ Main task ${task.title} completed after all subtasks`);
    } else {
      await taskService.setTaskStatus(task.id, "todo");
      logger.error(
        `❌ Main task ${task.title} failed due to subtask failure, status reset to todo`,
      );
    }
  }

  return {
    success: allSuccess,
    attempts: [], // Parent task doesn't have its own attempts
    subtaskResults,
  };
}

/**
 * Execute task with retry logic
 */
async function executeTaskWithRetry(
  task: Task,
  config: TaskExecutionConfig,
  attempts: TaskExecutionAttempt[],
  planContent?: string,
): Promise<TaskExecutionResult> {
  const {
    tool,
    maxRetries = 3,
    tryModels,
    verificationCommands = [],
    enableReviewPhase = false,
    reviewModel,
    reviewTool,
    autoCommit: enableAutoCommit = false,
    includePrd = false,
    dry = false,
  } = config;

  let currentAttempt = 1;
  let lastError: string | undefined;

  // Capture git HEAD before any execution attempts for review diffing
  const beforeHeadState = await captureGitState();
  const beforeHead = beforeHeadState.beforeHead;

  while (currentAttempt <= maxRetries) {
    // Determine which executor and model to use for this attempt
    let currentExecutor = tool;
    let currentModel: string | undefined = config.executorConfig?.model;

    if (tryModels && tryModels.length > 0) {
      const modelConfigIndex = Math.min(
        currentAttempt - 1,
        tryModels.length - 1,
      );
      const modelConfig = tryModels[modelConfigIndex];

      if (modelConfig.executor) {
        currentExecutor = modelConfig.executor;
      }
      if (modelConfig.model) {
        currentModel = modelConfig.model;
      }
    }

    logger.info(
      `\n🎯 Attempt ${currentAttempt}/${maxRetries} for task: ${task.title} (${task.id})`,
    );

    if (currentModel) {
      logger.progress(
        `   Using executor: ${currentExecutor} with model: ${currentModel}`,
      );
    } else {
      logger.progress(`   Using executor: ${currentExecutor}`);
    }

    // Build retry context if this is a retry attempt
    let retryContext = "";
    if (currentAttempt > 1 && lastError) {
      const retryParts: string[] = [];
      retryParts.push(`# RETRY ATTEMPT ${currentAttempt}/${maxRetries}\n\n`);

      if (currentModel) {
        retryParts.push(
          `**Note**: You are ${currentExecutor} using the ${currentModel} model. This is a more capable model than the previous attempt.\n\n`,
        );
      }

      retryParts.push(
        `## Previous Attempt Failed With Error:\n\n${lastError}\n\n`,
      );
      retryParts.push(
        `Please analyze the error carefully and fix it. The error might be due to:\n`,
      );
      retryParts.push(`- Syntax errors\n`);
      retryParts.push(`- Logic errors\n`);
      retryParts.push(`- Missing dependencies or imports\n`);
      retryParts.push(`- Incorrect configuration\n`);
      retryParts.push(`- Build or test failures\n\n`);
      retryParts.push(
        `Please fix the error above and complete the task successfully.\n\n`,
      );
      retryContext = retryParts.join("");
    }

    // Update executor config for this attempt
    const attemptConfig: TaskExecutionConfig = {
      ...config,
      tool: currentExecutor,
      executorConfig: {
        ...config.executorConfig,
        model: currentModel,
        continueLastSession: currentAttempt > 1, // Resume session on retries
      },
    };

    try {
      const result = await executeSingleAttempt(
        task,
        attemptConfig,
        attempts,
        planContent,
        currentAttempt,
        maxRetries,
        retryContext,
      );

      // Check if all verifications passed
      const allVerificationsPassed =
        result.attempts[result.attempts.length - 1]?.verificationResults?.every(
          (r) => r.success,
        ) ?? true;

      if (!allVerificationsPassed) {
        const failedVerification = result.attempts[
          result.attempts.length - 1
        ]?.verificationResults?.find((r) => !r.success);
        lastError = `Verification command "${failedVerification?.command}" failed:\n${failedVerification?.error}`;
        currentAttempt++;
        continue;
      }

      // ----------------------------------------------------------------------
      // AI REVIEW PHASE
      // ----------------------------------------------------------------------
      if (enableReviewPhase && !dry) {
        // Build context for review if needed (PRD content)
        let prdContentForReview: string | undefined;
        if (includePrd) {
          try {
            const contextBuilder = getContextBuilder();
            const reviewContext = await contextBuilder.buildContext(task.id);
            prdContentForReview = reviewContext.prdContent;
          } catch (error) {
            logger.warn(
              `⚠️ Failed to load PRD content for review: ${
                error instanceof Error ? error.message : String(error)
              }`,
            );
          }
        }

        const reviewResult = await executeReviewPhase(task, {
          reviewModel,
          reviewTool,
          planContent,
          taskDescription: task.description,
          taskContent: task.content,
          prdContent: prdContentForReview,
          documentation: task.documentation,
          beforeHead,
          dry,
        });

        if (!reviewResult.approved) {
          lastError = `AI Review Failed:\n${reviewResult.feedback}`;
          logger.error(
            `❌ AI Review Rejected Changes: ${reviewResult.feedback}`,
          );
          currentAttempt++;
          continue;
        } else {
          logger.success(`✅ AI Review Approved: ${reviewResult.feedback}`);
          result.reviewFeedback = reviewResult.feedback;
        }
      }

      // Success! Return the result
      return result;
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
      logger.error(
        `❌ Task execution failed on attempt ${currentAttempt}: ${lastError}`,
      );

      if (!dry && currentAttempt < maxRetries) {
        await taskService.setTaskStatus(task.id, "todo");
        logger.warn("⏸  Task status reset to todo for retry");
      }

      currentAttempt++;
    }
  }

  // All retries exhausted
  if (!dry) {
    await taskService.setTaskStatus(task.id, "todo");
    logger.error("❌ All retry attempts exhausted, task status reset to todo");
  }

  return {
    success: false,
    attempts,
  };
}

/**
 * Execute a single attempt of the task
 */
async function executeSingleAttempt(
  task: Task,
  config: TaskExecutionConfig,
  attempts: TaskExecutionAttempt[],
  planContent: string | undefined,
  attemptNumber: number,
  maxRetries: number,
  retryContext?: string,
): Promise<TaskExecutionResult> {
  const {
    tool,
    executorConfig,
    customMessage,
    verificationCommands = [],
    autoCommit: enableAutoCommit = false,
    includePrd = false,
    dry = false,
  } = config;

  const attemptStartTime = Date.now();

  logger.info(
    `🎯 ${dry ? "DRY RUN" : "Executing"} task: ${task.title} (${task.id})`,
  );

  // Capture git state before execution
  const gitStateBefore = await captureGitState();

  // Build execution message
  let executionMessage: string;

  if (customMessage) {
    // Use custom message override
    executionMessage = customMessage;
    logger.progress("📝 Using custom execution message");
  } else {
    // Build comprehensive execution message with full context
    const contextBuilder = getContextBuilder();
    const taskContext = await contextBuilder.buildContext(task.id);

    // Get task plan if available
    const storedPlanData = await taskService.getTaskPlan(task.id);
    let finalPlan: string | undefined;
    if (planContent) {
      finalPlan = `${planContent}\n\nPlease follow this plan to implement the task.`;
    } else if (storedPlanData) {
      finalPlan = storedPlanData.plan;
    }

    // Build execution prompt using PromptBuilder
    const promptResult = PromptBuilder.buildExecutionPrompt({
      taskTitle: task.title,
      taskDescription: task.description,
      taskPlan: finalPlan,
      stack: taskContext.stack,
      documentation: taskContext.documentation,
      retryContext,
      prdContent: includePrd ? taskContext.prdContent : undefined,
    });

    if (!promptResult.success) {
      throw createStandardError(
        TaskOMaticErrorCodes.CONFIGURATION_ERROR,
        `Failed to build execution prompt: ${promptResult.error}`,
      );
    }

    executionMessage = promptResult.prompt!;
  }

  // Update task status to in-progress
  if (!dry) {
    await taskService.setTaskStatus(task.id, "in-progress");
    logger.warn("⏳ Task status updated to in-progress");
  }

  // Emit execution:start event
  await hooks.emit("execution:start", { taskId: task.id, tool });

  try {
    // Create executor and run
    const executor = ExecutorFactory.create(tool, executorConfig);

    // Log session resumption if applicable
    if (executorConfig?.continueLastSession && attemptNumber > 1) {
      logger.progress(
        "🔄 Resuming previous session to provide error feedback to AI",
      );
    }

    await executor.execute(executionMessage, dry, executorConfig);

    // Run verification commands
    const verificationResults = await runValidations(verificationCommands, dry);

    const allVerificationsPassed = verificationResults.every((r) => r.success);

    if (!allVerificationsPassed) {
      const failedVerification = verificationResults.find((r) => !r.success);
      const formattedError = formatVerificationError(failedVerification!);

      attempts.push({
        attemptNumber,
        success: false,
        error: formattedError,
        executor: tool,
        model: executorConfig?.model,
        verificationResults,
        timestamp: Date.now() - attemptStartTime,
      });

      logger.error(
        `❌ Task execution failed verification on attempt ${attemptNumber}`,
      );

      // Don't throw - return failure so retry loop can handle with session continuation
      // This enables automatic error feedback to the AI
      return {
        success: false,
        attempts,
      };
    }

    // Extract commit info if enabled
    let commitInfo: { message: string; files: string[] } | undefined;

    if (enableAutoCommit && !dry) {
      logger.info("📝 Checking git state for auto-commit...");

      // Check if agent already committed during execution
      const agentCommitted = await hasNewCommitsSince(
        gitStateBefore.beforeHead || "",
      );

      if (agentCommitted) {
        logger.info(
          "📝 Agent already committed changes during execution, skipping auto-commit",
        );
      } else {
        const gitStateAfter = await captureGitState();

        if (gitStateAfter.hasUncommittedChanges) {
          const gitState: GitState = {
            beforeHead: gitStateBefore.beforeHead || "",
            afterHead: gitStateAfter.afterHead || "",
            hasUncommittedChanges: gitStateAfter.hasUncommittedChanges || false,
          };

          commitInfo = await extractCommitInfo(
            task.id,
            task.title,
            executionMessage,
            gitState,
          );

          logger.success(`✅ Commit message: ${commitInfo.message}`);
          if (commitInfo.files.length > 0) {
            logger.success(`📁 Changed files: ${commitInfo.files.join(", ")}`);
          }

          // Auto-commit the changes
          await autoCommit(commitInfo);
        } else {
          logger.info("📝 No uncommitted changes to commit");
        }
      }
    }

    // Update task status to completed
    if (!dry) {
      await taskService.setTaskStatus(task.id, "completed");
      logger.success("✅ Task execution completed successfully");
    }

    // Record successful attempt
    attempts.push({
      attemptNumber,
      success: true,
      executor: tool,
      model: executorConfig?.model,
      verificationResults,
      commitInfo,
      timestamp: Date.now() - attemptStartTime,
    });

    // Emit execution:end event
    await hooks.emit("execution:end", { taskId: task.id, success: true });

    return {
      success: true,
      attempts,
      commitInfo,
      planContent,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    // Record failed attempt if not already recorded
    if (
      attempts.length === 0 ||
      attempts[attempts.length - 1].attemptNumber !== attemptNumber
    ) {
      attempts.push({
        attemptNumber,
        success: false,
        error: errorMessage,
        executor: tool,
        model: executorConfig?.model,
        timestamp: Date.now() - attemptStartTime,
      });
    }

    // Emit execution:error event
    await hooks.emit("execution:error", {
      taskId: task.id,
      error: error instanceof Error ? error : new Error(String(error)),
    });

    if (!dry) {
      await taskService.setTaskStatus(task.id, "todo");
      logger.error("❌ Task execution failed, status reset to todo");
    }

    throw error;
  }
}
