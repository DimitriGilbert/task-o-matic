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
import { runAIParallel, combineSubtasks } from "../utils/ai-parallel";
import { prdCommand, parseModelString } from "../prd";
import { getAIOperations } from "../../utils/ai-service-factory";
import { SplitTaskResult, ParsedAITask } from "../../types";
import { writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";

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
            // Support multi-model if array of models provided in options.ai (added to command option below)
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
                    ]; // Fallback if simple flags used?
              // Actually if cliModels empty but combineAi is set, we might default to existing logic OR just error?
              // Let's assume if they use --combine-ai they probably want parallel, but if not, single model logic below handles it unless we force it here.
              // For now, only enter parallel block if explicit --ai list is given OR if we want to force combine on single model (unlikely).

              const task = await taskService.getTask(taskId);
              if (!task) throw new Error(`Task ${taskId} not found`);

              const aiOperations = getAIOperations();

              // Parallel execution
              const results = await runAIParallel(
                modelsToUse,
                async (modelConfig, streamingOptions) => {
                  // We use aiOperations.breakdownTask directly to avoid side effects (saving)
                  const subtasks = await aiOperations.breakdownTask(
                    task,
                    {
                      provider: modelConfig.provider as any,
                      model: modelConfig.model,
                      reasoning: options.reasoning
                        ? { maxTokens: parseInt(options.reasoning) }
                        : modelConfig.reasoning
                        ? { maxTokens: parseInt(modelConfig.reasoning) }
                        : undefined,
                    },
                    undefined,
                    undefined,
                    streamingOptions,
                    undefined,
                    task.content, // full content
                    undefined, // stack info
                    undefined, // existing subtasks (we ignore for parallel gen to let them all gen freely)
                    options.tools ?? false
                  );

                  // Save intermediate result
                  const safeModel = (modelConfig.model || "")
                    .replace(/[^a-z0-9]/gi, "-")
                    .toLowerCase();
                  const filename = `subtasks-${modelConfig.provider}-${safeModel}.json`;
                  const tasksDir = join(
                    process.cwd(),
                    ".task-o-matic",
                    "tasks"
                  );

                  if (!existsSync(tasksDir)) {
                    mkdirSync(tasksDir, { recursive: true });
                  }

                  const outputPath = join(tasksDir, filename);

                  try {
                    writeFileSync(
                      outputPath,
                      JSON.stringify(subtasks, null, 2)
                    );
                  } catch (e) {
                    // ignore
                  }

                  return {
                    data: subtasks as ParsedAITask[],
                    stats: { duration: 0 }, // simplified stats
                  };
                },
                {
                  description: "Splitting Task",
                  showSummary: true,
                }
              );

              let finalSubtasks: ParsedAITask[] = [];

              if (options.combineAi && results.length > 0) {
                const subtaskLists = results.map((r) => r.data);
                const combineModelConfig = parseModelString(options.combineAi);
                const reasoning =
                  options.reasoning || combineModelConfig.reasoning;

                finalSubtasks = await combineSubtasks(
                  subtaskLists,
                  options.combineAi,
                  options.stream ?? false,
                  task.title,
                  task.description || "",
                  reasoning
                );
              } else if (results.length > 0) {
                finalSubtasks = results[0].data;
                if (results.length > 1) {
                  console.log(
                    chalk.yellow(
                      "\n⚠️  Multiple models used but no --combine-ai specified. Saving splits from first model only."
                    )
                  );
                }
              }

              // Save subtasks
              const createdSubtasks = [];
              for (const st of finalSubtasks) {
                const subtask = await taskService.createTask({
                  title: st.title,
                  content: st.content || st.description,
                  parentId: taskId,
                  effort: st.effort as "small" | "medium" | "large" | undefined,
                });
                createdSubtasks.push(subtask);
              }

              displaySubtaskCreation(createdSubtasks.map((r) => r.task));
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

          await executeBulkOperation((taskId) => splitSingleTask(taskId), {
            operationName: "Splitting",
            operationEmoji: "🔧",
            filters,
          });
        }
      }
    )
  );
