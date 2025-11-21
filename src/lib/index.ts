/**
 * task-o-matic Library Entry Point
 *
 * This module exports the core services, types, and utilities for using
 * task-o-matic as a library in TUI, web applications, or other Node.js projects.
 *
 * @example
 * ```typescript
 * import { TaskService, Task, AIConfig } from 'task-o-matic';
 *
 * const taskService = new TaskService();
 * const result = await taskService.createTask({
 *   title: 'My Task',
 *   content: 'Task description',
 *   aiEnhance: true
 * });
 * ```
 */

// ============================================================================
// Main Services - Business Logic Layer
// ============================================================================

/**
 * TaskService - Core task management operations
 * Handles creating, updating, listing, enhancing, splitting, and planning tasks
 */
export { TaskService } from "../services/tasks";

/**
 * PRDService - Product Requirements Document parsing and processing
 * Handles PRD parsing, task extraction, and PRD improvement
 */
export { PRDService } from "../services/prd";

// ============================================================================
// Core Types - Type Definitions
// ============================================================================

/**
 * Re-export all types from the types module
 * Includes Task, AIConfig, StreamingOptions, and all related interfaces
 */
export * from "../types";

/**
 * Re-export callback types
 */
export type { ProgressCallback } from "../types/callbacks";

/**
 * Re-export option types
 */
export type {
  CreateTaskOptions,
  SplitTaskOptions,
  PlanTaskOptions,
  EnhanceTaskOptions,
} from "../types/options";

// ============================================================================
// Utility Factories - Singleton Service Instances
// ============================================================================

/**
 * Factory functions for getting singleton instances of core services
 * These ensure only one instance exists throughout the application
 */
export {
  getAIOperations,
  getModelProvider,
  getStorage,
  getContextBuilder,
  resetServiceInstances,
} from "../utils/ai-service-factory";

/**
 * AI configuration builder utility
 */
export { buildAIConfig } from "../utils/ai-config-builder";
export type { AIOptions } from "../utils/ai-config-builder";

// ============================================================================
// Core Classes - Direct Class Exports
// ============================================================================

/**
 * LocalStorage - File-based storage abstraction for tasks and metadata
 * Note: This is Node.js file-system based and not compatible with browser environments
 */
export { FileSystemStorage } from "./storage/file-system";
export type { TaskRepository } from "./storage/types";

/**
 * ConfigManager - Configuration management for task-o-matic projects
 */
export { ConfigManager, configManager } from "./config";

/**
 * AIOperations - AI service operations wrapper
 */
export { AIOperations } from "./ai-service/ai-operations";

/**
 * ModelProvider - AI model provider abstraction
 */
export { ModelProvider } from "./ai-service/model-provider";

/**
 * ContextBuilder - Task context assembly for AI operations
 */
export { ContextBuilder } from "./context-builder";

/**
 * PromptBuilder - Prompt template management
 */
export { PromptBuilder } from "./prompt-builder";

// ============================================================================
// Utilities
// ============================================================================

/**
 * Stack formatter utility
 */
export { formatStackInfo } from "../utils/stack-formatter";

/**
 * Streaming options builders
 */
export {
  createStreamingOptions,
  createStreamingOptionsWithCustomHandlers,
} from "../utils/streaming-options";

// ============================================================================
// Validation
// ============================================================================

/**
 * Validation utilities
 */
export { isValidAIProvider, runValidations } from "./validation";
