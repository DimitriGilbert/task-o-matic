#!/usr/bin/env node

import { Command } from "commander";
import chalk from "chalk";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";
import { workflowService } from "@task-o-matic/core";
import { configManager } from "@task-o-matic/core";
import { prdService } from "@task-o-matic/core";
import { runBetterTStackCLI } from "@task-o-matic/core";
import inquirer from "inquirer";
import {
  confirmPrompt,
  selectPrompt,
  multiSelectPrompt,
  textInputPrompt,
  editorPrompt,
  passwordPrompt,
} from "../utils/workflow-prompts";
import { providerDefaults } from "@task-o-matic/core";
import { createStreamingOptions } from "@task-o-matic/core";
import { displayProgress, displayError } from "../cli/display/progress";
import type {
  WorkflowState,
  WorkflowAutomationOptions,
} from "@task-o-matic/core";
import type {
  Task,
  ExecuteLoopOptions,
  ExecuteLoopConfig,
  ExecutorTool,
} from "@task-o-matic/core";
import { createStandardError, TaskOMaticErrorCodes } from "@task-o-matic/core";

export const workflowCommand = new Command("workflow")
  .description(
    "Interactive workflow for complete project setup and task management"
  )
  // Existing AI options
  .option("--stream", "Show streaming AI output")
  .option("--ai-provider <provider>", "AI provider override")
  .option("--ai-model <model>", "AI model override")
  .option("--ai-key <key>", "AI API key override")
  .option("--ai-provider-url <url>", "AI provider URL override")

  // Global workflow control
  .option("--skip-all", "Skip all optional steps (use defaults)")
  .option("--auto-accept", "Auto-accept all AI suggestions")
  .option("--config-file <path>", "Load workflow options from JSON file")

  // Step 1: Initialize
  .option("--skip-init", "Skip initialization step")
  .option("--project-name <name>", "Project name")
  .option("--init-method <method>", "Initialization method: quick, custom, ai")
  .option(
    "--project-description <desc>",
    "Project description for AI-assisted init"
  )
  .option("--use-existing-config", "Use existing configuration if found")
  .option("--frontend <framework>", "Frontend framework")
  .option("--backend <framework>", "Backend framework")
  .option("--database <db>", "Database choice")
  .option("--auth", "Include authentication")
  .option("--no-auth", "Exclude authentication")
  .option("--bootstrap", "Bootstrap with Better-T-Stack")
  .option("--no-bootstrap", "Skip bootstrapping")
  .option(
    "--include-docs",
    "Include Task-O-Matic documentation in new project",
    true
  )
  .option("--no-include-docs", "Skip including documentation")

  // Step 2: Define PRD
  .option("--skip-prd", "Skip PRD definition")
  .option("--prd-method <method>", "PRD method: upload, manual, ai, skip")
  .option("--prd-file <path>", "Path to existing PRD file")
  .option("--prd-description <desc>", "Product description for AI-assisted PRD")
  .option("--prd-content <content>", "Direct PRD content")
  .option("--prd-multi-generation", "Generate multiple PRDs and compare")
  .option("--skip-prd-multi-generation", "Skip PRD multi-generation")
  .option(
    "--prd-multi-generation-models <models>",
    "Comma-separated list of models for multi-generation"
  )
  .option("--prd-combine", "Combine generated PRDs into a master PRD")
  .option("--skip-prd-combine", "Skip PRD combination")
  .option(
    "--prd-combine-model <model>",
    "Model to use for combining PRDs (provider:model)"
  )

  // Step 2.4: Stack Suggestion
  .option("--skip-stack-suggestion", "Skip stack suggestion step")
  .option(
    "--suggest-stack-from-prd [path]",
    "Get stack from PRD (path or current)"
  )

  // Step 3: Bootstrap
  .option("--skip-bootstrap", "Skip bootstrap step")

  // Step 5: PRD Question/Refine
  .option("--skip-prd-question-refine", "Skip PRD question/refine step")
  .option("--prd-question-refine", "Use question-based PRD refinement")
  .option("--prd-answer-mode <mode>", "Who answers questions: user, ai")
  .option(
    "--prd-answer-ai-provider <provider>",
    "AI provider for answering (optional override)"
  )
  .option(
    "--prd-answer-ai-model <model>",
    "AI model for answering (optional override)"
  )
  .option(
    "--prd-answer-ai-reasoning",
    "Enable reasoning for AI answering model (if supported)"
  )

  // Step 3: Refine PRD
  .option("--skip-refine", "Skip PRD refinement")
  .option("--refine-method <method>", "Refinement method: manual, ai, skip")
  .option("--refine-feedback <feedback>", "Feedback for AI refinement")

  // Step 4: Generate Tasks
  .option("--skip-generate", "Skip task generation")
  .option("--generate-method <method>", "Generation method: standard, ai")
  .option(
    "--generate-instructions <instructions>",
    "Custom task generation instructions"
  )

  // Step 5: Split Tasks
  .option("--skip-split", "Skip task splitting")
  .option("--split-tasks <ids>", "Comma-separated task IDs to split")
  .option("--split-all", "Split all tasks")
  .option(
    "--split-method <method>",
    "Split method: interactive, standard, custom"
  )
  .option("--split-instructions <instructions>", "Custom split instructions")

  // Step 6: Execute Tasks
  .option("--execute", "Execute generated tasks immediately")
  .option(
    "--execute-concurrency <number>",
    "Number of concurrent tasks (default: 1)"
  )
  .option("--no-auto-commit", "Disable auto-commit during execution")
  .option(
    "--execute-tool <tool>",
    "Executor tool (opencode/claude/gemini/codex)"
  )
  .option("--execute-model <model>", "Model override for execution")
  .option("--execute-max-retries <number>", "Max retries per task")
  .option("--execute-plan", "Enable planning phase")
  .option("--execute-plan-model <model>", "Model for planning")
  .option("--execute-review", "Enable review phase")
  .option("--execute-review-model <model>", "Model for review")
  .action(async (cliOptions) => {
    try {
      // Load .env from current working directory
      await configManager.load();

      // Load and merge options from config file if specified
      const options = await loadWorkflowOptions(cliOptions);

      console.log(chalk.blue.bold("\n🚀 Task-O-Matic Interactive Workflow\n"));

      // Show automation status
      if (options.configFile) {
        console.log(chalk.cyan(`📋 Using config: ${options.configFile}`));
      }
      if (options.skipAll) {
        console.log(chalk.yellow("⚡ Fast mode: Skipping all optional steps"));
      }
      if (options.autoAccept) {
        console.log(chalk.yellow("✓ Auto-accepting all AI suggestions"));
      }

      console.log(chalk.gray("This wizard will guide you through:"));
      console.log(chalk.gray("  1. Project initialization"));
      console.log(chalk.gray("  2. PRD definition"));
      console.log(chalk.gray("  3. Stack suggestion (from PRD)"));
      console.log(chalk.gray("  4. Bootstrap project (uses suggested stack)"));
      console.log(chalk.gray("  5. PRD question & refinement (optional)"));
      console.log(chalk.gray("  6. PRD manual refinement (optional)"));
      console.log(chalk.gray("  7. Task generation"));
      console.log(chalk.gray("  8. Task splitting\n"));

      const state: WorkflowState = {
        initialized: false,
        currentStep: "initialize",
        projectDir: process.cwd(),
      };

      const streamingOptions = createStreamingOptions(
        options.stream,
        "Workflow"
      );

      // Step 1: Initialize/Bootstrap
      await stepInitialize(state, options, streamingOptions);

      // Step 2: Define PRD
      await stepDefinePRD(state, options, streamingOptions);

      // Step 3: Stack Suggestion
      await stepStackSuggestion(state, options, streamingOptions);

      // Step 4: Bootstrap (uses suggested stack)
      await stepBootstrap(state, options, streamingOptions);

      // Step 5: PRD Question/Refine
      await stepPRDQuestionRefine(state, options, streamingOptions);

      // Step 6: Refine PRD
      await stepRefinePRD(state, options, streamingOptions);

      // Step 7: Generate Tasks
      await stepGenerateTasks(state, options, streamingOptions);

      // Step 8: Split Tasks
      await stepSplitTasks(state, options, streamingOptions);

      // Step 9: Execute Tasks
      if (options.execute) {
        console.log(chalk.blue.bold("\n⚡ Step 6: Execute Tasks\n"));

        // Confirm execution if not auto-accepting
        const shouldExecute = await getOrPrompt(
          options.autoAccept ? true : undefined,
          () => confirmPrompt("Execute all generated tasks now?", true)
        );

        if (shouldExecute) {
          // Build config purposefully to avoid passing undefined values
          const config: ExecuteLoopConfig = {
            maxRetries: options.executeMaxRetries
              ? parseInt(String(options.executeMaxRetries))
              : 3,
            autoCommit: options.autoCommit !== false, // Default to true
          };

          // Only set optional properties if they are explicitly provided
          if (options.executePlan) {
            config.plan = true;
            if (options.executePlanModel) {
              config.planModel = options.executePlanModel;
            }
          }

          if (options.executeReview) {
            config.review = true;
            if (options.executeReviewModel) {
              config.reviewModel = options.executeReviewModel;
            }
          }

          if (options.executeModel) {
            config.model = options.executeModel;
          }

          const executeOptions: ExecuteLoopOptions = {
            filters: {}, // Execute all tasks
            tool: (options.executeTool as ExecutorTool) || "opencode",
            config,
            dry: false,
          };

          await workflowService.executeTasks({
            options: executeOptions,
            callbacks: {
              onProgress: displayProgress,
              onError: displayError,
            },
          });

          console.log(chalk.green("\n✓ Execution complete"));
        } else {
          console.log(chalk.gray("  Skipping execution"));
        }
      }

      // Complete
      state.currentStep = "complete";
      console.log(chalk.green.bold("\n✅ Workflow Complete!\n"));
      console.log(chalk.cyan("Next steps:"));
      console.log(chalk.gray("  • Review your tasks: task-o-matic tasks list"));
      console.log(chalk.gray("  • View task tree: task-o-matic tasks tree"));
      console.log(chalk.gray("  • Get next task: task-o-matic tasks next"));
      console.log(
        chalk.gray("  • Execute a task: task-o-matic tasks execute <task-id>\n")
      );
    } catch (error) {
      displayError(error);
      process.exit(1);
    }
  });

