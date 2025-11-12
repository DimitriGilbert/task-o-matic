import { Task, TaskAIMetadata } from "./index";

export interface OperationResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  stats?: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface CreateTaskResult {
  success: true;
  task: Task;
  aiMetadata?: TaskAIMetadata;
}

export interface EnhanceTaskResult {
  success: true;
  task: Task;
  enhancedContent: string;
  stats: {
    originalLength: number;
    enhancedLength: number;
    duration: number;
  };
  metadata: {
    aiProvider: string;
    aiModel: string;
    confidence: number;
  };
}

export interface SplitTaskResult {
  success: true;
  task: Task;
  subtasks: Task[];
  stats: {
    subtasksCreated: number;
    duration: number;
  };
  metadata: {
    aiProvider: string;
    aiModel: string;
    confidence?: number;
  };
}

export interface PlanTaskResult {
  success: true;
  task: Task;
  plan: string;
  stats: {
    duration: number;
  };
  metadata: {
    aiProvider: string;
    aiModel: string;
  };
}

export interface DocumentTaskResult {
  success: true;
  task: Task;
  analysis?: {
    needsDocumentation: boolean;
    suggestedLibraries: string[];
    reasoning: string;
  };
  documentation?: any;
  stats: {
    duration: number;
  };
}

export interface DeleteTaskResult {
  success: true;
  deleted: Task;
  orphanedSubtasks: Task[];
}

export interface PRDParseResult {
  success: boolean;
  prd: {
    overview: string;
    objectives: string[];
    features: string[];
  };
  tasks: Task[];
  stats: {
    tasksCreated: number;
    duration: number;
    aiProvider: string;
    aiModel: string;
  };
  steps: {
    step: string;
    status: 'completed' | 'failed';
    duration: number;
    details?: any;
  }[];
}
