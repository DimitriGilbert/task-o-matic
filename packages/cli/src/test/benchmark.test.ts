import assert from "assert";
import { benchmarkCommand } from "../commands/benchmark";
import { Command } from "commander";

describe("Benchmark CLI Commands", () => {
  let program: Command;

  beforeEach(() => {
    program = new Command();
    program.addCommand(benchmarkCommand);
  });

  it("should have correct alias", () => {
    const cmd = program.commands.find((c) => c.name() === "bench");
    assert.strictEqual(cmd?.alias(), "benchmark");
  });

  it("should have all required subcommands", () => {
    const cmd = program.commands.find((c) => c.name() === "bench");
    assert.ok(cmd, "bench command not found");

    const subcommands = cmd.commands.map((c) => c.name());
    assert.ok(subcommands.includes("run"), "run command missing");
    assert.ok(subcommands.includes("list"), "list command missing");
    assert.ok(subcommands.includes("show"), "show command missing");
    assert.ok(subcommands.includes("worktrees"), "worktrees command missing");
    assert.ok(subcommands.includes("score"), "score command missing");
    assert.ok(subcommands.includes("compare"), "compare command missing");
  });

  describe("run command", () => {
    it("should require models option", () => {
      const cmd = benchmarkCommand.commands.find((c) => c.name() === "run");
      const modelsOption = cmd?.options.find((o) => o.short === "-m");
      assert.ok(modelsOption?.required, "models option should be required");
    });

    it("should require type argument", () => {
      const cmd = benchmarkCommand.commands.find((c) => c.name() === "run");
      const typeArg = cmd?.registeredArguments.find((a) => a.name() === "type");
      assert.ok(typeArg?.required, "type argument should be required");
    });
  });

  describe("score command", () => {
    it("should require run-id argument", () => {
      const cmd = benchmarkCommand.commands.find((c) => c.name() === "score");
      const runIdArg = cmd?.registeredArguments.find((a) => a.name() === "run-id");
      assert.ok(runIdArg?.required, "run-id argument should be required");
    });

    it("should require model and score options", () => {
      const cmd = benchmarkCommand.commands.find((c) => c.name() === "score");
      const modelOption = cmd?.options.find((o) => o.short === "-m");
      const scoreOption = cmd?.options.find((o) => o.short === "-s");
      
      assert.ok(modelOption?.required, "model option should be required");
      assert.ok(scoreOption?.required, "score option should be required");
    });
  });
});
