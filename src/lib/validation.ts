import { exec } from "child_process";
import { promisify } from "util";
import { logger } from "./logger";
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

/**
 * Format verification error for AI feedback
 * Produces a structured message that AI can easily parse and act upon
 */
export function formatVerificationError(result: ValidationResult): string {
  return `## Verification Failed: ${result.command}

**Error Output**:
\`\`\`
${result.error || "No error output captured"}
\`\`\`

Please analyze this error carefully and fix the issue. Common causes include:
- Syntax errors in the code
- Type errors (missing types, wrong types)
- Missing imports or dependencies
- Logic errors or incorrect implementations
- Build configuration issues`;
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
    logger.warn(
      "🔍 DRY RUN - Validation/verification commands that would run:"
    );
    validations.forEach((cmd) => {
      logger.progress(`  ${cmd}`);
      results.push({
        command: cmd,
        success: true,
        output: "DRY RUN - not executed",
      });
    });
    return results;
  }

  logger.info(
    `🧪 Running ${validations.length} validation/verification command${
      validations.length > 1 ? "s" : ""
    }...`
  );

  for (let i = 0; i < validations.length; i++) {
    const validation = validations[i];
    logger.info(
      `🧪 Running validation [${i + 1}/${validations.length}]: ${validation}`
    );

    try {
      const { stdout, stderr } = await execFn(validation);
      logger.success(`✅ Validation passed: ${validation}`);

      // Show stdout if there's any output
      if (stdout && stdout.trim()) {
        logger.progress(`   Output: ${stdout.trim()}`);
      }

      results.push({
        command: validation,
        success: true,
        output: stdout.trim(),
      });
    } catch (error: any) {
      logger.error(`❌ Validation failed: ${validation}`);

      const errorOutput = error.stderr || error.stdout || error.message;

      // Show error details
      if (error.stdout && error.stdout.trim()) {
        logger.warn(`   stdout: ${error.stdout.trim()}`);
      }
      if (error.stderr && error.stderr.trim()) {
        logger.error(`   stderr: ${error.stderr.trim()}`);
      }
      if (error.message) {
        logger.error(`   Error: ${error.message}`);
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
    logger.success(
      `🎉 All ${validations.length} validation${
        validations.length > 1 ? "s" : ""
      } passed!`
    );
  }

  return results;
}
