#!/usr/bin/env node

import { Command } from "commander";
import chalk from "chalk";
import { existsSync, mkdirSync, writeFileSync } from "fs";
import { resolve, join } from "path";
import { configManager, Config } from "task-o-matic-core";
import { displayError } from "../cli/display/progress";
import {
  createStandardError,
  TaskOMaticErrorCodes,
} from "task-o-matic-core";
import { runBetterTStackCLI } from "task-o-matic-core";

export const initCommand = new Command("init").description(
  "Initialize task-o-matic project and bootstrap projects (web/native/cli)"
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
  .option(
    "--max-tokens <tokens>",
    "Max tokens for AI (min 32768 for 2025)",
    "32768"
  )
  .option("--temperature <temp>", "AI temperature", "0.5")
  .option("--no-bootstrap", "Skip bootstrap after initialization")
  .option("--project-name <name>", "Project name for bootstrap")
  .option(
    "--frontend <frontends...>",
    "Frontend framework(s) - space/comma-separated (next, native-bare, cli, etc.)",
    "next"
  )
  .option("--backend <backend>", "Backend framework for bootstrap", "convex")
  .option("--database <database>", "Database for bootstrap")
  .option("--auth <auth>", "Authentication for bootstrap", "better-auth")
  .option("--context7-api-key <key>", "Context7 API key")
  .option("--directory <dir>", "Working directory for the project")
  .option("--package-manager <pm>", "Package manager (npm/pnpm/bun)", "npm")
  .option("--runtime <runtime>", "Runtime (bun/node)", "node")
  .option("--payment <payment>", "Payment provider (none/polar)", "none")
  .option(
    "--cli-deps <level>",
    "CLI dependency level (minimal/standard/full/task-o-matic)",
    "standard"
  )
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
      await configManager.load();
      console.log(chalk.cyan(`  📁 Working directory: ${targetDir}`));
    }

    // If project name is provided, run bootstrap FIRST
    if (options.projectName && !options.noBootstrap) {
      console.log(chalk.blue("\n🚀 Running bootstrap..."));

      // Use working directory for Better-T-Stack execution
      const workingDir = options.directory || process.cwd();

      try {
        const result = await runBetterTStackCLI(options, workingDir);
        if (result.success && result.projectPath) {
          console.log(chalk.green(result.message));

          // Update config manager to point to the new project directory
          configManager.setWorkingDirectory(result.projectPath);
          await configManager.load();

          // Initialize task-o-matic structure in the new project directory
          await initializeProjectStructure(options);

          // ... (existing code)
        } else {
          throw createStandardError(
            TaskOMaticErrorCodes.UNEXPECTED_ERROR,
            result.message,
            {
              context:
                "Bootstrap process failed. The error originated from the 'better-t-stack-cli' tool.",
              suggestions: [
                "Check the output from 'better-t-stack-cli' for more details.",
                "Ensure that 'better-t-stack-cli' is installed and configured correctly.",
              ],
            }
          );
        }
      } catch (error) {
        displayError(error);
        return; // Stop if bootstrap fails
      }
    } else {
      // Standard initialization in current directory
      await initializeProjectStructure(options);
    }

    console.log(chalk.cyan("\nNext steps:"));
    if (!options.projectName) {
      console.log(
        "  1. Configure AI provider: task-o-matic config set-ai-provider <provider> <model>"
      );
      console.log(
        "  2. Bootstrap your project: task-o-matic init bootstrap <project-name>"
      );
      console.log(
        '  3. Create your first task: task-o-matic tasks create --title "Your first task"'
      );
    } else {
      console.log(`  1. cd ${options.projectName}`);
      console.log(
        '  2. Create your first task: task-o-matic tasks create --title "Your first task"'
      );
    }
  });

