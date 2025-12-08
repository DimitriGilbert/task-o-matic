import { taskService } from "../services/tasks";
import { ExecuteTaskOptions, ExecutorTool, ExecutorConfig } from "../types";
import { ExecutorFactory } from "./executors/executor-factory";
import { runValidations } from "./validation";
import { ContextBuilder } from "./context-builder";
import { getContextBuilder } from "../utils/ai-service-factory";
import { hooks } from "./hooks";
import { PromptBuilder } from "./prompt-builder";
import chalk from "chalk";

async function executeSingleTask(
  taskId: string,
  tool: ExecutorTool,
  dry: boolean,
  executorConfig?: ExecutorConfig
): Promise<void> {
  // Load task
  const task = await taskService.getTask(taskId);
  if (!task) {
    throw new Error(`Task with ID ${taskId} not found`);
  }

  console.log(
    chalk.blue(
      `🎯 ${dry ? "DRY RUN" : "Executing"} task: ${task.title} (${taskId})`
    )
  );

  // Build comprehensive execution message with full context
  const contextBuilder = getContextBuilder();
  const taskContext = await contextBuilder.buildContext(taskId);

  // Get task plan if available
  const planData = await taskService.getTaskPlan(taskId);

  // Build execution prompt using PromptBuilder
  const promptResult = PromptBuilder.buildExecutionPrompt({
    taskTitle: task.title,
    taskDescription: task.description,
    taskPlan: planData?.plan,
    stack: taskContext.stack,
    documentation: taskContext.documentation,
  });

  if (!promptResult.success) {
    throw new Error(`Failed to build execution prompt: ${promptResult.error}`);
  }

  const executionMessage = promptResult.prompt!;

  if (!dry) {
    // Update task status to in-progress
    await taskService.setTaskStatus(taskId, "in-progress");
    console.log(chalk.yellow("⏳ Task status updated to in-progress"));
  }

  // Emit execution:start event
  await hooks.emit("execution:start", { taskId, tool });

  try {
    // Create executor and run
    const executor = ExecutorFactory.create(tool, executorConfig);

    await executor.execute(executionMessage, dry, executorConfig);

    if (!dry) {
      // Update task status to completed
      await taskService.setTaskStatus(taskId, "completed");
      console.log(chalk.green("✅ Task execution completed successfully"));
    }

    // Emit execution:end event
    await hooks.emit("execution:end", { taskId, success: true });
  } catch (error) {
    // Emit execution:error event
    await hooks.emit("execution:error", {
      taskId,
      error: error instanceof Error ? error : new Error(String(error)),
    });

    if (!dry) {
      // Update task status back to todo on failure
      await taskService.setTaskStatus(taskId, "todo");
      console.log(chalk.red("❌ Task execution failed, status reset to todo"));
    }
    throw error;
  }
}

async function executeTaskWithSubtasks(
  taskId: string,
  tool: ExecutorTool,
  dry: boolean,
  executorConfig?: ExecutorConfig
): Promise<void> {
  const task = await taskService.getTask(taskId);
  if (!task) {
    throw new Error(`Task with ID ${taskId} not found`);
  }

  // Get subtasks
  const subtasks = await taskService.getSubtasks(taskId);

  if (subtasks.length === 0) {
    // No subtasks, execute this task directly
    await executeSingleTask(taskId, tool, dry);
    return;
  }

  // Has subtasks - execute them one by one
  console.log(
    chalk.blue(
      `📋 Task has ${subtasks.length} subtasks, executing recursively...`
    )
  );

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
      await executeTaskWithSubtasks(subtask.id, tool, dry, executorConfig);
    } catch (error) {
      console.error(
        chalk.red(
          `❌ Failed to execute subtask ${subtask.id}: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        )
      );
      throw error;
    }
  }

  // After all subtasks are done, mark the main task as completed
  if (!dry) {
    await taskService.setTaskStatus(taskId, "completed");
    console.log(
      chalk.green(`✅ Main task ${task.title} completed after all subtasks`)
    );
  } else {
    console.log(
      chalk.cyan(
        `🔍 DRY RUN - Main task ${task.title} would be completed after all subtasks`
      )
    );
  }
}

export async function executeTask(options: ExecuteTaskOptions): Promise<void> {
  const {
    taskId,
    tool = "opencode",
    message,
    model,
    continueSession,
    dry = false,
    validate = [],
  } = options;

  // Build executor config from options
  const executorConfig: ExecutorConfig | undefined =
    model || continueSession
      ? {
          model,
          continueLastSession: continueSession,
        }
      : undefined;

  // If custom message is provided, execute just this task (ignore subtasks)
  if (message) {
    const task = await taskService.getTask(taskId);
    if (!task) {
      throw new Error(`Task with ID ${taskId} not found`);
    }

    console.log(
      chalk.blue(
        `🎯 ${
          dry ? "DRY RUN - Would execute" : "Executing"
        } task with custom message: ${task.title} (${taskId})`
      )
    );

    if (!dry) {
      await taskService.setTaskStatus(taskId, "in-progress");
      console.log(chalk.yellow("⏳ Task status updated to in-progress"));
    }

    // Emit execution:start event
    await hooks.emit("execution:start", { taskId, tool });

    try {
      const executor = ExecutorFactory.create(tool, executorConfig);

      await executor.execute(message, dry, executorConfig);

      if (!dry) {
        await taskService.setTaskStatus(taskId, "completed");
        console.log(chalk.green("✅ Task execution completed successfully"));
      }

      // Emit execution:end event
      await hooks.emit("execution:end", { taskId, success: true });

      // Run validations after task completion
      await runValidations(validate, dry);
    } catch (error) {
      if (!dry) {
        await taskService.setTaskStatus(taskId, "todo");
        console.log(
          chalk.red("❌ Task execution failed, status reset to todo")
        );
      }
      // Emit execution:error event
      await hooks.emit("execution:error", {
        taskId,
        error: error instanceof Error ? error : new Error(String(error)),
      });
      throw error;
    }
    return;
  }

  // No custom message - execute recursively with subtasks
  await executeTaskWithSubtasks(taskId, tool, dry, executorConfig);

  // Run validations after all subtasks complete
  await runValidations(validate, dry);
}
