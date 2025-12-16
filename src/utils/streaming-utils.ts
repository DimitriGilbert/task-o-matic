import { StreamingOptions } from "../types/index.js";

/**
 * Token usage metrics from AI operations
 */
export interface TokenUsage {
  prompt: number;
  completion: number;
  total: number;
}

export interface MetricsTracker {
  tokenUsage: TokenUsage;
  timeToFirstToken: number | undefined;
}

export interface MetricsStreamingResult {
  options: StreamingOptions;
  getMetrics: () => MetricsTracker;
}

/**
 * Creates streaming options with automatic metrics tracking.
 * Wraps provided streaming callbacks to capture token usage and timing metrics.
 *
 * @param streamingOptions - Optional base streaming options to wrap
 * @param aiStartTime - Optional timestamp when AI operation started (for measuring time to first token)
 * @returns Object containing wrapped streaming options and metrics getter
 *
 * @example
 * ```typescript
 * const aiStartTime = Date.now();
 * const { options, getMetrics } = createMetricsStreamingOptions(userCallbacks, aiStartTime);
 *
 * await generateText({ model, prompt, ...options });
 *
 * const { tokenUsage, timeToFirstToken } = getMetrics();
 * console.log(`Used ${tokenUsage.total} tokens in ${timeToFirstToken}ms`);
 * ```
 */
export function createMetricsStreamingOptions(
  streamingOptions?: StreamingOptions,
  aiStartTime?: number
): MetricsStreamingResult {
  let tokenUsage: TokenUsage = { prompt: 0, completion: 0, total: 0 };
  let timeToFirstToken: number | undefined = undefined;

  const wrappedOptions: StreamingOptions = {
    onFinish: async (result: any) => {
      // Extract token usage from result
      if (result.usage) {
        tokenUsage = {
          prompt: result.usage.inputTokens || result.usage.promptTokens || 0,
          completion:
            result.usage.outputTokens || result.usage.completionTokens || 0,
          total: result.usage.totalTokens || 0,
        };
      }

      // Call original onFinish callback if provided
      await streamingOptions?.onFinish?.(result);
    },
    onChunk: (chunk: string) => {
      // Measure time to first token (ignore empty/whitespace chunks)
      if (chunk && chunk.trim() && !timeToFirstToken && aiStartTime) {
        timeToFirstToken = Date.now() - aiStartTime;
      }

      // Call original onChunk callback if provided
      streamingOptions?.onChunk?.(chunk);
    },
    onError: (error: unknown) => {
      // Pass through error callback
      streamingOptions?.onError?.(error);
    },
    onReasoning: (text: string) => {
      // Pass through reasoning callback
      streamingOptions?.onReasoning?.(text);
    },
  };

  return {
    options: wrappedOptions,
    getMetrics: () => ({ tokenUsage, timeToFirstToken }),
  };
}
