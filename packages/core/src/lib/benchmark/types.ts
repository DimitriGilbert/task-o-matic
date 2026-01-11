import { AIOptions } from "../../utils/ai-config-builder";

export interface BenchmarkModelConfig {
  provider: string;
  model: string;
  reasoningTokens?: number;
}

export interface BenchmarkConfig {
  models: BenchmarkModelConfig[];
  concurrency: number;
  delay: number; // ms
}

export interface BenchmarkProgressEvent {
  type: "start" | "progress" | "complete" | "error";
  modelId: string;
  duration?: number;
  error?: string;
  currentSize?: number; // bytes
  currentBps?: number;
  chunk?: string;
}

import { StreamingOptions } from "../../types";
import { WorkflowAutomationOptions } from "../../types/workflow-options";
import { Task } from "../../types";

export interface BenchmarkResult {
  modelId: string; // provider:model[:reasoning]
  output: any;
  duration: number;
  error?: string;
  timestamp: number;
  tokenUsage?: {
    prompt: number;
    completion: number;
    total: number;
  };
  responseSize?: number; // bytes
  bps?: number; // bytes per second
  tps?: number; // tokens per second (output)
  timeToFirstToken?: number; // ms
  cost?: number; // estimated cost in USD
}

export interface WorkflowBenchmarkResult extends BenchmarkResult {
  output: {
    projectDir?: string;
    prdFile?: string;
    prdContent?: string;
    tasks: Task[];
    stats: {
      initDuration?: number;
      prdGenerationDuration?: number;
      prdRefinementDuration?: number;
      taskGenerationDuration?: number;
      taskSplittingDuration?: number;
      totalTasks: number;
      tasksWithSubtasks: number;
      avgTaskComplexity?: number;
      prdSize?: number; // characters
      totalSteps: number;
      successfulSteps: number;
    };
  };
}

export interface BenchmarkRun {
  id: string;
  timestamp: number;
  command: string; // e.g. "prd-parse"
  input: any;
  config: BenchmarkConfig;
  results: BenchmarkResult[];
}

export interface WorkflowBenchmarkInput {
  // Collected user responses for consistent execution across models
  collectedResponses: {
    projectName: string;
    initMethod: "quick" | "custom" | "ai";
    projectDescription?: string;
    stackConfig?: {
      frontend?: string;
      backend?: string;
      database?: string;
      auth?: boolean;
    };
    prdMethod: "upload" | "manual" | "ai" | "skip";
    prdContent?: string;
    prdDescription?: string;
    prdFile?: string;
    refinePrd?: boolean;
    refineFeedback?: string;
    generateTasks?: boolean;
    customInstructions?: string;
    splitTasks?: boolean;
    tasksToSplit?: string[];
    splitInstructions?: string;
  };
  
  // Original workflow automation options
  workflowOptions: WorkflowAutomationOptions;
  
  // Benchmark-specific settings
  projectDir?: string;
  tempDirBase?: string; // Base directory for temporary project directories
}

export interface BenchmarkableOperation {
  id: string;
  name: string;
  description: string;
  execute: (
    input: any,
    aiOptions: AIOptions,
    streamingOptions?: StreamingOptions
  ) => Promise<any>;
  validateInput: (input: any) => boolean;
}
