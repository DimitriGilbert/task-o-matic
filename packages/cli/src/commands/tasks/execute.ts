import { Command } from "commander";
import chalk from "chalk";
import { executeTask } from "task-o-matic-core";
import { ModelAttemptConfig } from "task-o-matic-core";
import {
  parseTryModels,
  validateExecutor,
  VALID_EXECUTORS,
} from "task-o-matic-core";
import { ExecuteCommandOptions } from "../../types/cli-options";
import { wrapCommandHandler } from "../../utils/command-error-handler";
import { textInputPrompt } from "../../utils/workflow-prompts";

export const executeCommand = new Command("execute")
  .description("Execute a task using an external coding assistant")
  .requiredOption("--id <id>", "Task ID to execute")
  .option(
    "--tool <tool>",
    "External tool to use (opencode/claude/gemini/codex)",
    "opencode"
  )
  .option(
    "--message <message>",
    "Custom message to send to the tool (uses task plan if not provided)"
  )
  .option("-m, --model <model>", "Model to use with the executor")
  .option(
    "--continue-session",
    "Continue the last session (for error feedback)",
    false
  )
  .option("--dry", "Show what would be executed without running it")
  .option(
    "--validate <command>",
    "Validation/verification command to run after execution (can be used multiple times)",
    (value: string, previous: string[] = []) => {
      return [...previous, value];
    }
  )
  .option(
    "--verify <command>",
    "Alias for --validate (verification command)",
    (value: string, previous: string[] = []) => {
      return [...previous, value];
    }
  )
  .option(
    "--max-retries <number>",
    "Maximum number of retries (opt-in, enables retry logic)",
    (value: string) => parseInt(value, 10)
  )
  .option(
    "--try-models <models>",
    "Progressive model/executor configs for retries (e.g., 'gpt-4o-mini,claude:sonnet-4')"
  )
  .option("--plan", "Generate an implementation plan before execution", false)
  .option(
    "--plan-model <model>",
    "Model/executor to use for planning (e.g., 'opencode:gpt-4o' or 'gpt-4o')"
  )
  .option(
    "--plan-tool <tool>",
    "Tool/Executor to use for planning (defaults to --tool)"
  )
  .option("--review-plan", "Pause for human review of the plan", false)
  .option("--review", "Run AI review after execution", false)
  .option(
    "--review-model <model>",
    "Model/executor to use for review (e.g., 'opencode:gpt-4o' or 'gpt-4o')"
  )
  .option(
    "--auto-commit",
    "Automatically commit changes after execution",
    false
  )
  .option("--include-prd", "Include PRD content in execution context", false)
  .action(
    wrapCommandHandler(
      "Task execution",
      async (options: ExecuteCommandOptions) => {
        // Validate executor tool
        if (!validateExecutor(options.tool)) {
          console.error(
            chalk.red(
              `Invalid tool: ${
                options.tool
              }. Must be one of: ${VALID_EXECUTORS.join(", ")}`
            )
          );
          process.exit(1);
        }

        // Combine both --validate and --verify options
        const validations = [
          ...(options.validate || []),
          ...(options.verify || []),
        ];

        // Parse tryModels if provided
        let tryModels: ModelAttemptConfig[] | undefined;
        if (options.tryModels) {
          try {
            tryModels = parseTryModels(options.tryModels);
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

        await executeTask({
          taskId: options.id,
          tool: options.tool,
          message: options.message,
          model: options.model,
          continueSession: options.continueSession,
          dry: options.dry,
          validate: validations,
          maxRetries: options.maxRetries,
          tryModels,
          plan: options.plan,
          planModel: options.planModel,
          planTool: options.planTool,
          reviewPlan: options.reviewPlan,
          review: options.review,
          reviewModel: options.reviewModel,
          autoCommit: options.autoCommit,
          includePrd: options.includePrd,
          onPlanReview: async (planFile: string) => {
            return await textInputPrompt(
              `Enter feedback to refine the plan (or press Enter to approve and continue):`
            );
          },
        });
      }
    )
  );
