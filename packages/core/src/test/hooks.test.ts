import assert from "node:assert";
import { hooks } from "../lib/hooks";
import { Task } from "../types";

describe("HookRegistry", () => {
  beforeEach(() => {
    hooks.clear();
  });

  it("should register and call a listener", async () => {
    let called = false;
    const task = { id: "1", title: "Test Task" } as Task;

    hooks.on("task:created", (payload) => {
      assert.strictEqual(payload.task, task);
      called = true;
    });

    await hooks.emit("task:created", { task });
    assert.strictEqual(called, true);
  });

  it("should handle multiple listeners", async () => {
    let count = 0;
    const task = { id: "1", title: "Test Task" } as Task;

    hooks.on("task:created", () => {
      count++;
    });
    hooks.on("task:created", () => {
      count++;
    });

    await hooks.emit("task:created", { task });
    assert.strictEqual(count, 2);
  });

  it("should remove a listener", async () => {
    let count = 0;
    const handler = () => {
      count++;
    };
    const task = { id: "1", title: "Test Task" } as Task;

    hooks.on("task:created", handler);
    hooks.off("task:created", handler);

    await hooks.emit("task:created", { task });
    assert.strictEqual(count, 0);
  });

  it("should not fail if a listener throws", async () => {
    const task = { id: "1", title: "Test Task" } as Task;

    // Suppress console.error for this test
    const originalConsoleError = console.error;
    console.error = () => {};

    try {
      hooks.on("task:created", () => {
        throw new Error("Oops");
      });

      let secondCalled = false;
      hooks.on("task:created", () => {
        secondCalled = true;
      });

      // Should not throw
      await hooks.emit("task:created", { task });
      assert.strictEqual(secondCalled, true);
    } finally {
      // Restore console.error
      console.error = originalConsoleError;
    }
  });
});
