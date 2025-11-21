import { hooks } from "../hooks";
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
}
