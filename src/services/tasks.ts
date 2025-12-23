import {
  getAIOperations,
  getModelProvider,
  getStorage,
  getContextBuilder,
} from "../utils/ai-service-factory";
import { formatStackInfo } from "../utils/stack-formatter";
import { buildAIConfig, AIOptions } from "../utils/ai-config-builder";
import {
  Task,
  StreamingOptions,
  TaskAIMetadata,
  TaskDocumentation,
  DocumentationDetection,
} from "../types";
import { ProgressCallback } from "../types/callbacks";
import {
  CreateTaskResult,
  EnhanceTaskResult,
  SplitTaskResult,
  PlanTaskResult,
  DocumentTaskResult,
  DeleteTaskResult,
} from "../types/results";
import { hooks } from "../lib/hooks";
import { createMetricsStreamingOptions } from "../utils/streaming-utils";
import { getErrorMessage } from "../utils/error-utils";
import { requireTask } from "../utils/storage-utils";
import { TaskIDGenerator } from "../utils/id-generator";
import {
  TaskOMaticError,
  TaskOMaticErrorCodes,
  formatTaskNotFoundError,
  formatInvalidStatusTransitionError,
  formatStorageError,
  createStandardError,
} from "../utils/task-o-matic-error";
import { createBaseAIMetadata } from "../utils/metadata-utils";

/**
 * Dependencies for TaskService
 */
export interface TaskServiceDependencies {
  storage?: ReturnType<typeof getStorage>;
  aiOperations?: ReturnType<typeof getAIOperations>;
  modelProvider?: ReturnType<typeof getModelProvider>;
  contextBuilder?: ReturnType<typeof getContextBuilder>;
  hooks?: typeof hooks;
}

/**
 * TaskService - Centralized business logic for all task operations
 *
 * This service provides a comprehensive API for task management with AI-powered features.
 * It's framework-agnostic and can be used by CLI, TUI, or Web applications.
 *
 * @example
 * ```typescript
 * import { TaskService } from "task-o-matic";
 *
 * // Initialize with default configuration
 * const taskService = new TaskService();
 *
 * // Create a task with AI enhancement
 * const result = await taskService.createTask({
 *   title: "Implement feature",
 *   content: "Feature description",
 *   aiEnhance: true,
 *   aiOptions: {
 *     provider: "anthropic",
 *     model: "claude-3-5-sonnet"
 *   }
 * });
 *
 * // Or inject dependencies for testing
 * const taskService = new TaskService({
 *   storage: mockStorage,
 *   aiOperations: mockAI,
 * });
 * ```
 */
export class TaskService {
  private storage: ReturnType<typeof getStorage>;
  private aiOperations: ReturnType<typeof getAIOperations>;
  private modelProvider: ReturnType<typeof getModelProvider>;
  private contextBuilder: ReturnType<typeof getContextBuilder>;
  private hooks: typeof hooks;

  /**
   * Create a new TaskService
   *
   * @param dependencies - Optional dependencies to inject (for testing)
   */
  constructor(dependencies: TaskServiceDependencies = {}) {
    // Use injected dependencies or fall back to singletons
    this.storage = dependencies.storage ?? getStorage();
    this.aiOperations = dependencies.aiOperations ?? getAIOperations();
    this.modelProvider = dependencies.modelProvider ?? getModelProvider();
    this.contextBuilder = dependencies.contextBuilder ?? getContextBuilder();
    this.hooks = dependencies.hooks ?? hooks;
  }
  // ============================================================================
  // CORE CRUD OPERATIONS
  // ============================================================================

