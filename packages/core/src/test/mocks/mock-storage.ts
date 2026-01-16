import { TaskRepository } from "../../lib/storage/types";
import { Task, CreateTaskRequest, TaskAIMetadata, PRDVersion, PRDVersionData } from "../../types";

export class MockStorage implements TaskRepository {
  private tasks: Task[] = [];
  private taskContents: Record<string, string> = {};
  private taskAIMetadata: Record<string, TaskAIMetadata> = {};
  private plans: Record<
    string,
    { plan: string; createdAt: number; updatedAt: number }
  > = {};
  private documentationFiles: Record<string, string> = {};
  private prdVersions: Record<string, PRDVersionData> = {};
  private taskIdCounter = 1;

  async createTask(
    request: CreateTaskRequest,
    aiMetadata?: TaskAIMetadata
  ): Promise<Task> {
    const task: Task = {
      id: (this.taskIdCounter++).toString(),
      title: request.title,
      description: request.description || "",
      content: request.content || "",
      status: request.status || "todo",
      estimatedEffort: request.estimatedEffort || "medium",
      createdAt: Date.now(),
      updatedAt: Date.now(),
      parentId: request.parentId,
      dependencies: request.dependencies || [],
      tags: request.tags || [],
      prdFile: request.prdFile,
    };

    this.tasks.push(task);

    if (aiMetadata) {
      this.taskAIMetadata[task.id] = aiMetadata;
    }

    return task;
  }

  async getTask(id: string): Promise<Task | null> {
    return this.tasks.find((task) => task.id === id) || null;
  }

  async getTasks(): Promise<Task[]> {
    return [...this.tasks];
  }

  async getTopLevelTasks(): Promise<Task[]> {
    return this.tasks.filter((task) => !task.parentId);
  }

  async getSubtasks(parentId: string): Promise<Task[]> {
    return this.tasks.filter((task) => task.parentId === parentId);
  }

  async updateTask(id: string, updates: Partial<Task>): Promise<Task | null> {
    const taskIndex = this.tasks.findIndex((task) => task.id === id);
    if (taskIndex === -1) return null;

    const updatedTask = {
      ...this.tasks[taskIndex],
      ...updates,
      updatedAt: Date.now(),
    };

    this.tasks[taskIndex] = updatedTask;
    return updatedTask;
  }

  async deleteTask(id: string): Promise<boolean> {
    const taskIndex = this.tasks.findIndex((task) => task.id === id);
    if (taskIndex === -1) return false;

    this.tasks.splice(taskIndex, 1);
    delete this.taskContents[id];
    delete this.taskAIMetadata[id];
    delete this.plans[id];

    return true;
  }

  async saveTaskContent(taskId: string, content: string): Promise<string> {
    this.taskContents[taskId] = content;
    return `content-${taskId}.md`;
  }

  async getTaskContent(taskId: string): Promise<string | null> {
    return this.taskContents[taskId] || null;
  }

  async deleteTaskContent(taskId: string): Promise<void> {
    delete this.taskContents[taskId];
  }

  async migrateTaskContent(): Promise<number> {
    return 0;
  }

  async cleanupOrphanedContent(): Promise<number> {
    return 0;
  }

  async saveTaskAIMetadata(metadata: TaskAIMetadata): Promise<void> {
    this.taskAIMetadata[metadata.taskId] = metadata;
  }

  async getTaskAIMetadata(taskId: string): Promise<TaskAIMetadata | null> {
    return this.taskAIMetadata[taskId] || null;
  }

  async deleteTaskAIMetadata(taskId: string): Promise<void> {
    delete this.taskAIMetadata[taskId];
  }

  async saveEnhancedTaskContent(
    taskId: string,
    content: string
  ): Promise<string> {
    this.taskContents[taskId] = content;
    return `enhanced-${taskId}.md`;
  }

  async savePlan(taskId: string, plan: string): Promise<void> {
    this.plans[taskId] = {
      plan,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
  }

  async getPlan(
    taskId: string
  ): Promise<{ plan: string; createdAt: number; updatedAt: number } | null> {
    return this.plans[taskId] || null;
  }

  async listPlans(): Promise<
    Array<{
      taskId: string;
      plan: string;
      createdAt: number;
      updatedAt: number;
    }>
  > {
    return Object.entries(this.plans).map(([taskId, planData]) => ({
      taskId,
      ...planData,
    }));
  }

  async deletePlan(taskId: string): Promise<boolean> {
    if (this.plans[taskId]) {
      delete this.plans[taskId];
      return true;
    }
    return false;
  }

  async validateStorageIntegrity(): Promise<{
    isValid: boolean;
    issues: string[];
  }> {
    return { isValid: true, issues: [] };
  }

  sanitizeForFilename(input: string): string {
    return input.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase();
  }

  async saveTaskDocumentation(
    taskId: string,
    content: string
  ): Promise<string> {
    const filename = `docs/${taskId}.md`;
    this.documentationFiles[filename] = content;
    return filename;
  }

  async getTaskDocumentation(taskId: string): Promise<string | null> {
    const filename = `docs/${taskId}.md`;
    return this.documentationFiles[filename] || null;
  }

  async saveContext7Documentation(
    library: string,
    query: string,
    content: string
  ): Promise<string> {
    const filename = `docs/${library}/${query}.md`;
    this.documentationFiles[filename] = content;
    return filename;
  }

  async getDocumentationFile(fileName: string): Promise<string | null> {
    return this.documentationFiles[fileName] || null;
  }

  async listDocumentationFiles(): Promise<string[]> {
    return Object.keys(this.documentationFiles);
  }

  // PRD Versioning Operations
  async getPRDVersions(prdFile: string): Promise<PRDVersionData | null> {
    return this.prdVersions[prdFile] || null;
  }

  async savePRDVersion(prdFile: string, versionData: PRDVersion): Promise<void> {
    if (!this.prdVersions[prdFile]) {
      this.prdVersions[prdFile] = {
        prdFile,
        versions: [],
        currentVersion: 0,
      };
    }

    const data = this.prdVersions[prdFile];
    const existingIndex = data.versions.findIndex(
      (v) => v.version === versionData.version
    );

    if (existingIndex >= 0) {
      data.versions[existingIndex] = versionData;
    } else {
      data.versions.push(versionData);
    }

    data.currentVersion = Math.max(data.currentVersion, versionData.version);
  }

  async getLatestPRDVersion(prdFile: string): Promise<PRDVersion | null> {
    const data = this.prdVersions[prdFile];
    if (!data || data.versions.length === 0) return null;
    
    const current = data.versions.find(v => v.version === data.currentVersion);
    return current || data.versions[data.versions.length - 1];
  }
}
