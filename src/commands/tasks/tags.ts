import { Command } from "commander";
import { taskService } from "../../services/tasks";
import { displayTagsUpdate } from "../../cli/display/task";
import { displayError } from "../../cli/display/progress";

export const addTagsCommand = new Command("add-tags")
  .description("Add tags to a task")
  .requiredOption("--id <id>", "Task ID")
  .requiredOption("--tags <tags>", "Tags to add (comma-separated)")
  .action(async (options) => {
    try {
      const tags = options.tags.split(",").map((tag: string) => tag.trim());
      const updatedTask = await taskService.addTags(options.id, tags);

      displayTagsUpdate(updatedTask, tags, []);
    } catch (error) {
      displayError(error);
      process.exit(1);
    }
  });

export const removeTagsCommand = new Command("remove-tags")
  .description("Remove tags from a task")
  .requiredOption("--id <id>", "Task ID")
  .requiredOption("--tags <tags>", "Tags to remove (comma-separated)")
  .action(async (options) => {
    try {
      const tags = options.tags.split(",").map((tag: string) => tag.trim());
      const updatedTask = await taskService.removeTags(options.id, tags);

      displayTagsUpdate(updatedTask, [], tags);
    } catch (error) {
      displayError(error);
      process.exit(1);
    }
  });
