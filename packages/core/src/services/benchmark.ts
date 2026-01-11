import { benchmarkRunner } from "../lib/benchmark/runner";
import { benchmarkStorage } from "../lib/benchmark/storage";
import {
  BenchmarkConfig,
  BenchmarkRun,
  BenchmarkProgressEvent,
  BenchmarkResult,
} from "../lib/benchmark/types";
import { taskService } from "../services/tasks";
import { executeTaskCore } from "../lib/task-execution-core";
import { configManager } from "../lib/config";
import { createBenchmarkBranch, checkoutBranch, getCurrentBranch, isClean, cleanupBenchmarkBranch } from "../lib/git-utils";
import { TaskExecutionConfig, ExecuteLoopOptions } from "../types";
import { logger } from "../lib/logger";
import { executeTaskLoop } from "../lib/task-loop-execution";
import { workflowService } from "./workflow";
import { WorkflowBenchmarkInput } from "../lib/benchmark/types";
import { resolve, join } from "path";
import { rmSync } from "fs";

export interface ExecutionBenchmarkOptions {
  taskId: string;
  verificationCommands?: string[];
  maxRetries?: number;
  keepBranches?: boolean;
}

export class BenchmarkService {
  async runBenchmark(
    operationId: string,
    input: any,
    config: BenchmarkConfig,
    onProgress?: (event: BenchmarkProgressEvent) => void
  ): Promise<BenchmarkRun> {
    return await benchmarkRunner.run(operationId, input, config, onProgress);
  }

  async runExecutionBenchmark(
    options: ExecutionBenchmarkOptions,
    config: BenchmarkConfig,
    onProgress?: (event: BenchmarkProgressEvent) => void
  ): Promise<BenchmarkRun> {
    const { taskId, verificationCommands, maxRetries = 3, keepBranches = true }
 = options;

    // 1. Safety Check: Git state must be clean
    if (!(await isClean())) {
      throw new Error(
        "Working directory is not clean. Please commit or stash changes before running benchmarks."
      );
    }

    const task = await taskService.getTask(taskId);
    if (!task) {
      throw new Error(`Task ${taskId} not found`);
    }

    const baseBranch = await getCurrentBranch();
    const runId = `bench-${taskId}-${Date.now()}`;
    const results: BenchmarkResult[] = [];

    logger.info(`🚀 Starting Execution Benchmark for Task: ${task.title}`);
    logger.info(`📍 Base Branch: ${baseBranch}`);

    // 2. Iterate Models
    for (const modelConfig of config.models) {
      const modelId = `${modelConfig.provider}:${modelConfig.model}`;
      // Sanitize model name for branch
      const safeModelName = modelConfig.model.replace(/[^a-zA-Z0-9-]/g, "-");
      const branchName = `bench/${taskId}/${safeModelName}-${Date.now()}`;

      onProgress?.({ type: "start", modelId });

      try {
        // 3. Create & Checkout Isolation Branch
        await createBenchmarkBranch(branchName, baseBranch);
        await checkoutBranch(branchName);

        // 4. Configure Environment
        const previousConfig = configManager.getAIConfig();
        await configManager.setAIConfig({
          provider: modelConfig.provider as any,
          model: modelConfig.model,
        });

        // 5. Execute Task
        const startTime = Date.now();
        const executionConfig: TaskExecutionConfig = {
          tool: "opencode", // Default executor
          executorConfig: {
            model: modelConfig.model,
          },
          verificationCommands: verificationCommands,
          enableRetry: true,
          maxRetries: maxRetries,
          tryModels: [], // No model fallback during benchmark
          autoCommit: true, // Force commit to capture work in branch
        };

        let output: any;
        let error: string | undefined;

        try {
          output = await executeTaskCore(taskId, executionConfig);
        } catch (e) {
          error = e instanceof Error ? e.message : String(e);
        }

        const duration = Date.now() - startTime;

        // Restore Config
        await configManager.setAIConfig(previousConfig);

        // 6. Capture Result
        results.push({
          modelId,
          output: {
            ...output,
            branch: branchName,
            status: output?.success ? "PASS" : "FAIL",
          },
          duration,
          error,
          timestamp: Date.now(),
        });

        onProgress?.({
          type: output?.success ? "complete" : "error",
          modelId,
          duration,
          error,
        });

        // 7. Cleanup
        await checkoutBranch(baseBranch);
        if (!keepBranches) {
          await cleanupBenchmarkBranch(branchName);
        }
      } catch (err) {
        // Critical Failure Loop Rescue
        logger.error(`💥 Critical Benchmark Failure for ${modelId}: ${err}`);
        try {
          // Attempt to return to safety
          const current = await getCurrentBranch();
          if (current !== baseBranch) {
            await checkoutBranch(baseBranch);
          }
        } catch (resetErr) {
          logger.error(`🔥 FATAL: Could not reset branch: ${resetErr}`);
          throw resetErr; // Stop everything if git state is corrupted
        }
      }
    }

    const run: BenchmarkRun = {
      id: runId,
      timestamp: Date.now(),
      command: "execution-benchmark",
      input: options,
      config,
      results,
    };

    benchmarkStorage.saveRun(run);
    return run;
  }

