import {
  createStandardError,
  TaskOMaticErrorCodes,
} from "../utils/task-o-matic-error";
import {
  readFileSync,
  existsSync,
  copyFileSync,
  writeFileSync,
  mkdirSync,
} from "fs";
import { join, basename, relative } from "path";
import { getAIOperations, getStorage } from "../utils/ai-service-factory";
import { buildAIConfig, AIOptions } from "../utils/ai-config-builder";
import { AIConfig, StreamingOptions } from "../types";
import { PRDParseResult } from "../types/results";
import { configManager, setupWorkingDirectory } from "../lib/config";
import { isValidAIProvider } from "../lib/validation";
import { ProgressCallback } from "../types/callbacks";
import { createMetricsStreamingOptions } from "../utils/streaming-utils";
import { validateFileExists, savePRDFile } from "../utils/file-utils";

/**
 * Dependencies for PRDService
 */
export interface PRDServiceDependencies {
  storage?: ReturnType<typeof getStorage>;
  aiOperations?: ReturnType<typeof getAIOperations>;
}

/**
 * PRDService - Business logic for PRD operations
 * Handles PRD parsing, task extraction, and PRD improvement
 */
export class PRDService {
  private storage: ReturnType<typeof getStorage>;
  private aiOperations: ReturnType<typeof getAIOperations>;

