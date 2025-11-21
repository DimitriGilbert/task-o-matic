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

export interface BenchmarkRun {
  id: string;
  timestamp: number;
  command: string; // e.g. "prd-parse"
  input: any;
  config: BenchmarkConfig;
  results: BenchmarkResult[];
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
