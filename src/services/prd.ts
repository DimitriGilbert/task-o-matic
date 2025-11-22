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
import { configManager } from "../lib/config";
import { isValidAIProvider } from "../lib/validation";
import { ProgressCallback } from "../types/callbacks";

/**
 * PRDService - Business logic for PRD operations
 * Handles PRD parsing, task extraction, and PRD improvement
 */
export class PRDService {
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

    // Validate file exists
    if (!existsSync(input.file)) {
      throw new Error(`PRD file not found: ${input.file}`);
    }

    // Ensure we're in a task-o-matic project
    const taskOMaticDir = configManager.getTaskOMaticDir();
    if (!existsSync(taskOMaticDir)) {
      throw new Error(
        `Not a task-o-matic project. Run 'task-o-matic init init' first.`
      );
    }

    // Set working directory from CLI layer (defaults to process.cwd() for backward compatibility)
    const workingDir = input.workingDirectory || process.cwd();
    configManager.setWorkingDirectory(workingDir);

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
      throw new Error(`Invalid AI provider: ${input.aiOptions.aiProvider}`);
    }

    const aiConfig = buildAIConfig(input.aiOptions);

    input.callbacks?.onProgress?.({
      type: "progress",
      message: "Parsing PRD with AI...",
    });

    const stepStart2 = Date.now();

    // Capture metrics
    let tokenUsage:
      | { prompt: number; completion: number; total: number }
      | undefined;
    let timeToFirstToken: number | undefined;

    // Wrap streaming options to capture metrics
    const metricsStreamingOptions: StreamingOptions = {
      ...input.streamingOptions,
      onFinish: async (result: any) => {
        if (result.usage) {
          tokenUsage = {
            prompt: result.usage.inputTokens || result.usage.promptTokens || 0,
            completion:
              result.usage.outputTokens || result.usage.completionTokens || 0,
            total: result.usage.totalTokens || 0,
          };
        }
        // Call original onFinish if provided
        await input.streamingOptions?.onFinish?.(result);
      },
      onChunk: (chunk: string) => {
        if (chunk && !timeToFirstToken) {
          timeToFirstToken = Date.now() - stepStart2;
        }
        // Call original onChunk if provided
        input.streamingOptions?.onChunk?.(chunk);
      },
    };

    const result = await getAIOperations().parsePRD(
      prdContent,
      aiConfig,
      input.promptOverride,
      input.messageOverride,
      metricsStreamingOptions,
      undefined, // retryConfig
      workingDir, // Pass working directory to AI operations
      input.enableFilesystemTools
    );

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

      const createdTask = await getStorage().createTask({
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

      await getStorage().saveTaskAIMetadata(aiMetadata);
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

    if (!existsSync(input.file)) {
      throw new Error(`PRD file not found: ${input.file}`);
    }

    const workingDir = input.workingDirectory || process.cwd();
    configManager.setWorkingDirectory(workingDir);

    input.callbacks?.onProgress?.({
      type: "progress",
      message: "Reading PRD file...",
    });

    const prdContent = readFileSync(input.file, "utf-8");

    if (
      input.aiOptions?.aiProvider &&
      !isValidAIProvider(input.aiOptions.aiProvider)
    ) {
      throw new Error(`Invalid AI provider: ${input.aiOptions.aiProvider}`);
    }

    const aiConfig = buildAIConfig(input.aiOptions);

    input.callbacks?.onProgress?.({
      type: "progress",
      message: "Analyzing PRD with AI...",
    });

    const questions = await getAIOperations().generatePRDQuestions(
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

    // Validate file exists
    if (!existsSync(input.file)) {
      throw new Error(`PRD file not found: ${input.file}`);
    }

    // Set working directory from CLI layer (defaults to process.cwd() for backward compatibility)
    const workingDir = input.workingDirectory || process.cwd();
    configManager.setWorkingDirectory(workingDir);

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
      throw new Error(`Invalid AI provider: ${input.aiOptions.aiProvider}`);
    }

    const aiConfig = buildAIConfig(input.aiOptions);

    input.callbacks?.onProgress?.({
      type: "progress",
      message: "Calling AI to improve PRD...",
    });

    const improvedPRD = await getAIOperations().reworkPRD(
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
        throw new Error(
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

      answers = await getAIOperations().answerPRDQuestions(
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
}

// Export singleton instance
export const prdService = new PRDService();
