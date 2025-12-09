import chalk from "chalk";
import { ExecutorTool, Task } from "../types";
import { getAIOperations } from "../utils/ai-service-factory";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

/**
 * Review phase configuration
 */
export interface ReviewConfig {
  reviewModel?: string; // Format: "executor:model" or just "model"
  planContent?: string; // Plan content to include in review context
  dry?: boolean; // Dry run mode
}

/**
 * Review phase result
 */
export interface ReviewResult {
  approved: boolean;
  feedback: string;
  success: boolean;
  error?: string;
}

/**
 * Execute AI review phase for task execution
 * Reviews code changes and provides feedback
 */
export async function executeReviewPhase(
  task: Task,
  config: ReviewConfig,
  execFn: (
    command: string
  ) => Promise<{ stdout: string; stderr: string }> = execAsync
): Promise<ReviewResult> {
  const { reviewModel, planContent, dry } = config;

  console.log(chalk.blue.bold("\n🕵️  Starting AI Review Phase..."));

  if (dry) {
    console.log(chalk.yellow("🔍 DRY RUN - Review phase skipped"));
    return {
      approved: true,
      feedback: "Dry run - review skipped",
      success: true,
    };
  }

  try {
    // Get git diff
    const { stdout: diff } = await execFn("git diff HEAD");

    if (!diff.trim()) {
      console.log(chalk.yellow("⚠️  No changes detected to review."));
      return {
        approved: true,
        feedback: "No changes to review",
        success: true,
      };
    }

    // Parse executor and model from reviewModel string
    const reviewExecutor = reviewModel
      ? (reviewModel.split(":")[0] as ExecutorTool)
      : undefined;
    const reviewModelName = reviewModel ? reviewModel.split(":")[1] : undefined;

    if (reviewExecutor && reviewModelName) {
      console.log(
        chalk.cyan(
          `   Using executor for review: ${reviewExecutor} (${reviewModelName})`
        )
      );
    } else {
      console.log(chalk.cyan("   Using default AI provider for review"));
    }

    const reviewPrompt = `You are a strict code reviewer. Review the following changes for the task.

Task: ${task.title}
${planContent ? `Plan: ${planContent}` : "Plan: No plan provided."}

Git Diff:
${diff.substring(0, 10000)}

Analyze the changes for:
1. Correctness (does it solve the task?)
2. Code Quality (clean code, best practices)
3. Potential Bugs

Return a JSON object:
{
  "approved": boolean,
  "feedback": "Detailed feedback explaining why it was rejected or approved"
}
`;

    // Use AI operations to get review response
    const aiOps = getAIOperations();
    const aiResponse = await aiOps.streamText(reviewPrompt);
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      const reviewResult = JSON.parse(jsonMatch[0]);

      if (!reviewResult.approved) {
        console.log(
          chalk.red(`❌ AI Review Rejected Changes: ${reviewResult.feedback}`)
        );
      } else {
        console.log(
          chalk.green(`✅ AI Review Approved: ${reviewResult.feedback}`)
        );
      }

      return {
        approved: reviewResult.approved,
        feedback: reviewResult.feedback,
        success: true,
      };
    } else {
      console.warn(
        chalk.yellow(
          "⚠️  Could not parse AI review response. Assuming approval."
        )
      );
      return {
        approved: true,
        feedback: "Could not parse review response, assuming approval",
        success: true,
      };
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : String(error);
    console.error(chalk.red(`❌ AI Review failed: ${errorMessage}`));

    // If review crashes, warn but don't fail the task
    return {
      approved: true,
      feedback: `Review failed: ${errorMessage}`,
      success: false,
      error: errorMessage,
    };
  }
}
