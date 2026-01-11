import assert from "assert";
import {
  hasNewCommitsSince,
  captureGitState,
  autoCommit,
  commitFile,
  isClean,
  getCurrentBranch,
  createBenchmarkBranch,
  checkoutBranch,
  cleanupBenchmarkBranch,
  GitState,
  CommitInfo
} from "../../lib/git-utils";

describe("Git Utilities", () => {
  describe("hasNewCommitsSince", () => {
    it("should return true when HEAD has changed", async () => {
      const mockExec = async (cmd: string) => {
        if (cmd === "git rev-parse HEAD") {
          return { stdout: "new-hash", stderr: "" };
        }
        return { stdout: "", stderr: "" };
      };
      const result = await hasNewCommitsSince("old-hash", mockExec);
      assert.strictEqual(result, true);
    });

    it("should return false when HEAD is unchanged", async () => {
      const mockExec = async (cmd: string) => {
        if (cmd === "git rev-parse HEAD") {
          return { stdout: "old-hash", stderr: "" };
        }
        return { stdout: "", stderr: "" };
      };
      const result = await hasNewCommitsSince("old-hash", mockExec);
      assert.strictEqual(result, false);
    });

    it("should return false when command fails", async () => {
      const mockExec = async () => {
        throw new Error("git error");
      };
      const result = await hasNewCommitsSince("old-hash", mockExec);
      assert.strictEqual(result, false);
    });

    it("should return false when beforeHead is empty", async () => {
        const result = await hasNewCommitsSince("", async () => ({ stdout: "", stderr: "" }));
        assert.strictEqual(result, false);
    });
  });

  describe("captureGitState", () => {
    it("should return git state with no uncommitted changes", async () => {
      const mockExec = async (cmd: string) => {
        if (cmd === "git rev-parse HEAD") return { stdout: "current-hash", stderr: "" };
        if (cmd === "git status --porcelain") return { stdout: "", stderr: "" };
        return { stdout: "", stderr: "" };
      };

      const state = await captureGitState(mockExec);
      assert.strictEqual(state.beforeHead, "current-hash");
      assert.strictEqual(state.afterHead, "current-hash");
      assert.strictEqual(state.hasUncommittedChanges, false);
    });

    it("should return git state with uncommitted changes", async () => {
      const mockExec = async (cmd: string) => {
        if (cmd === "git rev-parse HEAD") return { stdout: "current-hash", stderr: "" };
        if (cmd === "git status --porcelain") return { stdout: "M file.ts", stderr: "" };
        return { stdout: "", stderr: "" };
      };

      const state = await captureGitState(mockExec);
      assert.strictEqual(state.hasUncommittedChanges, true);
    });

    it("should return empty object on failure", async () => {
      const mockExec = async () => {
        throw new Error("fail");
      };
      const state = await captureGitState(mockExec);
      assert.deepStrictEqual(state, {});
    });
  });

  describe("autoCommit", () => {
    it("should stage specific files and commit", async () => {
      const commands: string[] = [];
      const mockExec = async (cmd: string) => {
        commands.push(cmd);
        return { stdout: "", stderr: "" };
      };

      const commitInfo: CommitInfo = {
        message: "feat: test",
        files: ["file1.ts", "file2.ts"]
      };

      await autoCommit(commitInfo, mockExec);
      
      assert.ok(commands.includes("git add file1.ts file2.ts"));
      assert.ok(commands.includes('git commit -m "feat: test"'));
    });

    it("should stage all files if no specific files provided", async () => {
      const commands: string[] = [];
      const mockExec = async (cmd: string) => {
        commands.push(cmd);
        return { stdout: "", stderr: "" };
      };

      const commitInfo: CommitInfo = {
        message: "feat: test",
        files: []
      };

      await autoCommit(commitInfo, mockExec);
      
      assert.ok(commands.includes("git add ."));
      assert.ok(commands.includes('git commit -m "feat: test"'));
    });

    it("should handle errors gracefully", async () => {
      const mockExec = async () => {
        throw new Error("fail");
      };
      // Should not throw
      await autoCommit({ message: "test", files: [] }, mockExec);
    });
  });

  describe("commitFile", () => {
    it("should stage and commit a single file", async () => {
      const commands: string[] = [];
      const mockExec = async (cmd: string) => {
        commands.push(cmd);
        return { stdout: "", stderr: "" };
      };

      await commitFile("file.ts", "update file", mockExec);

      assert.ok(commands.includes("git add file.ts"));
      assert.ok(commands.includes('git commit -m "update file"'));
    });
  });

  describe("Branch Management", () => {
    it("isClean should return true for empty status", async () => {
        const mockExec = async () => ({ stdout: "", stderr: "" });
        const result = await isClean(mockExec);
        assert.strictEqual(result, true);
    });

    it("isClean should return false for dirty status", async () => {
        const mockExec = async () => ({ stdout: "M file.ts", stderr: "" });
        const result = await isClean(mockExec);
        assert.strictEqual(result, false);
    });

    it("getCurrentBranch should return branch name", async () => {
        const mockExec = async () => ({ stdout: "main", stderr: "" });
        const result = await getCurrentBranch(mockExec);
        assert.strictEqual(result, "main");
    });

    it("createBenchmarkBranch should create branch", async () => {
        const commands: string[] = [];
        const mockExec = async (cmd: string) => {
            commands.push(cmd);
            return { stdout: "", stderr: "" };
        };
        await createBenchmarkBranch("bench-1", "main", mockExec);
        assert.ok(commands.includes("git checkout -b bench-1 main"));
    });

    it("checkoutBranch should checkout branch", async () => {
        const commands: string[] = [];
        const mockExec = async (cmd: string) => {
            commands.push(cmd);
            return { stdout: "", stderr: "" };
        };
        await checkoutBranch("main", mockExec);
        assert.ok(commands.includes("git checkout main"));
    });

    it("cleanupBenchmarkBranch should delete branch", async () => {
        const commands: string[] = [];
        const mockExec = async (cmd: string) => {
            commands.push(cmd);
            return { stdout: "", stderr: "" };
        };
        await cleanupBenchmarkBranch("bench-1", mockExec);
        assert.ok(commands.includes("git branch -D bench-1"));
    });
  });
});
