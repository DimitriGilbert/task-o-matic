import { exec } from "child_process";
import * as assert from "assert";

describe("CLI Commands Help", () => {
  const runHelp = (cmd: string, done: Mocha.Done) => {
    exec(`bun src/cli/bin.ts ${cmd} --help`, (error, stdout, stderr) => {
      assert.strictEqual(error, null, `Error executing ${cmd} --help: ${stderr}`);
      assert.ok(stdout.includes("Usage:"), `Help output for ${cmd} missing "Usage:"`);
      done();
    });
  };

  describe("Top-level Commands", () => {
    const commands = [
      "", // Main command
      "config",
      "tasks",
      "prd",
      "init",
      "prompt",
      "workflow",
      "benchmark",
      "install"
    ];

    commands.forEach(cmd => {
      it(`should show help for ${cmd || "main"} command`, (done) => {
        runHelp(cmd, done);
      });
    });
  });

  describe("Config Subcommands", () => {
    const subcommands = [
      "get-ai-config",
      "set-ai-provider",
      "info"
    ];

    subcommands.forEach(sub => {
      it(`should show help for config ${sub}`, (done) => {
        runHelp(`config ${sub}`, done);
      });
    });
  });

  describe("Benchmark Subcommands", () => {
    const subcommands = [
      "run",
      "list",
      "operations",
      "show",
      "compare",
      "execution",
      "execute-loop",
      "workflow"
    ];

    subcommands.forEach(sub => {
      it(`should show help for benchmark ${sub}`, (done) => {
        runHelp(`benchmark ${sub}`, done);
      });
    });
  });

  describe("Tasks Subcommands", () => {
    const subcommands = [
      "list",
      "create",
      "show",
      "update",
      "delete",
      "status",
      "add-tags",
      "remove-tags",
      "plan",
      "get-plan",
      "list-plan",
      "delete-plan",
      "set-plan",
      "enhance",
      "split",
      "document",
      "get-documentation",
      "add-documentation",
      "execute",
      "execute-loop",
      "subtasks",
      "tree",
      "next"
    ];

    subcommands.forEach(sub => {
      it(`should show help for tasks ${sub}`, (done) => {
        runHelp(`tasks ${sub}`, done);
      });
    });
  });
});
