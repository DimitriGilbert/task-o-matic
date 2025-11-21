#!/usr/bin/env node

import { Command } from "commander";
import chalk from "chalk";
import {
  existsSync,
  writeFileSync,
  mkdirSync,
  readFileSync,
  appendFileSync,
} from "fs";
import { join, resolve } from "path";
import { configManager } from "../lib/config";
import { runBetterTStackCLI } from "../lib/better-t-stack-cli";
import { prdService } from "../services/prd";
import { taskService } from "../services/tasks";
import { workflowAIAssistant } from "../services/workflow-ai-assistant";
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
  InitConfigChoice,
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
      console.log(chalk.gray("  3. PRD refinement"));
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
 */
async function stepInitialize(
  state: WorkflowState,
  options: WorkflowAutomationOptions,
  streamingOptions: any
): Promise<void> {
  console.log(chalk.blue.bold("\n📦 Step 1: Project Initialization\n"));

  // Check skip flag
  if (options.skipInit) {
    console.log(chalk.yellow("⚠ Skipping initialization (--skip-init)"));
    state.initialized = false;
    state.currentStep = "define-prd";
    return;
  }

  // Check if already initialized in current directory
  const taskOMaticDir = configManager.getTaskOMaticDir();
  const alreadyInitialized = existsSync(taskOMaticDir);

  if (alreadyInitialized) {
    console.log(chalk.yellow("✓ Project already initialized"));
    const useExisting = await getOrPrompt(options.useExistingConfig, () =>
      confirmPrompt("Use existing configuration?", true)
    );

    if (useExisting) {
      state.initialized = true;
      state.currentStep = "define-prd";
      return;
    }
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

  // IMMEDIATE DIRECTORY CREATION AND SWITCH
  const projectDir = resolve(process.cwd(), projectName);
  if (!existsSync(projectDir)) {
    mkdirSync(projectDir, { recursive: true });
    console.log(chalk.green(`\n✓ Created directory: ${projectName}`));
  } else {
    console.log(chalk.yellow(`\n⚠ Directory ${projectName} already exists`));
  }

  console.log(
    chalk.cyan(`  📂 Switching to project directory: ${projectDir}\n`)
  );
  process.chdir(projectDir);
  configManager.setWorkingDirectory(projectDir);
  state.projectDir = projectDir;

  // Initialize task-o-matic in the NEW directory
  console.log(chalk.cyan("  Initializing task-o-matic...\n"));
  const newTaskOMaticDir = join(projectDir, ".task-o-matic");

  if (!existsSync(newTaskOMaticDir)) {
    mkdirSync(newTaskOMaticDir, { recursive: true });
    ["tasks", "prd", "logs"].forEach((dir) => {
      mkdirSync(join(newTaskOMaticDir, dir), { recursive: true });
    });
  }

  // AI Configuration Step - ALWAYS ask for this first
  console.log(chalk.blue.bold("\n🤖 Step 1.1: AI Configuration\n"));

  const aiProvider = await getOrPrompt(options.aiProvider, () =>
    selectPrompt("Select AI Provider:", [
      { name: "OpenRouter", value: "openrouter" },
      { name: "Anthropic", value: "anthropic" },
      { name: "OpenAI", value: "openai" },
      { name: "Custom (e.g. local LLM)", value: "custom" },
    ])
  );

  let aiProviderUrl: string | undefined;
  if (aiProvider === "custom") {
    aiProviderUrl = await getOrPrompt(options.aiProviderUrl, () =>
      textInputPrompt("Enter Custom Provider URL:", "http://localhost:11434/v1")
    );
  }

  const defaultModel =
    aiProvider === "openrouter"
      ? "anthropic/claude-3.5-sonnet"
      : aiProvider === "anthropic"
      ? "claude-3-5-sonnet-20240620"
      : aiProvider === "openai"
      ? "gpt-4o"
      : "llama3";

  const aiModel = await getOrPrompt(options.aiModel, () =>
    textInputPrompt("Enter AI Model:", defaultModel)
  );

  // Check/Ask for API Key
  const providerKeyName =
    aiProvider === "openai"
      ? "OPENAI_API_KEY"
      : aiProvider === "anthropic"
      ? "ANTHROPIC_API_KEY"
      : aiProvider === "openrouter"
      ? "OPENROUTER_API_KEY"
      : "AI_API_KEY";

  // Check if key exists in current env
  let apiKey = options.aiKey || process.env[providerKeyName];

  if (!apiKey) {
    console.log(chalk.yellow(`\n⚠️  No API key found for ${aiProvider}`));
    apiKey = await textInputPrompt(`Enter your ${aiProvider} API Key:`);
  }

  // Save AI Config to .env immediately in the new project dir
  const envPath = join(projectDir, ".env");
  let envContent = "";
  if (existsSync(envPath)) {
    envContent = readFileSync(envPath, "utf-8");
  }

  if (!envContent.includes("AI_PROVIDER=")) {
    envContent += `AI_PROVIDER=${aiProvider}\n`;
  }
  if (!envContent.includes("AI_MODEL=")) {
    envContent += `AI_MODEL=${aiModel}\n`;
  }
  if (aiProviderUrl && !envContent.includes("AI_PROVIDER_URL=")) {
    envContent += `AI_PROVIDER_URL=${aiProviderUrl}\n`;
  }
  if (!envContent.includes(`${providerKeyName}=`)) {
    envContent += `${providerKeyName}=${apiKey}\n`;
  }

  writeFileSync(envPath, envContent);

  // Update process.env for immediate use
  process.env.AI_PROVIDER = aiProvider;
  process.env.AI_MODEL = aiModel;
  process.env[providerKeyName] = apiKey;
  if (aiProviderUrl) {
    process.env.AI_PROVIDER_URL = aiProviderUrl;
  }

  // Update ConfigManager
  configManager.setAIConfig({
    provider: aiProvider as any,
    model: aiModel,
    apiKey: apiKey,
    baseURL: aiProviderUrl,
  });

  console.log(chalk.green("✓ AI Configuration saved"));

  // Stack Configuration Step
  console.log(chalk.blue.bold("\n📦 Step 1.2: Stack Configuration\n"));

  // Choose initialization method
  let initMethod = await getOrPrompt(options.initMethod, () =>
    selectPrompt("How would you like to configure your project stack?", [
      { name: "Quick start (recommended defaults)", value: "quick" },
      { name: "Custom configuration", value: "custom" },
      { name: "AI-assisted (describe your project)", value: "ai" },
    ])
  );

  let config: InitConfigChoice;

  if (initMethod === "ai") {
    console.log(chalk.cyan("\n🤖 AI-Assisted Stack Configuration\n"));
    const description = await getOrPrompt(options.projectDescription, () =>
      textInputPrompt(
        "Describe your project (e.g., 'A SaaS app for team collaboration with real-time features'):"
      )
    );

    console.log(chalk.gray("\n  Analyzing your requirements...\n"));
    config = await workflowAIAssistant.assistInitConfig({
      userDescription: description,
      aiOptions: {
        aiProvider,
        aiModel,
        aiKey: apiKey,
        aiProviderUrl,
      },
      streamingOptions,
    });

    // Override AI's project name with user's choice
    config.projectName = projectName;
    // Override AI config with what we just set
    config.aiProvider = aiProvider;
    config.aiModel = aiModel;

    console.log(chalk.green("\n✓ AI Recommendations:"));
    console.log(chalk.gray(`  Project: ${config.projectName}`));
    console.log(chalk.gray(`  Frontend: ${config.frontend || "none"}`));
    console.log(chalk.gray(`  Backend: ${config.backend || "none"}`));
    console.log(chalk.gray(`  Database: ${config.database || "none"}`));
    console.log(chalk.gray(`  Auth: ${config.auth ? "yes" : "no"}`));
    if (config.reasoning) {
      console.log(chalk.gray(`\n  ${config.reasoning}\n`));
    }

    const acceptRecommendation = await getOrPrompt(
      options.autoAccept ? true : undefined,
      () => confirmPrompt("Accept these recommendations?", true)
    );

    if (!acceptRecommendation) {
      console.log(chalk.yellow("⚠ Falling back to custom configuration"));
      initMethod = "custom" as any;
    }
  }

  if (initMethod === "quick") {
    config = {
      projectName: projectName,
      aiProvider: aiProvider,
      aiModel: aiModel,
      frontend: "next",
      backend: "hono",
      database: "sqlite",
      auth: true,
      reasoning: "Modern, well-supported stack",
    };
  } else if (initMethod === "custom") {
    config = {
      projectName: projectName,
      aiProvider: aiProvider,
      aiModel: aiModel,
    };

    const shouldBootstrap = await getOrPrompt(options.bootstrap, () =>
      confirmPrompt("Bootstrap with Better-T-Stack?", true)
    );

    if (shouldBootstrap) {
      config.frontend = await getOrPrompt(options.frontend, () =>
        selectPrompt("Frontend framework:", [
          "next",
          "tanstack-router",
          "react-router",
          "vite-react",
          "remix",
        ])
      );
      config.backend = await getOrPrompt(options.backend, () =>
        selectPrompt("Backend framework:", [
          "hono",
          "express",
          "elysia",
          "fastify",
        ])
      );
      config.database = await getOrPrompt(options.database, () =>
        selectPrompt("Database:", [
          "sqlite",
          "postgres",
          "mysql",
          "mongodb",
          "turso",
          "neon",
        ])
      );
      config.auth = await getOrPrompt(options.auth, () =>
        confirmPrompt("Include authentication?", true)
      );
    }
  }

  // Bootstrap Logic
  if (config!.frontend || config!.backend) {
    const shouldBootstrap = await getOrPrompt(options.bootstrap, () =>
      confirmPrompt("Bootstrap project now?", true)
    );

    if (shouldBootstrap) {
      console.log(chalk.cyan("\n  Bootstrapping with Better-T-Stack...\n"));

      try {
        // We are already in the project directory.
        // We pass "." as the project name so Better-T-Stack scaffolds in the current directory.
        const result = await runBetterTStackCLI(
          {
            projectName: ".", // Force scaffolding in current dir
            frontend: config!.frontend || "next",
            backend: config!.backend || "hono",
            database: config!.database || "sqlite",
            noAuth: !config!.auth,
            // Default values for required fields that might be missing from simple config
            orm: "drizzle",
            packageManager: "npm",
            runtime: "node",
            noInstall: false,
            noGit: false,
          },
          process.cwd()
        );

        if (result.success) {
          console.log(chalk.green(`\n✓ ${result.message}\n`));

          // Fix up the configuration files
          // Because we passed ".", the config file is named ".-bts-config.json" and contains projectName: "."
          const dotConfigPath = join(newTaskOMaticDir, ".-bts-config.json");
          const realConfigPath = join(
            newTaskOMaticDir,
            `${projectName}-bts-config.json`
          );
          const stackConfigPath = join(newTaskOMaticDir, "stack.json");

          if (existsSync(dotConfigPath)) {
            const configContent = JSON.parse(
              readFileSync(dotConfigPath, "utf-8")
            );
            configContent.projectName = projectName; // Fix the project name

            const newContent = JSON.stringify(configContent, null, 2);
            writeFileSync(realConfigPath, newContent);
            writeFileSync(stackConfigPath, newContent);

            // Remove the temporary dot config
            const { unlinkSync } = require("fs");
            unlinkSync(dotConfigPath);
          }
        } else {
          console.log(chalk.red(`\n✗ Bootstrap failed: ${result.message}\n`));
          console.log(
            chalk.yellow(
              "You can try running 'task-o-matic init bootstrap' manually later.\n"
            )
          );
        }
      } catch (error) {
        console.log(chalk.red(`\n✗ Bootstrap failed: ${error}\n`));
      }
    }
  }

  // Save configuration
  configManager.save();

  console.log(chalk.green("✓ Project initialized"));

  state.initialized = true;
  state.projectName = config!.projectName;
  state.aiConfig = {
    provider: aiProvider,
    model: aiModel,
    key: apiKey,
  };
  state.currentStep = "define-prd";
}

/**
 * Step 2: Define PRD
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

  const taskOMaticDir = configManager.getTaskOMaticDir();
  const prdDir = join(taskOMaticDir, "prd");

  if (prdMethod === "skip") {
    console.log(chalk.yellow("⚠ Skipping PRD definition"));
    state.currentStep = "refine-prd";
    return;
  }

  let prdContent = "";
  let prdFilename = "prd.md";

  if (prdMethod === "upload") {
    const filePath = await getOrPrompt(options.prdFile, () =>
      textInputPrompt("Path to PRD file:")
    );

    if (!existsSync(filePath)) {
      console.log(chalk.red(`✗ File not found: ${filePath}`));
      return stepDefinePRD(state, options, streamingOptions);
    }

    prdContent = readFileSync(filePath, "utf-8");
    prdFilename = filePath.split("/").pop() || "prd.md";
  } else if (prdMethod === "manual") {
    console.log(chalk.gray("\n  Opening editor...\n"));
    prdContent = await editorPrompt(
      "Write your PRD (save and close editor when done):",
      "# Product Requirements Document\n\n## Overview\n\n## Objectives\n\n## Features\n\n"
    );
  } else if (prdMethod === "ai") {
    console.log(chalk.cyan("\n🤖 AI-Assisted PRD Creation\n"));
    const description = await getOrPrompt(options.prdDescription, () =>
      textInputPrompt("Describe your product in detail:")
    );

    console.log(chalk.gray("\n  Generating PRD...\n"));
    prdContent = await workflowAIAssistant.assistPRDCreation({
      userDescription: description,
      aiOptions: options,
      streamingOptions,
    });

    console.log(chalk.green("\n✓ PRD generated"));
    console.log(chalk.gray("\n" + prdContent.substring(0, 500) + "...\n"));

    const acceptPRD = await getOrPrompt(
      options.autoAccept ? true : undefined,
      () => confirmPrompt("Accept this PRD?", true)
    );

    if (!acceptPRD) {
      console.log(chalk.yellow("⚠ Regenerating..."));
      return stepDefinePRD(state, options, streamingOptions);
    }
  }

  // Save PRD
  const prdPath = join(prdDir, prdFilename);
  writeFileSync(prdPath, prdContent);

  console.log(chalk.green(`✓ PRD saved to ${prdPath}`));

  state.prdFile = prdPath;
  state.prdContent = prdContent;
  state.currentStep = "refine-prd";
}

/**
 * Step 3: Refine PRD
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
    () => confirmPrompt("Refine your PRD?", false)
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

  if (refineMethod === "manual") {
    console.log(chalk.gray("\n  Opening editor...\n"));
    refinedContent = await editorPrompt(
      "Edit your PRD (save and close when done):",
      refinedContent
    );
  } else if (refineMethod === "ai") {
    console.log(chalk.cyan("\n🤖 AI-Assisted Refinement\n"));
    const feedback = await getOrPrompt(options.refineFeedback, () =>
      textInputPrompt(
        "What would you like to improve? (e.g., 'Add more technical details', 'Focus on MVP features'):"
      )
    );

    console.log(chalk.gray("\n  Refining PRD...\n"));
    refinedContent = await workflowAIAssistant.assistPRDRefinement({
      currentPRD: refinedContent,
      userFeedback: feedback,
      aiOptions: options,
      streamingOptions,
    });

    console.log(chalk.green("\n✓ PRD refined"));
    console.log(chalk.gray("\n" + refinedContent.substring(0, 500) + "...\n"));

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

  // Save refined PRD
  writeFileSync(state.prdFile, refinedContent);
  state.prdContent = refinedContent;

  console.log(chalk.green(`✓ PRD updated`));
  state.currentStep = "generate-tasks";
}

/**
 * Step 4: Generate Tasks
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

  const result = await prdService.parsePRD({
    file: state.prdFile,
    workingDirectory: state.projectDir,
    aiOptions: options,
    messageOverride: customInstructions,
    streamingOptions,
    callbacks: {
      onProgress: displayProgress,
      onError: displayError,
    },
  });

  console.log(chalk.green(`\n✓ Generated ${result.tasks.length} tasks`));

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

  for (const taskId of tasksToSplit) {
    const task = state.tasks.find((t) => t.id === taskId);
    if (!task) continue;

    console.log(chalk.cyan(`\n  Splitting: ${task.title}\n`));

    let splitMethod = globalSplitMethod;
    let customInstructions = globalCustomInstructions;

    if (globalSplitMethod === "interactive") {
      splitMethod = await selectPrompt("Split method:", [
        { name: "Standard AI split", value: "standard" },
        { name: "Custom instructions", value: "custom" },
      ]);

      if (splitMethod === "custom") {
        customInstructions = await textInputPrompt(
          "Custom instructions (e.g., 'Break into 2-4 hour chunks'):",
          ""
        );
      }
    }

    try {
      const result = await taskService.splitTask(
        taskId,
        options,
        undefined, // promptOverride
        customInstructions,
        streamingOptions
      );

      console.log(
        chalk.green(`  ✓ Created ${result.subtasks.length} subtasks`)
      );
      result.subtasks.forEach((subtask: Task, index: number) => {
        console.log(chalk.gray(`    ${index + 1}. ${subtask.title}`));
      });
    } catch (error) {
      console.log(chalk.red(`  ✗ Failed to split task: ${error}`));
    }
  }

  console.log(chalk.green("\n✓ Task splitting complete"));
}
