import { Task, AIConfig } from "./index";

/**
 * Result types for workflow service operations
 */

export interface InitializeResult {
  success: boolean;
  projectDir: string;
  projectName: string;
  aiConfig: {
    provider: string;
    model: string;
    key: string;
  };
  stackConfig?: {
    projectName: string;
    aiProvider: string;
    aiModel: string;
    frontend?: string;
    backend?: string;
    database?: string;
    auth?: boolean;
    reasoning?: string;
  };
  bootstrapped: boolean;
}

export interface DefinePRDResult {
  success: boolean;
  prdFile: string;
  prdContent: string;
  method: "upload" | "manual" | "ai" | "skip";
}

export interface RefinePRDResult {
  success: boolean;
  prdFile: string;
  prdContent: string;
  questions?: string[];
  answers?: Record<string, string>;
}

export interface GenerateTasksResult {
  success: boolean;
  tasks: Task[];
  stats: {
    tasksCreated: number;
    duration: number;
  };
}

export interface SplitTasksResult {
  success: boolean;
  results: Array<{
    taskId: string;
    subtasks: Task[];
    error?: string;
  }>;
}
