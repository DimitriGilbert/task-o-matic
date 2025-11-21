import { Command } from "commander";
import chalk from "chalk";
import { taskService } from "../../services/tasks";
import { createStreamingOptions } from "../../utils/streaming-options";
import { displayProgress, displayError } from "../../cli/display/progress";
import {
  displayPlanCreation,
  displayPlanView,
  displayPlanList,
  displayPlanDeletion,
} from "../../cli/display/plan";

export const planCommand = new Command("plan")
  .description("Create detailed implementation plan for a task or subtask")
  .requiredOption("--id <id>", "Task or subtask ID to plan")
  .option("--stream", "Show streaming AI output during planning")
  .option("--ai-provider <provider>", "AI provider override")
  .option("--ai-model <model>", "AI model override")
  .option("--ai-key <key>", "AI API key override")
  .option("--ai-provider-url <url>", "AI provider URL override")
  .option(
    "--reasoning <tokens>",
    "Enable reasoning for OpenRouter models (max reasoning tokens)"
  )
  .action(async (options) => {
    try {
      const streamingOptions = createStreamingOptions(
        options.stream,
        "Planning"
      );

      const result = await taskService.planTask(
        options.id,
        {
          aiProvider: options.aiProvider,
          aiModel: options.aiModel,
          aiKey: options.aiKey,
          aiProviderUrl: options.aiProviderUrl,
          aiReasoning: options.reasoning,
        },
        streamingOptions,
        {
          onProgress: displayProgress,
          onError: displayError,
        }
      );

      // Display the plan
      displayPlanCreation(options.id, result.task.title);
      console.log(chalk.cyan(result.plan));
    } catch (error) {
      displayError(error);
      process.exit(1);
    }
  });

export const getPlanCommand = new Command("get-plan")
  .description("View existing implementation plan for a task or subtask")
  .requiredOption("--id <id>", "Task or subtask ID")
  .action(async (options) => {
    try {
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
    } catch (error) {
      displayError(error);
      process.exit(1);
    }
  });

export const listPlanCommand = new Command("list-plan")
  .description("List all available implementation plans")
  .action(async () => {
    try {
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
    } catch (error) {
      displayError(error);
      process.exit(1);
    }
  });

export const deletePlanCommand = new Command("delete-plan")
  .description("Delete implementation plan for a task")
  .requiredOption("--id <id>", "Task ID")
  .action(async (options) => {
    try {
      const success = await taskService.deleteTaskPlan(options.id);
      displayPlanDeletion(options.id, success);
    } catch (error) {
      displayError(error);
      process.exit(1);
    }
  });

export const setPlanCommand = new Command("set-plan")
  .description("Set implementation plan for a task")
  .requiredOption("--id <id>", "Task ID")
  .option("--plan <text>", "Plan text (use quotes for multi-line)")
  .option("--plan-file <path>", "Path to file containing the plan")
  .action(async (options) => {
    try {
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
    } catch (error) {
      displayError(error);
      process.exit(1);
    }
  });
