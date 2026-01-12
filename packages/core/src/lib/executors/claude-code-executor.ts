import { spawn } from "node:child_process";

import type { ExecutorConfig, ExternalExecutor } from "../../types";
import { logger } from "../logger";

export class ClaudeCodeExecutor implements ExternalExecutor {
  name = "claude";
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
      args.push("--model", finalConfig.model);
      logger.progress(`🤖 Using model: ${finalConfig.model}`);
    }

    // Add session resumption if specified
    if (finalConfig.continueLastSession) {
      args.push("-c");
      logger.progress("🔄 Continuing last session");
    } else if (finalConfig.sessionId) {
      args.push("-r", finalConfig.sessionId);
      logger.progress(`🔄 Resuming session: ${finalConfig.sessionId}`);
    }

    // Add --print for non-interactive mode (required for automation)
    // args.push("-p");

    // Auto-approve file edits for automation
    args.push("--permission-mode", "acceptEdits");

    // Add prompt as positional argument
    args.push(message);

    if (dry) {
      logger.progress(`🔧 Using executor: ${this.name}`);
      logger.progress(`claude ${args.join(" ")}`);
      return;
    }

    // Launch claude and wait for it to complete
    const child = spawn("claude", args, {
      stdio: "inherit", // Give tool full terminal control
    });

    // Wait for completion (blocking)
    await new Promise<void>((resolve, reject) => {
      child.on("close", (code: number) => {
        if (code === 0) {
          logger.success("✅ Claude Code execution completed successfully");
          resolve();
        } else {
          const error = new Error(`Claude Code exited with code ${code}`);
          logger.error(`❌ ${error.message}`);
          reject(error);
        }
      });

      child.on("error", (error: Error) => {
        logger.error(`❌ Failed to launch Claude Code: ${error.message}`);
        reject(error);
      });
    });
  }
}