  /**
   * Creates a new task with optional AI enhancement
   *
   * @param input - Task creation parameters
   * @param input.title - Task title (required, 1-255 characters)
   * @param input.content - Task content/description (optional)
   * @param input.parentId - Parent task ID for creating subtasks
   * @param input.effort - Estimated effort ("small" | "medium" | "large")
   * @param input.aiEnhance - Enable AI enhancement with Context7 documentation
   * @param input.aiOptions - AI configuration override
   * @param input.streamingOptions - Real-time streaming options
   *
   * @returns Promise resolving to task creation result
   *
   * @throws {TaskOMaticError} If task creation fails (e.g., AI operation errors, storage errors)
   * @throws {Error} If input validation fails
   *
   * @example Basic task creation
   * ```typescript
   * const task = await taskService.createTask({
   *   title: "Fix authentication bug",
   *   content: "Users cannot login with valid credentials",
   *   aiEnhance: false
   * });
   * ```
   *
   * @example Task with AI enhancement
   * ```typescript
   * try {
   *   const enhancedTask = await taskService.createTask({
   *     title: "Design authentication system",
   *     content: "Implement OAuth2 + JWT authentication",
   *     aiEnhance: true,
   *     streamingOptions: {
   *       onChunk: (chunk) => console.log("AI:", chunk)
   *     }
   *   });
   *   console.log("Enhanced content:", enhancedTask.task.content);
   * } catch (error) {
   *   if (error instanceof TaskOMaticError) {
   *     console.error("AI enhancement failed:", error.getDetails());
   *   }
   * }
   * ```
   *
   * @example Creating subtasks
   * ```typescript
   * const subtask = await taskService.createTask({
   *   title: "Implement OAuth2 flow",
   *   parentId: "1",
   *   effort: "medium"
   * });
   * ```
   */
  async createTask(input: {
    title: string;
    content?: string;
    parentId?: string;
    effort?: string;
    aiEnhance?: boolean;
    aiOptions?: AIOptions;
    streamingOptions?: StreamingOptions;
  }): Promise<CreateTaskResult> {
    const startTime = Date.now();

    let content = input.content;
    let aiMetadata;

    if (input.aiEnhance) {
      this.hooks.emit("task:progress", {
        message: "Building context for task...",
        type: "progress",
      });

      // Build context with error handling (Bug fix 2.2)
      let context;
      try {
        context = await this.contextBuilder.buildContextForNewTask(
          input.title,
          input.content
        );
      } catch (error) {
        // Log warning but don't fail task creation
        console.warn(
          "Warning: Could not build context:",
          getErrorMessage(error)
        );
        // Continue with empty context
        context = { stack: undefined, existingResearch: {} };
      }

      const stackInfo = formatStackInfo(context.stack);

      const enhancementAIConfig = buildAIConfig(input.aiOptions);

      this.hooks.emit("task:progress", {
        message: "Enhancing task with AI documentation...",
        type: "progress",
      });

      const taskDescription = input.content ?? "";
      // Generate temporary ID for AI operations (Bug fix 2.6)
      const tempTaskId = TaskIDGenerator.generate();
      content = await this.aiOperations.enhanceTaskWithDocumentation(
        tempTaskId,
        input.title,
        taskDescription,
        stackInfo,
        input.streamingOptions,
        undefined,
        enhancementAIConfig,
        context.existingResearch
      );

      const aiConfig = this.modelProvider.getAIConfig();

      aiMetadata = {
        taskId: "",
        aiGenerated: true,
        aiPrompt:
          "Enhance task with relevant documentation using Context7 tools",
        confidence: 0.9,
        aiProvider: aiConfig.provider,
        aiModel: aiConfig.model,
        generatedAt: Date.now(),
      };
    }

    this.hooks.emit("task:progress", {
      message: "Saving task...",
      type: "progress",
    });

    const task = await this.storage.createTask(
      {
        title: input.title,
        description: input.content ?? "",
        content,
        parentId: input.parentId,
        estimatedEffort: input.effort as
          | "small"
          | "medium"
          | "large"
          | undefined,
      },
      aiMetadata
    );

    this.hooks.emit("task:progress", {
      type: "completed",
      message: "Task created successfully",
    });

    // Emit task:created event
    await this.hooks.emit("task:created", { task });

    return { success: true, task, aiMetadata };
  }

  /**
   * List tasks with optional filtering
   *
   * @param filters - Filter criteria
   * @param filters.status - Filter by task status ("todo", "in-progress", "completed")
   * @param filters.tag - Filter by task tag
   *
   * @returns Promise resolving to array of matching tasks
   *
   * @example
   * ```typescript
   * // List all tasks
   * const allTasks = await taskService.listTasks({});
   *
   * // List only completed tasks
   * const completedTasks = await taskService.listTasks({ status: "completed" });
   *
   * // List tasks with specific tag
   * const frontendTasks = await taskService.listTasks({ tag: "frontend" });
   * ```
   */
  async listTasks(filters: { status?: string; tag?: string }): Promise<Task[]> {
    const storage = this.storage;
    const topLevelTasks = await storage.getTopLevelTasks();

    let filteredTasks = topLevelTasks;

    if (filters.status) {
      filteredTasks = filteredTasks.filter(
        (task) => task.status === filters.status
      );
    }

    if (filters.tag) {
      const tagToFilter = filters.tag; // Type narrowing
      filteredTasks = filteredTasks.filter(
        (task) => task.tags && task.tags.includes(tagToFilter)
      );
    }

    return filteredTasks;
  }

  async getTask(id: string): Promise<Task | null> {
    return await this.storage.getTask(id);
  }

  async getTaskContent(id: string): Promise<string | null> {
    return await this.storage.getTaskContent(id);
  }

  async getTaskAIMetadata(id: string): Promise<TaskAIMetadata | null> {
    return await this.storage.getTaskAIMetadata(id);
  }

  async getSubtasks(id: string): Promise<Task[]> {
    return await this.storage.getSubtasks(id);
  }

  async updateTask(
    id: string,
    updates: {
      title?: string;
      description?: string;
      status?: string;
      effort?: string;
      tags?: string | string[];
    }
  ): Promise<Task> {
    const storage = this.storage;
    const existingTask = await storage.getTask(id);

    if (!existingTask) {
      throw formatTaskNotFoundError(id);
    }

    // Validate status transitions
    if (updates.status) {
      const validTransitions: Record<string, string[]> = {
        todo: ["in-progress", "completed"],
        "in-progress": ["completed", "todo"],
        completed: ["todo", "in-progress"],
      };

      if (!validTransitions[existingTask.status].includes(updates.status)) {
        throw formatInvalidStatusTransitionError(
          existingTask.status,
          updates.status
        );
      }
    }

    const finalUpdates: { [key: string]: any } = { ...updates };

    // Handle tags: convert comma-separated string to array and merge
    if (typeof updates.tags === "string") {
      const newTags = updates.tags.split(",").map((tag) => tag.trim());
      const existingTags = existingTask.tags || [];
      finalUpdates.tags = [...new Set([...existingTags, ...newTags])];
    }

    const updatedTask = await storage.updateTask(id, finalUpdates);
    if (!updatedTask) {
      throw formatStorageError(`updateTask ${id}`);
    }

    // Emit task:updated event
    await this.hooks.emit("task:updated", {
      task: updatedTask,
      changes: finalUpdates,
    });

    // Emit task:status-changed event if status changed
    if (updates.status && updates.status !== existingTask.status) {
      await this.hooks.emit("task:status-changed", {
        task: updatedTask,
        oldStatus: existingTask.status,
        newStatus: updates.status,
      });
    }

    return updatedTask;
  }

