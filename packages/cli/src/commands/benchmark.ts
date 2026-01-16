/**
 * Benchmark CLI Commands
 *
 * NOTE: This file is temporarily disabled pending Phase 4 of the benchmark system redesign.
 * The old benchmark services have been replaced with new worktree-based infrastructure.
 * This file will be completely rewritten in Phase 4.
 *
 * See opus_bench_v2.md for the redesign plan.
 */

import { Command } from "commander";
import chalk from "chalk";

// ===========================================================================
// PHASE 4 TODO: Replace with new benchmark orchestrator and types
// ===========================================================================
// OLD IMPORTS (REMOVED - services deleted):
// import { benchmarkService } from "task-o-matic-core";
// import { benchmarkRegistry } from "task-o-matic-core";
// import { BenchmarkConfig, WorkflowBenchmarkInput } from "task-o-matic-core";
// ===========================================================================

import {
  BenchmarkModelConfig,
  WorkflowBenchmarkInput,
} from "task-o-matic-core";
import { WorkflowAutomationOptions } from "task-o-matic-core";
import { displayError } from "../cli/display/progress";
import {
  confirmPrompt,
  selectPrompt,
  textInputPrompt,
} from "../utils/workflow-prompts";

export const benchmarkCommand = new Command("benchmark").description(
  "Run and manage AI benchmarks (UNDER RECONSTRUCTION - Phase 4 pending)"
);

import { createStandardError, TaskOMaticErrorCodes } from "task-o-matic-core";
import {
  parseTryModels,
} from "task-o-matic-core";
import {
  ExecuteLoopOptions,
  ModelAttemptConfig,
} from "task-o-matic-core";

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

// ===========================================================================
// TEMPORARILY DISABLED COMMANDS
// These will be reimplemented in Phase 4 with the new worktree-based system
// ===========================================================================

benchmarkCommand
  .command("run")
  .description("[DISABLED] Run a benchmark operation - pending Phase 4 rewrite")
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
  .action(async (_operation, _options) => {
    console.log(chalk.yellow("\n⚠️  Benchmark commands are temporarily disabled.\n"));
    console.log(chalk.dim("The benchmark system is being redesigned with:"));
    console.log(chalk.dim("  - True parallel execution via git worktrees"));
    console.log(chalk.dim("  - Persistent worktrees for manual inspection"));
    console.log(chalk.dim("  - Comprehensive code metrics and scoring"));
    console.log(chalk.dim("\nSee opus_bench_v2.md for the redesign plan."));
    console.log(chalk.dim("Phase 4 will implement the new CLI commands.\n"));
  });

benchmarkCommand
  .command("list")
  .description("[DISABLED] List past benchmark runs - pending Phase 4 rewrite")
  .action(() => {
    console.log(chalk.yellow("\n⚠️  Benchmark commands are temporarily disabled.\n"));
    console.log(chalk.dim("Phase 4 will implement: npx task-o-matic bench list"));
  });

benchmarkCommand
  .command("operations")
  .description("[DISABLED] List available benchmark operations - pending Phase 4 rewrite")
  .action(() => {
    console.log(chalk.yellow("\n⚠️  Benchmark commands are temporarily disabled.\n"));
    console.log(chalk.dim("Phase 4 will implement operation registry."));
  });

benchmarkCommand
  .command("show")
  .description("[DISABLED] Show details of a benchmark run - pending Phase 4 rewrite")
  .argument("<id>", "Run ID")
  .action((_id) => {
    console.log(chalk.yellow("\n⚠️  Benchmark commands are temporarily disabled.\n"));
    console.log(chalk.dim("Phase 4 will implement: npx task-o-matic bench show <run-id>"));
  });

benchmarkCommand
  .command("compare")
  .description("[DISABLED] Compare results of a benchmark run - pending Phase 4 rewrite")
  .argument("<id>", "Run ID")
  .action((_id) => {
    console.log(chalk.yellow("\n⚠️  Benchmark commands are temporarily disabled.\n"));
    console.log(chalk.dim("Phase 4 will implement: npx task-o-matic bench compare <run-id>"));
  });

benchmarkCommand
  .command("execution")
  .description("[DISABLED] Run execution benchmark - pending Phase 4 rewrite")
  .requiredOption("--task-id <id>", "Task ID to benchmark")
  .requiredOption(
    "--models <list>",
    "Comma-separated list of models (provider:model)"
  )
  .action(async (_options) => {
    console.log(chalk.yellow("\n⚠️  Benchmark commands are temporarily disabled.\n"));
    console.log(chalk.dim("Phase 4 will implement: npx task-o-matic bench run execution --task <id> --models ..."));
  });

