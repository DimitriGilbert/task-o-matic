import { Command } from "commander";
import chalk from "chalk";
import { benchmarkService } from "../services/benchmark";
import { BenchmarkConfig, BenchmarkModelConfig } from "../lib/benchmark/types";

export const benchmarkCommand = new Command("benchmark").description(
  "Run and manage AI benchmarks"
);

// Helper to parse model string
// Format: provider:model[:reasoning=<tokens>]
function parseModelString(modelStr: string): BenchmarkModelConfig {
  const parts = modelStr.split(":");
  if (parts.length < 2) {
    throw new Error(
      `Invalid model format: ${modelStr}. Expected provider:model[:reasoning=<tokens>]`
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

benchmarkCommand
  .command("run")
  .description("Run a benchmark operation")
  .argument(
    "<operation>",
    "Operation to benchmark (e.g., prd-parse, task-breakdown)"
  )
  .requiredOption(
    "--models <list>",
    "Comma-separated list of models (provider:model[:reasoning=<tokens>])"
  )
  .option("--file <path>", "Input file path (for PRD ops)")
  .option("--task-id <id>", "Task ID (for Task ops)")
  .option("--concurrency <number>", "Max concurrent requests", "5")
  .option("--delay <number>", "Delay between requests in ms", "250")
  .option("--prompt <prompt>", "Override prompt")
  .option("--message <message>", "User message")
  .option("--tools", "Enable filesystem tools")
  .option("--feedback <feedback>", "Feedback (for rework)")
  .action(async (operation, options) => {
    try {
      const modelStrings = options.models.split(",");
      const models: BenchmarkModelConfig[] = modelStrings.map((s: string) =>
        parseModelString(s.trim())
      );

      const config: BenchmarkConfig = {
        models,
        concurrency: parseInt(options.concurrency, 10),
        delay: parseInt(options.delay, 10),
      };

      console.log(chalk.blue(`Starting benchmark for ${operation}...`));
      console.log(
        chalk.dim(
          `Models: ${models.length}, Concurrency: ${config.concurrency}, Delay: ${config.delay}ms`
        )
      );

      // Construct input object with all potential options
      const input = {
        file: options.file,
        taskId: options.taskId,
        prompt: options.prompt,
        message: options.message,
        tools: options.tools,
        feedback: options.feedback,
        workingDirectory: process.cwd(), // Always pass current working directory
      };

      const run = await benchmarkService.runBenchmark(operation, input, config);

      console.log(chalk.green(`\n✓ Benchmark completed! Run ID: ${run.id}`));

      // Summary
      console.log(chalk.bold("\nResults:"));
      run.results.forEach((res) => {
        const status = res.error ? chalk.red("FAILED") : chalk.green("SUCCESS");
        const duration = `${res.duration}ms`;
        const tokens = res.tokenUsage ? `${res.tokenUsage.total}t` : "?";
        const bps = res.bps ? `${res.bps}B/s` : "?";

        console.log(
          `- ${chalk.cyan(
            res.modelId
          )}: ${status} (${duration}, ${tokens}, ${bps})`
        );
        if (res.error) {
          console.log(chalk.red(`  Error: ${res.error}`));
        }
      });
    } catch (error: any) {
      console.error(chalk.red("Benchmark failed:"), error.message);
      process.exit(1);
    }
  });

benchmarkCommand
  .command("list")
  .description("List past benchmark runs")
  .action(() => {
    const runs = benchmarkService.listRuns();
    if (runs.length === 0) {
      console.log(chalk.yellow("No benchmark runs found."));
      return;
    }

    console.log(chalk.bold("Benchmark Runs:"));
    runs.forEach((run) => {
      const date = new Date(run.timestamp).toLocaleString();
      console.log(`- ${chalk.cyan(run.id)} (${date}) - ${run.command}`);
    });
  });

benchmarkCommand
  .command("show")
  .description("Show details of a benchmark run")
  .argument("<id>", "Run ID")
  .action((id) => {
    const run = benchmarkService.getRun(id);
    if (!run) {
      console.error(chalk.red(`Run ${id} not found`));
      process.exit(1);
    }

    console.log(chalk.bold(`Run: ${run.id}`));
    console.log(`Date: ${new Date(run.timestamp).toLocaleString()}`);
    console.log(`Command: ${run.command}`);
    console.log(`Input: ${JSON.stringify(run.input, null, 2)}`); // Might be large
    console.log(chalk.bold("\nConfiguration:"));
    console.log(`Concurrency: ${run.config.concurrency}`);
    console.log(`Delay: ${run.config.delay}ms`);

    console.log(chalk.bold("\nResults:"));
    run.results.forEach((res) => {
      console.log(chalk.cyan(`\n[${res.modelId}]`));
      console.log(`Duration: ${res.duration}ms`);
      if (res.tokenUsage) {
        console.log(
          `Tokens: ${res.tokenUsage.total} (Prompt: ${res.tokenUsage.prompt}, Completion: ${res.tokenUsage.completion})`
        );
      }
      if (res.bps) {
        console.log(`Throughput: ${res.bps} B/s`);
      }
      if (res.responseSize) {
        console.log(`Size: ${res.responseSize} bytes`);
      }

      if (res.error) {
        console.log(chalk.red(`Error: ${res.error}`));
      } else {
        // Truncate output for display
        const outputStr = JSON.stringify(res.output, null, 2);
        const preview =
          outputStr.length > 500
            ? outputStr.substring(0, 500) + "..."
            : outputStr;
        console.log(`Output: ${preview}`);
      }
    });
  });

benchmarkCommand
  .command("compare")
  .description("Compare results of a benchmark run")
  .argument("<id>", "Run ID")
  .action((id) => {
    const run = benchmarkService.getRun(id);
    if (!run) {
      console.error(chalk.red(`Run ${id} not found`));
      process.exit(1);
    }

    console.log(chalk.bold(`Comparison for Run: ${run.id}`));

    // Simple comparison: Duration and Success/Fail
    // In future could add diffing of outputs

    const table = run.results.map((res) => ({
      Model: res.modelId,
      Status: res.error ? "FAILED" : "SUCCESS",
      Duration: `${res.duration}ms`,
      Tokens: res.tokenUsage ? res.tokenUsage.total : "?",
      BPS: res.bps ? res.bps : "?",
      Size: res.responseSize
        ? res.responseSize
        : res.output
        ? JSON.stringify(res.output).length
        : 0,
    }));

    console.table(table);
  });
