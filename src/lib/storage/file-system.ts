import { readFile, writeFile, mkdir, unlink, stat, readdir } from "fs/promises";
import { existsSync } from "fs"; // Keep sync for initialization checks if needed, or switch to async
import { join, dirname } from "path";
import { Task, CreateTaskRequest, TaskAIMetadata } from "../../types";
import { configManager } from "../config";
import { TaskRepository } from "./types";

interface TasksData {
  tasks: Task[];
  nextId: number;
}

export class FileSystemStorage implements TaskRepository {
  private taskOMatic: string | null = null;
  private tasksFile: string | null = null;
  private initialized = false;

  constructor() {
    // Pure constructor - NO side effects
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

  private ensureInitialized(): void {
    if (this.initialized) {
      return;
    }

    this.taskOMatic = configManager.getTaskOMaticDir();
    this.tasksFile = join(this.taskOMatic, "tasks.json");
    this.initialized = true;
  }

  private async ensureDirectories(): Promise<void> {
    this.ensureInitialized();
    if (!this.taskOMatic) {
      throw new Error("FileSystemStorage not initialized");
    }

    const dirs = [
      "prd",
      "logs",
      "tasks",
      "tasks/enhanced",
      "docs",
      "docs/tasks",
      "plans",
    ];

    for (const dir of dirs) {
      const fullPath = join(this.taskOMatic!, dir);
      try {
        await mkdir(fullPath, { recursive: true });
      } catch (error: any) {
        if (error.code !== "EEXIST") throw error;
      }
    }
  }

  private async loadTasksData(): Promise<TasksData> {
    this.ensureInitialized();
    if (!this.tasksFile) {
      return { tasks: [], nextId: 1 };
    }

    try {
      // Check if file exists using access or stat, or just try reading
      await stat(this.tasksFile);
    } catch {
      return { tasks: [], nextId: 1 };
    }

    try {
      const content = await readFile(this.tasksFile, "utf-8");
      return JSON.parse(content);
    } catch (error) {
      console.error("Failed to read tasks file:", error);
      return { tasks: [], nextId: 1 };
    }
  }

  private async saveTasksData(data: TasksData): Promise<void> {
    this.ensureInitialized();
    if (!this.tasksFile) {
      throw new Error("FileSystemStorage not initialized");
    }
    try {
      await writeFile(this.tasksFile, JSON.stringify(data, null, 2));
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
    await this.ensureDirectories();
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

  private getAIMetadataFile(): string {
    this.ensureInitialized();
    if (!this.taskOMatic) {
      throw new Error("FileSystemStorage not initialized");
    }
    return join(this.taskOMatic, "ai-metadata.json");
  }

  private async loadAIMetadata(): Promise<TaskAIMetadata[]> {
    const metadataFile = this.getAIMetadataFile();
    try {
      await stat(metadataFile);
    } catch {
      return [];
    }

    try {
      const content = await readFile(metadataFile, "utf-8");
      return JSON.parse(content);
    } catch (error) {
      console.error("Failed to read AI metadata file:", error);
      return [];
    }
  }

  private async saveAIMetadata(metadata: TaskAIMetadata[]): Promise<void> {
    const metadataFile = this.getAIMetadataFile();
    await writeFile(metadataFile, JSON.stringify(metadata, null, 2));
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

    await this.ensureDirectories();
    if (!this.taskOMatic) {
      throw new Error("FileSystemStorage not initialized");
    }
    const contentFileName = `tasks/${taskId}.md`;
    const contentFilePath = join(this.taskOMatic, contentFileName);

    try {
      await writeFile(contentFilePath, content, "utf-8");
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

    await this.ensureDirectories();
    if (!this.taskOMatic) {
      throw new Error("FileSystemStorage not initialized");
    }
    const contentFileName = `tasks/enhanced/${taskId}.md`;
    const contentFilePath = join(this.taskOMatic, contentFileName);

    try {
      await writeFile(contentFilePath, content, "utf-8");
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

    if (!this.taskOMatic) {
      throw new Error("FileSystemStorage not initialized");
    }
    const contentFileName = `tasks/${taskId}.md`;
    const contentFilePath = join(this.taskOMatic, contentFileName);

    try {
      await stat(contentFilePath);
    } catch {
      return null;
    }

    try {
      return await readFile(contentFilePath, "utf-8");
    } catch (error) {
      console.error(`Failed to read task content for ${taskId}:`, error);
      return null;
    }
  }

  async deleteTaskContent(taskId: string): Promise<void> {
    this.validateTaskId(taskId);

    if (!this.taskOMatic) {
      throw new Error("FileSystemStorage not initialized");
    }
    const contentFileName = `tasks/${taskId}.md`;
    const contentFilePath = join(this.taskOMatic, contentFileName);

    try {
      await stat(contentFilePath);
      await unlink(contentFilePath);
    } catch (error) {
      // Ignore if file doesn't exist
    }
  }

  async saveContext7Documentation(
    library: string,
    query: string,
    content: string
  ): Promise<string> {
    await this.ensureDirectories();
    if (!this.taskOMatic) {
      throw new Error("FileSystemStorage not initialized");
    }

    const sanitizedLibrary = this.sanitizeForFilename(library);
    const sanitizedQuery = this.sanitizeForFilename(query);

    const libraryDir = join(this.taskOMatic, "docs", sanitizedLibrary);
    try {
      await mkdir(libraryDir, { recursive: true });
    } catch (error: any) {
      if (error.code !== "EEXIST") throw error;
    }

    const filePath = join(libraryDir, `${sanitizedQuery}.md`);
    await writeFile(filePath, content, "utf-8");

    return `docs/${sanitizedLibrary}/${sanitizedQuery}.md`;
  }

  async getDocumentationFile(fileName: string): Promise<string | null> {
    if (!this.taskOMatic) {
      throw new Error("FileSystemStorage not initialized");
    }
    const filePath = join(this.taskOMatic, "docs", fileName);

    try {
      await stat(filePath);
    } catch {
      return null;
    }

    try {
      return await readFile(filePath, "utf-8");
    } catch (error) {
      console.error(`Failed to read documentation file ${fileName}:`, error);
      return null;
    }
  }

  async listDocumentationFiles(): Promise<string[]> {
    this.ensureInitialized();
    try {
      const docsDir = join(this.taskOMatic!, "docs");

      try {
        await stat(docsDir);
      } catch {
        return [];
      }

      const files: string[] = [];

      const scanDirectory = async (dir: string, basePath: string = "") => {
        const items = await readdir(dir);
        for (const item of items) {
          const fullPath = join(dir, item);
          const relativePath = basePath ? join(basePath, item) : item;

          const stats = await stat(fullPath);
          if (stats.isDirectory() && item !== "_cache") {
            await scanDirectory(fullPath, relativePath);
          } else if (item.endsWith(".md") || item.endsWith(".txt")) {
            files.push(relativePath);
          }
        }
      };

      await scanDirectory(docsDir);
      return files;
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
          if (!this.taskOMatic) {
            throw new Error("FileSystemStorage not initialized");
          }
          const contentFile = `tasks/${task.id}.md`;
          const contentFilePath = join(this.taskOMatic, contentFile);
          await writeFile(contentFilePath, oldContent, "utf-8");

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

    if (!this.taskOMatic) {
      throw new Error("FileSystemStorage not initialized");
    }

    const tasksDir = join(this.taskOMatic, "tasks");
    let cleanedCount = 0;

    try {
      const files = await readdir(tasksDir);

      for (const file of files) {
        if (file.endsWith(".md")) {
          const contentFile = `tasks/${file}`;
          if (!validContentFiles.has(contentFile)) {
            const filePath = join(tasksDir, file);
            try {
              await unlink(filePath);
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
      await this.ensureDirectories();

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
    this.ensureInitialized();

    if (!this.taskOMatic) {
      throw new Error("FileSystemStorage not initialized");
    }

    const planFile = join(this.taskOMatic, "plans", `${taskId}.json`);

    try {
      const planData = {
        taskId,
        plan,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      await writeFile(planFile, JSON.stringify(planData, null, 2));
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
    this.ensureInitialized();

    if (!this.taskOMatic) {
      throw new Error("FileSystemStorage not initialized");
    }

    const planFile = join(this.taskOMatic, "plans", `${taskId}.json`);

    try {
      await stat(planFile);
    } catch {
      return null;
    }

    try {
      const content = await readFile(planFile, "utf-8");
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
    this.ensureInitialized();

    if (!this.taskOMatic) {
      throw new Error("FileSystemStorage not initialized");
    }

    const plansDir = join(this.taskOMatic, "plans");

    try {
      await stat(plansDir);
    } catch {
      return [];
    }

    try {
      const plans: Array<{
        taskId: string;
        plan: string;
        createdAt: number;
        updatedAt: number;
      }> = [];

      const files = await readdir(plansDir);

      for (const file of files) {
        if (file.endsWith(".json")) {
          const taskId = file.replace(".json", "");
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
    this.ensureInitialized();

    if (!this.taskOMatic) {
      throw new Error("FileSystemStorage not initialized");
    }

    const planFile = join(this.taskOMatic, "plans", `${taskId}.json`);

    try {
      await stat(planFile);
      await unlink(planFile);
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

    await this.ensureDirectories();
    if (!this.taskOMatic) {
      throw new Error("FileSystemStorage not initialized");
    }

    const documentationFileName = `docs/tasks/${taskId}.md`;
    const documentationFilePath = join(this.taskOMatic, documentationFileName);

    try {
      await writeFile(documentationFilePath, documentation, "utf-8");
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

    if (!this.taskOMatic) {
      throw new Error("FileSystemStorage not initialized");
    }

    const documentationFileName = `docs/tasks/${taskId}.md`;
    const documentationFilePath = join(this.taskOMatic, documentationFileName);

    try {
      await stat(documentationFilePath);
    } catch {
      return null;
    }

    try {
      return await readFile(documentationFilePath, "utf-8");
    } catch (error) {
      console.error(`Failed to read task documentation for ${taskId}:`, error);
      return null;
    }
  }
}
