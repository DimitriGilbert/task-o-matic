import { exec } from "child_process";
import * as assert from "assert";

describe("CLI Commands", () => {
  it("should show help for the main command", (done) => {
    exec("bun src/cli/bin.ts --help", (error, stdout, stderr) => {
      assert.strictEqual(error, null);
      assert.ok(stdout.includes("Usage: task-o-matic"));
      done();
    });
  });

  it("should show help for the config command", (done) => {
    exec("bun src/cli/bin.ts config --help", (error, stdout, stderr) => {
      assert.strictEqual(error, null);
      assert.ok(stdout.includes("Usage: task-o-matic config"));
      done();
    });
  });

  it("should help for the tasks command", (done) => {
    exec("bun src/cli/bin.ts tasks --help", (error, stdout, stderr) => {
      assert.strictEqual(error, null);
      assert.ok(stdout.includes("Usage: task-o-matic tasks"));
      done();
    });
  });

  it("should show help for the prd command", (done) => {
    exec("bun src/cli/bin.ts prd --help", (error, stdout, stderr) => {
      assert.strictEqual(error, null);
      assert.ok(stdout.includes("Usage: task-o-matic prd"));
      done();
    });
  });

  it("should show help for the init command", (done) => {
    exec("bun src/cli/bin.ts init --help", (error, stdout, stderr) => {
      assert.strictEqual(error, null);
      assert.ok(
        stdout.includes("Usage: task-o-matic init [options] [command]")
      );
      done();
    });
  });
});