/**
 * Load and merge workflow options from config file if specified
 */
async function loadWorkflowOptions(
  cliOptions: any
): Promise<WorkflowAutomationOptions> {
  let options = { ...cliOptions };

  if (cliOptions.configFile) {
    try {
      const configPath = resolve(cliOptions.configFile);
      if (existsSync(configPath)) {
        const configContent = readFileSync(configPath, "utf-8");
        const fileOptions = JSON.parse(configContent);

        // CLI options override file options
        options = { ...fileOptions, ...cliOptions };
        console.log(chalk.green(`✓ Loaded workflow config from ${configPath}`));
      } else {
        console.log(chalk.yellow(`⚠ Config file not found: ${configPath}`));
      }
    } catch (error) {
      console.log(chalk.red(`✗ Failed to load config file: ${error}`));
    }
  }

  // Manually load .env from CWD if present (to avoid dotenv dependency issues and ensure keys are picked up)
  try {
    const envPath = resolve(process.cwd(), ".env");
    if (existsSync(envPath)) {
      const envContent = readFileSync(envPath, "utf-8");
      envContent.split("\n").forEach((line) => {
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
          const key = match[1].trim();
          const value = match[2].trim().replace(/^["']|["']$/g, ""); // Remove quotes
          if (key && value && !process.env[key]) {
            process.env[key] = value;
          }
        }
      });
      // console.log(chalk.gray("  Loaded .env from current directory"));
    }
  } catch (e) {
    // Ignore errors reading .env
  }

  // Check for AI config
  const aiProvider =
    options.aiProvider ||
    process.env.AI_PROVIDER ||
    process.env.AI_API_PROVIDER;
  const aiKey =
    options.aiKey ||
    process.env.AI_KEY ||
    process.env.AI_API_KEY ||
    process.env.OPENROUTER_API_KEY ||
    process.env.ANTHROPIC_API_KEY ||
    process.env.OPENAI_API_KEY;

  // If missing critical AI config, prompt for it
  if (!aiKey) {
    console.log(chalk.blue.bold("\n🤖 AI Configuration Required"));
    console.log(
      chalk.gray("No API key found in arguments or environment (.env).\n")
    );

    const provider = await getOrPrompt(aiProvider, () =>
      selectPrompt("Select AI Provider:", [
        { name: "OpenRouter (Recommended)", value: "openrouter" },
        { name: "Anthropic", value: "anthropic" },
        { name: "OpenAI", value: "openai" },
      ])
    );

    const model = await getOrPrompt(options.aiModel, () =>
      textInputPrompt(
        "Enter AI Model:",
        provider === "openrouter"
          ? providerDefaults.openrouter.model
          : provider === "anthropic"
          ? providerDefaults.anthropic.model
          : providerDefaults.openai.model
      )
    );

    const key = await getOrPrompt(undefined, () =>
      passwordPrompt("Enter API Key:")
    );

    options.aiProvider = provider;
    options.aiModel = model;
    options.aiKey = key;

    console.log(chalk.green("✓ AI Configuration updated\n"));
  }

  return options;
}

/**
 * Helper to get pre-answered value or prompt user
 */
async function getOrPrompt<T>(
  preAnswered: T | undefined,
  promptFn: () => Promise<T>,
  skipCondition: boolean = false
): Promise<T> {
  if (skipCondition) {
    throw new Error("Step skipped");
  }
  if (preAnswered !== undefined) {
    return preAnswered;
  }
  return promptFn();
}

/**
 * Step 1: Initialize Project Structure
 * Creates project directory and .task-o-matic structure - NO bootstrap yet
 */
async function stepInitialize(
  state: WorkflowState,
  options: WorkflowAutomationOptions,
  streamingOptions: any
): Promise<void> {
  console.log(chalk.blue.bold("\n📦 Step 1: Project Initialization\n"));

  if (options.skipInit) {
    console.log(chalk.yellow("⚠ Skipping initialization (--skip-init)"));
    state.initialized = false;
    state.currentStep = "define-prd";
    return;
  }

  const shouldInitialize = await getOrPrompt(
    options.skipInit === false || options.projectName ? true : undefined,
    () => confirmPrompt("Initialize a new task-o-matic project?", true)
  );

  if (!shouldInitialize) {
    console.log(chalk.yellow("⚠ Skipping initialization"));
    state.initialized = false;
    state.currentStep = "define-prd";
    return;
  }

  const projectName = await getOrPrompt(options.projectName, () =>
    textInputPrompt("What is the name of your project?", "my-app")
  );

  // Call service with NO bootstrap - just project structure
  const result = await workflowService.initializeProject({
    projectName,
    initMethod: "custom", // No AI-assisted stack config
    aiOptions: options,
    stackConfig: {}, // Empty - no stack config yet
    bootstrap: false, // NO bootstrap in Step 1
    includeDocs: options.includeDocs,
    streamingOptions,
    callbacks: {
      onProgress: displayProgress,
      onError: displayError,
    },
  });

  console.log(chalk.green("✓ Project initialized"));
  console.log(chalk.gray("  (Stack will be configured after PRD is defined)"));

  state.initialized = true;
  state.projectName = result.projectName;
  state.projectDir = result.projectDir;
  state.aiConfig = result.aiConfig;
  state.currentStep = "define-prd";
}

/**
 * Step 2: Define PRD
 * Uses workflowService.definePRD()
 */
async function stepDefinePRD(
  state: WorkflowState,
  options: WorkflowAutomationOptions,
  streamingOptions: any
): Promise<void> {
  console.log(chalk.blue.bold("\n📝 Step 2: Define PRD\n"));

  if (options.skipPrd) {
    console.log(chalk.yellow("⚠ Skipping PRD definition (--skip-prd)"));
    state.currentStep = "refine-prd";
    return;
  }

  const prdMethod = await getOrPrompt(options.prdMethod, () =>
    selectPrompt("How would you like to define your PRD?", [
      { name: "Upload existing file", value: "upload" },
      { name: "Write manually (open editor)", value: "manual" },
      { name: "AI-assisted creation", value: "ai" },
      { name: "Skip (use existing PRD)", value: "skip" },
    ])
  );

  if (prdMethod === "skip") {
    console.log(chalk.yellow("⚠ Skipping PRD definition"));
    state.currentStep = "refine-prd";
    return;
  }

  let prdFile: string | undefined;
  let prdDescription: string | undefined;
  let prdContent: string | undefined;
  let useMultiGeneration: boolean | undefined;
  let multiGenerationModels:
    | Array<{ provider: string; model: string }>
    | undefined;
  let combineAI: { provider: string; model: string } | undefined;

  if (prdMethod === "upload") {
    prdFile = await getOrPrompt(options.prdFile, () =>
      textInputPrompt("Path to PRD file:")
    );
  } else if (prdMethod === "manual") {
    console.log(chalk.gray("\n  Opening editor...\n"));
    prdContent = await editorPrompt(
      "Write your PRD (save and close editor when done):",
      "# Product Requirements Document\n\n## Overview\n\n## Objectives\n\n## Features\n\n"
    );
  } else if (prdMethod === "ai") {
    prdDescription = await getOrPrompt(options.prdDescription, () =>
      textInputPrompt("Describe your product in detail:")
    );

    // Ask about multi-generation
    if (options.skipPrdMultiGeneration) {
      useMultiGeneration = false;
    } else {
      useMultiGeneration = await getOrPrompt(options.prdMultiGeneration, () =>
        confirmPrompt(
          "Generate multiple PRDs with different AI models and compare?",
          false
        )
      );
    }

    if (useMultiGeneration) {
      // Get comma-separated list of models
      const modelsInput = await getOrPrompt(
        options.prdMultiGenerationModels,
        () =>
          textInputPrompt(
            "Enter comma-separated list of models (provider:model):",
            "openrouter:anthropic/claude-3.5-sonnet,openrouter:google/gemini-2.0-flash-exp,openrouter:openai/gpt-4o"
          )
      );

      // Parse models
      multiGenerationModels = modelsInput.split(",").map((m: string) => {
        const parts = m.trim().split(":");
        if (parts.length < 2) {
          throw createStandardError(
            TaskOMaticErrorCodes.WORKFLOW_EXECUTION_ERROR,
            `Invalid model format: ${m}. Expected provider:model`,
            {
              context:
                "Model format validation failed during multi-generation setup",
              suggestions: [
                "Use format: provider:model (e.g., anthropic:claude-sonnet-4.5)",
                "Check for typos in provider or model name",
              ],
            }
          );
        }
        return { provider: parts[0], model: parts[1] };
      });

      // Ask about combining
      const useCombine = await getOrPrompt(
        options.prdCombine !== undefined ? options.prdCombine : undefined,
        () => confirmPrompt("Combine all PRDs into a master PRD?", true)
      );

      if (useCombine) {
        const combineModelInput = await getOrPrompt(
          options.prdCombineModel,
          () =>
            textInputPrompt(
              "Which model should combine the PRDs? (provider:model, leave empty to use current AI config):",
              ""
            )
        );

        if (combineModelInput && combineModelInput.trim()) {
          const parts = combineModelInput.trim().split(":");
          if (parts.length < 2) {
            throw createStandardError(
              TaskOMaticErrorCodes.WORKFLOW_EXECUTION_ERROR,
              `Invalid model format: ${combineModelInput}. Expected provider:model`,
              {
                context:
                  "Model format validation failed during PRD combine setup",
                suggestions: [
                  "Use format: provider:model (e.g., anthropic:claude-sonnet-4.5)",
                  "Check for typos in provider or model name",
                ],
              }
            );
          }
          combineAI = { provider: parts[0], model: parts[1] };
        } else {
          // Use current AI config
          combineAI = {
            provider: options.aiProvider || "openrouter",
            model: options.aiModel || "anthropic/claude-3.5-sonnet",
          };
        }
      }
    }
  }

  // Call service
  const result = await workflowService.definePRD({
    method: prdMethod as "upload" | "manual" | "ai" | "skip",
    prdFile,
    prdDescription,
    prdContent,
    projectDir: state.projectDir!,
    aiOptions: options,
    streamingOptions,
    callbacks: {
      onProgress: displayProgress,
      onError: displayError,
    },
    multiGeneration: useMultiGeneration,
    multiGenerationModels,
    combineAI,
  });

  if (prdMethod === "ai") {
    console.log(chalk.green("\n✓ PRD generated"));
    console.log(
      chalk.gray("\n" + result.prdContent.substring(0, 500) + "...\n")
    );

    // Display metrics if available
    if (result.stats) {
      console.log(chalk.cyan(`  Duration: ${result.stats.duration}ms`));
      if (result.stats.tokenUsage) {
        console.log(
          chalk.cyan(
            `  Tokens: ${result.stats.tokenUsage.total} (Prompt: ${result.stats.tokenUsage.prompt}, Completion: ${result.stats.tokenUsage.completion})`
          )
        );
      }
      if (result.stats.timeToFirstToken) {
        console.log(
          chalk.cyan(
            `  Time to First Token: ${result.stats.timeToFirstToken}ms`
          )
        );
      }
      if (result.stats.cost) {
        console.log(
          chalk.cyan(`  Estimated Cost: $${result.stats.cost.toFixed(6)}`)
        );
      }
    }

    const acceptPRD = await getOrPrompt(
      options.autoAccept ? true : undefined,
      () => confirmPrompt("Accept this PRD?", true)
    );

    if (!acceptPRD) {
      console.log(chalk.yellow("⚠ Regenerating..."));
      return stepDefinePRD(state, options, streamingOptions);
    }
  }

  state.prdFile = result.prdFile;
  state.prdContent = result.prdContent;
  state.currentStep = "stack-suggestion";
}

/**
 * Step 2.4: Stack Suggestion
 * Uses prdService.suggestStack() to get AI-recommended stack from PRD
 */
async function stepStackSuggestion(
  state: WorkflowState,
  options: WorkflowAutomationOptions,
  streamingOptions: any
): Promise<void> {
  console.log(chalk.blue.bold("\n🛠️ Step 2.4: Stack Suggestion\n"));

  // Skip conditions
  if (options.skipStackSuggestion || options.skipAll) {
    console.log(chalk.gray("  Skipping stack suggestion"));
    state.currentStep = "question-refine-prd";
    return;
  }

  if (!state.prdFile && !state.prdContent) {
    console.log(chalk.yellow("⚠ No PRD available, skipping stack suggestion"));
    state.currentStep = "question-refine-prd";
    return;
  }

  // Determine PRD file to use
  let prdFile: string | undefined = state.prdFile;
  if (typeof options.suggestStackFromPrd === "string") {
    prdFile = options.suggestStackFromPrd;
  }

  // Ask user if they want AI stack suggestion
  const wantsStackSuggestion = await getOrPrompt(
    options.suggestStackFromPrd !== undefined ? true : undefined,
    () => confirmPrompt("Get AI-recommended stack based on your PRD?", true)
  );

  if (!wantsStackSuggestion) {
    console.log(chalk.gray("  Skipping stack suggestion"));
    state.currentStep = "question-refine-prd";
    return;
  }

  // Call prdService.suggestStack()
  const result = await prdService.suggestStack({
    file: prdFile,
    content: !prdFile ? state.prdContent : undefined,
    projectName: state.projectName,
    workingDirectory: state.projectDir,
    aiOptions: options,
    streamingOptions,
    callbacks: {
      onProgress: displayProgress,
      onError: displayError,
    },
  });

  // Display suggested stack
  console.log(chalk.green("\n✓ Suggested Stack:\n"));
  const s = result.stack;
  console.log(
    chalk.cyan("  Frontend:    ") +
      (Array.isArray(s.frontend) ? s.frontend.join(", ") : s.frontend)
  );
  console.log(chalk.cyan("  Backend:     ") + s.backend);
  console.log(chalk.cyan("  Database:    ") + s.database);
  console.log(chalk.cyan("  ORM:         ") + s.orm);
  console.log(chalk.cyan("  Auth:        ") + s.auth);
  console.log(chalk.cyan("  Runtime:     ") + s.runtime);
  console.log(
    chalk.cyan("  Addons:      ") +
      (s.addons.length > 0 ? s.addons.join(", ") : "none")
  );

  console.log(chalk.blue("\n  Reasoning:"));
  console.log(chalk.dim("  " + result.reasoning.split("\n")[0]));

  // Display stats
  console.log(chalk.cyan(`\n  Duration: ${result.stats.duration}ms`));
  if (result.stats.tokenUsage) {
    console.log(chalk.cyan(`  Tokens: ${result.stats.tokenUsage.total}`));
  }

  // Ask to accept
  const acceptStack = await getOrPrompt(
    options.autoAccept ? true : undefined,
    () => confirmPrompt("Accept this stack configuration?", true)
  );

  if (acceptStack) {
    state.suggestedStack = result.stack;
    console.log(
      chalk.green("  ✓ Stack accepted and will be used for bootstrap")
    );
  } else {
    console.log(chalk.yellow("  Stack suggestion discarded"));
  }

  state.currentStep = "bootstrap";
}

/**
 * Step 4: Bootstrap Project
 * Uses suggestedStack from PRD analysis to bootstrap with Better-T-Stack
 */
async function stepBootstrap(
  state: WorkflowState,
  options: WorkflowAutomationOptions,
  streamingOptions: any
): Promise<void> {
  console.log(chalk.blue.bold("\n🚀 Step 4: Bootstrap Project\n"));

  // Skip conditions
  if (options.skipBootstrap || options.skipAll) {
    console.log(chalk.gray("  Skipping bootstrap"));
    state.currentStep = "question-refine-prd";
    return;
  }

  // Check if we have a suggested stack
  if (state.suggestedStack) {
    console.log(chalk.cyan("Using AI-suggested stack from PRD:"));
    const s = state.suggestedStack;
    console.log(
      chalk.dim(
        `  Frontend: ${
          Array.isArray(s.frontend) ? s.frontend.join(", ") : s.frontend
        }`
      )
    );
    console.log(chalk.dim(`  Backend: ${s.backend}`));
    console.log(chalk.dim(`  Database: ${s.database}`));
    console.log(chalk.dim(`  Auth: ${s.auth}`));

    const useStack = await getOrPrompt(
      options.autoAccept ? true : undefined,
      () => confirmPrompt("Bootstrap with this stack?", true)
    );

    if (useStack) {
      console.log(chalk.cyan("\n  Bootstrapping with Better-T-Stack..."));
      try {
        const result = await runBetterTStackCLI(
          {
            projectName: ".",
            frontend: Array.isArray(s.frontend) ? s.frontend[0] : s.frontend,
            backend: s.backend,
            database: s.database,
            noAuth: s.auth === "none",
            orm: s.orm || "drizzle",
            packageManager: s.packageManager || "npm",
            runtime: s.runtime || "node",
            noInstall: false,
            noGit: false,
            includeDocs: options.includeDocs,
          },
          state.projectDir || process.cwd()
        );

        if (result.success) {
          console.log(chalk.green("  ✓ Bootstrap complete"));
        } else {
          console.log(chalk.yellow(`  ⚠ Bootstrap warning: ${result.message}`));
        }
      } catch (error) {
        displayError(error);
        console.log(
          chalk.yellow("  ⚠ Bootstrap failed, continuing without it")
        );
      }
    } else {
      console.log(chalk.gray("  Skipping bootstrap"));
    }
  } else {
    // No suggested stack - ask if user wants manual config
    const wantsBootstrap = await getOrPrompt(options.bootstrap, () =>
      confirmPrompt("Bootstrap project with Better-T-Stack?", true)
    );

    if (wantsBootstrap) {
      // Manual stack config
      const frontend = await getOrPrompt(options.frontend, () =>
        selectPrompt("Frontend framework:", [
          "next",
          "tanstack-router",
          "react-router",
          "none",
        ])
      );
      const backend = await getOrPrompt(options.backend, () =>
        selectPrompt("Backend framework:", [
          "hono",
          "express",
          "elysia",
          "convex",
          "none",
        ])
      );
      const database = await getOrPrompt(options.database, () =>
        selectPrompt("Database:", [
          "sqlite",
          "postgres",
          "turso",
          "neon",
          "none",
        ])
      );
      const auth = await getOrPrompt(options.auth, () =>
        confirmPrompt("Include authentication?", true)
      );

      console.log(chalk.cyan("\n  Bootstrapping with Better-T-Stack..."));
      try {
        const result = await runBetterTStackCLI(
          {
            projectName: ".",
            frontend,
            backend,
            database,
            noAuth: !auth,
            orm: "drizzle",
            packageManager: "npm",
            runtime: "node",
            noInstall: false,
            noGit: false,
            includeDocs: options.includeDocs,
          },
          state.projectDir || process.cwd()
        );

        if (result.success) {
          console.log(chalk.green("  ✓ Bootstrap complete"));
        } else {
          console.log(chalk.yellow(`  ⚠ Bootstrap warning: ${result.message}`));
        }
      } catch (error) {
        displayError(error);
        console.log(
          chalk.yellow("  ⚠ Bootstrap failed, continuing without it")
        );
      }
    } else {
      console.log(chalk.gray("  Skipping bootstrap"));
    }
  }

  state.currentStep = "question-refine-prd";
}

/**
 * Step 5: PRD Question/Refine
 * Uses prdService.refinePRDWithQuestions()
 */
async function stepPRDQuestionRefine(
  state: WorkflowState,
  options: WorkflowAutomationOptions,
  streamingOptions: any
): Promise<void> {
  console.log(chalk.blue.bold("\n❓ Step 2.5: PRD Question & Refine\n"));

  if (!state.prdFile) {
    console.log(chalk.yellow("⚠ No PRD file found, skipping"));
    state.currentStep = "refine-prd";
    return;
  }

  if (options.skipPrdQuestionRefine || options.skipAll) {
    console.log(chalk.gray("  Skipping question-based refinement"));
    state.currentStep = "refine-prd";
    return;
  }

  // Ask if user wants question-based refinement
  const useQuestions = await getOrPrompt(options.prdQuestionRefine, () =>
    confirmPrompt("Refine PRD with clarifying questions?", false)
  );

  if (!useQuestions) {
    console.log(chalk.gray("  Skipping question-based refinement"));
    state.currentStep = "refine-prd";
    return;
  }

  // Ask who should answer: user or AI
  const answerMode = await getOrPrompt(options.prdAnswerMode, () =>
    selectPrompt("Who should answer the questions?", [
      { name: "I will answer", value: "user" },
      { name: "AI assistant (uses PRD + stack context)", value: "ai" },
    ])
  );

  let questionAIOptions: any = undefined;

  if (answerMode === "ai") {
    // Ask if they want to use a different AI model for answering
    const useCustomAI = await getOrPrompt(
      options.prdAnswerAiProvider !== undefined,
      () =>
        confirmPrompt(
          "Use a different AI model for answering? (e.g., a smarter model)",
          false
        )
    );

    if (useCustomAI) {
      const provider = await getOrPrompt(options.prdAnswerAiProvider, () =>
        selectPrompt("AI Provider for answering:", [
          { name: "OpenRouter", value: "openrouter" },
          { name: "Anthropic", value: "anthropic" },
          { name: "OpenAI", value: "openai" },
        ])
      );

      const model = await getOrPrompt(options.prdAnswerAiModel, () =>
        textInputPrompt(
          "AI Model for answering:",
          provider === "openrouter" ? "anthropic/claude-3.5-sonnet" : ""
        )
      );

      questionAIOptions = {
        aiProvider: provider,
        aiModel: model,
      };
    }

    // Check if reasoning should be enabled
    if (options.prdAnswerAiReasoning) {
      if (!questionAIOptions) {
        // No custom AI specified, use main AI with reasoning
        questionAIOptions = {
          aiProvider: options.aiProvider,
          aiModel: options.aiModel,
          aiReasoning: "enabled",
        };
      } else {
        // Custom AI specified, add reasoning to it
        questionAIOptions.aiReasoning = "enabled";
      }
    }
  }

  // For user mode, we need to collect answers interactively
  let answers: Record<string, string> | undefined;

  if (answerMode === "user") {
    // First, generate questions
    console.log(chalk.cyan("\n  Generating questions...\n"));
    const questions = await prdService.generateQuestions({
      file: state.prdFile,
      workingDirectory: state.projectDir,
      aiOptions: options,
      streamingOptions,
      callbacks: {
        onProgress: displayProgress,
        onError: displayError,
      },
    });

    if (questions.length === 0) {
      console.log(
        chalk.yellow("No questions generated - PRD appears complete")
      );
      state.currentStep = "refine-prd";
      return;
    }

    console.log(
      chalk.blue(
        `\nPlease answer the following ${questions.length} questions to refine the PRD:\n`
      )
    );

    answers = {};
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      const answer = await inquirer.prompt([
        {
          type: "input",
          name: "response",
          message: `${i + 1}/${questions.length}: ${q}`,
          validate: (input) =>
            input.trim().length > 0 || "Please provide an answer",
        },
      ]);
      answers[q] = answer.response;
    }
  }

  // Call service - it will automatically refine after answering
  console.log(chalk.cyan("\n  Generating questions and refining PRD...\n"));

  const result = await prdService.refinePRDWithQuestions({
    file: state.prdFile,
    questionMode: answerMode as "user" | "ai",
    answers, // Only provided for user mode
    questionAIOptions,
    workingDirectory: state.projectDir,
    aiOptions: options,
    streamingOptions,
    callbacks: {
      onProgress: displayProgress,
      onError: displayError,
    },
  });

  console.log(
    chalk.green(
      `\n✓ PRD refined with ${result.questions.length} questions answered`
    )
  );
  console.log(chalk.gray("\n  Questions & Answers:"));
  result.questions.forEach((q, i) => {
    console.log(chalk.cyan(`  Q${i + 1}: ${q}`));
    console.log(
      chalk.gray(`  A${i + 1}: ${result.answers[q]?.substring(0, 100)}...\n`)
    );
  });

  // Update state with refined PRD
  state.prdFile = result.refinedPRDPath;
  state.prdContent = readFileSync(result.refinedPRDPath, "utf-8");
  state.currentStep = "refine-prd";
}

