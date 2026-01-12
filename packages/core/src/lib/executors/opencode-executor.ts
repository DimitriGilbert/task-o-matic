import { spawn } from "node:child_process";

import type { ExecutorConfig, ExternalExecutor } from "../../types";
import { logger } from "../logger";

export class OpencodeExecutor implements ExternalExecutor {
  name = "opencode";
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
      args.push("-c");
      logger.progress("🔄 Continuing last session");
    } else if (finalConfig.sessionId) {
      args.push("-s", finalConfig.sessionId);
      logger.progress(`🔄 Resuming session: ${finalConfig.sessionId}`);
    }

    // Use 'run' subcommand with message as positional argument
    args.push("run", message);

    if (dry) {
      logger.progress(`🔧 Using executor: ${this.name}`);
      // Quote arguments that contain spaces for display
      const quotedArgs = args.map((arg) =>
        arg.includes(" ") ? `"${arg.replace(/"/g, '\\"')}"` : arg
      );
      logger.progress(`opencode ${quotedArgs.join(" ")}`);
      return;
    }

    // Launch opencode and wait for it to complete
    const child = spawn("opencode", args, {
      stdio: "inherit", // Give tool full terminal control
    });

    // Wait for completion (blocking)
    await new Promise<void>((resolve, reject) => {
      child.on("close", (code: number) => {
        if (code === 0) {
          logger.success("✅ Opencode execution completed successfully");
          resolve();
        } else {
          const error = new Error(`Opencode exited with code ${code}`);
          logger.error(`❌ ${error.message}`);
          reject(error);
        }
      });

      child.on("error", (error: Error) => {
        logger.error(`❌ Failed to launch opencode: ${error.message}`);
        reject(error);
      });
    });
  }
}