  async setTaskStatus(id: string, status: string): Promise<Task> {
    return await this.updateTask(id, { status });
  }

  async deleteTask(
    id: string,
    options: { cascade?: boolean; force?: boolean } = {}
  ): Promise<DeleteTaskResult> {
    const { cascade, force } = options;
    const storage = this.storage;
    const taskToDelete = await storage.getTask(id);

    if (!taskToDelete) {
      throw formatTaskNotFoundError(id);
    }

    const deleted: Task[] = [];
    const orphanedSubtasks: Task[] = [];

    // Get subtasks before deletion
    const subtasks = await storage.getSubtasks(id);

    if (subtasks.length > 0 && !cascade) {
      if (!force) {
        throw createStandardError(
          TaskOMaticErrorCodes.TASK_OPERATION_FAILED,
          `Cannot delete task with ${subtasks.length} subtasks`,
          {
            context: `Task ${id} has ${subtasks.length} subtasks`,
            suggestions: [
              "Use --cascade flag to delete task and all subtasks",
              "Use --force flag to delete task and orphan subtasks",
              "Delete subtasks first, then delete parent task",
            ],
            metadata: { taskId: id, subtaskCount: subtasks.length },
          }
        );
      }
      // Orphan subtasks by removing parent reference
      for (const subtask of subtasks) {
        await storage.updateTask(subtask.id, { parentId: undefined });
        orphanedSubtasks.push(subtask);
      }
    } else if (cascade) {
      // Recursively delete subtasks
      for (const subtask of subtasks) {
        const result = await this.deleteTask(subtask.id, {
          cascade: true,
          force: true,
        });
        deleted.push(...result.deleted);
        orphanedSubtasks.push(...result.orphanedSubtasks);
      }
    }

    // Delete the main task
    const success = await storage.deleteTask(id);
    if (success) {
      deleted.push(taskToDelete);
      // Emit task:deleted event
      await this.hooks.emit("task:deleted", { taskId: id });
    }

    return { success: true, deleted, orphanedSubtasks };
  }

  // ============================================================================
  // TAG OPERATIONS
  // ============================================================================

  async addTags(id: string, tags: string[]): Promise<Task> {
    const storage = this.storage;
    const task = await storage.getTask(id);

    if (!task) {
      throw formatTaskNotFoundError(id);
    }

    const existingTags = task.tags || [];
    const newTags = tags.filter((tag) => !existingTags.includes(tag));

    if (newTags.length === 0) {
      return task; // No new tags to add
    }

    const updatedTags = [...existingTags, ...newTags];
    const updatedTask = await storage.updateTask(id, { tags: updatedTags });

    if (!updatedTask) {
      throw formatStorageError(`add tags to task ${id}`);
    }

    return updatedTask;
  }

  async removeTags(id: string, tags: string[]): Promise<Task> {
    const storage = this.storage;
    const task = await storage.getTask(id);

    if (!task) {
      throw formatTaskNotFoundError(id);
    }

    const existingTags = task.tags || [];
    const updatedTags = existingTags.filter((tag) => !tags.includes(tag));

    if (updatedTags.length === existingTags.length) {
      return task; // No tags removed
    }

    const updatedTask = await storage.updateTask(id, { tags: updatedTags });

    if (!updatedTask) {
      throw formatStorageError(`remove tags from task ${id}`);
    }

    return updatedTask;
  }

  // ============================================================================
  // TASK NAVIGATION
  // ============================================================================

  /**
   * Get the next task based on priority and filtering criteria
   *
   * @param filters - Filter and priority criteria
   * @param filters.status - Filter by task status
   * @param filters.tag - Filter by task tag
   * @param filters.effort - Filter by estimated effort
   * @param filters.priority - Priority strategy ("newest", "oldest", "effort", or default)
   *
   * @returns Promise resolving to the highest priority task or null if none found
   *
   * @example
   * ```typescript
   * // Get the next task by default priority (task ID order)
   * const nextTask = await taskService.getNextTask({});
   *
   * // Get the newest task with "todo" status
   * const newestTodo = await taskService.getNextTask({
   *   status: "todo",
   *   priority: "newest"
   * });
   *
   * // Get the highest effort task with specific tag
   * const highEffortTask = await taskService.getNextTask({
   *   tag: "backend",
   *   priority: "effort"
   * });
   * ```
   */
  async getNextTask(filters: {
    status?: string;
    tag?: string;
    effort?: string;
    priority?: string;
  }): Promise<Task | null> {
    const storage = this.storage;
    const allTasks = await storage.getTasks();

    // Filter by status and other criteria
    let filteredTasks = allTasks.filter((task) => {
      if (filters.status && task.status !== filters.status) return false;
      if (filters.tag && (!task.tags || !task.tags.includes(filters.tag)))
        return false;
      if (filters.effort && task.estimatedEffort !== filters.effort)
        return false;
      return true;
    });

    if (filteredTasks.length === 0) return null;

    // Sort based on priority
    switch (filters.priority) {
      case "newest":
        return filteredTasks.sort((a, b) => b.createdAt - a.createdAt)[0];
      case "oldest":
        return filteredTasks.sort((a, b) => a.createdAt - b.createdAt)[0];
      case "effort":
        const effortOrder = { small: 1, medium: 2, large: 3 };
        return filteredTasks.sort(
          (a, b) =>
            (effortOrder[a.estimatedEffort || "medium"] || 2) -
            (effortOrder[b.estimatedEffort || "medium"] || 2)
        )[0];
      default:
        // Default: task ID order (1, 1.1, 1.2, 2, 2.1, etc.)
        return filteredTasks.sort((a, b) => a.id.localeCompare(b.id))[0];
    }
  }

