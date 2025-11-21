import { Command } from "commander";
import { taskService } from "../../services/tasks";
import { hooks } from "../../lib/hooks";
import { createStreamingOptions } from "../../utils/streaming-options";
import { displayProgress, displayError } from "../../cli/display/progress";
import { displayEnhancementResult } from "../../cli/display/common";
import { displayCreatedTask } from "../../cli/display/task";

export const createCommand = new Command("create")
  .description("Create a new task with AI enhancement using Context7")
  .requiredOption("--title <title>", "Task title")
  .option("--content <content>", "Task content (supports markdown)")
  .option("--effort <effort>", "Estimated effort (small/medium/large)")
  .option("--parent-id <id>", "Parent task ID (creates subtask)")
  .option("--ai-enhance", "Enhance task with AI using Context7 documentation")
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
      const streamingOptions = createStreamingOptions(
        options.aiEnhance && options.stream,
        "Enhancement"
      );

      const progressHandler = (payload: any) => {
        displayProgress(payload);
      };
      hooks.on("task:progress", progressHandler);

      try {
        const result = await taskService.createTask({
          title: options.title,
          content: options.content,
          parentId: options.parentId,
          effort: options.effort,
          aiEnhance: options.aiEnhance,
          aiOptions: {
            aiProvider: options.aiProvider,
            aiModel: options.aiModel,
            aiKey: options.aiKey,
            aiProviderUrl: options.aiProviderUrl,
            aiReasoning: options.reasoning,
          },
          streamingOptions,
        });

        displayEnhancementResult(options.aiEnhance && options.stream);
        displayCreatedTask(result.task, result.aiMetadata);
      } finally {
        hooks.off("task:progress", progressHandler);
      }
    } catch (error) {
      displayError(error);
      process.exit(1);
    }
  });
