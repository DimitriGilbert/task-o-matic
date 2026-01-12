import { Command } from "commander";
import { taskService } from "task-o-matic-core";
import { displayPlanList } from "../../../cli/display/plan";
import { wrapCommandHandler } from "../../../utils/command-error-handler";

export const listPlanCommand = new Command("list-plan")
  .description("List all available implementation plans")
  .action(wrapCommandHandler("List plans", async () => {
    const plans = await taskService.listTaskPlans();

    // Get task titles for each plan
    const plansWithTitles = await Promise.all(
      plans.map(async (plan) => {
        const task = await taskService.getTask(plan.taskId);
        return {
          ...plan,
          taskTitle: task ? task.title : plan.taskId,
        };
      })
    );

    displayPlanList(plansWithTitles);
  }));
