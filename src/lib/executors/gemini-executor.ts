import { ExternalExecutor } from "../../types";
import chalk from "chalk";
import { spawn } from "child_process";

export class GeminiExecutor implements ExternalExecutor {
  name = "gemini";

  async execute(message: string, dry: boolean = false): Promise<void> {
    if (dry) {
      console.log(chalk.cyan(`🔧 Using executor: ${this.name}`));
      console.log(chalk.cyan(`gemini -p "${message}"`));
      return;
    }

    // Launch gemini and wait for it to complete
    const child = spawn("gemini", ["-p", message], {
      stdio: "inherit", // Give tool full terminal control
    });

    // Wait for completion (blocking)
    await new Promise<void>((resolve, reject) => {
      child.on("close", (code: number) => {
        if (code === 0) {
          console.log("✅ Gemini CLI execution completed successfully");
          resolve();
        } else {
          const error = new Error(`Gemini CLI exited with code ${code}`);
          console.error(`❌ ${error.message}`);
          reject(error);
        }
      });

      child.on("error", (error: Error) => {
        console.error(`❌ Failed to launch Gemini CLI: ${error.message}`);
        reject(error);
      });
    });
  }
}
