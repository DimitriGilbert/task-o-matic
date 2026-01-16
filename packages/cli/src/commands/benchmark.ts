import chalk from "chalk";
import { Command } from "commander";
import {
  BenchmarkOrchestrator,
  createStandardError,
  TaskOMaticErrorCodes,
  type BenchmarkInput,
  type BenchmarkModelConfig,
  type BenchmarkOperationType,
  type BenchmarkRunConfig,
  type ExecuteLoopBenchmarkInput,
  type ExecutionBenchmarkInput,
  type ModelScore,
  type OperationBenchmarkInput,
} from "task-o-matic-core";

// Initialize orchestrator
const orchestrator = new BenchmarkOrchestrator();

export const benchmarkCommand = new Command("bench")
  .alias("benchmark")
  .description("Run and manage AI model benchmarks");

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function parseModelString(modelStr: string): BenchmarkModelConfig {
  const parts = modelStr.split(":");
  if (parts.length < 2) {
    throw createStandardError(
      TaskOMaticErrorCodes.INVALID_INPUT,
      `Invalid model format: ${modelStr}. Expected provider:model[:reasoning=<tokens>]`,
      {
        suggestions: [
          "Use the format 'provider:model'",
          "Example: 'anthropic:claude-3.5-sonnet'",
          "Optionally add reasoning tokens: 'openai:gpt-4:reasoning=2048'",
        ],
      }
    );
  }

  const provider = parts[0];
  const model = parts[1];
  let reasoningTokens: number | undefined;

  if (parts.length > 2) {
    const extra = parts[2];
    if (extra.startsWith("reasoning=")) {
      reasoningTokens = parseInt(extra.split("=")[1], 10);
    }
  }

  return { provider, model, reasoningTokens };
}

function statusColor(status: string): string {
  switch (status) {
    case "completed": return chalk.green(status);
    case "success": return chalk.green(status);
    case "running": return chalk.blue(status);
    case "failed": return chalk.red(status);
    case "partial": return chalk.yellow(status);
    case "error": return chalk.red(status);
    default: return status;
  }
}

// ============================================================================
// RUN COMMAND
// ============================================================================

