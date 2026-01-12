import { spawn } from "node:child_process";

import type { ExecutorConfig, ExternalExecutor } from "../../types";
import { logger } from "../logger";

export class GeminiExecutor implements ExternalExecutor {
  name = "gemini";
  private config?: ExecutorConfig;

  constructor(config?: ExecutorConfig) {
    this.config = config;
  }

  supportsSessionResumption(): boolean {
    return true;
  }

  async execute(
    message: string,
    dry: boolean = false,
    config?: ExecutorConfig
  ): Promise<void> {
    // Merge constructor config with execution config (execution takes precedence)
    const finalConfig = { ...this.config, ...config };

    // Build arguments array
    const args: string[] = [];

    // Add model if specified
    if (finalConfig.model) {
      args.push("-m", finalConfig.model);
      logger.progress(`🤖 Using model: ${finalConfig.model}`);
    }

    // Add session resumption if specified
    if (finalConfig.continueLastSession) {
      args.push("-r", "latest");
      logger.progress("🔄 Continuing last session");
    } else if (finalConfig.sessionId) {
      args.push("-r", finalConfig.sessionId);
      logger.progress(`🔄 Resuming session: ${finalConfig.sessionId}`);
    }

    // Enable auto-approval of all tools (yolo mode) - required for file writes
    args.push("--yolo");

    // Add prompt as positional argument (the -p flag is deprecated)
    args.push(message);

    if (dry) {
      logger.progress(`🔧 Using executor: ${this.name}`);
      logger.progress(`gemini ${args.join(" ")}`);
      return;
    }

    // Launch gemini and wait for it to complete
    const child = spawn("gemini", args, {
      stdio: "inherit", // Give tool full terminal control
    });

    // Wait for completion (blocking)
    await new Promise<void>((resolve, reject) => {
      child.on("close", (code: number) => {
        if (code === 0) {
          logger.success("✅ Gemini CLI execution completed successfully");
          resolve();
        } else {
          const error = new Error(`Gemini CLI exited with code ${code}`);
          logger.error(`❌ ${error.message}`);
          reject(error);
        }
      });

      child.on("error", (error: Error) => {
        logger.error(`❌ Failed to launch Gemini CLI: ${error.message}`);
        reject(error);
      });
    });
  }
}
