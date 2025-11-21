import { Command } from "commander";
import chalk from "chalk";
import { taskService } from "../../services/tasks";
import { hooks } from "../../lib/hooks";
import { createStreamingOptions } from "../../utils/streaming-options";
import { displayProgress, displayError } from "../../cli/display/progress";
import {
  displayDocumentationAnalysis,
  displayResearchSummary,
} from "../../cli/display/common";

export const documentCommand = new Command("document")
  .description(
    "Analyze and fetch documentation for a task using AI with Context7"
  )
  .requiredOption("--task-id <id>", "Task ID")
  .option("--force", "Force refresh documentation even if recent")
  .option("--stream", "Show streaming AI output during analysis")
  .option("--ai-provider <provider>", "AI provider override")
  .option("--ai-model <model>", "AI model override")
  .option("--ai-key <key>", "AI API key override")
  .option("--ai-provider-url <url>", "AI provider URL override")
  .option(
    "--reasoning <tokens>",
    "Enable reasoning for OpenRouter models (max reasoning tokens)"
  )
  .action(async (options) => {
    try {
      const streamingOptions = createStreamingOptions(
        options.stream,
        "Analysis"
      );

      const progressHandler = (payload: any) => {
        displayProgress(payload);
      };
      hooks.on("task:progress", progressHandler);

      try {
        const result = await taskService.documentTask(
          options.taskId,
          options.force,
          {
            aiProvider: options.aiProvider,
            aiModel: options.aiModel,
            aiKey: options.aiKey,
            aiProviderUrl: options.aiProviderUrl,
            aiReasoning: options.reasoning,
          },
          streamingOptions
        );

        if (result.documentation && !options.force) {
          const daysSinceFetch =
            (Date.now() - result.documentation.lastFetched) /
            (24 * 60 * 60 * 1000);
          console.log(
            chalk.green(
              `✓ Documentation is fresh (${Math.round(
                daysSinceFetch
              )} days old)`
            )
          );
          console.log(chalk.cyan(`Recap: ${result.documentation.recap}`));
          console.log(
            chalk.blue(
              `Libraries: ${result.documentation.libraries.join(", ")}`
            )
          );
          return;
        }

        if (result.analysis) {
          displayDocumentationAnalysis(result.analysis);
        }

        if (result.documentation?.research) {
          displayResearchSummary(result.documentation);
        }
      } finally {
        hooks.off("task:progress", progressHandler);
      }
    } catch (error) {
      displayError(error);
      process.exit(1);
    }
  });

export const getDocumentationCommand = new Command("get-documentation")
  .description("Get existing documentation for a task")
  .requiredOption("--id <id>", "Task ID")
  .action(async (options) => {
    try {
      const task = await taskService.getTask(options.id);
      if (!task) {
        throw new Error(`Task with ID ${options.id} not found`);
      }

      const documentation = await taskService.getTaskDocumentation(options.id);

      if (!documentation) {
        console.log(
          chalk.yellow(`⚠️  No documentation found for task ${options.id}`)
        );
        console.log(chalk.gray(`   Task: ${task.title}`));
        return;
      }

      console.log(
        chalk.blue(`\n📖 Documentation for Task: ${task.title} (${options.id})`)
      );
      console.log(
        chalk.gray(`   File: .task-o-matic/docs/tasks/${options.id}.md`)
      );
      console.log("");
      console.log(documentation);
    } catch (error) {
      displayError(error);
      process.exit(1);
    }
  });

export const addDocumentationCommand = new Command("add-documentation")
  .description("Add documentation to a task from a file")
  .requiredOption("--id <id>", "Task ID")
  .requiredOption("--doc-file <path>", "Path to documentation file")
  .option("--overwrite", "Overwrite existing documentation")
  .action(async (options) => {
    try {
      const task = await taskService.getTask(options.id);
      if (!task) {
        throw new Error(`Task with ID ${options.id} not found`);
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
    } catch (error) {
      displayError(error);
      process.exit(1);
    }
  });
