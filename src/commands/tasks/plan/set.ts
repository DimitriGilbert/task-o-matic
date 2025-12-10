import { Command } from "commander";
import chalk from "chalk";
import { taskService } from "../../../services/tasks";
import { wrapCommandHandler } from "../../../utils/command-error-handler";
import { SetPlanCommandOptions } from "../../../types/cli-options";
import {
  createStandardError,
  formatTaskNotFoundError,
  TaskOMaticErrorCodes,
} from "../../../utils/task-o-matic-error";

export const setPlanCommand = new Command("set-plan")
  .description("Set implementation plan for a task")
  .requiredOption("--id <id>", "Task ID")
  .option("--plan <text>", "Plan text (use quotes for multi-line)")
  .option("--plan-file <path>", "Path to file containing the plan")
  .action(
    wrapCommandHandler("Set plan", async (options: SetPlanCommandOptions) => {
      const task = await taskService.getTask(options.id);
      if (!task) {
        throw formatTaskNotFoundError(options.id);
      }

      if (!options.plan && !options.planFile) {
        throw createStandardError(
          TaskOMaticErrorCodes.INVALID_INPUT,
          "Either --plan or --plan-file must be specified",
          {
            suggestions: [
              "Provide the plan directly using --plan '...' ",
              "Provide a file containing the plan using --plan-file <path>",
            ],
          }
        );
      }

      if (options.plan && options.planFile) {
        throw createStandardError(
          TaskOMaticErrorCodes.INVALID_INPUT,
          "Cannot specify both --plan and --plan-file",
          {
            suggestions: ["Provide either --plan or --plan-file, but not both."],
          }
        );
      }

      const result = await taskService.setTaskPlan(
        options.id,
        options.plan || undefined,
        options.planFile || undefined
      );

      console.log(
        chalk.green(`✓ Plan set for task: ${task.title} (${options.id})`)
      );
      console.log(chalk.gray(`   Plan file: ${result.planFile}`));

      if (options.planFile) {
        console.log(chalk.gray(`   Source file: ${options.planFile}`));
      }
    })
  );