  /**
   * Create a new PRDService
   *
   * @param dependencies - Optional dependencies to inject (for testing)
   */
  constructor(dependencies: PRDServiceDependencies = {}) {
    // Use injected dependencies or fall back to singletons
    this.storage = dependencies.storage ?? getStorage();
    this.aiOperations = dependencies.aiOperations ?? getAIOperations();
  }
  async parsePRD(input: {
    file: string;
    workingDirectory?: string; // Working directory passed from CLI layer
    enableFilesystemTools?: boolean;
    aiOptions?: AIOptions;
    promptOverride?: string;
    messageOverride?: string;
    streamingOptions?: StreamingOptions;
    callbacks?: ProgressCallback;
  }): Promise<PRDParseResult> {
    const startTime = Date.now();
    const steps: Array<{
      step: string;
      status: "completed" | "failed";
      duration: number;
      details?: any;
    }> = [];

    input.callbacks?.onProgress?.({
      type: "started",
      message: "Starting PRD parsing...",
    });

    // Validate file exists (DRY fix 1.2)
    validateFileExists(input.file, `PRD file not found: ${input.file}`);

    // Ensure we're in a task-o-matic project
    const taskOMaticDir = configManager.getTaskOMaticDir();
    if (!existsSync(taskOMaticDir)) {
      throw createStandardError(
        TaskOMaticErrorCodes.CONFIGURATION_ERROR,
        "Not a task-o-matic project. Run 'task-o-matic init init' first.",
        {
          suggestions: ["Run `task-o-matic init init` in your project root."],
        }
      );
    }

    // Set working directory and reload config (DRY fix 1.4)
    const workingDir = input.workingDirectory || process.cwd();
    await setupWorkingDirectory(workingDir);

    input.callbacks?.onProgress?.({
      type: "progress",
      message: "Reading PRD file...",
    });

    const prdContent = readFileSync(input.file, "utf-8");

    // Save PRD file to .task-o-matic/prd directory
    input.callbacks?.onProgress?.({
      type: "progress",
      message: "Saving PRD to project directory...",
    });

    const stepStart1 = Date.now();
    const prdDir = join(taskOMaticDir, "prd");
    const prdFileName = basename(input.file);
    const savedPrdPath = join(prdDir, prdFileName);

    // Ensure PRD directory exists
    if (!existsSync(prdDir)) {
      mkdirSync(prdDir, { recursive: true });
    }

    // Copy PRD file to project directory
    copyFileSync(input.file, savedPrdPath);

    // Get relative path from .task-o-matic directory for storage
    const relativePrdPath = relative(taskOMaticDir, savedPrdPath);

    steps.push({
      step: "Save PRD File",
      status: "completed",
      duration: Date.now() - stepStart1,
    });

    // Validate AI provider if specified
    if (
      input.aiOptions?.aiProvider &&
      !isValidAIProvider(input.aiOptions.aiProvider)
    ) {
      throw createStandardError(
        TaskOMaticErrorCodes.AI_CONFIGURATION_ERROR,
        `Invalid AI provider: ${input.aiOptions.aiProvider}`,
        {
          suggestions: ["Use a valid AI provider, e.g., 'openai', 'anthropic'"],
        }
      );
    }

    const aiConfig = buildAIConfig(input.aiOptions);

    input.callbacks?.onProgress?.({
      type: "progress",
      message: "Parsing PRD with AI...",
    });

    const stepStart2 = Date.now();

    // Use utility to wrap streaming options and capture metrics (DRY fix 1.1)
    const { options: metricsStreamingOptions, getMetrics } =
      createMetricsStreamingOptions(input.streamingOptions, stepStart2);

    const result = await this.aiOperations.parsePRD(
      prdContent,
      aiConfig,
      input.promptOverride,
      input.messageOverride,
      metricsStreamingOptions,
      undefined, // retryConfig
      workingDir, // Pass working directory to AI operations
      input.enableFilesystemTools
    );

    // Extract metrics after AI call
    const { tokenUsage, timeToFirstToken } = getMetrics();

    steps.push({
      step: "AI Parsing",
      status: "completed",
      duration: Date.now() - stepStart2,
      details: { tasksFound: result.tasks.length },
    });

    input.callbacks?.onProgress?.({
      type: "progress",
      message: `Creating ${result.tasks.length} tasks...`,
    });

    // Create tasks
    const stepStart3 = Date.now();
    const createdTasks = [];

    for (let i = 0; i < result.tasks.length; i++) {
      const task = result.tasks[i];

      input.callbacks?.onProgress?.({
        type: "progress",
        message: `Creating task ${i + 1}/${result.tasks.length}: ${task.title}`,
        current: i + 1,
        total: result.tasks.length,
      });

      const createdTask = await this.storage.createTask({
        id: task.id, // Preserve AI-generated ID for dependencies
        title: task.title,
        description: task.description,
        content: task.content,
        estimatedEffort: task.estimatedEffort,
        status: "todo",
        dependencies: task.dependencies,
        tags: task.tags,
        prdFile: relativePrdPath, // Reference to the PRD file
      });

      createdTasks.push(createdTask);

      // Update AI metadata with the actual task ID
      const aiMetadata = {
        taskId: createdTask.id,
        aiGenerated: true,
        aiPrompt: input.promptOverride || "Parse PRD and extract tasks",
        confidence: result.confidence,
        aiProvider: input.aiOptions?.aiProvider,
        aiModel: input.aiOptions?.aiModel,
        generatedAt: Date.now(),
      };

      await this.storage.saveTaskAIMetadata(aiMetadata);
    }

    steps.push({
      step: "Create Tasks",
      status: "completed",
      duration: Date.now() - stepStart3,
      details: { count: createdTasks.length },
    });

    input.callbacks?.onProgress?.({
      type: "completed",
      message: `Successfully created ${createdTasks.length} tasks from PRD`,
    });

    const duration = Date.now() - startTime;

    // Calculate cost if token usage is available
    let cost: number | undefined;
    if (tokenUsage) {
      // Cost calculation would depend on the model
      // For now, we'll leave it undefined and can add pricing later
      // This matches the benchmark pattern where cost calculation is done elsewhere
    }

    return {
      success: true,
      prd: {
        overview: result.summary || "",
        objectives: [],
        features: [],
      },
      tasks: createdTasks,
      stats: {
        tasksCreated: createdTasks.length,
        duration,
        aiProvider: input.aiOptions?.aiProvider || "default",
        aiModel: input.aiOptions?.aiModel || "default",
        tokenUsage,
        timeToFirstToken,
        cost,
      },
      steps,
    };
  }

