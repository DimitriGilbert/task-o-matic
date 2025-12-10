import { z } from "zod";
import { TaskOMaticError, TaskOMaticErrorCodes } from "../utils/task-o-matic-error";

/**
 * Zod schema for AI Provider
 */
export const AIProviderSchema = z.enum(["openai", "anthropic", "openrouter", "custom"], {
  errorMap: () => ({
    message: "Provider must be one of: openai, anthropic, openrouter, custom",
  }),
});

/**
 * Zod schema for AI Configuration
 */
export const AIConfigSchema = z.object({
  provider: AIProviderSchema,
  model: z.string().min(1, "Model name cannot be empty"),
  apiKey: z.string().optional(),
  baseURL: z.string().url("Base URL must be a valid URL").optional().or(z.literal("")),
  maxTokens: z
    .number()
    .int("Max tokens must be an integer")
    .positive("Max tokens must be positive")
    .max(1000000, "Max tokens cannot exceed 1,000,000")
    .optional(),
  temperature: z
    .number()
    .min(0, "Temperature must be between 0 and 2")
    .max(2, "Temperature must be between 0 and 2")
    .optional(),
  context7Enabled: z.boolean().optional(),
  reasoning: z
    .object({
      maxTokens: z
        .number()
        .int("Reasoning max tokens must be an integer")
        .positive("Reasoning max tokens must be positive")
        .max(100000, "Reasoning max tokens cannot exceed 100,000")
        .optional(),
    })
    .optional(),
});

/**
 * Zod schema for full Config object
 */
export const ConfigSchema = z.object({
  ai: AIConfigSchema,
  workingDirectory: z.string().optional(),
});

/**
 * Validation result type
 */
export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: Array<{
    path: string;
    message: string;
  }>;
}

/**
 * Validate AI configuration
 *
 * @param config - AI configuration to validate
 * @returns Validated and typed configuration
 * @throws {TaskOMaticError} If validation fails
 *
 * @example
 * ```typescript
 * const aiConfig = {
 *   provider: "openai",
 *   model: "gpt-4",
 *   temperature: 0.7,
 *   maxTokens: 4000
 * };
 *
 * const validated = validateAIConfig(aiConfig);
 * // validated is now type-safe and guaranteed valid
 * ```
 */
export function validateAIConfig(config: unknown): z.infer<typeof AIConfigSchema> {
  try {
    return AIConfigSchema.parse(config);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map((err) => ({
        path: err.path.join("."),
        message: err.message,
      }));

      throw new TaskOMaticError("AI configuration validation failed", {
        code: TaskOMaticErrorCodes.CONFIGURATION_ERROR,
        context: JSON.stringify(config, null, 2),
        suggestions: [
          "Check that all required fields are present",
          "Verify provider is one of: openai, anthropic, openrouter, custom",
          "Ensure model name is not empty",
          "Check temperature is between 0 and 2",
          "Verify maxTokens is a positive integer",
          ...errors.map((e) => `Fix ${e.path}: ${e.message}`),
        ],
        metadata: { errors },
      });
    }
    throw error;
  }
}

/**
 * Validate full configuration object
 *
 * @param config - Configuration object to validate
 * @returns Validated and typed configuration
 * @throws {TaskOMaticError} If validation fails
 *
 * @example
 * ```typescript
 * const config = {
 *   ai: {
 *     provider: "anthropic",
 *     model: "claude-sonnet-4.5",
 *     temperature: 0.5
 *   },
 *   workingDirectory: "/path/to/project"
 * };
 *
 * const validated = validateConfig(config);
 * ```
 */
export function validateConfig(config: unknown): z.infer<typeof ConfigSchema> {
  try {
    return ConfigSchema.parse(config);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map((err) => ({
        path: err.path.join("."),
        message: err.message,
      }));

      throw new TaskOMaticError("Configuration validation failed", {
        code: TaskOMaticErrorCodes.CONFIGURATION_ERROR,
        context: JSON.stringify(config, null, 2),
        suggestions: [
          "Check that all required fields are present",
          "Verify the configuration structure is correct",
          ...errors.map((e) => `Fix ${e.path}: ${e.message}`),
        ],
        metadata: { errors },
      });
    }
    throw error;
  }
}

/**
 * Safe validation that returns a result object instead of throwing
 *
 * @param config - Configuration to validate
 * @returns Validation result with success flag and data or errors
 *
 * @example
 * ```typescript
 * const result = safeValidateConfig(userInput);
 * if (result.success) {
 *   console.log("Valid config:", result.data);
 * } else {
 *   console.error("Validation errors:", result.errors);
 * }
 * ```
 */
export function safeValidateConfig(config: unknown): ValidationResult<z.infer<typeof ConfigSchema>> {
  const result = ConfigSchema.safeParse(config);

  if (result.success) {
    return {
      success: true,
      data: result.data,
    };
  } else {
    return {
      success: false,
      errors: result.error.errors.map((err) => ({
        path: err.path.join("."),
        message: err.message,
      })),
    };
  }
}

/**
 * Safe AI config validation
 *
 * @param config - AI configuration to validate
 * @returns Validation result with success flag and data or errors
 */
export function safeValidateAIConfig(config: unknown): ValidationResult<z.infer<typeof AIConfigSchema>> {
  const result = AIConfigSchema.safeParse(config);

  if (result.success) {
    return {
      success: true,
      data: result.data,
    };
  } else {
    return {
      success: false,
      errors: result.error.errors.map((err) => ({
        path: err.path.join("."),
        message: err.message,
      })),
    };
  }
}

/**
 * Validate partial AI config (for updates)
 *
 * @param config - Partial AI configuration to validate
 * @returns Validated partial configuration
 * @throws {TaskOMaticError} If validation fails
 *
 * @example
 * ```typescript
 * // Only validating fields that are present
 * const updates = {
 *   temperature: 0.8
 * };
 *
 * const validated = validatePartialAIConfig(updates);
 * ```
 */
export function validatePartialAIConfig(
  config: unknown
): Partial<z.infer<typeof AIConfigSchema>> {
  try {
    return AIConfigSchema.partial().parse(config);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map((err) => ({
        path: err.path.join("."),
        message: err.message,
      }));

      throw new TaskOMaticError("AI configuration update validation failed", {
        code: TaskOMaticErrorCodes.CONFIGURATION_ERROR,
        context: JSON.stringify(config, null, 2),
        suggestions: [
          "Check that field values are valid",
          ...errors.map((e) => `Fix ${e.path}: ${e.message}`),
        ],
        metadata: { errors },
      });
    }
    throw error;
  }
}
