import { streamText } from "ai";
import type { ToolSet } from "ai";
import { AIConfig, StreamingOptions, RetryConfig } from "../types";
import { BaseOperations } from "../lib/ai-service/base-operations";
import { TaskOMaticError } from "./task-o-matic-error";

export interface AIOperationResult<T> {
  result: T;
  metrics: {
    duration: number;
    tokenUsage?: {
      prompt: number;
      completion: number;
      total: number;
    };
    timeToFirstToken?: number;
  };
}

export interface AIOperationOptions {
  streamingOptions?: StreamingOptions;
  retryConfig?: Partial<RetryConfig>;
  aiConfig?: Partial<AIConfig>;
  enableFilesystemTools?: boolean;
  context?: Record<string, unknown>;
  maxRetries?: number;
}

/**
 * AIOperationUtility - Centralized utility for AI operations with metrics and error handling
 *
 * Extends BaseOperations to inherit core AI functionality (streamText, model provider, etc.)
 * and adds standardized metrics collection, error handling, and retry logic.
 *
 * @example
 * ```typescript
 * const utility = new AIOperationUtility();
 *
 * // Execute operation with metrics
 * const result = await utility.executeAIOperation(
 *   "Task breakdown",
 *   async () => performBreakdown(task),
 *   {
 *     maxRetries: 3,
 *     streamingOptions: { onChunk: console.log }
 *   }
 * );
 *
 * console.log(result.metrics.duration);
 * console.log(result.metrics.timeToFirstToken);
 * ```
 */