  async generateQuestions(input: {
    file: string;
    workingDirectory?: string;
    enableFilesystemTools?: boolean;
    aiOptions?: AIOptions;
    promptOverride?: string;
    messageOverride?: string;
    streamingOptions?: StreamingOptions;
    callbacks?: ProgressCallback;
  }): Promise<string[]> {
    input.callbacks?.onProgress?.({
      type: "started",
      message: "Generating clarifying questions...",
    });

    // Validate file exists (DRY fix 1.2)
    validateFileExists(input.file, `PRD file not found: ${input.file}`);

    // Set working directory and reload config (DRY fix 1.4)
    const workingDir = input.workingDirectory || process.cwd();
    await setupWorkingDirectory(workingDir);

    input.callbacks?.onProgress?.({
      type: "progress",
      message: "Reading PRD file...",
    });

    const prdContent = readFileSync(input.file, "utf-8");

    if (
      input.aiOptions?.aiProvider &&
      !isValidAIProvider(input.aiOptions.aiProvider)
    ) {
      throw createStandardError(
        TaskOMaticErrorCodes.AI_CONFIGURATION_ERROR,
        `Invalid AI provider: ${input.aiOptions.aiProvider}`,
        {
          suggestions: ["Use a valid AI provider, e.g., 'openai', 'anthropic'"],
        }
      );
    }

    const aiConfig = buildAIConfig(input.aiOptions);

    input.callbacks?.onProgress?.({
      type: "progress",
      message: "Analyzing PRD with AI...",
    });

    const questions = await this.aiOperations.generatePRDQuestions(
      prdContent,
      aiConfig,
      input.promptOverride,
      input.messageOverride,
      input.streamingOptions,
      undefined,
      workingDir,
      input.enableFilesystemTools
    );

    input.callbacks?.onProgress?.({
      type: "completed",
      message: `Generated ${questions.length} questions`,
    });

    return questions;
  }

  async reworkPRD(input: {
    file: string;
    feedback: string;
    output?: string;
    workingDirectory?: string; // Working directory passed from CLI layer
    enableFilesystemTools?: boolean;
    aiOptions?: AIOptions;
    promptOverride?: string;
    messageOverride?: string;
    streamingOptions?: StreamingOptions;
    callbacks?: ProgressCallback;
  }): Promise<string> {
    input.callbacks?.onProgress?.({
      type: "started",
      message: "Starting PRD improvement...",
    });

    // Validate file exists (DRY fix 1.2)
    validateFileExists(input.file, `PRD file not found: ${input.file}`);

    // Set working directory and reload config (DRY fix 1.4)
    const workingDir = input.workingDirectory || process.cwd();
    await setupWorkingDirectory(workingDir);

    input.callbacks?.onProgress?.({
      type: "progress",
      message: "Reading PRD file...",
    });

    const prdContent = readFileSync(input.file, "utf-8");

    // Validate AI provider if specified
    if (
      input.aiOptions?.aiProvider &&
      !isValidAIProvider(input.aiOptions.aiProvider)
    ) {
      throw createStandardError(
        TaskOMaticErrorCodes.AI_CONFIGURATION_ERROR,
        `Invalid AI provider: ${input.aiOptions.aiProvider}`,
        {
          suggestions: ["Use a valid AI provider, e.g., 'openai', 'anthropic'"],
        }
      );
    }

    const aiConfig = buildAIConfig(input.aiOptions);

    input.callbacks?.onProgress?.({
      type: "progress",
      message: "Calling AI to improve PRD...",
    });

    const improvedPRD = await this.aiOperations.reworkPRD(
      prdContent,
      input.feedback,
      aiConfig,
      input.promptOverride,
      input.messageOverride,
      input.streamingOptions,
      undefined, // retryConfig
      workingDir, // Pass working directory to AI operations
      input.enableFilesystemTools
    );

    input.callbacks?.onProgress?.({
      type: "progress",
      message: "Saving improved PRD...",
    });

    const outputPath = input.output || input.file;
    writeFileSync(outputPath, improvedPRD);

    input.callbacks?.onProgress?.({
      type: "completed",
      message: `PRD improved and saved to ${outputPath}`,
    });

    return outputPath;
  }

