import { Command } from "commander";
import chalk from "chalk";
import { taskService } from "task-o-matic-core";
import { createStreamingOptions } from "task-o-matic-core";
import { withProgressTracking } from "../../utils/progress-tracking";
import { validateMutuallyExclusive } from "../../utils/cli-validators";
import { executeBulkOperation } from "../../utils/bulk-operations";
import { confirmBulkOperation } from "../../utils/confirmation";
import { EnhanceCommandOptions } from "../../types/cli-options";
import { wrapCommandHandler } from "task-o-matic-core";

export const enhanceCommand = new Command("enhance")
  .description("Enhance an existing task with AI using Context7 documentation")
  .option("--task-id <id>", "Task ID to enhance")
  .option("--all", "Enhance all existing tasks")
  .option(
    "--status <status>",
    "Filter tasks by status (todo/in-progress/completed)"
  )
  .option("--tag <tag>", "Filter tasks by tag")
  .option("--dry", "Preview what would be enhanced without making changes")
  .option("--force", "Skip confirmation prompt for bulk operations")
  .option("--stream", "Show streaming AI output during enhancement")
  .option("--ai-provider <provider>", "AI provider override")
  .option("--ai-model <model>", "AI model override")
  .option("--ai-key <key>", "AI API key override")
  .option("--ai-provider-url <url>", "AI provider URL override")
  .option(
    "--reasoning <tokens>",
    "Enable reasoning for OpenRouter models (max reasoning tokens)"
  )
  .action(
    wrapCommandHandler(
      "Task enhancement",
      async (options: EnhanceCommandOptions) => {
        // Validate mutual exclusivity (only if no filters provided)
        if (!options.status && !options.tag) {
          validateMutuallyExclusive(options, "taskId", "all", "task-id", "all");
        }

        const enhanceSingleTask = async (taskId: string) => {
          if (options.dry) {
            const task = await taskService.getTask(taskId);
            console.log(
              chalk.blue(`[DRY RUN] Would enhance: ${task?.title || taskId}`)
            );
            return;
          }

          const streamingOptions = createStreamingOptions(
            options.stream,
            "Enhancement"
          );

          const result = await withProgressTracking(async () => {
            return await taskService.enhanceTask(
              taskId,
              {
                aiProvider: options.aiProvider,
                aiModel: options.aiModel,
                aiKey: options.aiKey,
                aiProviderUrl: options.aiProviderUrl,
                aiReasoning: options.reasoning,
              },
              streamingOptions
            );
          });

          if (result.enhancedContent.length > 200) {
            console.log(chalk.cyan(`  Enhanced content saved to file.`));
          } else {
            console.log(
              chalk.cyan(`  Enhanced content updated in task description.`)
            );
          }

          console.log(
            chalk.green("✓ Task enhanced with Context7 documentation")
          );
          console.log(chalk.magenta(`  🤖 Enhanced using Context7 MCP tools`));
        };

        if (options.taskId) {
          await enhanceSingleTask(options.taskId);
        } else {
          // Build filters for bulk operation
          const filters: any = {};
          if (options.status) filters.status = options.status;
          if (options.tag) filters.tag = options.tag;

          // Get task count for confirmation
          const tasks = await taskService.listTasks(filters);

          if (tasks.length === 0) {
            console.log(chalk.yellow("No tasks found matching the filters"));
            return;
          }

          // Confirm bulk operation
          const confirmed = await confirmBulkOperation(
            "enhance",
            tasks.length,
            options.force
          );

          if (!confirmed) {
            console.log(chalk.yellow("Operation cancelled"));
            return;
          }

          await executeBulkOperation((taskId) => enhanceSingleTask(taskId), {
            operationName: "Enhancing",
            operationEmoji: "🤖",
            successMessage: (taskId) => `✓ Enhanced task ${taskId}`,
            filters,
          });
        }
      }
    )
  );
