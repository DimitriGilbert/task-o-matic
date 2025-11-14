import { taskService } from "../services/tasks";
import { ExecuteTaskOptions, ExecutorTool } from "../types";
import { ExecutorFactory } from "./executors/executor-factory";
import { runValidations } from "./validation";
import { ContextBuilder } from "./context-builder";
import chalk from "chalk";

async function executeSingleTask(
  taskId: string,
  tool: ExecutorTool,
  dry: boolean,
): Promise<void> {
  // Load task
  const task = await taskService.getTask(taskId);
  if (!task) {
    throw new Error(`Task with ID ${taskId} not found`);
  }

  console.log(
    chalk.blue(
      `🎯 ${dry ? "DRY RUN" : "Executing"} task: ${task.title} (${taskId})`,
    ),
  );

  // Build comprehensive execution message with full context
  const contextBuilder = new ContextBuilder();
  const taskContext = await contextBuilder.buildContext(taskId);

  // Build execution message with ALL context
  const messageParts: string[] = [];

  // Add task plan if available
  const planData = await taskService.getTaskPlan(taskId);
  if (planData) {
    messageParts.push(`# Task Plan\n\n${planData.plan}\n`);
  } else {
    messageParts.push(`# Task: ${task.title}\n\n${task.description || "No description"}\n`);
  }

  // Add PRD context if available
  if (taskContext.prdContent) {
    messageParts.push(`\n# Product Requirements Document\n\n${taskContext.prdContent}\n`);
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
    if (taskContext.stack.orm !== "none") {
      messageParts.push(`- **ORM**: ${taskContext.stack.orm}\n`);
    }
    messageParts.push(`- **Auth**: ${taskContext.stack.auth}\n`);
    if (taskContext.stack.addons.length > 0) {
      messageParts.push(`- **Addons**: ${taskContext.stack.addons.join(", ")}\n`);
    }
    messageParts.push(`- **Package Manager**: ${taskContext.stack.packageManager}\n`);
  }

  // Add documentation context if available
  if (taskContext.documentation) {
    messageParts.push(`\n# Documentation Context\n\n`);
    messageParts.push(`${taskContext.documentation.recap}\n`);
    if (taskContext.documentation.files.length > 0) {
      messageParts.push(`\n**Relevant Documentation Files**:\n`);
      taskContext.documentation.files.forEach((file) => {
        messageParts.push(`- ${file.path}\n`);
      });
    }
  }

  const executionMessage = messageParts.join('');

  if (dry) {
    console.log(chalk.yellow(`\n📝 Message that would be sent to ${tool}:\n`));
    console.log(chalk.cyan('─'.repeat(80)));
    console.log(chalk.cyan(executionMessage));
    console.log(chalk.cyan('─'.repeat(80)));
  } else {
    // Update task status to in-progress
    await taskService.setTaskStatus(taskId, "in-progress");
    console.log(chalk.yellow("⏳ Task status updated to in-progress"));
  }

  try {
    // Create executor and run
    const executor = ExecutorFactory.create(tool);

    await executor.execute(executionMessage, dry);

    if (!dry) {
      // Update task status to completed
      await taskService.setTaskStatus(taskId, "completed");
      console.log(chalk.green("✅ Task execution completed successfully"));
    }
  } catch (error) {
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
      `📋 Task has ${subtasks.length} subtasks, executing recursively...`,
    ),
  );

  for (let i = 0; i < subtasks.length; i++) {
    const subtask = subtasks[i];
    console.log(
      chalk.cyan(
        `\n[${i + 1}/${subtasks.length}] Executing subtask: ${subtask.title} (${subtask.id})`,
      ),
    );

    try {
      await executeTaskWithSubtasks(subtask.id, tool, dry);
    } catch (error) {
      console.error(
        chalk.red(
          `❌ Failed to execute subtask ${subtask.id}: ${error instanceof Error ? error.message : "Unknown error"}`,
        ),
      );
      throw error;
    }
  }

  // After all subtasks are done, mark the main task as completed
  if (!dry) {
    await taskService.setTaskStatus(taskId, "completed");
    console.log(
      chalk.green(`✅ Main task ${task.title} completed after all subtasks`),
    );
  } else {
    console.log(
      chalk.cyan(
        `🔍 DRY RUN - Main task ${task.title} would be completed after all subtasks`,
      ),
    );
  }
}

export async function executeTask(options: ExecuteTaskOptions): Promise<void> {
  const {
    taskId,
    tool = "opencode",
    message,
    dry = false,
    validate = [],
  } = options;

  // If custom message is provided, execute just this task (ignore subtasks)
  if (message) {
    const task = await taskService.getTask(taskId);
    if (!task) {
      throw new Error(`Task with ID ${taskId} not found`);
    }

    console.log(
      chalk.blue(
        `🎯 ${dry ? "DRY RUN - Would execute" : "Executing"} task with custom message: ${task.title} (${taskId})`,
      ),
    );

    if (dry) {
      console.log(chalk.yellow(`\n📝 Custom message that would be sent to ${tool}:\n`));
      console.log(chalk.cyan('─'.repeat(80)));
      console.log(chalk.cyan(message));
      console.log(chalk.cyan('─'.repeat(80)));
    } else {
      await taskService.setTaskStatus(taskId, "in-progress");
      console.log(chalk.yellow("⏳ Task status updated to in-progress"));
    }

    try {
      const executor = ExecutorFactory.create(tool);

      await executor.execute(message, dry);

      if (!dry) {
        await taskService.setTaskStatus(taskId, "completed");
        console.log(chalk.green("✅ Task execution completed successfully"));
      }

      // Run validations after task completion
      await runValidations(validate, dry);
    } catch (error) {
      if (!dry) {
        await taskService.setTaskStatus(taskId, "todo");
        console.log(
          chalk.red("❌ Task execution failed, status reset to todo"),
        );
      }
      throw error;
    }
    return;
  }

  // No custom message - execute recursively with subtasks
  await executeTaskWithSubtasks(taskId, tool, dry);

  // Run validations after all subtasks complete
  await runValidations(validate, dry);
}
