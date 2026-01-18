import assert from "assert";
import { describe, it, mock } from "node:test";
import { executeReviewPhase, ReviewConfig } from "../../lib/task-review";
import type { Task } from "../../types";

describe("Task Review Logic", () => {
  it("should include task description and content in the review prompt", async () => {
    const task: Task = {
      id: "1",
      title: "Test Review Task",
      status: "todo",
      createdAt: Date.now(),
      updatedAt: Date.now(),
      description: "This is the task description",
      content: "Detailed task requirements and acceptance criteria",
    };

    const config: ReviewConfig = {
      reviewModel: "opencode:gpt-4o",
      taskDescription: task.description,
      taskContent: task.content,
      dry: false,
    };

    // Mock git diff to return some changes
    const mockExecFn = mock.fn(async (_cmd: string) => ({
      stdout: "+ added line\n- removed line",
      stderr: "",
    }));

    // Mock AI operations
    const originalModule = await import("../../utils/ai-service-factory");
    const originalGetAIOperations = originalModule.getAIOperations;
    (
      originalModule as { getAIOperations: typeof originalGetAIOperations }
    ).getAIOperations = () =>
      ({
        streamText: async (prompt: string) => {
          // Verify the prompt contains our context
          assert.ok(
            prompt.includes("This is the task description"),
            "Prompt should include task description",
          );
          assert.ok(
            prompt.includes("Detailed task requirements"),
            "Prompt should include task content",
          );
          return '{"approved": true, "feedback": "Test approval"}';
        },
      }) as ReturnType<typeof originalGetAIOperations>;

    try {
      const result = await executeReviewPhase(task, config, mockExecFn);
      assert.strictEqual(result.approved, true);
      assert.strictEqual(result.success, true);
    } finally {
      (
        originalModule as { getAIOperations: typeof originalGetAIOperations }
      ).getAIOperations = originalGetAIOperations;
    }
  });

  it("should include PRD content in the review prompt when provided", async () => {
    const task: Task = {
      id: "2",
      title: "PRD Review Task",
      status: "todo",
      createdAt: Date.now(),
      updatedAt: Date.now(),
      description: "Task with PRD",
    };

    const config: ReviewConfig = {
      taskDescription: task.description,
      prdContent:
        "# Product Requirements\n\nThis is the PRD content with specs.",
      dry: false,
    };

    const mockExecFn = mock.fn(async (_cmd: string) => ({
      stdout: "+ new feature code",
      stderr: "",
    }));

    const originalModule = await import("../../utils/ai-service-factory");
    const originalGetAIOperations = originalModule.getAIOperations;
    (
      originalModule as { getAIOperations: typeof originalGetAIOperations }
    ).getAIOperations = () =>
      ({
        streamText: async (prompt: string) => {
          assert.ok(
            prompt.includes("Product Requirements Document"),
            "Prompt should include PRD section header",
          );
          assert.ok(
            prompt.includes("This is the PRD content"),
            "Prompt should include PRD content",
          );
          return '{"approved": true, "feedback": "PRD validated"}';
        },
      }) as ReturnType<typeof originalGetAIOperations>;

    try {
      const result = await executeReviewPhase(task, config, mockExecFn);
      assert.strictEqual(result.approved, true);
    } finally {
      (
        originalModule as { getAIOperations: typeof originalGetAIOperations }
      ).getAIOperations = originalGetAIOperations;
    }
  });

  it("should include documentation context in the review prompt", async () => {
    const task: Task = {
      id: "3",
      title: "Docs Review Task",
      status: "todo",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const config: ReviewConfig = {
      documentation: {
        recap: "Documentation summary for the task",
        files: ["docs/api.md", "docs/guide.md"],
      },
      dry: false,
    };

    const mockExecFn = mock.fn(async (_cmd: string) => ({
      stdout: "+ docs change",
      stderr: "",
    }));

    const originalModule = await import("../../utils/ai-service-factory");
    const originalGetAIOperations = originalModule.getAIOperations;
    (
      originalModule as { getAIOperations: typeof originalGetAIOperations }
    ).getAIOperations = () =>
      ({
        streamText: async (prompt: string) => {
          assert.ok(
            prompt.includes("Documentation Context"),
            "Prompt should include documentation section",
          );
          assert.ok(
            prompt.includes("Documentation summary for the task"),
            "Prompt should include documentation recap",
          );
          assert.ok(
            prompt.includes("docs/api.md"),
            "Prompt should include referenced files",
          );
          return '{"approved": true, "feedback": "Docs validated"}';
        },
      }) as ReturnType<typeof originalGetAIOperations>;

    try {
      const result = await executeReviewPhase(task, config, mockExecFn);
      assert.strictEqual(result.approved, true);
    } finally {
      (
        originalModule as { getAIOperations: typeof originalGetAIOperations }
      ).getAIOperations = originalGetAIOperations;
    }
  });

  it("should skip review in dry run mode", async () => {
    const task: Task = {
      id: "4",
      title: "Dry Run Task",
      status: "todo",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const config: ReviewConfig = {
      dry: true,
    };

    const mockExecFn = mock.fn(async (_cmd: string) => ({
      stdout: "",
      stderr: "",
    }));

    const result = await executeReviewPhase(task, config, mockExecFn);

    assert.strictEqual(result.approved, true);
    assert.strictEqual(result.feedback, "Dry run - review skipped");
    assert.strictEqual(result.success, true);
    // Verify git diff was not called
    assert.strictEqual(mockExecFn.mock.calls.length, 0);
  });
});
