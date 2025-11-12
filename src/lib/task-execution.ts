import { getStorage } from "../utils/ai-service-factory";
import { getTaskPlan } from "./tasks/plan";
import { updateTask } from "./tasks/update";
import { ExecuteTaskOptions, ExecutorTool } from "../types";
import { ExecutorFactory } from "./executors/executor-factory";
import { runValidations } from "./validation";
import chalk from "chalk";

async function executeSingleTask(
  taskId: string,
  tool: ExecutorTool,
  dry: boolean,
): Promise<void> {
  // Load task
  const task = await getStorage().getTask(taskId);
  if (!task) {
    throw new Error(`Task with ID ${taskId} not found`);
  }

  console.log(
    chalk.blue(
      `🎯 ${dry ? "DRY RUN" : "Executing"} task: ${task.title} (${taskId})`,
    ),
  );

  // Build execution message
  let executionMessage: string;
  const planData = await getTaskPlan(taskId);
  if (planData) {
    executionMessage = `Execute this task plan:\n\n${planData.plan}`;
  } else {
    executionMessage = `Execute this task: ${task.title}\n\nDescription: ${task.description || "No description"}`;
  }

  if (!dry) {
    //   console.log(chalk.yellow(`📝 Message that would be sent:`));
    //   console.log(chalk.cyan(executionMessage));
    // } else {
    // Update task status to in-progress
    await updateTask({ id: taskId, status: "in-progress" });
    console.log(chalk.yellow("⏳ Task status updated to in-progress"));
  }

  try {
    // Create executor and run
    const executor = ExecutorFactory.create(tool);
    console.log(chalk.cyan(`🔧 Using executor: ${executor.name}`));

    await executor.execute(executionMessage, dry);

    if (!dry) {
      // Update task status to completed
      await updateTask({ id: taskId, status: "completed" });
      console.log(chalk.green("✅ Task execution completed successfully"));
    }
  } catch (error) {
    if (!dry) {
      // Update task status back to todo on failure
      await updateTask({ id: taskId, status: "todo" });
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
  const task = await getStorage().getTask(taskId);
  if (!task) {
    throw new Error(`Task with ID ${taskId} not found`);
  }

  // Get subtasks
  const subtasks = await getStorage().getSubtasks(taskId);

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
    await updateTask({ id: taskId, status: "completed" });
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
    const task = await getStorage().getTask(taskId);
    if (!task) {
      throw new Error(`Task with ID ${taskId} not found`);
    }

    console.log(
      chalk.blue(
        `🎯 ${dry ? "DRY RUN - Would execute" : "Executing"} task with custom message: ${task.title} (${taskId})`,
      ),
    );

    if (dry) {
      console.log(chalk.yellow(`📝 Custom message that would be sent:`));
      console.log(chalk.cyan(message));
    } else {
      await updateTask({ id: taskId, status: "in-progress" });
      console.log(chalk.yellow("⏳ Task status updated to in-progress"));
    }

    try {
      const executor = ExecutorFactory.create(tool);
      console.log(chalk.cyan(`🔧 Using executor: ${executor.name}`));

      await executor.execute(message, dry);

      if (!dry) {
        await updateTask({ id: taskId, status: "completed" });
        console.log(chalk.green("✅ Task execution completed successfully"));
      }

      // Run validations after task completion
      await runValidations(validate, dry);
    } catch (error) {
      if (!dry) {
        await updateTask({ id: taskId, status: "todo" });
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
