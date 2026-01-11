import { ExternalExecutor, ExecutorConfig } from "../../types";
import chalk from "chalk";
import { spawn } from "child_process";

export class CodexExecutor implements ExternalExecutor {
  name = "codex";
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

    // Build arguments array - structure depends on session resumption
    const args: string[] = [];

    // Add model via config if specified (codex uses -c for config overrides)
    if (finalConfig.model) {
      args.push("-c", `model="${finalConfig.model}"`);
      console.log(chalk.cyan(`🤖 Using model: ${finalConfig.model}`));
    }

    // Session resumption uses different subcommand
    if (finalConfig.continueLastSession) {
      // Use 'exec resume --last' subcommand
      args.push("exec", "resume", "--last");
      console.log(chalk.cyan("🔄 Continuing last session"));
    } else if (finalConfig.sessionId) {
      // Use 'exec resume <session-id>' subcommand
      args.push("exec", "resume", finalConfig.sessionId);
      console.log(chalk.cyan(`🔄 Resuming session: ${finalConfig.sessionId}`));
    } else {
      // Normal execution
      args.push("exec");
    }

    // Add full write access for automation
    args.push("--sandbox", "workspace-write");

    // Add prompt as positional argument
    args.push(message);

    if (dry) {
      console.log(chalk.cyan(`🔧 Using executor: ${this.name}`));
      console.log(chalk.cyan(`codex ${args.join(" ")}`));
      return;
    }

    // Launch codex and wait for it to complete
    const child = spawn("codex", args, {
      stdio: "inherit", // Give tool full terminal control
    });

    // Wait for completion (blocking)
    await new Promise<void>((resolve, reject) => {
      child.on("close", (code: number) => {
        if (code === 0) {
          console.log("✅ Codex CLI execution completed successfully");
          resolve();
        } else {
          const error = new Error(`Codex CLI exited with code ${code}`);
          console.error(`❌ ${error.message}`);
          reject(error);
        }
      });

      child.on("error", (error: Error) => {
        console.error(`❌ Failed to launch Codex CLI: ${error.message}`);
        reject(error);
      });
    });
  }
}
