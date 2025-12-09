import { Command } from "commander";
import { taskService } from "../../services/tasks";
import { displayTaskList, displayTask } from "../../cli/display/task";
import { displayError } from "../../cli/display/progress";

export const listCommand = new Command("list")
  .description("List all tasks")
  .option("-s, --status <status>", "Filter by status (todo/in-progress/completed)")
  .option("-t, --tag <tag>", "Filter by tag")
  .action(async (options) => {
    try {
      const tasks = await taskService.listTasks({
        status: options.status,
        tag: options.tag,
      });

      displayTaskList(tasks);

      for (const task of tasks) {
        await displayTask(task, { showSubtasks: true });
      }
    } catch (error) {
      displayError(error);
      process.exit(1);
    }
  });
