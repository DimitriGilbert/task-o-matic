/**
 * BenchmarkStore Tests
 *
 * Tests for benchmark run storage and retrieval
 */

import assert from "node:assert";
import * as fs from "node:fs/promises";
import * as os from "node:os";
import * as path from "node:path";

import { BenchmarkStore } from "../../lib/benchmark/store";
import type {
  BenchmarkRun,
  BenchmarkModelResult,
  BenchmarkMetrics,
  ModelScore,
} from "../../lib/benchmark/types";
import type { Worktree } from "../../lib/benchmark/worktree-manager";

/**
 * Create a mock worktree
 */
function createMockWorktree(runId: string, modelId: string): Worktree {
  return {
    name: `${runId}-${modelId.replace(/:/g, "-")}`,
    path: `/tmp/worktrees/${runId}-${modelId.replace(/:/g, "-")}`,
    branch: `bench/${runId}/${modelId.replace(/:/g, "-")}`,
    runId,
    modelId,
    createdAt: Date.now(),
  };
}

/**
 * Create mock metrics
 */
function createMockMetrics(): BenchmarkMetrics {
  return {
    timing: {
      startedAt: Date.now() - 5000,
      completedAt: Date.now(),
      duration: 5000,
    },
    tokens: {
      prompt: 1000,
      completion: 500,
      total: 1500,
    },
    code: {
      linesAdded: 50,
      linesRemoved: 10,
      filesChanged: 3,
      newFiles: ["src/new-file.ts"],
      modifiedFiles: ["src/existing.ts", "package.json"],
    },
  };
}

/**
 * Create a mock model result
 */
function createMockResult(
  runId: string,
  modelId: string
): BenchmarkModelResult {
  return {
    modelId,
    worktree: createMockWorktree(runId, modelId),
    status: "success",
    duration: 5000,
    output: { someData: "test output" },
    metrics: createMockMetrics(),
    timestamp: Date.now(),
  };
}

/**
 * Create a mock benchmark run
 */
function createMockRun(runId: string, models: string[]): BenchmarkRun {
  return {
    id: runId,
    type: "execution",
    input: {
      taskId: "task-1",
      verificationCommands: ["bun test"],
    },
    config: {
      models: models.map((m) => {
        const [provider, model] = m.split(":");
        return { provider, model };
      }),
      concurrency: 0,
      keepWorktrees: true,
    },
    baseCommit: "abc123",
    results: models.map((m) => createMockResult(runId, m)),
    scores: [],
    createdAt: Date.now(),
    status: "completed",
    completedAt: Date.now(),
  };
}

