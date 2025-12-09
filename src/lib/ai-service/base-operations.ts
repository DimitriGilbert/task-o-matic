import { streamText } from "ai";
import type { LanguageModelV2 } from "@ai-sdk/provider";
import { AIConfig, StreamingOptions, RetryConfig } from "../../types";
import { JSONParser } from "./json-parser";
import { Context7Client } from "./mcp-client";
import { RetryHandler } from "./retry-handler";
import { ModelProvider } from "./model-provider";

export class BaseOperations {
  protected jsonParser = new JSONParser();
  protected context7Client = new Context7Client();
  protected retryHandler = new RetryHandler();
  protected modelProvider = new ModelProvider();

  /**
   * Merges AI configuration with proper precedence.
   *
   * Configuration precedence (highest to lowest):
   * 1. Method parameter `config` (operation-specific overrides)
   * 2. ConfigManager global config (project-level settings)
   * 3. Environment variables (OPENAI_API_KEY, etc.)
   * 4. Provider defaults (defined in config.ts)
   *
   * @param config - Optional operation-specific config overrides
   * @returns Merged AIConfig with all precedence levels applied
   *
   * @example
   * ```typescript
   * // Override just the model for this operation
   * const finalConfig = this.mergeAIConfig({ model: "gpt-4o" });
   *
   * // Use default config (from ConfigManager + env vars)
   * const finalConfig = this.mergeAIConfig();
   * ```
   */
  protected mergeAIConfig(config?: Partial<AIConfig>): AIConfig {
    // Get base config (includes ConfigManager + env vars + defaults)
    const baseConfig = this.modelProvider.getAIConfig();

    // Apply operation-specific overrides (highest priority)
    return { ...baseConfig, ...config };
  }

  async streamText(
    prompt: string,
    config?: Partial<AIConfig>,
    systemPrompt?: string,
    userMessage?: string,
    streamingOptions?: StreamingOptions,
    retryConfig?: Partial<RetryConfig>
  ): Promise<string> {
    // Merge config with proper precedence (Bug fix 2.9)
    const aiConfig = this.mergeAIConfig(config);

    return this.retryHandler.executeWithRetry(
      async () => {
        const model = this.modelProvider.getModel(aiConfig);

        const result = streamText({
          model,
          system: systemPrompt,
          messages: [{ role: "user", content: userMessage || prompt }],
          maxRetries: 0,
          onError: ({ error }) => {
            streamingOptions?.onError?.(error);
            throw error;
          },
          onChunk: streamingOptions?.onChunk
            ? ({ chunk }) => {
                if (chunk.type === "text-delta") {
                  streamingOptions.onChunk!(chunk.text);
                } else if (chunk.type === "reasoning-delta") {
                  streamingOptions.onReasoning?.(chunk.text);
                } else if (
                  chunk.type === "tool-result" &&
                  chunk.toolName === "get-library-docs"
                ) {
                  const docs = chunk.output;
                  if (docs && typeof docs === "object" && "content" in docs) {
                    this.context7Client.saveContext7Documentation(
                      chunk.input?.context7CompatibleLibraryID || "unknown",
                      docs.content,
                      chunk.input?.topic || "general"
                    );
                  } else if (docs && typeof docs === "string") {
                    this.context7Client.saveContext7Documentation(
                      chunk.input?.context7CompatibleLibraryID || "unknown",
                      docs,
                      chunk.input?.topic || "general"
                    );
                  }
                }
              }
            : undefined,
          onFinish: streamingOptions?.onFinish
            ? ({ text, finishReason, usage }) => {
                streamingOptions.onFinish!({
                  text,
                  finishReason,
                  usage,
                  isAborted: false,
                });
              }
            : undefined,
          ...(aiConfig.provider === "openrouter" &&
          aiConfig.reasoning &&
          aiConfig.reasoning.maxTokens
            ? {
                providerOptions: {
                  openrouter: {
                    reasoning: {
                      max_tokens: aiConfig.reasoning.maxTokens,
                    },
                  },
                },
              }
            : {}),
        });

        let fullText = "";
        for await (const textPart of result.textStream) {
          fullText += textPart;
        }

        return fullText;
      },
      retryConfig,
      "AI streaming"
    );
  }
}
