import { Command } from "commander";
import chalk from "chalk";
import { benchmarkService } from "../services/benchmark";
import { BenchmarkConfig, BenchmarkModelConfig, WorkflowBenchmarkInput } from "../lib/benchmark/types";
import { WorkflowAutomationOptions } from "../types/workflow-options";
import { displayError } from "../cli/display/progress";
import {
  confirmPrompt,
  selectPrompt,
  multiSelectPrompt,
  textInputPrompt,
  editorPrompt,
} from "../utils/workflow-prompts";

export const benchmarkCommand = new Command("benchmark").description(
  "Run and manage AI benchmarks"
);

import {
  createStandardError,
  TaskOMaticErrorCodes,
} from "../utils/task-o-matic-error";

// Helper to parse model string
// Format: provider:model[:reasoning=<tokens>]
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

benchmarkCommand
  .command("run")
  .description("Run a benchmark operation")
  .argument(
    "<operation>",
    "Operation to benchmark (e.g., prd-parse, task-breakdown, task-create, prd-create)"
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
  .option("--feedback <feedback>", "Feedback (for prd-rework)")

  // Task creation options
  .option("--title <title>", "Task title (for task-create)")
  .option("--content <content>", "Task content (for task-create)")
  .option("--parent-id <id>", "Parent task ID (for task-create)")
  .option("--effort <effort>", "Effort estimate: small, medium, large (for task-create)")
  .option("--force", "Force operation (for task-document)")

  // PRD creation options
  .option("--description <desc>", "Project/PRD description (for prd-create, prd-combine)")
  .option("--output-dir <dir>", "Output directory (for prd-create, prd-combine)")
  .option("--filename <name>", "Output filename (for prd-create, prd-combine)")

  // PRD combine options
  .option("--prds <list>", "Comma-separated list of PRD file paths (for prd-combine)")

  // PRD refine options
  .option("--question-mode <mode>", "Question mode: user or ai (for prd-refine)")
  .option("--answers <json>", "JSON string of answers (for prd-refine user mode)")

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
      const input: any = {
        // Common options
        file: options.file,
        taskId: options.taskId,
        prompt: options.prompt,
        message: options.message,
        tools: options.tools,
        feedback: options.feedback,
        workingDirectory: process.cwd(), // Always pass current working directory

        // Task creation options
        title: options.title,
        content: options.content,
        parentId: options.parentId,
        effort: options.effort,
        force: options.force,

        // PRD creation/combine options
        description: options.description,
        outputDir: options.outputDir,
        filename: options.filename,
        prds: options.prds ? options.prds.split(",").map((p: string) => p.trim()) : undefined,

        // PRD refine options
        questionMode: options.questionMode,
        answers: options.answers ? JSON.parse(options.answers) : undefined,
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
      displayError(error);
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
  .command("operations")
  .description("List all available benchmark operations")
  .action(() => {
    const { benchmarkRegistry } = require("../lib/benchmark/registry");
    const operations = benchmarkRegistry.list();

    console.log(chalk.bold("\n📊 Available Benchmark Operations\n"));
    console.log(chalk.dim("Use these operation IDs with 'benchmark run <operation>'\n"));

    // Group by category
    const taskOps = operations.filter((op: any) => op.id.startsWith("task-"));
    const prdOps = operations.filter((op: any) => op.id.startsWith("prd-"));
    const workflowOps = operations.filter((op: any) => op.id.startsWith("workflow-"));

    if (taskOps.length > 0) {
      console.log(chalk.cyan.bold("Task Operations:"));
      taskOps.forEach((op: any) => {
        console.log(`  ${chalk.green(op.id.padEnd(20))} - ${op.description}`);
      });
      console.log();
    }

    if (prdOps.length > 0) {
      console.log(chalk.cyan.bold("PRD Operations:"));
      prdOps.forEach((op: any) => {
        console.log(`  ${chalk.green(op.id.padEnd(20))} - ${op.description}`);
      });
      console.log();
    }

    if (workflowOps.length > 0) {
      console.log(chalk.cyan.bold("Workflow Operations:"));
      workflowOps.forEach((op: any) => {
        console.log(`  ${chalk.green(op.id.padEnd(20))} - ${op.description}`);
      });
      console.log();
    }

    console.log(chalk.dim("\nTotal operations: " + operations.length));
    console.log(chalk.dim("\nExample usage:"));
    console.log(chalk.gray("  task-o-matic benchmark run task-create --models anthropic:claude-3.5-sonnet --title \"Example task\""));
    console.log(chalk.gray("  task-o-matic benchmark run prd-parse --models openai:gpt-4 --file ./prd.md"));
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

benchmarkCommand
  .command("workflow")
  .description("Benchmark complete workflow execution across multiple models")
  .requiredOption(
    "--models <list>",
    "Comma-separated list of models (provider:model[:reasoning=<tokens>])"
  )
  .option("--concurrency <number>", "Max concurrent requests", "3")
  .option("--delay <number>", "Delay between requests in ms", "1000")
  
  // Inherit all workflow command options
  .option("--stream", "Show streaming AI output")
  .option("--skip-all", "Skip all optional steps (use defaults)")
  .option("--auto-accept", "Auto-accept all AI suggestions")
  .option("--config-file <path>", "Load workflow options from JSON file")
  
  // Step 1: Initialize
  .option("--skip-init", "Skip initialization step")
  .option("--project-name <name>", "Project name")
  .option("--init-method <method>", "Initialization method: quick, custom, ai")
  .option("--project-description <desc>", "Project description for AI-assisted init")
  .option("--frontend <framework>", "Frontend framework")
  .option("--backend <framework>", "Backend framework") 
  .option("--database <db>", "Database choice")
  .option("--auth", "Include authentication")
  .option("--no-auth", "Exclude authentication")
  .option("--bootstrap", "Bootstrap with Better-T-Stack")
  .option("--no-bootstrap", "Skip bootstrapping")
  
  // Step 2: Define PRD
  .option("--skip-prd", "Skip PRD definition")
  .option("--prd-method <method>", "PRD method: upload, manual, ai, skip")
  .option("--prd-file <path>", "Path to existing PRD file")
  .option("--prd-description <desc>", "Product description for AI-assisted PRD")
  .option("--prd-content <content>", "Direct PRD content")
  
  // Step 3: Refine PRD
  .option("--skip-refine", "Skip PRD refinement") 
  .option("--refine-method <method>", "Refinement method: manual, ai, skip")
  .option("--refine-feedback <feedback>", "Feedback for AI refinement")
  
  // Step 4: Generate Tasks
  .option("--skip-generate", "Skip task generation")
  .option("--generate-method <method>", "Generation method: standard, ai") 
  .option("--generate-instructions <instructions>", "Custom task generation instructions")
  
  // Step 5: Split Tasks
  .option("--skip-split", "Skip task splitting")
  .option("--split-tasks <ids>", "Comma-separated task IDs to split")
  .option("--split-all", "Split all tasks")
  .option("--split-method <method>", "Split method: interactive, standard, custom")
  .option("--split-instructions <instructions>", "Custom split instructions")
  
  .action(async (options) => {
    try {
      await runWorkflowBenchmark(options);
    } catch (error: any) {
      displayError(error);
      process.exit(1);
    }
  });

/**
 * Execute workflow benchmark across multiple models
 */
async function runWorkflowBenchmark(options: any): Promise<void> {
  console.log(chalk.blue.bold("\n🚀 Task-O-Matic Workflow Benchmark\n"));
  
  // Parse models
  const modelStrings = options.models.split(",");
  const models: BenchmarkModelConfig[] = modelStrings.map((s: string) =>
    parseModelString(s.trim())
  );

  const config: BenchmarkConfig = {
    models,
    concurrency: parseInt(options.concurrency, 10),
    delay: parseInt(options.delay, 10),
  };

  console.log(chalk.dim(`Models: ${models.length}, Concurrency: ${config.concurrency}, Delay: ${config.delay}ms`));
  
  // Phase 1: Collect user responses interactively
  console.log(chalk.blue.bold("\n📋 Phase 1: Collecting Workflow Responses\n"));
  console.log(chalk.gray("Please answer the following questions. Your responses will be used for all models."));
  
  const collectedResponses = await collectWorkflowResponses(options);
  
  // Phase 2: Execute workflow on all models
  console.log(chalk.blue.bold("\n⚡ Phase 2: Executing Workflows\n"));
  console.log(chalk.gray(`Running workflow on ${models.length} models...\n`));
  
  // Prepare workflow input
  const workflowInput: WorkflowBenchmarkInput = {
    collectedResponses,
    workflowOptions: options as WorkflowAutomationOptions,
    tempDirBase: "/tmp",
  };

  // Prepare dashboard
  console.log(chalk.bold("Benchmark Progress:"));
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
    "workflow-full",
    workflowInput,
    config,
    (event) => {
      const index = modelMap.get(event.modelId);
      if (index === undefined) return;

      // Update status in memory
      let statusStr = "";
      if (event.type === "start") {
        statusStr = chalk.yellow("Starting...");
      } else if (event.type === "progress") {
        statusStr = chalk.blue("Running workflow...");
      } else if (event.type === "complete") {
        statusStr = chalk.green(`Completed (${event.duration}ms)`);
      } else if (event.type === "error") {
        statusStr = chalk.red(`Failed: ${event.error}`);
      }
      modelStatus.set(event.modelId, statusStr);

      // Update display
      const up = totalModels - index;
      process.stdout.write(`\x1B[${up}A`); // Move up
      process.stdout.write(`\x1B[2K`); // Clear line
      process.stdout.write(
        `- ${chalk.bold(event.modelId)}: ${statusStr}\r`
      );
      process.stdout.write(`\x1B[${up}B`); // Move down
    }
  );

  console.log(chalk.green(`\n✅ Workflow benchmark completed! Run ID: ${run.id}`));
  
  // Display results
  await displayWorkflowBenchmarkResults(run);
  
  // Optional: Let user select a model for project setup
  await promptForModelSelection(run, collectedResponses);
}

/**
 * Collect workflow responses from user interactively
 */
async function collectWorkflowResponses(options: any): Promise<WorkflowBenchmarkInput["collectedResponses"]> {
  // Use provided options or prompt user
  const getOrPrompt = async <T>(
    preAnswered: T | undefined,
    promptFn: () => Promise<T>,
    skipCondition: boolean = false
  ): Promise<T> => {
    if (skipCondition) {
      throw new Error("Step skipped");
    }
    if (preAnswered !== undefined) {
      return preAnswered;
    }
    return promptFn();
  };

  // Project setup questions
  const projectName = await getOrPrompt(options.projectName, () =>
    textInputPrompt("What is the name of your project?", "my-benchmark-project")
  );

  const initMethod = await getOrPrompt(options.initMethod, () =>
    selectPrompt("How would you like to configure your project stack?", [
      { name: "Quick start (recommended defaults)", value: "quick" },
      { name: "Custom configuration", value: "custom" },
      { name: "AI-assisted (describe your project)", value: "ai" },
    ])
  );

  let projectDescription: string | undefined;
  if (initMethod === "ai") {
    projectDescription = await getOrPrompt(options.projectDescription, () =>
      textInputPrompt("Describe your project (e.g., 'A SaaS app for team collaboration'):")
    );
  }

  // Stack configuration (for custom method)
  let stackConfig: any = {};
  if (initMethod === "custom") {
    stackConfig.frontend = await getOrPrompt(options.frontend, () =>
      selectPrompt("Frontend framework:", ["next", "react", "vue", "svelte"])
    );
    stackConfig.backend = await getOrPrompt(options.backend, () =>
      selectPrompt("Backend framework:", ["hono", "express", "fastify", "nestjs"])
    );
    stackConfig.database = await getOrPrompt(options.database, () =>
      selectPrompt("Database:", ["sqlite", "postgres", "mysql", "mongodb"])
    );
    stackConfig.auth = await getOrPrompt(options.auth, () =>
      confirmPrompt("Include authentication?", true)
    );
  }

  // PRD questions
  const prdMethod = await getOrPrompt(options.prdMethod, () =>
    selectPrompt("How would you like to define your PRD?", [
      { name: "AI-assisted creation", value: "ai" },
      { name: "Upload existing file", value: "upload" },
      { name: "Write manually", value: "manual" },
      { name: "Skip PRD", value: "skip" },
    ])
  );

  let prdDescription: string | undefined;
  let prdFile: string | undefined;
  let prdContent: string | undefined;

  if (prdMethod === "ai") {
    prdDescription = await getOrPrompt(options.prdDescription, () =>
      textInputPrompt("Describe your product in detail:")
    );
  } else if (prdMethod === "upload") {
    prdFile = await getOrPrompt(options.prdFile, () =>
      textInputPrompt("Path to PRD file:")
    );
  } else if (prdMethod === "manual") {
    prdContent = await getOrPrompt(options.prdContent, () =>
      editorPrompt("Write your PRD:", "# Product Requirements Document\n\n## Overview\n\n## Features\n\n")
    );
  }

  // Additional workflow questions
  const refinePrd = !options.skipRefine && prdMethod !== "skip" ? 
    await confirmPrompt("Refine PRD with AI feedback?", false) : false;
    
  let refineFeedback: string | undefined;
  if (refinePrd) {
    refineFeedback = await getOrPrompt(options.refineFeedback, () =>
      textInputPrompt("What feedback should be used for PRD refinement?", "Add more technical details and clarify requirements")
    );
  }

  const generateTasks = !options.skipGenerate && prdMethod !== "skip";
  const customInstructions = options.generateInstructions || 
    (generateTasks ? await textInputPrompt("Custom task generation instructions (optional):", "") : undefined);

  const splitTasks = !options.skipSplit && generateTasks ? 
    await confirmPrompt("Split complex tasks into subtasks?", true) : false;
    
  const splitInstructions = splitTasks && options.splitInstructions ? 
    options.splitInstructions : 
    (splitTasks ? await textInputPrompt("Custom splitting instructions (optional):", "Break into 2-4 hour chunks") : undefined);

  return {
    projectName,
    initMethod: initMethod as "quick" | "custom" | "ai",
    projectDescription,
    stackConfig,
    prdMethod: prdMethod as "upload" | "manual" | "ai" | "skip",
    prdContent,
    prdDescription,
    prdFile,
    refinePrd,
    refineFeedback,
    generateTasks,
    customInstructions,
    splitTasks,
    splitInstructions,
  };
}

/**
 * Display workflow benchmark results in a comprehensive format
 */
async function displayWorkflowBenchmarkResults(run: any): Promise<void> {
  console.log(chalk.bold("\n📊 Workflow Benchmark Results\n"));
  
  // Summary table
  console.log(
    chalk.bold(
      `${"Model".padEnd(40)} | ${"Duration".padEnd(10)} | ${"Tasks".padEnd(8)} | ${"PRD Size".padEnd(10)} | ${"Steps".padEnd(8)} | ${"Cost".padEnd(10)}`
    )
  );
  console.log("-".repeat(130));

  run.results.forEach((r: any) => {
    const duration = `${r.duration}ms`.padEnd(10);
    const taskCount = r.output?.stats?.totalTasks || 0;
    const tasks = `${taskCount}`.padEnd(8);
    const prdSize = r.output?.stats?.prdSize ? `${r.output.stats.prdSize} chars`.padEnd(10) : "-".padEnd(10);
    const steps = r.output?.stats ? `${r.output.stats.successfulSteps}/${r.output.stats.totalSteps}`.padEnd(8) : "-".padEnd(8);
    const cost = r.cost ? `$${r.cost.toFixed(6)}`.padEnd(10) : "-".padEnd(10);

    console.log(
      `${r.modelId.padEnd(40)} | ${duration} | ${tasks} | ${prdSize} | ${steps} | ${cost}`
    );
    
    if (r.error) {
      console.log(chalk.red(`  Error: ${r.error}`));
    }
  });
  
  // Detailed comparison
  console.log(chalk.bold("\n🔍 Detailed Comparison\n"));
  
  run.results.forEach((r: any, index: number) => {
    if (r.error) return;
    
    console.log(chalk.cyan(`\n[${index + 1}] ${r.modelId}`));
    console.log(`Duration: ${r.duration}ms`);
    
    if (r.output?.stats) {
      const stats = r.output.stats;
      console.log(`Steps Completed: ${stats.successfulSteps}/${stats.totalSteps}`);
      if (stats.initDuration) console.log(`  Init: ${stats.initDuration}ms`);
      if (stats.prdGenerationDuration) console.log(`  PRD Generation: ${stats.prdGenerationDuration}ms`);
      if (stats.taskGenerationDuration) console.log(`  Task Generation: ${stats.taskGenerationDuration}ms`);
      if (stats.taskSplittingDuration) console.log(`  Task Splitting: ${stats.taskSplittingDuration}ms`);
      console.log(`Tasks Created: ${stats.totalTasks}`);
      if (stats.tasksWithSubtasks) console.log(`Tasks with Subtasks: ${stats.tasksWithSubtasks}`);
      if (stats.prdSize) console.log(`PRD Size: ${stats.prdSize} characters`);
    }
    
    if (r.tokenUsage) {
      console.log(`Tokens: ${r.tokenUsage.total} (Prompt: ${r.tokenUsage.prompt}, Completion: ${r.tokenUsage.completion})`);
    }
    
    if (r.cost) {
      console.log(`Cost: $${r.cost.toFixed(6)}`);
    }
  });
}

/**
 * Allow user to select a model and set up project with its results
 */
async function promptForModelSelection(run: any, responses: any): Promise<void> {
  const successfulResults = run.results.filter((r: any) => !r.error);
  
  if (successfulResults.length === 0) {
    console.log(chalk.yellow("\n⚠️  No successful results to select from."));
    return;
  }
  
  if (successfulResults.length === 1) {
    console.log(chalk.green(`\n✅ Only one successful result from ${successfulResults[0].modelId}`));
    return;
  }
  
  console.log(chalk.blue.bold("\n🎯 Model Selection\n"));
  
  const shouldSelect = await confirmPrompt(
    "Would you like to select a model and set up your project with its results?", 
    false
  );
  
  if (!shouldSelect) {
    console.log(chalk.gray("Benchmark complete. Results have been saved."));
    return;
  }
  
  const choices = successfulResults.map((r: any, index: number) => ({
    name: `${r.modelId} (${r.duration}ms, ${r.output?.stats?.totalTasks || 0} tasks, $${r.cost?.toFixed(6) || 'unknown'})`,
    value: index,
  }));
  
  const selectedIndex = await selectPrompt(
    "Select the model whose results you want to use for your project:",
    choices
  );
  
  const selectedResult = successfulResults[selectedIndex];
  
  console.log(chalk.green(`\n✅ Selected: ${selectedResult.modelId}`));
  console.log(chalk.gray("Setting up your project with the selected results..."));
  
  // Get target directory
  const targetDir = await textInputPrompt(
    "Enter target directory for your project:",
    `./${responses.projectName}`
  );
  
  try {
    console.log(chalk.cyan("\n🔧 Applying benchmark results..."));
    
    const { workflowBenchmarkService } = await import("../services/workflow-benchmark");
    const result = await workflowBenchmarkService.applyBenchmarkResult(
      selectedResult,
      targetDir,
      responses
    );
    
    if (result.success) {
      console.log(chalk.green(`\n✅ ${result.message}`));
      console.log(chalk.cyan("\nNext steps:"));
      console.log(chalk.gray(`  • Navigate to: cd ${targetDir}`));
      console.log(chalk.gray("  • Review your tasks: task-o-matic tasks list"));
      console.log(chalk.gray("  • View task tree: task-o-matic tasks tree"));
      console.log(chalk.gray("  • Start working: task-o-matic tasks next"));
    } else {
      console.log(chalk.red(`\n❌ ${result.message}`));
    }
  } catch (error) {
    console.log(chalk.red(`\n❌ Failed to apply results: ${error instanceof Error ? error.message : String(error)}`));
  }
}