  async getTaskTree(rootId?: string): Promise<Task[]> {
    const storage = this.storage;

    if (rootId) {
      // Return tree starting from specific task
      const rootTask = await storage.getTask(rootId);
      if (!rootTask) {
        throw formatTaskNotFoundError(rootId);
      }

      // Get all subtasks recursively
      const getAllSubtasks = async (task: Task): Promise<Task[]> => {
        const subtasks = await storage.getSubtasks(task.id);
        const allSubtasks: Task[] = [];

        for (const subtask of subtasks) {
          allSubtasks.push(subtask);
          const deeperSubtasks = await getAllSubtasks(subtask);
          allSubtasks.push(...deeperSubtasks);
        }

        return allSubtasks;
      };

      const subtasks = await getAllSubtasks(rootTask);
      return [rootTask, ...subtasks];
    } else {
      // Return all top-level tasks and their subtasks
      return await storage.getTasks();
    }
  }

  // ============================================================================
  // AI OPERATIONS
  // ============================================================================

  /**
   * Enhance a task with AI-generated documentation using Context7
   *
   * Uses AI to enrich the task description with relevant documentation,
   * code examples, and best practices from Context7 documentation sources.
   *
   * @param taskId - ID of the task to enhance
   * @param aiOptions - Optional AI configuration overrides
   * @param streamingOptions - Optional streaming callbacks for real-time feedback
   * @returns Promise resolving to enhancement result with metrics
   *
   * @throws {Error} If task not found
   * @throws {TaskOMaticError} If AI enhancement fails
   *
   * @example Basic enhancement
   * ```typescript
   * const result = await taskService.enhanceTask("1");
   * console.log("Enhanced content:", result.enhancedContent);
   * console.log("Took:", result.stats.duration, "ms");
   * ```
   *
   * @example With streaming
   * ```typescript
   * try {
   *   const result = await taskService.enhanceTask("1", undefined, {
   *     onChunk: (chunk) => process.stdout.write(chunk)
   *   });
   *   console.log("\nEnhancement complete!");
   * } catch (error) {
   *   if (error instanceof TaskOMaticError) {
   *     console.error("Enhancement failed:", error.getDetails());
   *   }
   * }
   * ```
   */
  async enhanceTask(
    taskId: string,
    aiOptions?: AIOptions,
    streamingOptions?: StreamingOptions
  ): Promise<EnhanceTaskResult> {
    const startTime = Date.now();

    this.hooks.emit("task:progress", {
      message: "Starting task enhancement...",
      type: "started",
    });

    const task = await this.storage.getTask(taskId);
    if (!task) {
      throw formatTaskNotFoundError(taskId);
    }

    this.hooks.emit("task:progress", {
      message: "Building context...",
      type: "progress",
    });

    const context = await this.contextBuilder.buildContext(taskId);
    const stackInfo = formatStackInfo(context.stack);

    const enhancementAIConfig = buildAIConfig(aiOptions);

    this.hooks.emit("task:progress", {
      message: "Calling AI for enhancement...",
      type: "progress",
    });

    // Use utility to wrap streaming options and capture metrics (DRY fix 1.1)
    const aiStartTime = Date.now();
    const { options: metricsStreamingOptions, getMetrics } =
      createMetricsStreamingOptions(streamingOptions, aiStartTime);

    const enhancedContent =
      await this.aiOperations.enhanceTaskWithDocumentation(
        task.id,
        task.title,
        task.description ?? "",
        stackInfo,
        metricsStreamingOptions,
        undefined,
        enhancementAIConfig,
        context.existingResearch
      );

    // Extract metrics after AI call
    const { tokenUsage, timeToFirstToken } = getMetrics();

    this.hooks.emit("task:progress", {
      message: "Saving enhanced content...",
      type: "progress",
    });

    const originalLength = task.description?.length || 0;

    if (enhancedContent.length > 200) {
      const contentFile = await this.storage.saveEnhancedTaskContent(
        task.id,
        enhancedContent
      );
      await this.storage.updateTask(task.id, {
        contentFile,
        description:
          task.description +
          "\n\n🤖 AI-enhanced with Context7 documentation available.",
      });
    } else {
      await this.storage.updateTask(task.id, { description: enhancedContent });
    }

    const aiConfig = this.modelProvider.getAIConfig();

    const aiMetadata = {
      taskId: task.id,
      aiGenerated: true,
      aiPrompt: "Enhance task with Context7 documentation using MCP tools",
      confidence: 0.9,
      aiProvider: aiConfig.provider,
      aiModel: aiConfig.model,
      enhancedAt: Date.now(),
    };

    await this.storage.saveTaskAIMetadata(aiMetadata);

    const duration = Date.now() - startTime;

    this.hooks.emit("task:progress", {
      message: "Task enhancement completed",
      type: "completed",
    });

    return {
      success: true,
      task,
      enhancedContent,
      stats: {
        originalLength,
        enhancedLength: enhancedContent.length,
        duration,
        tokenUsage,
        timeToFirstToken,
        cost: undefined, // Cost calculation can be added later
      },
      metadata: {
        aiProvider: aiConfig.provider,
        aiModel: aiConfig.model,
        confidence: 0.9,
      },
    };
  }

