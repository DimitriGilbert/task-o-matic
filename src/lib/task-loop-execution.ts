import { taskService } from "../services/tasks";
import {
  ExecuteLoopOptions,
  ExecuteLoopResult,
  TaskExecutionAttempt,
  ExecutorTool,
  Task,
  ExecutorConfig,
  ExecuteLoopConfig,
} from "../types";
import { ExecutorFactory } from "./executors/executor-factory";
import { runValidations } from "./validation";
import { getContextBuilder } from "../utils/ai-service-factory";
import { hooks } from "./hooks";
import chalk from "chalk";
import { exec } from "child_process";
import { promisify } from "util";
import { getAIOperations } from "../utils/ai-service-factory";
import { existsSync, readFileSync } from "fs";
import { join } from "path";

const execAsync = promisify(exec);

/**
 * Extract commit message and file list from AI conversation/output
 * This function analyzes the executor's work and generates appropriate commit info
 */
/**
 * Extract commit message and file list from git state
 * This function analyzes the actual git state to generate appropriate commit info
 */
export async function extractCommitInfo(
  taskId: string,
  taskTitle: string,
  executionMessage: string,
  gitState: {
    beforeHead: string;
    afterHead: string;
    hasUncommittedChanges: boolean;
  },
  execFn: (
    command: string
  ) => Promise<{ stdout: string; stderr: string }> = execAsync,
  aiOps: any = getAIOperations()
): Promise<{ message: string; files: string[] }> {
  try {
    // Case 1: Executor created a commit
    if (gitState.beforeHead !== gitState.afterHead) {
      console.log(
        chalk.blue("📝 Executor created a commit, extracting info...")
      );
      const { stdout } = await execFn(
        `git show --stat --format="%s%n%b" ${gitState.afterHead}`
      );

      const lines = stdout.trim().split("\n");
      const message = lines[0].trim();
      // Parse files from stat output (e.g. " src/file.ts | 10 +")
      const files = lines
        .slice(1)
        .filter((line) => line.includes("|"))
        .map((line) => line.split("|")[0].trim());

      return {
        message,
        files,
      };
    }

    // Case 2: Executor left uncommitted changes
    if (gitState.hasUncommittedChanges) {
      console.log(
        chalk.blue(
          "📝 Uncommitted changes detected, generating commit message..."
        )
      );

      // Get the diff to send to AI
      const { stdout: diff } = await execFn("git diff HEAD");

      // Get list of changed files
      const { stdout: status } = await execFn("git status --porcelain");
      const files = status
        .split("\n")
        .filter((line) => line.length > 0)
        .map((line) => line.substring(3).trim())
        .filter((file) => file.length > 0);

      // Use AI to generate commit message based on the diff
      // const aiOps = getAIOperations(); // Injected

      const prompt = `Based on the following git diff, generate a concise git commit message.
      
Task: ${taskTitle}

Git Diff:
${diff.substring(0, 10000)} // Limit diff size

Please respond in JSON format:
{
  "message": "concise commit message following conventional commits format"
}

The commit message should:
- Follow conventional commits format (feat:, fix:, refactor:, etc.)
- Be concise and descriptive
- Focus on what changed
`;

      const response = await aiOps.streamText(
        prompt,
        undefined,
        "You are a helpful assistant that generates git commit messages."
      );

      // Try to parse JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      let message = `feat: complete task ${taskTitle}`;

      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[0]);
          if (parsed.message) {
            message = parsed.message;
          }
        } catch (e) {
          // Ignore parse error
        }
      }

      return {
        message,
        files,
      };
    }

    // Case 3: No changes detected
    return {
      message: `feat: complete task ${taskTitle}`,
      files: [],
    };
  } catch (error) {
    console.warn(
      chalk.yellow(
        `⚠️  Failed to extract commit info: ${
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
  config: ExecuteLoopConfig,
  dry: boolean
): Promise<TaskExecutionAttempt[]> {
  const {
    maxRetries = 3,
    verificationCommands = [],
    tryModels,
    plan,
    planModel,
    autoCommit,
  } = config;

  const attempts: TaskExecutionAttempt[] = [];
  let currentAttempt = 1;
  let lastError: string | undefined;
  let planContent: string | undefined;

  // ----------------------------------------------------------------------
  // PLANNING PHASE
  // ----------------------------------------------------------------------
  if (plan) {
    console.log(
      chalk.blue.bold(`\n🧠 Starting Planning Phase for Task: ${task.title}`)
    );

    const planFileName = `task-${task.id}-plan.md`;
    const planExecutor = planModel
      ? (planModel.split(":")[0] as ExecutorTool)
      : tool;
    const planModelName = planModel ? planModel.split(":")[1] : undefined;

    const planningPrompt = `You are a senior software architect. Analyze the following task and create a detailed implementation plan.
    
Task: ${task.title}
Description: ${task.description || "No description provided."}

Requirements:
1. Analyze the task requirements.
2. Create a detailed step-by-step implementation plan.
3. Identify necessary file changes.
4. Write this plan to a file named "${planFileName}" in the current directory.
5. Do NOT implement the code yet, just create the plan file.

Please create the "${planFileName}" file now.`;

    console.log(
      chalk.cyan(
        `   Using executor for planning: ${planExecutor}${
          planModelName ? ` (${planModelName})` : ""
        }`
      )
    );

    // Create executor for planning
    const planningConfig: ExecutorConfig = {
      model: planModelName,
      continueLastSession: false,
    };

    const executor = ExecutorFactory.create(planExecutor, planningConfig);

    try {
      await executor.execute(planningPrompt, dry, planningConfig);

      if (!dry) {
        // Verify plan file exists and read it
        if (existsSync(planFileName)) {
          planContent = readFileSync(planFileName, "utf-8");
          console.log(
            chalk.green(`✅ Plan created successfully: ${planFileName}`)
          );

          // Auto-commit plan if enabled
          if (autoCommit) {
            try {
              console.log(chalk.blue(`📦 Staging plan file: ${planFileName}`));
              await execAsync(`git add ${planFileName}`);
              await execAsync(
                `git commit -m "docs: create implementation plan for task ${task.id}"`
              );
              console.log(chalk.green("✅ Plan committed successfully"));
            } catch (e) {
              console.warn(
                chalk.yellow(
                  `⚠️  Failed to commit plan: ${
                    e instanceof Error ? e.message : "Unknown error"
                  }`
                )
              );
            }
          }
        } else {
          console.warn(
            chalk.yellow(
              `⚠️  Plan file ${planFileName} was not created by the executor.`
            )
          );
        }
      }
    } catch (error) {
      console.error(
        chalk.red(
          `❌ Planning phase failed: ${
            error instanceof Error ? error.message : String(error)
          }`
        )
      );
      // We continue to execution even if planning failed, but maybe we should stop?
      // For now, let's continue but log the error.
    }
  }

  // ----------------------------------------------------------------------
  // EXECUTION PHASE
  // ----------------------------------------------------------------------
  while (currentAttempt <= maxRetries) {
    // Determine which executor and model to use for this attempt
    let currentExecutor = tool;
    let currentModel: string | undefined;

    if (tryModels && tryModels.length > 0) {
      // Use the model config for this attempt (or last one if we've exceeded the list)
      const modelConfigIndex = Math.min(
        currentAttempt - 1,
        tryModels.length - 1
      );
      const modelConfig = tryModels[modelConfigIndex];

      // Override executor if specified
      if (modelConfig.executor) {
        currentExecutor = modelConfig.executor;
      }

      // Store model name if specified
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

    const attemptStartTime = Date.now();

    // Capture git state before execution
    let beforeHead = "";
    try {
      const { stdout } = await execAsync("git rev-parse HEAD");
      beforeHead = stdout.trim();
    } catch (e) {
      // Git might not be initialized or no commits yet
    }

    try {
      // Build execution message with context
      const contextBuilder = getContextBuilder();
      const taskContext = await contextBuilder.buildContext(task.id);

      const messageParts: string[] = [];

      // Add retry context if this is a retry attempt
      if (currentAttempt > 1 && lastError) {
        messageParts.push(
          `# RETRY ATTEMPT ${currentAttempt}/${maxRetries}\n\n`
        );

        // Add model escalation context
        if (currentModel) {
          messageParts.push(
            `**Note**: You are ${currentExecutor} using the ${currentModel} model. This is a more capable model than the previous attempt.\n\n`
          );
        }

        messageParts.push(
          `## Previous Attempt Failed With Error:\n\n${lastError}\n\n`
        );
        messageParts.push(
          `Please analyze the error carefully and fix it. The error might be due to:\n`
        );
        messageParts.push(`- Syntax errors\n`);
        messageParts.push(`- Logic errors\n`);
        messageParts.push(`- Missing dependencies or imports\n`);
        messageParts.push(`- Incorrect configuration\n`);
        messageParts.push(`- Build or test failures\n\n`);
        messageParts.push(
          `Please fix the error above and complete the task successfully.\n\n`
        );
      }

      // Add task plan if available (from planning phase or service)
      const storedPlanData = await taskService.getTaskPlan(task.id);
      if (planContent) {
        messageParts.push(
          `# Implementation Plan\n\n${planContent}\n\nPlease follow this plan to implement the task.\n`
        );
      } else if (storedPlanData) {
        messageParts.push(`# Task Plan\n\n${storedPlanData.plan}\n`);
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
      await hooks.emit("execution:start", {
        taskId: task.id,
        tool: currentExecutor,
      });

      // Create executor and run
      // Build executor config
      const executorConfig: ExecutorConfig = {
        model: currentModel,
        continueLastSession: currentAttempt > 1, // Resume session on retries
      };

      // Log session resumption
      if (currentAttempt > 1) {
        console.log(
          chalk.cyan(
            "🔄 Resuming previous session to provide error feedback to AI"
          )
        );
      }

      const executor = ExecutorFactory.create(currentExecutor, executorConfig);

      // Add model info to execution message if specified
      let finalExecutionMessage = executionMessage;
      if (currentModel) {
        finalExecutionMessage =
          `**Model Configuration**: Using ${currentModel}\n\n` +
          executionMessage;
      }

      await executor.execute(finalExecutionMessage, dry, executorConfig);

      // Run verification commands
      const verificationResults = await runVerificationCommands(
        verificationCommands,
        dry
      );

      // Check if all verifications passed
      const allVerificationsPassed = verificationResults.every(
        (r) => r.success
      );

      if (!allVerificationsPassed) {
        // Verification failed - prepare error message for retry
        const failedVerification = verificationResults.find((r) => !r.success);
        lastError = `Verification command "${failedVerification?.command}" failed:\n${failedVerification?.error}`;

        attempts.push({
          attemptNumber: currentAttempt,
          success: false,
          error: lastError,
          executor: currentExecutor,
          model: currentModel,
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

        // Capture git state after execution
        let afterHead = "";
        let hasUncommittedChanges = false;

        try {
          const { stdout: headStdout } = await execAsync("git rev-parse HEAD");
          afterHead = headStdout.trim();

          const { stdout: statusStdout } = await execAsync(
            "git status --porcelain"
          );
          hasUncommittedChanges = statusStdout.trim().length > 0;
        } catch (e) {
          // Git issues
        }

        commitInfo = await extractCommitInfo(
          task.id,
          task.title,
          executionMessage,
          {
            beforeHead,
            afterHead,
            hasUncommittedChanges,
          }
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
        executor: currentExecutor,
        model: currentModel,
        verificationResults,
        commitInfo,
        timestamp: Date.now() - attemptStartTime,
      });

      // Emit execution:end event
      await hooks.emit("execution:end", { taskId: task.id, success: true });

      return attempts; // Success - exit retry loop
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);

      attempts.push({
        attemptNumber: currentAttempt,
        success: false,
        error: lastError,
        executor: currentExecutor,
        model: currentModel,
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
  const { filters = {}, tool = "opencode", config = {}, dry = false } = options;

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
    const attempts = await executeTaskWithRetry(task, tool, config, dry);

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

  return {
    totalTasks: tasksToExecute.length,
    completedTasks,
    failedTasks,
    taskResults,
    duration,
  };
}
