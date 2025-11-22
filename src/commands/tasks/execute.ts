import { Command } from "commander";
import chalk from "chalk";
import { executeTask } from "../../lib/task-execution";

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
    "Validation command to run after execution (can be used multiple times)",
    (value: string, previous: string[] = []) => {
      return [...previous, value];
    }
  )
  .action(async (options) => {
    try {
      await executeTask({
        taskId: options.id,
        tool: options.tool,
        message: options.message,
        model: options.model,
        continueSession: options.continueSession,
        dry: options.dry,
        validate: options.validate || [],
      });
    } catch (error) {
      console.error(
        chalk.red("Execution failed:"),
        error instanceof Error ? error.message : "Unknown error"
      );
      process.exit(1);
    }
  });
