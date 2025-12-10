import { Command } from "commander";
import { taskService } from "../../services/tasks";
import { displayTaskUpdate } from "../../cli/display/task";
import { displayError } from "../../cli/display/progress";
import {
  createStandardError,
  TaskOMaticErrorCodes,
} from "../../utils/task-o-matic-error";

export const updateCommand = new Command("update")
  .description("Update an existing task")
  .requiredOption("--id <id>", "Task ID to update")
  .option("--title <title>", "New task title")
  .option("--description <description>", "New task description")
  .option("--status <status>", "New status (todo/in-progress/completed)")
  .option("--effort <effort>", "New estimated effort (small/medium/large)")
  .option("--tags <tags>", "New tags (comma-separated)")
  .action(async (options) => {
    try {
      const { id, ...updates } = options;
      if (Object.keys(updates).length === 0) {
        throw createStandardError(
          TaskOMaticErrorCodes.INVALID_INPUT,
          "At least one field must be specified for update",
          {
            suggestions: [
              "Specify a field to update, e.g., --title 'New Title'",
              "Use --help for a list of available options",
            ],
          }
        );
      }

      const updatedTask = await taskService.updateTask(id, {
        title: updates.title,
        description: updates.description,
        status: updates.status,
        effort: updates.effort,
        tags: updates.tags,
      });

      displayTaskUpdate(updatedTask, updates);
    } catch (error) {
      displayError(error);
      process.exit(1);
    }
  });
