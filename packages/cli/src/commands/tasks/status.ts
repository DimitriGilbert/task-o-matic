import { Command } from "commander";
import { taskService } from "@task-o-matic/core";
import { displayTaskStatusChange } from "../../cli/display/task";
import { displayError } from "../../cli/display/progress";
import { formatTaskNotFoundError } from "@task-o-matic/core";

export const statusCommand = new Command("status")
  .description("Set task status")
  .requiredOption("-i, --id <id>", "Task ID")
  .requiredOption(
    "-s, --status <status>",
    "New status (todo/in-progress/completed)"
  )
  .action(async (options) => {
    try {
      const task = await taskService.getTask(options.id);
      if (!task) {
        throw formatTaskNotFoundError(options.id);
      }

      const oldStatus = task.status;
      const updatedTask = await taskService.setTaskStatus(
        options.id,
        options.status
      );

      displayTaskStatusChange(updatedTask, oldStatus, options.status);
    } catch (error) {
      displayError(error);
      process.exit(1);
    }
  });
