import { Command } from "commander";
import chalk from "chalk";
import { taskService } from "task-o-matic-core";
import { displayTask } from "../../cli/display/task";
import { displayError } from "../../cli/display/progress";

export const subtasksCommand = new Command("subtasks")
  .description("List subtasks for a task")
  .requiredOption("--id <id>", "Parent task ID")
  .action(async (options) => {
    try {
      const subtasks = await taskService.getSubtasks(options.id);

      if (subtasks.length === 0) {
        console.log(chalk.yellow(`No subtasks found for task ${options.id}`));
        return;
      }

      const parentTask = await taskService.getTask(options.id);
      const parentTitle = parentTask ? parentTask.title : options.id;

      console.log(
        chalk.blue(`\n📋 Subtasks for ${parentTitle} (${options.id}):`)
      );
      console.log("");

      for (let i = 0; i < subtasks.length; i++) {
        const subtask = subtasks[i];
        await displayTask(subtask, { indent: "  ", showSubtasks: false });
      }
    } catch (error) {
      displayError(error);
      process.exit(1);
    }
  });
