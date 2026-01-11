import { Command } from "commander";
import { taskService } from "task-o-matic-core";
import { displayPlanDeletion } from "../../../cli/display/plan";
import { wrapCommandHandler } from "task-o-matic-core";
import { DeletePlanCommandOptions } from "../../../types/cli-options";

export const deletePlanCommand = new Command("delete-plan")
  .description("Delete implementation plan for a task")
  .requiredOption("--id <id>", "Task ID")
  .action(
    wrapCommandHandler(
      "Delete plan",
      async (options: DeletePlanCommandOptions) => {
        const success = await taskService.deleteTaskPlan(options.id);
        displayPlanDeletion(options.id, success);
      }
    )
  );