benchmarkCommand
  .command("execute-loop")
  .description("[DISABLED] Benchmark task loop execution - pending Phase 4 rewrite")
  .option("--status <status>", "Filter tasks by status")
  .requiredOption(
    "--models <list>",
    "Comma-separated list of models (provider:model)"
  )
  .action(async (_options) => {
    console.log(chalk.yellow("\n⚠️  Benchmark commands are temporarily disabled.\n"));
    console.log(chalk.dim("Phase 4 will implement: npx task-o-matic bench run execute-loop --status <status> --models ..."));
  });

benchmarkCommand
  .command("workflow")
  .description("[DISABLED] Benchmark complete workflow - pending Phase 4 rewrite")
  .requiredOption(
    "--models <list>",
    "Comma-separated list of models (provider:model[:reasoning=<tokens>])"
  )
  .action(async (_options) => {
    console.log(chalk.yellow("\n⚠️  Benchmark commands are temporarily disabled.\n"));
    console.log(chalk.dim("Phase 4 will implement: npx task-o-matic bench run workflow --models ..."));
  });

// ===========================================================================
// PRESERVED UTILITIES FOR PHASE 4
// These helper functions will be reused in the Phase 4 implementation
// ===========================================================================

/**
 * Collect workflow responses from user interactively
 * (Preserved for Phase 4 - will be used by new workflow benchmark)
 */
async function collectWorkflowResponses(
  options: Record<string, unknown>
): Promise<WorkflowBenchmarkInput["collectedResponses"]> {
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
  const projectName = await getOrPrompt(options.projectName as string | undefined, () =>
    textInputPrompt("What is the name of your project?", "benchmark-proj")
  );

  const initMethod = await getOrPrompt(options.initMethod as string | undefined, () =>
    selectPrompt("How would you like to configure your project stack?", [
      { name: "Quick start (recommended defaults)", value: "quick" },
      { name: "Custom configuration", value: "custom" },
      { name: "AI-assisted (describe your project)", value: "ai" },
    ])
  );

  let projectDescription: string | undefined;
  if (initMethod === "ai") {
    projectDescription = await getOrPrompt(options.projectDescription as string | undefined, () =>
      textInputPrompt("Describe your project:")
    );
  }

  // Stack configuration (if custom)
  let stackConfig: {
    frontend?: string;
    backend?: string;
    database?: string;
    auth?: boolean;
  } = {};
  if (initMethod === "custom") {
    stackConfig.frontend = await getOrPrompt(options.frontend as string | undefined, () =>
      selectPrompt("Frontend framework:", ["next", "react", "vue"])
    );
    stackConfig.backend = await getOrPrompt(options.backend as string | undefined, () =>
      selectPrompt("Backend framework:", ["hono", "express", "fastify"])
    );
    stackConfig.auth = await getOrPrompt(options.auth as boolean | undefined, () =>
      confirmPrompt("Include authentication?", true)
    );
  }

  // PRD questions
  const prdMethod = await getOrPrompt(options.prdMethod as string | undefined, () =>
    selectPrompt("How would you like to define your PRD?", [
      { name: "AI-assisted creation", value: "ai" },
      { name: "Upload existing file", value: "upload" },
      { name: "Skip PRD", value: "skip" },
    ])
  );

  let prdDescription: string | undefined;
  let prdFile: string | undefined;

  if (prdMethod === "ai") {
    prdDescription = await getOrPrompt(options.prdDescription as string | undefined, () =>
      textInputPrompt("Describe your product in detail:")
    );
  } else if (prdMethod === "upload") {
    prdFile = await getOrPrompt(options.prdFile as string | undefined, () =>
      textInputPrompt("Path to PRD file:")
    );
  }

  const generateTasks = !options.skipGenerate && prdMethod !== "skip";
  const customInstructions =
    (options.generateInstructions as string | undefined) ||
    (generateTasks
      ? await textInputPrompt(
          "Custom task generation instructions (optional):",
          ""
        )
      : undefined);

  const splitTasks =
    !options.skipSplit && generateTasks
      ? await confirmPrompt("Split complex tasks into subtasks?", true)
      : false;

  const splitInstructions =
    splitTasks && options.splitInstructions
      ? (options.splitInstructions as string)
      : splitTasks
      ? await textInputPrompt(
          "Custom splitting instructions (optional):",
          "Break into 2-4 hour chunks"
        )
      : undefined;

  return {
    projectName,
    initMethod: initMethod as "quick" | "custom" | "ai",
    projectDescription,
    stackConfig,
    prdMethod: prdMethod as "upload" | "manual" | "ai" | "skip",
    prdContent: undefined,
    prdDescription,
    prdFile,
    refinePrd: false,
    refineFeedback: undefined,
    generateTasks,
    customInstructions,
    splitTasks,
    splitInstructions,
  };
}

// Export utilities for Phase 4
export { parseModelString, collectWorkflowResponses };
