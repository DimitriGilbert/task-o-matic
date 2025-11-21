import { Command } from "commander";
import { taskService } from "../../services/tasks";
import { displayTaskDetails } from "../../cli/display/task";
import { displayError } from "../../cli/display/progress";

export const showCommand = new Command("show")
  .description("Show detailed information about a task")
  .requiredOption("--id <id>", "Task ID")
  .action(async (options) => {
    try {
      const task = await taskService.getTask(options.id);

      if (!task) {
        throw new Error(`Task with ID ${options.id} not found`);
      }

      await displayTaskDetails(task);
    } catch (error) {
      displayError(error);
      process.exit(1);
    }
  });
