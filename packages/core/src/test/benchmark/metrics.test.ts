/**
 * MetricsCollector Tests
 *
 * Tests for code metrics collection and verification
 */

import assert from "assert";

import type { ExecFn } from "../../lib/benchmark/metrics-collector";
import { MetricsCollector } from "../../lib/benchmark/metrics-collector";

/**
 * Create a mock exec function that returns predefined outputs
 */
function createMockExec(
  responses?: Record<string, { stdout: string; stderr: string } | Error>
): ExecFn {
  return async (command: string) => {
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
    return { stdout: "", stderr: "" };
  };
}

describe("MetricsCollector", () => {
  describe("collectCodeMetrics", () => {
    it("should parse git diff numstat output", async () => {
      const mockExec = createMockExec({
        "git diff --stat": { stdout: "", stderr: "" },
        "git diff --name-only --diff-filter=A": {
          stdout: "src/new-file.ts\n",
          stderr: "",
        },
        "git diff --name-only --diff-filter=M": {
          stdout: "src/existing.ts\npackage.json\n",
          stderr: "",
        },
        "git diff --name-only": {
          stdout: "src/new-file.ts\nsrc/existing.ts\npackage.json\n",
          stderr: "",
        },
        "git diff --numstat": {
          stdout: "50\t10\tsrc/existing.ts\n25\t5\tpackage.json\n100\t0\tsrc/new-file.ts\n",
          stderr: "",
        },
      });

      const collector = new MetricsCollector(mockExec);
      const metrics = await collector.collectCodeMetrics("/tmp/worktree", "abc123");

      assert.strictEqual(metrics.linesAdded, 175); // 50 + 25 + 100
      assert.strictEqual(metrics.linesRemoved, 15); // 10 + 5 + 0
      assert.strictEqual(metrics.filesChanged, 3);
      assert.deepStrictEqual(metrics.newFiles, ["src/new-file.ts"]);
      assert.deepStrictEqual(metrics.modifiedFiles, [
        "src/existing.ts",
        "package.json",
      ]);
    });

    it("should handle empty diffs", async () => {
      const mockExec = createMockExec({
        "git diff --stat": { stdout: "", stderr: "" },
        "git diff --name-only": { stdout: "", stderr: "" },
        "git diff --numstat": { stdout: "", stderr: "" },
      });

      const collector = new MetricsCollector(mockExec);
      const metrics = await collector.collectCodeMetrics("/tmp/worktree", "abc123");

      assert.strictEqual(metrics.linesAdded, 0);
      assert.strictEqual(metrics.linesRemoved, 0);
      assert.strictEqual(metrics.filesChanged, 0);
      assert.deepStrictEqual(metrics.newFiles, []);
      assert.deepStrictEqual(metrics.modifiedFiles, []);
    });

    it("should handle git errors gracefully", async () => {
      const mockExec = createMockExec({
        "git diff": new Error("Not a git repository"),
      });

      const collector = new MetricsCollector(mockExec);
      const metrics = await collector.collectCodeMetrics("/tmp/worktree", "abc123");

      // Should return empty metrics on error, not throw
      assert.strictEqual(metrics.linesAdded, 0);
      assert.strictEqual(metrics.filesChanged, 0);
    });
  });

  describe("runVerification", () => {
    it("should run verification commands and collect results", async () => {
      const mockExec = createMockExec({
        "bun test": {
          stdout: "5 passing\n0 failing",
          stderr: "",
        },
        "bun run build": {
          stdout: "Build successful",
          stderr: "",
        },
      });

      const collector = new MetricsCollector(mockExec);
      const metrics = await collector.runVerification(
        ["bun test", "bun run build"],
        { cwd: "/tmp/worktree" }
      );

      assert.strictEqual(metrics.testsPassed, 5);
      assert.strictEqual(metrics.testsFailed, 0);
      assert.strictEqual(metrics.testsRun, 5);
      assert.strictEqual(metrics.buildSuccess, true);
      assert.strictEqual(metrics.commandResults?.length, 2);
    });

    it("should handle failed commands", async () => {
      const error = new Error("Test failed") as Error & { code: number; stdout: string; stderr: string };
      error.code = 1;
      error.stdout = "2 passing\n1 failing";
      error.stderr = "";

      const mockExec = createMockExec({
        "bun test": error,
      });

      const collector = new MetricsCollector(mockExec);
      const metrics = await collector.runVerification(["bun test"], {
        cwd: "/tmp/worktree",
      });

      assert.strictEqual(metrics.testsPassed, 2);
      assert.strictEqual(metrics.testsFailed, 1);
      assert.strictEqual(metrics.commandResults?.[0].exitCode, 1);
    });

    it("should handle build failures", async () => {
      const error = new Error("Build failed") as Error & { code: number };
      error.code = 1;

      const mockExec = createMockExec({
        "bun run build": error,
      });

      const collector = new MetricsCollector(mockExec);
      const metrics = await collector.runVerification(["bun run build"], {
        cwd: "/tmp/worktree",
      });

      assert.strictEqual(metrics.buildSuccess, false);
    });

    it("should continue on error by default", async () => {
      const error = new Error("First command failed") as Error & { code: number };
      error.code = 1;

      let callCount = 0;
      const mockExec: ExecFn = async (command: string) => {
        callCount++;
        if (command.includes("first")) {
          throw error;
        }
        return { stdout: "Success", stderr: "" };
      };

      const collector = new MetricsCollector(mockExec);
      await collector.runVerification(["first command", "second command"], {
        cwd: "/tmp/worktree",
      });

      // Both commands should have been called
      assert.strictEqual(callCount, 2);
    });

    it("should stop on error when configured", async () => {
      const error = new Error("First command failed") as Error & { code: number };
      error.code = 1;

      let callCount = 0;
      const mockExec: ExecFn = async (command: string) => {
        callCount++;
        if (command.includes("first")) {
          throw error;
        }
        return { stdout: "Success", stderr: "" };
      };

      const collector = new MetricsCollector(mockExec);
      await collector.runVerification(["first command", "second command"], {
        cwd: "/tmp/worktree",
        continueOnError: false,
      });

      // Only first command should have been called
      assert.strictEqual(callCount, 1);
    });
  });

  describe("parseTestOutput", () => {
    // Access private method for testing via prototype
    let collector: MetricsCollector;

    beforeEach(() => {
      collector = new MetricsCollector(createMockExec());
    });

    it("should parse Mocha output format", () => {
      const output = "  15 passing (3s)\n  2 failing";
      const result = (collector as unknown as { parseTestOutput: (output: string) => { total: number; passed: number; failed: number } }).parseTestOutput(output);

      assert.strictEqual(result.passed, 15);
      assert.strictEqual(result.failed, 2);
      assert.strictEqual(result.total, 17);
    });

    it("should parse Jest output format", () => {
      const output = "Tests: 10 passed, 2 failed, 12 total";
      const result = (collector as unknown as { parseTestOutput: (output: string) => { total: number; passed: number; failed: number } }).parseTestOutput(output);

      assert.strictEqual(result.passed, 10);
      assert.strictEqual(result.failed, 2);
      assert.strictEqual(result.total, 12);
    });

    it("should parse Vitest output format", () => {
      const output = "8 tests passed | 1 test failed";
      const result = (collector as unknown as { parseTestOutput: (output: string) => { total: number; passed: number; failed: number } }).parseTestOutput(output);

      assert.strictEqual(result.passed, 8);
      assert.strictEqual(result.failed, 1);
      assert.strictEqual(result.total, 9);
    });
  });

  describe("collectAll", () => {
    it("should collect all metrics together", async () => {
      const mockExec = createMockExec({
        "git diff --stat": { stdout: "", stderr: "" },
        "git diff --name-only": { stdout: "file.ts\n", stderr: "" },
        "git diff --numstat": { stdout: "10\t5\tfile.ts\n", stderr: "" },
        "bun test": { stdout: "3 passing", stderr: "" },
      });

      const collector = new MetricsCollector(mockExec);
      const now = Date.now();
      const metrics = await collector.collectAll(
        "/tmp/worktree",
        "abc123",
        {
          startedAt: now - 5000,
          completedAt: now,
          duration: 5000,
        },
        {
          prompt: 1000,
          completion: 500,
          total: 1500,
        },
        ["bun test"]
      );

      assert.ok(metrics.timing);
      assert.strictEqual(metrics.timing.duration, 5000);
      assert.ok(metrics.tokens);
      assert.strictEqual(metrics.tokens.total, 1500);
      assert.ok(metrics.code);
      assert.strictEqual(metrics.code.linesAdded, 10);
      assert.ok(metrics.verification);
      assert.strictEqual(metrics.verification.testsPassed, 3);
      assert.ok(typeof metrics.cost === "number");
    });
  });

  describe("createTimingMetrics", () => {
    it("should create timing metrics from timestamps", () => {
      const startedAt = 1000;
      const completedAt = 6000;

      const timing = MetricsCollector.createTimingMetrics(startedAt, completedAt, 100);

      assert.strictEqual(timing.startedAt, 1000);
      assert.strictEqual(timing.completedAt, 6000);
      assert.strictEqual(timing.duration, 5000);
      assert.strictEqual(timing.timeToFirstOutput, 100);
    });
  });

  describe("estimateCost", () => {
    it("should estimate cost based on token usage", async () => {
      const mockExec = createMockExec({
        "git diff": { stdout: "", stderr: "" },
      });

      const collector = new MetricsCollector(mockExec);
      const metrics = await collector.collectAll(
        "/tmp/worktree",
        "abc123",
        {
          startedAt: Date.now() - 1000,
          completedAt: Date.now(),
          duration: 1000,
        },
        {
          prompt: 1_000_000, // 1M prompt tokens
          completion: 100_000, // 100K completion tokens
          total: 1_100_000,
        }
      );

      // Should have some cost estimate
      assert.ok(metrics.cost);
      assert.ok(metrics.cost > 0);
      // Rough check: $3 per 1M prompt + $15 per 1M completion
      // = $3 + $1.5 = $4.5
      assert.ok(metrics.cost > 4 && metrics.cost < 5);
    });
  });
});
