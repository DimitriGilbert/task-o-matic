/**
 * Benchmark Type System - Phase 2
 *
 * Complete type definitions for the new worktree-based benchmark system.
 * These types support parallel execution, persistent worktrees, and
 * comprehensive metrics collection.
 */

import type { Worktree } from "./worktree-manager";
import type { WorkflowAutomationOptions } from "../../types/workflow-options";
import type { ExecuteLoopOptions } from "../../types";

// ============================================================================
// Model Configuration
// ============================================================================

/**
 * Configuration for a model to be benchmarked
 */
export interface BenchmarkModelConfig {
  /** Provider name (e.g., "openai", "anthropic") */
  provider: string;
  /** Model name (e.g., "gpt-4o", "claude-sonnet-4") */
  model: string;
  /** Optional reasoning tokens for models that support extended thinking */
  reasoningTokens?: number;
}

// ============================================================================
// Run Configuration
// ============================================================================

/**
 * Configuration for a benchmark run
 */
export interface BenchmarkRunConfig {
  /** Models to benchmark */
  models: BenchmarkModelConfig[];
  /** Maximum concurrent worktrees (0 = unlimited) */
  concurrency: number;
  /** Base commit to create worktrees from (defaults to HEAD) */
  baseCommit?: string;
  /** Always true for persistent mode - keep worktrees after run */
  keepWorktrees: boolean;
}

// ============================================================================
// Operation Types
// ============================================================================

/**
 * Types of benchmark operations supported
 */
export type BenchmarkOperationType =
  | "operation" // Registered operations (prd-parse, task-breakdown, etc.)
  | "execution" // Single task execution
  | "execute-loop" // Batch task execution
  | "workflow"; // Full workflow benchmark

// ============================================================================
// Benchmark Inputs (per operation type)
// ============================================================================

/**
 * Input for registered operation benchmarks
 */
export interface OperationBenchmarkInput {
  /** ID of the registered operation (e.g., "prd-parse") */
  operationId: string;
  /** Parameters to pass to the operation */
  params: Record<string, unknown>;
}

/**
 * Input for single task execution benchmarks
 */
export interface ExecutionBenchmarkInput {
  /** ID of the task to execute */
  taskId: string;
  /** Commands to verify task completion */
  verificationCommands?: string[];
  /** Maximum retry attempts */
  maxRetries?: number;
}

/**
 * Input for batch task execution benchmarks
 */
export interface ExecuteLoopBenchmarkInput {
  /** Options for the execute loop */
  loopOptions: ExecuteLoopOptions;
}

/**
 * Input for full workflow benchmarks
 */
export interface WorkflowBenchmarkInput {
  /** Collected user responses for consistent execution across models */
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
  /** Original workflow automation options */
  workflowOptions: WorkflowAutomationOptions;
  /** Project directory path */
  projectDir?: string;
  /** Base directory for temporary project directories */
  tempDirBase?: string;
}

/**
 * Union type for all benchmark inputs
 */
export type BenchmarkInput =
  | OperationBenchmarkInput
  | ExecutionBenchmarkInput
  | ExecuteLoopBenchmarkInput
  | WorkflowBenchmarkInput;

// ============================================================================
// Metrics
// ============================================================================

/**
 * Timing metrics for a benchmark execution
 */
export interface TimingMetrics {
  /** Timestamp when execution started */
  startedAt: number;
  /** Timestamp when execution completed */
  completedAt: number;
  /** Total duration in milliseconds */
  duration: number;
  /** Time to first output (for streaming) */
  timeToFirstOutput?: number;
}

/**
 * Token usage metrics
 */
export interface TokenMetrics {
  /** Prompt tokens used */
  prompt: number;
  /** Completion tokens generated */
  completion: number;
  /** Total tokens */
  total: number;
}

/**
 * Code change metrics from git diff
 */
export interface CodeMetrics {
  /** Lines of code added */
  linesAdded: number;
  /** Lines of code removed */
  linesRemoved: number;
  /** Number of files changed */
  filesChanged: number;
  /** List of new files created */
  newFiles: string[];
  /** List of files modified */
  modifiedFiles: string[];
}

/**
 * Verification/test metrics
 */
