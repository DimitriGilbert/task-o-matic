import { logger } from "./logger";
import { ExecutorFactory } from "./executors/executor-factory";
import { ExecutorConfig, ExecutorTool, Task } from "../types";
import { existsSync, readFileSync } from "fs";

import { exec } from "child_process";
import { promisify } from "util";
import { commitFile } from "./git-utils";
import { parseExecutorModelString } from "../utils/model-executor-parser";

const execAsync = promisify(exec);

/**
 * Planning phase configuration
 */
export interface PlanningConfig {
  planModel?: string; // Format: "executor:model" or just "model"
  planTool?: string; // Explicit tool selection
  reviewPlan?: boolean; // Enable human review loop
  autoCommit?: boolean; // Auto-commit the plan file
  dry?: boolean; // Dry run mode
  onPlanReview?: (planFile: string) => Promise<string | undefined>; // Callback for review
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
  const { planModel, planTool, reviewPlan, autoCommit, dry, onPlanReview } =
    config;

  logger.info(`\n🧠 Starting Planning Phase for Task: ${task.title}`);

  const planFileName = `task-${task.id}-plan.md`;

  // Parse executor and model from planModel string
  const defaultExecutor = defaultTool;
  let planExecutor = (planTool as ExecutorTool) || defaultExecutor;
  let planModelName = planModel;

  // Only parse planModel for executor if planTool is NOT explicitly set
  // This allows "opencode:gpt-4o" to set both, but "--plan-tool claude" to override the executor part
  if (planModel && !planTool) {
    const result = parseExecutorModelString(planModel);
    if (result.executor) {
      planExecutor = result.executor;
    }
    planModelName = result.model;
  } else if (planModel) {
    // If planTool IS set, just use planModel as the model name (stripping potential executor prefix if user was confusing)
    const result = parseExecutorModelString(planModel);
    planModelName = result.model;
  }

  // Build the planning prompt with all available context
  const fullContent =
    task.content || task.description || "No description provided.";

  // Format documentation if available
  let docsSection = "";
  if (task.documentation) {
    docsSection = `
Documentation Context:
${task.documentation.recap}

referenced_files:
${task.documentation.files?.map((f) => `- ${f}`).join("\n") || "None"}
`;
  }

  // Add file path reference if available
  let fileReference = "";
  if (task.contentFile) {
    fileReference = `\n(Task Content File: ${task.contentFile})\n`;
  }

  let planningPrompt = `You are a senior software architect. Analyze the following task and create a detailed implementation plan.

Task Title: ${task.title}
${fileReference}

Task Description/Summary:
${task.description || "No summary provided."}

Detailed Task Requirements:
${fullContent}
${docsSection}

Requirements:
1. FOCUS SOLELY ON THIS TASK. Do not plan for future tasks or subtasks unless explicitly required. (if unsure verify .task-o-matic/tasks.json)
2. Analyze the task requirements and any provided documentation.
3. If a task file was provided, CHECK IT for more details if needed.
4. Create a detailed step-by-step implementation plan.
5. Identify necessary file changes.
6. Write this plan to a file named "${planFileName}" in the current directory.
7. Do NOT implement the code yet, just create the plan file.

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
            if (onPlanReview) {
              logger.warn(
                `\n👀 Pausing for Human Review of the Plan: ${planFileName}`
              );

              const feedback = await onPlanReview(planFileName);

              if (feedback && feedback.trim() !== "") {
                logger.info("🔄 Refining plan based on feedback...");
                planningPrompt = `The user provided the following feedback on the plan you just created:

"${feedback}"

Please update the plan file "${planFileName}" to incorporate this feedback.`;
                // Continue loop to regenerate plan
                continue;
              }
            } else {
              logger.warn("Review requested but no review callback provided.");
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
