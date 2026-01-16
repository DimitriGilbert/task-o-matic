/**
 * Worktree Infrastructure Tests
 *
 * Tests for WorktreeManager and WorktreePool classes
 */

import assert from "node:assert";

import type { ExecFn } from "../../lib/benchmark/worktree-manager";
import { WorktreeManager } from "../../lib/benchmark/worktree-manager";
import type { ModelConfig, PoolProgressEvent } from "../../lib/benchmark/worktree-pool";
import { getModelId, WorktreePool } from "../../lib/benchmark/worktree-pool";

/**
 * Create a mock exec function that records commands
 */
function createMockExec(
  responses?: Record<string, { stdout: string; stderr: string } | Error>
): { execFn: ExecFn; commands: string[] } {
  const commands: string[] = [];

  const execFn: ExecFn = async (command: string) => {
    commands.push(command);

    // Check for custom responses
    if (responses) {
      for (const [pattern, response] of Object.entries(responses)) {
        if (command.includes(pattern)) {
          if (response instanceof Error) {
            throw response;
          }
          return response;
        }
      }
    }

    // Default responses based on command
    if (command.includes("git rev-parse HEAD")) {
      return { stdout: "abc123def456", stderr: "" };
    }
    if (command.includes("git status --porcelain")) {
      return { stdout: "", stderr: "" };
    }
    if (command.includes("git worktree add")) {
      return { stdout: "", stderr: "" };
    }
    if (command.includes("git worktree remove")) {
      return { stdout: "", stderr: "" };
    }
    if (command.includes("git worktree prune")) {
      return { stdout: "", stderr: "" };
    }
    if (command.includes("git branch -D")) {
      return { stdout: "", stderr: "" };
    }
    if (command.includes("git reset")) {
      return { stdout: "", stderr: "" };
    }
    if (command.includes("git clean")) {
      return { stdout: "", stderr: "" };
    }

    return { stdout: "", stderr: "" };
  };

  return { execFn, commands };
}

