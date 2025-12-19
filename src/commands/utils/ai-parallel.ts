import chalk from "chalk";
import { getAIOperations } from "../../utils/ai-service-factory";
import { displayProgress, displayError } from "../../cli/display/progress";
import { prdCommand, parseModelString } from "../prd";
import { createStreamingOptions } from "../../utils/streaming-options";
import { Task, ParsedAITask } from "../../types";
import { configManager } from "../../lib/config";
import {
  PRD_PARSING_SYSTEM_PROMPT,
  TASK_BREAKDOWN_SYSTEM_PROMPT,
} from "../../prompts";

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

/**
 * Combine multiple lists of subtasks into a unified list
 */
export async function combineSubtasks(
  subtaskLists: ParsedAITask[][],
  modelStr: string,
  stream: boolean,
  taskTitle: string,
  taskDescription: string,
  reasoningOverride?: string
): Promise<ParsedAITask[]> {
  console.log(chalk.blue("\nCombining subtasks into unified plan..."));

  const aiOperations = getAIOperations();
  const combineModelConfig = parseModelString(modelStr);

  const prompt = `
    You are an expert project manager. I have asked multiple AI models to break down the following task into subtasks:
    
    TASK TITLE: ${taskTitle}
    TASK DESCRIPTION:
    ${taskDescription}

    Use these multiple perspectives to create ONE single, optimal list of subtasks.
    
    ## CORE OBJECTIVE
    Merge the proposals into a single, cohesive list.
    - Merge duplicates and redundant suggestions.
    - Select the best-described and most actionable subtasks.
    - Ensure logical dependencies between subtasks.
    
    ## STRICT FORMATTING RULES
    The input subtasks adhere to strict formatting rules (sizing, IDs, schema).
    Your output MUST also strictly adhere to these same rules.

    HERE ARE THE RULES YOU MUST FOLLOW (same as the generation phase):
    ${TASK_BREAKDOWN_SYSTEM_PROMPT}
    
    HERE ARE THE PROPOSALS TO MERGE:
    ${JSON.stringify(subtaskLists, null, 2)}
  `;

  const streamingOptions = createStreamingOptions(stream, "Combining subtasks");

  const responseText = await aiOperations.streamText(
    prompt,
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
    "You are a helpful AI project manager that merges task lists.",
    undefined,
    streamingOptions
  );

  // Parse JSON from response
  try {
    // Simple regex to find the JSON array if surrounded by markdown
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return JSON.parse(responseText);
  } catch (e) {
    console.warn(
      chalk.yellow(
        "Failed to parse combined subtasks, falling back to first result."
      )
    );
    return subtaskLists[0]; // Fallback
  }
}

/**
 * Combine multiple lists of parsed tasks (from PRD) into a unified list
 */
export async function combineParsedTasks(
  taskLists: Task[][],
  modelStr: string,
  stream: boolean,
  prdContent: string,
  reasoningOverride?: string
): Promise<Task[]> {
  console.log(
    chalk.blue("\nCombining parsed task lists into unified project plan...")
  );

  const aiOperations = getAIOperations();
  const combineModelConfig = parseModelString(modelStr);

  const prompt = `
    You are an expert product manager. I have asked multiple AI models to parse this PRD into tasks:
    
    PRD CONTENT (Excerpt):
    ${prdContent.substring(0, 1000)}...

    Use these multiple perspectives to create ONE single, optimal list of tasks.
    
    ## CORE OBJECTIVE
    Merge the proposals into a single, optimal list of development phases.
    - Merge duplicates and overlap.
    - Ensure comprehensive coverage of the PRD.
    
    ## STRICT FORMATTING RULES
    The input tasks adhere to strict formatting rules (sizing, IDs, schema).
    Your output MUST also strictly adhere to these same rules.

    HERE ARE THE RULES YOU MUST FOLLOW (same as the generation phase):
    ${PRD_PARSING_SYSTEM_PROMPT}
    
    HERE ARE THE PROPOSALS TO MERGE:
    ${JSON.stringify(taskLists, null, 2)}
  `;

  const streamingOptions = createStreamingOptions(stream, "Combining tasks");

  const responseText = await aiOperations.streamText(
    prompt,
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
    "You are a helpful AI product manager that merges task lists.",
    undefined,
    streamingOptions
  );

  // Parse JSON from response
  try {
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return JSON.parse(responseText);
  } catch (e) {
    console.warn(
      chalk.yellow(
        "Failed to parse combined tasks, falling back to first result."
      )
    );
    return taskLists[0]; // Fallback
  }
}
