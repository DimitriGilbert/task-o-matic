import * as assert from "assert";
import {
  TaskOMaticError,
  TaskOMaticErrorCodes,
  createStandardError,
  formatStandardError,
  isTaskOMaticError,
  formatTaskNotFoundError,
  formatInvalidStatusTransitionError,
  formatStorageError,
  formatAIOperationError,
  wrapErrorForBackwardCompatibility,
} from "../../utils/task-o-matic-error";

describe("TaskOMaticError", () => {
  describe("TaskOMaticError class", () => {
    it("should create a TaskOMaticError with all properties", () => {
      const error = new TaskOMaticError("Test error", {
        code: TaskOMaticErrorCodes.UNEXPECTED_ERROR,
        context: "Test context",
        suggestions: ["Suggestion 1", "Suggestion 2"],
        metadata: { key: "value" },
      });

      assert.strictEqual(error.name, "TaskOMaticError");
      assert.strictEqual(error.message, "Test error");
      assert.strictEqual(error.code, TaskOMaticErrorCodes.UNEXPECTED_ERROR);
      assert.strictEqual(error.context, "Test context");
      assert.deepStrictEqual(error.suggestions, [
        "Suggestion 1",
        "Suggestion 2",
      ]);
      assert.deepStrictEqual(error.metadata, { key: "value" });
      assert.ok(error.timestamp);
      assert.ok(error.stack);
    });

    it("should create a TaskOMaticError with minimal properties", () => {
      const error = new TaskOMaticError("Minimal error", {
        code: TaskOMaticErrorCodes.UNEXPECTED_ERROR,
      });

      assert.strictEqual(error.name, "TaskOMaticError");
      assert.strictEqual(error.message, "Minimal error");
      assert.strictEqual(error.code, TaskOMaticErrorCodes.UNEXPECTED_ERROR);
      assert.ok(error.timestamp);
    });

    it("should include cause error", () => {
      const cause = new Error("Original error");
      const error = new TaskOMaticError("Wrapped error", {
        code: TaskOMaticErrorCodes.UNEXPECTED_ERROR,
        cause,
      });

      assert.strictEqual(error.cause, cause);
    });
  });

  describe("getDetails()", () => {
    it("should return formatted error details", () => {
      const error = new TaskOMaticError("Test error", {
        code: TaskOMaticErrorCodes.UNEXPECTED_ERROR,
        context: "Test context",
        suggestions: ["Suggestion 1"],
        metadata: { key: "value" },
      });

      const details = error.getDetails();
      assert.ok(details.includes("[TASK_O_MATIC_001]"));
      assert.ok(details.includes("Test error"));
      assert.ok(details.includes("Context: Test context"));
      assert.ok(details.includes("Suggestions:"));
      assert.ok(details.includes("Suggestion 1"));
      assert.ok(details.includes("Metadata:"));
    });
  });

  describe("toJSON()", () => {
    it("should return structured error data", () => {
      const error = new TaskOMaticError("Test error", {
        code: TaskOMaticErrorCodes.UNEXPECTED_ERROR,
        context: "Test context",
        suggestions: ["Suggestion 1"],
        metadata: { key: "value" },
      });

      const json = error.toJSON();
      assert.strictEqual(json.name, "TaskOMaticError");
      assert.strictEqual(json.code, TaskOMaticErrorCodes.UNEXPECTED_ERROR);
      assert.strictEqual(json.message, "Test error");
      assert.strictEqual(json.context, "Test context");
      assert.deepStrictEqual(json.suggestions, ["Suggestion 1"]);
      assert.deepStrictEqual(json.metadata, { key: "value" });
      assert.ok(json.timestamp);
      assert.ok(json.stack);
    });
  });

  describe("createStandardError()", () => {
    it("should create a standardized error", () => {
      const error = createStandardError(
        TaskOMaticErrorCodes.TASK_NOT_FOUND,
        "Task not found",
        {
          context: "Task search failed",
          suggestions: ["Check task ID", "List all tasks"],
        }
      );

      assert.ok(isTaskOMaticError(error));
      assert.strictEqual(error.code, TaskOMaticErrorCodes.TASK_NOT_FOUND);
      assert.strictEqual(error.message, "Task not found");
      assert.strictEqual(error.context, "Task search failed");
      assert.deepStrictEqual(error.suggestions, [
        "Check task ID",
        "List all tasks",
      ]);
    });
  });

  describe("formatStandardError()", () => {
    it("should format an error with context and suggestions", () => {
      const originalError = new Error("Original error");
      const error = formatStandardError(
        originalError,
        TaskOMaticErrorCodes.STORAGE_ERROR,
        {
          context: "Storage operation failed",
          suggestions: ["Check permissions", "Retry operation"],
        }
      );

      assert.ok(isTaskOMaticError(error));
      assert.strictEqual(error.code, TaskOMaticErrorCodes.STORAGE_ERROR);
      assert.strictEqual(error.message, "Original error");
      assert.strictEqual(error.context, "Storage operation failed");
      assert.deepStrictEqual(error.suggestions, [
        "Check permissions",
        "Retry operation",
      ]);
      assert.strictEqual(error.cause, originalError);
    });
  });

  describe("isTaskOMaticError()", () => {
    it("should return true for TaskOMaticError instances", () => {
      const error = new TaskOMaticError("Test", {
        code: TaskOMaticErrorCodes.UNEXPECTED_ERROR,
      });
      assert.strictEqual(isTaskOMaticError(error), true);
    });

    it("should return false for regular Errors", () => {
      const error = new Error("Regular error");
      assert.strictEqual(isTaskOMaticError(error), false);
    });

    it("should return false for other values", () => {
      assert.strictEqual(isTaskOMaticError("string error"), false);
      assert.strictEqual(isTaskOMaticError(null), false);
      assert.strictEqual(isTaskOMaticError(undefined), false);
    });
  });

  describe("Standard error formatters", () => {
    it("should format task not found error", () => {
      const error = formatTaskNotFoundError("task-123");
      assert.ok(isTaskOMaticError(error));
      assert.strictEqual(error.code, TaskOMaticErrorCodes.TASK_NOT_FOUND);
      assert.ok(error.message.includes("task-123"));
      assert.ok(error.context);
      assert.ok(error.suggestions);
    });

    it("should format invalid status transition error", () => {
      const error = formatInvalidStatusTransitionError("todo", "invalid");
      assert.ok(isTaskOMaticError(error));
      assert.strictEqual(error.code, TaskOMaticErrorCodes.INVALID_TASK_STATUS);
      assert.ok(error.message.includes("todo"));
      assert.ok(error.message.includes("invalid"));
      assert.ok(error.context);
      assert.ok(error.suggestions);
    });

    it("should format storage error", () => {
      const cause = new Error("Storage failed");
      const error = formatStorageError("save", cause);
      assert.ok(isTaskOMaticError(error));
      assert.strictEqual(error.code, TaskOMaticErrorCodes.STORAGE_ERROR);
      assert.ok(error.message.includes("save"));
      assert.strictEqual(error.cause, cause);
    });

    it("should format AI operation error", () => {
      const cause = new Error("AI failed");
      const error = formatAIOperationError("generate", cause);
      assert.ok(isTaskOMaticError(error));
      assert.strictEqual(error.code, TaskOMaticErrorCodes.AI_OPERATION_FAILED);
      assert.ok(error.message.includes("generate"));
      assert.strictEqual(error.cause, cause);
    });
  });

  describe("wrapErrorForBackwardCompatibility()", () => {
    it("should return TaskOMaticError unchanged", () => {
      const error = new TaskOMaticError("Test", {
        code: TaskOMaticErrorCodes.UNEXPECTED_ERROR,
      });
      const wrapped = wrapErrorForBackwardCompatibility(error);
      assert.strictEqual(wrapped, error);
    });

    it("should return regular Error unchanged", () => {
      const error = new Error("Regular error");
      const wrapped = wrapErrorForBackwardCompatibility(error);
      assert.strictEqual(wrapped, error);
    });

    it("should convert non-Error values to Error", () => {
      const wrapped1 = wrapErrorForBackwardCompatibility("string error");
      assert.ok(wrapped1 instanceof Error);
      assert.ok(wrapped1.message.includes("string error"));

      const wrapped2 = wrapErrorForBackwardCompatibility({
        message: "object error",
      });
      assert.ok(wrapped2 instanceof Error);
      assert.ok(wrapped2.message.includes("object error"));
    });
  });

  describe("Error codes", () => {
    it("should have defined error codes", () => {
      assert.ok(TaskOMaticErrorCodes.UNEXPECTED_ERROR);
      assert.ok(TaskOMaticErrorCodes.TASK_NOT_FOUND);
      assert.ok(TaskOMaticErrorCodes.STORAGE_ERROR);
      assert.ok(TaskOMaticErrorCodes.AI_OPERATION_FAILED);
    });
  });
});
