import { Command } from "commander";
import chalk from "chalk";
import { taskService } from "../../services/tasks";
import { createStreamingOptions } from "../../utils/streaming-options";
import { displayProgress, displayError } from "../../cli/display/progress";

export const enhanceCommand = new Command("enhance")
  .description("Enhance an existing task with AI using Context7 documentation")
  .option("--task-id <id>", "Task ID to enhance")
  .option("--all", "Enhance all existing tasks")
  .option("--stream", "Show streaming AI output during enhancement")
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
      if (!options.taskId && !options.all) {
        throw new Error("Either --task-id or --all must be specified");
      }

      if (options.taskId && options.all) {
        throw new Error("Cannot specify both --task-id and --all");
      }

      const enhanceSingleTask = async (taskId: string) => {
        const streamingOptions = createStreamingOptions(
          options.stream,
          "Enhancement"
        );

        const result = await taskService.enhanceTask(
          taskId,
          {
            aiProvider: options.aiProvider,
            aiModel: options.aiModel,
            aiKey: options.aiKey,
            aiProviderUrl: options.aiProviderUrl,
            aiReasoning: options.reasoning,
          },
          streamingOptions,
          {
            onProgress: displayProgress,
            onError: displayError,
          }
        );

        if (result.enhancedContent.length > 200) {
          console.log(chalk.cyan(`  Enhanced content saved to file.`));
        } else {
          console.log(
            chalk.cyan(`  Enhanced content updated in task description.`)
          );
        }

        console.log(chalk.green("✓ Task enhanced with Context7 documentation"));
        console.log(chalk.magenta(`  🤖 Enhanced using Context7 MCP tools`));
      };

      if (options.taskId) {
        await enhanceSingleTask(options.taskId);
      } else if (options.all) {
        const allTasks = await taskService.listTasks({});
        if (allTasks.length === 0) {
          console.log(chalk.yellow("No tasks found to enhance."));
          return;
        }

        console.log(
          chalk.blue(`🤖 Enhancing ${allTasks.length} tasks in order...`)
        );

        for (let i = 0; i < allTasks.length; i++) {
          const task = allTasks[i];
          console.log(
            chalk.cyan(
              `\n[${i + 1}/${allTasks.length}] Enhancing: ${task.title} (${
                task.id
              })`
            )
          );
          try {
            await enhanceSingleTask(task.id);
            console.log(chalk.green(`✓ Enhanced task ${task.id}`));
          } catch (error) {
            console.log(
              chalk.red(
                `❌ Failed to enhance task ${task.id}: ${
                  error instanceof Error ? error.message : "Unknown error"
                }`
              )
            );
          }
        }

        console.log(
          chalk.green(
            `\n✓ Bulk enhancement complete! Processed ${allTasks.length} tasks.`
          )
        );
      }
    } catch (error) {
      displayError(error);
      process.exit(1);
    }
  });
