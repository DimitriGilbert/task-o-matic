import { logger } from "./logger";
import { ExecutorFactory } from "./executors/executor-factory";
import { ExecutorConfig, ExecutorTool, Task } from "../types";
import { existsSync, readFileSync } from "fs";
import inquirer from "inquirer";
import { exec } from "child_process";
import { promisify } from "util";
import { commitFile } from "./git-utils";

const execAsync = promisify(exec);

/**
 * Planning phase configuration
 */
export interface PlanningConfig {
  planModel?: string; // Format: "executor:model" or just "model"
  reviewPlan?: boolean; // Enable human review loop
  autoCommit?: boolean; // Auto-commit the plan file
  dry?: boolean; // Dry run mode
}

/**
 * Planning phase result
 */
export interface PlanningResult {
  planContent?: string;
  planFileName?: string;
  success: boolean;
  error?: string;
}

/**
 * Execute planning phase for a task
 * Creates an AI-generated implementation plan with optional human review
 */
export async function executePlanningPhase(
  task: Task,
  defaultTool: ExecutorTool,
  config: PlanningConfig,
  execFn: (
    command: string
  ) => Promise<{ stdout: string; stderr: string }> = execAsync
): Promise<PlanningResult> {
  const { planModel, reviewPlan, autoCommit, dry } = config;

  logger.info(`\n🧠 Starting Planning Phase for Task: ${task.title}`);

  const planFileName = `task-${task.id}-plan.md`;

  // Parse executor and model from planModel string
  const planExecutor = planModel
    ? (planModel.split(":")[0] as ExecutorTool)
    : defaultTool;
  const planModelName = planModel ? planModel.split(":")[1] : undefined;

  let planningPrompt = `You are a senior software architect. Analyze the following task and create a detailed implementation plan.

Task: ${task.title}
Description: ${task.description || "No description provided."}

Requirements:
1. Analyze the task requirements.
2. Create a detailed step-by-step implementation plan.
3. Identify necessary file changes.
4. Write this plan to a file named "${planFileName}" in the current directory.
5. Do NOT implement the code yet, just create the plan file.

Please create the "${planFileName}" file now.`;

  logger.progress(
    `   Using executor for planning: ${planExecutor}${
      planModelName ? ` (${planModelName})` : ""
    }`
  );

  // Create executor for planning
  const planningConfig: ExecutorConfig = {
    model: planModelName,
    continueLastSession: false,
  };

  const executor = ExecutorFactory.create(planExecutor, planningConfig);

  try {
    let planningComplete = false;
    let planContent: string | undefined;

    while (!planningComplete) {
      await executor.execute(planningPrompt, dry, planningConfig);

      if (!dry) {
        // Verify plan file exists and read it
        if (existsSync(planFileName)) {
          planContent = readFileSync(planFileName, "utf-8");
          logger.success(`✅ Plan created successfully: ${planFileName}`);

          // Human Review Loop
          if (reviewPlan) {
            logger.warn(
              `\n👀 Pausing for Human Review of the Plan: ${planFileName}`
            );
            logger.progress("You can edit the file now.");

            const { feedback } = await inquirer.prompt([
              {
                type: "input",
                name: "feedback",
                message:
                  "Enter feedback to refine the plan (or press Enter to approve and continue):",
              },
            ]);

            if (feedback && feedback.trim() !== "") {
              logger.info("🔄 Refining plan based on feedback...");
              planningPrompt = `The user provided the following feedback on the plan you just created:

"${feedback}"

Please update the plan file "${planFileName}" to incorporate this feedback.`;
              // Continue loop to regenerate plan
              continue;
            }
          }

          // Auto-commit plan if enabled (only after approval)
          if (autoCommit) {
            await commitFile(
              planFileName,
              `docs: create implementation plan for task ${task.id}`,
              execFn
            );
          }

          planningComplete = true;
        } else {
          logger.warn(
            `⚠️  Plan file ${planFileName} was not created by the executor.`
          );
          planningComplete = true; // Exit loop to avoid infinite retry if file not created
        }
      } else {
        planningComplete = true; // Dry run
      }
    }

    return {
      planContent,
      planFileName,
      success: true,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`❌ Planning phase failed: ${errorMessage}`);

    return {
      success: false,
      error: errorMessage,
    };
  }
}
