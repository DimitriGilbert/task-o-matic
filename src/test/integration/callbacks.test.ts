import { FileSystemStorage } from "../../lib/storage/file-system";
import { StorageCallbacks } from "../../lib/storage/storage-callbacks";
import * as assert from "assert";

describe("Callback Integration", () => {
  it("should use custom storage callbacks", async () => {
    const memoryStore = new Map<string, string>();

    const callbacks: StorageCallbacks = {
      read: async (key) => memoryStore.get(key) || null,
      write: async (key, value) => {
        memoryStore.set(key, value);
      },
      delete: async (key) => {
        memoryStore.delete(key);
      },
      list: async (prefix) =>
        Array.from(memoryStore.keys()).filter((k) =>
          k.startsWith(prefix || "")
        ),
      exists: async (key) => memoryStore.has(key),
    };

    const storage = new FileSystemStorage(callbacks);

    // Create task
    const task = await storage.createTask({ title: "Test Task" });

    // Verify it was written to memory store
    assert.strictEqual(memoryStore.has("tasks.json"), true);
    const data = JSON.parse(memoryStore.get("tasks.json")!);
    assert.strictEqual(data.tasks.length, 1);
    assert.strictEqual(data.tasks[0].title, "Test Task");

    // Verify retrieval
    const retrieved = await storage.getTask(task.id);
    assert.strictEqual(retrieved?.id, task.id);
  });
});
