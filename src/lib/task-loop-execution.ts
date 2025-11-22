import { taskService } from "../services/tasks";
import {
  ExecuteLoopOptions,
  ExecuteLoopResult,
  TaskExecutionAttempt,
  ExecutorTool,
  Task,
} from "../types";
import { ExecutorFactory } from "./executors/executor-factory";
import { runValidations } from "./validation";
import { getContextBuilder } from "../utils/ai-service-factory";
import { hooks } from "./hooks";
import chalk from "chalk";
import { exec } from "child_process";
import { promisify } from "util";
import { getAIOperations } from "../utils/ai-service-factory";

const execAsync = promisify(exec);

/**
 * Extract commit message and file list from AI conversation/output
 * This function analyzes the executor's work and generates appropriate commit info
 */
async function extractCommitInfo(
  taskId: string,
  taskTitle: string,
  executionMessage: string
): Promise<{ message: string; files: string[] }> {
  try {
    // Use AI to generate commit message based on the task
    const aiOps = getAIOperations();

    const prompt = `Based on the following task that was just completed, generate a concise git commit message and list the likely files that were changed.

Task: ${taskTitle}

Task Details:
${executionMessage}

Please respond in JSON format:
{
  "message": "concise commit message following conventional commits format",
  "files": ["list", "of", "likely", "changed", "files"]
}

The commit message should:
- Follow conventional commits format (feat:, fix:, refactor:, etc.)
- Be concise and descriptive
- Focus on what changed, not how

For the files list:
- List the most likely files that were modified
- If you're unsure, you can return an empty array []
- Use relative paths from the project root`;

    const response = await aiOps.streamText(
      prompt,
      undefined,
      "You are a helpful assistant that generates git commit messages and identifies changed files."
    );

    // Try to parse JSON from response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        message: parsed.message || `feat: complete task ${taskTitle}`,
        files: parsed.files || [],
      };
    }

    // Fallback if AI doesn't return proper JSON
    return {
      message: `feat: complete task ${taskTitle}`,
      files: [],
    };
  } catch (error) {
    console.warn(
      chalk.yellow(
        `⚠️  Failed to extract commit info from AI: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      )
    );
    // Fallback commit info
    return {
      message: `feat: complete task ${taskTitle}`,
      files: [],
    };
  }
}

/**
 * Run verification commands and return results
 */
async function runVerificationCommands(
  commands: string[],
  dry: boolean
): Promise<
  Array<{
    command: string;
    success: boolean;
    output?: string;
    error?: string;
  }>
> {
  const results: Array<{
    command: string;
    success: boolean;
    output?: string;
    error?: string;
  }> = [];

  if (dry) {
    console.log(chalk.yellow("🔍 DRY RUN - Verification commands:"));
    commands.forEach((cmd) => {
      console.log(chalk.cyan(`  ${cmd}`));
      results.push({
        command: cmd,
        success: true,
        output: "DRY RUN - not executed",
      });
    });
    return results;
  }

  for (const command of commands) {
    console.log(chalk.blue(`🧪 Running verification: ${command}`));

    try {
      const { stdout, stderr } = await execAsync(command);
      console.log(chalk.green(`✅ Verification passed: ${command}`));

      results.push({
        command,
        success: true,
        output: stdout.trim(),
      });
    } catch (error: any) {
      console.error(chalk.red(`❌ Verification failed: ${command}`));

      const errorOutput = error.stderr || error.stdout || error.message;
      console.error(chalk.red(`   Error: ${errorOutput}`));

      results.push({
        command,
        success: false,
        error: errorOutput,
      });

      // Return early on first failure
      break;
    }
  }

  return results;
}

/**
 * Execute a single task with retry logic and error correction
 */
async function executeTaskWithRetry(
  task: Task,
  tool: ExecutorTool,
  verificationCommands: string[],
  maxRetries: number,
  dry: boolean
): Promise<TaskExecutionAttempt[]> {
  const attempts: TaskExecutionAttempt[] = [];
  let currentAttempt = 1;
  let lastError: string | undefined;

  while (currentAttempt <= maxRetries) {
    console.log(
      chalk.blue(
        `\n🎯 Attempt ${currentAttempt}/${maxRetries} for task: ${task.title} (${task.id})`
      )
    );

    const attemptStartTime = Date.now();

    try {
      // Build execution message with context
      const contextBuilder = getContextBuilder();
      const taskContext = await contextBuilder.buildContext(task.id);

      const messageParts: string[] = [];

      // Add retry context if this is a retry attempt
      if (currentAttempt > 1 && lastError) {
        messageParts.push(`# RETRY ATTEMPT ${currentAttempt}/${maxRetries}\n\n`);
        messageParts.push(
          `## Previous Attempt Failed With Error:\n\n${lastError}\n\n`
        );
        messageParts.push(
          `Please fix the error above and complete the task successfully.\n\n`
        );
      }

      // Add task plan if available
      const planData = await taskService.getTaskPlan(task.id);
      if (planData) {
        messageParts.push(`# Task Plan\n\n${planData.plan}\n`);
      } else {
        messageParts.push(
          `# Task: ${task.title}\n\n${task.description || "No description"}\n`
        );
      }

      // Add PRD context if available
      if (taskContext.prdContent) {
        messageParts.push(
          `\n# Product Requirements Document\n\n${taskContext.prdContent}\n`
        );
      }

      // Add stack/technology context
      if (taskContext.stack) {
        messageParts.push(`\n# Technology Stack\n\n`);
        messageParts.push(`- **Project**: ${taskContext.stack.projectName}\n`);
        messageParts.push(`- **Frontend**: ${taskContext.stack.frontend}\n`);
        messageParts.push(`- **Backend**: ${taskContext.stack.backend}\n`);
        if (taskContext.stack.database !== "none") {
          messageParts.push(`- **Database**: ${taskContext.stack.database}\n`);
        }
        messageParts.push(`- **Auth**: ${taskContext.stack.auth}\n`);
      }

      // Add documentation context if available
      if (taskContext.documentation) {
        messageParts.push(`\n# Documentation Context\n\n`);
        messageParts.push(`${taskContext.documentation.recap}\n`);
      }

      const executionMessage = messageParts.join("");

      // Update task status to in-progress
      if (!dry) {
        await taskService.setTaskStatus(task.id, "in-progress");
        console.log(chalk.yellow("⏳ Task status updated to in-progress"));
      }

      // Emit execution:start event
      await hooks.emit("execution:start", { taskId: task.id, tool });

      // Create executor and run
      const executor = ExecutorFactory.create(tool);
      await executor.execute(executionMessage, dry);

      // Run verification commands
      const verificationResults = await runVerificationCommands(
        verificationCommands,
        dry
      );

      // Check if all verifications passed
      const allVerificationsPassed = verificationResults.every((r) => r.success);

      if (!allVerificationsPassed) {
        // Verification failed - prepare error message for retry
        const failedVerification = verificationResults.find((r) => !r.success);
        lastError = `Verification command "${failedVerification?.command}" failed:\n${failedVerification?.error}`;

        attempts.push({
          attemptNumber: currentAttempt,
          success: false,
          error: lastError,
          verificationResults,
          timestamp: Date.now() - attemptStartTime,
        });

        console.log(
          chalk.red(
            `❌ Task execution failed verification on attempt ${currentAttempt}`
          )
        );

        currentAttempt++;
        continue;
      }

      // Success! Extract commit info
      let commitInfo: { message: string; files: string[] } | undefined;

      if (!dry) {
        console.log(chalk.blue("📝 Extracting commit information..."));
        commitInfo = await extractCommitInfo(
          task.id,
          task.title,
          executionMessage
        );
        console.log(chalk.green(`✅ Commit message: ${commitInfo.message}`));
        if (commitInfo.files.length > 0) {
          console.log(
            chalk.green(`📁 Changed files: ${commitInfo.files.join(", ")}`)
          );
        }
      }

      // Update task status to completed
      if (!dry) {
        await taskService.setTaskStatus(task.id, "completed");
        console.log(chalk.green("✅ Task execution completed successfully"));
      }

      // Record successful attempt
      attempts.push({
        attemptNumber: currentAttempt,
        success: true,
        verificationResults,
        commitInfo,
        timestamp: Date.now() - attemptStartTime,
      });

      // Emit execution:end event
      await hooks.emit("execution:end", { taskId: task.id, success: true });

      return attempts; // Success - exit retry loop
    } catch (error) {
      lastError =
        error instanceof Error ? error.message : String(error);

      attempts.push({
        attemptNumber: currentAttempt,
        success: false,
        error: lastError,
        timestamp: Date.now() - attemptStartTime,
      });

      // Emit execution:error event
      await hooks.emit("execution:error", {
        taskId: task.id,
        error: error instanceof Error ? error : new Error(String(error)),
      });

      console.log(
        chalk.red(
          `❌ Task execution failed on attempt ${currentAttempt}: ${lastError}`
        )
      );

      if (!dry && currentAttempt < maxRetries) {
        // Reset task status to todo for retry
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

  return attempts;
}

/**
 * Execute multiple tasks in a loop with retry and verification
 */
export async function executeTaskLoop(
  options: ExecuteLoopOptions
): Promise<ExecuteLoopResult> {
  const startTime = Date.now();
  const {
    filters = {},
    tool = "opencode",
    config = {},
    dry = false,
  } = options;

  const {
    maxRetries = 3,
    verificationCommands = [],
    autoCommit = false,
  } = config;

  console.log(chalk.blue.bold("\n🔄 Starting Task Loop Execution\n"));
  console.log(chalk.cyan(`Executor Tool: ${tool}`));
  console.log(chalk.cyan(`Max Retries per Task: ${maxRetries}`));
  console.log(
    chalk.cyan(
      `Verification Commands: ${verificationCommands.length > 0 ? verificationCommands.join(", ") : "None"}`
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

  if (tasksToExecute.length === 0) {
    console.log(chalk.yellow("⚠️  No tasks found matching the filters"));
    return {
      totalTasks: 0,
      completedTasks: 0,
      failedTasks: 0,
      taskResults: [],
      duration: Date.now() - startTime,
    };
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

    // Execute task with retry logic
    const attempts = await executeTaskWithRetry(
      task,
      tool,
      verificationCommands,
      maxRetries,
      dry
    );

    // Check if task succeeded
    const lastAttempt = attempts[attempts.length - 1];
    const succeeded = lastAttempt.success;

    if (succeeded) {
      completedTasks++;
      console.log(
        chalk.green.bold(
          `\n✅ Task ${task.title} completed successfully after ${attempts.length} attempt(s)\n`
        )
      );
    } else {
      failedTasks++;
      console.log(
        chalk.red.bold(
          `\n❌ Task ${task.title} failed after ${attempts.length} attempt(s)\n`
        )
      );
    }

    taskResults.push({
      taskId: task.id,
      taskTitle: task.title,
      attempts,
      finalStatus: succeeded ? "completed" : "failed",
    });

    // Auto-commit if enabled and task succeeded
    if (autoCommit && succeeded && !dry && lastAttempt.commitInfo) {
      try {
        const { message, files } = lastAttempt.commitInfo;

        if (files.length > 0) {
          // Stage specific files
          const gitAdd = `git add ${files.join(" ")}`;
          console.log(chalk.blue(`📦 Staging files: ${gitAdd}`));
          await execAsync(gitAdd);
        } else {
          // Stage all changes
          console.log(chalk.blue("📦 Staging all changes"));
          await execAsync("git add .");
        }

        // Commit
        const gitCommit = `git commit -m "${message}"`;
        console.log(chalk.blue(`💾 Committing: ${message}`));
        await execAsync(gitCommit);

        console.log(chalk.green("✅ Changes committed successfully\n"));
      } catch (error) {
        console.warn(
          chalk.yellow(
            `⚠️  Auto-commit failed: ${
              error instanceof Error ? error.message : "Unknown error"
            }\n`
          )
        );
      }
    }
  }

  const duration = Date.now() - startTime;

  // Print summary
  console.log(
    chalk.blue.bold(`\n${"=".repeat(60)}\n📊 Execution Summary\n${"=".repeat(60)}`)
  );
  console.log(chalk.cyan(`Total Tasks: ${tasksToExecute.length}`));
  console.log(chalk.green(`✅ Completed: ${completedTasks}`));
  console.log(chalk.red(`❌ Failed: ${failedTasks}`));
  console.log(
    chalk.cyan(`⏱  Duration: ${(duration / 1000).toFixed(2)} seconds\n`)
  );

  return {
    totalTasks: tasksToExecute.length,
    completedTasks,
    failedTasks,
    taskResults,
    duration,
  };
}
