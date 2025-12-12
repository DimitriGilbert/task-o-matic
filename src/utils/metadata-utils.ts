import { AIConfig } from "../types";

/**
 * Creates base AI metadata object with common fields.
 * Caller can extend with operation-specific fields.
 *
 * @param taskId - The ID of the task
 * @param aiConfig - AI configuration used for the operation
 * @param promptOverride - Optional custom prompt override
 * @param defaultPrompt - Default prompt if no override provided
 * @param confidence - Confidence score (0-1) for the AI operation
 * @returns Base metadata object
 *
 * @example
 * ```typescript
 * const baseMetadata = createBaseAIMetadata(
 *   "task-123",
 *   { provider: "anthropic", model: "claude-sonnet-4.5" },
 *   undefined,
 *   "Split task into subtasks",
 *   0.9
 * );
 *
 * // Extend with operation-specific fields
 * const subtaskMetadata = {
 *   ...baseMetadata,
 *   parentTaskId: "parent-123",
 *   subtaskIndex: 1
 * };
 * ```
 */
export function createBaseAIMetadata(
  taskId: string,
  aiConfig: Partial<AIConfig>,
  promptOverride?: string,
  defaultPrompt: string = "AI-generated task",
  confidence: number = 0.9
) {
  return {
    taskId,
    aiGenerated: true,
    aiPrompt: promptOverride || defaultPrompt,
    confidence,
    aiProvider: aiConfig.provider,
    aiModel: aiConfig.model,
    generatedAt: Date.now(),
  };
}
