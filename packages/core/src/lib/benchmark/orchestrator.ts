/**
 * BenchmarkOrchestrator - Main coordination layer for benchmark runs
 *
 * This class orchestrates the entire benchmark lifecycle:
 * - Validates inputs and generates run IDs
 * - Coordinates parallel execution via WorktreePool
 * - Aggregates results and saves to BenchmarkStore
 * - Emits progress events throughout the process
 */

import { WorktreeManager, type Worktree } from "./worktree-manager";
import { WorktreePool, getModelId, type ModelConfig } from "./worktree-pool";
import { BenchmarkStore } from "./store";
import { BenchmarkExecutor } from "./executor";
import { logger } from "../logger";
import type {
  BenchmarkOperationType,
  BenchmarkRunConfig,
  BenchmarkRun,
  BenchmarkModelResult,
  BenchmarkProgressEvent,
  BenchmarkListOptions,
  ModelScore,
  OperationBenchmarkInput,
  ExecutionBenchmarkInput,
  ExecuteLoopBenchmarkInput,
  WorkflowBenchmarkInput,
  BenchmarkInput,
  BenchmarkModelConfig,
  BenchmarkableOperation,
} from "./types";

/**
 * Generate a unique run ID
 */
function generateRunId(type: BenchmarkOperationType): string {
  const prefix = type === "operation" ? "op" : 
                 type === "execution" ? "exec" : 
                 type === "execute-loop" ? "loop" : "wf";
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 6);
  return `bench-${prefix}-${timestamp}-${random}`;
}

/**
 * Convert BenchmarkModelConfig to ModelConfig for the pool
 */
function toModelConfig(config: BenchmarkModelConfig): ModelConfig {
  return {
    provider: config.provider,
    model: config.model,
    reasoningTokens: config.reasoningTokens,
  };
}

/**
 * BenchmarkOrchestrator coordinates benchmark runs across multiple models
 * using isolated git worktrees for true parallel execution.
 */
export class BenchmarkOrchestrator {
  private worktreeManager: WorktreeManager;
  private pool: WorktreePool;
  private store: BenchmarkStore;
  private executor: BenchmarkExecutor;

  constructor(
    worktreeManager?: WorktreeManager,
    pool?: WorktreePool,
    store?: BenchmarkStore,
    executor?: BenchmarkExecutor
  ) {
    this.worktreeManager = worktreeManager ?? new WorktreeManager();
    this.pool = pool ?? new WorktreePool(this.worktreeManager);
    this.store = store ?? new BenchmarkStore();
    this.executor = executor ?? new BenchmarkExecutor();
  }

  /**
   * Register an operation for benchmarking
   */
  registerOperation(operation: BenchmarkableOperation): void {
    this.executor.registerOperation(operation);
  }

  /**
   * Get a registered operation by ID
   */
  getOperation(id: string): BenchmarkableOperation | undefined {
    return this.executor.getOperation(id);
  }

  /**
   * List all registered operations
   */
  listOperations(): BenchmarkableOperation[] {
    return this.executor.listOperations();
  }

