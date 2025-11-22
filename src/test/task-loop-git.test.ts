import assert from "assert";
import { extractCommitInfo } from "../lib/task-loop-execution";

describe("Task Loop Git Integration", () => {
  const mockTaskTitle = "Test Task";
  const mockExecutionMessage = "Executed task";

  it("should extract commit info from existing commit", async () => {
    const gitState = {
      beforeHead: "abc",
      afterHead: "def",
      hasUncommittedChanges: false,
    };

    const mockExec = async (cmd: string) => {
      if (cmd.includes("git show")) {
        return {
          stdout: "feat: test commit\n\nBody\n src/file.ts | 10 +",
          stderr: "",
        };
      }
      return { stdout: "", stderr: "" };
    };

    const result = await extractCommitInfo(
      "1",
      mockTaskTitle,
      mockExecutionMessage,
      gitState,
      mockExec
    );

    assert.strictEqual(result.message, "feat: test commit");
    assert.deepStrictEqual(result.files, ["src/file.ts"]);
  });

  it("should generate commit info from uncommitted changes", async () => {
    const gitState = {
      beforeHead: "abc",
      afterHead: "abc",
      hasUncommittedChanges: true,
    };

    const mockExec = async (cmd: string) => {
      if (cmd.includes("git diff")) {
        return { stdout: "diff content", stderr: "" };
      }
      if (cmd.includes("git status")) {
        return { stdout: " M src/changed.ts", stderr: "" };
      }
      return { stdout: "", stderr: "" };
    };

    const mockAiOps = {
      streamText: async () => JSON.stringify({ message: "fix: auto commit" }),
    };

    const result = await extractCommitInfo(
      "1",
      mockTaskTitle,
      mockExecutionMessage,
      gitState,
      mockExec,
      mockAiOps
    );

    assert.strictEqual(result.message, "fix: auto commit");
    assert.deepStrictEqual(result.files, ["src/changed.ts"]);
  });

  it("should return default info when no changes", async () => {
    const gitState = {
      beforeHead: "abc",
      afterHead: "abc",
      hasUncommittedChanges: false,
    };

    const result = await extractCommitInfo(
      "1",
      mockTaskTitle,
      mockExecutionMessage,
      gitState
    );

    assert.strictEqual(result.message, `feat: complete task ${mockTaskTitle}`);
    assert.deepStrictEqual(result.files, []);
  });

  it("should handle git command failures gracefully", async () => {
    const gitState = {
      beforeHead: "abc",
      afterHead: "def",
      hasUncommittedChanges: false,
    };

    const mockExec = async () => {
      throw new Error("Git failed");
    };

    const result = await extractCommitInfo(
      "1",
      mockTaskTitle,
      mockExecutionMessage,
      gitState,
      mockExec
    );

    assert.strictEqual(result.message, `feat: complete task ${mockTaskTitle}`);
    assert.deepStrictEqual(result.files, []);
  });

  it("should handle invalid AI JSON response", async () => {
    const gitState = {
      beforeHead: "abc",
      afterHead: "abc",
      hasUncommittedChanges: true,
    };

    const mockExec = async (cmd: string) => {
      if (cmd.includes("git diff")) return { stdout: "diff", stderr: "" };
      if (cmd.includes("git status"))
        return { stdout: " M file.ts", stderr: "" };
      return { stdout: "", stderr: "" };
    };

    const mockAiOps = {
      streamText: async () => "Not JSON",
    };

    const result = await extractCommitInfo(
      "1",
      mockTaskTitle,
      mockExecutionMessage,
      gitState,
      mockExec,
      mockAiOps
    );

    assert.strictEqual(result.message, `feat: complete task ${mockTaskTitle}`);
    assert.deepStrictEqual(result.files, ["file.ts"]);
  });
});
