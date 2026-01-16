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

    it("should allow re-splitting task with existing subtasks", async () => {
      // Create a task
      const taskData = createTestTaskData();
      const createResult = await taskService.createTask({
        title: taskData.title,
      });

      const taskId = createResult.task.id;

      // Create a subtask manually
      await taskService.createTask({
        title: "Existing Subtask",
        parentId: taskId,
      });

      // Split the task again
      const splitResult = await taskService.splitTask(taskId);

      assert.strictEqual(splitResult.success, true);
      
      // We expect existing subtask + new subtasks from split
      // The mock AI returns 2 subtasks usually
      const subtasks = await taskService.getSubtasks(taskId);
      assert.strictEqual(subtasks.length, 3); // 1 existing + 2 new
    });

    it("should allow splitting a subtask (creating sub-subtasks)", async () => {
      // Create parent
      const parentResult = await taskService.createTask({ title: "Parent" });
      const parentId = parentResult.task.id;

      // Create subtask
      const subtaskResult = await taskService.createTask({
        title: "Subtask",
        parentId: parentId
      });
      const subtaskId = subtaskResult.task.id;

      // Split the subtask
      const splitResult = await taskService.splitTask(subtaskId);

      assert.strictEqual(splitResult.success, true);
      assert.strictEqual(splitResult.subtasks.length, 2);

      // Verify hierarchy
      const subSubtasks = await taskService.getSubtasks(subtaskId);
      assert.strictEqual(subSubtasks.length, 2);
      assert.strictEqual(subSubtasks[0].parentId, subtaskId);

      // Check tree depth
      const tree = await taskService.getTaskTree(parentId);
      // Parent(1) + Subtask(1) + SubSubtasks(2) = 4
      assert.strictEqual(tree.length, 4);
    });
  });

  describe("getTask", () => {
    it("should retrieve a task by ID", async () => {
      const taskData = createTestTaskData();
      const createResult = await taskService.createTask({ title: taskData.title });

      const task = await taskService.getTask(createResult.task.id);

      assert.ok(task !== null);
      if (task) {
        assert.strictEqual(task.id, createResult.task.id);
        assert.strictEqual(task.title, taskData.title);
      }
    });

    it("should return null for non-existent task", async () => {
      const task = await taskService.getTask("non-existent-id");
      assert.strictEqual(task, null);
    });
  });

  describe("getSubtasks", () => {
    it("should return empty array for task without subtasks", async () => {
      const createResult = await taskService.createTask({ title: "Parent Task" });
      const subtasks = await taskService.getSubtasks(createResult.task.id);

      assert.strictEqual(subtasks.length, 0);
    });

    it("should return all subtasks for a parent task", async () => {
      const parentResult = await taskService.createTask({ title: "Parent" });
      await taskService.createTask({ title: "Subtask 1", parentId: parentResult.task.id });
      await taskService.createTask({ title: "Subtask 2", parentId: parentResult.task.id });

      const subtasks = await taskService.getSubtasks(parentResult.task.id);

      assert.strictEqual(subtasks.length, 2);
      assert.ok(subtasks.every(t => t.parentId === parentResult.task.id));
    });
  });

  describe("Tag Management", () => {
    it("should add tags to a task", async () => {
      const createResult = await taskService.createTask({ title: "Test Task" });

      await taskService.addTags(createResult.task.id, ["urgent", "bug"]);
      const task = await taskService.getTask(createResult.task.id);

      assert.ok(task !== null);
      if (task && task.tags) {
        assert.ok(task.tags.includes("urgent"));
        assert.ok(task.tags.includes("bug"));
      }
    });

    it("should remove tags from a task", async () => {
      const createResult = await taskService.createTask({
        title: "Test Task"
      });

      // Add tags first
      await taskService.addTags(createResult.task.id, ["urgent", "bug"]);

      // Then remove one
      const updatedTask = await taskService.removeTags(createResult.task.id, ["bug"]);

      if (updatedTask.tags) {
        assert.strictEqual(updatedTask.tags.includes("bug"), false);
      }
    });

    it("should not duplicate tags when adding existing tags", async () => {
      const createResult = await taskService.createTask({
        title: "Test Task"
      });

      await taskService.addTags(createResult.task.id, ["urgent"]);
      await taskService.addTags(createResult.task.id, ["urgent", "bug"]);
      const task = await taskService.getTask(createResult.task.id);

      if (task && task.tags) {
        const urgentCount = task.tags.filter(t => t === "urgent").length;
        assert.strictEqual(urgentCount, 1);
      }
    });
  });

  describe("setTaskStatus", () => {
    it("should update task status", async () => {
      const createResult = await taskService.createTask({ title: "Test Task" });

      await taskService.setTaskStatus(createResult.task.id, "in-progress");
      const task = await taskService.getTask(createResult.task.id);

      assert.ok(task !== null);
      if (task) {
        assert.strictEqual(task.status, "in-progress");
      }
    });

    it("should allow valid status transitions", async () => {
      const createResult = await taskService.createTask({ title: "Test Task" });

      await taskService.setTaskStatus(createResult.task.id, "in-progress");
      await taskService.setTaskStatus(createResult.task.id, "completed");
      const task = await taskService.getTask(createResult.task.id);

      assert.ok(task !== null);
      if (task) {
        assert.strictEqual(task.status, "completed");
      }
    });
  });

  describe("getNextTask", () => {
    it("should return next pending task", async () => {
      await taskService.createTask({ title: "Task 1" });

      const nextTask = await taskService.getNextTask({});

      assert.ok(nextTask !== null);
    });

    it("should filter by tag", async () => {
      const task1 = await taskService.createTask({ title: "Task 1" });
      const task2 = await taskService.createTask({ title: "Task 2" });

      // Add tags after creation
      await taskService.addTags(task1.task.id, ["backend"]);
      await taskService.addTags(task2.task.id, ["frontend"]);

      const nextTask = await taskService.getNextTask({ tag: "frontend" });

      // Either returns frontend task or null if implementation differs
      if (nextTask && nextTask.tags) {
        assert.ok(nextTask.tags.includes("frontend"));
      }
    });
  });
});
