/**
 * Benchmark Operations Registry
 *
 * This module provides a registry of benchmarkable operations.
 * Each operation can be executed in isolation with different AI models
 * to compare their performance and output quality.
 */

import type { BenchmarkableOperation } from "../types";
import type { AIOptions } from "../../../utils/ai-config-builder";
import type { StreamingOptions } from "../../../types";
import { PRDService } from "../../../services/prd";
import { TaskService } from "../../../services/tasks";

// ============================================================================
// PRD Operations
// ============================================================================

/**
 * PRD Parse Operation
 * Parses a PRD file and extracts tasks
 */
const prdParseOperation: BenchmarkableOperation = {
  id: "prd-parse",
  name: "PRD Parse",
  description: "Parse a Product Requirements Document and extract tasks",
  execute: async (
    input: unknown,
    aiOptions: AIOptions,
    streamingOptions?: StreamingOptions
  ): Promise<unknown> => {
    const prdService = new PRDService();

    const params = input as { file: string };
    return prdService.parsePRD({
      file: params.file,
      aiOptions,
      streamingOptions,
    });
  },
  validateInput: (input: unknown): boolean => {
    const params = input as Record<string, unknown>;
    return typeof params?.file === "string" && params.file.length > 0;
  },
};

/**
 * PRD Rework Operation
 * Reworks a PRD based on feedback
 */
const prdReworkOperation: BenchmarkableOperation = {
  id: "prd-rework",
  name: "PRD Rework",
  description: "Rework a PRD based on user feedback",
  execute: async (
    input: unknown,
    aiOptions: AIOptions,
    streamingOptions?: StreamingOptions
  ): Promise<unknown> => {
    const { PRDService } = await import("../../../services/prd");
    const prdService = new PRDService();

    const params = input as { file: string; feedback: string };
    return prdService.reworkPRD({
      file: params.file,
      feedback: params.feedback,
      aiOptions,
      streamingOptions,
    });
  },
  validateInput: (input: unknown): boolean => {
    const params = input as Record<string, unknown>;
    return (
      typeof params?.file === "string" &&
      params.file.length > 0 &&
      typeof params?.feedback === "string" &&
      params.feedback.length > 0
    );
  },
};

/**
 * PRD Refine With Questions Operation
 * Refines a PRD with Q&A feedback
 */
const prdRefineOperation: BenchmarkableOperation = {
  id: "prd-refine",
  name: "PRD Refine",
  description: "Refine a PRD with answers to clarifying questions",
  execute: async (
    input: unknown,
    aiOptions: AIOptions,
    streamingOptions?: StreamingOptions
  ): Promise<unknown> => {
    const { PRDService } = await import("../../../services/prd");
    const prdService = new PRDService();

    const params = input as { 
      file: string; 
      answers: Record<string, string>;
      questionMode?: "user" | "ai";
    };
    return prdService.refinePRDWithQuestions({
      file: params.file,
      questionMode: params.questionMode ?? "user",
      answers: params.answers,
      aiOptions,
      streamingOptions,
    });
  },
  validateInput: (input: unknown): boolean => {
    const params = input as Record<string, unknown>;
    return (
      typeof params?.file === "string" &&
      params.file.length > 0 &&
      typeof params?.answers === "object" &&
      params.answers !== null
    );
  },
};

// ============================================================================
// Task Operations
// ============================================================================

/**
 * Task Create Operation
 * Creates a new task with AI enhancement
 */
const taskCreateOperation: BenchmarkableOperation = {
  id: "task-create",
  name: "Task Create",
  description: "Create a new task with AI enhancement",
  execute: async (
    input: unknown,
    aiOptions: AIOptions,
    streamingOptions?: StreamingOptions
  ): Promise<unknown> => {
    const { TaskService } = await import("../../../services/tasks");
    const taskService = new TaskService();

    const params = input as { title: string; content?: string };
    return taskService.createTask({
      title: params.title,
      content: params.content,
      aiEnhance: true,
      aiOptions,
      streamingOptions,
    });
  },
  validateInput: (input: unknown): boolean => {
    const params = input as Record<string, unknown>;
    return typeof params?.title === "string" && params.title.length > 0;
  },
};

/**
 * Task Enhance Operation
 * Enhances an existing task with AI
 */
const taskEnhanceOperation: BenchmarkableOperation = {
  id: "task-enhance",
  name: "Task Enhance",
  description: "Enhance an existing task with AI-generated details",
  execute: async (
    input: unknown,
    aiOptions: AIOptions,
    streamingOptions?: StreamingOptions
  ): Promise<unknown> => {
    const { TaskService } = await import("../../../services/tasks");
    const taskService = new TaskService();

    const params = input as { taskId: string };
    // enhanceTask takes positional arguments: taskId, aiOptions, streamingOptions
    return taskService.enhanceTask(params.taskId, aiOptions, streamingOptions);
  },
  validateInput: (input: unknown): boolean => {
    const params = input as Record<string, unknown>;
    return typeof params?.taskId === "string" && params.taskId.length > 0;
  },
};

