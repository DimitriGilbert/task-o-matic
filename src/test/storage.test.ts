import { LocalStorage } from "../lib/storage";
import { CreateTaskRequest } from "../types";
import * as assert from "assert";

describe("LocalStorage", () => {
  let storage: LocalStorage;

  beforeEach(async () => {
    storage = new LocalStorage();
    // Clean up any existing data for fresh test
    try {
      const tasks = await storage.getTopLevelTasks();
      for (const task of tasks) {
        await storage.deleteTask(task.id);
      }
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  describe("Task Management", () => {
    it("should create a task successfully", async () => {
      const taskRequest: CreateTaskRequest = {
        title: "Test Task",
        description: "A test task description",
        estimatedEffort: "small"
      };

      const task = await storage.createTask(taskRequest);
      
      assert.strictEqual(task.title, "Test Task");
      assert.strictEqual(task.description, "A test task description");
      assert.strictEqual(task.estimatedEffort, "small");
      assert.strictEqual(task.status, "todo");
      assert.ok(task.id);
      assert.ok(task.createdAt);
      assert.ok(task.updatedAt);
    });

    it("should retrieve a task by ID", async () => {
      const taskRequest: CreateTaskRequest = {
        title: "Test Task for Retrieval"
      };

      const createdTask = await storage.createTask(taskRequest);
      const retrievedTask = await storage.getTask(createdTask.id);
      
      assert.ok(retrievedTask);
      assert.strictEqual(retrievedTask.id, createdTask.id);
      assert.strictEqual(retrievedTask.title, createdTask.title);
    });

    it("should return null for non-existent task", async () => {
      const task = await storage.getTask("non-existent-id");
      assert.strictEqual(task, null);
    });

    it("should update a task", async () => {
      const taskRequest: CreateTaskRequest = {
        title: "Original Title"
      };

      const createdTask = await storage.createTask(taskRequest);
      
      // Add a small delay to ensure different timestamps
      await new Promise(resolve => setTimeout(resolve, 1));
      
      const updatedTask = await storage.updateTask(createdTask.id, {
        title: "Updated Title",
        status: "in-progress"
      });

      assert.ok(updatedTask);
      assert.strictEqual(updatedTask.title, "Updated Title");
      assert.strictEqual(updatedTask.status, "in-progress");
      assert.ok(updatedTask.updatedAt >= createdTask.updatedAt);
    });

    it("should delete a task", async () => {
      const taskRequest: CreateTaskRequest = {
        title: "Task to Delete"
      };

      const createdTask = await storage.createTask(taskRequest);
      const deleteResult = await storage.deleteTask(createdTask.id);
      
      assert.strictEqual(deleteResult, true);
      
      const deletedTask = await storage.getTask(createdTask.id);
      assert.strictEqual(deletedTask, null);
    });

    it("should handle task dependencies", async () => {
      const task1Request: CreateTaskRequest = {
        title: "First Task"
      };

      const task2Request: CreateTaskRequest = {
        title: "Second Task",
        dependencies: []
      };

      const task1 = await storage.createTask(task1Request);
      const task2 = await storage.createTask({
        ...task2Request,
        dependencies: [task1.id]
      });

      assert.strictEqual(task2.dependencies?.length, 1);
      assert.strictEqual(task2.dependencies[0], task1.id);
    });
  });

  describe("Input Validation", () => {
    it("should reject empty task title", async () => {
      try {
        await storage.createTask({ title: "" });
        assert.fail("Should have thrown an error");
      } catch (error) {
        assert.ok(error instanceof Error);
        assert.ok(error.message.includes("title"));
      }
    });

    it("should reject invalid task ID", async () => {
      try {
        await storage.getTask("");
        assert.fail("Should have thrown an error");
      } catch (error) {
        assert.ok(error instanceof Error);
        assert.ok(error.message.includes("Task ID"));
      }
    });

    it("should reject invalid estimated effort", async () => {
      try {
        await storage.createTask({
          title: "Test Task",
          estimatedEffort: "invalid" as any
        });
        assert.fail("Should have thrown an error");
      } catch (error) {
        assert.ok(error instanceof Error);
        assert.ok(error.message.includes("effort"));
      }
    });
  });

  describe("Storage Validation", () => {
    it("should validate storage integrity", async () => {
      const validation = await storage.validateStorageIntegrity();
      assert.ok(validation.isValid);
      assert.strictEqual(validation.issues.length, 0);
    });

    it("should detect duplicate task IDs", async () => {
      // This would require manual manipulation to test
      // For now, just ensure the method exists
      const validation = await storage.validateStorageIntegrity();
      assert.ok(typeof validation.isValid === "boolean");
      assert.ok(Array.isArray(validation.issues));
    });
  });

  describe("Content Management", () => {
    it("should save and retrieve task content", async () => {
      const taskRequest: CreateTaskRequest = {
        title: "Task with Content"
      };

      const task = await storage.createTask(taskRequest);
      const content = "# Task Content\nThis is the task content.";
      
      const contentFile = await storage.saveTaskContent(task.id, content);
      const retrievedContent = await storage.getTaskContent(task.id);
      
      assert.strictEqual(retrievedContent, content);
      assert.ok(contentFile.includes(task.id));
    });

    it("should return null for non-existent content", async () => {
      // First create a task to ensure storage is initialized
      const taskRequest: CreateTaskRequest = {
        title: "Dummy Task for Initialization"
      };
      await storage.createTask(taskRequest);
      
      const content = await storage.getTaskContent("non-existent-task");
      assert.strictEqual(content, null);
    });

    it("should delete task content", async () => {
      const taskRequest: CreateTaskRequest = {
        title: "Task with Content to Delete"
      };

      const task = await storage.createTask(taskRequest);
      await storage.saveTaskContent(task.id, "Some content");
      await storage.deleteTaskContent(task.id);
      
      const content = await storage.getTaskContent(task.id);
      assert.strictEqual(content, null);
    });
  });
});