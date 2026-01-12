import chalk from "chalk";
import { Command } from "commander";
import { taskService } from "task-o-matic-core";

import {
  displayDocumentationAnalysis,
  displayResearchSummary,
} from "../../../cli/display/common";
import type { DocumentCommandOptions } from "../../../types/cli-options";
import { wrapCommandHandler } from "../../../utils/command-error-handler";
import { withProgressTracking } from "../../../utils/progress-tracking";
import { createStreamingOptions } from "../../../utils/streaming-options";

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
  .action(
    wrapCommandHandler(
      "Task documentation",
      async (options: DocumentCommandOptions) => {
        const streamingOptions = createStreamingOptions(
          options.stream,
          "Analysis"
        );

        const result = await withProgressTracking(async () => {
          return await taskService.documentTask(
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
        });

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
      }
    )
  );