/**
 * Step 3: Refine PRD
 * Uses workflowService.refinePRD()
 */
async function stepRefinePRD(
  state: WorkflowState,
  options: WorkflowAutomationOptions,
  streamingOptions: any
): Promise<void> {
  console.log(chalk.blue.bold("\n✨ Step 3: Refine PRD\n"));

  if (!state.prdFile) {
    console.log(chalk.yellow("⚠ No PRD file found, skipping refinement"));
    state.currentStep = "generate-tasks";
    return;
  }

  if (options.skipRefine || options.skipAll) {
    console.log(chalk.gray("  Skipping refinement"));
    state.currentStep = "generate-tasks";
    return;
  }

  const shouldRefine = await getOrPrompt(
    options.skipRefine === false ? true : undefined,
    () => confirmPrompt("Refine your PRD further?", false)
  );

  if (!shouldRefine) {
    console.log(chalk.gray("  Skipping refinement"));
    state.currentStep = "generate-tasks";
    return;
  }

  const refineMethod = await getOrPrompt(options.refineMethod, () =>
    selectPrompt("How would you like to refine?", [
      { name: "Manual editing (open editor)", value: "manual" },
      { name: "AI-assisted refinement", value: "ai" },
      { name: "Skip", value: "skip" },
    ])
  );

  if (refineMethod === "skip") {
    state.currentStep = "generate-tasks";
    return;
  }

  let refinedContent = state.prdContent || readFileSync(state.prdFile, "utf-8");
  let feedback: string | undefined;

  if (refineMethod === "manual") {
    console.log(chalk.gray("\n  Opening editor...\n"));
    refinedContent = await editorPrompt(
      "Edit your PRD (save and close when done):",
      refinedContent
    );
  } else if (refineMethod === "ai") {
    feedback = await getOrPrompt(options.refineFeedback, () =>
      textInputPrompt(
        "What would you like to improve? (e.g., 'Add more technical details', 'Focus on MVP features'):"
      )
    );
  }

  // Call service
  const result = await workflowService.refinePRD({
    method: refineMethod as "manual" | "ai" | "skip",
    prdFile: state.prdFile,
    prdContent: refineMethod === "manual" ? refinedContent : undefined,
    feedback,
    projectDir: state.projectDir!,
    aiOptions: options,
    streamingOptions,
    callbacks: {
      onProgress: displayProgress,
      onError: displayError,
    },
  });

  if (refineMethod === "ai") {
    console.log(chalk.green("\n✓ PRD refined"));
    console.log(
      chalk.gray("\n" + result.prdContent.substring(0, 500) + "...\n")
    );

    // Display metrics if available
    if (result.stats) {
      console.log(chalk.cyan(`  Duration: ${result.stats.duration}ms`));
      if (result.stats.tokenUsage) {
        console.log(
          chalk.cyan(
            `  Tokens: ${result.stats.tokenUsage.total} (Prompt: ${result.stats.tokenUsage.prompt}, Completion: ${result.stats.tokenUsage.completion})`
          )
        );
      }
      if (result.stats.timeToFirstToken) {
        console.log(
          chalk.cyan(
            `  Time to First Token: ${result.stats.timeToFirstToken}ms`
          )
        );
      }
      if (result.stats.cost) {
        console.log(
          chalk.cyan(`  Estimated Cost: $${result.stats.cost.toFixed(6)}`)
        );
      }
    }

    const acceptRefinement = await getOrPrompt(
      options.autoAccept ? true : undefined,
      () => confirmPrompt("Accept refinements?", true)
    );

    if (!acceptRefinement) {
      console.log(chalk.yellow("⚠ Keeping original PRD"));
      state.currentStep = "generate-tasks";
      return;
    }
  }

  state.prdContent = result.prdContent;
  console.log(chalk.green(`✓ PRD updated`));
  state.currentStep = "generate-tasks";
}