  async runExecuteLoopBenchmark(
    options: {
      loopOptions: ExecuteLoopOptions;
      keepBranches?: boolean;
    },
    config: BenchmarkConfig,
    onProgress?: (event: BenchmarkProgressEvent) => void
  ): Promise<BenchmarkRun> {
    const { loopOptions, keepBranches = true } = options;

    // 1. Safety Check: Git state must be clean
    if (!(await isClean())) {
      throw new Error(
        "Working directory is not clean. Please commit or stash changes before running benchmarks."
      );
    }

    const baseBranch = await getCurrentBranch();
    const runId = `bench-loop-${Date.now()}`;
    const results: BenchmarkResult[] = [];

    logger.info(`🚀 Starting Execute Loop Benchmark`);
    logger.info(`📍 Base Branch: ${baseBranch}`);

    // 2. Iterate Models
    for (const modelConfig of config.models) {
      const modelId = `${modelConfig.provider}:${modelConfig.model}`;
      const safeModelName = modelConfig.model.replace(/[^a-zA-Z0-9-]/g, "-");
      const branchName = `bench/loop/${safeModelName}-${Date.now()}`;

      onProgress?.({ type: "start", modelId });

      try {
        // 3. Create & Checkout Isolation Branch
        await createBenchmarkBranch(branchName, baseBranch);
        await checkoutBranch(branchName);

        // 4. Configure Environment
        const previousConfig = configManager.getAIConfig();
        await configManager.setAIConfig({
          provider: modelConfig.provider as any,
          model: modelConfig.model,
        });

        // 5. Execute Loop
        const startTime = Date.now();
        const loopResult = await executeTaskLoop(loopOptions);
        const duration = Date.now() - startTime;

        // Restore Config
        await configManager.setAIConfig(previousConfig);

        // 6. Capture Result
        const success = loopResult.failedTasks === 0;
        results.push({
          modelId,
          output: {
            ...loopResult,
            branch: branchName,
            status: success ? "PASS" : "FAIL",
          },
          duration,
          error: success
            ? undefined
            : `${loopResult.failedTasks} tasks failed`,
          timestamp: Date.now(),
        });

        onProgress?.({
          type: success ? "complete" : "error",
          modelId,
          duration,
          error: success ? undefined : `${loopResult.failedTasks} tasks failed`,
        });

        // 7. Cleanup
        await checkoutBranch(baseBranch);
        if (!keepBranches) {
          await cleanupBenchmarkBranch(branchName);
        }
      } catch (err) {
        logger.error(`💥 Critical Benchmark Failure for ${modelId}: ${err}`);
        try {
          const current = await getCurrentBranch();
          if (current !== baseBranch) {
            await checkoutBranch(baseBranch);
          }
        } catch (resetErr) {
          logger.error(`🔥 FATAL: Could not reset branch: ${resetErr}`);
          throw resetErr;
        }
      }
    }

    const run: BenchmarkRun = {
      id: runId,
      timestamp: Date.now(),
      command: "execute-loop-benchmark",
      input: options,
      config,
      results,
    };

    benchmarkStorage.saveRun(run);
    return run;
  }

