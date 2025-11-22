#!/usr/bin/env node

import { Command } from "commander";
import chalk from "chalk";
import { readFileSync } from "fs";
import { resolve } from "path";
import { workflowService } from "../services/workflow";
import { prdService } from "../services/prd";
import inquirer from "inquirer";
import {
  confirmPrompt,
  selectPrompt,
  multiSelectPrompt,
  textInputPrompt,
  editorPrompt,
} from "../utils/workflow-prompts";
import { createStreamingOptions } from "../utils/streaming-options";
import { displayProgress, displayError } from "../cli/display/progress";
import type {
  WorkflowState,
  WorkflowAutomationOptions,
} from "../types/options";
import type { Task } from "../types";

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

  // Step 2: Define PRD
  .option("--skip-prd", "Skip PRD definition")
  .option("--prd-method <method>", "PRD method: upload, manual, ai, skip")
  .option("--prd-file <path>", "Path to existing PRD file")
  .option("--prd-description <desc>", "Product description for AI-assisted PRD")
  .option("--prd-content <content>", "Direct PRD content")

  // Step 2.5: PRD Question/Refine (NEW)
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
  .action(async (cliOptions) => {
    try {
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
      console.log(chalk.gray("  1. Project initialization & bootstrap"));
      console.log(chalk.gray("  2. PRD definition"));
      console.log(chalk.gray("  2.5. PRD question & refinement (optional)"));
      console.log(chalk.gray("  3. PRD manual refinement (optional)"));
      console.log(chalk.gray("  4. Task generation"));
      console.log(chalk.gray("  5. Task splitting\n"));

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

      // Step 2.5: PRD Question/Refine (NEW)
      await stepPRDQuestionRefine(state, options, streamingOptions);

      // Step 3: Refine PRD
      await stepRefinePRD(state, options, streamingOptions);

      // Step 4: Generate Tasks
      await stepGenerateTasks(state, options, streamingOptions);

      // Step 5: Split Tasks
      await stepSplitTasks(state, options, streamingOptions);

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
      const { existsSync, readFileSync } = await import("fs");
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
 * Step 1: Initialize/Bootstrap
 * Uses workflowService.initializeProject()
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
    options.skipInit === false ? true : undefined,
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

  // Determine initialization method
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
      textInputPrompt(
        "Describe your project (e.g., 'A SaaS app for team collaboration with real-time features'):"
      )
    );
  }

  // Collect stack config for custom mode
  let stackConfig: any = {};
  if (initMethod === "custom") {
    const shouldBootstrap = await getOrPrompt(options.bootstrap, () =>
      confirmPrompt("Bootstrap with Better-T-Stack?", true)
    );

    if (shouldBootstrap) {
      stackConfig.frontend = await getOrPrompt(options.frontend, () =>
        selectPrompt("Frontend framework:", [
          "next",
          "tanstack-router",
          "react-router",
          "vite-react",
          "remix",
        ])
      );
      stackConfig.backend = await getOrPrompt(options.backend, () =>
        selectPrompt("Backend framework:", [
          "hono",
          "express",
          "elysia",
          "fastify",
        ])
      );
      stackConfig.database = await getOrPrompt(options.database, () =>
        selectPrompt("Database:", [
          "sqlite",
          "postgres",
          "mysql",
          "mongodb",
          "turso",
          "neon",
        ])
      );
      stackConfig.auth = await getOrPrompt(options.auth, () =>
        confirmPrompt("Include authentication?", true)
      );
    }
  }

  // Determine if we should bootstrap
  const bootstrap =
    initMethod === "quick" ||
    (initMethod === "ai" && options.bootstrap !== false) ||
    (initMethod === "custom" && Object.keys(stackConfig).length > 0);

  // Call service
  const result = await workflowService.initializeProject({
    projectName,
    initMethod: initMethod as "quick" | "custom" | "ai",
    projectDescription,
    aiOptions: options,
    stackConfig,
    bootstrap,
    streamingOptions,
    callbacks: {
      onProgress: displayProgress,
      onError: displayError,
    },
  });

  console.log(chalk.green("✓ Project initialized"));

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
    useMultiGeneration = await getOrPrompt(options.prdMultiGeneration, () =>
      confirmPrompt(
        "Generate multiple PRDs with different AI models and compare?",
        false
      )
    );

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
          throw new Error(
            `Invalid model format: ${m}. Expected provider:model`
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
            throw new Error(
              `Invalid model format: ${combineModelInput}. Expected provider:model`
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
  state.currentStep = "question-refine-prd";
}

/**
 * Step 2.5: PRD Question/Refine (NEW)
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
      state.tasks.map((t) => ({
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

  let globalSplitMethod: "interactive" | "standard" | "custom" = "interactive";
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
      const task = state.tasks.find((t) => t.id === taskId);
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
  result.results.forEach((taskResult) => {
    const task = state.tasks?.find((t) => t.id === taskResult.taskId);
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
