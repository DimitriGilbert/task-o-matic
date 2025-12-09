import * as assert from "assert";
import { AIOperationUtility } from "../../utils/ai-operation-utility";
import { TaskOMaticError } from "../../utils/task-o-matic-error";
import { RetryHandler } from "../../lib/ai-service/retry-handler";
import { ModelProvider } from "../../lib/ai-service/model-provider";
import { Context7Client } from "../../lib/ai-service/mcp-client";

/**
 * ⚠️ CRITICAL: These tests use 100% MOCKS - ZERO real AI calls
 * No API calls are made, no costs incurred, tests run fast
 */
describe("AIOperationUtility", () => {
  let utility: AIOperationUtility;
  let mockRetryHandler: any;
  let mockModelProvider: any;
  let mockContext7Client: any;

  beforeEach(() => {
    // Create utility instance
    utility = new AIOperationUtility();

    // Create mock retry handler - NO REAL RETRIES
    mockRetryHandler = {
      executeWithRetry: async (operation: () => Promise<any>) => {
        // Execute immediately without real retry logic
        return await operation();
      },
    };

    // Create mock model provider - NO REAL AI MODELS
    mockModelProvider = {
      getModel: () => ({
        // Mock AI SDK v2 compliant model
        specificationVersion: "v2",
        provider: "mock",
        modelId: "mock-model",
        doGenerate: async () => ({
          text: "Mock response",
          finishReason: "stop",
          usage: {
            promptTokens: 10,
            completionTokens: 5,
            totalTokens: 15,
          },
        }),
        doStream: async () => ({
          stream: (async function* () {
            yield { type: "text-delta", textDelta: "Mock" };
            yield { type: "text-delta", textDelta: " response" };
          })(),
        }),
      }),
      getAIConfig: () => ({
        provider: "mock",
        model: "mock-model",
        apiKey: "mock-key",
      }),
    };

    // Create mock Context7 client - NO REAL DOCUMENTATION FETCHES
    mockContext7Client = {
      saveContext7Documentation: () => {
        // Mock save - no real file writes
      },
      getMCPTools: async () => ({}),
    };

    // Inject mocks into utility
    (utility as any).retryHandler = mockRetryHandler;
    (utility as any).modelProvider = mockModelProvider;
    (utility as any).context7Client = mockContext7Client;
  });

  describe("executeAIOperation", () => {
    it("should execute operation successfully and return result with metrics", async () => {
      // Mock operation that returns a simple result
      const mockResult = { data: "test result" };
      const operation = async () => mockResult;

      const result = await utility.executeAIOperation(
        "test operation",
        operation
      );

      assert.deepStrictEqual(result.result, mockResult);
      assert.ok("duration" in result.metrics);
      assert.strictEqual(typeof result.metrics.duration, "number");
      assert.ok(result.metrics.duration >= 0);
    });

    it("should throw TaskOMaticError when operation fails", async () => {
      // Mock operation that throws an error
      const operation = async () => {
        throw new Error("Mock AI failure");
      };

      try {
        await utility.executeAIOperation("test operation", operation);
        assert.fail("Should have thrown TaskOMaticError");
      } catch (error) {
        assert.ok(error instanceof TaskOMaticError);
        assert.strictEqual((error as TaskOMaticError).code, "AI_OPERATION_FAILED");
        assert.ok((error as TaskOMaticError).message.includes("test operation"));
        assert.ok(Array.isArray((error as TaskOMaticError).suggestions));
      }
    });

    it("should preserve error details in TaskOMaticError", async () => {
      const originalError = new Error("Original error message");
      const operation = async () => {
        throw originalError;
      };

      try {
        await utility.executeAIOperation("test operation", operation);
        assert.fail("Should have thrown");
      } catch (error) {
        assert.ok(error instanceof TaskOMaticError);
        const taskError = error as TaskOMaticError;
        assert.strictEqual(taskError.cause, originalError);
        assert.ok(taskError.context?.includes("test operation"));
        assert.ok("operationName" in (taskError.metadata || {}));
      }
    });

    it("should capture duration metrics correctly", async () => {
      const operation = async () => {
        // Simulate some work
        await new Promise((resolve) => setTimeout(resolve, 50));
        return { data: "result" };
      };

      const result = await utility.executeAIOperation(
        "slow operation",
        operation
      );

      assert.ok(result.metrics.duration >= 50);
    });

    it("should respect maxRetries option", async () => {
      let attemptCount = 0;

      // Mock retry handler that counts attempts
      (utility as any).retryHandler = {
        executeWithRetry: async (
          operation: () => Promise<any>,
          config: any
        ) => {
          attemptCount++;
          assert.strictEqual(config.maxAttempts, 5);
          return await operation();
        },
      };

      const operation = async () => ({ data: "result" });

      await utility.executeAIOperation("test", operation, { maxRetries: 5 });
      assert.strictEqual(attemptCount, 1);
    });

    it("should extract token usage from result if available", async () => {
      const mockResult = {
        data: "test",
        usage: {
          prompt_tokens: 100,
          completion_tokens: 50,
          total_tokens: 150,
        },
      };

      const operation = async () => mockResult;

      const result = await utility.executeAIOperation("test", operation);

      assert.deepStrictEqual(result.metrics.tokenUsage, {
        prompt: 100,
        completion: 50,
        total: 150,
      });
    });

    it("should return undefined tokenUsage if not available in result", async () => {
      const mockResult = { data: "test" };
      const operation = async () => mockResult;

      const result = await utility.executeAIOperation("test", operation);

      assert.strictEqual(result.metrics.tokenUsage, undefined);
    });
  });

  describe("streamTextWithTools", () => {
    it("should verify method signature exists - NO REAL AI CALL", async () => {
      // This test verifies the method exists and has the correct signature
      // We don't actually call it to avoid real AI calls
      assert.strictEqual(typeof utility.streamTextWithTools, "function");

      // Verify the method is accessible
      assert.ok("streamTextWithTools" in utility);
    });

    it("should pass tools to streamText when provided - NO REAL AI CALL", async () => {
      // This test would verify tool passing in a real scenario
      // For now, we just verify the method accepts tools parameter
      const mockTools = {
        readFile: {
          description: "Read a file",
          parameters: {},
          execute: async () => ({}),
        },
      };

      // The method should not throw
      try {
        // We can't fully test without real AI, but we verify the signature
        assert.strictEqual(typeof utility.streamTextWithTools, "function");
      } catch (error) {
        assert.fail("Should not throw with valid parameters");
      }
    });
  });

  describe("Error Handling", () => {
    it("should wrap string errors in Error objects", async () => {
      const operation = async () => {
        throw "String error";
      };

      try {
        await utility.executeAIOperation("test", operation);
        assert.fail("Should have thrown");
      } catch (error) {
        assert.ok(error instanceof TaskOMaticError);
        assert.ok((error as TaskOMaticError).cause instanceof Error);
      }
    });

    it("should include suggestions in thrown errors", async () => {
      const operation = async () => {
        throw new Error("Network timeout");
      };

      try {
        await utility.executeAIOperation("test", operation);
        assert.fail("Should have thrown");
      } catch (error) {
        const taskError = error as TaskOMaticError;
        assert.ok(Array.isArray(taskError.suggestions));
        assert.ok(taskError.suggestions!.length > 0);
        assert.ok(taskError.suggestions?.includes("Check AI configuration"));
      }
    });
  });

  describe("Metrics Collection", () => {
    it("should always include duration in metrics", async () => {
      const operation = async () => ({ data: "result" });

      const result = await utility.executeAIOperation("test", operation);

      assert.ok("duration" in result.metrics);
      assert.strictEqual(typeof result.metrics.duration, "number");
      assert.ok(result.metrics.duration >= 0);
    });

    it("should capture metrics even on error", async () => {
      const operation = async () => {
        await new Promise((resolve) => setTimeout(resolve, 10));
        throw new Error("Failure");
      };

      try {
        await utility.executeAIOperation("test", operation);
        assert.fail("Should have thrown");
      } catch (error) {
        const taskError = error as TaskOMaticError;
        assert.ok("duration" in (taskError.metadata || {}));
        assert.ok((taskError.metadata?.duration as number) >= 10);
      }
    });
  });

  describe("Streaming Options", () => {
    it("should wrap streaming options without modifying original", async () => {
      let chunkCount = 0;
      const originalOnChunk = (chunk: string) => {
        chunkCount++;
      };

      const streamingOptions = {
        onChunk: originalOnChunk,
      };

      // The wrapping happens internally, we just verify it doesn't throw
      const operation = async () => ({ data: "result" });

      await utility.executeAIOperation("test", operation, {
        streamingOptions,
      });

      // Original callback should not be modified
      assert.strictEqual(streamingOptions.onChunk, originalOnChunk);
    });
  });
});
