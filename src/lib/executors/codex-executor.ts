import { ExternalExecutor } from "../../types";
import chalk from "chalk";
import { spawn } from "child_process";

export class CodexExecutor implements ExternalExecutor {
  name = "codex";

  async execute(message: string, dry: boolean = false): Promise<void> {
    const command = `codex exec "${message}"`;

    if (dry) {
      console.log(chalk.cyan(command));
      return;
    }

    console.log(`🚀 Launching Codex CLI with message: ${message}`);

    // Launch codex and wait for it to complete
    const child = spawn("codex", ["exec", message], {
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
