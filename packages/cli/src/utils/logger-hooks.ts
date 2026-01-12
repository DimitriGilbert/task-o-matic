import { hooks } from "task-o-matic-core";
import chalk from "chalk";

export function registerLoggerHooks() {
  hooks.on("task:created", ({ task }) => {
    console.log(chalk.gray(`[Hook] Task created: ${task.title} (${task.id})`));
  });

  hooks.on("task:updated", ({ task, changes }) => {
    const changedFields = Object.keys(changes).join(", ");
    console.log(
      chalk.gray(`[Hook] Task updated: ${task.id} (Fields: ${changedFields})`)
    );
  });

  hooks.on("task:status-changed", ({ task, oldStatus, newStatus }) => {
    console.log(
      chalk.magenta(
        `[Hook] Status changed: ${task.title} -> ${oldStatus} to ${newStatus}`
      )
    );
  });

  hooks.on("execution:start", ({ taskId, tool }) => {
    console.log(
      chalk.blue(`[Hook] Execution started for ${taskId} using ${tool}`)
    );
  });

  hooks.on("execution:end", ({ taskId, success }) => {
    const status = success ? chalk.green("Success") : chalk.red("Failed");
    console.log(chalk.blue(`[Hook] Execution ended for ${taskId}: ${status}`));
  });

  // Log event handlers - chalk-styled console output
  hooks.on("log:info", ({ message }) => {
    console.log(chalk.blue(message));
  });

  hooks.on("log:warn", ({ message }) => {
    console.log(chalk.yellow(message));
  });

  hooks.on("log:error", ({ message }) => {
    console.log(chalk.red(message));
  });

  hooks.on("log:success", ({ message }) => {
    console.log(chalk.green(message));
  });

  hooks.on("log:progress", ({ message }) => {
    console.log(chalk.cyan(message));
  });
}
