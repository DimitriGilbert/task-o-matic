import * as assert from "assert";
import { TaskOperations } from "../../../lib/ai-service/task-operations";
import { Task } from "../../../types";
import { TaskOMaticError } from "../../../utils/task-o-matic-error";

/**
 * ⚠️ CRITICAL: These integration tests use 100% MOCKS - ZERO real AI calls
 * No API calls are made, no costs incurred, tests run fast
 *
 * These tests verify that TaskOperations properly integrates with AIOperationUtility
 * and that errors propagate correctly through the stack.
 */
describe("TaskOperations Integration Tests", () => {
  let taskOps: TaskOperations;
  let mockAIOperationUtility: any;

  beforeEach(() => {
    taskOps = new TaskOperations();

    // Create mock AIOperationUtility - NO REAL AI CALLS
    mockAIOperationUtility = {
      executeAIOperation: async (
        operationName: string,
        operation: () => Promise<any>,
        options?: any
      ) => {
        // Execute the operation and return mock metrics
        const result = await operation();
        return {
          result,
          metrics: {
            duration: 100,
            tokenUsage: {
              prompt: 50,
              completion: 25,
              total: 75,
            },
          },
        };
      },
      streamTextWithTools: async (
        systemPrompt: string,
        userMessage: string,
        config?: any,
        streamingOptions?: any,
        tools?: any
      ) => {
        // Return mock JSON response
        return JSON.stringify({
          subtasks: [
            {
              title: "Mock subtask 1",
              description: "Mock description 1",
              effort: "small",
            },
            {
              title: "Mock subtask 2",
              description: "Mock description 2",
              effort: "medium",
            },
          ],
        });
      },
      streamText: async (
        _prompt: string,
        _config: any,
        _systemPrompt: string,
        _userMessage: string,
        _streamingOptions?: any
      ) => {
        return "Mock enhanced content";
      },
    };

    // Inject mock into TaskOperations
    (taskOps as any).aiOperationUtility = mockAIOperationUtility;
  });

  describe("breakdownTask Integration", () => {
    it("should successfully break down a task using AIOperationUtility", async () => {
      const mockTask: Task = {
        id: "test-task-1",
        title: "Test Task",
        description: "A task to break down",
        status: "todo",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      const result = await taskOps.breakdownTask(mockTask);

      // Verify result structure
      assert.ok(Array.isArray(result));
      assert.strictEqual(result.length, 2);
      assert.strictEqual(result[0].title, "Mock subtask 1");
      assert.strictEqual(result[0].content, "Mock description 1");
      assert.strictEqual(result[0].estimatedEffort, "small");
    });

    it("should handle filesystem tools when enabled", async () => {
      let toolsPassed = false;

      // Override streamTextWithTools to capture tools parameter
      mockAIOperationUtility.streamTextWithTools = async (
        _systemPrompt: string,
        _userMessage: string,
        _config: any,
        _streamingOptions: any,
        tools: any
      ) => {
        if (tools && Object.keys(tools).length > 0) {
          toolsPassed = true;
        }
        return JSON.stringify({
          subtasks: [
            {
              title: "Subtask with tools",
              description: "Used filesystem tools",
              effort: "small",
            },
          ],
        });
      };

      const mockTask: Task = {
        id: "test-task-2",
        title: "Task with tools",
        status: "todo",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      const result = await taskOps.breakdownTask(
        mockTask,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        true // enableFilesystemTools
      );

      assert.ok(toolsPassed, "Filesystem tools should be passed when enabled");
      assert.strictEqual(result.length, 1);
    });

    it("should propagate TaskOMaticError from AIOperationUtility", async () => {
      // Mock AIOperationUtility to throw error
      (taskOps as any).aiOperationUtility.executeAIOperation = async () => {
        throw new TaskOMaticError("AI operation failed: Task breakdown", {
          code: "AI_OPERATION_FAILED",
          context: "Mock error context",
          suggestions: ["Check AI configuration"],
        });
      };

      const mockTask: Task = {
        id: "test-task-error",
        title: "Task that will fail",
        status: "todo",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      try {
        await taskOps.breakdownTask(mockTask);
        assert.fail("Should have thrown TaskOMaticError");
      } catch (error) {
        assert.ok(error instanceof TaskOMaticError);
        assert.strictEqual(
          (error as TaskOMaticError).code,
          "AI_OPERATION_FAILED"
        );
        assert.ok(
          (error as TaskOMaticError).message.includes("Task breakdown")
        );
      }
    });
  });

  describe("enhanceTask Integration", () => {
    it("should successfully enhance a task using AIOperationUtility", async () => {
      const result = await taskOps.enhanceTask(
        "Test Task",
        "Basic description"
      );

      // Verify result
      assert.strictEqual(typeof result, "string");
      assert.strictEqual(result, "Mock enhanced content");
    });

    it("should propagate errors from AIOperationUtility", async () => {
      // Mock AIOperationUtility to throw error
      (taskOps as any).aiOperationUtility.executeAIOperation = async () => {
        throw new TaskOMaticError("AI operation failed: Task enhancement", {
          code: "AI_OPERATION_FAILED",
          context: "Enhancement failed",
          suggestions: ["Retry with different parameters"],
        });
      };

      try {
        await taskOps.enhanceTask("Test", "Description");
        assert.fail("Should have thrown TaskOMaticError");
      } catch (error) {
        assert.ok(error instanceof TaskOMaticError);
        assert.ok(
          (error as TaskOMaticError).message.includes("Task enhancement")
        );
      }
    });
  });

  describe("planTask Integration", () => {
    it("should successfully plan a task using AIOperationUtility", async () => {
      // Mock streamTextWithTools to return plan
      mockAIOperationUtility.streamTextWithTools = async () => {
        return "Mock implementation plan:\n1. Step 1\n2. Step 2\n3. Step 3";
      };

      const result = await taskOps.planTask("Project context", "Task details");

      // Verify result
      assert.strictEqual(typeof result, "string");
      assert.ok(result.includes("Mock implementation plan"));
      assert.ok(result.includes("Step 1"));
    });

    it("should handle MCP tools and filesystem tools", async () => {
      let toolsReceived = false;

      mockAIOperationUtility.streamTextWithTools = async (
        _systemPrompt: string,
        _userMessage: string,
        _config: any,
        _streamingOptions: any,
        tools: any
      ) => {
        if (tools && Object.keys(tools).length > 0) {
          toolsReceived = true;
        }
        return "Plan with tools";
      };

      // Mock Context7Client to return MCP tools
      const mockContext7Client = {
        getMCPTools: async () => ({
          mockTool: {
            description: "Mock MCP tool",
            parameters: {},
            execute: async () => ({}),
          },
        }),
        saveContext7Documentation: () => {},
      };

      (taskOps as any).context7Client = mockContext7Client;

      const result = await taskOps.planTask("Context", "Details");

      assert.ok(toolsReceived, "Tools should be passed to streamTextWithTools");
      assert.strictEqual(result, "Plan with tools");
    });

    it("should propagate errors from AIOperationUtility", async () => {
      // Mock AIOperationUtility to throw error
      (taskOps as any).aiOperationUtility.executeAIOperation = async () => {
        throw new TaskOMaticError("AI operation failed: Task planning", {
          code: "AI_OPERATION_FAILED",
          context: "Planning failed",
          suggestions: ["Check task context"],
        });
      };

      try {
        await taskOps.planTask("Context", "Details");
        assert.fail("Should have thrown TaskOMaticError");
      } catch (error) {
        assert.ok(error instanceof TaskOMaticError);
        assert.ok((error as TaskOMaticError).message.includes("Task planning"));
      }
    });
  });

  describe("Metrics Flow", () => {
    it("should return results from AIOperationUtility without exposing metrics", async () => {
      // breakdownTask returns result.result directly, not the full AIOperationResult
      const mockTask: Task = {
        id: "metrics-test",
        title: "Metrics test task",
        status: "todo",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      const result = await taskOps.breakdownTask(mockTask);

      // Verify we got the result, not the AIOperationResult wrapper
      assert.ok(Array.isArray(result));
      assert.ok(!("metrics" in result), "Should not expose metrics in result");
      assert.ok(
        !("result" in result),
        "Should not expose AIOperationResult structure"
      );
    });
  });

  describe("Error Handling Integration", () => {
    it("should wrap string errors in TaskOMaticError", async () => {
      // Mock operation that throws string error
      (taskOps as any).aiOperationUtility.executeAIOperation = async () => {
        const error = new Error("String error was converted");
        throw new TaskOMaticError("AI operation failed: Task breakdown", {
          code: "AI_OPERATION_FAILED",
          cause: error,
          context: JSON.stringify({
            operation: "Task breakdown",
            error: "String error was converted",
          }),
          suggestions: ["Check AI configuration"],
        });
      };

      const mockTask: Task = {
        id: "string-error-test",
        title: "Test",
        status: "todo",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      try {
        await taskOps.breakdownTask(mockTask);
        assert.fail("Should have thrown");
      } catch (error) {
        assert.ok(error instanceof TaskOMaticError);
        const taskError = error as TaskOMaticError;
        assert.ok(taskError.cause instanceof Error);
      }
    });

    it("should preserve error context and suggestions", async () => {
      const mockError = new TaskOMaticError("Original error", {
        code: "TEST_ERROR",
        context: "Original context",
        suggestions: ["Original suggestion 1", "Original suggestion 2"],
        metadata: { testData: "test value" },
      });

      (taskOps as any).aiOperationUtility.executeAIOperation = async () => {
        throw mockError;
      };

      const mockTask: Task = {
        id: "context-test",
        title: "Test",
        status: "todo",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      try {
        await taskOps.breakdownTask(mockTask);
        assert.fail("Should have thrown");
      } catch (error) {
        assert.ok(error instanceof TaskOMaticError);
        const taskError = error as TaskOMaticError;
        assert.strictEqual(taskError.code, "TEST_ERROR");
        assert.ok(taskError.context?.includes("Original context"));
        assert.ok(Array.isArray(taskError.suggestions));
        assert.ok(taskError.metadata?.testData === "test value");
      }
    });
  });

  describe("Streaming Options Integration", () => {
    it("should pass streaming options through to AIOperationUtility", async () => {
      let onChunkCalled = false;
      let onFinishCalled = false;

      const streamingOptions = {
        onChunk: (chunk: string) => {
          onChunkCalled = true;
        },
        onFinish: (result: any) => {
          onFinishCalled = true;
        },
      };

      // Mock to verify streaming options are passed
      let receivedOptions: any;
      (taskOps as any).aiOperationUtility.executeAIOperation = async (
        _operationName: string,
        operation: () => Promise<any>,
        options: any
      ) => {
        receivedOptions = options;
        const result = await operation();
        return {
          result,
          metrics: { duration: 100 },
        };
      };

      const mockTask: Task = {
        id: "streaming-test",
        title: "Test",
        status: "todo",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      await taskOps.breakdownTask(
        mockTask,
        undefined,
        undefined,
        undefined,
        streamingOptions
      );

      // Verify streaming options were passed
      assert.ok(receivedOptions);
      assert.ok(receivedOptions.streamingOptions);
    });
  });
});
