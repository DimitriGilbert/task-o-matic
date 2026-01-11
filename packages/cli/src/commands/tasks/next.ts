import { Command } from "commander";
import chalk from "chalk";
import { taskService } from "task-o-matic-core";
import { displayNextTask } from "../../cli/display/task";
import { displayError } from "../../cli/display/progress";

export const nextCommand = new Command("get-next")
  .description("Get the next task to work on (defaults to hierarchical order)")
  .option("-s, --status <status>", "Filter by status (todo/in-progress)")
  .option("-t, --tag <tag>", "Filter by tag")
  .option("-e, --effort <effort>", "Filter by effort (small/medium/large)")
  .option(
    "-p, --priority <priority>",
    "Sort priority (newest/oldest/effort)",
    "hierarchical"
  )
  .action(async (options) => {
    try {
      // Default to todo status if not specified
      const searchOptions = {
        ...options,
        status: options.status || "todo",
      };

      const nextTask = await taskService.getNextTask(searchOptions);

      if (!nextTask) {
        console.log(chalk.yellow("No tasks found matching the criteria."));
        return;
      }

      const criteria = [
        searchOptions.status && `status: ${searchOptions.status}`,
        options.tag && `tag: ${options.tag}`,
        options.effort && `effort: ${options.effort}`,
        options.priority && `priority: ${options.priority}`,
      ]
        .filter(Boolean)
        .join(", ");

      displayNextTask(nextTask, criteria || "next todo task");
    } catch (error) {
      displayError(error);
      process.exit(1);
    }
  });