describe("BenchmarkStore", () => {
  let tempDir: string;
  let store: BenchmarkStore;

  beforeEach(async () => {
    // Create a unique temp directory for each test
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "benchmark-store-test-"));
    store = new BenchmarkStore(tempDir);
  });

  afterEach(async () => {
    // Cleanup temp directory
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  describe("save and get", () => {
    it("should save and retrieve a benchmark run", async () => {
      const run = createMockRun("run-123", ["openai:gpt-4o"]);

      await store.save(run);
      const retrieved = await store.get("run-123");

      assert.ok(retrieved, "Run should be retrieved");
      assert.strictEqual(retrieved.id, run.id);
      assert.strictEqual(retrieved.type, run.type);
      assert.strictEqual(retrieved.status, run.status);
      assert.strictEqual(retrieved.baseCommit, run.baseCommit);
      assert.strictEqual(retrieved.results.length, 1);
      assert.strictEqual(retrieved.results[0].modelId, "openai:gpt-4o");
    });

    it("should save multiple results", async () => {
      const run = createMockRun("run-456", [
        "openai:gpt-4o",
        "anthropic:claude-sonnet-4",
      ]);

      await store.save(run);
      const retrieved = await store.get("run-456");

      assert.ok(retrieved);
      assert.strictEqual(retrieved.results.length, 2);
      assert.ok(retrieved.results.some((r) => r.modelId === "openai:gpt-4o"));
      assert.ok(
        retrieved.results.some((r) => r.modelId === "anthropic:claude-sonnet-4")
      );
    });

    it("should return null for non-existent run", async () => {
      const retrieved = await store.get("non-existent");
      assert.strictEqual(retrieved, null);
    });

    it("should update an existing run", async () => {
      const run = createMockRun("run-789", ["openai:gpt-4o"]);
      await store.save(run);

      // Update run
      run.status = "completed";
      run.completedAt = Date.now();
      await store.save(run);

      const retrieved = await store.get("run-789");
      assert.ok(retrieved);
      assert.strictEqual(retrieved.status, "completed");
      assert.ok(retrieved.completedAt);
    });
  });

  describe("list", () => {
    it("should list all runs", async () => {
      await store.save(createMockRun("run-1", ["openai:gpt-4o"]));
      await store.save(createMockRun("run-2", ["anthropic:claude-sonnet-4"]));
      await store.save(createMockRun("run-3", ["google:gemini-2"]));

      const runs = await store.list();

      assert.strictEqual(runs.length, 3);
    });

    it("should filter by type", async () => {
      const executionRun = createMockRun("run-exec", ["openai:gpt-4o"]);
      executionRun.type = "execution";

      const operationRun = createMockRun("run-op", ["anthropic:claude-sonnet-4"]);
      operationRun.type = "operation";

      await store.save(executionRun);
      await store.save(operationRun);

      const executions = await store.list({ type: "execution" });
      assert.strictEqual(executions.length, 1);
      assert.strictEqual(executions[0].id, "run-exec");

      const operations = await store.list({ type: "operation" });
      assert.strictEqual(operations.length, 1);
      assert.strictEqual(operations[0].id, "run-op");
    });

    it("should filter by status", async () => {
      const completedRun = createMockRun("run-complete", ["openai:gpt-4o"]);
      completedRun.status = "completed";

      const failedRun = createMockRun("run-failed", ["anthropic:claude-sonnet-4"]);
      failedRun.status = "failed";

      await store.save(completedRun);
      await store.save(failedRun);

      const completed = await store.list({ status: "completed" });
      assert.strictEqual(completed.length, 1);
      assert.strictEqual(completed[0].id, "run-complete");
    });

    it("should apply limit and offset", async () => {
      await store.save(createMockRun("run-1", ["openai:gpt-4o"]));
      await store.save(createMockRun("run-2", ["anthropic:claude-sonnet-4"]));
      await store.save(createMockRun("run-3", ["google:gemini-2"]));

      const page1 = await store.list({ limit: 2 });
      assert.strictEqual(page1.length, 2);

      const page2 = await store.list({ limit: 2, offset: 2 });
      assert.strictEqual(page2.length, 1);
    });

    it("should return empty array when no runs", async () => {
      const runs = await store.list();
      assert.strictEqual(runs.length, 0);
    });
  });

  describe("listSummaries", () => {
    it("should return summaries without loading full data", async () => {
      await store.save(createMockRun("run-1", ["openai:gpt-4o", "anthropic:claude-sonnet-4"]));

      const summaries = await store.listSummaries();

      assert.strictEqual(summaries.length, 1);
      assert.strictEqual(summaries[0].id, "run-1");
      assert.strictEqual(summaries[0].modelCount, 2);
    });
  });

  describe("addScore", () => {
    it("should add a score to a run", async () => {
      await store.save(createMockRun("run-score", ["openai:gpt-4o"]));

      const score: ModelScore = {
        modelId: "openai:gpt-4o",
        score: 4,
        notes: "Good implementation",
        scoredAt: Date.now(),
      };

      await store.addScore("run-score", score);

      const retrieved = await store.get("run-score");
      assert.ok(retrieved);
      assert.strictEqual(retrieved.scores.length, 1);
      assert.strictEqual(retrieved.scores[0].score, 4);
      assert.strictEqual(retrieved.scores[0].notes, "Good implementation");
    });

    it("should update existing score for same model", async () => {
      await store.save(createMockRun("run-update-score", ["openai:gpt-4o"]));

      await store.addScore("run-update-score", {
        modelId: "openai:gpt-4o",
        score: 3,
        scoredAt: Date.now(),
      });

      await store.addScore("run-update-score", {
        modelId: "openai:gpt-4o",
        score: 5,
        notes: "Updated score",
        scoredAt: Date.now(),
      });

      const retrieved = await store.get("run-update-score");
      assert.ok(retrieved);
      assert.strictEqual(retrieved.scores.length, 1);
      assert.strictEqual(retrieved.scores[0].score, 5);
    });

    it("should throw for non-existent run", async () => {
      await assert.rejects(
        () =>
          store.addScore("non-existent", {
            modelId: "openai:gpt-4o",
            score: 3,
            scoredAt: Date.now(),
          }),
        /not found/
      );
    });
  });

  describe("delete", () => {
    it("should delete a run", async () => {
      await store.save(createMockRun("run-delete", ["openai:gpt-4o"]));

      await store.delete("run-delete");

      const retrieved = await store.get("run-delete");
      assert.strictEqual(retrieved, null);
    });

    it("should not throw when deleting non-existent run", async () => {
      await store.delete("non-existent");
      // Should not throw
    });
  });

  describe("exists", () => {
    it("should return true for existing run", async () => {
      await store.save(createMockRun("run-exists", ["openai:gpt-4o"]));

      const exists = await store.exists("run-exists");
      assert.strictEqual(exists, true);
    });

    it("should return false for non-existent run", async () => {
      const exists = await store.exists("non-existent");
      assert.strictEqual(exists, false);
    });
  });

  describe("count", () => {
    it("should count all runs", async () => {
      await store.save(createMockRun("run-1", ["openai:gpt-4o"]));
      await store.save(createMockRun("run-2", ["anthropic:claude-sonnet-4"]));

      const count = await store.count();
      assert.strictEqual(count, 2);
    });

    it("should count with filters", async () => {
      const completed = createMockRun("run-1", ["openai:gpt-4o"]);
      completed.status = "completed";

      const failed = createMockRun("run-2", ["anthropic:claude-sonnet-4"]);
      failed.status = "failed";

      await store.save(completed);
      await store.save(failed);

      const completedCount = await store.count({ status: "completed" });
      assert.strictEqual(completedCount, 1);
    });
  });

  describe("updateStatus", () => {
    it("should update run status", async () => {
      const run = createMockRun("run-status", ["openai:gpt-4o"]);
      run.status = "running";
      await store.save(run);

      await store.updateStatus("run-status", "completed", Date.now());

      const retrieved = await store.get("run-status");
      assert.ok(retrieved);
      assert.strictEqual(retrieved.status, "completed");
      assert.ok(retrieved.completedAt);
    });
  });

  describe("addResult", () => {
    it("should add a result to existing run", async () => {
      const run = createMockRun("run-add-result", ["openai:gpt-4o"]);
      await store.save(run);

      const newResult = createMockResult("run-add-result", "anthropic:claude-sonnet-4");
      await store.addResult("run-add-result", newResult);

      const retrieved = await store.get("run-add-result");
      assert.ok(retrieved);
      assert.strictEqual(retrieved.results.length, 2);
      assert.ok(
        retrieved.results.some((r) => r.modelId === "anthropic:claude-sonnet-4")
      );
    });
  });
});
