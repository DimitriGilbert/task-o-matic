import { Task, CreateTaskRequest, TaskAIMetadata } from "../../types";
import { configManager } from "../config";
import { TaskRepository } from "./types";
import {
  StorageCallbacks,
  createFileSystemCallbacks,
} from "./storage-callbacks";

interface TasksData {
  tasks: Task[];
  nextId: number;
}

export class FileSystemStorage implements TaskRepository {
  private callbacks: StorageCallbacks;

  constructor(callbacks?: StorageCallbacks) {
    // If no callbacks provided, use default file system callbacks
    // We use configManager to get the base directory for the default implementation
    this.callbacks =
      callbacks || createFileSystemCallbacks(configManager.getTaskOMaticDir());
  }

  public sanitizeForFilename(name: string): string {
    return name.replace(/[\/\?%*:|"<>]/g, "-");
  }

  private validateTaskId(taskId: string): void {
    if (!taskId || typeof taskId !== "string" || taskId.trim() === "") {
      throw new Error("Task ID must be a non-empty string");
    }
  }

  private validateTaskRequest(task: CreateTaskRequest): void {
    if (!task || typeof task !== "object") {
      throw new Error("Task request must be a valid object");
    }
    if (
      !task.title ||
      typeof task.title !== "string" ||
      task.title.trim() === ""
    ) {
      throw new Error("Task title is required and must be a non-empty string");
    }
    if (task.parentId && typeof task.parentId !== "string") {
      throw new Error("Parent ID must be a string if provided");
    }
    if (
      task.estimatedEffort &&
      !["small", "medium", "large"].includes(task.estimatedEffort)
    ) {
      throw new Error("Estimated effort must be 'small', 'medium', or 'large'");
    }
    if (task.dependencies && !Array.isArray(task.dependencies)) {
      throw new Error("Dependencies must be an array if provided");
    }
    if (task.tags && !Array.isArray(task.tags)) {
      throw new Error("Tags must be an array if provided");
    }
  }

  private async loadTasksData(): Promise<TasksData> {
    try {
      const content = await this.callbacks.read("tasks.json");
      if (!content) {
        return { tasks: [], nextId: 1 };
      }
      return JSON.parse(content);
    } catch (error) {
      console.error("Failed to read tasks file:", error);
      return { tasks: [], nextId: 1 };
    }
  }

  private async saveTasksData(data: TasksData): Promise<void> {
    try {
      await this.callbacks.write("tasks.json", JSON.stringify(data, null, 2));
    } catch (error) {
      throw new Error(
        `Failed to save tasks data: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  private findTaskInHierarchy(
    tasks: Task[],
    id: string
  ): { task: Task | null; parent: Task | null; index: number } {
    for (let i = 0; i < tasks.length; i++) {
      const task = tasks[i];
      if (task.id === id) {
        return { task, parent: null, index: i };
      }
      if (task.subtasks) {
        const result = this.findTaskInHierarchy(task.subtasks, id);
        if (result.task) {
          return { ...result, parent: task };
        }
      }
    }
    return { task: null, parent: null, index: -1 };
  }

  private flattenTasks(tasks: Task[]): Task[] {
    const result: Task[] = [];
    for (const task of tasks) {
      const { subtasks, ...taskWithoutSubtasks } = task;
      result.push(taskWithoutSubtasks);
      if (subtasks) {
        result.push(...this.flattenTasks(subtasks));
      }
    }
    return result;
  }

  // Tasks
  async getTasks(): Promise<Task[]> {
    const data = await this.loadTasksData();
    return this.flattenTasks(data.tasks);
  }

  async getTopLevelTasks(): Promise<Task[]> {
    const data = await this.loadTasksData();
    return data.tasks;
  }

  async getTask(id: string): Promise<Task | null> {
    this.validateTaskId(id);

    const data = await this.loadTasksData();
    const result = this.findTaskInHierarchy(data.tasks, id);
    return result.task;
  }

  async createTask(
    task: CreateTaskRequest,
    aiMetadata?: TaskAIMetadata
  ): Promise<Task> {
    this.validateTaskRequest(task);
    const data = await this.loadTasksData();
    let id: string;

    if (task.parentId) {
      const parentResult = this.findTaskInHierarchy(data.tasks, task.parentId);
      if (!parentResult.task) {
        throw new Error(`Parent task with ID ${task.parentId} not found`);
      }

      const siblingCount = (parentResult.task.subtasks?.length || 0) + 1;
      id = `${task.parentId}.${siblingCount}`;
    } else {
      if (task.id && typeof task.id === "string") {
        id = task.id;
      } else {
        id = data.nextId.toString();
        data.nextId++;
      }
    }

    if (task.dependencies && task.dependencies.length > 0) {
      for (const depId of task.dependencies) {
        const depExists = this.taskExists(data.tasks, depId);
        if (!depExists) {
          throw new Error(`Dependency task not found: ${depId}`);
        }
      }

      if (
        this.wouldCreateCircularDependency(data.tasks, id, task.dependencies)
      ) {
        throw new Error(`Circular dependency detected for task ${id}`);
      }
    }

    let contentFile: string | undefined;
    let description = task.description || "";

    if (task.content && task.content.length > 200) {
      contentFile = await this.saveTaskContent(id, task.content);
      description = task.description || task.content.substring(0, 200) + "...";
    } else if (task.content) {
      description = task.description || task.content;
    }

    const newTask: Task = {
      id,
      title: task.title,
      description,
      contentFile,
      status: task.status || "todo",
      estimatedEffort: task.estimatedEffort,
      dependencies: task.dependencies,
      tags: task.tags,
      subtasks: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      prdFile: task.prdFile,
    };

    if (task.parentId) {
      const parentResult = this.findTaskInHierarchy(data.tasks, task.parentId);
      if (parentResult.task) {
        if (!parentResult.task.subtasks) {
          parentResult.task.subtasks = [];
        }
        parentResult.task.subtasks.push(newTask);
      }
    } else {
      data.tasks.push(newTask);
    }

    await this.saveTasksData(data);

    if (aiMetadata) {
      await this.saveTaskAIMetadata({
        ...aiMetadata,
        taskId: id,
        generatedAt: Date.now(),
      });
    }

    return newTask;
  }

  async updateTask(id: string, updates: Partial<Task>): Promise<Task | null> {
    this.validateTaskId(id);
    if (!updates || typeof updates !== "object") {
      throw new Error("Updates must be a valid object");
    }

    const data = await this.loadTasksData();
    const result = this.findTaskInHierarchy(data.tasks, id);

    if (!result.task) return null;

    const updatedTask: Task = {
      ...result.task,
      ...updates,
      id,
      updatedAt: Date.now(),
    };

    if (result.parent) {
      const parentIndex = result.parent.subtasks!.findIndex((t) => t.id === id);
      result.parent.subtasks![parentIndex] = updatedTask;
    } else {
      const taskIndex = data.tasks.findIndex((t) => t.id === id);
      data.tasks[taskIndex] = updatedTask;
    }

    await this.saveTasksData(data);
    return updatedTask;
  }

  async deleteTask(id: string): Promise<boolean> {
    this.validateTaskId(id);

    const data = await this.loadTasksData();
    const result = this.findTaskInHierarchy(data.tasks, id);

    if (!result.task) return false;

    if (result.parent) {
      const parentIndex = result.parent.subtasks!.findIndex((t) => t.id === id);
      result.parent.subtasks!.splice(parentIndex, 1);
    } else {
      const taskIndex = data.tasks.findIndex((t) => t.id === id);
      data.tasks.splice(taskIndex, 1);
    }

    await this.saveTasksData(data);
    return true;
  }

  async getSubtasks(parentId: string): Promise<Task[]> {
    const data = await this.loadTasksData();
    const result = this.findTaskInHierarchy(data.tasks, parentId);
    return result.task?.subtasks || [];
  }

  private taskExists(tasks: Task[], taskId: string): boolean {
    const exactMatch = this.findTaskInHierarchy(tasks, taskId).task;
    if (exactMatch) return true;

    const taskPrefixedId = taskId.startsWith("task-")
      ? taskId.substring(5)
      : `task-${taskId}`;
    const prefixedMatch = this.findTaskInHierarchy(tasks, taskPrefixedId).task;
    if (prefixedMatch) return true;

    if (taskId.startsWith("task-")) {
      const numericId = taskId.substring(5);
      const numericMatch = this.findTaskInHierarchy(tasks, numericId).task;
      if (numericMatch) return true;
    }

    return false;
  }

  private wouldCreateCircularDependency(
    tasks: Task[],
    newTaskId: string,
    dependencies: string[]
  ): boolean {
    const visited = new Set<string>();

    const checkCircular = (taskId: string): boolean => {
      if (visited.has(taskId)) {
        return true;
      }

      if (taskId === newTaskId) {
        return true;
      }

      visited.add(taskId);

      const task = this.findTaskInHierarchy(tasks, taskId).task;
      if (task && task.dependencies) {
        for (const depId of task.dependencies) {
          if (checkCircular(depId)) {
            return true;
          }
        }
      }

      visited.delete(taskId);
      return false;
    };

    for (const depId of dependencies) {
      visited.clear();
      if (checkCircular(depId)) {
        return true;
      }
    }

    return false;
  }

  private async loadAIMetadata(): Promise<TaskAIMetadata[]> {
    try {
      const content = await this.callbacks.read("ai-metadata.json");
      if (!content) return [];
      return JSON.parse(content);
    } catch (error) {
      console.error("Failed to read AI metadata file:", error);
      return [];
    }
  }

  private async saveAIMetadata(metadata: TaskAIMetadata[]): Promise<void> {
    await this.callbacks.write(
      "ai-metadata.json",
      JSON.stringify(metadata, null, 2)
    );
  }

  async getTaskAIMetadata(taskId: string): Promise<TaskAIMetadata | null> {
    const metadata = await this.loadAIMetadata();
    return metadata.find((meta) => meta.taskId === taskId) || null;
  }

  async saveTaskAIMetadata(metadata: TaskAIMetadata): Promise<void> {
    const allMetadata = await this.loadAIMetadata();
    const existingIndex = allMetadata.findIndex(
      (meta) => meta.taskId === metadata.taskId
    );

    if (existingIndex >= 0) {
      allMetadata[existingIndex] = metadata;
    } else {
      allMetadata.push(metadata);
    }

    await this.saveAIMetadata(allMetadata);
  }

  async deleteTaskAIMetadata(taskId: string): Promise<void> {
    const metadata = await this.loadAIMetadata();
    const filtered = metadata.filter((meta) => meta.taskId !== taskId);
    await this.saveAIMetadata(filtered);
  }

  async saveTaskContent(taskId: string, content: string): Promise<string> {
    this.validateTaskId(taskId);
    if (typeof content !== "string") {
      throw new Error("Content must be a string");
    }

    const contentFileName = `tasks/${taskId}.md`;

    try {
      await this.callbacks.write(contentFileName, content);
    } catch (error) {
      throw new Error(
        `Failed to save task content: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
    return contentFileName;
  }

  async saveEnhancedTaskContent(
    taskId: string,
    content: string
  ): Promise<string> {
    this.validateTaskId(taskId);
    if (typeof content !== "string") {
      throw new Error("Content must be a string");
    }

    const contentFileName = `tasks/enhanced/${taskId}.md`;

    try {
      await this.callbacks.write(contentFileName, content);
    } catch (error) {
      throw new Error(
        `Failed to save enhanced task content: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
    return contentFileName;
  }

  async getTaskContent(taskId: string): Promise<string | null> {
    this.validateTaskId(taskId);

    const contentFileName = `tasks/${taskId}.md`;

    try {
      return await this.callbacks.read(contentFileName);
    } catch (error) {
      console.error(`Failed to read task content for ${taskId}:`, error);
      return null;
    }
  }

  async deleteTaskContent(taskId: string): Promise<void> {
    this.validateTaskId(taskId);
    const contentFileName = `tasks/${taskId}.md`;
    await this.callbacks.delete(contentFileName);
  }

  async saveContext7Documentation(
    library: string,
    query: string,
    content: string
  ): Promise<string> {
    const sanitizedLibrary = this.sanitizeForFilename(library);
    const sanitizedQuery = this.sanitizeForFilename(query);

    const filePath = `docs/${sanitizedLibrary}/${sanitizedQuery}.md`;
    await this.callbacks.write(filePath, content);

    return filePath;
  }

  async getDocumentationFile(fileName: string): Promise<string | null> {
    const filePath = `docs/${fileName}`;
    try {
      return await this.callbacks.read(filePath);
    } catch (error) {
      console.error(`Failed to read documentation file ${fileName}:`, error);
      return null;
    }
  }

  async listDocumentationFiles(): Promise<string[]> {
    try {
      const files = await this.callbacks.list("docs/");
      // Filter for markdown/text files and remove "docs/" prefix for compatibility
      return files
        .filter((f) => f.endsWith(".md") || f.endsWith(".txt"))
        .map((f) => (f.startsWith("docs/") ? f.substring(5) : f));
    } catch (error) {
      console.error("Failed to list documentation files:", error);
      return [];
    }
  }

  async migrateTaskContent(): Promise<number> {
    const data = await this.loadTasksData();
    let migratedCount = 0;

    const migrateTask = async (task: Task): Promise<Task> => {
      let updatedTask = { ...task };

      if ("content" in task && (task as any).content && !task.contentFile) {
        const oldContent = (task as any).content;

        if (oldContent.length > 200) {
          const contentFile = `tasks/${task.id}.md`;
          await this.callbacks.write(contentFile, oldContent);

          updatedTask.contentFile = contentFile;
          updatedTask.description =
            task.description || oldContent.substring(0, 200) + "...";
        } else {
          updatedTask.description = task.description || oldContent;
        }

        const { content: _, ...taskWithoutContent } = updatedTask as any;
        updatedTask = taskWithoutContent;
        migratedCount++;
      }

      if (task.subtasks) {
        updatedTask.subtasks = await Promise.all(
          task.subtasks.map(migrateTask)
        );
      }

      return updatedTask;
    };

    data.tasks = await Promise.all(data.tasks.map(migrateTask));

    if (migratedCount > 0) {
      await this.saveTasksData(data);
    }

    return migratedCount;
  }

  async cleanupOrphanedContent(): Promise<number> {
    const data = await this.loadTasksData();
    const allTasks = this.flattenTasks(data.tasks);
    const validContentFiles = new Set(
      allTasks
        .filter((task) => task.contentFile)
        .map((task) => task.contentFile!)
    );

    let cleanedCount = 0;

    try {
      const files = await this.callbacks.list("tasks/");

      for (const file of files) {
        // file is a full key like "tasks/123.md"
        // validContentFiles contains relative paths like "tasks/123.md"
        // So we can check directly

        if (file.endsWith(".md")) {
          if (!validContentFiles.has(file)) {
            try {
              await this.callbacks.delete(file);
              cleanedCount++;
              console.log(`Cleaned up orphaned content file: ${file}`);
            } catch (error) {
              console.error(`Failed to delete orphaned file ${file}:`, error);
            }
          }
        }
      }
    } catch (error) {
      console.error("Failed to cleanup orphaned content:", error);
    }

    return cleanedCount;
  }

  async validateStorageIntegrity(): Promise<{
    isValid: boolean;
    issues: string[];
  }> {
    const issues: string[] = [];

    try {
      const data = await this.loadTasksData();
      if (!Array.isArray(data.tasks)) {
        issues.push("Tasks data is not an array");
      }

      if (typeof data.nextId !== "number" || data.nextId < 1) {
        issues.push("Invalid nextId in tasks data");
      }

      const allTasks = this.flattenTasks(data.tasks);
      const taskIds = allTasks.map((task) => task.id);
      const duplicateIds = taskIds.filter(
        (id, index) => taskIds.indexOf(id) !== index
      );
      if (duplicateIds.length > 0) {
        issues.push(`Duplicate task IDs found: ${duplicateIds.join(", ")}`);
      }

      for (const task of allTasks) {
        if (task.dependencies) {
          for (const depId of task.dependencies) {
            if (!taskIds.includes(depId)) {
              issues.push(`Task ${task.id} has invalid dependency: ${depId}`);
            }
          }
        }
      }
    } catch (error) {
      issues.push(
        `Storage validation error: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }

    return {
      isValid: issues.length === 0,
      issues,
    };
  }

  async savePlan(taskId: string, plan: string): Promise<void> {
    this.validateTaskId(taskId);

    const planFile = `plans/${taskId}.json`;

    try {
      const planData = {
        taskId,
        plan,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      await this.callbacks.write(planFile, JSON.stringify(planData, null, 2));
    } catch (error) {
      throw new Error(
        `Failed to save plan for task ${taskId}: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  async getPlan(
    taskId: string
  ): Promise<{ plan: string; createdAt: number; updatedAt: number } | null> {
    this.validateTaskId(taskId);

    const planFile = `plans/${taskId}.json`;

    try {
      const content = await this.callbacks.read(planFile);
      if (!content) return null;
      return JSON.parse(content);
    } catch (error) {
      throw new Error(
        `Failed to read plan for task ${taskId}: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  async listPlans(): Promise<
    Array<{
      taskId: string;
      plan: string;
      createdAt: number;
      updatedAt: number;
    }>
  > {
    try {
      const plans: Array<{
        taskId: string;
        plan: string;
        createdAt: number;
        updatedAt: number;
      }> = [];

      const files = await this.callbacks.list("plans/");

      for (const file of files) {
        if (file.endsWith(".json")) {
          // file is "plans/123.json"
          const taskId = file.replace("plans/", "").replace(".json", "");
          const planData = await this.getPlan(taskId);
          if (planData) {
            plans.push({
              taskId,
              plan: planData.plan,
              createdAt: planData.createdAt,
              updatedAt: planData.updatedAt,
            });
          }
        }
      }

      return plans.sort((a, b) => b.updatedAt - a.updatedAt);
    } catch (error) {
      throw new Error(
        `Failed to list plans: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  async deletePlan(taskId: string): Promise<boolean> {
    this.validateTaskId(taskId);
    const planFile = `plans/${taskId}.json`;
    try {
      await this.callbacks.delete(planFile);
      return true;
    } catch (error) {
      return false;
    }
  }

  async saveTaskDocumentation(
    taskId: string,
    documentation: string
  ): Promise<string> {
    this.validateTaskId(taskId);
    if (typeof documentation !== "string") {
      throw new Error("Documentation must be a string");
    }

    const documentationFileName = `docs/tasks/${taskId}.md`;

    try {
      await this.callbacks.write(documentationFileName, documentation);
    } catch (error) {
      throw new Error(
        `Failed to save task documentation: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
    return documentationFileName;
  }

  async getTaskDocumentation(taskId: string): Promise<string | null> {
    this.validateTaskId(taskId);

    const documentationFileName = `docs/tasks/${taskId}.md`;

    try {
      return await this.callbacks.read(documentationFileName);
    } catch (error) {
      console.error(`Failed to read task documentation for ${taskId}:`, error);
      return null;
    }
  }
}