  /**
   * Split a task into subtasks using AI
   *
   * Analyzes the task and breaks it down into smaller, actionable subtasks
   * with estimated effort. Can optionally use filesystem tools to understand
   * project structure when creating subtasks.
   *
   * @param taskId - ID of the task to split
   * @param aiOptions - Optional AI configuration overrides
   * @param promptOverride - Optional custom prompt
   * @param messageOverride - Optional custom message
   * @param streamingOptions - Optional streaming callbacks
   * @param enableFilesystemTools - Enable filesystem analysis for context
   * @returns Promise resolving to split result with created subtasks
   *
   * @throws {Error} If task not found or already has subtasks
   * @throws {TaskOMaticError} If AI operation fails
   *
   * @example Basic task splitting
   * ```typescript
   * const result = await taskService.splitTask("1");
   * console.log(`Created ${result.subtasks.length} subtasks`);
   * result.subtasks.forEach(subtask => {
   *   console.log(`- ${subtask.title} (${subtask.estimatedEffort})`);
   * });
   * ```
   *
   * @example With filesystem tools for code analysis
   * ```typescript
   * try {
   *   const result = await taskService.splitTask(
   *     "1",
   *     undefined,
   *     undefined,
   *     undefined,
   *     { onChunk: (chunk) => console.log(chunk) },
   *     true // Enable filesystem tools
   *   );
   *   console.log("AI analyzed codebase to create subtasks");
   * } catch (error) {
   *   if (error instanceof TaskOMaticError) {
   *     console.error("Split failed:", error.suggestions);
   *   }
   * }
   * ```
   */
  async splitTask(
    taskId: string,
    aiOptions?: AIOptions,
    promptOverride?: string,
    messageOverride?: string,
    streamingOptions?: StreamingOptions,
    enableFilesystemTools?: boolean
  ): Promise<SplitTaskResult> {
    const startTime = Date.now();

    this.hooks.emit("task:progress", {
      message: "Starting task breakdown...",
      type: "started",
    });

    const task = await this.storage.getTask(taskId);
    if (!task) {
      throw formatTaskNotFoundError(taskId);
    }

    // Check if task already has subtasks
    const existingSubtasks = await this.storage.getSubtasks(taskId);
    if (existingSubtasks.length > 0) {
      throw createStandardError(
        TaskOMaticErrorCodes.TASK_OPERATION_FAILED,
        `Task already has ${existingSubtasks.length} subtasks`,
        {
          context: `Task "${task.title}" (${taskId}) already has subtasks`,
          suggestions: [
            "Use existing subtasks instead of splitting again",
            "Delete existing subtasks first if you want to re-split",
            "Consider editing existing subtasks instead",
          ],
          metadata: { taskId, subtaskCount: existingSubtasks.length },
        }
      );
    }

    this.hooks.emit("task:progress", {
      message: "Building context...",
      type: "progress",
    });

    // Build comprehensive context
    const context = await this.contextBuilder.buildContext(taskId);
    const stackInfo = formatStackInfo(context.stack);

    // Get full task content
    const fullContent = context.task.fullContent || task.description || "";

    const breakdownAIConfig = buildAIConfig(aiOptions);

    this.hooks.emit("task:progress", {
      message: "Calling AI to break down task...",
      type: "progress",
    });

    // Use utility to wrap streaming options and capture metrics (DRY fix 1.1)
    const aiStartTime = Date.now();
    const { options: metricsStreamingOptions, getMetrics } =
      createMetricsStreamingOptions(streamingOptions, aiStartTime);

    // Use AI service to break down the task with enhanced context
    const subtaskData = await this.aiOperations.breakdownTask(
      task,
      breakdownAIConfig,
      promptOverride,
      messageOverride,
      metricsStreamingOptions,
      undefined,
      fullContent,
      stackInfo,
      existingSubtasks,
      enableFilesystemTools
    );

    // Extract metrics after AI call
    const { tokenUsage, timeToFirstToken } = getMetrics();

    this.hooks.emit("task:progress", {
      message: `Creating ${subtaskData.length} subtasks...`,
      type: "progress",
    });

    // Create subtasks and save AI metadata for each (Bug fix 2.3)
    const createdSubtasks = [];
    const aiConfig = this.modelProvider.getAIConfig();
    const splitTimestamp = Date.now();

    for (let i = 0; i < subtaskData.length; i++) {
      const subtask = subtaskData[i];

      this.hooks.emit("task:progress", {
        message: `Creating subtask ${i + 1}/${subtaskData.length}: ${
          subtask.title
        }`,
        type: "progress",
      });

      // console.log(
      //   `[DEBUG] Creating subtask ${i + 1}:`,
      //   JSON.stringify(subtask, null, 2)
      // );

      try {
        const result = await this.createTask({
          title: subtask.title,
          content: subtask.content,
          effort: subtask.estimatedEffort,
          parentId: taskId,
        });
        createdSubtasks.push(result.task);

        // Save AI metadata for each subtask (Bug fix 2.3)
        const subtaskMetadata = {
          ...createBaseAIMetadata(
            result.task.id,
            aiConfig,
            promptOverride,
            "Split task into meaningful subtasks with full context and existing subtask awareness",
            0.9
          ),
          splitAt: splitTimestamp,
          parentTaskId: taskId,
          subtaskIndex: i + 1,
        };
        await getStorage().saveTaskAIMetadata(subtaskMetadata);
      } catch (err) {
        console.error(`[DEBUG] Failed to create subtask ${i + 1}:`, err);
        throw err;
      }
    }

    // Save AI metadata for parent task as well
    const parentMetadata = {
      ...createBaseAIMetadata(
        task.id,
        aiConfig,
        promptOverride,
        "Split task into meaningful subtasks with full context and existing subtask awareness",
        0.9
      ),
      splitAt: splitTimestamp,
      subtasksCreated: createdSubtasks.length,
    };
    await getStorage().saveTaskAIMetadata(parentMetadata);

    const duration = Date.now() - startTime;

    this.hooks.emit("task:progress", {
      message: `Task split into ${createdSubtasks.length} subtasks`,
      type: "completed",
    });

    return {
      success: true,
      task,
      subtasks: createdSubtasks,
      stats: {
        subtasksCreated: createdSubtasks.length,
        duration,
        tokenUsage,
        timeToFirstToken,
        cost: undefined, // Cost calculation can be added later
      },
      metadata: {
        aiProvider: aiConfig.provider,
        aiModel: aiConfig.model,
        confidence: 0.9,
      },
    };
  }

