import chalk from "chalk";
import {
  configManager,
  getAIOperations,
  parseModelString,
} from "task-o-matic-core";

import { displayError, displayProgress } from "../../cli/display/progress";
import { createStreamingOptions } from "../../utils/streaming-options";

export interface AIParallelResult<T> {
  modelId: string;
  data: T;
  stats: any;
}

/**
 * Run AI operations in parallel with progress tracking
 */
export async function runAIParallel<T>(
  models: string[],
  operation: (
    modelConfig: any,
    streamingOptions: any
  ) => Promise<{ data: T; stats: any }>,
  options: {
    description: string;
    showSummary?: boolean;
  }
): Promise<AIParallelResult<T>[]> {
  console.log(
    chalk.blue(
      `\n${options.description} with ${models.length} models concurrently...\n`
    )
  );

  const modelMap = new Map<string, number>();
  const modelStatus = new Map<string, string>();
  const results: Array<AIParallelResult<T>> = [];

  // Print initial lines
  models.forEach((m: string, i: number) => {
    modelMap.set(m, i);
    modelStatus.set(m, "Waiting...");
    console.log(chalk.dim(`- ${m}: Waiting...`));
  });
  const totalModels = models.length;

  // Generate concurrently
  const promises = models.map(async (modelStr: string) => {
    const modelConfig = parseModelString(modelStr);
    const index = modelMap.get(modelStr)!;

    // Update status: Starting
    const up = totalModels - index;
    process.stdout.write(`\x1B[${up}A`);
    process.stdout.write(`\x1B[2K`);
    process.stdout.write(
      `- ${chalk.bold(modelStr)}: ${chalk.yellow("Starting...")}\r`
    );
    process.stdout.write(`\x1B[${up}B`);

    try {
      const streamingOptions = {
        onReasoning: (text: string) => {
          const up = totalModels - index;
          process.stdout.write(`\x1B[${up}A`);
          process.stdout.write(`\x1B[2K`);
          process.stdout.write(
            `- ${chalk.bold(modelStr)}: ${chalk.magenta("Reasoning...")}\r`
          );
          process.stdout.write(`\x1B[${up}B`);
        },
        onChunk: (chunk: string) => {
          const up = totalModels - index;
          process.stdout.write(`\x1B[${up}A`);
          process.stdout.write(`\x1B[2K`);
          process.stdout.write(
            `- ${chalk.bold(modelStr)}: ${chalk.blue("Generating...")}\r`
          );
          process.stdout.write(`\x1B[${up}B`);
        },
      };

      const result = await operation(modelConfig, streamingOptions);

      // Update status: Completed
      const up2 = totalModels - index;
      process.stdout.write(`\x1B[${up2}A`);
      process.stdout.write(`\x1B[2K`);
      process.stdout.write(
        `- ${chalk.bold(modelStr)}: ${chalk.green(
          `Completed (${result.stats.duration}ms)`
        )}\r`
      );
      process.stdout.write(`\x1B[${up2}B`);

      results.push({
        modelId: modelStr,
        data: result.data,
        stats: result.stats,
      });

      return result;
    } catch (error) {
      const up2 = totalModels - index;
      process.stdout.write(`\x1B[${up2}A`);
      process.stdout.write(`\x1B[2K`);
      process.stdout.write(
        `- ${chalk.bold(modelStr)}: ${chalk.red(
          `Failed: ${error instanceof Error ? error.message : String(error)}`
        )}\r`
      );
      process.stdout.write(`\x1B[${up2}B`);
      throw error;
    }
  });

  await Promise.allSettled(promises);

  if (options.showSummary) {
    // Display summary
    console.log(
      chalk.green(
        `\n✓ ${options.description} completed (${results.length}/${models.length} success)\n`
      )
    );
    console.log(
      chalk.bold(
        `${"Model".padEnd(40)} | ${"Duration".padEnd(10)} | ${"TTFT".padEnd(
          10
        )} | ${"Tokens".padEnd(10)}`
      )
    );
    console.log("-".repeat(80));

    results.forEach((r) => {
      const duration = `${r.stats.duration}ms`;
      const ttft = r.stats.timeToFirstToken
        ? `${r.stats.timeToFirstToken}ms`
        : "N/A";
      const tokens = r.stats.tokenUsage
        ? r.stats.tokenUsage.total.toString()
        : "N/A";

      console.log(
        `${r.modelId.padEnd(40)} | ${duration.padEnd(10)} | ${ttft.padEnd(
          10
        )} | ${tokens.padEnd(10)}`
      );
    });
  }

  return results;
}

/**
 * Combine multiple PRDs into a single master PRD
 */
export async function combinePRDs(
  prds: string[],
  description: string,
  modelStr: string,
  stream: boolean,
  reasoningOverride?: string
): Promise<string> {
  console.log(chalk.blue("\nCombining PRDs into master PRD..."));

  const aiOperations = getAIOperations();
  const combineModelConfig = parseModelString(modelStr);
  const streamingOptions = createStreamingOptions(stream, "Combining PRDs");

  return await aiOperations.combinePRDs(
    prds,
    description,
    {
      provider: (combineModelConfig.provider ||
        configManager.getAIConfig().provider) as any,
      model: combineModelConfig.model,
      reasoning:
        reasoningOverride || combineModelConfig.reasoning
          ? {
              maxTokens: parseInt(
                reasoningOverride || combineModelConfig.reasoning || "0"
              ),
            }
          : undefined,
    },
    undefined,
    undefined,
    streamingOptions
  );
}
