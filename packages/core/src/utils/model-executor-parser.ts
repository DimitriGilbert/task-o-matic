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

    const result = parseExecutorModelString(trimmed);

    if (result.executor) {
      return {
        executor: result.executor,
        model: result.model,
      };
    }

    // Just a model name - use default executor
    return {
      model: result.model,
    };
  });
}

/**
 * Parse a model string that might include an executor prefix
 * Handles cases like:
 * - "opencode:gpt-4o" -> { executor: "opencode", model: "gpt-4o" }
 * - "gpt-4o" -> { executor: undefined, model: "gpt-4o" }
 * - "model:with:colons" -> { executor: undefined, model: "model:with:colons" }
 *
 * @param value - string to parse
 * @returns Object with executor (if valid) and model
 */
export function parseExecutorModelString(value: string): {
  executor?: ExecutorTool;
  model: string;
} {
  const firstColonIndex = value.indexOf(":");

  if (firstColonIndex === -1) {
    return { model: value };
  }

  const potentialExecutor = value.substring(0, firstColonIndex);
  const rest = value.substring(firstColonIndex + 1);

  if (validateExecutor(potentialExecutor)) {
    return {
      executor: potentialExecutor,
      model: rest,
    };
  }

  return {
    model: value,
  };
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
