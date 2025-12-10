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
import { runValidations } from "./validation";
import { getContextBuilder } from "../utils/ai-service-factory";
import { hooks } from "./hooks";
import { PromptBuilder } from "./prompt-builder";
import { executePlanningPhase } from "./task-planning";
import { executeReviewPhase } from "./task-review";
import { captureGitState, extractCommitInfo, autoCommit, GitState } from "./git-utils";
import chalk from "chalk";

/**
 * Execute a single task with all features (retry, planning, review, etc.)
 * This is the core unified execution logic used by both execute and execute-loop commands
 */
export async function executeTaskCore(
  taskId: string,
  config: TaskExecutionConfig
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
    reviewPlan = false,
    enableReviewPhase = false,
    reviewModel,
    autoCommit: enableAutoCommit = false,
    executeSubtasks = true,
    dry = false,
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
    const planningResult = await executePlanningPhase(task, tool, {
      planModel,
      reviewPlan,
      autoCommit: enableAutoCommit,
      dry,
    });

    if (planningResult.success && planningResult.planContent) {
      planContent = planningResult.planContent;
    }
  }

  // ----------------------------------------------------------------------
  // EXECUTION PHASE (with optional retry logic)
  // ----------------------------------------------------------------------
  const attempts: TaskExecutionAttempt[] = [];

  if (enableRetry) {
    // Execute with retry logic
    return await executeTaskWithRetry(task, config, attempts, planContent);
  } else {
    // Execute once without retry (simpler path for execute command)
    return await executeSingleAttempt(task, config, attempts, planContent, 1, maxRetries);
  }
}

/**
 * Execute task with subtasks recursively
 */
