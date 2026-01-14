import { Command } from "commander";
import chalk from "chalk";
import { executeTaskLoop } from "task-o-matic-core";
import {
  ExecuteLoopOptions,
  ExecutorTool,
  ModelAttemptConfig,
} from "task-o-matic-core";
import {
  parseTryModels,
  validateExecutor,
  VALID_EXECUTORS,
} from "task-o-matic-core";
import { ExecuteLoopCommandOptions } from "../../types/cli-options";
import { wrapCommandHandler } from "../../utils/command-error-handler";
import { textInputPrompt } from "../../utils/workflow-prompts";

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
  .option("-m, --model <model>", "Model to force for execution")
  .option(
    "--verify <command>",
    "Verification command to run after each task (can be used multiple times)",
    (value: string, previous: string[] = []) => {
      return [...previous, value];
    }
  )
  .option(
    "--validate <command>",
    "Alias for --verify (validation command, can be used multiple times)",
    (value: string, previous: string[] = []) => {
      return [...previous, value];
    }
  )
  .option(
    "--message <message>",
    "Custom message to send to the tool (overrides task plan)"
  )
  .option(
    "--continue-session",
    "Continue the last session (for error feedback)",
    false
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
    "--include-completed",
    "Include already-completed tasks in execution",
    false
  )
  .option("--include-prd", "Include PRD content in execution context", false)
  .option(
    "--notify <target>",
    "Notify on completion via URL or command (can be used multiple times)",
    (value: string, previous: string[] = []) => [...previous, value]
  )
  .option("--dry", "Show what would be executed without running it", false)
  .action(
    wrapCommandHandler(
      "Execute loop",
      async (options: ExecuteLoopCommandOptions) => {
        // Validate tool
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

        // Combine both --verify and --validate options
        const verifications = [
          ...(options.verify || []),
          ...(options.validate || []),
        ];

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
            verificationCommands: verifications,
            autoCommit: options.autoCommit,
            tryModels,
            model: options.model,
            plan: options.plan,
            planModel: options.planModel,
            planTool: options.planTool,
            reviewPlan: options.reviewPlan,
            review: options.review,
            reviewModel: options.reviewModel,
            customMessage: options.message,
            continueSession: options.continueSession,
            includeCompleted: options.includeCompleted,
            includePrd: options.includePrd,
            notifyTargets: options.notify,
            onPlanReview: async (planFile: string) => {
              return await textInputPrompt(
                `Enter feedback to refine the plan (or press Enter to approve and continue):`
              );
            },
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
      }
    )
  );
