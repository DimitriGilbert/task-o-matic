import { Task, CreateTaskRequest, TaskAIMetadata } from "../../types";

export interface TaskRepository {
  // Task Operations
  getTasks(): Promise<Task[]>;
  getTopLevelTasks(): Promise<Task[]>;
  getTask(id: string): Promise<Task | null>;
  createTask(
    task: CreateTaskRequest,
    aiMetadata?: TaskAIMetadata
  ): Promise<Task>;
  updateTask(id: string, updates: Partial<Task>): Promise<Task | null>;
  deleteTask(id: string): Promise<boolean>;
  getSubtasks(parentId: string): Promise<Task[]>;

  // Content Operations
  getTaskContent(taskId: string): Promise<string | null>;
  saveTaskContent(taskId: string, content: string): Promise<string>;
  saveEnhancedTaskContent(taskId: string, content: string): Promise<string>;
  deleteTaskContent(taskId: string): Promise<void>;
  migrateTaskContent(): Promise<number>;
  cleanupOrphanedContent(): Promise<number>;

  // AI Metadata Operations
  getTaskAIMetadata(taskId: string): Promise<TaskAIMetadata | null>;
  saveTaskAIMetadata(metadata: TaskAIMetadata): Promise<void>;
  deleteTaskAIMetadata(taskId: string): Promise<void>;

  // Documentation Operations
  getTaskDocumentation(taskId: string): Promise<string | null>;
  saveTaskDocumentation(taskId: string, content: string): Promise<string>;
  saveContext7Documentation(
    library: string,
    query: string,
    content: string
  ): Promise<string>;
  getDocumentationFile(fileName: string): Promise<string | null>;
  listDocumentationFiles(): Promise<string[]>;

  // Plan Operations
  getPlan(
    taskId: string
  ): Promise<{ plan: string; createdAt: number; updatedAt: number } | null>;
  savePlan(taskId: string, plan: string): Promise<void>;
  listPlans(): Promise<
    Array<{
      taskId: string;
      plan: string;
      createdAt: number;
      updatedAt: number;
    }>
  >;
  deletePlan(taskId: string): Promise<boolean>;

  // Utility Operations
  sanitizeForFilename(name: string): string;
  validateStorageIntegrity(): Promise<{ isValid: boolean; issues: string[] }>;
}