  async refinePRDWithQuestions(input: {
    file: string;
    questionMode: "user" | "ai";
    answers?: Record<string, string>; // Pre-provided answers (user mode)
    questionAIOptions?: AIOptions; // Optional override for answering (defaults to main AI)
    workingDirectory?: string;
    enableFilesystemTools?: boolean;
    aiOptions?: AIOptions; // Main AI config
    streamingOptions?: StreamingOptions;
    callbacks?: ProgressCallback;
  }): Promise<{
    questions: string[];
    answers: Record<string, string>;
    refinedPRDPath: string;
  }> {
    input.callbacks?.onProgress?.({
      type: "started",
      message: "Starting PRD question/refine process...",
    });

    // Step 1: Generate questions
    input.callbacks?.onProgress?.({
      type: "progress",
      message: "Generating clarifying questions...",
    });

    const questions = await this.generateQuestions({
      file: input.file,
      workingDirectory: input.workingDirectory,
      enableFilesystemTools: input.enableFilesystemTools,
      aiOptions: input.aiOptions,
      streamingOptions: input.streamingOptions,
      callbacks: input.callbacks,
    });

    if (questions.length === 0) {
      input.callbacks?.onProgress?.({
        type: "completed",
        message: "No questions generated - PRD appears complete",
      });

      return {
        questions: [],
        answers: {},
        refinedPRDPath: input.file,
      };
    }

    // Step 2: Get stack info for context
    const workingDir = input.workingDirectory || process.cwd();
    const PromptBuilder = (await import("../lib/prompt-builder")).PromptBuilder;
    let stackInfo = "";
    try {
      stackInfo = await PromptBuilder.detectStackInfo(workingDir);
      if (stackInfo === "Not detected") {
        stackInfo = "";
      }
    } catch (error) {
      // Stack info not available
    }

    // Step 3: Get answers
    let answers: Record<string, string>;

    if (input.questionMode === "user") {
      // User mode: return questions for CLI to prompt user
      // Answers should be provided in input.answers
      if (!input.answers || Object.keys(input.answers).length === 0) {
        throw createStandardError(
          TaskOMaticErrorCodes.INVALID_INPUT,
          "User mode selected but no answers provided. CLI layer should collect answers."
        );
      }
      answers = input.answers;
    } else {
      // AI mode: use AI to answer questions with context
      input.callbacks?.onProgress?.({
        type: "progress",
        message: "AI is answering questions...",
      });

      const prdContent = readFileSync(input.file, "utf-8");

      // Use questionAIOptions if provided, otherwise use main aiOptions
      const answeringAIConfig = buildAIConfig(
        input.questionAIOptions || input.aiOptions
      );

      answers = await this.aiOperations.answerPRDQuestions(
        prdContent,
        questions,
        answeringAIConfig,
        {
          stackInfo,
        },
        input.streamingOptions
      );
    }

    // Step 4: Format questions + answers as structured feedback
    let feedback =
      "Please incorporate the following clarifications into the PRD:\n\n";
    questions.forEach((q, i) => {
      feedback += `Q${i + 1}: ${q}\nA: ${
        answers[q] || "No answer provided"
      }\n\n`;
    });

    // Step 5: Automatically call reworkPRD with formatted feedback
    input.callbacks?.onProgress?.({
      type: "progress",
      message: "Refining PRD with answers...",
    });

    const refinedPRDPath = await this.reworkPRD({
      file: input.file,
      feedback,
      workingDirectory: input.workingDirectory,
      enableFilesystemTools: input.enableFilesystemTools,
      aiOptions: input.aiOptions,
      streamingOptions: input.streamingOptions,
      callbacks: input.callbacks,
    });

    input.callbacks?.onProgress?.({
      type: "completed",
      message: `PRD refined with ${questions.length} questions answered`,
    });

    return {
      questions,
      answers,
      refinedPRDPath,
    };
  }