  /**
   * Analyze and fetch documentation for a task using Context7
   *
   * Analyzes the task content to identify required libraries and documentation,
   * then fetches relevant documentation from Context7. Caches documentation
   * for future use.
   *
   * @param taskId - ID of the task to document
   * @param force - Force re-fetch even if documentation exists
   * @param aiOptions - Optional AI configuration overrides
   * @param streamingOptions - Optional streaming callbacks
   * @returns Promise resolving to documentation analysis result
   *
   * @throws {Error} If task not found or content is empty
   * @throws {TaskOMaticError} If AI operation fails
   *
   * @example Analyze documentation needs
   * ```typescript
   * const result = await taskService.documentTask("1");
   * if (result.documentation) {
   *   console.log("Documentation fetched:");
   *   console.log(result.documentation.recap);
   *   console.log("Libraries:", result.documentation.libraries);
   * }
   * ```
   *
   * @example Force refresh documentation
   * ```typescript
   * try {
   *   const result = await taskService.documentTask("1", true);
   *   console.log(`Analyzed ${result.analysis.libraries.length} libraries`);
   * } catch (error) {
   *   if (error instanceof TaskOMaticError) {
   *     console.error("Documentation fetch failed:", error.getDetails());
   *   }
   * }
   * ```
   */
  async documentTask(
    taskId: string,
    force: boolean = false,
    aiOptions?: AIOptions,
    streamingOptions?: StreamingOptions
  ): Promise<DocumentTaskResult> {
    const startTime = Date.now();

    this.hooks.emit("task:progress", {
      message: "Analyzing documentation needs...",
      type: "started",
    });

    const task = await this.storage.getTask(taskId);
    if (!task) {
      throw formatTaskNotFoundError(taskId);
    }

    if (task.documentation && !force) {
      if (this.contextBuilder.isDocumentationFresh(task.documentation)) {
        this.hooks.emit("task:progress", {
          message: "Documentation is fresh, skipping analysis",
          type: "info",
        });

        return {
          success: true,
          task,
          documentation: task.documentation,
          stats: {
            duration: Date.now() - startTime,
          },
        };
      }
    }

    this.hooks.emit("task:progress", {
      message: "Building context...",
      type: "progress",
    });

    const context = await this.contextBuilder.buildContext(taskId);
    const stackInfo = formatStackInfo(context.stack);

    const analysisAIConfig = buildAIConfig(aiOptions);

    // Get full task content
    const fullContent = context.task.fullContent || task.description;

    if (!fullContent) {
      throw createStandardError(
        TaskOMaticErrorCodes.INVALID_INPUT,
        "Task content is empty",
        {
          context: `Task ${taskId} has no content to enhance`,
          suggestions: [
            "Add content to the task before enhancing",
            "Provide task description or details",
          ],
          metadata: { taskId },
        }
      );
    }

    // Get existing documentations from all tasks
    const tasks = await this.storage.getTasks();
    const documentations = tasks.map((task) => task.documentation);

    this.hooks.emit("task:progress", {
      message: "Calling AI to analyze documentation needs...",
      type: "progress",
    });

    // First analyze what documentation is needed
    const analysis = await this.aiOperations.analyzeDocumentationNeeds(
      task.id,
      task.title,
      fullContent,
      stackInfo,
      streamingOptions,
      undefined,
      analysisAIConfig,
      documentations
    );

    let documentation: TaskDocumentation | undefined;

    if (analysis.libraries.length > 0) {
      this.hooks.emit("task:progress", {
        message: `Fetching documentation for ${analysis.libraries.length} libraries...`,
        type: "progress",
      });

      // Build research object from actual libraries
      const research: Record<
        string,
        Array<{ query: string; doc: string }>
      > = {};
      for (const lib of analysis.libraries) {
        const sanitizedLibrary = this.storage.sanitizeForFilename(lib.name);
        const sanitizedQuery = this.storage.sanitizeForFilename(
          lib.searchQuery
        );
        const docFile = `docs/${sanitizedLibrary}/${sanitizedQuery}.md`;

        if (!research[lib.name]) {
          research[lib.name] = [];
        }
        research[lib.name].push({
          query: lib.searchQuery,
          doc: docFile,
        });
      }

      this.hooks.emit("task:progress", {
        message: "Generating documentation recap...",
        type: "progress",
      });

      const recap = await this.aiOperations.generateDocumentationRecap(
        analysis.libraries,
        analysis.toolResults?.map((tr) => ({
          library: tr.toolName,
          content: JSON.stringify(tr.output),
        })) || [],
        streamingOptions
      );

      documentation = {
        lastFetched: Date.now(),
        libraries: analysis.libraries.map(
          (lib: { context7Id: string }) => lib.context7Id
        ),
        recap,
        files: analysis.files || [],
        research,
      };

      this.hooks.emit("task:progress", {
        message: "Saving documentation...",
        type: "progress",
      });

      await this.storage.updateTask(taskId, { documentation });
    }

    const duration = Date.now() - startTime;

    this.hooks.emit("task:progress", {
      message: "Documentation analysis completed",
      type: "completed",
    });

    return {
      success: true,
      task,
      analysis,
      documentation,
      stats: {
        duration,
      },
    };
  }

