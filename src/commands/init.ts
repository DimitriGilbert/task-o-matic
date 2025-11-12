#!/usr/bin/env node

import { Command } from "commander";
import chalk from "chalk";
import { existsSync, mkdirSync, writeFileSync } from "fs";
import { resolve } from "path";
import { configManager, Config } from "../lib/config";
import { runBetterTStackCLI } from "../lib/better-t-stack-cli";

export const initCommand = new Command("init").description(
  "Initialize task-o-matic project and bootstrap Better-T-Stack"
);

// Initialize task-o-matic project
initCommand
  .command("init")
  .description("Initialize a new task-o-matic project in the current directory")
  .option(
    "--ai-provider <provider>",
    "AI provider (openrouter/anthropic/openai/custom)",
    "openrouter"
  )
  .option("--ai-model <model>", "AI model", "z-ai/glm-4.6")
  .option("--ai-key <key>", "AI API key")
  .option("--ai-provider-url <url>", "AI provider URL")
  .option("--max-tokens <tokens>", "Max tokens for AI (min 32768 for 2025)", "32768")
  .option("--temperature <temp>", "AI temperature", "0.5")
  .option("--no-bootstrap", "Skip bootstrap after initialization")
  .option("--project-name <name>", "Project name for bootstrap")
  .option("--frontend <frontend>", "Frontend framework for bootstrap", "next")
  .option("--backend <backend>", "Backend framework for bootstrap", "convex")
  .option("--database <database>", "Database for bootstrap")
  .option("--auth <auth>", "Authentication for bootstrap", "better-auth")
  .option("--context7-api-key <key>", "Context7 API key")
  .option("--directory <dir>", "Working directory for the project")
  .action(async (options) => {
    // Handle directory creation/setup first
    if (options.directory) {
      const targetDir = resolve(options.directory);
      
      // Create directory if it doesn't exist
      if (!existsSync(targetDir)) {
        mkdirSync(targetDir, { recursive: true });
        console.log(chalk.green(`  ✓ Created directory: ${targetDir}`));
      }
      
      // Set working directory in ConfigManager BEFORE any other operations
      configManager.setWorkingDirectory(targetDir);
      console.log(chalk.cyan(`  📁 Working directory: ${targetDir}`));
    }

    const taskOMaticDir = configManager.getTaskOMaticDir();
    console.log(chalk.blue(`🔍 Checking for task-o-matic directory: ${taskOMaticDir}`));

    if (existsSync(taskOMaticDir)) {
      console.log(
        chalk.yellow(
          "⚠️  This directory is already initialized with task-o-matic."
        )
      );
      return;
    }

    console.log(chalk.blue("🚀 Initializing task-o-matic project..."));

    // Create .task-o-matic directory structure
    const dirs = ["tasks", "prd", "logs", "docs"];
    dirs.forEach((dir) => {
      const fullPath = `${taskOMaticDir}/${dir}`;
      mkdirSync(fullPath, { recursive: true });
      console.log(chalk.green(`  ✓ Created ${fullPath}`));
    });

    // Initialize config with provided options
    const config: Config = {
      ai: {
        provider: options.aiProvider,
        model: options.aiModel,
        maxTokens: parseInt(options.maxTokens) || 32768,
        temperature: parseFloat(options.temperature) || 0.5,
      },
    };

    // Add API key if provided
    if (options.aiKey) {
      config.ai.apiKey = options.aiKey;
    }

    // Add provider URL if provided
    if (options.aiProviderUrl) {
      config.ai.baseURL = options.aiProviderUrl;
    }

    configManager.setConfig(config);
    configManager.save();
    console.log(chalk.green(`  ✓ Created ${taskOMaticDir}/config.json`));

    // Initialize mcp.json with context7 config
    const mcpConfig: {
      context7: {
        apiKey?: string;
      };
    } = {
      context7: {},
    };

    if (options.context7ApiKey) {
      mcpConfig.context7.apiKey = options.context7ApiKey;
    }

    const mcpFilePath = `${taskOMaticDir}/mcp.json`;
    writeFileSync(mcpFilePath, JSON.stringify(mcpConfig, null, 2));
    console.log(chalk.green(`  ✓ Created ${mcpFilePath}`));

    console.log(
      chalk.green("\n✅ TaskOMatic project initialized successfully!")
    );

    // Run bootstrap by default if project name is provided (unless --no-bootstrap)
    if (options.projectName && !options.noBootstrap) {
      console.log(chalk.blue("\n🚀 Running bootstrap..."));

      // Use working directory for Better-T-Stack execution
      const workingDir = options.directory || process.cwd();

      try {
        const result = await runBetterTStackCLI(options, workingDir);
        if (result.success) {
          console.log(chalk.green(result.message));
        } else {
          throw new Error(result.message);
        }
      } catch (error) {
        // No chdir needed anymore
      }
    } else {
      console.log(chalk.cyan("\nNext steps:"));
      console.log(
        "  1. Configure AI provider: task-o-matic config set-ai-provider <provider> <model>"
      );
      console.log(
        "  2. Bootstrap your project: task-o-matic init bootstrap <project-name>"
      );
      console.log(
        '  3. Create your first task: task-o-matic tasks create --title "Your first task"'
      );
    }
  });