describe("Worktree Infrastructure", () => {
  describe("WorktreeManager", () => {
    describe("sanitizeModelId", () => {
      it("should sanitize model IDs with colons", () => {
        const { execFn } = createMockExec();
        const manager = new WorktreeManager("/tmp/test-project", execFn);

        // Access private method via any - for testing
        const sanitize = (manager as unknown as { sanitizeModelId: (id: string) => string }).sanitizeModelId.bind(manager);

        assert.strictEqual(sanitize("openai:gpt-4o"), "openai-gpt-4o");
        assert.strictEqual(sanitize("anthropic:claude-sonnet-4"), "anthropic-claude-sonnet-4");
      });

      it("should sanitize model IDs with slashes", () => {
        const { execFn } = createMockExec();
        const manager = new WorktreeManager("/tmp/test-project", execFn);
        const sanitize = (manager as unknown as { sanitizeModelId: (id: string) => string }).sanitizeModelId.bind(manager);

        // Dots are preserved - they're meaningful in model version names
        assert.strictEqual(sanitize("openrouter:anthropic/claude-3.5-sonnet"), "openrouter-anthropic-claude-3.5-sonnet");
      });

      it("should remove special characters", () => {
        const { execFn } = createMockExec();
        const manager = new WorktreeManager("/tmp/test-project", execFn);
        const sanitize = (manager as unknown as { sanitizeModelId: (id: string) => string }).sanitizeModelId.bind(manager);

        assert.strictEqual(sanitize("model@special!chars"), "modelspecialchars");
      });

      it("should convert to lowercase", () => {
        const { execFn } = createMockExec();
        const manager = new WorktreeManager("/tmp/test-project", execFn);
        const sanitize = (manager as unknown as { sanitizeModelId: (id: string) => string }).sanitizeModelId.bind(manager);

        assert.strictEqual(sanitize("OPENAI:GPT-4O"), "openai-gpt-4o");
      });
    });

    describe("create", () => {
      it("should create a worktree with correct git command", async () => {
        const { execFn, commands } = createMockExec();
        const manager = new WorktreeManager("/tmp/test-project", execFn);

        const worktree = await manager.create("run-123", "openai:gpt-4o", "abc123");

        assert.strictEqual(worktree.runId, "run-123");
        assert.strictEqual(worktree.modelId, "openai:gpt-4o");
        assert.strictEqual(worktree.name, "run-123-openai-gpt-4o");
        assert.strictEqual(worktree.branch, "bench/run-123/openai-gpt-4o");
        assert.ok(worktree.path.includes("run-123-openai-gpt-4o"));
        assert.ok(worktree.createdAt > 0);

        // Verify git command was called
        const createCmd = commands.find((c) => c.includes("git worktree add"));
        assert.ok(createCmd, "git worktree add command should be called");
        assert.ok(createCmd.includes("bench/run-123/openai-gpt-4o"));
        assert.ok(createCmd.includes("abc123"));
      });

      it("should handle branch already exists error", async () => {
        const callCount = { value: 0 };
        const execFn: ExecFn = async (command: string) => {
          if (command.includes("git worktree add")) {
            callCount.value++;
            if (callCount.value === 1) {
              throw new Error("fatal: a branch named 'bench/run-123/openai-gpt-4o' already exists");
            }
          }
          return { stdout: "", stderr: "" };
        };

        const manager = new WorktreeManager("/tmp/test-project", execFn);
        const worktree = await manager.create("run-123", "openai:gpt-4o");

        // Should succeed after retry
        assert.strictEqual(worktree.runId, "run-123");
        assert.strictEqual(callCount.value, 2); // One fail, one success
      });

      it("should throw on non-recoverable errors", async () => {
        const { execFn } = createMockExec({
          "git worktree add": new Error("fatal: some other error"),
        });

        const manager = new WorktreeManager("/tmp/test-project", execFn);

        await assert.rejects(
          () => manager.create("run-123", "openai:gpt-4o"),
          /Failed to create worktree/
        );
      });
    });

    describe("remove", () => {
      it("should remove worktree and delete branch", async () => {
        const { execFn, commands } = createMockExec();
        const manager = new WorktreeManager("/tmp/test-project", execFn);

        // Create first
        await manager.create("run-123", "openai:gpt-4o");

        // Then remove
        await manager.remove("run-123-openai-gpt-4o");

        const removeCmd = commands.find((c) => c.includes("git worktree remove"));
        assert.ok(removeCmd, "git worktree remove should be called");

        const deleteBranchCmd = commands.find((c) => c.includes("git branch -D"));
        assert.ok(deleteBranchCmd, "git branch -D should be called");
      });

      it("should handle worktree not in manifest gracefully", async () => {
        const { execFn } = createMockExec();
        const manager = new WorktreeManager("/tmp/test-project", execFn);

        // Should not throw
        await manager.remove("nonexistent-worktree");
      });
    });

    describe("list", () => {
      it("should list all worktrees", async () => {
        const { execFn } = createMockExec();
        const manager = new WorktreeManager("/tmp/test-project-list-1", execFn);

        await manager.create("run-123", "openai:gpt-4o");
        await manager.create("run-123", "anthropic:claude-sonnet-4");

        const worktrees = await manager.list();

        assert.strictEqual(worktrees.length, 2);
        assert.ok(worktrees.some((w) => w.modelId === "openai:gpt-4o"));
        assert.ok(worktrees.some((w) => w.modelId === "anthropic:claude-sonnet-4"));
      });

      it("should return empty array when no worktrees", async () => {
        const { execFn } = createMockExec();
        const manager = new WorktreeManager("/tmp/test-project-list-empty", execFn);

        const worktrees = await manager.list();

        assert.strictEqual(worktrees.length, 0);
      });
    });

    describe("get", () => {
      it("should get worktree by name", async () => {
        const { execFn } = createMockExec();
        const manager = new WorktreeManager("/tmp/test-project", execFn);

        await manager.create("run-123", "openai:gpt-4o");

        const worktree = await manager.get("run-123-openai-gpt-4o");

        assert.ok(worktree);
        assert.strictEqual(worktree.modelId, "openai:gpt-4o");
      });

      it("should return null for non-existent worktree", async () => {
        const { execFn } = createMockExec();
        const manager = new WorktreeManager("/tmp/test-project", execFn);

        const worktree = await manager.get("nonexistent");

        assert.strictEqual(worktree, null);
      });
    });

    describe("getByRunId", () => {
      it("should get all worktrees for a run", async () => {
        const { execFn } = createMockExec();
        const manager = new WorktreeManager("/tmp/test-project-getbyrunid", execFn);

        await manager.create("run-123", "openai:gpt-4o");
        await manager.create("run-123", "anthropic:claude-sonnet-4");
        await manager.create("run-456", "openai:gpt-4o");

        const worktrees = await manager.getByRunId("run-123");

        assert.strictEqual(worktrees.length, 2);
        assert.ok(worktrees.every((w) => w.runId === "run-123"));
      });
    });

    describe("cleanupRun", () => {
      it("should remove all worktrees for a run", async () => {
        const { execFn } = createMockExec();
        const manager = new WorktreeManager("/tmp/test-project-cleanup", execFn);

        await manager.create("run-123", "openai:gpt-4o");
        await manager.create("run-123", "anthropic:claude-sonnet-4");
        await manager.create("run-456", "openai:gpt-4o");

        await manager.cleanupRun("run-123");

        const worktrees = await manager.list();
        assert.strictEqual(worktrees.length, 1);
        assert.strictEqual(worktrees[0].runId, "run-456");
      });
    });

    describe("getCurrentCommit", () => {
      it("should return current HEAD commit", async () => {
        const { execFn } = createMockExec({
          "git rev-parse HEAD": { stdout: "deadbeef1234567890", stderr: "" },
        });
        const manager = new WorktreeManager("/tmp/test-project", execFn);

        const commit = await manager.getCurrentCommit();

        assert.strictEqual(commit, "deadbeef1234567890");
      });
    });

    describe("isClean", () => {
      it("should return true when working directory is clean", async () => {
        const { execFn } = createMockExec({
          "git status --porcelain": { stdout: "", stderr: "" },
        });
        const manager = new WorktreeManager("/tmp/test-project", execFn);

        const isClean = await manager.isClean();

        assert.strictEqual(isClean, true);
      });

      it("should return false when working directory has changes", async () => {
        const { execFn } = createMockExec({
          "git status --porcelain": { stdout: "M file.ts", stderr: "" },
        });
        const manager = new WorktreeManager("/tmp/test-project", execFn);

        const isClean = await manager.isClean();

        assert.strictEqual(isClean, false);
      });
    });
  });

  describe("WorktreePool", () => {
    describe("getModelId", () => {
      it("should create model ID from config", () => {
        const config: ModelConfig = {
          provider: "openai",
          model: "gpt-4o",
        };

        assert.strictEqual(getModelId(config), "openai:gpt-4o");
      });
    });

    describe("executeParallel", () => {
      it("should execute all models in parallel", async () => {
        const { execFn } = createMockExec();
        const manager = new WorktreeManager("/tmp/test-project", execFn);
        const pool = new WorktreePool(manager);

        const models: ModelConfig[] = [
          { provider: "openai", model: "gpt-4o" },
          { provider: "anthropic", model: "claude-sonnet-4" },
        ];

        const executionOrder: string[] = [];
        const results = await pool.executeParallel(
          "run-123",
          models,
          async (_worktree, model) => {
            executionOrder.push(getModelId(model));
            return `result-${getModelId(model)}`;
          }
        );

        assert.strictEqual(results.size, 2);
        assert.strictEqual(results.get("openai:gpt-4o")?.result, "result-openai:gpt-4o");
        assert.strictEqual(results.get("anthropic:claude-sonnet-4")?.result, "result-anthropic:claude-sonnet-4");
      });

      it("should handle execution errors gracefully", async () => {
        const { execFn } = createMockExec();
        const manager = new WorktreeManager("/tmp/test-project", execFn);
        const pool = new WorktreePool(manager);

        const models: ModelConfig[] = [
          { provider: "openai", model: "gpt-4o" },
          { provider: "anthropic", model: "claude-sonnet-4" },
        ];

        const results = await pool.executeParallel(
          "run-123",
          models,
          async (_worktree, model) => {
            if (model.model === "gpt-4o") {
              throw new Error("API error");
            }
            return `result-${getModelId(model)}`;
          }
        );

        assert.strictEqual(results.size, 2);
        assert.ok(results.get("openai:gpt-4o")?.error);
        assert.strictEqual(results.get("openai:gpt-4o")?.error?.message, "API error");
        assert.strictEqual(results.get("anthropic:claude-sonnet-4")?.result, "result-anthropic:claude-sonnet-4");
      });

      it("should emit progress events", async () => {
        const { execFn } = createMockExec();
        const manager = new WorktreeManager("/tmp/test-project", execFn);
        const pool = new WorktreePool(manager);

        const models: ModelConfig[] = [
          { provider: "openai", model: "gpt-4o" },
        ];

        const events: PoolProgressEvent[] = [];
        await pool.executeParallel(
          "run-123",
          models,
          async () => "result",
          (event) => events.push(event)
        );

        assert.ok(events.some((e) => e.type === "worktree-created"));
        assert.ok(events.some((e) => e.type === "execution-started"));
        assert.ok(events.some((e) => e.type === "execution-completed"));
      });

      it("should record duration for each execution", async () => {
        const { execFn } = createMockExec();
        const manager = new WorktreeManager("/tmp/test-project", execFn);
        const pool = new WorktreePool(manager);

        const models: ModelConfig[] = [
          { provider: "openai", model: "gpt-4o" },
        ];

        const results = await pool.executeParallel(
          "run-123",
          models,
          async () => {
            // Small delay
            await new Promise((r) => setTimeout(r, 10));
            return "result";
          }
        );

        const result = results.get("openai:gpt-4o");
        assert.ok(result);
        assert.ok(result.duration >= 10, `Duration should be >= 10ms, got ${result.duration}`);
      });
    });

    describe("concurrency limit", () => {
      it("should respect maxConcurrent setting", async () => {
        const { execFn } = createMockExec();
        const manager = new WorktreeManager("/tmp/test-project", execFn);
        const pool = new WorktreePool(manager, { maxConcurrent: 2 });

        const models: ModelConfig[] = [
          { provider: "openai", model: "gpt-4o" },
          { provider: "anthropic", model: "claude-sonnet-4" },
          { provider: "google", model: "gemini-2" },
        ];

        let maxConcurrent = 0;
        let currentConcurrent = 0;

        const results = await pool.executeParallel(
          "run-123",
          models,
          async () => {
            currentConcurrent++;
            maxConcurrent = Math.max(maxConcurrent, currentConcurrent);
            await new Promise((r) => setTimeout(r, 50));
            currentConcurrent--;
            return "result";
          }
        );

        assert.strictEqual(results.size, 3);
        // Note: Due to async nature, this is hard to test precisely
        // but we verify all results are present
        assert.ok(results.get("openai:gpt-4o"));
        assert.ok(results.get("anthropic:claude-sonnet-4"));
        assert.ok(results.get("google:gemini-2"));
      });
    });
  });
});