/**
 * Step 4: Generate Tasks
 * Uses workflowService.generateTasks()
 */
async function stepGenerateTasks(
  state: WorkflowState,
  options: WorkflowAutomationOptions,
  streamingOptions: any
): Promise<void> {
  console.log(chalk.blue.bold("\n🎯 Step 4: Generate Tasks\n"));

  if (!state.prdFile) {
    console.log(chalk.yellow("⚠ No PRD file found, skipping task generation"));
    state.currentStep = "split-tasks";
    return;
  }

  if (options.skipGenerate || options.skipAll) {
    console.log(chalk.gray("  Skipping task generation"));
    state.currentStep = "split-tasks";
    return;
  }

  const shouldGenerate = await getOrPrompt(
    options.skipGenerate === false ? true : undefined,
    () => confirmPrompt("Generate tasks from PRD?", true)
  );

  if (!shouldGenerate) {
    console.log(chalk.gray("  Skipping task generation"));
    state.currentStep = "split-tasks";
    return;
  }

  const generationMethod = await getOrPrompt(options.generateMethod, () =>
    selectPrompt("Choose generation method:", [
      { name: "Standard parsing", value: "standard" },
      { name: "AI-assisted with custom instructions", value: "ai" },
    ])
  );

  let customInstructions: string | undefined;
  if (generationMethod === "ai") {
    customInstructions = await getOrPrompt(options.generateInstructions, () =>
      textInputPrompt(
        "Custom instructions (e.g., 'Focus on MVP features', 'Break into small tasks'):",
        ""
      )
    );
  }

  console.log(chalk.cyan("\n  Parsing PRD and generating tasks...\n"));

  // Call service
  const result = await workflowService.generateTasks({
    prdFile: state.prdFile,
    method: generationMethod as "standard" | "ai",
    customInstructions,
    projectDir: state.projectDir!,
    aiOptions: options,
    streamingOptions,
    callbacks: {
      onProgress: displayProgress,
      onError: displayError,
    },
  });

  console.log(chalk.green(`\n✓ Generated ${result.tasks.length} tasks`));

  // Display metrics if available
  if (result.stats) {
    console.log(chalk.cyan(`  Duration: ${result.stats.duration}ms`));
    if (result.stats.tokenUsage) {
      console.log(
        chalk.cyan(
          `  Tokens: ${result.stats.tokenUsage.total} (Prompt: ${result.stats.tokenUsage.prompt}, Completion: ${result.stats.tokenUsage.completion})`
        )
      );
    }
    if (result.stats.timeToFirstToken) {
      console.log(
        chalk.cyan(`  Time to First Token: ${result.stats.timeToFirstToken}ms`)
      );
    }
    if (result.stats.cost) {
      console.log(
        chalk.cyan(`  Estimated Cost: $${result.stats.cost.toFixed(6)}`)
      );
    }
  }

  // Display tasks
  console.log(chalk.blue("\n  Created Tasks:\n"));
  result.tasks.forEach((task: Task, index: number) => {
    console.log(
      chalk.gray(
        `  ${index + 1}. ${task.title} ${
          task.estimatedEffort ? `(${task.estimatedEffort})` : ""
        }`
      )
    );
  });

  state.tasks = result.tasks.map((t: Task) => ({
    id: t.id,
    title: t.title,
    description: t.description,
  }));

  state.currentStep = "split-tasks";
}

