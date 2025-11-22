import { Command } from "commander";
import chalk from "chalk";
import { executeTaskLoop } from "../../lib/task-loop-execution";
import { ExecuteLoopOptions, ExecutorTool } from "../../types";

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
    "--verify <command>",
    "Verification command to run after each task (can be used multiple times)",
    (value: string, previous: string[] = []) => {
      return [...previous, value];
    }
  )
  .option("--auto-commit", "Automatically commit changes after each task", false)
  .option("--dry", "Show what would be executed without running it", false)
  .action(async (options) => {
    try {
      // Validate tool
      const validTools: ExecutorTool[] = [
        "opencode",
        "claude",
        "gemini",
        "codex",
      ];
      if (!validTools.includes(options.tool)) {
        console.error(
          chalk.red(
            `Invalid tool: ${options.tool}. Must be one of: ${validTools.join(
              ", "
            )}`
          )
        );
        process.exit(1);
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
