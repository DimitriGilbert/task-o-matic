import { exec } from "child_process";
import * as assert from "assert";

describe("CLI Commands", () => {
  it("should show help for the main command", (done) => {
    exec("npx tsx src/cli/bin.ts --help", (error, stdout, stderr) => {
      assert.strictEqual(error, null);
      assert.ok(stdout.includes("Usage: task-o-matic [options] [command]"));
      done();
    });
  });

  it("should show help for the config command", (done) => {
    exec("npx tsx src/cli/bin.ts config --help", (error, stdout, stderr) => {
      assert.strictEqual(error, null);
      assert.ok(
        stdout.includes("Usage: task-o-matic config [options] [command]")
      );
      done();
    });
  });

  it("should show help for the tasks command", (done) => {
    exec("npx tsx src/cli/bin.ts tasks --help", (error, stdout, stderr) => {
      assert.strictEqual(error, null);
      assert.ok(
        stdout.includes("Usage: task-o-matic tasks [options] [command]")
      );
      done();
    });
  });

  it("should show help for the prd command", (done) => {
    exec("npx tsx src/cli/bin.ts prd --help", (error, stdout, stderr) => {
      assert.strictEqual(error, null);
      assert.ok(stdout.includes("Usage: task-o-matic prd [options] [command]"));
      done();
    });
  });

  it("should show help for the init command", (done) => {
    exec("npx tsx src/cli/bin.ts init --help", (error, stdout, stderr) => {
      assert.strictEqual(error, null);
      assert.ok(
        stdout.includes("Usage: task-o-matic init [options] [command]")
      );
      done();
    });
  });
});
