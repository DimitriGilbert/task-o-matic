import chalk from "chalk";
import type { ProgressEvent } from "@task-o-matic/core";
import { isTaskOMaticError, type TaskOMaticError } from "@task-o-matic/core";

/**
 * Display progress events for the CLI
 * This function is used as a callback for services to report progress
 */
export function displayProgress(event: ProgressEvent): void {
  switch (event.type) {
    case "started":
      console.log(chalk.blue("🤖 " + event.message));
      break;

    case "progress":
      if (event.current && event.total) {
        const percent = Math.round((event.current / event.total) * 100);
        console.log(
          chalk.cyan(
            `  [${event.current}/${event.total}] ${percent}% - ${event.message}`
          )
        );
      } else {
        console.log(chalk.cyan("  → " + event.message));
      }
      break;

    case "stream-chunk":
      process.stdout.write(event.text);
      break;

    case "reasoning-chunk":
      process.stdout.write(chalk.magenta(event.text));
      break;

    case "completed":
      console.log(chalk.green("✓ " + event.message));
      break;

    case "warning":
      console.log(chalk.yellow("⚠️  " + event.message));
      break;

    case "info":
      console.log(chalk.gray("  ℹ " + event.message));
      break;
  }
}

/**
 * Display an error message with full TaskOMaticError details
 *
 * If the error is a TaskOMaticError, displays:
 * - Error code (e.g., [TASK_NOT_FOUND])
 * - Error message
 * - Context information
 * - Actionable suggestions
 * - Metadata (in verbose mode)
 * - Stack trace (in debug mode)
 *
 * For regular errors, displays the message and stack trace.
 */
export function displayError(error: Error | unknown, options?: { verbose?: boolean; debug?: boolean }): void {
  const verbose = options?.verbose ?? false;
  const debug = options?.debug ?? process.env.DEBUG === "true";

  if (isTaskOMaticError(error)) {
    // Display TaskOMaticError with full formatting
    const taskError = error as TaskOMaticError;

    // Error header with code
    console.error(chalk.red(`❌ [${taskError.code}] ${taskError.message}`));

    // Context information
    if (taskError.context) {
      console.error(chalk.gray(`\nContext: ${taskError.context}`));
    }

    // Actionable suggestions
    if (taskError.suggestions && taskError.suggestions.length > 0) {
      console.error(chalk.yellow("\n💡 Suggestions:"));
      taskError.suggestions.forEach((suggestion, index) => {
        console.error(chalk.yellow(`   ${index + 1}. ${suggestion}`));
      });
    }

    // Metadata (only in verbose mode)
    if (verbose && taskError.metadata) {
      console.error(chalk.gray("\nMetadata:"));
      Object.entries(taskError.metadata).forEach(([key, value]) => {
        console.error(chalk.gray(`   ${key}: ${JSON.stringify(value)}`));
      });
    }

    // Cause chain
    if (taskError.cause && verbose) {
      console.error(chalk.gray("\nCaused by:"));
      let cause = taskError.cause;
      let depth = 1;
      while (cause && depth <= 3) {
        const causeMsg = cause instanceof Error ? cause.message : String(cause);
        console.error(chalk.gray(`   ${"  ".repeat(depth - 1)}↳ ${causeMsg}`));
        cause = (cause as any).cause;
        depth++;
      }
    }

    // Stack trace (only in debug mode)
    if (debug && taskError.stack) {
      console.error(chalk.gray("\nStack trace:"));
      console.error(chalk.gray(taskError.stack));
    }
  } else if (error instanceof Error) {
    // Regular Error object
    console.error(chalk.red("❌ Error:"), error.message);

    if (debug && error.stack) {
      console.error(chalk.gray("\nStack trace:"));
      console.error(chalk.gray(error.stack));
    }
  } else {
    // Unknown error type
    console.error(chalk.red("❌ Unknown error:"), String(error));
  }

  // Footer with help hint
  if (!verbose && !debug) {
    console.error(chalk.gray("\n💭 Run with --verbose for more details, or --debug for stack traces"));
  }
}
