import { ExternalExecutor } from "../../types";
import chalk from "chalk";
import { spawn } from "child_process";

export class ClaudeCodeExecutor implements ExternalExecutor {
  name = "claude";

  async execute(message: string, dry: boolean = false): Promise<void> {
    const command = `claude -p "${message}"`;

    if (dry) {
      console.log(chalk.cyan(command));
      return;
    }

    console.log(`🚀 Launching Claude Code with message: ${message}`);

    // Launch claude and wait for it to complete
    const child = spawn("claude", ["-p", message], {
      stdio: "inherit", // Give tool full terminal control
    });

    // Wait for completion (blocking)
    await new Promise<void>((resolve, reject) => {
      child.on("close", (code: number) => {
        if (code === 0) {
          console.log("✅ Claude Code execution completed successfully");
          resolve();
        } else {
          const error = new Error(`Claude Code exited with code ${code}`);
          console.error(`❌ ${error.message}`);
          reject(error);
        }
      });

      child.on("error", (error: Error) => {
        console.error(`❌ Failed to launch Claude Code: ${error.message}`);
        reject(error);
      });
    });
  }
}
