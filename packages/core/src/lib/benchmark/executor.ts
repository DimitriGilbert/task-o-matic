/**
 * BenchmarkExecutor - Per-worktree execution logic for benchmarks
 *
 * This class handles executing benchmark operations in isolated worktrees.
 * It supports operations, single task execution, task loops, and full workflows.
 * Each execution captures timing, token metrics, and code changes.
 */

import type { Worktree } from "./worktree-manager";
import { MetricsCollector } from "./metrics-collector";
import type {
  BenchmarkModelConfig,
  BenchmarkModelResult,
  BenchmarkMetrics,
  OperationBenchmarkInput,
  ExecutionBenchmarkInput,
  ExecuteLoopBenchmarkInput,
  WorkflowBenchmarkInput,
  TimingMetrics,
  TokenMetrics,
  BenchmarkableOperation,
} from "./types";
import { logger } from "../logger";
import { buildAIConfig, type AIOptions } from "../../utils/ai-config-builder";
import { setupWorkingDirectory } from "../config";
import type { TaskExecutionConfig, ExecutorTool } from "../../types";
import { executeTaskCore } from "../task-execution-core";
import { executeTaskLoop } from "../task-loop-execution";
import { WorkflowService } from "../../services/workflow";
import { PRDService } from "../../services/prd";
import { writeFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Token tracking from AI operations
 */
interface TokenTracker {
  prompt: number;
  completion: number;
}

/**
 * BenchmarkExecutor runs benchmark operations in isolated worktrees
 * and collects comprehensive metrics for comparison.
 */
export class BenchmarkExecutor {
  private metricsCollector: MetricsCollector;
  private operationRegistry: Map<string, BenchmarkableOperation>;

  constructor(
    metricsCollector?: MetricsCollector,
    operationRegistry?: Map<string, BenchmarkableOperation>
  ) {
    this.metricsCollector = metricsCollector ?? new MetricsCollector();
    this.operationRegistry = operationRegistry ?? new Map();
  }

  /**
   * Register an operation for benchmarking
   */
  registerOperation(operation: BenchmarkableOperation): void {
    this.operationRegistry.set(operation.id, operation);
  }

  /**
   * Get a registered operation by ID
   */
  getOperation(id: string): BenchmarkableOperation | undefined {
    return this.operationRegistry.get(id);
  }

  /**
   * List all registered operations
   */
  listOperations(): BenchmarkableOperation[] {
    return Array.from(this.operationRegistry.values());
  }

  /**
   * Execute a registered operation in a worktree
   *
   * @param worktree - The worktree to execute in
   * @param model - Model configuration to use
   * @param input - Operation input parameters
   * @param baseCommit - Base commit for metrics comparison
   * @returns Benchmark result with metrics
   */
  async executeOperation(
    worktree: Worktree,
    model: BenchmarkModelConfig,
    input: OperationBenchmarkInput,
    baseCommit: string
  ): Promise<BenchmarkModelResult> {
    const modelId = `${model.provider}:${model.model}`;
    const startedAt = Date.now();
    let timeToFirstOutput: number | undefined;

    logger.info(`Executing operation ${input.operationId} with ${modelId}`);

    try {
      // Get the operation from registry
      const operation = this.operationRegistry.get(input.operationId);
      if (!operation) {
        throw new Error(`Operation not found: ${input.operationId}`);
      }

      // Validate input
      if (!operation.validateInput(input.params)) {
        throw new Error(`Invalid input for operation ${input.operationId}`);
      }

      // Setup working directory to the worktree
      await setupWorkingDirectory(worktree.path);

      // Build AI options for this model
      const aiOptions = this.buildModelAIOptions(model);

      // Token tracking
      const tokenTracker: TokenTracker = { prompt: 0, completion: 0 };

      // Create streaming options with token tracking
      const streamingOptions = {
        enabled: true,
        onChunk: () => {
          if (!timeToFirstOutput) {
            timeToFirstOutput = Date.now() - startedAt;
          }
        },
        onFinish: (result: { usage?: { promptTokens?: number; completionTokens?: number } }) => {
          if (result.usage) {
            tokenTracker.prompt += result.usage.promptTokens ?? 0;
            tokenTracker.completion += result.usage.completionTokens ?? 0;
          }
        },
      };

      // Execute the operation
      const output = await operation.execute(input.params, aiOptions, streamingOptions);

      const completedAt = Date.now();

      // Collect metrics
      const metrics = await this.collectMetrics(
        worktree.path,
        baseCommit,
        startedAt,
        completedAt,
        timeToFirstOutput,
        tokenTracker
      );

      return this.createSuccessResult(worktree, modelId, output, metrics, completedAt - startedAt);
    } catch (error) {
      const completedAt = Date.now();
      return this.createErrorResult(
        worktree,
        modelId,
        error,
        completedAt - startedAt,
        startedAt,
        completedAt,
        timeToFirstOutput
      );
    }
  }

  /**
   * Execute a single task in a worktree
   *
   * @param worktree - The worktree to execute in
   * @param model - Model configuration to use
   * @param input - Task execution input
   * @param baseCommit - Base commit for metrics comparison
   * @returns Benchmark result with metrics
   */
  async executeTask(
    worktree: Worktree,
    model: BenchmarkModelConfig,
    input: ExecutionBenchmarkInput,
    baseCommit: string
  ): Promise<BenchmarkModelResult> {
    const modelId = `${model.provider}:${model.model}`;
    const startedAt = Date.now();
    let timeToFirstOutput: number | undefined;

    logger.info(`Executing task ${input.taskId} with ${modelId}`);

    try {
      // Setup working directory to the worktree
      await setupWorkingDirectory(worktree.path);

      // Token tracking
      const tokenTracker: TokenTracker = { prompt: 0, completion: 0 };

      // Build execution config with model override
      // The executeTaskCore takes taskId and a TaskExecutionConfig object
      const config: TaskExecutionConfig = {
        tool: "opencode" as ExecutorTool, // Default tool
        enableRetry: (input.maxRetries ?? 1) > 1,
        maxRetries: input.maxRetries ?? 1,
        verificationCommands: input.verificationCommands ?? [],
        executorConfig: {
          model: `${model.provider}:${model.model}`,
        },
      };

      // Execute the task
      const result = await executeTaskCore(input.taskId, config);

      const completedAt = Date.now();
      if (!timeToFirstOutput) {
        timeToFirstOutput = completedAt - startedAt;
      }

      // Collect metrics
      const metrics = await this.collectMetrics(
        worktree.path,
        baseCommit,
        startedAt,
        completedAt,
        timeToFirstOutput,
        tokenTracker,
        input.verificationCommands
      );

      // TaskExecutionResult has success and attempts, extract error from last attempt if failed
      const lastAttempt = result.attempts[result.attempts.length - 1];
      const errorMsg = result.success ? undefined : lastAttempt?.error;

      const status = result.success ? "success" : "failed";
      return {
        modelId,
        worktree,
        status,
        duration: completedAt - startedAt,
        output: result,
        error: errorMsg,
        metrics,
        timestamp: completedAt,
      };
    } catch (error) {
      const completedAt = Date.now();
      return this.createErrorResult(
        worktree,
        modelId,
        error,
        completedAt - startedAt,
        startedAt,
        completedAt,
        timeToFirstOutput
      );
    }
  }

  /**
   * Execute a task loop in a worktree
   *
   * @param worktree - The worktree to execute in
   * @param model - Model configuration to use
   * @param input - Execute loop input
   * @param baseCommit - Base commit for metrics comparison
   * @returns Benchmark result with metrics
   */
  async executeLoop(
    worktree: Worktree,
    model: BenchmarkModelConfig,
    input: ExecuteLoopBenchmarkInput,
    baseCommit: string
  ): Promise<BenchmarkModelResult> {
    const modelId = `${model.provider}:${model.model}`;
    const startedAt = Date.now();
    let timeToFirstOutput: number | undefined;

    logger.info(`Executing task loop with ${modelId}`);

    try {
      // Setup working directory to the worktree
      await setupWorkingDirectory(worktree.path);

      // Token tracking
      const tokenTracker: TokenTracker = { prompt: 0, completion: 0 };

      // Override model in loop options
      const loopOptions = {
        ...input.loopOptions,
        config: {
          ...input.loopOptions.config,
          model: `${model.provider}:${model.model}`,
        },
      };

      // Execute the loop
      const result = await executeTaskLoop(loopOptions);

      const completedAt = Date.now();
      if (!timeToFirstOutput) {
        timeToFirstOutput = completedAt - startedAt;
      }

      // Collect metrics
      const metrics = await this.collectMetrics(
        worktree.path,
        baseCommit,
        startedAt,
        completedAt,
        timeToFirstOutput,
        tokenTracker,
        input.loopOptions.config?.verificationCommands
      );

      const hasFailures = result.failedTasks > 0;
      return {
        modelId,
        worktree,
        status: hasFailures ? "failed" : "success",
        duration: completedAt - startedAt,
        output: result,
        error: hasFailures ? `${result.failedTasks} tasks failed` : undefined,
        metrics,
        timestamp: completedAt,
      };
    } catch (error) {
      const completedAt = Date.now();
      return this.createErrorResult(
        worktree,
        modelId,
        error,
        completedAt - startedAt,
        startedAt,
        completedAt,
        timeToFirstOutput
      );
    }
  }

  /**
   * Execute a full workflow in a worktree
   *
   * For workflow benchmarks, we execute a series of steps:
   * 1. Initialize project (if needed)
   * 2. Parse PRD to generate tasks
   * 3. Execute tasks with the given model
   *
   * @param worktree - The worktree to execute in
   * @param model - Model configuration to use
   * @param input - Workflow input
   * @param baseCommit - Base commit for metrics comparison
   * @returns Benchmark result with metrics
   */
  async executeWorkflow(
    worktree: Worktree,
    model: BenchmarkModelConfig,
    input: WorkflowBenchmarkInput,
    baseCommit: string
  ): Promise<BenchmarkModelResult> {
    const modelId = `${model.provider}:${model.model}`;
    const startedAt = Date.now();
    let timeToFirstOutput: number | undefined;

    logger.info(`Executing workflow with ${modelId}`);

    try {
      // Setup working directory to the worktree
      const projectDir = input.projectDir ?? worktree.path;
      await setupWorkingDirectory(projectDir);

      // Token tracking
      const tokenTracker: TokenTracker = { prompt: 0, completion: 0 };

      // Create workflow service
      const workflowService = new WorkflowService();

      // Build AI options for the model
      const aiOptions: AIOptions = {
        aiProvider: model.provider,
        aiModel: model.model,
        aiReasoning: model.reasoningTokens?.toString(),
      };

      // Execute workflow steps based on collected responses
      const results: Record<string, unknown> = {};

      // Step 1: Initialize project if needed
      if (input.collectedResponses.projectName) {
        results.init = await workflowService.initializeProject({
          projectName: input.collectedResponses.projectName,
          projectDir,
          initMethod: input.collectedResponses.initMethod,
          projectDescription: input.collectedResponses.projectDescription,
          aiOptions,
          stackConfig: input.collectedResponses.stackConfig,
        });
      }

      // Step 2: Parse PRD if content is provided
      if (input.collectedResponses.prdContent || input.collectedResponses.prdFile) {
        const prdService = new PRDService();
        
        if (input.collectedResponses.prdContent) {
          // If we have PRD content, save it first
          const prdPath = join(projectDir, ".task-o-matic", "prd", "benchmark-prd.md");
          writeFileSync(prdPath, input.collectedResponses.prdContent);
          
          results.prdParse = await prdService.parsePRD({
            file: prdPath,
            aiOptions,
          });
        } else if (input.collectedResponses.prdFile) {
          results.prdParse = await prdService.parsePRD({
            file: input.collectedResponses.prdFile,
            aiOptions,
          });
        }
      }

      // Step 3: Execute tasks if requested
      if (input.collectedResponses.generateTasks) {
        const loopOptions = {
          filters: { status: "todo" as const },
          tool: (input.workflowOptions.executeTool ?? "opencode") as ExecutorTool,
          config: {
            maxRetries: input.workflowOptions.executeMaxRetries ?? 3,
            verificationCommands: input.workflowOptions.verificationCommands ?? [],
            model: modelId,
          },
        };
        
        results.execution = await executeTaskLoop(loopOptions);
      }

      const completedAt = Date.now();
      if (!timeToFirstOutput) {
        timeToFirstOutput = completedAt - startedAt;
      }

      // Collect metrics
      const verificationCommands = input.workflowOptions.verificationCommands ?? [];
      const metrics = await this.collectMetrics(
        projectDir,
        baseCommit,
        startedAt,
        completedAt,
        timeToFirstOutput,
        tokenTracker,
        verificationCommands
      );

      return this.createSuccessResult(worktree, modelId, results, metrics, completedAt - startedAt);
    } catch (error) {
      const completedAt = Date.now();
      return this.createErrorResult(
        worktree,
        modelId,
        error,
        completedAt - startedAt,
        startedAt,
        completedAt,
        timeToFirstOutput
      );
    }
  }

  /**
   * Build AI options for a model configuration
   */
  private buildModelAIOptions(model: BenchmarkModelConfig): AIOptions {
    // Get API key from environment based on provider
    const envKeyMap: Record<string, string> = {
      anthropic: "ANTHROPIC_API_KEY",
      openai: "OPENAI_API_KEY",
      openrouter: "OPENROUTER_API_KEY",
      google: "GOOGLE_API_KEY",
      gemini: "GEMINI_API_KEY",
      zai: "ZAI_API_KEY",
    };

    const envKey = envKeyMap[model.provider] ?? `${model.provider.toUpperCase()}_API_KEY`;
    const apiKey = process.env[envKey];

    return {
      aiProvider: model.provider,
      aiModel: model.model,
      aiKey: apiKey,
      aiReasoning: model.reasoningTokens?.toString(),
    };
  }

  /**
   * Collect all metrics for a completed execution
   */
  private async collectMetrics(
    worktreePath: string,
    baseCommit: string,
    startedAt: number,
    completedAt: number,
    timeToFirstOutput: number | undefined,
    tokenTracker: TokenTracker,
    verificationCommands?: string[]
  ): Promise<BenchmarkMetrics> {
    const timing: TimingMetrics = {
      startedAt,
      completedAt,
      duration: completedAt - startedAt,
      timeToFirstOutput,
    };

    const tokens: TokenMetrics | undefined =
      tokenTracker.prompt > 0 || tokenTracker.completion > 0
        ? {
            prompt: tokenTracker.prompt,
            completion: tokenTracker.completion,
            total: tokenTracker.prompt + tokenTracker.completion,
          }
        : undefined;

    return this.metricsCollector.collectAll(
      worktreePath,
      baseCommit,
      timing,
      tokens,
      verificationCommands
    );
  }

  /**
   * Create a success result
   */
  private createSuccessResult(
    worktree: Worktree,
    modelId: string,
    output: unknown,
    metrics: BenchmarkMetrics,
    duration: number
  ): BenchmarkModelResult {
    return {
      modelId,
      worktree,
      status: "success",
      duration,
      output,
      metrics,
      timestamp: Date.now(),
    };
  }

  /**
   * Create an error result
   */
  private createErrorResult(
    worktree: Worktree,
    modelId: string,
    error: unknown,
    duration: number,
    startedAt: number,
    completedAt: number,
    timeToFirstOutput: number | undefined
  ): BenchmarkModelResult {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`Execution failed for ${modelId}: ${errorMessage}`);

    return {
      modelId,
      worktree,
      status: "error",
      duration,
      error: errorMessage,
      metrics: {
        timing: {
          startedAt,
          completedAt,
          duration,
          timeToFirstOutput,
        },
      },
      timestamp: completedAt,
    };
  }
}