export interface VerificationMetrics {
  /** Number of tests run */
  testsRun: number;
  /** Number of tests passed */
  testsPassed: number;
  /** Number of tests failed */
  testsFailed: number;
  /** Whether build succeeded */
  buildSuccess: boolean;
  /** Individual command results */
  commandResults?: Array<{
    command: string;
    exitCode: number;
    stdout: string;
    stderr: string;
    duration: number;
  }>;
}

/**
 * Complete metrics collected for a benchmark execution
 */
export interface BenchmarkMetrics {
  /** Timing information */
  timing: TimingMetrics;
  /** Token usage (if available) */
  tokens?: TokenMetrics;
  /** Code change metrics (from git diff) */
  code?: CodeMetrics;
  /** Verification/test results */
  verification?: VerificationMetrics;
  /** Estimated cost in USD */
  cost?: number;
}

// ============================================================================
// Results
// ============================================================================

/**
 * Result from a single model's benchmark execution
 */
export interface BenchmarkModelResult {
  /** Model identifier (provider:model) */
  modelId: string;
  /** Worktree where execution occurred */
  worktree: Worktree;
  /** Execution status */
  status: "success" | "failed" | "error";
  /** Total duration in milliseconds */
  duration: number;
  /** Operation output (type depends on operation) */
  output?: unknown;
  /** Error message if failed */
  error?: string;
  /** Collected metrics */
  metrics: BenchmarkMetrics;
  /** Timestamp when result was recorded */
  timestamp: number;
}

// ============================================================================
// User Scoring
// ============================================================================

/**
 * User-provided score for a model's output
 */
export interface ModelScore {
  /** Model identifier being scored */
  modelId: string;
  /** Score from 1-5 */
  score: number;
  /** Optional notes about the score */
  notes?: string;
  /** When the score was given */
  scoredAt: number;
  /** Optional user identifier */
  scoredBy?: string;
}

// ============================================================================
// Benchmark Run (Complete Record)
// ============================================================================

/**
 * Complete record of a benchmark run
 */
export interface BenchmarkRun {
  /** Unique run identifier */
  id: string;
  /** Type of benchmark operation */
  type: BenchmarkOperationType;
  /** Input parameters for the benchmark */
  input: BenchmarkInput;
  /** Run configuration */
  config: BenchmarkRunConfig;
  /** Base commit the run started from */
  baseCommit: string;
  /** Results from each model */
  results: BenchmarkModelResult[];
  /** User scores for models */
  scores: ModelScore[];
  /** Timestamp when run was created */
  createdAt: number;
  /** Timestamp when run completed */
  completedAt?: number;
  /** Current status of the run */
  status: "running" | "completed" | "partial" | "failed";
}

// ============================================================================
// Progress Events
// ============================================================================

/**
 * Progress event emitted during benchmark execution
 */
export interface BenchmarkProgressEvent {
  /** Event type */
  type: "start" | "progress" | "complete" | "error";
  /** Model being processed */
  modelId: string;
  /** Run ID */
  runId: string;
  /** Duration so far (in milliseconds) */
  duration?: number;
  /** Error message (for error events) */
  error?: string;
  /** Progress message */
  message?: string;
}

// ============================================================================
// Store Query Options
// ============================================================================

/**
 * Options for listing benchmark runs
 */
export interface BenchmarkListOptions {
  /** Filter by operation type */
  type?: BenchmarkOperationType;
  /** Filter by status */
  status?: BenchmarkRun["status"];
  /** Maximum number of results */
  limit?: number;
  /** Offset for pagination */
  offset?: number;
}

// ============================================================================
// Benchmarkable Operations (for registered operations)
// ============================================================================

import type { AIOptions } from "../../utils/ai-config-builder";
import type { StreamingOptions } from "../../types";

/**
 * Interface for operations that can be benchmarked
 */
export interface BenchmarkableOperation {
  /** Unique operation identifier */
  id: string;
  /** Human-readable name */
  name: string;
  /** Description of what the operation does */
  description: string;
  /** Execute the operation */
  execute: (
    input: unknown,
    aiOptions: AIOptions,
    streamingOptions?: StreamingOptions
  ) => Promise<unknown>;
  /** Validate input parameters */
  validateInput: (input: unknown) => boolean;
}
