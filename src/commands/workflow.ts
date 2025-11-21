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
import type { WorkflowState, InitConfigChoice } from "../types/options";
import type { Task } from "../types";

export const workflowCommand = new Command("workflow")
  .description(
    "Interactive workflow for complete project setup and task management"
  )
  .option("--stream", "Show streaming AI output")
  .option("--ai-provider <provider>", "AI provider override")
  .option("--ai-model <model>", "AI model override")
  .option("--ai-key <key>", "AI API key override")
  .action(async (options) => {
    try {
      console.log(chalk.blue.bold("\n🚀 Task-O-Matic Interactive Workflow\n"));
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

      // Store AI options for later use
      const aiOptions = {
        aiProvider: options.aiProvider,
        aiModel: options.aiModel,
        aiKey: options.aiKey,
      };

      const streamingOptions = createStreamingOptions(
        options.stream,
        "Workflow"
      );

      // Step 1: Initialize/Bootstrap
      await stepInitialize(state, aiOptions, streamingOptions);

      // Step 2: Define PRD
      await stepDefinePRD(state, aiOptions, streamingOptions);

      // Step 3: Refine PRD
      await stepRefinePRD(state, aiOptions, streamingOptions);

      // Step 4: Generate Tasks
      await stepGenerateTasks(state, aiOptions, streamingOptions);

      // Step 5: Split Tasks
      await stepSplitTasks(state, aiOptions, streamingOptions);

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
 * Step 1: Initialize/Bootstrap
 */
async function stepInitialize(
  state: WorkflowState,
  aiOptions: any,
  streamingOptions: any
): Promise<void> {
  console.log(chalk.blue.bold("\n📦 Step 1: Project Initialization\n"));

  // Check if already initialized in current directory
  const taskOMaticDir = configManager.getTaskOMaticDir();
  const alreadyInitialized = existsSync(taskOMaticDir);

  if (alreadyInitialized) {
    console.log(chalk.yellow("✓ Project already initialized"));
    const useExisting = await confirmPrompt(
      "Use existing configuration?",
      true
    );

    if (useExisting) {
      state.initialized = true;
      state.currentStep = "define-prd";
      return;
    }
  }

  const shouldInitialize = await confirmPrompt(
    "Initialize a new task-o-matic project?",
    true
  );

  if (!shouldInitialize) {
    console.log(chalk.yellow("⚠ Skipping initialization"));
    state.initialized = false;
    state.currentStep = "define-prd";
    return;
  }

  const projectName = await textInputPrompt(
    "What is the name of your project?",
    "my-app"
  );

  // Choose initialization method
  let initMethod = await selectPrompt(
    "How would you like to configure your project?",
    [
      { name: "Quick start (recommended defaults)", value: "quick" },
      { name: "Custom configuration", value: "custom" },
      { name: "AI-assisted (describe your project)", value: "ai" },
    ]
  );

  let config: InitConfigChoice;

  if (initMethod === "ai") {
    console.log(chalk.cyan("\n🤖 AI-Assisted Configuration\n"));
    const description = await textInputPrompt(
      "Describe your project (e.g., 'A SaaS app for team collaboration with real-time features'):"
    );

    console.log(chalk.gray("\n  Analyzing your requirements...\n"));
    config = await workflowAIAssistant.assistInitConfig({
      userDescription: description,
      aiOptions,
      streamingOptions,
    });

    // Override AI's project name with user's choice if they provided one (though we just asked for it, so we should use it)
    config.projectName = projectName;

    console.log(chalk.green("\n✓ AI Recommendations:"));
    console.log(chalk.gray(`  Project: ${config.projectName}`));
    console.log(chalk.gray(`  AI Provider: ${config.aiProvider}`));
    console.log(chalk.gray(`  Frontend: ${config.frontend || "none"}`));
    console.log(chalk.gray(`  Backend: ${config.backend || "none"}`));
    console.log(chalk.gray(`  Database: ${config.database || "none"}`));
    console.log(chalk.gray(`  Auth: ${config.auth ? "yes" : "no"}`));
    if (config.reasoning) {
      console.log(chalk.gray(`\n  ${config.reasoning}\n`));
    }

    const acceptRecommendation = await confirmPrompt(
      "Accept these recommendations?",
      true
    );

    if (!acceptRecommendation) {
      console.log(chalk.yellow("⚠ Falling back to custom configuration"));
      initMethod = "custom" as any;
    }
  }

  if (initMethod === "quick") {
    config = {
      projectName: projectName,
      aiProvider: "openrouter",
      aiModel: "anthropic/claude-3.5-sonnet",
      frontend: "next",
      backend: "hono",
      database: "sqlite",
      auth: true,
      reasoning: "Modern, well-supported stack",
    };
  } else if (initMethod === "custom") {
    config = {
      projectName: projectName,
      aiProvider: await selectPrompt("AI Provider:", [
        "openrouter",
        "anthropic",
        "openai",
        "custom",
      ]),
      aiModel: await textInputPrompt(
        "AI Model:",
        "anthropic/claude-3.5-sonnet"
      ),
    };

    const shouldBootstrap = await confirmPrompt(
      "Bootstrap with Better-T-Stack?",
      true
    );

    if (shouldBootstrap) {
      config.frontend = await selectPrompt("Frontend framework:", [
        "next",
        "tanstack-router",
        "react-router",
        "vite-react",
        "remix",
      ]);
      config.backend = await selectPrompt("Backend framework:", [
        "hono",
        "express",
        "elysia",
        "fastify",
      ]);
      config.database = await selectPrompt("Database:", [
        "sqlite",
        "postgres",
        "mysql",
        "mongodb",
        "turso",
        "neon",
      ]);
      config.auth = await confirmPrompt("Include authentication?", true);
    }
  }

  // Bootstrap Logic
  let projectDir = process.cwd();
  let didBootstrap = false;

  if (config!.frontend || config!.backend) {
    const shouldBootstrap = await confirmPrompt("Bootstrap project now?", true);

    if (shouldBootstrap) {
      console.log(chalk.cyan("\n  Bootstrapping with Better-T-Stack...\n"));

      try {
        const result = await runBetterTStackCLI(
          {
            projectName: config!.projectName,
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
          didBootstrap = true;

          // Update project directory if a new directory was created
          if (result.projectPath) {
            projectDir = resolve(process.cwd(), result.projectPath);
            console.log(
              chalk.cyan(`  📂 Switching to project directory: ${projectDir}\n`)
            );
            process.chdir(projectDir);
            configManager.setWorkingDirectory(projectDir);
            state.projectDir = projectDir;
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

  // Initialize task-o-matic in the correct directory (projectDir)
  console.log(chalk.cyan("\n  Initializing task-o-matic...\n"));

  // Re-check task-o-matic dir in the new location
  const newTaskOMaticDir = join(projectDir, ".task-o-matic");

  if (!existsSync(newTaskOMaticDir)) {
    mkdirSync(newTaskOMaticDir, { recursive: true });
    ["tasks", "prd", "logs"].forEach((dir) => {
      mkdirSync(join(newTaskOMaticDir, dir), { recursive: true });
    });
  }

  // Handle .env configuration
  const envPath = join(projectDir, ".env");
  let envContent = "";

  if (existsSync(envPath)) {
    envContent = readFileSync(envPath, "utf-8");
  }

  // Check if we need to ask for API key
  const providerKeyName =
    config!.aiProvider === "openai"
      ? "OPENAI_API_KEY"
      : config!.aiProvider === "anthropic"
      ? "ANTHROPIC_API_KEY"
      : config!.aiProvider === "openrouter"
      ? "OPENROUTER_API_KEY"
      : "AI_API_KEY";

  // Check if key exists in current env OR in the target .env file
  const hasKeyInEnv =
    process.env[providerKeyName] || envContent.includes(providerKeyName);

  if (!hasKeyInEnv) {
    console.log(
      chalk.yellow(`\n⚠️  No API key found for ${config!.aiProvider}`)
    );

    const apiKey = await textInputPrompt(
      `Enter your ${config!.aiProvider} API Key:`
    );

    // Prepare .env content
    let newEnvContent = envContent;
    if (newEnvContent && !newEnvContent.endsWith("\n")) {
      newEnvContent += "\n";
    }

    if (!newEnvContent.includes("AI_PROVIDER=")) {
      newEnvContent += `AI_PROVIDER=${config!.aiProvider}\n`;
    }
    if (!newEnvContent.includes("AI_MODEL=")) {
      newEnvContent += `AI_MODEL=${config!.aiModel}\n`;
    }
    if (!newEnvContent.includes(`${providerKeyName}=`)) {
      newEnvContent += `${providerKeyName}=${apiKey}\n`;
    }

    writeFileSync(envPath, newEnvContent);
    console.log(chalk.green(`✓ Saved configuration to ${envPath}`));

    // Update process.env for immediate use in this session
    process.env[providerKeyName] = apiKey;
    process.env.AI_PROVIDER = config!.aiProvider;
    process.env.AI_MODEL = config!.aiModel;
  }

  // Save configuration
  configManager.setConfig({
    ai: {
      provider: config!.aiProvider as any, // Cast to satisfy AIProvider type
      model: config!.aiModel,
      maxTokens: 32768,
      temperature: 0.5,
      apiKey: process.env[providerKeyName], // Ensure key is in config if needed
    },
  });
  configManager.save();

  console.log(chalk.green("✓ Project initialized"));

  state.initialized = true;
  state.projectName = config!.projectName;
  state.aiConfig = {
    provider: config!.aiProvider,
    model: config!.aiModel,
  };
  state.currentStep = "define-prd";
}

/**
 * Step 2: Define PRD
 */
async function stepDefinePRD(
  state: WorkflowState,
  aiOptions: any,
  streamingOptions: any
): Promise<void> {
  console.log(chalk.blue.bold("\n📝 Step 2: Define PRD\n"));

  const prdMethod = await selectPrompt(
    "How would you like to define your PRD?",
    [
      { name: "Upload existing file", value: "upload" },
      { name: "Write manually (open editor)", value: "manual" },
      { name: "AI-assisted creation", value: "ai" },
      { name: "Skip (use existing PRD)", value: "skip" },
    ]
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
    const filePath = await textInputPrompt("Path to PRD file:");

    if (!existsSync(filePath)) {
      console.log(chalk.red(`✗ File not found: ${filePath}`));
      return stepDefinePRD(state, aiOptions, streamingOptions);
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
    const description = await textInputPrompt(
      "Describe your product in detail:"
    );

    console.log(chalk.gray("\n  Generating PRD...\n"));
    prdContent = await workflowAIAssistant.assistPRDCreation({
      userDescription: description,
      aiOptions,
      streamingOptions,
    });

    console.log(chalk.green("\n✓ PRD generated"));
    console.log(chalk.gray("\n" + prdContent.substring(0, 500) + "...\n"));

    const acceptPRD = await confirmPrompt("Accept this PRD?", true);

    if (!acceptPRD) {
      console.log(chalk.yellow("⚠ Regenerating..."));
      return stepDefinePRD(state, aiOptions, streamingOptions);
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
  aiOptions: any,
  streamingOptions: any
): Promise<void> {
  console.log(chalk.blue.bold("\n✨ Step 3: Refine PRD\n"));

  if (!state.prdFile) {
    console.log(chalk.yellow("⚠ No PRD file found, skipping refinement"));
    state.currentStep = "generate-tasks";
    return;
  }

  const shouldRefine = await confirmPrompt("Refine your PRD?", false);

  if (!shouldRefine) {
    console.log(chalk.gray("  Skipping refinement"));
    state.currentStep = "generate-tasks";
    return;
  }

  const refineMethod = await selectPrompt("How would you like to refine?", [
    { name: "Manual editing (open editor)", value: "manual" },
    { name: "AI-assisted refinement", value: "ai" },
    { name: "Skip", value: "skip" },
  ]);

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
    const feedback = await textInputPrompt(
      "What would you like to improve? (e.g., 'Add more technical details', 'Focus on MVP features'):"
    );

    console.log(chalk.gray("\n  Refining PRD...\n"));
    refinedContent = await workflowAIAssistant.assistPRDRefinement({
      currentPRD: refinedContent,
      userFeedback: feedback,
      aiOptions,
      streamingOptions,
    });

    console.log(chalk.green("\n✓ PRD refined"));
    console.log(chalk.gray("\n" + refinedContent.substring(0, 500) + "...\n"));

    const acceptRefinement = await confirmPrompt("Accept refinements?", true);

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
  aiOptions: any,
  streamingOptions: any
): Promise<void> {
  console.log(chalk.blue.bold("\n🎯 Step 4: Generate Tasks\n"));

  if (!state.prdFile) {
    console.log(chalk.yellow("⚠ No PRD file found, skipping task generation"));
    state.currentStep = "split-tasks";
    return;
  }

  const shouldGenerate = await confirmPrompt("Generate tasks from PRD?", true);

  if (!shouldGenerate) {
    console.log(chalk.gray("  Skipping task generation"));
    state.currentStep = "split-tasks";
    return;
  }

  const generationMethod = await selectPrompt("Choose generation method:", [
    { name: "Standard parsing", value: "standard" },
    { name: "AI-assisted with custom instructions", value: "ai" },
  ]);

  let customInstructions: string | undefined;

  if (generationMethod === "ai") {
    customInstructions = await textInputPrompt(
      "Custom instructions (e.g., 'Focus on MVP features', 'Break into small tasks'):",
      ""
    );
  }

  console.log(chalk.cyan("\n  Parsing PRD and generating tasks...\n"));

  const result = await prdService.parsePRD({
    file: state.prdFile,
    workingDirectory: state.projectDir,
    aiOptions,
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
  aiOptions: any,
  streamingOptions: any
): Promise<void> {
  console.log(chalk.blue.bold("\n🔀 Step 5: Split Complex Tasks\n"));

  if (!state.tasks || state.tasks.length === 0) {
    console.log(chalk.yellow("⚠ No tasks found, skipping splitting"));
    return;
  }

  const shouldSplit = await confirmPrompt(
    "Split any complex tasks into subtasks?",
    false
  );

  if (!shouldSplit) {
    console.log(chalk.gray("  Skipping task splitting"));
    return;
  }

  // Show tasks with effort estimates
  const tasksToSplit = await multiSelectPrompt(
    "Select tasks to split:",
    state.tasks.map((t) => ({
      name: `${t.title}${
        t.description ? ` - ${t.description.substring(0, 50)}...` : ""
      }`,
      value: t.id,
    }))
  );

  if (tasksToSplit.length === 0) {
    console.log(chalk.gray("  No tasks selected"));
    return;
  }

  for (const taskId of tasksToSplit) {
    const task = state.tasks.find((t) => t.id === taskId);
    if (!task) continue;

    console.log(chalk.cyan(`\n  Splitting: ${task.title}\n`));

    const splitMethod = await selectPrompt("Split method:", [
      { name: "Standard AI split", value: "standard" },
      { name: "Custom instructions", value: "custom" },
    ]);

    let customInstructions: string | undefined;

    if (splitMethod === "custom") {
      customInstructions = await textInputPrompt(
        "Custom instructions (e.g., 'Break into 2-4 hour chunks'):",
        ""
      );
    }

    try {
      const result = await taskService.splitTask(
        taskId,
        aiOptions,
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
