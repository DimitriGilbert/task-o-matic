import { AIConfig } from "../types";

export interface AIOptions {
  aiProvider?: string;
  aiModel?: string;
  aiKey?: string;
  aiProviderUrl?: string;
  aiReasoning?: string;
}

/**
 * Builds an AI configuration object from CLI options
 * This eliminates the duplication of this pattern across 10+ files
 */
export function buildAIConfig(options?: AIOptions): Partial<AIConfig> {
  if (!options) return {};

  return {
    ...(options.aiProvider && {
      provider: options.aiProvider as
        | "openrouter"
        | "openai"
        | "anthropic"
        | "custom",
    }),
    ...(options.aiModel && { model: options.aiModel }),
    ...(options.aiKey && { apiKey: options.aiKey }),
    ...(options.aiProviderUrl && { baseURL: options.aiProviderUrl }),
    ...(options.aiReasoning && {
      reasoning: { maxTokens: parseInt(options.aiReasoning, 10) },
    }),
  };
}
