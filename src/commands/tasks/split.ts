import { Command } from "commander";
import chalk from "chalk";
import { taskService } from "../../services/tasks";
import { createStreamingOptions } from "../../utils/streaming-options";
import { displaySubtaskCreation } from "../../cli/display/task";
import { withProgressTracking } from "../../utils/progress-tracking";
import { validateMutuallyExclusive } from "../../utils/cli-validators";
import { executeBulkOperation } from "../../utils/bulk-operations";
import { confirmBulkOperation } from "../../utils/confirmation";
import { SplitCommandOptions } from "../../types/cli-options";
import { wrapCommandHandler } from "../../utils/command-error-handler";

export const splitCommand = new Command("split")
  .description("Split a task into smaller subtasks using AI")
  .option("--task-id <id>", "Task ID to split")
  .option("--all", "Split all existing tasks that don't have subtasks")
  .option("--status <status>", "Filter tasks by status (todo/in-progress/completed)")
  .option("--tag <tag>", "Filter tasks by tag")
  .option("--dry", "Preview what would be split without making changes")
  .option("--force", "Skip confirmation prompt for bulk operations")
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
  .action(wrapCommandHandler("Task splitting", async (options: SplitCommandOptions) => {
    // Validate mutual exclusivity (only if no filters provided)
    if (!options.status && !options.tag) {
      validateMutuallyExclusive(options, "taskId", "all", "task-id", "all");
    }

      const splitSingleTask = async (taskId: string) => {
        if (options.dry) {
          const task = await taskService.getTask(taskId);
          console.log(chalk.blue(`[DRY RUN] Would split: ${task?.title || taskId}`));
          return;
        }

        const streamingOptions = createStreamingOptions(
          options.stream,
          "Task breakdown"
        );

        try {
          const result = await withProgressTracking(async () => {
            return await taskService.splitTask(
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
          });

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
        }
      };

      if (options.taskId) {
        await splitSingleTask(options.taskId);
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
          "split",
          tasks.length,
          options.force
        );

        if (!confirmed) {
          console.log(chalk.yellow("Operation cancelled"));
          return;
        }

        await executeBulkOperation(
          (taskId) => splitSingleTask(taskId),
          {
            operationName: "Splitting",
            operationEmoji: "🔧",
            filters,
          }
        );
      }
  }));
