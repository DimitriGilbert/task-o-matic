import { Command } from "commander";
import chalk from "chalk";
import { taskService } from "../../../services/tasks";
import { createStreamingOptions } from "../../../utils/streaming-options";
import { displayPlanCreation } from "../../../cli/display/plan";
import { withProgressTracking } from "../../../utils/progress-tracking";
import { wrapCommandHandler } from "../../../utils/command-error-handler";
import { PlanCommandOptions } from "../../../types/cli-options";

export const planCommand = new Command("plan")
  .description("Create detailed implementation plan for a task or subtask")
  .requiredOption("--id <id>", "Task or subtask ID to plan")
  .option("--stream", "Show streaming AI output during planning")
  .option("--ai-provider <provider>", "AI provider override")
  .option("--ai-model <model>", "AI model override")
  .option("--ai-key <key>", "AI API key override")
  .option("--ai-provider-url <url>", "AI provider URL override")
  .option(
    "--reasoning <tokens>",
    "Enable reasoning for OpenRouter models (max reasoning tokens)"
  )
  .action(wrapCommandHandler("Task planning", async (options: PlanCommandOptions) => {
    const streamingOptions = createStreamingOptions(
      options.stream,
      "Planning"
    );

    const result = await withProgressTracking(async () => {
      return await taskService.planTask(
        options.id,
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

    // Display the plan
    displayPlanCreation(options.id, result.task.title);
    console.log(chalk.cyan(result.plan));
  }));
