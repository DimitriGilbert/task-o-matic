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
import { runAIParallel } from "../utils/ai-parallel";
import { prdCommand, parseModelString } from "../prd";
import { getAIOperations } from "../../utils/ai-service-factory";
import { SplitTaskResult, ParsedAITask } from "../../types";
import {
  writeFileSync,
  existsSync,
  mkdirSync,
  copyFileSync,
  renameSync,
  unlinkSync,
} from "fs";
import { join } from "path";
import { configManager } from "../../lib/config";

export const splitCommand = new Command("split")
  .description("Split a task into smaller subtasks using AI")
  .option("--task-id <id>", "Task ID to split")
  .option("--all", "Split all existing tasks that don't have subtasks")
  .option(
    "--status <status>",
    "Filter tasks by status (todo/in-progress/completed)"
  )
  .option("--tag <tag>", "Filter tasks by tag")
  .option("--dry", "Preview what would be split without making changes")
  .option("--force", "Skip confirmation prompt for bulk operations")
  .option("--stream", "Show streaming AI output during breakdown")
  .option("--ai-provider <provider>", "AI provider override")
  .option("--ai-key <key>", "AI API key override")
  .option("--ai-provider-url <url>", "AI provider URL override")
  .option(
    "--ai <models...>",
    "AI model(s) to use. Format: [provider:]model[;reasoning[=budget]]"
  )
  .option(
    "--combine-ai <provider:model>",
    "AI model to combine multiple split results"
  )
  .option(
    "--reasoning <tokens>",
    "Enable reasoning for OpenRouter models (max reasoning tokens)"
  )
  .option("--tools", "Enable filesystem tools for project analysis")
  .action(
    wrapCommandHandler(
      "Task splitting",
      async (options: SplitCommandOptions) => {
        // Validate mutual exclusivity (only if no filters provided)
        if (!options.status && !options.tag) {
          validateMutuallyExclusive(options, "taskId", "all", "task-id", "all");
        }

        const splitSingleTask = async (taskId: string) => {
          if (options.dry) {
            const task = await taskService.getTask(taskId);
            console.log(
              chalk.blue(`[DRY RUN] Would split: ${task?.title || taskId}`)
            );
            return;
          }

          const streamingOptions = createStreamingOptions(
            options.stream,
            "Task breakdown"
          );

          try {
            // Check for parallel/multi-model usage
            const cliModels = Array.isArray(options.ai)
              ? options.ai
              : options.ai
              ? [options.ai]
              : [];

            if (cliModels.length > 0 || options.combineAi) {
              const modelsToUse =
                cliModels.length > 0
                  ? cliModels
                  : [
                      `${options.aiProvider || "openai"}:${
                        options.aiModel || "gpt-4o"
                      }`,
                    ];

              const task = await taskService.getTask(taskId);
              if (!task) throw new Error(`Task ${taskId} not found`);

              const taskOMaticDir = configManager.getTaskOMaticDir();
              const tasksJsonPath = join(taskOMaticDir, "tasks.json");
              const aiMetadataPath = join(taskOMaticDir, "ai-metadata.json");
              const tasksBackupPath = join(taskOMaticDir, "tasks.json.bak");
              const aiMetadataBackupPath = join(
                taskOMaticDir,
                "ai-metadata.json.bak"
              );

              // 1. Backup Phase
              if (existsSync(tasksJsonPath)) {
                copyFileSync(tasksJsonPath, tasksBackupPath);
              }
              if (existsSync(aiMetadataPath)) {
                copyFileSync(aiMetadataPath, aiMetadataBackupPath);
              }

              let results: any[] = [];

              try {
                // 2. Parallel Generation (Service-Based)
                // We let the service write to the file. It will be corrupted/racy, but we don't care.
                results = await runAIParallel(
                  modelsToUse,
                  async (modelConfig, streamingOptions) => {
                    const result = await taskService.splitTask(
                      taskId,
                      {
                        aiProvider: modelConfig.provider,
                        aiModel: modelConfig.model,
                        aiKey: options.aiKey,
                        aiProviderUrl: options.aiProviderUrl,
                        aiReasoning: options.reasoning || modelConfig.reasoning,
                      },
                      undefined,
                      undefined,
                      streamingOptions,
                      options.tools
                    );

                    return {
                      data: result.subtasks, // We only care about the returned data
                      stats: result.stats,
                    };
                  },
                  {
                    description: "Splitting Task",
                    showSummary: true,
                  }
                );
              } finally {
                // 3. Restore Phase
                // Restore the original clean state
                if (existsSync(tasksBackupPath)) {
                  renameSync(tasksBackupPath, tasksJsonPath);
                }
                if (existsSync(aiMetadataBackupPath)) {
                  renameSync(aiMetadataBackupPath, aiMetadataPath);
                }
              }

              if (options.combineAi && results.length > 0) {
                const taskLists = results.map((r) => r.data);
                const combineModelConfig = parseModelString(options.combineAi);

                console.log(
                  chalk.blue(
                    `\nCombining ${taskLists.length} subtask lists with ${combineModelConfig.model}...`
                  )
                );

                // Construct the message with drafts
                let draftsMessage =
                  "Here are draft subtask lists generated by multiple models. Please combine them into the best possible single list ensuring strict schema compliance:\n\n";

                results.forEach((r, idx) => {
                  draftsMessage += `--- Model ${
                    idx + 1
                  } Draft ---\n${JSON.stringify(r.data, null, 2)}\n\n`;
                });

                // 4. Service-Based Combination
                const result = await taskService.splitTask(
                  taskId,
                  {
                    aiProvider: combineModelConfig.provider,
                    aiModel: combineModelConfig.model,
                    aiReasoning:
                      options.reasoning || combineModelConfig.reasoning,
                  },
                  undefined,
                  draftsMessage, // Inject drafts
                  createStreamingOptions(options.stream, "Combining"),
                  options.tools
                );

                displaySubtaskCreation(result.subtasks);
              } else if (results.length > 0) {
                // Single select fallback (using service to save cleanly)
                const bestResult = results[0].data;
                console.log(
                  chalk.yellow(
                    "\n⚠️  Multiple models used without --combine-ai. Saving result from first model."
                  )
                );

                const draftsMessage = `Here is the pre-generated subtask list. Please validate and save it exactly as is:\n\n${JSON.stringify(
                  bestResult,
                  null,
                  2
                )}`;

                const result = await taskService.splitTask(
                  taskId,
                  {
                    aiProvider: options.aiProvider,
                    aiModel: options.aiModel,
                    aiReasoning: options.reasoning,
                  },
                  undefined,
                  draftsMessage,
                  createStreamingOptions(options.stream, "Saving"),
                  options.tools
                );

                displaySubtaskCreation(result.subtasks);
              }
            } else {
              // Standard single model execution
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
              console.log(
                chalk.gray(`   Provider: ${result.metadata.aiProvider}`)
              );
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
            }
          } catch (error) {
            if (
              error instanceof Error &&
              error.message.includes("already has")
            ) {
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

          // // Confirm bulk operation
          // const confirmed = await confirmBulkOperation(
          //   "split",
          //   tasks.length,
          //   options.force
          // );

          // if (!confirmed) {
          //   console.log(chalk.yellow("Operation cancelled"));
          //   return;
          // }

          await executeBulkOperation((taskId) => splitSingleTask(taskId), {
            operationName: "Splitting",
            operationEmoji: "🔧",
            filters,
          });
        }
      }
    )
  );
