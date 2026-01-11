import { Command } from "commander";
import chalk from "chalk";
import { taskService } from "task-o-matic-core";
import { wrapCommandHandler } from "task-o-matic-core";
import { formatTaskNotFoundError } from "task-o-matic-core";
import { GetDocumentationCommandOptions } from "../../../types/cli-options";

export const getDocumentationCommand = new Command("get-documentation")
  .description("Get existing documentation for a task")
  .requiredOption("--id <id>", "Task ID")
  .action(
    wrapCommandHandler(
      "Get documentation",
      async (options: GetDocumentationCommandOptions) => {
        const task = await taskService.getTask(options.id);
        if (!task) {
          throw formatTaskNotFoundError(options.id);
        }

        const documentation = await taskService.getTaskDocumentation(
          options.id
        );

        if (!documentation) {
          console.log(
            chalk.yellow(`⚠️  No documentation found for task ${options.id}`)
          );
          console.log(chalk.gray(`   Task: ${task.title}`));
          return;
        }

        console.log(
          chalk.blue(
            `\n📖 Documentation for Task: ${task.title} (${options.id})`
          )
        );
        console.log(
          chalk.gray(`   File: .task-o-matic/docs/tasks/${options.id}.md`)
        );
        console.log("");
        console.log(documentation);
      }
    )
  );