benchmarkCommand
  .command("run")
  .description("Run a benchmark")
  .argument("<type>", "Type of benchmark (execution, execute-loop, operation, workflow)")
  .requiredOption("-m, --models <models...>", "Models to benchmark (e.g., openai:gpt-4o)")
  .option("-t, --task <id>", "Task ID (for execution type)")
  .option("-s, --status <status>", "Task status filter (for execute-loop type)")
  .option("-o, --operation <id>", "Operation ID (for operation type)")
  .option("-f, --file <path>", "File path (for operation type, e.g., PRD file)")
  .option("-v, --verify <commands...>", "Verification commands to run")
  .option("-r, --max-retries <n>", "Max retries per task", parseInt)
  .option("-c, --concurrency <n>", "Max parallel worktrees", parseInt)
  .option("--base-commit <commit>", "Base commit to start from")
  .action(async (type, options) => {
    try {
      console.log(chalk.bold.blue(`\nStarting ${type} benchmark...\n`));

      // Parse models
      const models: BenchmarkModelConfig[] = options.models.map(parseModelString);

      // Build run config
      const config: BenchmarkRunConfig = {
        models,
        concurrency: options.concurrency ?? 0,
        baseCommit: options.baseCommit,
        keepWorktrees: true, // Always persistent in new system
      };

      // Build input based on type
      let input: BenchmarkInput;

      switch (type) {
        case "execution":
          if (!options.task) throw new Error("--task <id> is required for execution benchmark");
          input = {
            taskId: options.task,
            verificationCommands: options.verify,
            maxRetries: options.maxRetries,
          } as ExecutionBenchmarkInput;
          break;

        case "execute-loop":
          input = {
            loopOptions: {
              filters: { status: options.status },
              config: {
                verificationCommands: options.verify,
                maxRetries: options.maxRetries,
              },
            },
          } as ExecuteLoopBenchmarkInput;
          break;

        case "operation": {
          if (!options.operation) throw new Error("--operation <id> is required for operation benchmark");
          
          // Construct params from available options
          const params: Record<string, unknown> = {};
          if (options.file) params.file = options.file;
          
          input = {
            operationId: options.operation,
            params,
          } as OperationBenchmarkInput;
          break;
        }
          
        case "workflow":
          throw new Error("Workflow benchmark requires complex input. Use CLI wizard or file input (not yet implemented in basic CLI)");

        default:
          throw new Error(`Unknown benchmark type: ${type}`);
      }

      // Execute benchmark
      const run = await orchestrator.run(
        type as BenchmarkOperationType,
        input,
        config,
        (event) => {
          const timestamp = new Date().toLocaleTimeString();
          const prefix = `[${timestamp}] ${chalk.cyan(event.modelId)}`;
          
          switch (event.type) {
            case "start":
              console.log(`${prefix} Starting...`);
              break;
            case "progress":
              console.log(`${prefix} ${event.message}`);
              break;
            case "complete":
              console.log(`${prefix} ${chalk.green("Completed")} (${event.duration}ms)`);
              break;
            case "error":
              console.log(`${prefix} ${chalk.red("Failed")}: ${event.error}`);
              break;
          }
        }
      );

      console.log(chalk.bold.green(`\nBenchmark run completed: ${run.id}`));
      console.log(`Run 'task-o-matic bench show ${run.id}' to view details.`);
      
      // List active worktrees
      console.log(chalk.bold("\nActive Worktrees:"));
      const worktrees = await orchestrator.getWorktreesByRunId(run.id);
      worktrees.forEach(wt => {
        console.log(`  ${chalk.cyan(wt.modelId)}: ${chalk.gray(wt.path)}`);
      });

    } catch (error) {
      console.error(chalk.red("\nBenchmark failed:"));
      console.error(error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

// ============================================================================
// LIST COMMAND
// ============================================================================

benchmarkCommand
  .command("list")
  .description("List benchmark runs")
  .option("-t, --type <type>", "Filter by type")
  .option("-s, --status <status>", "Filter by status")
  .option("-l, --limit <n>", "Limit results", parseInt, 10)
  .action(async (options) => {
    try {
      const runs = await orchestrator.listRuns({
        type: options.type as BenchmarkOperationType,
        status: options.status,
        limit: options.limit
      });

      if (runs.length === 0) {
        console.log("No benchmark runs found.");
        return;
      }

      console.log(chalk.bold("\nBenchmark Runs:"));
      console.log(`${"ID".padEnd(30)}${"Type".padEnd(15)}${"Status".padEnd(12)}${"Models".padEnd(8)}Date`);
      console.log("-".repeat(80));

      runs.forEach(run => {
        const date = new Date(run.createdAt).toLocaleString();
        const statusRaw = run.status;
        const statusColored = statusColor(statusRaw);
        const statusPadded = statusColored + " ".repeat(Math.max(0, 12 - statusRaw.length));
        console.log(
          `${run.id.padEnd(30)}${run.type.padEnd(15)}${statusPadded}${String(run.config.models.length).padEnd(8)}${date}`
        );
      });
      console.log("");

    } catch (error) {
      console.error(chalk.red("Failed to list runs:"), error);
    }
  });

// ============================================================================
// SHOW COMMAND
// ============================================================================

benchmarkCommand
  .command("show")
  .description("Show benchmark run details")
  .argument("<run-id>", "Run ID")
  .action(async (runId) => {
    try {
      const run = await orchestrator.getRun(runId);
      if (!run) {
        console.error(chalk.red(`Run not found: ${runId}`));
        return;
      }

      console.log(chalk.bold(`\nRun: ${run.id}`));
      console.log(`Type: ${run.type}`);
      console.log(`Status: ${statusColor(run.status)}`);
      console.log(`Date: ${new Date(run.createdAt).toLocaleString()}`);
      console.log(`Base Commit: ${run.baseCommit.substring(0, 8)}`);
      
      console.log(chalk.bold("\nResults:"));
      
      // Table Header
      const modelW = 30;
      const statusW = 10;
      const durW = 10;
      const linesW = 15;
      const scoreW = 8;
      
      console.log(
        `${"Model".padEnd(modelW)}${"Status".padEnd(statusW)}${"Duration".padEnd(durW)}${"Lines +/-".padEnd(linesW)}Score`
      );
      console.log("-".repeat(modelW + statusW + durW + linesW + scoreW));

      run.results.forEach(res => {
        const modelId = res.modelId.length > modelW - 2 ? `${res.modelId.substring(0, modelW - 2)}..` : res.modelId;
        
        const statusRaw = res.status === "success" ? "PASS" : 
                       res.status === "error" ? "ERR" : "FAIL";
        const statusColored = res.status === "success" ? chalk.green("PASS") : 
                              res.status === "error" ? chalk.red("ERR") : chalk.yellow("FAIL");
        const statusPadded = statusColored + " ".repeat(Math.max(0, statusW - statusRaw.length));

        const duration = `${Math.round(res.duration / 1000)}s`;
        const lines = res.metrics.code 
          ? `+${res.metrics.code.linesAdded} / -${res.metrics.code.linesRemoved}`
          : "N/A";
        
        const score = run.scores.find(s => s.modelId === res.modelId);
        const scoreStr = score ? `${score.score}/5` : "-";

        console.log(
          `${modelId.padEnd(modelW)}${statusPadded}${duration.padEnd(durW)}${lines.padEnd(linesW)}${scoreStr}`
        );
      });
      console.log("");
      
      // Worktrees hint
      console.log(chalk.gray(`Use 'bench worktrees cleanup ${runId}' to remove worktrees.`));

    } catch (error) {
      console.error(chalk.red("Failed to show run:"), error);
    }
  });

// ============================================================================
// WORKTREES COMMANDS
// ============================================================================

const worktreesCommand = benchmarkCommand.command("worktrees").description("Manage benchmark worktrees");

worktreesCommand
  .command("list")
  .description("List active worktrees")
  .action(async () => {
    try {
      const worktrees = await orchestrator.listWorktrees();
      if (worktrees.length === 0) {
        console.log("No active worktrees.");
        return;
      }

      console.log(chalk.bold(`\nActive Worktrees (${worktrees.length}):`));
      worktrees.forEach(wt => {
        console.log(`${chalk.cyan(wt.name)}`);
        console.log(`  Run: ${wt.runId}`);
        console.log(`  Model: ${wt.modelId}`);
        console.log(`  Path: ${wt.path}`);
        console.log("");
      });
    } catch (error) {
      console.error(chalk.red("Failed to list worktrees:"), error);
    }
  });

worktreesCommand
  .command("cleanup")
  .description("Cleanup worktrees for a run")
  .argument("<run-id>", "Run ID")
  .action(async (runId) => {
    try {
      await orchestrator.cleanupRun(runId);
      console.log(chalk.green(`Cleaned up worktrees for run: ${runId}`));
    } catch (error) {
      console.error(chalk.red("Failed to cleanup worktrees:"), error);
    }
  });

// ============================================================================
// SCORE COMMAND
// ============================================================================

benchmarkCommand
  .command("score")
  .description("Score a model's result")
  .argument("<run-id>", "Run ID")
  .requiredOption("-m, --model <model>", "Model ID")
  .requiredOption("-s, --score <n>", "Score (1-5)", parseInt)
  .option("-n, --note <text>", "Optional note")
  .action(async (runId, options) => {
    try {
      const score: ModelScore = {
        modelId: options.model,
        score: options.score,
        notes: options.note,
        scoredAt: Date.now(),
        scoredBy: "user" // Could get from git config user.name in future
      };

      await orchestrator.scoreModel(runId, score);
      console.log(chalk.green(`Score recorded for ${options.model}`));
    } catch (error) {
      console.error(chalk.red("Failed to record score:"), error);
    }
  });

// ============================================================================
// COMPARE COMMAND
// ============================================================================

benchmarkCommand
  .command("compare")
  .description("Compare results across models (placeholder)")
  .argument("<run-id>", "Run ID")
  .action(async (_runId) => {
    console.log("Compare visualizer coming soon. Use 'bench show' for metrics comparison.");
    // Implementation of detailed comparison (diff visualization etc) would go here
  });