/**
 * Step 5: Split Complex Tasks
 * Uses workflowService.splitTasks()
 */
async function stepSplitTasks(
  state: WorkflowState,
  options: WorkflowAutomationOptions,
  streamingOptions: any
): Promise<void> {
  console.log(chalk.blue.bold("\n🔀 Step 5: Split Complex Tasks\n"));

  if (!state.tasks || state.tasks.length === 0) {
    console.log(chalk.yellow("⚠ No tasks found, skipping splitting"));
    return;
  }

  if (options.skipSplit || options.skipAll) {
    console.log(chalk.gray("  Skipping task splitting"));
    return;
  }

  // Handle --split-tasks and --split-all options
  let tasksToSplit: string[];
  if (options.splitAll) {
    tasksToSplit = state.tasks?.map((t) => t.id) || [];
    console.log(chalk.cyan(`  Splitting all ${tasksToSplit.length} tasks`));
  } else if (options.splitTasks) {
    tasksToSplit = options.splitTasks.split(",").map((id) => id.trim());
    console.log(
      chalk.cyan(`  Splitting ${tasksToSplit.length} specified tasks`)
    );
  } else {
    const shouldSplit = await confirmPrompt(
      "Split any complex tasks into subtasks?",
      false
    );

    if (!shouldSplit) {
      console.log(chalk.gray("  Skipping task splitting"));
      return;
    }

    tasksToSplit = await multiSelectPrompt(
      "Select tasks to split:",
      state.tasks.map((t: any) => ({
        name: `${t.title}${
          t.description ? ` - ${t.description.substring(0, 50)}...` : ""
        }`,
        value: t.id,
      }))
    );
  }

  if (tasksToSplit.length === 0) {
    console.log(chalk.gray("  No tasks selected"));
    return;
  }

  let globalSplitMethod: "interactive" | "standard" | "custom" =
    (options.splitMethod as "interactive" | "standard" | "custom") ||
    "interactive";
  let globalCustomInstructions: string | undefined;

  if (tasksToSplit.length > 1) {
    globalSplitMethod = await getOrPrompt(options.splitMethod, () =>
      selectPrompt("How would you like to split these tasks?", [
        { name: "Interactive (ask for each task)", value: "interactive" },
        { name: "Standard AI split for ALL", value: "standard" },
        { name: "Same custom instructions for ALL", value: "custom" },
      ])
    );

    if (globalSplitMethod === "custom") {
      globalCustomInstructions = await getOrPrompt(
        options.splitInstructions,
        () =>
          textInputPrompt(
            "Custom instructions for ALL tasks (e.g., 'Break into 2-4 hour chunks'):",
            ""
          )
      );
    }
  }

  // Collect per-task instructions for interactive mode
  const taskInstructions: Record<string, string | undefined> = {};
  if (globalSplitMethod === "interactive") {
    for (const taskId of tasksToSplit) {
      const task = state.tasks?.find((t: any) => t.id === taskId);
      if (!task) continue;

      console.log(chalk.cyan(`\n  Task: ${task.title}\n`));

      const splitMethod = await selectPrompt("Split method:", [
        { name: "Standard AI split", value: "standard" },
        { name: "Custom instructions", value: "custom" },
      ]);

      if (splitMethod === "custom") {
        taskInstructions[taskId] = await textInputPrompt(
          "Custom instructions (e.g., 'Break into 2-4 hour chunks'):",
          ""
        );
      }
    }
  }

  // Call service
  const result = await workflowService.splitTasks({
    taskIds: tasksToSplit,
    splitMethod: globalSplitMethod,
    customInstructions: globalCustomInstructions,
    aiOptions: options,
    streamingOptions,
    callbacks: {
      onProgress: displayProgress,
      onError: displayError,
    },
  });

  // Display results
  result.results.forEach((taskResult: any) => {
    const task = state.tasks?.find((t: any) => t.id === taskResult.taskId);
    if (taskResult.error) {
      console.log(
        chalk.red(`  ✗ Failed to split ${task?.title}: ${taskResult.error}`)
      );
    } else {
      console.log(
        chalk.green(
          `  ✓ Split ${task?.title} into ${taskResult.subtasks.length} subtasks`
        )
      );
      taskResult.subtasks.forEach((subtask: Task, index: number) => {
        console.log(chalk.gray(`    ${index + 1}. ${subtask.title}`));
      });
    }
  });

  console.log(chalk.green("\n✓ Task splitting complete"));
}
