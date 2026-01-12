import { spawn } from "node:child_process";

import type { ExecutorConfig, ExternalExecutor } from "../../types";
import { logger } from "../logger";

export class KiloExecutor implements ExternalExecutor {
  name = "kilo";
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
      args.push("-mo", finalConfig.model);
      logger.progress(`🤖 Using model: ${finalConfig.model}`);
    }

    // Add session resumption if specified
    if (finalConfig.continueLastSession) {
      args.push("-c");
      logger.progress("🔄 Continuing last session");
    } else if (finalConfig.sessionId) {
      args.push("-s", finalConfig.sessionId);
      logger.progress(`🔄 Resuming session: ${finalConfig.sessionId}`);
    }

    // Run in autonomous mode (non-interactive) for automation
    args.push("--auto");

    // Enable auto-approval of all tool permissions
    args.push("--yolo");

    // Add prompt as positional argument
    args.push(message);

    if (dry) {
      logger.progress(`🔧 Using executor: ${this.name}`);
      logger.progress(`kilocode ${args.join(" ")}`);
      return;
    }

    // Launch kilocode and wait for it to complete
    const child = spawn("kilocode", args, {
      stdio: "inherit", // Give tool full terminal control
    });

    // Wait for completion (blocking)
    await new Promise<void>((resolve, reject) => {
      child.on("close", (code: number) => {
        if (code === 0) {
          logger.success("✅ Kilo Code execution completed successfully");
          resolve();
        } else {
          const error = new Error(`Kilo Code exited with code ${code}`);
          logger.error(`❌ ${error.message}`);
          reject(error);
        }
      });

      child.on("error", (error: Error) => {
        logger.error(`❌ Failed to launch Kilo Code: ${error.message}`);
        reject(error);
      });
    });
  }
}