export class AIOperationUtility extends BaseOperations {
  /**
   * Execute an AI operation with standardized metrics, error handling, and streaming support
   *
   * This method wraps AI operations to provide:
   * - Automatic retry logic with configurable attempts
   * - Metrics collection (duration, token usage, time to first token)
   * - Error handling with TaskOMaticError wrapping
   * - Streaming support with metrics capture
   *
   * @param operationName - Human-readable name for the operation (used in errors)
   * @param operation - The async operation to execute
   * @param options - Configuration options for retry, streaming, and AI config
   * @returns Promise resolving to AIOperationResult with result and metrics
   * @throws {TaskOMaticError} If operation fails after all retry attempts
   *
   * @example
   * ```typescript
   * try {
   *   const result = await utility.executeAIOperation(
   *     "Task enhancement",
   *     async () => enhanceTask(task),
   *     { maxRetries: 2 }
   *   );
   *   console.log(`Operation took ${result.metrics.duration}ms`);
   * } catch (error) {
   *   if (error instanceof TaskOMaticError) {
   *     console.error(error.getDetails());
   *   }
   * }
   * ```
   */
  async executeAIOperation<T>(
    operationName: string,
    operation: () => Promise<T>,
    options: AIOperationOptions = {}
  ): Promise<AIOperationResult<T>> {
    const startTime = Date.now();
    let timeToFirstToken: number | undefined;

    // Create wrapped streaming options to capture metrics
    const wrappedStreamingOptions = this.wrapStreamingOptions(
      options.streamingOptions,
      startTime,
      (time) => {
        timeToFirstToken = time;
      }
    );

    try {
      // Execute with retry logic
      const result = await this.retryHandler.executeWithRetry(
        async () => {
          // Execute operation - note: operations should use the streaming options
          // passed through the closure, not directly from options
          return await operation();
        },
        {
          maxAttempts:
            options.maxRetries || options.retryConfig?.maxAttempts || 2,
          ...options.retryConfig,
        },
        operationName
      );

      const duration = Date.now() - startTime;

      return {
        result,
        metrics: {
          duration,
          timeToFirstToken,
          tokenUsage: this.extractTokenUsageFromResult(result),
        },
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      const typedError =
        error instanceof Error ? error : new Error(String(error));

      // THROW error instead of returning it
      throw new TaskOMaticError(
        `AI operation failed: ${operationName} - ${this.getErrorMessage(
          typedError
        )}`,
        {
          code: "AI_OPERATION_FAILED",
          context: JSON.stringify({
            operation: operationName,
            duration,
            error: this.getErrorMessage(typedError),
          }),
          cause: typedError,
          suggestions: [
            "Check AI configuration",
            "Verify network connectivity",
            "Review operation parameters",
            "Check API keys and endpoints",
          ],
          metadata: {
            operationName,
            duration,
            attemptedRetries: options.maxRetries || 2,
          },
        }
      );
    }
  }

  /**
   * Standardized streaming text operation with tool support
   *
   * This method provides a unified interface for AI text generation with:
   * - Optional tool integration (filesystem, MCP, etc.)
   * - Streaming support with callbacks
   * - Context7 documentation caching
   * - Metrics collection
   * - Error handling
   *
   * @param systemPrompt - System prompt for the AI
   * @param userMessage - User message/prompt
   * @param config - Optional AI configuration overrides
   * @param streamingOptions - Optional streaming callbacks
   * @param tools - Optional tool set to provide to the AI
   * @returns Promise resolving to the generated text
   *
   * @example
   * ```typescript
   * const result = await utility.streamTextWithTools(
   *   "You are a helpful assistant",
   *   "Explain quantum computing",
   *   undefined,
   *   { onChunk: (chunk) => console.log(chunk) },
   *   filesystemTools
   * );
   * ```
   */
  async streamTextWithTools(
    systemPrompt: string,
    userMessage: string,
    config?: Partial<AIConfig>,
    streamingOptions?: StreamingOptions,
    tools?: ToolSet
  ): Promise<string> {
    const aiConfig = this.mergeAIConfig(config);
    const model = this.modelProvider.getModel(aiConfig);

    // Create streaming configuration with Context7 handling and callbacks
    const streamConfig = this.createStreamingConfig(streamingOptions);

    let accumulatedText = "";
    const originalOnChunk = streamConfig.onChunk;

    // Wrap onChunk to accumulate text locally
    streamConfig.onChunk = (event: any) => {
      // Debug log for chunk structure
      // console.log(
      //   `[DEBUG] Chunk type: ${event.chunk?.type} | keys: ${Object.keys(
      //     event.chunk || {}
      //   ).join(",")}`
      // );

      if (
        event.chunk?.type === "text-delta" &&
        typeof event.chunk.text === "string"
      ) {
        accumulatedText += event.chunk.text;
        // } else {
        // console.log(
        //   `[DEBUG] Ignored chunk content:`,
        //   JSON.stringify(event.chunk)
        // );
      }

      if (originalOnChunk) {
        originalOnChunk(event);
      }
    };

    const result = await streamText({
      model,
      tools: tools || {},
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
      maxRetries: 0,
      ...streamConfig,
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

    const fullText = await result.text;
    return fullText || accumulatedText;
  }

  /**
   * Wrap streaming options to capture metrics
   *
   * @private
   */
  private wrapStreamingOptions(
    streamingOptions: StreamingOptions | undefined,
    startTime: number,
    onFirstToken: (time: number) => void
  ): StreamingOptions | undefined {
    if (!streamingOptions) {
      return undefined;
    }

    let firstTokenCaptured = false;

    return {
      ...streamingOptions,
      onChunk: (chunk: string) => {
        if (!firstTokenCaptured && chunk.trim()) {
          onFirstToken(Date.now() - startTime);
          firstTokenCaptured = true;
        }
        streamingOptions.onChunk?.(chunk);
      },
      onFinish: (result: any) => {
        streamingOptions.onFinish?.(result);
      },
      onReasoning: (reasoning: string) => {
        streamingOptions.onReasoning?.(reasoning);
      },
      onError: (error: unknown) => {
        streamingOptions.onError?.(error as Error);
      },
    };
  }

  /**
   * Create streaming configuration with Context7 handling and callbacks
   *
   * This method creates a unified streaming configuration that:
   * - Always handles Context7 tool-result events (even without streaming UI)
   * - Forwards text-delta events to onChunk callback
   * - Forwards reasoning-delta events to onReasoning callback
   * - Handles errors with onError callback
   * - Provides onFinish callback with completion data
   *
   * @private
   */
  private createStreamingConfig(streamingOptions?: StreamingOptions) {
    return {
      onChunk:
        streamingOptions?.onChunk || streamingOptions?.onReasoning
          ? (event: any) => {
              // Handle Context7 tool results ALWAYS (critical for caching)
              this.handleContext7ToolResult(event.chunk);

              // Forward text deltas to user callback
              if (event.chunk?.type === "text-delta") {
                streamingOptions?.onChunk?.(event.chunk.text);
              }

              // Forward reasoning deltas to user callback
              if (event.chunk?.type === "reasoning-delta") {
                streamingOptions?.onReasoning?.(event.chunk.text);
              }
            }
          : undefined,
      onFinish: streamingOptions?.onFinish
        ? (event: any) => {
            streamingOptions.onFinish!({
              text: event.text,
              finishReason: event.finishReason,
              usage: event.usage,
              isAborted: false,
            });
          }
        : undefined,
      onError: streamingOptions?.onError
        ? (event: any) => {
            streamingOptions.onError!(event.error);
          }
        : undefined,
    };
  }

  /**
   * Extract token usage from AI result
   *
   * @private
   */
  private extractTokenUsageFromResult(result: any):
    | {
        prompt: number;
        completion: number;
        total: number;
      }
    | undefined {
    if (result && result.usage) {
      return {
        prompt: result.usage.prompt_tokens || 0,
        completion: result.usage.completion_tokens || 0,
        total: result.usage.total_tokens || 0,
      };
    }
    return undefined;
  }

  /**
   * Get error message from any error type
   *
   * @private
   */
  private getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    } else if (typeof error === "string") {
      return error;
    } else {
      return "Unknown error";
    }
  }
}