/**
 * Task Split Operation
 * Splits a task into subtasks
 */
const taskSplitOperation: BenchmarkableOperation = {
  id: "task-split",
  name: "Task Split",
  description: "Split a complex task into smaller subtasks",
  execute: async (
    input: unknown,
    aiOptions: AIOptions,
    streamingOptions?: StreamingOptions
  ): Promise<unknown> => {
    const { TaskService } = await import("../../../services/tasks");
    const taskService = new TaskService();

    const params = input as { taskId: string; instructions?: string };
    // splitTask takes: taskId, aiOptions, promptOverride, messageOverride, streamingOptions, enableFilesystemTools
    return taskService.splitTask(
      params.taskId,
      aiOptions,
      params.instructions, // promptOverride
      undefined, // messageOverride
      streamingOptions,
      false // enableFilesystemTools
    );
  },
  validateInput: (input: unknown): boolean => {
    const params = input as Record<string, unknown>;
    return typeof params?.taskId === "string" && params.taskId.length > 0;
  },
};

/**
 * Task Plan Operation
 * Generates an implementation plan for a task
 */
const taskPlanOperation: BenchmarkableOperation = {
  id: "task-plan",
  name: "Task Plan",
  description: "Generate an implementation plan for a task",
  execute: async (
    input: unknown,
    aiOptions: AIOptions,
    streamingOptions?: StreamingOptions
  ): Promise<unknown> => {
    const { TaskService } = await import("../../../services/tasks");
    const taskService = new TaskService();

    const params = input as { taskId: string };
    // planTask takes: taskId, aiOptions, streamingOptions
    return taskService.planTask(params.taskId, aiOptions, streamingOptions);
  },
  validateInput: (input: unknown): boolean => {
    const params = input as Record<string, unknown>;
    return typeof params?.taskId === "string" && params.taskId.length > 0;
  },
};

/**
 * Task Document Operation
 * Generates documentation for a task
 */
const taskDocumentOperation: BenchmarkableOperation = {
  id: "task-document",
  name: "Task Document",
  description: "Generate documentation for a task",
  execute: async (
    input: unknown,
    aiOptions: AIOptions,
    streamingOptions?: StreamingOptions
  ): Promise<unknown> => {
    const { TaskService } = await import("../../../services/tasks");
    const taskService = new TaskService();

    const params = input as { taskId: string; force?: boolean };
    // documentTask takes: taskId, force, aiOptions, streamingOptions
    return taskService.documentTask(
      params.taskId,
      params.force ?? false,
      aiOptions,
      streamingOptions
    );
  },
  validateInput: (input: unknown): boolean => {
    const params = input as Record<string, unknown>;
    return typeof params?.taskId === "string" && params.taskId.length > 0;
  },
};

// ============================================================================
// Registry
// ============================================================================

/**
 * Map of all registered benchmark operations
 */
const benchmarkOperations: Map<string, BenchmarkableOperation> = new Map([
  // PRD Operations
  ["prd-parse", prdParseOperation],
  ["prd-rework", prdReworkOperation],
  ["prd-refine", prdRefineOperation],
  // Task Operations
  ["task-create", taskCreateOperation],
  ["task-enhance", taskEnhanceOperation],
  ["task-split", taskSplitOperation],
  ["task-plan", taskPlanOperation],
  ["task-document", taskDocumentOperation],
]);

/**
 * Get an operation by ID
 */
export function getOperation(id: string): BenchmarkableOperation | undefined {
  return benchmarkOperations.get(id);
}

/**
 * List all available operations
 */
export function listOperations(): BenchmarkableOperation[] {
  return Array.from(benchmarkOperations.values());
}

/**
 * Register a new operation
 */
export function registerOperation(operation: BenchmarkableOperation): void {
  benchmarkOperations.set(operation.id, operation);
}

/**
 * Get all operation IDs
 */
export function getOperationIds(): string[] {
  return Array.from(benchmarkOperations.keys());
}

/**
 * Initialize the default operations in an orchestrator
 */
export function initializeOperations(
  registerFn: (operation: BenchmarkableOperation) => void
): void {
  for (const operation of benchmarkOperations.values()) {
    registerFn(operation);
  }
}

// Export individual operations for direct use
export {
  prdParseOperation,
  prdReworkOperation,
  prdRefineOperation,
  taskCreateOperation,
  taskEnhanceOperation,
  taskSplitOperation,
  taskPlanOperation,
  taskDocumentOperation,
};