  async generatePRD(input: {
    description: string;
    outputDir?: string;
    filename?: string;
    aiOptions?: AIOptions;
    streamingOptions?: StreamingOptions;
    callbacks?: ProgressCallback;
  }): Promise<{
    path: string;
    content: string;
    stats: {
      duration: number;
      tokenUsage?: { prompt: number; completion: number; total: number };
      timeToFirstToken?: number;
      cost?: number;
    };
  }> {
    const startTime = Date.now();

    input.callbacks?.onProgress?.({
      type: "started",
      message: "Generating PRD...",
    });

    // Use utility to wrap streaming options and capture metrics
    const { options: metricsStreamingOptions, getMetrics } =
      createMetricsStreamingOptions(input.streamingOptions, startTime);

    const aiConfig = buildAIConfig(input.aiOptions);

    const content = await this.aiOperations.generatePRD(
      input.description,
      aiConfig,
      undefined,
      undefined,
      metricsStreamingOptions
    );

    // Get metrics after AI operation
    const { tokenUsage, timeToFirstToken } = getMetrics();

    // Calculate cost if needed
    let cost: number | undefined;
    if (tokenUsage && tokenUsage.total > 0) {
      cost = tokenUsage.total * 0.000001; // Placeholder cost calculation
    }

    // Save file using utility
    const path = savePRDFile(content, input.filename, input.outputDir);

    input.callbacks?.onProgress?.({
      type: "completed",
      message: `PRD generated and saved to ${path}`,
    });

    return {
      path,
      content,
      stats: {
        duration: Date.now() - startTime,
        tokenUsage,
        timeToFirstToken,
        cost,
      },
    };
  }

  async combinePRDs(input: {
    prds: string[];
    originalDescription: string;
    outputDir?: string;
    filename?: string;
    aiOptions?: AIOptions;
    streamingOptions?: StreamingOptions;
    callbacks?: ProgressCallback;
  }): Promise<{
    path: string;
    content: string;
    stats: {
      duration: number;
      tokenUsage?: { prompt: number; completion: number; total: number };
      timeToFirstToken?: number;
      cost?: number;
    };
  }> {
    const startTime = Date.now();

    input.callbacks?.onProgress?.({
      type: "started",
      message: "Combining PRDs...",
    });

    // Use utility to wrap streaming options and capture metrics
    const { options: metricsStreamingOptions, getMetrics } =
      createMetricsStreamingOptions(input.streamingOptions, startTime);

    const aiConfig = buildAIConfig(input.aiOptions);

    const content = await this.aiOperations.combinePRDs(
      input.prds,
      input.originalDescription,
      aiConfig,
      undefined,
      undefined,
      metricsStreamingOptions
    );

    // Get metrics after AI operation
    const { tokenUsage, timeToFirstToken } = getMetrics();

    // Calculate cost if needed
    let cost: number | undefined;
    if (tokenUsage && tokenUsage.total > 0) {
      cost = tokenUsage.total * 0.000001;
    }

    // Save file using utility (defaults to "prd.md" if no filename, so we provide the default for combinePRDs)
    const path = savePRDFile(
      content,
      input.filename || "prd-master.md",
      input.outputDir
    );

    input.callbacks?.onProgress?.({
      type: "completed",
      message: `Master PRD saved to ${path}`,
    });

    return {
      path,
      content,
      stats: {
        duration: Date.now() - startTime,
        tokenUsage,
        timeToFirstToken,
        cost,
      },
    };
  }
}

// Lazy singleton instance - only created when first accessed
let prdServiceInstance: PRDService | undefined;

export function getPRDService(): PRDService {
  if (!prdServiceInstance) {
    prdServiceInstance = new PRDService();
  }
  return prdServiceInstance;
}

// Backward compatibility: export as const but use getter
export const prdService = new Proxy({} as PRDService, {
  get(target, prop) {
    return (getPRDService() as any)[prop];
  },
});
