import { ExecutorTool, ModelAttemptConfig } from "../types";
import {
  createStandardError,
  TaskOMaticErrorCodes,
} from "./task-o-matic-error";

/**
 * Valid executor tools
 */
export const VALID_EXECUTORS: ExecutorTool[] = [
  "opencode",
  "claude",
  "gemini",
  "codex",
  "kilo",
];

/**
 * Parse --try-models option into ModelAttemptConfig array
 * Supports formats:
 * - "model1,model2,model3" - just models (uses default executor)
 * - "opencode:gpt-4o,claude:sonnet-4" - executor:model format
 * - Mixed: "gpt-4o,claude:sonnet-4,gemini:gemini-2.0"
 *
 * @param value - Comma-separated model/executor specifications
 * @returns Array of model attempt configurations
 * @throws TaskOMaticError if an invalid executor is specified
 *
 * @example
 * ```typescript
 * parseTryModels("gpt-4o-mini,gpt-4o"); // [{ model: "gpt-4o-mini" }, { model: "gpt-4o" }]
 * parseTryModels("opencode:gpt-4o,claude:sonnet-4"); // [{ executor: "opencode", model: "gpt-4o" }, ...]
 * ```
 */
export function parseTryModels(value: string): ModelAttemptConfig[] {
  return value.split(",").map((item) => {
    const trimmed = item.trim();

    // Check if it includes executor specification (executor:model format)
    if (trimmed.includes(":")) {
      const [executor, model] = trimmed.split(":");

      if (!VALID_EXECUTORS.includes(executor as ExecutorTool)) {
        throw createStandardError(
          TaskOMaticErrorCodes.INVALID_INPUT,
          `Invalid executor "${executor}" in --try-models. Must be one of: ${VALID_EXECUTORS.join(
            ", "
          )}`
        );
      }

      return {
        executor: executor as ExecutorTool,
        model: model.trim(),
      };
    }

    // Just a model name - use default executor
    return {
      model: trimmed,
    };
  });
}

/**
 * Validate that an executor name is valid
 *
 * @param executor - Executor name to validate
 * @returns Type guard confirming executor is valid
 *
 * @example
 * ```typescript
 * if (validateExecutor(options.tool)) {
 *   // TypeScript knows options.tool is ExecutorTool
 * }
 * ```
 */
export function validateExecutor(executor: string): executor is ExecutorTool {
  return VALID_EXECUTORS.includes(executor as ExecutorTool);
}
