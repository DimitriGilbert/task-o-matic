/**
 * WorktreePool - Concurrent execution pool for benchmark worktrees
 *
 * This class manages parallel execution of benchmark operations across
 * multiple worktrees. It handles concurrency limits and progress reporting.
 */

import type { Worktree } from "./worktree-manager";
import { WorktreeManager } from "./worktree-manager";
import { logger } from "../logger";

/**
 * Configuration for model execution
 */
export interface ModelConfig {
  /** Provider name (e.g., "openai", "anthropic") */
  provider: string;
  /** Model name (e.g., "gpt-4o", "claude-sonnet-4") */
  model: string;
  /** Optional reasoning tokens for models that support it */
  reasoningTokens?: number;
}

/**
 * Pool configuration options
 */
export interface PoolConfig {
  /** Maximum concurrent executions (default: unlimited = 0) */
  maxConcurrent: number;
  /** Delay between starting executions in ms (optional, for rate limiting) */
  delayBetweenMs?: number;
}

/**
 * Progress event emitted during pool execution
 */
export interface PoolProgressEvent {
  /** Event type */
  type: "worktree-created" | "execution-started" | "execution-completed" | "execution-failed";
  /** The model being processed */
  modelId: string;
  /** The worktree being used */
  worktree?: Worktree;
  /** Duration in ms (for completed events) */
  duration?: number;
  /** Error message (for failed events) */
  error?: string;
  /** Progress message */
  message: string;
}

/**
 * Result from a single model execution
 */
export interface ExecutionResult<T> {
  /** The model that was executed */
  modelId: string;
  /** The result if successful */
  result: T | null;
  /** Error if execution failed */
  error: Error | null;
  /** Duration in ms */
  duration: number;
  /** The worktree used */
  worktree: Worktree;
}

/**
 * Helper to get a unique model ID from ModelConfig
 */
export function getModelId(config: ModelConfig): string {
  return `${config.provider}:${config.model}`;
}

/**
 * WorktreePool manages parallel execution of benchmark operations
 * across multiple isolated git worktrees.
 */
export class WorktreePool {
  private worktreeManager: WorktreeManager;
  private config: PoolConfig;

  constructor(worktreeManager: WorktreeManager, config?: Partial<PoolConfig>) {
    this.worktreeManager = worktreeManager;
    this.config = {
      maxConcurrent: config?.maxConcurrent ?? 0, // 0 = unlimited
      delayBetweenMs: config?.delayBetweenMs ?? 0,
    };
  }

  /**
   * Execute an operation across all models in parallel
   *
   * @param runId - Unique identifier for this benchmark run
   * @param models - Array of model configurations to benchmark
   * @param executor - Function to execute in each worktree
   * @param onProgress - Optional progress callback
   * @param baseCommit - Base commit to create worktrees from
   * @returns Map of model ID to execution result
   */
  async executeParallel<T>(
    runId: string,
    models: ModelConfig[],
    executor: (worktree: Worktree, model: ModelConfig) => Promise<T>,
    onProgress?: (event: PoolProgressEvent) => void,
    baseCommit?: string
  ): Promise<Map<string, ExecutionResult<T>>> {
    const results = new Map<string, ExecutionResult<T>>();
    const worktrees: Worktree[] = [];

    logger.info(`Starting parallel execution for ${models.length} models`);

    // Phase 1: Create all worktrees
    const resolvedBaseCommit = baseCommit ?? await this.worktreeManager.getCurrentCommit();
    
    for (const model of models) {
      const modelId = getModelId(model);
      try {
        const worktree = await this.worktreeManager.create(
          runId,
          modelId,
          resolvedBaseCommit
        );
        worktrees.push(worktree);
        
        onProgress?.({
          type: "worktree-created",
          modelId,
          worktree,
          message: `Created worktree for ${modelId}`,
        });
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        logger.error(`Failed to create worktree for ${modelId}: ${errorMsg}`);
        
        // Still record the failure
        results.set(modelId, {
          modelId,
          result: null,
          error: error instanceof Error ? error : new Error(errorMsg),
          duration: 0,
          worktree: {
            name: "",
            path: "",
            branch: "",
            runId,
            modelId,
            createdAt: Date.now(),
          },
        });
      }
    }

    // Phase 2: Execute all models in parallel (with optional concurrency limit)
    const executionPromises: Promise<void>[] = [];
    
    const executeModel = async (
      worktree: Worktree,
      model: ModelConfig,
      index: number
    ): Promise<void> => {
      const modelId = getModelId(model);
      const startTime = Date.now();

      // Apply delay if configured (useful for rate limiting)
      if (this.config.delayBetweenMs && index > 0) {
        await this.delay(this.config.delayBetweenMs * index);
      }

      onProgress?.({
        type: "execution-started",
        modelId,
        worktree,
        message: `Starting execution for ${modelId}`,
      });

      try {
        const result = await executor(worktree, model);
        const duration = Date.now() - startTime;

        results.set(modelId, {
          modelId,
          result,
          error: null,
          duration,
          worktree,
        });

        onProgress?.({
          type: "execution-completed",
          modelId,
          worktree,
          duration,
          message: `Completed ${modelId} in ${duration}ms`,
        });
      } catch (error) {
        const duration = Date.now() - startTime;
        const errorMsg = error instanceof Error ? error.message : String(error);

        results.set(modelId, {
          modelId,
          result: null,
          error: error instanceof Error ? error : new Error(errorMsg),
          duration,
          worktree,
        });

        onProgress?.({
          type: "execution-failed",
          modelId,
          worktree,
          duration,
          error: errorMsg,
          message: `Failed ${modelId}: ${errorMsg}`,
        });
      }
    };

    // Build execution queue
    for (let i = 0; i < worktrees.length; i++) {
      const worktree = worktrees[i];
      const model = models.find((m) => getModelId(m) === worktree.modelId);
      if (model) {
        executionPromises.push(executeModel(worktree, model, i));
      }
    }

    // Execute with or without concurrency limit
    if (this.config.maxConcurrent > 0) {
      await this.executeWithConcurrencyLimit(executionPromises, this.config.maxConcurrent);
    } else {
      // Unlimited parallelism
      await Promise.all(executionPromises);
    }

    logger.success(`Completed parallel execution: ${results.size}/${models.length} models`);
    return results;
  }

  /**
   * Execute promises with a concurrency limit using a semaphore pattern
   */
  private async executeWithConcurrencyLimit<T>(
    tasks: Promise<T>[],
    limit: number
  ): Promise<T[]> {
    const results: T[] = [];
    let currentIndex = 0;
    const total = tasks.length;

    const executeNext = async (): Promise<void> => {
      while (currentIndex < total) {
        const index = currentIndex;
        currentIndex++;
        try {
          const result = await tasks[index];
          results.push(result);
        } catch {
          // Error is already handled in the task itself
        }
      }
    };

    // Create worker slots up to the limit
    const workers: Promise<void>[] = [];
    const actualLimit = Math.min(limit, total);
    for (let i = 0; i < actualLimit; i++) {
      workers.push(executeNext());
    }

    await Promise.all(workers);
    return results;
  }

  /**
   * Simple delay utility
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Get the underlying worktree manager
   */
  getWorktreeManager(): WorktreeManager {
    return this.worktreeManager;
  }
}
