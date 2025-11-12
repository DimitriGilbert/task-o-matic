import { ExternalExecutor, ExecutionResult } from "../../types";
import { updateTask } from "../tasks/update";
import chalk from "chalk";
import { spawn } from "child_process";

export class OpencodeExecutor implements ExternalExecutor {
  name = "opencode";

  async execute(message: string, dry: boolean = false): Promise<void> {
    const command = `opencode run "${message}"`;

    if (dry) {
      console.log(chalk.cyan(command));
      return;
    }

    console.log(`🚀 Launching opencode with message: ${message}`);

    // Launch opencode and wait for it to complete
    const child = spawn("opencode", ["-p", message], {
      stdio: "inherit", // Give tool full terminal control
    });
    // run opencode and wait for it to complete
    // const child = spawn("opencode", ["run", message], {
    //   stdio: "inherit", // Give tool full terminal control
    // });

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
