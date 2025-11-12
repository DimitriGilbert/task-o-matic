import { Command } from "commander";
import chalk from "chalk";
import { existsSync, readFileSync } from "fs";
import { configManager } from "../lib/config";
import { AIConfig } from "../types";

export const configCommand = new Command("config").description(
  "Manage task-o-matic configuration",
);

// Get AI config
configCommand
  .command("get-ai-config")
  .description("Get the current AI configuration")
  .action(() => {
    const aiConfig = configManager.getAIConfig();
    console.log(chalk.blue("Current AI Configuration:"));
    console.log(aiConfig);
  });

// Set AI provider
configCommand
  .command("set-ai-provider")
  .description("Set the AI provider and model")
  .argument("<provider>", "AI provider (e.g., openrouter, openai)")
  .argument("[model]", "AI model (optional)")
  .action((provider, model) => {
    const currentConfig = configManager.getAIConfig();
    const newConfig: Partial<AIConfig> = {
      provider: provider,
      ...(model && { model: model }),
    };
    configManager.setAIConfig(newConfig);
    console.log(chalk.green("✓ AI provider updated"));
    console.log(configManager.getAIConfig());
  });

// Get project info
configCommand
  .command("info")
  .description("Get information about the current task-o-matic project")
  .action(() => {
    const config = configManager.getConfig();
    const taskOMaticDir = configManager.getTaskOMaticDir();

    console.log(chalk.blue("Task-o-matic Project Info:"));
    console.log(chalk.cyan(`  Project Directory: ${configManager.getWorkingDirectory()}`),
    );
    console.log(chalk.cyan(`  .task-o-matic dir: ${taskOMaticDir}`));

    if (existsSync(taskOMaticDir)) {
      const configFile = configManager.getConfigFilePath();
      if (existsSync(configFile)) {
        console.log(chalk.green(`  ✓ Config file found: ${configFile}`));
        const configData = JSON.parse(readFileSync(configFile, "utf-8"));
        console.log(chalk.gray(JSON.stringify(configData, null, 2)));
      } else {
        console.log(chalk.yellow("  ✗ Config file not found."));
      }
    } else {
      console.log(chalk.red("  ✗ Not a task-o-matic project."));
    }
  });