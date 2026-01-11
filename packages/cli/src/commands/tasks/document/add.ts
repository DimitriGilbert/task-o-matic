import { Command } from "commander";
import chalk from "chalk";
import { taskService } from "@task-o-matic/core";
import { wrapCommandHandler } from "@task-o-matic/core";
import { formatTaskNotFoundError } from "@task-o-matic/core";
import { AddDocumentationCommandOptions } from "../../../types/cli-options";

export const addDocumentationCommand = new Command("add-documentation")
  .description("Add documentation to a task from a file")
  .requiredOption("-i, --id <id>", "Task ID")
  .requiredOption("-f, --doc-file <path>", "Path to documentation file")
  .option("-o, --overwrite", "Overwrite existing documentation")
  .action(
    wrapCommandHandler(
      "Add documentation",
      async (options: AddDocumentationCommandOptions) => {
        const task = await taskService.getTask(options.id);
        if (!task) {
          throw formatTaskNotFoundError(options.id);
        }

        // Check if documentation already exists
        const existingDoc = await taskService.getTaskDocumentation(options.id);
        if (existingDoc && !options.overwrite) {
          console.log(
            chalk.yellow(
              `⚠️  Documentation already exists for task ${options.id}`
            )
          );
          console.log(
            chalk.gray(`   Use --overwrite to replace existing documentation`)
          );
          return;
        }

        const result = await taskService.addTaskDocumentationFromFile(
          options.id,
          options.docFile
        );

        console.log(
          chalk.green(
            `✓ Documentation added to task: ${task.title} (${options.id})`
          )
        );
        console.log(chalk.gray(`   Source file: ${options.docFile}`));
        console.log(chalk.gray(`   Saved to: ${result.filePath}`));

        if (options.overwrite) {
          console.log(chalk.cyan(`   Previous documentation was overwritten`));
        }
      }
    )
  );
