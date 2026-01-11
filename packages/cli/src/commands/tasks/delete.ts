import { Command } from "commander";
import chalk from "chalk";
import { taskService } from "task-o-matic-core";
import { displayTaskDelete } from "../../cli/display/task";
import { displayError } from "../../cli/display/progress";
import { formatTaskNotFoundError } from "task-o-matic-core";

export const deleteCommand = new Command("delete")
  .description("Delete a task")
  .requiredOption("--id <id>", "Task ID to delete")
  .option("--force", "Skip confirmation and delete anyway")
  .option("--cascade", "Delete all subtasks as well")
  .action(async (options) => {
    try {
      if (!options.force) {
        const task = await taskService.getTask(options.id);
        if (!task) {
          throw formatTaskNotFoundError(options.id);
        }

        console.log(
          chalk.red(
            `\n⚠️  Are you sure you want to delete task: ${task.title} (${task.id})?`
          )
        );
        console.log(chalk.red("This action cannot be undone."));

        // Simple confirmation - in a real CLI you might want a proper prompt
        console.log(chalk.yellow("Use --force to confirm deletion."));
        return;
      }

      const result = await taskService.deleteTask(options.id, {
        cascade: options.cascade,
        force: options.force,
      });

      displayTaskDelete(result.deleted, result.orphanedSubtasks);
    } catch (error) {
      displayError(error);
      process.exit(1);
    }
  });
