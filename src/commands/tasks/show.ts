import { Command } from "commander";
import { taskService } from "../../services/tasks";
import { displayTaskDetails } from "../../cli/display/task";
import { displayError } from "../../cli/display/progress";
import { formatTaskNotFoundError } from "../../utils/task-o-matic-error";

export const showCommand = new Command("show")
  .description("Show detailed information about a task")
  .requiredOption("--id <id>", "Task ID")
  .action(async (options) => {
    try {
      const task = await taskService.getTask(options.id);

      if (!task) {
        throw formatTaskNotFoundError(options.id);
      }

      await displayTaskDetails(task);
    } catch (error) {
      displayError(error);
      process.exit(1);
    }
  });
