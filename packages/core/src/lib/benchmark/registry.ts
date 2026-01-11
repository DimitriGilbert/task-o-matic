import { BenchmarkableOperation, WorkflowBenchmarkInput } from "./types";
import { prdService } from "../../services/prd";
import { taskService } from "../../services/tasks";
import { workflowBenchmarkService } from "../../services/workflow-benchmark";
import { AIOptions } from "../../utils/ai-config-builder";
import { StreamingOptions } from "../../types";

export class BenchmarkRegistry {
  private operations: Map<string, BenchmarkableOperation> = new Map();

  constructor() {
    this.registerDefaults();
  }

  register(op: BenchmarkableOperation) {
    this.operations.set(op.id, op);
  }

  get(id: string): BenchmarkableOperation | undefined {
    return this.operations.get(id);
  }

  list(): BenchmarkableOperation[] {
    return Array.from(this.operations.values());
  }

  private registerDefaults() {
    // PRD Parsing Adapter
    this.register({
      id: "prd-parse",
      name: "PRD Parsing",
      description: "Parse a PRD file into tasks",
      validateInput: (input: any) =>
        typeof input.file === "string" && input.file.length > 0,
      execute: async (
        input: any,
        aiOptions: AIOptions,
        streamingOptions?: StreamingOptions
      ) => {
        return await prdService.parsePRD({
          file: input.file,
          workingDirectory: input.workingDirectory,
          enableFilesystemTools: input.tools,
          promptOverride: input.prompt,
          messageOverride: input.message,
          aiOptions,
          streamingOptions,
          callbacks: {},
        });
      },
    });

    // PRD Rework Adapter
    this.register({
      id: "prd-rework",
      name: "PRD Rework",
      description: "Rework a PRD based on feedback",
      validateInput: (input: any) =>
        typeof input.file === "string" && typeof input.feedback === "string",
      execute: async (
        input: any,
        aiOptions: AIOptions,
        streamingOptions?: StreamingOptions
      ) => {
        return await prdService.reworkPRD({
          file: input.file,
          feedback: input.feedback,
          workingDirectory: input.workingDirectory,
          enableFilesystemTools: input.tools,
          promptOverride: input.prompt,
          messageOverride: input.message,
          aiOptions,
          streamingOptions,
          callbacks: {},
        });
      },
    });

    // Task Breakdown Adapter
    this.register({
      id: "task-breakdown",
      name: "Task Breakdown",
      description: "Break down a task into subtasks",
      validateInput: (input: any) => typeof input.taskId === "string",
      execute: async (
        input: any,
        aiOptions: AIOptions,
        streamingOptions?: StreamingOptions
      ) => {
        return await taskService.splitTask(
          input.taskId,
          aiOptions,
          input.prompt,
          input.message,
          streamingOptions, // streaming options
          input.tools
        );
      },
    });

    // Workflow Full Execution
    this.register({
      id: "workflow-full",
      name: "Complete Workflow",
      description: "Execute the complete workflow: initialization, PRD creation, task generation, and splitting",
      validateInput: (input: any) => workflowBenchmarkService.validateInput(input),
      execute: async (
        input: WorkflowBenchmarkInput,
        aiOptions: AIOptions,
        streamingOptions?: StreamingOptions
      ) => {
        return await workflowBenchmarkService.executeWorkflow(
          input,
          aiOptions,
          streamingOptions
        );
      },
    });

    // Task Create with AI Enhancement
    this.register({
      id: "task-create",
      name: "Task Creation (AI-Enhanced)",
      description: "Create a new task with AI enhancement using Context7 documentation",
      validateInput: (input: any) =>
        typeof input.title === "string" && input.title.length > 0,
      execute: async (
        input: any,
        aiOptions: AIOptions,
        streamingOptions?: StreamingOptions
      ) => {
        return await taskService.createTask({
          title: input.title,
          content: input.content,
          parentId: input.parentId,
          effort: input.effort,
          aiEnhance: true, // Always use AI enhancement for benchmarking
          aiOptions,
          streamingOptions,
        });
      },
    });

    // Task Enhancement
    this.register({
      id: "task-enhance",
      name: "Task Enhancement",
      description: "Enhance an existing task with AI using Context7 documentation",
      validateInput: (input: any) => typeof input.taskId === "string",
      execute: async (
        input: any,
        aiOptions: AIOptions,
        streamingOptions?: StreamingOptions
      ) => {
        return await taskService.enhanceTask(
          input.taskId,
          aiOptions,
          streamingOptions
        );
      },
    });

    // Task Planning
    this.register({
      id: "task-plan",
      name: "Task Planning",
      description: "Create a detailed implementation plan for a task",
      validateInput: (input: any) => typeof input.taskId === "string",
      execute: async (
        input: any,
        aiOptions: AIOptions,
        streamingOptions?: StreamingOptions
      ) => {
        return await taskService.planTask(
          input.taskId,
          aiOptions,
          streamingOptions
        );
      },
    });

    // Task Documentation
    this.register({
      id: "task-document",
      name: "Task Documentation",
      description: "Analyze and generate documentation for a task",
      validateInput: (input: any) => typeof input.taskId === "string",
      execute: async (
        input: any,
        aiOptions: AIOptions,
        streamingOptions?: StreamingOptions
      ) => {
        return await taskService.documentTask(
          input.taskId,
          input.force || false,
          aiOptions,
          streamingOptions
        );
      },
    });

    // PRD Creation
    this.register({
      id: "prd-create",
      name: "PRD Creation",
      description: "Generate a Product Requirements Document from a description",
      validateInput: (input: any) =>
        typeof input.description === "string" && input.description.length > 0,
      execute: async (
        input: any,
        aiOptions: AIOptions,
        streamingOptions?: StreamingOptions
      ) => {
        return await prdService.generatePRD({
          description: input.description,
          outputDir: input.outputDir,
          filename: input.filename,
          aiOptions,
          streamingOptions,
          callbacks: {},
        });
      },
    });

    // PRD Combine
    this.register({
      id: "prd-combine",
      name: "PRD Combination",
      description: "Combine multiple PRD files into a single master PRD",
      validateInput: (input: any) =>
        Array.isArray(input.prds) &&
        input.prds.length > 0 &&
        typeof input.originalDescription === "string",
      execute: async (
        input: any,
        aiOptions: AIOptions,
        streamingOptions?: StreamingOptions
      ) => {
        return await prdService.combinePRDs({
          prds: input.prds,
          originalDescription: input.originalDescription,
          outputDir: input.outputDir,
          filename: input.filename,
          aiOptions,
          streamingOptions,
          callbacks: {},
        });
      },
    });

    // PRD Question Generation
    this.register({
      id: "prd-question",
      name: "PRD Question Generation",
      description: "Generate clarifying questions for a PRD",
      validateInput: (input: any) =>
        typeof input.file === "string" && input.file.length > 0,
      execute: async (
        input: any,
        aiOptions: AIOptions,
        streamingOptions?: StreamingOptions
      ) => {
        return await prdService.generateQuestions({
          file: input.file,
          workingDirectory: input.workingDirectory,
          enableFilesystemTools: input.tools,
          promptOverride: input.prompt,
          messageOverride: input.message,
          aiOptions,
          streamingOptions,
          callbacks: {},
        });
      },
    });

    // PRD Refinement
    this.register({
      id: "prd-refine",
      name: "PRD Refinement",
      description: "Refine a PRD by generating questions and incorporating answers",
      validateInput: (input: any) =>
        typeof input.file === "string" &&
        input.file.length > 0 &&
        typeof input.questionMode === "string" &&
        (input.questionMode === "user" || input.questionMode === "ai"),
      execute: async (
        input: any,
        aiOptions: AIOptions,
        streamingOptions?: StreamingOptions
      ) => {
        return await prdService.refinePRDWithQuestions({
          file: input.file,
          questionMode: input.questionMode,
          answers: input.answers,
          questionAIOptions: input.questionAIOptions,
          workingDirectory: input.workingDirectory,
          enableFilesystemTools: input.tools,
          aiOptions,
          streamingOptions,
          callbacks: {},
        });
      },
    });
  }
}

export const benchmarkRegistry = new BenchmarkRegistry();
