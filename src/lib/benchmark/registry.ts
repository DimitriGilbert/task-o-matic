import { BenchmarkableOperation, WorkflowBenchmarkInput } from "./types";
import { prdService } from "../../services/prd";
import { TaskService } from "../../services/tasks"; // We'll need to instantiate this or use a singleton if available
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
    // Note: TaskService is a class, we need an instance.
    // In a real app we should use dependency injection or a singleton.
    // For now, we'll create a new instance or assume one is available.
    const taskService = new TaskService();

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
  }
}

export const benchmarkRegistry = new BenchmarkRegistry();
