import { logger } from "./logger";
import { ExecutorTool, Task } from "../types";
import { getAIOperations } from "../utils/ai-service-factory";
import { parseExecutorModelString } from "../utils/model-executor-parser";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

/**
 * Review phase configuration
 */
export interface ReviewConfig {
  reviewModel?: string; // Format: "executor:model" or just "model"
  reviewTool?: string; // Tool/executor to use for review
  planContent?: string; // Plan content to include in review context
  taskDescription?: string; // Task description
  taskContent?: string; // Full task content/requirements
  prdContent?: string; // PRD content if available
  documentation?: { recap: string; files?: string[] }; // Documentation context
  beforeHead?: string; // Git HEAD before execution started (for diffing commits)
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
    command: string,
  ) => Promise<{ stdout: string; stderr: string }> = execAsync,
): Promise<ReviewResult> {
  const {
    reviewModel,
    reviewTool,
    planContent,
    taskDescription,
    taskContent,
    prdContent,
    documentation,
    beforeHead,
    dry,
  } = config;

  logger.info("\n🕵️  Starting AI Review Phase...");

  if (dry) {
    logger.warn("🔍 DRY RUN - Review phase skipped");
    return {
      approved: true,
      feedback: "Dry run - review skipped",
      success: true,
    };
  }

  try {
    // Get git diff - handle both committed and uncommitted changes
    let diff = "";

    if (beforeHead) {
      // Get changes from commits made during execution
      try {
        const { stdout: commitDiff } = await execFn(
          `git diff ${beforeHead}..HEAD`,
        );
        if (commitDiff.trim()) {
          diff += `# Committed changes during execution:\n${commitDiff}\n`;
          logger.progress(
            `   Found committed changes since ${beforeHead.substring(0, 7)}`,
          );
        }
      } catch (e) {
        logger.warn(
          `⚠️  Could not get commit diff: ${e instanceof Error ? e.message : e}`,
        );
      }
    }

    // Also check for any uncommitted changes
    try {
      const { stdout: uncommittedDiff } = await execFn("git diff HEAD");
      if (uncommittedDiff.trim()) {
        diff += `# Uncommitted changes:\n${uncommittedDiff}\n`;
        logger.progress("   Found uncommitted changes");
      }
    } catch (e) {
      logger.warn(
        `⚠️  Could not get uncommitted diff: ${e instanceof Error ? e.message : e}`,
      );
    }

    if (!diff.trim()) {
      logger.warn("⚠️  No changes detected to review.");
      return {
        approved: true,
        feedback: "No changes to review",
        success: true,
      };
    }

    // Parse executor and model from reviewModel string (same logic as task-planning.ts)
    let reviewExecutor = reviewTool as ExecutorTool | undefined;
    let reviewModelName = reviewModel;

    // Only parse reviewModel for executor if reviewTool is NOT explicitly set
    if (reviewModel && !reviewTool) {
      const result = parseExecutorModelString(reviewModel);
      if (result.executor) {
        reviewExecutor = result.executor;
      }
      reviewModelName = result.model;
    } else if (reviewModel) {
      // If reviewTool IS set, just use reviewModel as the model name
      const result = parseExecutorModelString(reviewModel);
      reviewModelName = result.model;
    }

    // Map executor to AI provider
    let aiProvider:
      | "openai"
      | "anthropic"
      | "gemini"
      | "openrouter"
      | undefined;

    if (reviewExecutor) {
      switch (reviewExecutor) {
        case "claude":
          aiProvider = "anthropic";
          break;
        case "gemini":
          aiProvider = "gemini";
          break;
        case "codex":
          aiProvider = "openai";
          break;
        case "opencode":
          // opencode usually uses the default provider or openrouter
          // We don't force a provider change unless necessary
          break;
      }

      logger.progress(
        `   Using executor for review: ${reviewExecutor} ${reviewModelName ? `(${reviewModelName})` : ""}`,
      );
    } else {
      logger.progress("   Using default AI provider for review");
    }

    // Build comprehensive context sections
    const descriptionSection = taskDescription
      ? `\nTask Description:\n${taskDescription}\n`
      : "";

    const contentSection = taskContent
      ? `\nTask Requirements/Content:\n${taskContent}\n`
      : "";

    const prdSection = prdContent
      ? `\nProduct Requirements Document (PRD):\n${prdContent.substring(0, 5000)}\n`
      : "";

    const docsSection = documentation
      ? `\nDocumentation Context:\n${documentation.recap}${
          documentation.files?.length
            ? `\nReferenced files: ${documentation.files.join(", ")}`
            : ""
        }\n`
      : "";

    const planSection = planContent
      ? `\nImplementation Plan:\n${planContent}\n`
      : "";

    const reviewPrompt = `You are a strict code reviewer. Review the following changes against the task requirements.

# Task: ${task.title}
${descriptionSection}${contentSection}${prdSection}${docsSection}${planSection}
# Git Diff (changes to review):
\`\`\`diff
${diff.substring(0, 10000)}
\`\`\`

Analyze the changes for:
1. Correctness - Do the changes solve the task requirements?
2. Completeness - Are all requirements addressed?
3. Code Quality - Clean code, best practices
4. Potential Bugs - Any obvious issues?

Return a JSON object:
{
  "approved": boolean,
  "feedback": "Detailed feedback explaining why it was rejected or approved, referencing specific requirements"
}
`;

    // Build AI config override
    const aiConfigOverride: any = {};
    if (aiProvider) {
      aiConfigOverride.provider = aiProvider;
    }
    if (reviewModelName) {
      aiConfigOverride.model = reviewModelName;
    }

    // Use AI operations to get review response
    const aiOps = getAIOperations();
    const aiResponse = await aiOps.streamText(reviewPrompt, aiConfigOverride);
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      const reviewResult = JSON.parse(jsonMatch[0]);

      if (!reviewResult.approved) {
        logger.error(`❌ AI Review Rejected Changes: ${reviewResult.feedback}`);
      } else {
        logger.success(`✅ AI Review Approved: ${reviewResult.feedback}`);
      }

      return {
        approved: reviewResult.approved,
        feedback: reviewResult.feedback,
        success: true,
      };
    } else {
      logger.warn("⚠️  Could not parse AI review response. Assuming approval.");
      return {
        approved: true,
        feedback: "Could not parse review response, assuming approval",
        success: true,
      };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`❌ AI Review failed: ${errorMessage}`);

    // If review crashes, warn but don't fail the task
    return {
      approved: true,
      feedback: `Review failed: ${errorMessage}`,
      success: false,
      error: errorMessage,
    };
  }
}
