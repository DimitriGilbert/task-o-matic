import { taskService } from "../services/tasks";
import {
  ExecuteLoopOptions,
  ExecuteLoopResult,
  ExecutorTool,
  Task,
  TaskExecutionConfig,
} from "../types";
import { executeTaskCore } from "./task-execution-core";
import { sendNotifications } from "./notifications";
import chalk from "chalk";

/**
 * Execute multiple tasks in a loop with retry and verification
 * This delegates to the unified executeTaskCore for each task
 */
export async function executeTaskLoop(
  options: ExecuteLoopOptions
): Promise<ExecuteLoopResult> {
  const startTime = Date.now();
  const { filters = {}, tool = "opencode", config = {}, dry = false } = options;

  const {
    maxRetries = 3,
    verificationCommands = [],
    autoCommit = false,
    tryModels,
    plan,
    planModel,
    reviewPlan,
    review,
    reviewModel,
    customMessage,
    continueSession,
    model,
    includeCompleted = false,
    includePrd = false,
    notifyTargets,
  } = config;

  console.log(chalk.blue.bold("\n🔄 Starting Task Loop Execution\n"));
  console.log(chalk.cyan(`Executor Tool: ${tool}`));
  if (model) console.log(chalk.cyan(`Executor Model: ${model}`));
  console.log(chalk.cyan(`Max Retries per Task: ${maxRetries}`));
  console.log(
    chalk.cyan(
      `Verification Commands: ${
        verificationCommands.length > 0
          ? verificationCommands.join(", ")
          : "None"
      }`
    )
  );
  console.log(chalk.cyan(`Auto Commit: ${autoCommit ? "Yes" : "No"}`));
  console.log(chalk.cyan(`Dry Run: ${dry ? "Yes" : "No"}\n`));

  // Get tasks to execute
  let tasksToExecute: Task[] = [];

  if (filters.taskIds && filters.taskIds.length > 0) {
    // Execute specific tasks by ID
    for (const taskId of filters.taskIds) {
      const task = await taskService.getTask(taskId);
      if (task) {
        tasksToExecute.push(task);
      } else {
        console.warn(chalk.yellow(`⚠️  Task ${taskId} not found, skipping`));
      }
    }
  } else {
    // Get all tasks matching filters
    tasksToExecute = await taskService.listTasks({
      status: filters.status,
      tag: filters.tag,
    });
  }

  // Filter out completed tasks unless includeCompleted is set
  if (!includeCompleted) {
    const beforeCount = tasksToExecute.length;
    tasksToExecute = tasksToExecute.filter((t) => t.status !== "completed");
    const filtered = beforeCount - tasksToExecute.length;
    if (filtered > 0) {
      console.log(
        chalk.dim(`   (Skipped ${filtered} already-completed task(s))\n`)
      );
    }
  }

  if (tasksToExecute.length === 0) {
    console.log(chalk.yellow("⚠️  No tasks to execute (all may be completed)"));
    const emptyResult: ExecuteLoopResult = {
      totalTasks: 0,
      completedTasks: 0,
      failedTasks: 0,
      taskResults: [],
      duration: Date.now() - startTime,
    };
    if (notifyTargets?.length)
      await sendNotifications(notifyTargets, emptyResult);
    return emptyResult;
  }

  console.log(
    chalk.blue(`📋 Found ${tasksToExecute.length} task(s) to execute\n`)
  );

  const taskResults: ExecuteLoopResult["taskResults"] = [];
  let completedTasks = 0;
  let failedTasks = 0;

  // Execute tasks sequentially
  for (let i = 0; i < tasksToExecute.length; i++) {
    const task = tasksToExecute[i];

    console.log(
      chalk.blue.bold(
        `\n${"=".repeat(60)}\n📌 Task ${i + 1}/${tasksToExecute.length}: ${
          task.title
        } (${task.id})\n${"=".repeat(60)}\n`
      )
    );

    // Build unified task execution config
    const taskConfig: TaskExecutionConfig = {
      tool,
      customMessage, // NEW: Support custom message override
      executorConfig: {
        continueLastSession: continueSession, // NEW: Support session continuation
        model, // NEW: Pass model to executor
      },
      verificationCommands,
      enableRetry: true, // Always enable retry in loop
      maxRetries,
      tryModels,
      enablePlanPhase: plan,
      planModel,
      reviewPlan,
      enableReviewPhase: review,
      reviewModel,
      autoCommit,
      executeSubtasks: true, // Now supports subtasks!
      includeCompleted, // Pass through to subtask execution
      includePrd, // Pass through to execution core
      dry,
    };

    try {
      // Execute task using unified core
      const result = await executeTaskCore(task.id, taskConfig);

      // Check if task succeeded
      const succeeded = result.success;

      if (succeeded) {
        completedTasks++;
        console.log(
          chalk.green.bold(
            `\n✅ Task ${task.title} completed successfully after ${result.attempts.length} attempt(s)\n`
          )
        );
      } else {
        failedTasks++;
        console.log(
          chalk.red.bold(
            `\n❌ Task ${task.title} failed after ${result.attempts.length} attempt(s)\n`
          )
        );
      }

      taskResults.push({
        taskId: task.id,
        taskTitle: task.title,
        attempts: result.attempts,
        finalStatus: succeeded ? "completed" : "failed",
      });

      // Stop the loop on first failure
      if (!succeeded) {
        break;
      }
    } catch (error) {
      failedTasks++;
      console.error(
        chalk.red.bold(
          `\n❌ Task ${task.title} failed with error: ${
            error instanceof Error ? error.message : "Unknown error"
          }\n`
        )
      );

      taskResults.push({
        taskId: task.id,
        taskTitle: task.title,
        attempts: [],
        finalStatus: "failed",
      });

      // Stop the loop on error
      break;
    }
  }

  const duration = Date.now() - startTime;

  // Print summary
  console.log(
    chalk.blue.bold(
      `\n${"=".repeat(60)}\n📊 Execution Summary\n${"=".repeat(60)}`
    )
  );
  console.log(chalk.cyan(`Total Tasks: ${tasksToExecute.length}`));
  console.log(chalk.green(`✅ Completed: ${completedTasks}`));
  console.log(chalk.red(`❌ Failed: ${failedTasks}`));
  console.log(
    chalk.cyan(`⏱  Duration: ${(duration / 1000).toFixed(2)} seconds\n`)
  );

  const result: ExecuteLoopResult = {
    totalTasks: tasksToExecute.length,
    completedTasks,
    failedTasks,
    taskResults,
    duration,
  };

  // Send notifications if configured
  if (notifyTargets?.length) {
    await sendNotifications(notifyTargets, result);
  }

  return result;
}
