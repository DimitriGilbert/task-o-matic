import {
  readFileSync,
  writeFileSync,
  existsSync,
  mkdirSync,
  unlinkSync,
  statSync,
  readdirSync,
} from "fs";
import { join, dirname } from "path";
import { Task, CreateTaskRequest, TaskAIMetadata } from "../types";
import { configManager } from "./config";

interface TasksData {
  tasks: Task[];
  nextId: number;
}

export class LocalStorage {
  private taskOMatic: string | null = null;
  private tasksFile: string | null = null;
  private initialized = false;

  constructor() {
    // Pure constructor - NO side effects
  }

  public sanitizeForFilename(name: string): string {
    // console.log('=== SANITIZE DEBUG ===');
    // console.log('name type:', typeof name);
    // console.log('name value:', name);
    // console.log("name length:", name.length);
    // console.log("====================");
    // Replace slashes with a safe character and remove other invalid characters
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

  private ensureDirectories(): void {
    this.ensureInitialized();
    if (!this.taskOMatic) {
      throw new Error("LocalStorage not initialized");
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
    dirs.forEach((dir) => {
      const fullPath = join(this.taskOMatic!, dir);
      if (!existsSync(fullPath)) {
        mkdirSync(fullPath, { recursive: true });
      }
    });
  }

  private loadTasksData(): TasksData {
    this.ensureInitialized();
    if (!this.tasksFile || !existsSync(this.tasksFile)) {
      return { tasks: [], nextId: 1 };
    }

    try {
      const content = readFileSync(this.tasksFile, "utf-8");
      return JSON.parse(content);
    } catch (error) {
      console.error("Failed to read tasks file:", error);
      return { tasks: [], nextId: 1 };
    }
  }

  private saveTasksData(data: TasksData): void {
    this.ensureInitialized();
    if (!this.tasksFile) {
      throw new Error("LocalStorage not initialized");
    }
    try {
      writeFileSync(this.tasksFile, JSON.stringify(data, null, 2));
    } catch (error) {
      throw new Error(
        `Failed to save tasks data: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  private findTaskInHierarchy(
    tasks: Task[],
    id: string,
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
    const data = this.loadTasksData();
    return this.flattenTasks(data.tasks);
  }

  async getTopLevelTasks(): Promise<Task[]> {
    const data = this.loadTasksData();
    return data.tasks;
  }

  async getTask(id: string): Promise<Task | null> {
    this.validateTaskId(id);

    const data = this.loadTasksData();
    const result = this.findTaskInHierarchy(data.tasks, id);
    return result.task;
  }

  async createTask(
    task: CreateTaskRequest,
    aiMetadata?: TaskAIMetadata,
  ): Promise<Task> {
    this.validateTaskRequest(task);
    this.ensureDirectories(); // Ensure directories exist when actually creating tasks
    const data = this.loadTasksData();
    let id: string;

    if (task.parentId) {
      // Generate dot notation ID for subtask
      const parentResult = this.findTaskInHierarchy(data.tasks, task.parentId);
      if (!parentResult.task) {
        throw new Error(`Parent task with ID ${task.parentId} not found`);
      }

      const siblingCount = (parentResult.task.subtasks?.length || 0) + 1;
      id = `${task.parentId}.${siblingCount}`;
    } else {
      // Check if task has a predefined ID (from AI generation)
      if (task.id && typeof task.id === "string") {
        id = task.id;
      } else {
        // Top-level task - use incremental ID
        id = data.nextId.toString();
        data.nextId++;
      }
    }

    // Validate dependencies if provided
    if (task.dependencies && task.dependencies.length > 0) {
      // Check if all dependency tasks exist
      for (const depId of task.dependencies) {
        const depExists = this.taskExists(data.tasks, depId);
        if (!depExists) {
          throw new Error(`Dependency task not found: ${depId}`);
        }
      }

      // Check for circular dependencies
      if (
        this.wouldCreateCircularDependency(data.tasks, id, task.dependencies)
      ) {
        throw new Error(`Circular dependency detected for task ${id}`);
      }
    }

    // Handle content separation
    let contentFile: string | undefined;
    let description = task.description || "";

    if (task.content && task.content.length > 200) {
      // Save long content to MD file
      contentFile = await this.saveTaskContent(id, task.content);
      // Keep first 200 chars as description
      description = task.description || task.content.substring(0, 200) + "...";
    } else if (task.content) {
      // Short content goes in description
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
      // Find parent and add as subtask
      const parentResult = this.findTaskInHierarchy(data.tasks, task.parentId);
      if (parentResult.task) {
        if (!parentResult.task.subtasks) {
          parentResult.task.subtasks = [];
        }
        parentResult.task.subtasks.push(newTask);
      }
    } else {
      // Top-level task
      data.tasks.push(newTask);
    }

    this.saveTasksData(data);

    // Save AI metadata separately if provided
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

    const data = this.loadTasksData();
    const result = this.findTaskInHierarchy(data.tasks, id);

    if (!result.task) return null;

    const updatedTask: Task = {
      ...result.task,
      ...updates,
      id,
      updatedAt: Date.now(),
    };

    if (result.parent) {
      // Update in parent's subtasks
      const parentIndex = result.parent.subtasks!.findIndex((t) => t.id === id);
      result.parent.subtasks![parentIndex] = updatedTask;
    } else {
      // Update top-level task
      const taskIndex = data.tasks.findIndex((t) => t.id === id);
      data.tasks[taskIndex] = updatedTask;
    }

    this.saveTasksData(data);
    return updatedTask;
  }

  async deleteTask(id: string): Promise<boolean> {
    this.validateTaskId(id);

    const data = this.loadTasksData();
    const result = this.findTaskInHierarchy(data.tasks, id);

    if (!result.task) return false;

    if (result.parent) {
      // Remove from parent's subtasks
      const parentIndex = result.parent.subtasks!.findIndex((t) => t.id === id);
      result.parent.subtasks!.splice(parentIndex, 1);
    } else {
      // Remove top-level task
      const taskIndex = data.tasks.findIndex((t) => t.id === id);
      data.tasks.splice(taskIndex, 1);
    }

    this.saveTasksData(data);
    return true;
  }

  async getSubtasks(parentId: string): Promise<Task[]> {
    const data = this.loadTasksData();
    const result = this.findTaskInHierarchy(data.tasks, parentId);
    return result.task?.subtasks || [];
  }

  // Helper methods for dependency validation
  private taskExists(tasks: Task[], taskId: string): boolean {
    // Check for exact match first
    const exactMatch = this.findTaskInHierarchy(tasks, taskId).task;
    if (exactMatch) return true;

    // Check for task- prefix match (AI generates "1" but stored as "task-1")
    const taskPrefixedId = taskId.startsWith("task-")
      ? taskId.substring(5)
      : `task-${taskId}`;
    const prefixedMatch = this.findTaskInHierarchy(tasks, taskPrefixedId).task;
    if (prefixedMatch) return true;

    // Check reverse (stored as "1" but looking for "task-1")
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
    dependencies: string[],
  ): boolean {
    const visited = new Set<string>();

    const checkCircular = (taskId: string): boolean => {
      if (visited.has(taskId)) {
        return true; // Circular dependency detected
      }

      if (taskId === newTaskId) {
        return true; // Found circular reference back to new task
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

    // Check each dependency chain
    for (const depId of dependencies) {
      visited.clear();
      if (checkCircular(depId)) {
        return true;
      }
    }

    return false;
  }

  // AI Metadata
  private getAIMetadataFile(): string {
    this.ensureInitialized();
    if (!this.taskOMatic) {
      throw new Error("LocalStorage not initialized");
    }
    return join(this.taskOMatic, "ai-metadata.json");
  }

  private loadAIMetadata(): TaskAIMetadata[] {
    const metadataFile = this.getAIMetadataFile();
    if (!existsSync(metadataFile)) {
      return [];
    }

    try {
      const content = readFileSync(metadataFile, "utf-8");
      return JSON.parse(content);
    } catch (error) {
      console.error("Failed to read AI metadata file:", error);
      return [];
    }
  }

  private saveAIMetadata(metadata: TaskAIMetadata[]): void {
    const metadataFile = this.getAIMetadataFile();
    writeFileSync(metadataFile, JSON.stringify(metadata, null, 2));
  }

  async getTaskAIMetadata(taskId: string): Promise<TaskAIMetadata | null> {
    const metadata = this.loadAIMetadata();
    return metadata.find((meta) => meta.taskId === taskId) || null;
  }

  async saveTaskAIMetadata(metadata: TaskAIMetadata): Promise<void> {
    const allMetadata = this.loadAIMetadata();
    const existingIndex = allMetadata.findIndex(
      (meta) => meta.taskId === metadata.taskId,
    );

    if (existingIndex >= 0) {
      allMetadata[existingIndex] = metadata;
    } else {
      allMetadata.push(metadata);
    }

    this.saveAIMetadata(allMetadata);
  }

  async deleteTaskAIMetadata(taskId: string): Promise<void> {
    const metadata = this.loadAIMetadata();
    const filtered = metadata.filter((meta) => meta.taskId !== taskId);
    this.saveAIMetadata(filtered);
  }

  // Task Content Files
  async saveTaskContent(taskId: string, content: string): Promise<string> {
    this.validateTaskId(taskId);
    if (typeof content !== "string") {
      throw new Error("Content must be a string");
    }

    this.ensureDirectories(); // Ensure directories exist when saving content
    if (!this.taskOMatic) {
      throw new Error("LocalStorage not initialized");
    }
    const contentFileName = `tasks/${taskId}.md`;
    const contentFilePath = join(this.taskOMatic, contentFileName);

    try {
      writeFileSync(contentFilePath, content, "utf-8");
    } catch (error) {
      throw new Error(
        `Failed to save task content: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
    return contentFileName;
  }

  async saveEnhancedTaskContent(
    taskId: string,
    content: string,
  ): Promise<string> {
    this.validateTaskId(taskId);
    if (typeof content !== "string") {
      throw new Error("Content must be a string");
    }

    this.ensureDirectories(); // Ensure directories exist when saving content
    if (!this.taskOMatic) {
      throw new Error("LocalStorage not initialized");
    }
    const contentFileName = `tasks/enhanced/${taskId}.md`;
    const contentFilePath = join(this.taskOMatic, contentFileName);

    try {
      writeFileSync(contentFilePath, content, "utf-8");
    } catch (error) {
      throw new Error(
        `Failed to save enhanced task content: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
    return contentFileName;
  }

  async getTaskContent(taskId: string): Promise<string | null> {
    this.validateTaskId(taskId);

    if (!this.taskOMatic) {
      throw new Error("LocalStorage not initialized");
    }
    const contentFileName = `tasks/${taskId}.md`;
    const contentFilePath = join(this.taskOMatic, contentFileName);

    if (!existsSync(contentFilePath)) {
      return null;
    }

    try {
      return readFileSync(contentFilePath, "utf-8");
    } catch (error) {
      console.error(`Failed to read task content for ${taskId}:`, error);
      return null;
    }
  }

  async deleteTaskContent(taskId: string): Promise<void> {
    this.validateTaskId(taskId);

    if (!this.taskOMatic) {
      throw new Error("LocalStorage not initialized");
    }
    const contentFileName = `tasks/${taskId}.md`;
    const contentFilePath = join(this.taskOMatic, contentFileName);

    if (existsSync(contentFilePath)) {
      try {
        unlinkSync(contentFilePath);
      } catch (error) {
        console.error(`Failed to delete task content for ${taskId}:`, error);
      }
    }
  }

  async saveContext7Documentation(
    library: string,
    query: string,
    content: string,
  ): Promise<string> {
    this.ensureDirectories(); // Ensure .task-o-matic/docs exists
    if (!this.taskOMatic) {
      throw new Error("LocalStorage not initialized");
    }

    const sanitizedLibrary = this.sanitizeForFilename(library);
    const sanitizedQuery = this.sanitizeForFilename(query);

    const libraryDir = join(this.taskOMatic, "docs", sanitizedLibrary);
    if (!existsSync(libraryDir)) {
      mkdirSync(libraryDir, { recursive: true });
    }

    const filePath = join(libraryDir, `${sanitizedQuery}.md`);
    writeFileSync(filePath, content, "utf-8");

    // Return the relative path for storage
    return `docs/${sanitizedLibrary}/${sanitizedQuery}.md`;
  }

  async getDocumentationFile(fileName: string): Promise<string | null> {
    if (!this.taskOMatic) {
      throw new Error("LocalStorage not initialized");
    }
    const filePath = join(this.taskOMatic, "docs", fileName);

    if (!existsSync(filePath)) {
      return null;
    }

    try {
      return readFileSync(filePath, "utf-8");
    } catch (error) {
      console.error(`Failed to read documentation file ${fileName}:`, error);
      return null;
    }
  }

  // List all available documentation files
  async listDocumentationFiles(): Promise<string[]> {
    this.ensureInitialized();
    try {
      const docsDir = join(this.taskOMatic!, "docs");

      if (!existsSync(docsDir)) {
        return [];
      }

      const files: string[] = [];
      const scanDirectory = (dir: string, basePath: string = "") => {
        const items = readdirSync(dir);
        for (const item of items) {
          const fullPath = join(dir, item);
          const relativePath = basePath ? join(basePath, item) : item;

          if (statSync(fullPath).isDirectory() && item !== "_cache") {
            scanDirectory(fullPath, relativePath);
          } else if (item.endsWith(".md") || item.endsWith(".txt")) {
            files.push(relativePath);
          }
        }
      };

      scanDirectory(docsDir);
      return files;
    } catch (error) {
      console.error("Failed to list documentation files:", error);
      return [];
    }
  }

  // Migration: Separate existing task content into MD files
  async migrateTaskContent(): Promise<number> {
    const data = this.loadTasksData();
    let migratedCount = 0;

    const migrateTask = (task: Task): Task => {
      let updatedTask = { ...task };

      // Check if task has old content property and no contentFile
      if ("content" in task && task.content && !task.contentFile) {
        const oldContent = task.content;

        if (oldContent.length > 200) {
          // Move long content to MD file
          if (!this.taskOMatic) {
            throw new Error("LocalStorage not initialized");
          }
          const contentFile = `tasks/${task.id}.md`;
          const contentFilePath = join(this.taskOMatic, contentFile);
          writeFileSync(contentFilePath, oldContent, "utf-8");

          updatedTask.contentFile = contentFile;
          updatedTask.description =
            task.description || oldContent.substring(0, 200) + "...";
        } else {
          // Keep short content as description
          updatedTask.description = task.description || oldContent;
        }

        // Remove old content property
        const { content: _, ...taskWithoutContent } = updatedTask;
        updatedTask = taskWithoutContent;
        migratedCount++;
      }

      // Migrate subtasks
      if (task.subtasks) {
        updatedTask.subtasks = task.subtasks.map(migrateTask);
      }

      return updatedTask;
    };

    // Process all tasks
    data.tasks = data.tasks.map(migrateTask);

    if (migratedCount > 0) {
      this.saveTasksData(data);
    }

    return migratedCount;
  }

  // Cleanup utilities
  async cleanupOrphanedContent(): Promise<number> {
    const data = this.loadTasksData();
    const allTasks = this.flattenTasks(data.tasks);
    const validContentFiles = new Set(
      allTasks
        .filter((task) => task.contentFile)
        .map((task) => task.contentFile!),
    );

    if (!this.taskOMatic) {
      throw new Error("LocalStorage not initialized");
    }

    const tasksDir = join(this.taskOMatic, "tasks");
    let cleanedCount = 0;

    try {
      const files = readdirSync(tasksDir);

      for (const file of files) {
        if (file.endsWith(".md")) {
          const contentFile = `tasks/${file}`;
          if (!validContentFiles.has(contentFile)) {
            const filePath = join(tasksDir, file);
            try {
              unlinkSync(filePath);
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
      // Check if directories exist
      this.ensureDirectories();

      // Validate tasks data structure
      const data = this.loadTasksData();
      if (!Array.isArray(data.tasks)) {
        issues.push("Tasks data is not an array");
      }

      if (typeof data.nextId !== "number" || data.nextId < 1) {
        issues.push("Invalid nextId in tasks data");
      }

      // Check for duplicate task IDs
      const allTasks = this.flattenTasks(data.tasks);
      const taskIds = allTasks.map((task) => task.id);
      const duplicateIds = taskIds.filter(
        (id, index) => taskIds.indexOf(id) !== index,
      );
      if (duplicateIds.length > 0) {
        issues.push(`Duplicate task IDs found: ${duplicateIds.join(", ")}`);
      }

      // Check for invalid dependencies
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
        `Storage validation error: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }

    return {
      isValid: issues.length === 0,
      issues,
    };
  }

  // Plan storage methods
  async savePlan(taskId: string, plan: string): Promise<void> {
    this.validateTaskId(taskId);
    this.ensureInitialized();

    if (!this.taskOMatic) {
      throw new Error("LocalStorage not initialized");
    }

    const planFile = join(this.taskOMatic, "plans", `${taskId}.md`);

    try {
      const planData = {
        taskId,
        plan,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      writeFileSync(planFile, JSON.stringify(planData, null, 2));
    } catch (error) {
      throw new Error(
        `Failed to save plan for task ${taskId}: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  async getPlan(
    taskId: string,
  ): Promise<{ plan: string; createdAt: number; updatedAt: number } | null> {
    this.validateTaskId(taskId);
    this.ensureInitialized();

    if (!this.taskOMatic) {
      throw new Error("LocalStorage not initialized");
    }

    const planFile = join(this.taskOMatic, "plans", `${taskId}.json`);

    if (!existsSync(planFile)) {
      return null;
    }

    try {
      const content = readFileSync(planFile, "utf-8");
      return JSON.parse(content);
    } catch (error) {
      throw new Error(
        `Failed to read plan for task ${taskId}: ${error instanceof Error ? error.message : "Unknown error"}`,
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
      throw new Error("LocalStorage not initialized");
    }

    const plansDir = join(this.taskOMatic, "plans");

    if (!existsSync(plansDir)) {
      return [];
    }

    try {
      const plans: Array<{
        taskId: string;
        plan: string;
        createdAt: number;
        updatedAt: number;
      }> = [];

      const files = readdirSync(plansDir);

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

      return plans.sort((a, b) => b.updatedAt - a.updatedAt); // Most recent first
    } catch (error) {
      throw new Error(
        `Failed to list plans: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  async deletePlan(taskId: string): Promise<boolean> {
    this.validateTaskId(taskId);
    this.ensureInitialized();

    if (!this.taskOMatic) {
      throw new Error("LocalStorage not initialized");
    }

    const planFile = join(this.taskOMatic, "plans", `${taskId}.json`);

    if (!existsSync(planFile)) {
      return false;
    }

    try {
      unlinkSync(planFile);
      return true;
    } catch (error) {
      throw new Error(
        `Failed to delete plan for task ${taskId}: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  async saveTaskDocumentation(
    taskId: string,
    documentation: string,
  ): Promise<string> {
    this.validateTaskId(taskId);
    if (typeof documentation !== "string") {
      throw new Error("Documentation must be a string");
    }

    this.ensureDirectories(); // Ensure docs/tasks directory exists
    if (!this.taskOMatic) {
      throw new Error("LocalStorage not initialized");
    }

    const documentationFileName = `docs/tasks/${taskId}.md`;
    const documentationFilePath = join(this.taskOMatic, documentationFileName);

    try {
      writeFileSync(documentationFilePath, documentation, "utf-8");
    } catch (error) {
      throw new Error(
        `Failed to save task documentation: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
    return documentationFileName;
  }

  async getTaskDocumentation(taskId: string): Promise<string | null> {
    this.validateTaskId(taskId);

    if (!this.taskOMatic) {
      throw new Error("LocalStorage not initialized");
    }

    const documentationFileName = `docs/tasks/${taskId}.md`;
    const documentationFilePath = join(this.taskOMatic, documentationFileName);

    if (!existsSync(documentationFilePath)) {
      return null;
    }

    try {
      return readFileSync(documentationFilePath, "utf-8");
    } catch (error) {
      console.error(`Failed to read task documentation for ${taskId}:`, error);
      return null;
    }
  }
}
