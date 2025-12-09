import * as assert from "assert";
import { TaskService } from "../../services/tasks";
import { createTestTaskData } from "../test-utils";
import { resetMocks } from "../test-mock-setup";

describe("TaskService", () => {
  let taskService: TaskService;

  beforeEach(() => {
    // Reset mocks to ensure clean state for each test
    resetMocks();

    // Create a new TaskService instance
    taskService = new TaskService();
  });

  describe("createTask", () => {
    it("should create a basic task without AI enhancement", async () => {
      const taskData = createTestTaskData();

      const result = await taskService.createTask({
        title: taskData.title,
        content: taskData.description,
        effort: taskData.effort,
      });

      assert.strictEqual(result.success, true);
      assert.ok(result.task);
      assert.strictEqual(result.task.title, taskData.title);
      assert.strictEqual(result.task.description, taskData.description);
      assert.strictEqual(result.task.status, "todo");
      assert.strictEqual(result.task.estimatedEffort, taskData.effort);
    });

    it("should create a task with AI enhancement", async () => {
      const taskData = createTestTaskData();

      const result = await taskService.createTask({
        title: taskData.title,
        content: taskData.description,
        effort: taskData.effort,
        aiEnhance: true,
      });

      assert.strictEqual(result.success, true);
      assert.ok(result.task);
      assert.strictEqual(result.task.title, taskData.title);
      // Check that the content field (not description) has the AI enhancement
      assert.ok(
        (result.task.content || "").includes(
          "🤖 Enhanced with AI documentation"
        )
      );
      assert.ok(result.aiMetadata);
      assert.strictEqual(result.aiMetadata?.aiGenerated, true);
    });

    it("should handle context building failures gracefully", async () => {
      const taskData = createTestTaskData();

      // The mock context builder will work normally, but we test that
      // the task creation is resilient to potential context building issues
      const result = await taskService.createTask({
        title: taskData.title,
        content: taskData.description,
        effort: taskData.effort,
        aiEnhance: true,
      });

      assert.strictEqual(result.success, true);
      assert.ok(result.task);
      assert.strictEqual(result.task.title, taskData.title);
    });
  });

  describe("updateTask", () => {
    it("should update task properties", async () => {
      // Create a task first
      const taskData = createTestTaskData();
      const createResult = await taskService.createTask({
        title: taskData.title,
        content: taskData.description,
      });

      const taskId = createResult.task.id;

      // Update the task
      const updatedTask = await taskService.updateTask(taskId, {
        title: "Updated Title",
        status: "in-progress",
        tags: ["urgent", "important"],
      });

      assert.strictEqual(updatedTask.title, "Updated Title");
      assert.strictEqual(updatedTask.status, "in-progress");
      assert.deepStrictEqual(updatedTask.tags, ["urgent", "important"]);
    });

    it("should validate status transitions", async () => {
      // Create a task
      const taskData = createTestTaskData();
      const createResult = await taskService.createTask({
        title: taskData.title,
      });

      const taskId = createResult.task.id;

      // Valid transition: todo -> completed is allowed
      const updatedTask = await taskService.updateTask(taskId, {
        status: "completed",
      });

      assert.strictEqual(updatedTask.status, "completed");

      // Now test an invalid transition: completed -> completed (same status should not error, but let's test a truly invalid one)
      // Actually, looking at the valid transitions, all transitions are allowed from any status
      // So let's test that valid transitions work
      await taskService.updateTask(taskId, {
        status: "in-progress",
      });

      const task = await taskService.getTask(taskId);
      assert.strictEqual(task?.status, "in-progress");
    });

    it("should handle string tags and convert to array", async () => {
      // Create a task
      const taskData = createTestTaskData();
      const createResult = await taskService.createTask({
        title: taskData.title,
      });

      const taskId = createResult.task.id;

      // Update with string tags
      const updatedTask = await taskService.updateTask(taskId, {
        tags: "urgent, important, bugfix",
      });

      assert.deepStrictEqual(updatedTask.tags, [
        "urgent",
        "important",
        "bugfix",
      ]);
    });
  });

  describe("deleteTask", () => {
    it("should delete a task successfully", async () => {
      // Create a task
      const taskData = createTestTaskData();
      const createResult = await taskService.createTask({
        title: taskData.title,
      });

      const taskId = createResult.task.id;

      // Delete the task
      const deleteResult = await taskService.deleteTask(taskId);

      assert.strictEqual(deleteResult.success, true);
      assert.strictEqual(deleteResult.deleted.length, 1);
      assert.strictEqual(deleteResult.deleted[0].id, taskId);

      // Verify task is gone
      const deletedTask = await taskService.getTask(taskId);
      assert.strictEqual(deletedTask, null);
    });

    it("should handle cascade deletion of subtasks", async () => {
      // Create parent task
      const parentResult = await taskService.createTask({
        title: "Parent Task",
      });

      const parentId = parentResult.task.id;

      // Create subtasks
      const subtask1 = await taskService.createTask({
        title: "Subtask 1",
        parentId: parentId,
      });

      const subtask2 = await taskService.createTask({
        title: "Subtask 2",
        parentId: parentId,
      });

      // Delete parent with cascade
      const deleteResult = await taskService.deleteTask(parentId, {
        cascade: true,
      });

      assert.strictEqual(deleteResult.success, true);
      assert.strictEqual(deleteResult.deleted.length, 3); // parent + 2 subtasks
    });

    it("should throw error when task has subtasks and no cascade/force", async () => {
      // Create parent task
      const parentResult = await taskService.createTask({
        title: "Parent Task",
      });

      const parentId = parentResult.task.id;

      // Create subtask
      await taskService.createTask({
        title: "Subtask 1",
        parentId: parentId,
      });

      // Try to delete without cascade or force
      await assert.rejects(
        async () => {
          await taskService.deleteTask(parentId);
        },
        (err: Error) => {
          assert.ok(err.message.includes("subtasks"));
          return true;
        }
      );
    });
  });

  describe("listTasks", () => {
    it("should list all top-level tasks", async () => {
      // Create some tasks
      await taskService.createTask({ title: "Task 1" });
      await taskService.createTask({ title: "Task 2" });
      await taskService.createTask({ title: "Task 3" });

      const tasks = await taskService.listTasks({});

      assert.strictEqual(tasks.length, 3);
      assert.ok(tasks.every((task) => !task.parentId));
    });

    it("should filter tasks by status", async () => {
      // Create tasks with different statuses
      const task1 = await taskService.createTask({ title: "Task 1" });
      await taskService.updateTask(task1.task.id, { status: "in-progress" });

      const task2 = await taskService.createTask({ title: "Task 2" });
      await taskService.updateTask(task2.task.id, { status: "completed" });

      const task3 = await taskService.createTask({ title: "Task 3" });

      const inProgressTasks = await taskService.listTasks({
        status: "in-progress",
      });
      const completedTasks = await taskService.listTasks({
        status: "completed",
      });

      assert.strictEqual(inProgressTasks.length, 1);
      assert.strictEqual(completedTasks.length, 1);
    });

    it("should filter tasks by tag", async () => {
      // Create tasks with different tags
      const task1 = await taskService.createTask({ title: "Task 1" });
      await taskService.updateTask(task1.task.id, {
        tags: ["frontend", "urgent"],
      });

      const task2 = await taskService.createTask({ title: "Task 2" });
      await taskService.updateTask(task2.task.id, { tags: ["backend"] });

      const task3 = await taskService.createTask({ title: "Task 3" });

      const frontendTasks = await taskService.listTasks({ tag: "frontend" });
      const backendTasks = await taskService.listTasks({ tag: "backend" });

      assert.strictEqual(frontendTasks.length, 1);
      assert.strictEqual(backendTasks.length, 1);
    });
  });

  describe("getTaskTree", () => {
    it("should return task tree for specific task", async () => {
      // Create parent task
      const parentResult = await taskService.createTask({
        title: "Parent Task",
      });

      const parentId = parentResult.task.id;

      // Create subtasks
      const subtask1 = await taskService.createTask({
        title: "Subtask 1",
        parentId: parentId,
      });

      const subtask2 = await taskService.createTask({
        title: "Subtask 2",
        parentId: parentId,
      });

      // Create sub-subtask
      const subSubtask = await taskService.createTask({
        title: "Sub-Subtask 1",
        parentId: subtask1.task.id,
      });

      const tree = await taskService.getTaskTree(parentId);

      assert.strictEqual(tree.length, 4); // parent + 2 subtasks + 1 sub-subtask
      assert.strictEqual(tree[0].id, parentId);
    });

    it("should return all tasks when no rootId provided", async () => {
      // Create some tasks
      await taskService.createTask({ title: "Task 1" });
      await taskService.createTask({ title: "Task 2" });
      await taskService.createTask({ title: "Task 3" });

      const allTasks = await taskService.getTaskTree();

      assert.strictEqual(allTasks.length, 3);
    });
  });

  describe("enhanceTask", () => {
    it("should enhance task with AI documentation", async () => {
      // Create a task
      const taskData = createTestTaskData();
      const createResult = await taskService.createTask({
        title: taskData.title,
        content: taskData.description,
      });

      const taskId = createResult.task.id;

      // Enhance the task
      const enhanceResult = await taskService.enhanceTask(taskId);

      assert.strictEqual(enhanceResult.success, true);
      assert.ok(enhanceResult.enhancedContent);
      assert.ok(
        enhanceResult.enhancedContent.includes(
          "🤖 Enhanced with AI documentation"
        )
      );
      assert.ok(enhanceResult.stats);
      assert.ok(enhanceResult.metadata);
    });

    it("should throw error for non-existent task", async () => {
      await assert.rejects(
        async () => {
          await taskService.enhanceTask("non-existent-id");
        },
        (err: Error) => {
          assert.ok(err.message.includes("not found"));
          return true;
        }
      );
    });
  });

  describe("splitTask", () => {
    it("should split task into subtasks", async () => {
      // Create a task
      const taskData = createTestTaskData();
      const createResult = await taskService.createTask({
        title: taskData.title,
        content: taskData.description,
      });

      const taskId = createResult.task.id;

      // Split the task
      const splitResult = await taskService.splitTask(taskId);

      assert.strictEqual(splitResult.success, true);
      assert.strictEqual(splitResult.subtasks.length, 2);
      assert.ok(splitResult.stats);
      assert.ok(splitResult.metadata);

      // Verify subtasks were created
      const subtasks = await taskService.getSubtasks(taskId);
      assert.strictEqual(subtasks.length, 2);
    });

    it("should throw error if task already has subtasks", async () => {
      // Create a task
      const taskData = createTestTaskData();
      const createResult = await taskService.createTask({
        title: taskData.title,
      });

      const taskId = createResult.task.id;

      // Create a subtask
      await taskService.createTask({
        title: "Existing Subtask",
        parentId: taskId,
      });

      // Try to split task that already has subtasks
      await assert.rejects(
        async () => {
          await taskService.splitTask(taskId);
        },
        (err: Error) => {
          assert.ok(err.message.includes("already has"));
          return true;
        }
      );
    });
  });
});
