import { Command } from "commander";
import chalk from "chalk";
import { taskService } from "../../services/tasks";
import { hooks } from "../../lib/hooks";
import { createStreamingOptions } from "../../utils/streaming-options";
import { displayProgress, displayError } from "../../cli/display/progress";
import { displaySubtaskCreation } from "../../cli/display/task";

export const splitCommand = new Command("split")
  .description("Split a task into smaller subtasks using AI")
  .option("--task-id <id>", "Task ID to split")
  .option("--all", "Split all existing tasks that don't have subtasks")
  .option("--stream", "Show streaming AI output during breakdown")
  .option("--ai-provider <provider>", "AI provider override")
  .option("--ai-model <model>", "AI model override")
  .option("--ai-key <key>", "AI API key override")
  .option("--ai-provider-url <url>", "AI provider URL override")
  .option(
    "--reasoning <tokens>",
    "Enable reasoning for OpenRouter models (max reasoning tokens)"
  )
  .option("--tools", "Enable filesystem tools for project analysis")
  .action(async (options) => {
    try {
      if (!options.taskId && !options.all) {
        throw new Error("Either --task-id or --all must be specified");
      }

      if (options.taskId && options.all) {
        throw new Error("Cannot specify both --task-id and --all");
      }

      const splitSingleTask = async (taskId: string) => {
        const streamingOptions = createStreamingOptions(
          options.stream,
          "Task breakdown"
        );

        const progressHandler = (payload: any) => {
          displayProgress(payload);
        };
        hooks.on("task:progress", progressHandler);

        try {
          const result = await taskService.splitTask(
            taskId,
            {
              aiProvider: options.aiProvider,
              aiModel: options.aiModel,
              aiKey: options.aiKey,
              aiProviderUrl: options.aiProviderUrl,
              aiReasoning: options.reasoning,
            },
            undefined,
            undefined,
            streamingOptions,
            options.tools
          );

          displaySubtaskCreation(result.subtasks);

          // Display AI metadata
          console.log(chalk.gray(`\n📊 AI Splitting Details:`));
          console.log(chalk.gray(`   Provider: ${result.metadata.aiProvider}`));
          console.log(chalk.gray(`   Model: ${result.metadata.aiModel}`));
          console.log(
            chalk.gray(`   Subtasks created: ${result.subtasks.length}`)
          );
          console.log(
            chalk.gray(
              `   Confidence: ${
                result.metadata.confidence
                  ? (result.metadata.confidence * 100).toFixed(1)
                  : "N/A"
              }%`
            )
          );
        } catch (error) {
          if (error instanceof Error && error.message.includes("already has")) {
            console.log(chalk.yellow(`⚠️ ${error.message}`));
            return;
          }
          throw error;
        } finally {
          hooks.off("task:progress", progressHandler);
        }
      };

      if (options.taskId) {
        await splitSingleTask(options.taskId);
      } else if (options.all) {
        const allTasks = await taskService.listTasks({});
        if (allTasks.length === 0) {
          console.log(chalk.yellow("No tasks found to split."));
          return;
        }

        console.log(chalk.blue(`🔧 Splitting ${allTasks.length} tasks...`));

        for (let i = 0; i < allTasks.length; i++) {
          const task = allTasks[i];
          console.log(
            chalk.cyan(
              `\n[${i + 1}/${allTasks.length}] Splitting: ${task.title}`
            )
          );
          try {
            await splitSingleTask(task.id);
          } catch (error) {
            console.log(
              chalk.red(
                `❌ Failed to split task ${task.id}: ${
                  error instanceof Error ? error.message : "Unknown error"
                }`
              )
            );
          }
        }

        console.log(
          chalk.green(
            `\n✓ Bulk splitting complete! Processed ${allTasks.length} tasks.`
          )
        );
      }
    } catch (error) {
      displayError(error);
      process.exit(1);
    }
  });