// Bootstrap project with Better-T-Stack
initCommand
  .command("bootstrap")
  .description("Bootstrap a new project using Better-T-Stack")
  .argument("<name>", "Project name")
  .option(
    "--frontend <frontend>",
    "Frontend framework (next/tanstack-router/react-router/etc)",
    "next"
  )
  .option(
    "--backend <backend>",
    "Backend framework (hono/express/elysia)",
    "hono"
  )
  .option(
    "--database <database>",
    "Database (sqlite/postgres/mysql/mongodb)",
    "sqlite"
  )
  .option("--orm <orm>", "ORM (drizzle/prisma/none)", "drizzle")
  .option("--no-auth", "Exclude authentication")
  .option(
    "--addons <addons... >",
    "Additional addons (pwa/tauri/starlight/biome/husky/turborepo)"
  )
  .option("--examples <examples... >", "Examples to include (todo/ai)")
  .option("--no-git", "Skip git initialization")
  .option("--package-manager <pm>", "Package manager (npm/pnpm/bun)", "npm")
  .option("--no-install", "Skip installing dependencies")
  .option(
    "--db-setup <setup>",
    "Database setup (turso/neon/prisma-postgres/mongodb-atlas)"
  )
  .option("--runtime <runtime>", "Runtime (bun/node)", "node")
  .option("--api <type>", "API type (trpc/orpc)")
  .action(async (name, options) => {
    const taskOMaticDir = configManager.getTaskOMaticDir();

    if (!existsSync(taskOMaticDir)) {
      console.log(
        chalk.red("❌ This directory is not initialized with task-o-matic.")
      );
      console.log(chalk.cyan("Run 'task-o-matic init init' first."));
      return;
    }

    console.log(chalk.blue(`🚀 Bootstrapping project: ${name}`));
    console.log(chalk.cyan(`Configuration:`));
    console.log(`  Frontend: ${options.frontend}`);
    console.log(`  Backend: ${options.backend}`);
    console.log(`  Database: ${options.database}`);
    console.log(`  ORM: ${options.orm}`);
    console.log(`  Auth: ${options.noAuth ? "disabled" : "enabled"}`);
    console.log(`  Package Manager: ${options.packageManager}`);
    console.log(`  Runtime: ${options.runtime}`);

    // Use working directory for Better-T-Stack execution
    const workingDir = configManager.getWorkingDirectory();

    try {
      const result = await runBetterTStackCLI({ ...options, name }, workingDir);
      if (result.success) {
        console.log(chalk.green(result.message));
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      // No chdir needed anymore
    }
  });

// Default action - show help
initCommand.action(() => {
  console.log(chalk.blue("TaskOMatic Initialization"));
  console.log("");
  console.log(chalk.cyan("Usage:"));
  console.log(
    "  task-o-matic init init                    Initialize task-o-matic project"
  );
  console.log(
    "  task-o-matic init bootstrap <name>        Bootstrap Better-T-Stack project"
  );
  console.log("");
  console.log(chalk.cyan("Examples:"));
  console.log("  task-o-matic init init");
  console.log("  task-o-matic init init --project-name my-app");
  console.log(
    "  task-o-matic init init --project-name my-app --ai-provider openrouter --ai-key your-key --frontend next --backend hono"
  );
  console.log("  task-o-matic init init --project-name my-app --no-bootstrap");
  console.log("  task-o-matic init init --directory my-workspace --project-name my-app");
  console.log(
    "  task-o-matic init bootstrap my-app --frontend next --backend hono --database postgres"
  );
  console.log("");
  console.log(chalk.cyan("Init Options:"));
  console.log(
    "  --ai-provider <provider>     AI provider (openrouter/anthropic/openai)"
  );
  console.log("  --ai-model <model>           AI model");
  console.log("  --ai-key <key>               AI API key");
  console.log("  --ai-provider-url <url>      AI provider URL");
  console.log("  --max-tokens <tokens>        Max tokens for AI");
  console.log("  --temperature <temp>         AI temperature");
  console.log(
    "  --no-bootstrap               Skip bootstrap after initialization"
  );
  console.log("  --project-name <name>        Project name for bootstrap");
  console.log("  --directory <dir>            Working directory for the project");

  console.log("");
  console.log(chalk.cyan("Bootstrap Options:"));
  console.log(
    "  --frontend <frontend>         Frontend framework (next/tanstack-router/react-router/etc)"
  );
  console.log(
    "  --backend <backend>           Backend framework (hono/express/elysia)"
  );
  console.log(
    "  --database <database>         Database (sqlite/postgres/mysql/mongodb)"
  );
  console.log("  --auth                       Include authentication");
});