async function executeTaskWithSubtasks(
  task: Task,
  subtasks: Task[],
  config: TaskExecutionConfig
): Promise<TaskExecutionResult> {
  const { dry } = config;

  console.log(
    chalk.blue(
      `📋 Task has ${subtasks.length} subtasks, executing recursively...`
    )
  );

  const subtaskResults: TaskExecutionResult[] = [];
  let allSuccess = true;

  // Execute subtasks one by one
  for (let i = 0; i < subtasks.length; i++) {
    const subtask = subtasks[i];
    console.log(
      chalk.cyan(
        `\n[${i + 1}/${subtasks.length}] Executing subtask: ${subtask.title} (${
          subtask.id
        })`
      )
    );

    try {
      const result = await executeTaskCore(subtask.id, config);
      subtaskResults.push(result);

      if (!result.success) {
        allSuccess = false;
        console.error(
          chalk.red(
            `❌ Failed to execute subtask ${subtask.id}: ${subtask.title}`
          )
        );
        break; // Stop on first failure
      }
    } catch (error) {
      allSuccess = false;
      console.error(
        chalk.red(
          `❌ Failed to execute subtask ${subtask.id}: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        )
      );
      break;
    }
  }

  // After all subtasks are done (or on failure), update the main task status
  if (!dry) {
    if (allSuccess) {
      await taskService.setTaskStatus(task.id, "completed");
      console.log(
        chalk.green(`✅ Main task ${task.title} completed after all subtasks`)
      );
    } else {
      await taskService.setTaskStatus(task.id, "todo");
      console.log(
        chalk.red(
          `❌ Main task ${task.title} failed due to subtask failure, status reset to todo`
        )
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
  planContent?: string
): Promise<TaskExecutionResult> {
  const {
    tool,
    maxRetries = 3,
    tryModels,
    verificationCommands = [],
    enableReviewPhase = false,
    reviewModel,
    autoCommit: enableAutoCommit = false,
    dry = false,
  } = config;

  let currentAttempt = 1;
  let lastError: string | undefined;

  while (currentAttempt <= maxRetries) {
    // Determine which executor and model to use for this attempt
    let currentExecutor = tool;
    let currentModel: string | undefined;

    if (tryModels && tryModels.length > 0) {
      const modelConfigIndex = Math.min(
        currentAttempt - 1,
        tryModels.length - 1
      );
      const modelConfig = tryModels[modelConfigIndex];

      if (modelConfig.executor) {
        currentExecutor = modelConfig.executor;
      }
      if (modelConfig.model) {
        currentModel = modelConfig.model;
      }
    }

    console.log(
      chalk.blue(
        `\n🎯 Attempt ${currentAttempt}/${maxRetries} for task: ${task.title} (${task.id})`
      )
    );

    if (currentModel) {
      console.log(
        chalk.cyan(
          `   Using executor: ${currentExecutor} with model: ${currentModel}`
        )
      );
    } else {
      console.log(chalk.cyan(`   Using executor: ${currentExecutor}`));
    }

    // Build retry context if this is a retry attempt
    let retryContext = "";
    if (currentAttempt > 1 && lastError) {
      const retryParts: string[] = [];
      retryParts.push(`# RETRY ATTEMPT ${currentAttempt}/${maxRetries}\n\n`);

      if (currentModel) {
        retryParts.push(
          `**Note**: You are ${currentExecutor} using the ${currentModel} model. This is a more capable model than the previous attempt.\n\n`
        );
      }

      retryParts.push(
        `## Previous Attempt Failed With Error:\n\n${lastError}\n\n`
      );
      retryParts.push(
        `Please analyze the error carefully and fix it. The error might be due to:\n`
      );
      retryParts.push(`- Syntax errors\n`);
      retryParts.push(`- Logic errors\n`);
      retryParts.push(`- Missing dependencies or imports\n`);
      retryParts.push(`- Incorrect configuration\n`);
      retryParts.push(`- Build or test failures\n\n`);
      retryParts.push(
        `Please fix the error above and complete the task successfully.\n\n`
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
        retryContext
      );

      // Check if all verifications passed
      const allVerificationsPassed = result.attempts[result.attempts.length - 1]
        ?.verificationResults?.every((r) => r.success) ?? true;

      if (!allVerificationsPassed) {
        const failedVerification = result.attempts[result.attempts.length - 1]
          ?.verificationResults?.find((r) => !r.success);
        lastError = `Verification command "${failedVerification?.command}" failed:\n${failedVerification?.error}`;
        currentAttempt++;
        continue;
      }

      // ----------------------------------------------------------------------
      // AI REVIEW PHASE
      // ----------------------------------------------------------------------
      if (enableReviewPhase && !dry) {
        const reviewResult = await executeReviewPhase(task, {
          reviewModel,
          planContent,
          dry,
        });

        if (!reviewResult.approved) {
          lastError = `AI Review Failed:\n${reviewResult.feedback}`;
          console.log(
            chalk.red(`❌ AI Review Rejected Changes: ${reviewResult.feedback}`)
          );
          currentAttempt++;
          continue;
        } else {
          console.log(
            chalk.green(`✅ AI Review Approved: ${reviewResult.feedback}`)
          );
          result.reviewFeedback = reviewResult.feedback;
        }
      }

      // Success! Return the result
      return result;
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
      console.log(
        chalk.red(
          `❌ Task execution failed on attempt ${currentAttempt}: ${lastError}`
        )
      );

      if (!dry && currentAttempt < maxRetries) {
        await taskService.setTaskStatus(task.id, "todo");
        console.log(chalk.yellow("⏸  Task status reset to todo for retry"));
      }

      currentAttempt++;
    }
  }

  // All retries exhausted
  if (!dry) {
    await taskService.setTaskStatus(task.id, "todo");
    console.log(
      chalk.red("❌ All retry attempts exhausted, task status reset to todo")
    );
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
  retryContext?: string
): Promise<TaskExecutionResult> {
  const {
    tool,
    executorConfig,
    customMessage,
    verificationCommands = [],
    autoCommit: enableAutoCommit = false,
    dry = false,
  } = config;

  const attemptStartTime = Date.now();

  console.log(
    chalk.blue(
      `🎯 ${dry ? "DRY RUN" : "Executing"} task: ${task.title} (${task.id})`
    )
  );

  // Capture git state before execution
  const gitStateBefore = await captureGitState();

  // Build execution message
  let executionMessage: string;

  if (customMessage) {
    // Use custom message override
    executionMessage = customMessage;
    console.log(chalk.cyan("📝 Using custom execution message"));
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
    });

    if (!promptResult.success) {
      throw createStandardError(
        TaskOMaticErrorCodes.CONFIGURATION_ERROR,
        `Failed to build execution prompt: ${promptResult.error}`
      );
    }

    executionMessage = promptResult.prompt!;
  }

  // Update task status to in-progress
  if (!dry) {
    await taskService.setTaskStatus(task.id, "in-progress");
    console.log(chalk.yellow("⏳ Task status updated to in-progress"));
  }

  // Emit execution:start event
  await hooks.emit("execution:start", { taskId: task.id, tool });

  try {
    // Create executor and run
    const executor = ExecutorFactory.create(tool, executorConfig);

    // Log session resumption if applicable
    if (executorConfig?.continueLastSession && attemptNumber > 1) {
      console.log(
        chalk.cyan(
          "🔄 Resuming previous session to provide error feedback to AI"
        )
      );
    }

    await executor.execute(executionMessage, dry, executorConfig);

    // Run verification commands
    const verificationResults = await runValidations(
      verificationCommands,
      dry
    );

    const allVerificationsPassed = verificationResults.every((r) => r.success);

    if (!allVerificationsPassed) {
      const failedVerification = verificationResults.find((r) => !r.success);
      const error = `Verification command "${failedVerification?.command}" failed:\n${failedVerification?.error}`;

      attempts.push({
        attemptNumber,
        success: false,
        error,
        executor: tool,
        model: executorConfig?.model,
        verificationResults,
        timestamp: Date.now() - attemptStartTime,
      });

      console.log(
        chalk.red(
          `❌ Task execution failed verification on attempt ${attemptNumber}`
        )
      );

      throw new Error(error);
    }

    // Extract commit info if enabled
    let commitInfo: { message: string; files: string[] } | undefined;

    if (enableAutoCommit && !dry) {
      console.log(chalk.blue("📝 Extracting commit information..."));

      const gitStateAfter = await captureGitState();
      const gitState: GitState = {
        beforeHead: gitStateBefore.beforeHead || "",
        afterHead: gitStateAfter.afterHead || "",
        hasUncommittedChanges: gitStateAfter.hasUncommittedChanges || false,
      };

      commitInfo = await extractCommitInfo(
        task.id,
        task.title,
        executionMessage,
        gitState
      );

      console.log(chalk.green(`✅ Commit message: ${commitInfo.message}`));
      if (commitInfo.files.length > 0) {
        console.log(
          chalk.green(`📁 Changed files: ${commitInfo.files.join(", ")}`)
        );
      }

      // Auto-commit the changes
      await autoCommit(commitInfo);
    }

    // Update task status to completed
    if (!dry) {
      await taskService.setTaskStatus(task.id, "completed");
      console.log(chalk.green("✅ Task execution completed successfully"));
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
    if (attempts.length === 0 || attempts[attempts.length - 1].attemptNumber !== attemptNumber) {
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
      console.log(chalk.red("❌ Task execution failed, status reset to todo"));
    }

    throw error;
  }
}