  /**
   * Generate an implementation plan for a task using AI
   *
   * Creates a detailed implementation plan with steps, considerations,
   * and technical approach. Uses filesystem and Context7 tools to understand
   * the project context and provide relevant suggestions.
   *
   * @param taskId - ID of the task to plan
   * @param aiOptions - Optional AI configuration overrides
   * @param streamingOptions - Optional streaming callbacks
   * @returns Promise resolving to plan result with generated plan text
   *
   * @throws {Error} If task not found
   * @throws {TaskOMaticError} If AI operation fails
   *
   * @example Basic implementation planning
   * ```typescript
   * const result = await taskService.planTask("1");
   * console.log("Implementation Plan:");
   * console.log(result.plan);
   * console.log(`Generated in ${result.stats.duration}ms`);
   * ```
   *
   * @example With streaming for real-time plan generation
   * ```typescript
   * try {
   *   const result = await taskService.planTask("1", undefined, {
   *     onChunk: (chunk) => {
   *       // Display plan as it's generated
   *       process.stdout.write(chunk);
   *     }
   *   });
   *   console.log("\n\nPlan saved to:", `plans/${result.task.id}.md`);
   * } catch (error) {
   *   if (error instanceof TaskOMaticError) {
   *     console.error("Planning failed:", error.getDetails());
   *   }
   * }
   * ```
   */
  async planTask(
    taskId: string,
    aiOptions?: AIOptions,
    streamingOptions?: StreamingOptions
  ): Promise<PlanTaskResult> {
    const startTime = Date.now();

    this.hooks.emit("task:progress", {
      message: "Creating implementation plan...",
      type: "started",
    });

    const task = await this.storage.getTask(taskId);
    if (!task) {
      throw formatTaskNotFoundError(taskId);
    }

    const aiService = this.aiOperations;
    const planAIConfig = buildAIConfig(aiOptions);

    this.hooks.emit("task:progress", {
      message: "Building task context...",
      type: "progress",
    });

    // Build task context and details
    let taskContext = `Task ID: ${task.id}\nTitle: ${task.title}\n`;
    let taskDetails = `Description: ${task.description || "No description"}\n`;

    // If this is a subtask, include parent task context
    if (task.parentId) {
      const parentTask = await getStorage().getTask(task.parentId);
      if (parentTask) {
        taskContext += `Parent Task ID: ${parentTask.id}\nParent Task Title: ${parentTask.title}\n`;
        taskDetails += `Parent Task Description: ${
          parentTask.description || "No description"
        }\n`;
      }
    }

    // If this is a task with subtasks, get subtask details
    const subtasks = await getStorage().getSubtasks(taskId);
    if (subtasks.length > 0) {
      taskDetails += `\nSubtasks:\n`;
      subtasks.forEach((subtask, index) => {
        taskDetails += `${index + 1}. ${subtask.title} (${subtask.id})\n`;
        taskDetails += `   ${subtask.description || "No description"}\n\n`;
      });
    }

    this.hooks.emit("task:progress", {
      message: "Calling AI to create plan...",
      type: "progress",
    });

    // Use utility to wrap streaming options and capture metrics (DRY fix 1.1)
    const aiStartTime = Date.now();
    const { options: metricsStreamingOptions, getMetrics } =
      createMetricsStreamingOptions(streamingOptions, aiStartTime);

    const plan = await aiService.planTask(
      taskContext,
      taskDetails,
      planAIConfig,
      undefined,
      undefined,
      metricsStreamingOptions
    );

    // Extract metrics after AI call
    const { tokenUsage, timeToFirstToken } = getMetrics();

    this.hooks.emit("task:progress", {
      message: "Saving plan...",
      type: "progress",
    });

    // Save the plan to storage
    await this.storage.savePlan(taskId, plan);

    const duration = Date.now() - startTime;

    this.hooks.emit("task:progress", {
      message: "Implementation plan created",
      type: "completed",
    });

    const aiConfig = this.modelProvider.getAIConfig();

    return {
      success: true,
      task,
      plan,
      stats: {
        duration,
        tokenUsage,
        timeToFirstToken,
        cost: undefined, // Cost calculation can be added later
      },
      metadata: {
        aiProvider: aiConfig.provider,
        aiModel: aiConfig.model,
      },
    };
  }