  /**
   * Main entry point for all benchmark types
   *
   * @param type - Type of benchmark operation
   * @param input - Input parameters for the benchmark
   * @param config - Run configuration
   * @param onProgress - Optional progress callback
   * @returns Complete benchmark run with all results
   */
  async run(
    type: BenchmarkOperationType,
    input: BenchmarkInput,
    config: BenchmarkRunConfig,
    onProgress?: (event: BenchmarkProgressEvent) => void
  ): Promise<BenchmarkRun> {
    // Validate inputs
    this.validateInput(type, input);
    this.validateConfig(config);

    // Generate run ID and capture base commit
    const runId = generateRunId(type);
    const baseCommit = config.baseCommit ?? await this.worktreeManager.getCurrentCommit();

    logger.info(`Starting benchmark run: ${runId}`);
    logger.info(`Type: ${type}, Models: ${config.models.length}, Base: ${baseCommit.substring(0, 8)}`);

    // Create initial run record
    const run: BenchmarkRun = {
      id: runId,
      type,
      input,
      config,
      baseCommit,
      results: [],
      scores: [],
      createdAt: Date.now(),
      status: "running",
    };

    // Save initial run
    await this.store.save(run);

    try {
      // Create executor function based on type
      const executorFn = this.createExecutorFn(type, input, baseCommit, runId, onProgress);

      // Convert model configs for pool
      const modelConfigs = config.models.map(toModelConfig);

      // Execute all models in parallel
      const results = await this.pool.executeParallel(
        runId,
        modelConfigs,
        executorFn,
        (event) => {
          // Convert pool progress events to benchmark progress events
          const benchmarkEvent: BenchmarkProgressEvent = {
            type: event.type === "worktree-created" ? "start" :
                  event.type === "execution-started" ? "progress" :
                  event.type === "execution-completed" ? "complete" : "error",
            modelId: event.modelId,
            runId,
            duration: event.duration,
            error: event.error,
            message: event.message,
          };
          onProgress?.(benchmarkEvent);
        },
        baseCommit
      );

      // Collect results
      const modelResults: BenchmarkModelResult[] = [];
      let hasFailures = false;
      let hasErrors = false;

      for (const [modelId, executionResult] of results) {
        if (executionResult.error) {
          hasErrors = true;
          // Create error result
          modelResults.push({
            modelId,
            worktree: executionResult.worktree,
            status: "error",
            duration: executionResult.duration,
            error: executionResult.error.message,
            metrics: {
              timing: {
                startedAt: Date.now() - executionResult.duration,
                completedAt: Date.now(),
                duration: executionResult.duration,
              },
            },
            timestamp: Date.now(),
          });
        } else if (executionResult.result) {
          modelResults.push(executionResult.result);
          if (executionResult.result.status === "failed") {
            hasFailures = true;
          }
        }
      }

      // Determine final status
      const status = hasErrors ? "partial" :
                     hasFailures ? "partial" :
                     "completed";

      // Update run with results
      run.results = modelResults;
      run.status = status;
      run.completedAt = Date.now();

      // Save final run
      await this.store.save(run);

      logger.success(`Benchmark run completed: ${runId}`);
      logger.info(`Status: ${status}, Results: ${modelResults.length}/${config.models.length}`);

      return run;
    } catch (error) {
      // Update run with failure
      run.status = "failed";
      run.completedAt = Date.now();
      await this.store.save(run);

      const errorMsg = error instanceof Error ? error.message : String(error);
      logger.error(`Benchmark run failed: ${runId} - ${errorMsg}`);

      throw error;
    }
  }

  /**
   * Get a benchmark run by ID
   */
  async getRun(id: string): Promise<BenchmarkRun | null> {
    return this.store.get(id);
  }

  /**
   * List benchmark runs with optional filtering
   */
  async listRuns(options?: BenchmarkListOptions): Promise<BenchmarkRun[]> {
    return this.store.list(options);
  }

  /**
   * Add a score for a model in a run
   */
  async scoreModel(runId: string, score: ModelScore): Promise<void> {
    // Validate score
    if (score.score < 1 || score.score > 5) {
      throw new Error("Score must be between 1 and 5");
    }

    await this.store.addScore(runId, score);
    logger.info(`Added score for ${score.modelId}: ${score.score}/5`);
  }

  /**
   * Cleanup worktrees for a run
   */
  async cleanupRun(runId: string): Promise<void> {
    await this.worktreeManager.cleanupRun(runId);
    logger.info(`Cleaned up worktrees for run: ${runId}`);
  }

  /**
   * List all benchmark worktrees
   */
  async listWorktrees(): Promise<Worktree[]> {
    return this.worktreeManager.list();
  }

  /**
   * Get worktrees for a specific run
   */
  async getWorktreesByRunId(runId: string): Promise<Worktree[]> {
    return this.worktreeManager.getByRunId(runId);
  }

