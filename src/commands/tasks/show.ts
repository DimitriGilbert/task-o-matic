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

      // Fetch all data for pure display function
      const content = task.contentFile
        ? await taskService.getTaskContent(task.id)
        : undefined;
      const aiMetadata = await taskService.getTaskAIMetadata(task.id);
      const subtasks = await taskService.getSubtasks(task.id);

      // Fetch metadata for subtasks
      const subtaskMetadata = new Map();
      for (const subtask of subtasks) {
        const meta = await taskService.getTaskAIMetadata(subtask.id);
        if (meta) {
          subtaskMetadata.set(subtask.id, meta);
        }
      }

      displayTaskDetails({
        task,
        content: content || undefined,
        aiMetadata: aiMetadata || undefined,
        subtasks,
        subtaskMetadata,
      });
    } catch (error) {
      displayError(error);
      process.exit(1);
    }
  });
