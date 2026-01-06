import { exec } from "child_process";
import { promisify } from "util";
import { logger } from "./logger";
import type { ExecuteLoopResult } from "../types";

const execAsync = promisify(exec);

/**
 * Send notifications after loop completion
 * Supports both URLs (POST request) and commands (execute with env var)
 */
export async function sendNotifications(
  targets: string[],
  result: ExecuteLoopResult
): Promise<void> {
  if (!targets || targets.length === 0) return;

  const summary = {
    totalTasks: result.totalTasks,
    completedTasks: result.completedTasks,
    failedTasks: result.failedTasks,
    duration: result.duration,
    success: result.failedTasks === 0,
  };

  for (const target of targets) {
    try {
      if (target.startsWith("http://") || target.startsWith("https://")) {
        await postToUrl(target, result);
      } else {
        await executeCommand(target, summary);
      }
    } catch (error) {
      logger.warn(
        `⚠️  Notification failed for ${target}: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }
}

/**
 * POST result to a URL
 */
async function postToUrl(
  url: string,
  result: ExecuteLoopResult
): Promise<void> {
  logger.info(`📤 Sending notification to ${url}`);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(result),
    });

    if (response.ok) {
      logger.success(`✅ Notification sent to ${url}`);
    } else {
      logger.warn(`⚠️  Notification to ${url} returned ${response.status}`);
    }
  } catch (error) {
    throw new Error(
      `Failed to POST to ${url}: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

/**
 * Execute a command with result in environment variable
 */
async function executeCommand(
  command: string,
  summary: Record<string, unknown>
): Promise<void> {
  logger.info(`🔔 Running notification command: ${command}`);

  try {
    await execAsync(command, {
      env: {
        ...process.env,
        TASK_LOOP_RESULT: JSON.stringify(summary),
        TASK_LOOP_TOTAL: String(summary.totalTasks),
        TASK_LOOP_COMPLETED: String(summary.completedTasks),
        TASK_LOOP_FAILED: String(summary.failedTasks),
        TASK_LOOP_SUCCESS: String(summary.success),
      },
    });
    logger.success(`✅ Notification command completed`);
  } catch (error) {
    throw new Error(
      `Command failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}
