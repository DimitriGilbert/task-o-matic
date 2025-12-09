import { Command } from "commander";
import chalk from "chalk";
import { taskService } from "../../../services/tasks";
import { wrapCommandHandler } from "../../../utils/command-error-handler";
import { SetPlanCommandOptions } from "../../../types/cli-options";

export const setPlanCommand = new Command("set-plan")
  .description("Set implementation plan for a task")
  .requiredOption("--id <id>", "Task ID")
  .option("--plan <text>", "Plan text (use quotes for multi-line)")
  .option("--plan-file <path>", "Path to file containing the plan")
  .action(wrapCommandHandler("Set plan", async (options: SetPlanCommandOptions) => {
    const task = await taskService.getTask(options.id);
    if (!task) {
      throw new Error(`Task with ID ${options.id} not found`);
    }

    if (!options.plan && !options.planFile) {
      throw new Error("Either --plan or --plan-file must be specified");
    }

    if (options.plan && options.planFile) {
      throw new Error("Cannot specify both --plan and --plan-file");
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
  }));
