import { exec } from "child_process";
import { promisify } from "util";
import chalk from "chalk";
import { AIConfig } from "../types";

const execAsync = promisify(exec);

/**
 * Validation/Verification result for a single command
 */
export interface ValidationResult {
  command: string;
  success: boolean;
  output?: string;
  error?: string;
}

export function isValidAIProvider(
  provider: string
): provider is NonNullable<AIConfig["provider"]> {
  return ["openrouter", "openai", "anthropic", "custom"].includes(provider);
}

/**
 * Run validation/verification commands and return results
 * Supports both --validate and --verify as aliases
 * Returns detailed results for each command
 */
export async function runValidations(
  validations: string[],
  dry: boolean,
  execFn: (
    command: string
  ) => Promise<{ stdout: string; stderr: string }> = execAsync
): Promise<ValidationResult[]> {
  const results: ValidationResult[] = [];

  if (validations.length === 0) {
    return results;
  }

  if (dry) {
    console.log(
      chalk.yellow(
        "🔍 DRY RUN - Validation/verification commands that would run:"
      )
    );
    validations.forEach((cmd) => {
      console.log(chalk.cyan(`  ${cmd}`));
      results.push({
        command: cmd,
        success: true,
        output: "DRY RUN - not executed",
      });
    });
    return results;
  }

  console.log(
    chalk.blue(
      `🧪 Running ${validations.length} validation/verification command${
        validations.length > 1 ? "s" : ""
      }...`
    )
  );

  for (let i = 0; i < validations.length; i++) {
    const validation = validations[i];
    console.log(
      chalk.blue(
        `🧪 Running validation [${i + 1}/${validations.length}]: ${validation}`
      )
    );

    try {
      const { stdout, stderr } = await execFn(validation);
      console.log(chalk.green(`✅ Validation passed: ${validation}`));

      // Show stdout if there's any output
      if (stdout && stdout.trim()) {
        console.log(chalk.gray(`   Output: ${stdout.trim()}`));
      }

      results.push({
        command: validation,
        success: true,
        output: stdout.trim(),
      });
    } catch (error: any) {
      console.error(chalk.red(`❌ Validation failed: ${validation}`));

      const errorOutput = error.stderr || error.stdout || error.message;

      // Show error details
      if (error.stdout && error.stdout.trim()) {
        console.error(chalk.yellow(`   stdout: ${error.stdout.trim()}`));
      }
      if (error.stderr && error.stderr.trim()) {
        console.error(chalk.red(`   stderr: ${error.stderr.trim()}`));
      }
      if (error.message) {
        console.error(chalk.red(`   Error: ${error.message}`));
      }

      results.push({
        command: validation,
        success: false,
        error: errorOutput,
      });

      // Return early on first failure
      break;
    }
  }

  const allPassed = results.every((r) => r.success);
  if (allPassed) {
    console.log(
      chalk.green(
        `🎉 All ${validations.length} validation${
          validations.length > 1 ? "s" : ""
        } passed!`
      )
    );
  }

  return results;
}