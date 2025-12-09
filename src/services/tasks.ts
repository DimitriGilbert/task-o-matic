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

/**
 * TaskService - Centralized business logic for all task operations
 * This service is framework-agnostic and can be used by CLI, TUI, or Web
 */
export class TaskService {
  // ============================================================================
  // CORE CRUD OPERATIONS
  // ============================================================================

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
      hooks.emit("task:progress", {
        message: "Building context for task...",
        type: "progress",
      });

      // Build context with error handling (Bug fix 2.2)
      let context;
      try {
        context = await getContextBuilder().buildContextForNewTask(
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

      hooks.emit("task:progress", {
        message: "Enhancing task with AI documentation...",
        type: "progress",
      });

      const taskDescription = input.content ?? "";
      // Generate temporary ID for AI operations (Bug fix 2.6)
      const tempTaskId = TaskIDGenerator.generate();
      content = await getAIOperations().enhanceTaskWithDocumentation(
        tempTaskId,
        input.title,
        taskDescription,
        stackInfo,
        input.streamingOptions,
        undefined,
        enhancementAIConfig,
        context.existingResearch
      );

      const aiConfig = getModelProvider().getAIConfig();

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

    hooks.emit("task:progress", {
      message: "Saving task...",
      type: "progress",
    });

    const task = await getStorage().createTask(
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

    hooks.emit("task:progress", {
      type: "completed",
      message: "Task created successfully",
    });

    // Emit task:created event
    await hooks.emit("task:created", { task });

    return { success: true, task, aiMetadata };
  }

  async listTasks(filters: { status?: string; tag?: string }): Promise<Task[]> {
    const storage = getStorage();
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
    return await getStorage().getTask(id);
  }

  async getTaskContent(id: string): Promise<string | null> {
    return await getStorage().getTaskContent(id);
  }

  async getTaskAIMetadata(id: string): Promise<any | null> {
    return await getStorage().getTaskAIMetadata(id);
  }

  async getSubtasks(id: string): Promise<Task[]> {
    return await getStorage().getSubtasks(id);
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
    const storage = getStorage();
    const existingTask = await storage.getTask(id);

    if (!existingTask) {
      throw new Error(`Task with ID ${id} not found`);
    }

    // Validate status transitions
    if (updates.status) {
      const validTransitions: Record<string, string[]> = {
        todo: ["in-progress", "completed"],
        "in-progress": ["completed", "todo"],
        completed: ["todo", "in-progress"],
      };

      if (!validTransitions[existingTask.status].includes(updates.status)) {
        throw new Error(
          `Invalid status transition from ${existingTask.status} to ${updates.status}`
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
      throw new Error(`Failed to update task ${id}`);
    }

    // Emit task:updated event
    await hooks.emit("task:updated", {
      task: updatedTask,
      changes: finalUpdates,
    });

    // Emit task:status-changed event if status changed
    if (updates.status && updates.status !== existingTask.status) {
      await hooks.emit("task:status-changed", {
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
    const storage = getStorage();
    const taskToDelete = await storage.getTask(id);

    if (!taskToDelete) {
      throw new Error(`Task with ID ${id} not found`);
    }

    const deleted: Task[] = [];
    const orphanedSubtasks: Task[] = [];

    // Get subtasks before deletion
    const subtasks = await storage.getSubtasks(id);

    if (subtasks.length > 0 && !cascade) {
      if (!force) {
        throw new Error(
          `Task has ${subtasks.length} subtasks. Use cascade to delete them or force to orphan them`
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
      await hooks.emit("task:deleted", { taskId: id });
    }

    return { success: true, deleted, orphanedSubtasks };
  }

  // ============================================================================
  // TAG OPERATIONS
  // ============================================================================

  async addTags(id: string, tags: string[]): Promise<Task> {
    const storage = getStorage();
    const task = await storage.getTask(id);

    if (!task) {
      throw new Error(`Task with ID ${id} not found`);
    }

    const existingTags = task.tags || [];
    const newTags = tags.filter((tag) => !existingTags.includes(tag));

    if (newTags.length === 0) {
      return task; // No new tags to add
    }

    const updatedTags = [...existingTags, ...newTags];
    const updatedTask = await storage.updateTask(id, { tags: updatedTags });

    if (!updatedTask) {
      throw new Error(`Failed to add tags to task ${id}`);
    }

    return updatedTask;
  }

  async removeTags(id: string, tags: string[]): Promise<Task> {
    const storage = getStorage();
    const task = await storage.getTask(id);

    if (!task) {
      throw new Error(`Task with ID ${id} not found`);
    }

    const existingTags = task.tags || [];
    const updatedTags = existingTags.filter((tag) => !tags.includes(tag));

    if (updatedTags.length === existingTags.length) {
      return task; // No tags removed
    }

    const updatedTask = await storage.updateTask(id, { tags: updatedTags });

    if (!updatedTask) {
      throw new Error(`Failed to remove tags from task ${id}`);
    }

    return updatedTask;
  }

  // ============================================================================
  // TASK NAVIGATION
  // ============================================================================

  async getNextTask(filters: {
    status?: string;
    tag?: string;
    effort?: string;
    priority?: string;
  }): Promise<Task | null> {
    const storage = getStorage();
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
    const storage = getStorage();

    if (rootId) {
      // Return tree starting from specific task
      const rootTask = await storage.getTask(rootId);
      if (!rootTask) {
        throw new Error(`Task with ID ${rootId} not found`);
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

  async enhanceTask(
    taskId: string,
    aiOptions?: AIOptions,
    streamingOptions?: StreamingOptions
  ): Promise<EnhanceTaskResult> {
    const startTime = Date.now();

    hooks.emit("task:progress", {
      message: "Starting task enhancement...",
      type: "started",
    });

    const task = await getStorage().getTask(taskId);
    if (!task) {
      throw new Error(`Task with ID ${taskId} not found`);
    }

    hooks.emit("task:progress", {
      message: "Building context...",
      type: "progress",
    });

    const context = await getContextBuilder().buildContext(taskId);
    const stackInfo = formatStackInfo(context.stack);

    const enhancementAIConfig = buildAIConfig(aiOptions);

    hooks.emit("task:progress", {
      message: "Calling AI for enhancement...",
      type: "progress",
    });

    // Use utility to wrap streaming options and capture metrics (DRY fix 1.1)
    const aiStartTime = Date.now();
    const { options: metricsStreamingOptions, getMetrics } =
      createMetricsStreamingOptions(streamingOptions, aiStartTime);

    const enhancedContent =
      await getAIOperations().enhanceTaskWithDocumentation(
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

    hooks.emit("task:progress", {
      message: "Saving enhanced content...",
      type: "progress",
    });

    const originalLength = task.description?.length || 0;

    if (enhancedContent.length > 200) {
      const contentFile = await getStorage().saveEnhancedTaskContent(
        task.id,
        enhancedContent
      );
      await getStorage().updateTask(task.id, {
        contentFile,
        description:
          task.description +
          "\n\n🤖 AI-enhanced with Context7 documentation available.",
      });
    } else {
      await getStorage().updateTask(task.id, { description: enhancedContent });
    }

    const aiConfig = getModelProvider().getAIConfig();

    const aiMetadata = {
      taskId: task.id,
      aiGenerated: true,
      aiPrompt: "Enhance task with Context7 documentation using MCP tools",
      confidence: 0.9,
      aiProvider: aiConfig.provider,
      aiModel: aiConfig.model,
      enhancedAt: Date.now(),
    };

    await getStorage().saveTaskAIMetadata(aiMetadata);

    const duration = Date.now() - startTime;

    hooks.emit("task:progress", {
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

  async splitTask(
    taskId: string,
    aiOptions?: AIOptions,
    promptOverride?: string,
    messageOverride?: string,
    streamingOptions?: StreamingOptions,
    enableFilesystemTools?: boolean
  ): Promise<SplitTaskResult> {
    const startTime = Date.now();

    hooks.emit("task:progress", {
      message: "Starting task breakdown...",
      type: "started",
    });

    const task = await getStorage().getTask(taskId);
    if (!task) {
      throw new Error(`Task with ID ${taskId} not found`);
    }

    // Check if task already has subtasks
    const existingSubtasks = await getStorage().getSubtasks(taskId);
    if (existingSubtasks.length > 0) {
      throw new Error(
        `Task ${task.title} already has ${existingSubtasks.length} subtasks. Use existing subtasks or delete them first.`
      );
    }

    hooks.emit("task:progress", {
      message: "Building context...",
      type: "progress",
    });

    // Build comprehensive context
    const context = await getContextBuilder().buildContext(taskId);
    const stackInfo = formatStackInfo(context.stack);

    // Get full task content
    const fullContent = context.task.fullContent || task.description || "";

    const breakdownAIConfig = buildAIConfig(aiOptions);

    hooks.emit("task:progress", {
      message: "Calling AI to break down task...",
      type: "progress",
    });

    // Use utility to wrap streaming options and capture metrics (DRY fix 1.1)
    const aiStartTime = Date.now();
    const { options: metricsStreamingOptions, getMetrics } =
      createMetricsStreamingOptions(streamingOptions, aiStartTime);

    // Use AI service to break down the task with enhanced context
    const subtaskData = await getAIOperations().breakdownTask(
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

    hooks.emit("task:progress", {
      message: `Creating ${subtaskData.length} subtasks...`,
      type: "progress",
    });

    // Create subtasks and save AI metadata for each (Bug fix 2.3)
    const createdSubtasks = [];
    const aiConfig = getModelProvider().getAIConfig();
    const splitTimestamp = Date.now();

    for (let i = 0; i < subtaskData.length; i++) {
      const subtask = subtaskData[i];

      hooks.emit("task:progress", {
        message: `Creating subtask ${i + 1}/${subtaskData.length}: ${
          subtask.title
        }`,
        type: "progress",
      });

      const result = await this.createTask({
        title: subtask.title,
        content: subtask.content,
        effort: subtask.estimatedEffort,
        parentId: taskId,
      });
      createdSubtasks.push(result.task);

      // Save AI metadata for each subtask (Bug fix 2.3)
      const subtaskMetadata = {
        taskId: result.task.id,
        aiGenerated: true,
        aiPrompt:
          promptOverride ||
          "Split task into meaningful subtasks with full context and existing subtask awareness",
        confidence: 0.9,
        aiProvider: aiConfig.provider,
        aiModel: aiConfig.model,
        splitAt: splitTimestamp,
        parentTaskId: taskId,
        subtaskIndex: i + 1,
      };
      await getStorage().saveTaskAIMetadata(subtaskMetadata);
    }

    // Save AI metadata for parent task as well
    const parentMetadata = {
      taskId: task.id,
      aiGenerated: true,
      aiPrompt:
        promptOverride ||
        "Split task into meaningful subtasks with full context and existing subtask awareness",
      confidence: 0.9,
      aiProvider: aiConfig.provider,
      aiModel: aiConfig.model,
      splitAt: splitTimestamp,
      subtasksCreated: createdSubtasks.length,
    };
    await getStorage().saveTaskAIMetadata(parentMetadata);

    const duration = Date.now() - startTime;

    hooks.emit("task:progress", {
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

  async documentTask(
    taskId: string,
    force: boolean = false,
    aiOptions?: AIOptions,
    streamingOptions?: StreamingOptions
  ): Promise<DocumentTaskResult> {
    const startTime = Date.now();

    hooks.emit("task:progress", {
      message: "Analyzing documentation needs...",
      type: "started",
    });

    const task = await getStorage().getTask(taskId);
    if (!task) {
      throw new Error(`Task with ID ${taskId} not found`);
    }

    if (task.documentation && !force) {
      if (getContextBuilder().isDocumentationFresh(task.documentation)) {
        hooks.emit("task:progress", {
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

    hooks.emit("task:progress", {
      message: "Building context...",
      type: "progress",
    });

    const context = await getContextBuilder().buildContext(taskId);
    const stackInfo = formatStackInfo(context.stack);

    const analysisAIConfig = buildAIConfig(aiOptions);

    // Get full task content
    const fullContent = context.task.fullContent || task.description;

    if (!fullContent) {
      throw new Error("Task content is empty");
    }

    // Get existing documentations from all tasks
    const tasks = await getStorage().getTasks();
    const documentations = tasks.map((task) => task.documentation);

    hooks.emit("task:progress", {
      message: "Calling AI to analyze documentation needs...",
      type: "progress",
    });

    // First analyze what documentation is needed
    const analysis = await getAIOperations().analyzeDocumentationNeeds(
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
      hooks.emit("task:progress", {
        message: `Fetching documentation for ${analysis.libraries.length} libraries...`,
        type: "progress",
      });

      // Build research object from actual libraries
      const research: Record<
        string,
        Array<{ query: string; doc: string }>
      > = {};
      for (const lib of analysis.libraries) {
        const sanitizedLibrary = getStorage().sanitizeForFilename(lib.name);
        const sanitizedQuery = getStorage().sanitizeForFilename(
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

      hooks.emit("task:progress", {
        message: "Generating documentation recap...",
        type: "progress",
      });

      const recap = await getAIOperations().generateDocumentationRecap(
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

      hooks.emit("task:progress", {
        message: "Saving documentation...",
        type: "progress",
      });

      await getStorage().updateTask(taskId, { documentation });
    }

    const duration = Date.now() - startTime;

    hooks.emit("task:progress", {
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

  async planTask(
    taskId: string,
    aiOptions?: AIOptions,
    streamingOptions?: StreamingOptions
  ): Promise<PlanTaskResult> {
    const startTime = Date.now();

    hooks.emit("task:progress", {
      message: "Creating implementation plan...",
      type: "started",
    });

    const task = await getStorage().getTask(taskId);
    if (!task) {
      throw new Error(`Task with ID ${taskId} not found`);
    }

    const aiService = getAIOperations();
    const planAIConfig = buildAIConfig(aiOptions);

    hooks.emit("task:progress", {
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

    hooks.emit("task:progress", {
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

    hooks.emit("task:progress", {
      message: "Saving plan...",
      type: "progress",
    });

    // Save the plan to storage
    await getStorage().savePlan(taskId, plan);

    const duration = Date.now() - startTime;

    hooks.emit("task:progress", {
      message: "Implementation plan created",
      type: "completed",
    });

    const aiConfig = getModelProvider().getAIConfig();

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
    return getStorage().getTaskDocumentation(taskId);
  }

  async addTaskDocumentationFromFile(
    taskId: string,
    filePath: string
  ): Promise<{ filePath: string; task: Task }> {
    const task = await this.getTask(taskId);
    if (!task) {
      throw new Error(`Task with ID ${taskId} not found`);
    }

    try {
      const { readFileSync, existsSync } = await import("fs");
      const { resolve } = await import("path");

      const resolvedPath = resolve(filePath);
      if (!existsSync(resolvedPath)) {
        throw new Error(`Documentation file not found: ${filePath}`);
      }

      const content = readFileSync(resolvedPath, "utf-8");
      const savedPath = await getStorage().saveTaskDocumentation(
        taskId,
        content
      );

      return {
        filePath: savedPath,
        task,
      };
    } catch (error) {
      // Use utility for error message extraction (DRY fix 1.3)
      throw new Error(
        `Failed to add documentation from file: ${getErrorMessage(error)}`
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
      throw new Error(`Task with ID ${taskId} not found`);
    }

    let plan: string;

    if (planFilePath) {
      try {
        const { readFileSync, existsSync } = await import("fs");
        const { resolve } = await import("path");

        const resolvedPath = resolve(planFilePath);
        if (!existsSync(resolvedPath)) {
          throw new Error(`Plan file not found: ${planFilePath}`);
        }

        plan = readFileSync(resolvedPath, "utf-8");
      } catch (error) {
        // Use utility for error message extraction (DRY fix 1.3)
        throw new Error(`Failed to read plan file: ${getErrorMessage(error)}`);
      }
    } else if (planText) {
      plan = planText;
    } else {
      throw new Error("Either planText or planFilePath must be provided");
    }

    await getStorage().savePlan(taskId, plan);
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
    return getStorage().getPlan(taskId);
  }

  async listTaskPlans(): Promise<
    Array<{
      taskId: string;
      plan: string;
      createdAt: number;
      updatedAt: number;
    }>
  > {
    return getStorage().listPlans();
  }

  async deleteTaskPlan(taskId: string): Promise<boolean> {
    return getStorage().deletePlan(taskId);
  }
}

// Export singleton instance
export const taskService = new TaskService();