  /**
   * Delete a benchmark run
   */
  async deleteRun(runId: string, cleanupWorktrees: boolean = true): Promise<void> {
    await this.store.delete(runId, cleanupWorktrees);
    logger.info(`Deleted run: ${runId}`);
  }

  /**
   * Validate input for the given type
   */
  private validateInput(type: BenchmarkOperationType, input: BenchmarkInput): void {
    switch (type) {
      case "operation": {
        const opInput = input as OperationBenchmarkInput;
        if (!opInput.operationId) {
          throw new Error("Operation ID is required for operation benchmarks");
        }
        const operation = this.executor.getOperation(opInput.operationId);
        if (!operation) {
          throw new Error(`Unknown operation: ${opInput.operationId}`);
        }
        break;
      }
      case "execution": {
        const execInput = input as ExecutionBenchmarkInput;
        if (!execInput.taskId) {
          throw new Error("Task ID is required for execution benchmarks");
        }
        break;
      }
      case "execute-loop": {
        const loopInput = input as ExecuteLoopBenchmarkInput;
        if (!loopInput.loopOptions) {
          throw new Error("Loop options are required for execute-loop benchmarks");
        }
        break;
      }
      case "workflow": {
        const wfInput = input as WorkflowBenchmarkInput;
        if (!wfInput.collectedResponses) {
          throw new Error("Collected responses are required for workflow benchmarks");
        }
        if (!wfInput.workflowOptions) {
          throw new Error("Workflow options are required for workflow benchmarks");
        }
        break;
      }
      default:
        throw new Error(`Unknown benchmark type: ${type}`);
    }
  }

  /**
   * Validate run configuration
   */
  private validateConfig(config: BenchmarkRunConfig): void {
    if (!config.models || config.models.length === 0) {
      throw new Error("At least one model is required");
    }

    for (const model of config.models) {
      if (!model.provider) {
        throw new Error("Model provider is required");
      }
      if (!model.model) {
        throw new Error("Model name is required");
      }
    }
  }

  /**
   * Create an executor function for the given type
   */
  private createExecutorFn(
    type: BenchmarkOperationType,
    input: BenchmarkInput,
    baseCommit: string,
    runId: string,
    onProgress?: (event: BenchmarkProgressEvent) => void
  ): (worktree: Worktree, model: ModelConfig) => Promise<BenchmarkModelResult> {
    return async (worktree: Worktree, model: ModelConfig): Promise<BenchmarkModelResult> => {
      const modelId = getModelId(model);
      
      onProgress?.({
        type: "start",
        modelId,
        runId,
        message: `Starting ${type} for ${modelId}`,
      });

      const benchmarkModel: BenchmarkModelConfig = {
        provider: model.provider,
        model: model.model,
        reasoningTokens: model.reasoningTokens,
      };

      let result: BenchmarkModelResult;

      switch (type) {
        case "operation":
          result = await this.executor.executeOperation(
            worktree,
            benchmarkModel,
            input as OperationBenchmarkInput,
            baseCommit
          );
          break;

        case "execution":
          result = await this.executor.executeTask(
            worktree,
            benchmarkModel,
            input as ExecutionBenchmarkInput,
            baseCommit
          );
          break;

        case "execute-loop":
          result = await this.executor.executeLoop(
            worktree,
            benchmarkModel,
            input as ExecuteLoopBenchmarkInput,
            baseCommit
          );
          break;

        case "workflow":
          result = await this.executor.executeWorkflow(
            worktree,
            benchmarkModel,
            input as WorkflowBenchmarkInput,
            baseCommit
          );
          break;

        default:
          throw new Error(`Unknown benchmark type: ${type}`);
      }

      // Emit completion event
      onProgress?.({
        type: result.status === "error" ? "error" : "complete",
        modelId,
        runId,
        duration: result.duration,
        error: result.error,
        message: result.status === "success" 
          ? `Completed ${modelId} in ${result.duration}ms`
          : `Failed ${modelId}: ${result.error}`,
      });

      return result;
    };
  }
}
