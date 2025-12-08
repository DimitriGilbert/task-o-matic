import { Command } from "commander";
import chalk from "chalk";
import { executeTaskLoop } from "../../lib/task-loop-execution";
import {
  ExecuteLoopOptions,
  ExecutorTool,
  ModelAttemptConfig,
} from "../../types";

// Valid executor tools
const VALID_EXECUTORS: ExecutorTool[] = [
  "opencode",
  "claude",
  "gemini",
  "codex",
];

/**
 * Parse --try-models option into ModelAttemptConfig array
 * Supports formats:
 * - "model1,model2,model3" - just models (uses default executor)
 * - "opencode:gpt-4o,claude:sonnet-4" - executor:model format
 * - Mixed: "gpt-4o,claude:sonnet-4,gemini:gemini-2.0"
 */
function parseTryModels(value: string): ModelAttemptConfig[] {
  return value.split(",").map((item) => {
    const trimmed = item.trim();

    // Check if it includes executor specification (executor:model format)
    if (trimmed.includes(":")) {
      const [executor, model] = trimmed.split(":");

      if (!VALID_EXECUTORS.includes(executor as ExecutorTool)) {
        throw new Error(
          `Invalid executor "${executor}" in --try-models. Must be one of: ${VALID_EXECUTORS.join(
            ", "
          )}`
        );
      }

      return {
        executor: executor as ExecutorTool,
        model: model.trim(),
      };
    }

    // Just a model name - use default executor
    return {
      model: trimmed,
    };
  });
}

export const executeLoopCommand = new Command("execute-loop")
  .description(
    "Execute multiple tasks in a loop with retry logic and verification"
  )
  .option(
    "--status <status>",
    "Filter tasks by status (todo/in-progress/completed)"
  )
  .option("--tag <tag>", "Filter tasks by tag")
  .option(
    "--ids <ids>",
    "Comma-separated list of task IDs to execute",
    (value: string) => value.split(",").map((id) => id.trim())
  )
  .option(
    "--tool <tool>",
    "External tool to use (opencode/claude/gemini/codex)",
    "opencode"
  )
  .option(
    "--max-retries <number>",
    "Maximum number of retries per task",
    (value: string) => parseInt(value, 10),
    3
  )
  .option(
    "--try-models <models>",
    "Progressive model/executor configs for each retry (e.g., 'gpt-4o-mini,gpt-4o,claude:sonnet-4')"
  )
  .option(
    "--verify <command>",
    "Verification command to run after each task (can be used multiple times)",
    (value: string, previous: string[] = []) => {
      return [...previous, value];
    }
  )
  .option(
    "--auto-commit",
    "Automatically commit changes after each task",
    false
  )
  .option("--plan", "Generate an implementation plan before execution", false)
  .option(
    "--plan-model <model>",
    "Model/executor to use for planning (e.g., 'opencode:gpt-4o' or 'gpt-4o')"
  )
  .option("--review-plan", "Pause for human review of the plan", false)
  .option("--review", "Run AI review after execution", false)
  .option(
    "--review-model <model>",
    "Model/executor to use for review (e.g., 'opencode:gpt-4o' or 'gpt-4o')"
  )
  .option("--dry", "Show what would be executed without running it", false)
  .action(async (options) => {
    try {
      // Validate tool
      if (!VALID_EXECUTORS.includes(options.tool)) {
        console.error(
          chalk.red(
            `Invalid tool: ${options.tool}. Must be one of: ${VALID_EXECUTORS.join(
              ", "
            )}`
          )
        );
        process.exit(1);
      }

      // Parse tryModels if provided
      let tryModels: ModelAttemptConfig[] | undefined;
      if (options.tryModels) {
        try {
          tryModels = parseTryModels(options.tryModels);
          console.log(
            chalk.cyan(
              `📊 Progressive model escalation configured with ${tryModels.length} model(s):`
            )
          );
          tryModels.forEach((config, index) => {
            const executorInfo = config.executor
              ? `${config.executor}:`
              : "default:";
            const modelInfo = config.model || "default model";
            console.log(
              chalk.cyan(`   ${index + 1}. ${executorInfo}${modelInfo}`)
            );
          });
          console.log();
        } catch (error) {
          console.error(
            chalk.red(
              `Failed to parse --try-models: ${
                error instanceof Error ? error.message : "Unknown error"
              }`
            )
          );
          process.exit(1);
        }
      }

      // Build options
      const executeOptions: ExecuteLoopOptions = {
        filters: {
          status: options.status,
          tag: options.tag,
          taskIds: options.ids,
        },
        tool: options.tool as ExecutorTool,
        config: {
          maxRetries: options.maxRetries,
          verificationCommands: options.verify || [],
          autoCommit: options.autoCommit,
          tryModels,
          plan: options.plan,
          planModel: options.planModel,
          reviewPlan: options.reviewPlan,
          review: options.review,
          reviewModel: options.reviewModel,
        },
        dry: options.dry,
      };

      // Execute task loop
      const result = await executeTaskLoop(executeOptions);

      // Exit with error code if any tasks failed
      if (result.failedTasks > 0) {
        console.error(
          chalk.red(
            `\n❌ ${result.failedTasks} task(s) failed. See logs above for details.`
          )
        );
        process.exit(1);
      }

      console.log(
        chalk.green(
          `\n✅ All ${result.completedTasks} task(s) completed successfully!`
        )
      );
    } catch (error) {
      console.error(
        chalk.red("Execute loop failed:"),
        error instanceof Error ? error.message : "Unknown error"
      );
      process.exit(1);
    }
  });