async function initializeProjectStructure(options: any) {
  const taskOMaticDir = configManager.getTaskOMaticDir();
  console.log(
    chalk.blue(`🔍 Checking for task-o-matic directory: ${taskOMaticDir}`)
  );

  if (existsSync(join(taskOMaticDir, "config.json"))) {
    console.log(
      chalk.yellow("⚠️  This project is already initialized with task-o-matic.")
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

  console.log(chalk.green("\n✅ TaskOMatic project initialized successfully!"));
}

// Bootstrap project with Better-T-Stack
initCommand
  .command("bootstrap")
  .description("Bootstrap a new project (web/native/cli)")
  .argument("<name>", "Project name")
  .option(
    "--frontend <frontends...>",
    "Frontend framework(s) - space/comma-separated (next, native-bare, cli, etc.)",
    "next"
  )
  .option(
    "--backend <backend>",
    "Backend framework (hono/express/fastify/elysia/convex/self/none)",
    "hono"
  )
  .option(
    "--database <database>",
    "Database (sqlite/postgres/mysql/mongodb/none)",
    "sqlite"
  )
  .option("--orm <orm>", "ORM (drizzle/prisma/mongoose/none)", "drizzle")
  .option(
    "--auth <auth>",
    "Authentication (better-auth/clerk/none)",
    "better-auth"
  )
  .option("--no-auth", "Exclude authentication")
  .option(
    "--addons <addons...>",
    "Addons (turborepo/pwa/tauri/biome/husky/starlight/fumadocs/ultracite/oxlint/ruler/opentui/wxt)"
  )
  .option("--examples <examples...>", "Examples to include (todo/ai)")
  .option(
    "--template <template>",
    "Use a predefined template (mern/pern/t3/uniwind/none)"
  )
  .option("--no-git", "Skip git initialization")
  .option("--package-manager <pm>", "Package manager (npm/pnpm/bun)", "npm")
  .option("--no-install", "Skip installing dependencies")
  .option(
    "--db-setup <setup>",
    "Database setup (turso/neon/prisma-postgres/mongodb-atlas)"
  )
  .option("--runtime <runtime>", "Runtime (bun/node)", "node")
  .option("--api <type>", "API type (trpc/orpc)")
  .option("--payment <payment>", "Payment provider (none/polar)", "none")
  .option(
    "--cli-deps <level>",
    "CLI dependency level (minimal/standard/full/task-o-matic)",
    "standard"
  )
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
        throw createStandardError(
          TaskOMaticErrorCodes.UNEXPECTED_ERROR,
          result.message,
          {
            context:
              "Bootstrap process failed. The error originated from the 'better-t-stack-cli' tool.",
            suggestions: [
              "Check the output from 'better-t-stack-cli' for more details.",
              "Ensure that 'better-t-stack-cli' is installed and configured correctly.",
            ],
          }
        );
      }
    } catch (error) {
      displayError(error);
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
  console.log("  # Basic initialization:");
  console.log("  task-o-matic init init");
  console.log("  task-o-matic init init --project-name my-app");
  console.log("");
  console.log("  # Web + Native + CLI + TUI (monorepo):");
  console.log(
    '  task-o-matic init init --project-name my-app --frontend "next native-uniwind cli tui" --backend hono'
  );
  console.log("");
  console.log("  # CLI only:");
  console.log(
    "  task-o-matic init init --project-name my-cli --frontend cli --cli-deps full"
  );
  console.log("");
  console.log("  # TUI only:");
  console.log(
    "  task-o-matic init init --project-name my-tui --frontend tui --tui-framework solid"
  );
  console.log("");
  console.log("  # Web + Native (monorepo):");
  console.log(
    '  task-o-matic init init --project-name my-app --frontend "next native-bare" --backend hono'
  );
  console.log("");
  console.log("  # Multiple web frontends:");
  console.log(
    '  task-o-matic init init --project-name my-app --frontend "next tanstack-router" --backend hono'
  );
  console.log("");
  console.log("  # No bootstrap:");
  console.log("  task-o-matic init init --project-name my-app --no-bootstrap");
  console.log("");
  console.log("  # Custom directory:");
  console.log(
    "  task-o-matic init init --directory my-workspace --project-name my-app"
  );
  console.log("");
  console.log("  # Bootstrap command:");
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
  console.log(
    "  --directory <dir>            Working directory for the project"
  );

  console.log("");
  console.log(chalk.cyan("Bootstrap Options:"));
  console.log(
    "  --frontend <frontends...>     Frontend framework(s) - multiple values supported"
  );
  console.log(
    "                                Web: next, tanstack-router, react-router, nuxt, svelte, solid"
  );
  console.log(
    "                                Native: native-bare, native-uniwind, native-unistyles"
  );
  console.log("                                Custom: cli, tui");
  console.log(
    "  --backend <backend>           Backend framework (hono/express/elysia/convex)"
  );
  console.log(
    "  --database <database>         Database (sqlite/postgres/mysql/mongodb)"
  );
  console.log(
    "  --auth <auth>                Authentication (better-auth/none)"
  );
  console.log(
    "  --cli-deps <level>           CLI dependency level (minimal/standard/full/task-o-matic)"
  );
  console.log("  --tui-framework <framework>  TUI framework (solid/vue/react)");
  console.log("  --package-manager <pm>       Package manager (npm/pnpm/bun)");
  console.log("  --runtime <runtime>          Runtime (node/bun)");
  console.log("  --payment <payment>          Payment provider (none/polar)");
});
