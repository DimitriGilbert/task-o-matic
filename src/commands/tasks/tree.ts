import { Command } from "commander";
import { taskService } from "../../services/tasks";
import { displayTaskTree } from "../../cli/display/task";
import { displayError } from "../../cli/display/progress";

export const treeCommand = new Command("tree")
  .description("Display hierarchical task tree")
  .option(
    "--id <id>",
    "Root task ID (optional - shows full tree if not specified)"
  )
  .action(async (options) => {
    try {
      const tasks = await taskService.getTaskTree(options.id);
      await displayTaskTree(tasks, options.id);
    } catch (error) {
      displayError(error);
      process.exit(1);
    }
  });
