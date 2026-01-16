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
  stats?: {
    duration: number;
    tokenUsage?: {
      prompt: number;
      completion: number;
      total: number;
    };
    timeToFirstToken?: number; // ms
    cost?: number; // USD
  };
}

export interface RefinePRDResult {
  success: boolean;
  prdFile: string;
  prdContent: string;
  questions?: string[];
  answers?: Record<string, string>;
  stats?: {
    duration: number;
    tokenUsage?: {
      prompt: number;
      completion: number;
      total: number;
    };
    timeToFirstToken?: number; // ms
    cost?: number; // USD
  };
}

export interface GenerateTasksResult {
  success: boolean;
  tasks: Task[];
  stats: {
    tasksCreated: number;
    duration: number;
    tokenUsage?: {
      prompt: number;
      completion: number;
      total: number;
    };
    timeToFirstToken?: number; // ms
    cost?: number; // USD
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

export interface ContinueResult {
  success: boolean;
  action: string;
  projectStatus?: {
    tasks: {
      total: number;
      completed: number;
      inProgress: number;
      todo: number;
      completionPercentage: number;
    };
    prd?: {
      path: string;
      exists: boolean;
      features: string[];
    };
    nextSteps: string[];
  };
  message?: string;
  data?: any;
}