  async runWorkflowBenchmark(
    input: WorkflowBenchmarkInput,
    config: BenchmarkConfig,
    onProgress?: (event: BenchmarkProgressEvent) => void
  ): Promise<BenchmarkRun> {
    const runId = `bench-workflow-${Date.now()}`;
    const results: BenchmarkResult[] = [];
    const baseDir = input.tempDirBase || resolve(process.cwd(), "benchmarks");

    logger.info(`🚀 Starting Workflow Benchmark`);
    logger.info(`📍 Base Directory: ${baseDir}`);

    for (const modelConfig of config.models) {
      const modelId = `${modelConfig.provider}:${modelConfig.model}`;
      const safeModelName = modelConfig.model.replace(/[^a-zA-Z0-9-]/g, "-");
      const timestamp = Date.now();
      const projectDir = join(
        baseDir,
        `${input.collectedResponses.projectName}-${safeModelName}-${timestamp}`
      );

      onProgress?.({ type: "start", modelId });
      const startTime = Date.now();

      try {
        // Prepare AI Options
        const aiOptions = {
          aiProvider: modelConfig.provider,
          aiModel: modelConfig.model,
          aiKey: process.env.AI_API_KEY, // Propagate key
        };

        // 1. Initialize
        const initResult = await workflowService.initializeProject({
          projectName: input.collectedResponses.projectName,
          projectDir,
          initMethod: input.collectedResponses.initMethod,
          projectDescription: input.collectedResponses.projectDescription,
          stackConfig: input.collectedResponses.stackConfig,
          aiOptions,
          bootstrap: true, // Always bootstrap for benchmarks? or follow input
          includeDocs: true,
        });

        // 2. Define PRD
        const prdResult = await workflowService.definePRD({
          method: input.collectedResponses.prdMethod,
          prdContent: input.collectedResponses.prdContent,
          prdDescription: input.collectedResponses.prdDescription,
          prdFile: input.collectedResponses.prdFile,
          projectDir,
          aiOptions,
        });

        // 3. Generate Tasks
        let tasksResult: any = { tasks: [] };
        if (input.collectedResponses.generateTasks) {
          tasksResult = await workflowService.generateTasks({
            prdFile: prdResult.prdFile,
            method: "ai",
            customInstructions: input.collectedResponses.customInstructions,
            projectDir,
            aiOptions,
          });
        }

        // 4. Split Tasks
        let splitResult: any;
        if (
          input.collectedResponses.splitTasks &&
          tasksResult.tasks.length > 0
        ) {
          splitResult = await workflowService.splitTasks({
            taskIds: tasksResult.tasks.map((t: any) => t.id),
            splitMethod: "standard",
            customInstructions: input.collectedResponses.splitInstructions,
            aiOptions,
          });
        }

        // 5. Execute Tasks (Optional)
        let executionResult: any;
        if (input.workflowOptions.executeTasks) {
          // Switch to project dir for execution
          const originalCwd = process.cwd();
          process.chdir(projectDir);
          
          try {
            executionResult = await workflowService.executeTasks({
                options: {
                    filters: {}, // Execute all
                    tool: "opencode",
                    config: {
                        maxRetries: 3,
                        autoCommit: true,
                    },
                    dry: false
                }
            });
          } finally {
            process.chdir(originalCwd);
          }
        }

        const duration = Date.now() - startTime;
        
        results.push({
            modelId,
            duration,
            timestamp: Date.now(),
            output: {
                projectDir,
                stats: {
                    totalTasks: tasksResult.tasks.length,
                    successfulSteps: 5, // Approximate
                    totalSteps: 5
                },
                execution: executionResult
            }
        });

        onProgress?.({ type: "complete", modelId, duration });

      } catch (error) {
         const duration = Date.now() - startTime;
         results.push({
            modelId,
            duration,
            timestamp: Date.now(),
            error: error instanceof Error ? error.message : String(error),
            output: {}
         });
         onProgress?.({ type: "error", modelId, error: String(error) });
      }
    }

    const run: BenchmarkRun = {
      id: runId,
      timestamp: Date.now(),
      command: "workflow-benchmark",
      input,
      config,
      results,
    };

    benchmarkStorage.saveRun(run);
    return run;
  }

  getRun(id: string): BenchmarkRun | null {
    return benchmarkStorage.getRun(id);
  }

  listRuns(): Array<{ id: string; timestamp: number; command: string }> {
    return benchmarkStorage.listRuns();
  }
}

export const benchmarkService = new BenchmarkService();
