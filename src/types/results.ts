import { Task, TaskAIMetadata, DocumentationDetection } from "./index";

/**
 * Generic operation result using discriminated union pattern.
 * Prevents invalid states like { success: true, error: "..." }
 *
 * Note: This type uses discriminated unions for operations that may return
 * either success or failure. Most task operations throw exceptions on error
 * instead of returning error results.
 *
 * @example
 * ```typescript
 * const result: OperationResult<Task> =
 *   condition
 *     ? { success: true, data: task }
 *     : { success: false, error: "Task not found" };
 *
 * if (result.success) {
 *   console.log(result.data.title); // ✓ TypeScript knows data exists
 * } else {
 *   console.error(result.error); // ✓ TypeScript knows error exists
 * }
 * ```
 */
export type OperationResult<T = any> =
  | {
      success: true;
      data: T;
      stats?: Record<string, any>;
      metadata?: Record<string, any>;
    }
  | {
      success: false;
      error: string;
      stats?: Record<string, any>;
      metadata?: Record<string, any>;
    };

/**
 * Result of task creation operation.
 * Always returns success; throws exception on error.
 */
export interface CreateTaskResult {
  success: true;
  task: Task;
  aiMetadata?: TaskAIMetadata;
}

/**
 * Result of task enhancement operation.
 * Always returns success; throws exception on error.
 */
export interface EnhanceTaskResult {
  success: true;
  task: Task;
  enhancedContent: string;
  stats: {
    originalLength: number;
    enhancedLength: number;
    duration: number;
    tokenUsage?: {
      prompt: number;
      completion: number;
      total: number;
    };
    timeToFirstToken?: number; // ms
    cost?: number; // USD
  };
  metadata: {
    aiProvider: string;
    aiModel: string;
    confidence: number;
  };
}

/**
 * Result of task splitting operation.
 * Always returns success; throws exception on error.
 */
export interface SplitTaskResult {
  success: true;
  task: Task;
  subtasks: Task[];
  stats: {
    subtasksCreated: number;
    duration: number;
    tokenUsage?: {
      prompt: number;
      completion: number;
      total: number;
    };
    timeToFirstToken?: number; // ms
    cost?: number; // USD
  };
  metadata: {
    aiProvider: string;
    aiModel: string;
    confidence?: number;
  };
}

/**
 * Result of task planning operation.
 * Always returns success; throws exception on error.
 */
export interface PlanTaskResult {
  success: true;
  task: Task;
  plan: string;
  stats: {
    duration: number;
    tokenUsage?: {
      prompt: number;
      completion: number;
      total: number;
    };
    timeToFirstToken?: number; // ms
    cost?: number; // USD
  };
  metadata: {
    aiProvider: string;
    aiModel: string;
  };
}

/**
 * Result of task documentation operation.
 * Always returns success; throws exception on error.
 */
export interface DocumentTaskResult {
  success: true;
  task: Task;
  analysis?: DocumentationDetection;
  documentation?: any;
  stats: {
    duration: number;
  };
}

/**
 * Result of task deletion operation.
 * Always returns success; throws exception on error.
 */
export interface DeleteTaskResult {
  success: true;
  deleted: Task[];
  orphanedSubtasks: Task[];
}

/**
 * Result of PRD parsing operation.
 * Always returns success; throws exception on error.
 */
export interface PRDParseResult {
  success: true;
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
    tokenUsage?: {
      prompt: number;
      completion: number;
      total: number;
    };
    timeToFirstToken?: number; // ms
    cost?: number; // USD
  };
  steps: {
    step: string;
    status: "completed" | "failed";
    duration: number;
    details?: any;
  }[];
}
