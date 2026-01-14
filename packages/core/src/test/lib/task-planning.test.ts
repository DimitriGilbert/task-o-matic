import assert from "assert";
import { describe, it, mock } from "node:test";
import { executePlanningPhase } from "../../lib/task-planning";
import { Task } from "../../types";
import { ExecutorFactory } from "../../lib/executors/executor-factory";

describe("Task Planning Logic", () => {
  it("should include task content in the planning prompt", async () => {
    const task: Task = {
      id: "1",
      title: "Test Task",
      status: "todo",
      createdAt: Date.now(),
      updatedAt: Date.now(),
      description: "Short description",
      content: "Detailed content requirements that imply complexity.",
    };

    const mockExecutor = {
      name: "mock-executor",
      execute: mock.fn(async (_message: string) => {}),
      supportsSessionResumption: () => false,
    };

    // Mock factory
    const originalCreate = ExecutorFactory.create;
    ExecutorFactory.create = () => mockExecutor as any;

    try {
      await executePlanningPhase(
        task,
        "opencode",
        {
          planModel: "mock-model",
          dry: false,
        },
        async () => ({ stdout: "", stderr: "" })
      );

      const calls = mockExecutor.execute.mock.calls;
      assert.strictEqual(calls.length > 0, true, "Executor should be called");

      const args = calls[0].arguments;
      const prompt = args[0] as string;

      assert.ok(
        prompt.includes("Detailed content requirements that imply complexity."),
        "Prompt should include detailed content"
      );
      assert.ok(
        prompt.includes("Short description"),
        "Prompt should include description"
      );
    } finally {
      ExecutorFactory.create = originalCreate;
    }
  });

  it("should include documentation in the planning prompt", async () => {
    const task: Task = {
      id: "2",
      title: "Doc Task",
      status: "todo",
      createdAt: Date.now(),
      updatedAt: Date.now(),
      description: "Doc description",
      documentation: {
        lastFetched: Date.now(),
        libraries: [],
        recap: "Documentation recap content",
        files: ["doc/file.md"],
      },
    };

    const mockExecutor = {
      name: "mock-executor",
      execute: mock.fn(async (_message: string) => {}),
      supportsSessionResumption: () => false,
    };

    // Mock factory
    const originalCreate = ExecutorFactory.create;
    ExecutorFactory.create = () => mockExecutor as any;

    try {
      await executePlanningPhase(
        task,
        "opencode",
        {
          planModel: "mock-model",
          dry: false,
        },
        async () => ({ stdout: "", stderr: "" })
      );

      const calls = mockExecutor.execute.mock.calls;
      assert.strictEqual(calls.length > 0, true, "Executor should be called");

      const args = calls[0].arguments;
      const prompt = args[0] as string;

      assert.ok(
        prompt.includes("Documentation recap content"),
        "Prompt should include doc recap"
      );
      assert.ok(
        prompt.includes("- doc/file.md"),
        "Prompt should include doc files"
      );
    } finally {
      ExecutorFactory.create = originalCreate;
    }
  });
});
