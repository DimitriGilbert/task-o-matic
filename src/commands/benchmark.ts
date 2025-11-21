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

      // Prepare dashboard
      console.log(chalk.bold("\nBenchmark Progress:"));
      const modelMap = new Map<string, number>();
      const modelStatus = new Map<string, string>();

      // Print initial lines and map indices
      models.forEach((m, i) => {
        const id = `${m.provider}:${m.model}${
          m.reasoningTokens ? `:reasoning=${m.reasoningTokens}` : ""
        }`;
        modelMap.set(id, i);
        modelStatus.set(id, "Waiting...");
        console.log(chalk.dim(`- ${id}: Waiting...`));
      });
      const totalModels = models.length;

      const run = await benchmarkService.runBenchmark(
        operation,
        input,
        config,
        (event) => {
          const index = modelMap.get(event.modelId);
          if (index === undefined) return;

          // Update status in memory
          let statusStr = "";
          if (event.type === "start") {
            statusStr = chalk.yellow("Starting...");
          } else if (event.type === "progress") {
            const bps = event.currentBps ? `${event.currentBps} B/s` : "0 B/s";
            const size = event.currentSize ? `${event.currentSize} B` : "0 B";
            statusStr = `${chalk.blue(
              "Running"
            )} - Size: ${size}, Speed: ${bps}`;
          } else if (event.type === "complete") {
            statusStr = chalk.green(`Completed (${event.duration}ms)`);
          } else if (event.type === "error") {
            statusStr = chalk.red(`Failed: ${event.error}`);
          }
          modelStatus.set(event.modelId, statusStr);

          // Update display
          // Move cursor up to the specific line
          // Distance from bottom = totalModels - index
          const up = totalModels - index;
          process.stdout.write(`\x1B[${up}A`); // Move up
          process.stdout.write(`\x1B[2K`); // Clear line
          process.stdout.write(
            `- ${chalk.bold(event.modelId)}: ${statusStr}\r`
          );
          process.stdout.write(`\x1B[${up}B`); // Move down
        }
      );

      console.log(chalk.green(`\n✓ Benchmark completed! Run ID: ${run.id}`));

      console.log(
        chalk.bold(
          `\n${"Model".padEnd(40)} | ${"Duration".padEnd(10)} | ${"TTFT".padEnd(
            8
          )} | ${"Tokens".padEnd(10)} | ${"TPS".padEnd(8)} | ${"BPS".padEnd(
            8
          )} | ${"Size".padEnd(10)} | ${"Cost".padEnd(10)}`
        )
      );
      console.log("-".repeat(130)); // Adjusted line length for new columns

      run.results.forEach((r) => {
        const duration = `${r.duration}ms`.padEnd(10);
        const ttft = r.timeToFirstToken
          ? `${r.timeToFirstToken}ms`.padEnd(8)
          : "-".padEnd(8);
        const tokens = r.tokenUsage
          ? `${r.tokenUsage.total}`.padEnd(10)
          : "-".padEnd(10);
        const tps = r.tps ? `${r.tps}`.padEnd(8) : "-".padEnd(8);
        const bps = r.bps ? `${r.bps}`.padEnd(8) : "-".padEnd(8);
        const size = r.responseSize
          ? `${r.responseSize}`.padEnd(10)
          : "-".padEnd(10);
        const cost = r.cost
          ? `$${r.cost.toFixed(6)}`.padEnd(10)
          : "-".padEnd(10);

        console.log(
          `${r.modelId.padEnd(
            40
          )} | ${duration} | ${ttft} | ${tokens} | ${tps} | ${bps} | ${size} | ${cost}`
        );
        if (r.error) {
          console.log(chalk.red(`  Error: ${r.error}`));
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
    const results = run.results;
    results.forEach((result) => {
      console.log(chalk.bold(`\n[${result.modelId}]`));
      console.log(`Duration: ${result.duration}ms`);
      if (result.timeToFirstToken) {
        console.log(`TTFT: ${result.timeToFirstToken}ms`);
      }
      if (result.tokenUsage) {
        console.log(
          `Tokens: ${result.tokenUsage.total} (Prompt: ${result.tokenUsage.prompt}, Completion: ${result.tokenUsage.completion})`
        );
      }
      if (result.bps) {
        console.log(`Throughput: ${result.bps} B/s`);
      }
      if (result.responseSize) {
        console.log(`Size: ${result.responseSize} bytes`);
      }
      if (result.cost) {
        console.log(`Estimated Cost: $${result.cost.toFixed(6)}`);
      }

      if (result.error) {
        console.log(chalk.red(`Error: ${result.error}`));
      } else {
        const outputStr =
          typeof result.output === "string"
            ? result.output
            : JSON.stringify(result.output, null, 2);
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
