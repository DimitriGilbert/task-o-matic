import { Command } from "commander";
import chalk from "chalk";
import { taskService } from "task-o-matic-core";
import { displayPlanView } from "../../../cli/display/plan";
import { wrapCommandHandler } from "../../../utils/command-error-handler";
import { GetPlanCommandOptions } from "../../../types/cli-options";

export const getPlanCommand = new Command("get-plan")
  .description("View existing implementation plan for a task or subtask")
  .requiredOption("--id <id>", "Task or subtask ID")
  .action(
    wrapCommandHandler("Get plan", async (options: GetPlanCommandOptions) => {
      const plan = await taskService.getTaskPlan(options.id);

      if (!plan) {
        console.log(
          chalk.yellow(`⚠️  No plan found for task/subtask ${options.id}`)
        );
        return;
      }

      const task = await taskService.getTask(options.id);
      const taskTitle = task ? task.title : options.id;

      displayPlanView(
        taskTitle,
        options.id,
        plan.plan,
        plan.createdAt,
        plan.updatedAt
      );
    })
  );
