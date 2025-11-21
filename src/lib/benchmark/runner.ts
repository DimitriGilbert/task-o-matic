import {
  BenchmarkConfig,
  BenchmarkResult,
  BenchmarkRun,
  BenchmarkProgressEvent,
} from "./types";
import { benchmarkRegistry } from "./registry";
import { benchmarkStorage } from "./storage";
import { AIConfig } from "../../types";
import { configManager } from "../config";

export class BenchmarkRunner {
  async run(
    operationId: string,
    input: any,
    config: BenchmarkConfig,
    onProgress?: (event: BenchmarkProgressEvent) => void
  ): Promise<BenchmarkRun> {
    const operation = benchmarkRegistry.get(operationId);
    if (!operation) {
      throw new Error(`Operation ${operationId} not found`);
    }

    if (!operation.validateInput(input)) {
      throw new Error(`Invalid input for operation ${operationId}`);
    }

    const runId = `run-${Date.now()}`;
    const results: BenchmarkResult[] = [];

    // Create a queue of models to process
    const queue = [...config.models];
    const activePromises: Promise<void>[] = [];

    // Helper to process a single model
    const processModel = async (modelConfig: any) => {
      const modelId = `${modelConfig.provider}:${modelConfig.model}${
        modelConfig.reasoningTokens
          ? `:reasoning=${modelConfig.reasoningTokens}`
          : ""
      }`;

      const startTime = Date.now();
      let output: any;
      let error: string | undefined;
      let tokenUsage:
        | { prompt: number; completion: number; total: number }
        | undefined;
      let responseSize = 0;
      let firstTokenTime: number | undefined;

      // Emit start event
      onProgress?.({ type: "start", modelId });

      try {
        // Construct AI options for this specific run
        const aiOptions: any = {
          aiProvider: modelConfig.provider,
          aiModel: modelConfig.model,
          aiReasoning: modelConfig.reasoningTokens,
        };

        // Setup streaming options to capture metrics
        const streamingOptions = {
          onFinish: async (result: any) => {
            if (result.usage) {
              tokenUsage = {
                prompt:
                  result.usage.inputTokens || result.usage.promptTokens || 0,
                completion:
                  result.usage.outputTokens ||
                  result.usage.completionTokens ||
                  0,
                total: result.usage.totalTokens || 0,
              };
            }
            // Estimate response size from text length if available, or JSON stringify
            if (result.text) {
              responseSize = Buffer.byteLength(result.text, "utf8");
            }
          },
          onChunk: (chunk: string) => {
            if (chunk) {
              if (!firstTokenTime) {
                firstTokenTime = Date.now();
              }
              const chunkSize = Buffer.byteLength(chunk, "utf8");
              responseSize += chunkSize;

              const currentDuration = Date.now() - startTime;
              const currentBps =
                currentDuration > 0
                  ? Math.round(responseSize / (currentDuration / 1000))
                  : 0;

              onProgress?.({
                type: "progress",
                modelId,
                currentSize: responseSize,
                currentBps,
                chunk: chunk,
                duration: currentDuration,
              });
            }
          },
        };

        // Execute operation
        output = await operation.execute(input, aiOptions, streamingOptions);

        // If responseSize wasn't captured via streaming (e.g. non-streaming response), calculate from output
        if (responseSize === 0 && output) {
          const outputStr =
            typeof output === "string" ? output : JSON.stringify(output);
          responseSize = Buffer.byteLength(outputStr, "utf8");
        }
      } catch (e: any) {
        error = e.message || String(e);
        onProgress?.({ type: "error", modelId, error });
      }

      const duration = Date.now() - startTime;
      const bps =
        duration > 0 && responseSize > 0
          ? Math.round(responseSize / (duration / 1000))
          : 0;
      const tps =
        duration > 0 && tokenUsage?.completion
          ? Math.round(tokenUsage.completion / (duration / 1000))
          : 0;

      results.push({
        modelId,
        output,
        duration,
        error,
        timestamp: Date.now(),
        tokenUsage,
        responseSize,
        bps,
        tps,
        timeToFirstToken: firstTokenTime
          ? firstTokenTime - startTime
          : undefined,
      });

      // Emit complete event
      onProgress?.({ type: "complete", modelId, duration });
    };

    // Process queue with concurrency limit
    while (queue.length > 0 || activePromises.length > 0) {
      // Fill active promises up to concurrency limit
      while (queue.length > 0 && activePromises.length < config.concurrency) {
        const modelConfig = queue.shift();
        if (modelConfig) {
          const promise = processModel(modelConfig).then(() => {
            // Remove self from active promises
            activePromises.splice(activePromises.indexOf(promise), 1);
          });
          activePromises.push(promise);

          // Add delay if configured and there are more items
          if (config.delay > 0 && queue.length > 0) {
            await new Promise((resolve) => setTimeout(resolve, config.delay));
          }
        }
      }

      // Wait for at least one promise to complete if we're at capacity or queue is empty
      if (activePromises.length > 0) {
        await Promise.race(activePromises);
      }
    }

    const run: BenchmarkRun = {
      id: runId,
      timestamp: Date.now(),
      command: operationId,
      input,
      config,
      results,
    };

    benchmarkStorage.saveRun(run);
    return run;
  }
}

export const benchmarkRunner = new BenchmarkRunner();