  // ============================================================================
  // DOCUMENTATION OPERATIONS
  // ============================================================================

  async getTaskDocumentation(taskId: string): Promise<string | null> {
    return this.storage.getTaskDocumentation(taskId);
  }

  async addTaskDocumentationFromFile(
    taskId: string,
    filePath: string
  ): Promise<{ filePath: string; task: Task }> {
    const task = await this.getTask(taskId);
    if (!task) {
      throw formatTaskNotFoundError(taskId);
    }

    try {
      const { readFileSync, existsSync } = await import("fs");
      const { resolve } = await import("path");

      const resolvedPath = resolve(filePath);
      if (!existsSync(resolvedPath)) {
        throw createStandardError(
          TaskOMaticErrorCodes.STORAGE_ERROR,
          `Documentation file not found: ${filePath}`,
          {
            context: `Tried to load documentation from ${resolvedPath}`,
            suggestions: [
              "Check that the file path is correct",
              "Ensure the file exists",
              "Use an absolute path or path relative to current directory",
            ],
            metadata: { filePath, resolvedPath },
          }
        );
      }

      const content = readFileSync(resolvedPath, "utf-8");
      const savedPath = await this.storage.saveTaskDocumentation(
        taskId,
        content
      );

      return {
        filePath: savedPath,
        task,
      };
    } catch (error) {
      // Re-throw if already a TaskOMaticError
      if (error instanceof TaskOMaticError) {
        throw error;
      }
      // Wrap other errors
      throw formatStorageError(
        "saveTaskDocumentation",
        error instanceof Error ? error : undefined
      );
    }
  }

  async setTaskPlan(
    taskId: string,
    planText?: string,
    planFilePath?: string
  ): Promise<{ planFile: string; task: Task }> {
    const task = await this.getTask(taskId);
    if (!task) {
      throw formatTaskNotFoundError(taskId);
    }

    let plan: string;

    if (planFilePath) {
      try {
        const { readFileSync, existsSync } = await import("fs");
        const { resolve } = await import("path");

        const resolvedPath = resolve(planFilePath);
        if (!existsSync(resolvedPath)) {
          throw createStandardError(
            TaskOMaticErrorCodes.STORAGE_ERROR,
            `Plan file not found: ${planFilePath}`,
            {
              context: `Tried to load plan from ${resolvedPath}`,
              suggestions: [
                "Check that the file path is correct",
                "Ensure the file exists",
                "Use an absolute path or path relative to current directory",
              ],
              metadata: { planFilePath, resolvedPath },
            }
          );
        }

        plan = readFileSync(resolvedPath, "utf-8");
      } catch (error) {
        // Re-throw if already a TaskOMaticError
        if (error instanceof TaskOMaticError) {
          throw error;
        }
        // Wrap other errors
        throw formatStorageError(
          "readFileSync",
          error instanceof Error ? error : undefined
        );
      }
    } else if (planText) {
      plan = planText;
    } else {
      throw createStandardError(
        TaskOMaticErrorCodes.INVALID_INPUT,
        "Either planText or planFilePath must be provided",
        {
          context:
            "setTaskPlan requires either planText or planFilePath parameter",
          suggestions: [
            "Provide planText parameter with the plan content",
            "Provide planFilePath parameter with path to plan file",
          ],
          metadata: { taskId },
        }
      );
    }

    await this.storage.savePlan(taskId, plan);
    const planFile = `plans/${taskId}.md`;

    return {
      planFile,
      task,
    };
  }

  // ============================================================================
  // PLAN OPERATIONS
  // ============================================================================

  async getTaskPlan(
    taskId: string
  ): Promise<{ plan: string; createdAt: number; updatedAt: number } | null> {
    return this.storage.getPlan(taskId);
  }

  async listTaskPlans(): Promise<
    Array<{
      taskId: string;
      plan: string;
      createdAt: number;
      updatedAt: number;
    }>
  > {
    return this.storage.listPlans();
  }

  async deleteTaskPlan(taskId: string): Promise<boolean> {
    return this.storage.deletePlan(taskId);
  }
}

// Lazy singleton instance - only created when first accessed
let taskServiceInstance: TaskService | undefined;

export function getTaskService(): TaskService {
  if (!taskServiceInstance) {
    taskServiceInstance = new TaskService();
  }
  return taskServiceInstance;
}

// Backward compatibility: export as const but use getter
export const taskService = new Proxy({} as TaskService, {
  get(target, prop) {
    return (getTaskService() as any)[prop];
  },
});
