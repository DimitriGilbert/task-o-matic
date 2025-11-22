import { ExternalExecutor, ExecutorConfig } from "../../types";
import chalk from "chalk";
import { spawn } from "child_process";

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
      console.log(chalk.cyan(`🤖 Using model: ${finalConfig.model}`));
    }

    // Add session resumption if specified
    if (finalConfig.continueLastSession) {
      args.push("-c");
      console.log(chalk.cyan("🔄 Continuing last session"));
    } else if (finalConfig.sessionId) {
      args.push("-s", finalConfig.sessionId);
      console.log(chalk.cyan(`🔄 Resuming session: ${finalConfig.sessionId}`));
    }

    // Add prompt
    args.push("-p", message);

    if (dry) {
      console.log(chalk.cyan(`🔧 Using executor: ${this.name}`));
      console.log(chalk.cyan(`opencode ${args.join(" ")}`));
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
          console.log("✅ Opencode execution completed successfully");
          resolve();
        } else {
          const error = new Error(`Opencode exited with code ${code}`);
          console.error(`❌ ${error.message}`);
          reject(error);
        }
      });

      child.on("error", (error: Error) => {
        console.error(`❌ Failed to launch opencode: ${error.message}`);
        reject(error);
      });
    });
  }
}
