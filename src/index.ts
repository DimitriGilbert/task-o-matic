/**
 * task-o-matic CLI Logic
 *
 * This module contains the CLI setup and command definitions.
 * It can be imported and used by the binary or for testing.
 */

import { Command } from "commander";
import chalk from "chalk";
import { configCommand } from "./commands/config";
import { tasksCommand } from "./commands/tasks";
import { prdCommand } from "./commands/prd";
import { initCommand } from "./commands/init";
import { promptCommand } from "./commands/prompt";
import { workflowCommand } from "./commands/workflow";
import { benchmarkCommand } from "./commands/benchmark";
import { installCommand } from "./commands/install";
import { configManager } from "./lib/config";
import { registerLoggerHooks } from "./lib/hooks/logger";

const program = new Command();

program
  .name("task-o-matic")
  .description("AI-powered Task Management CLI for Single Projects")
  .version("0.1.0")
  .option("-v, --verbose", "Enable verbose logging");

// Add subcommands
program.addCommand(configCommand);
program.addCommand(tasksCommand);
program.addCommand(prdCommand);
program.addCommand(promptCommand);
program.addCommand(initCommand);
program.addCommand(workflowCommand);
program.addCommand(benchmarkCommand);
program.addCommand(installCommand);

// Default action - show help
program.action(() => {
  console.log(chalk.blue("🚀 AI-Powered Task Management CLI"));
  console.log(
    chalk.cyan(`Project Directory: ${configManager.getTaskOMaticDir()}`)
  );
  console.log("");
  console.log(chalk.yellow("Quick Start:"));
  console.log("  1. Initialize project: task-o-matic init");
  console.log(
    "  2. Configure AI provider: task-o-matic config set-ai-provider openrouter anthropic/claude-3.5-sonnet"
  );
  console.log(
    '  3. Create a task: task-o-matic tasks create --title "Your first task"'
  );
  console.log("  4. List tasks: task-o-matic tasks list");
  console.log("");
  program.outputHelp();
});

// Error handling
program.on("command:*", (operands) => {
  console.error(chalk.red(`Unknown command: ${operands[0]}`));
  console.log(
    chalk.blue("Available commands: config, tasks, prd, prompt, init, workflow, benchmark, install")
  );
  console.log(chalk.blue("Use --help for available commands"));
  process.exit(1);
});

/**
 * Run the CLI
 * This is the main entry point for the CLI, called by the bin script
 */
export const runCLI = async () => {
  try {
    // Initialize logger hooks
    registerLoggerHooks();

    // Ensure config is loaded before running any commands
    await configManager.load();

    await program.parseAsync(process.argv);
  } catch (error) {
    console.error(
      chalk.red("Error:"),
      error instanceof Error ? error.message : "Unknown error"
    );
    process.exit(1);
  }
};

/**
 * Export the program for testing purposes
 */
export { program };
