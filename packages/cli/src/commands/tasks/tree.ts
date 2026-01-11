import { Command } from "commander";
import { taskService } from "task-o-matic-core";
import { displayTaskTree } from "../../cli/display/task";
import { displayError } from "../../cli/display/progress";
import { Task } from "task-o-matic-core";

/**
 * Build a map of task ID to subtasks by traversing the task tree
 */
async function buildSubtasksMap(tasks: Task[]): Promise<Map<string, Task[]>> {
  const map = new Map<string, Task[]>();
  const queue = [...tasks];

  while (queue.length > 0) {
    const task = queue.shift()!;
    const subtasks = await taskService.getSubtasks(task.id);
    map.set(task.id, subtasks);
    queue.push(...subtasks);
  }

  return map;
}

export const treeCommand = new Command("tree")
  .description("Display hierarchical task tree")
  .option(
    "--id <id>",
    "Root task ID (optional - shows full tree if not specified)"
  )
  .action(async (options) => {
    try {
      const tasks = await taskService.getTaskTree(options.id);

      // Pre-fetch all subtasks for the tree
      const subtasksMap = await buildSubtasksMap(tasks);

      displayTaskTree({
        tasks,
        subtasksMap,
        rootId: options.id,
      });
    } catch (error) {
      displayError(error);
      process.exit(1);
    }
  });
