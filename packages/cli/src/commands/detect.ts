#!/usr/bin/env node

import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import chalk from "chalk";
import { Command } from "commander";
import { ProjectAnalysisService, configManager } from "task-o-matic-core";

import { displayError } from "../cli/display/progress";

export const detectCommand = new Command("detect").description(
  "Detect technology stack of the current project"
);

detectCommand
  .description("Detect technology stack of the current project")
  .option("--save", "Save detected stack to .task-o-matic/stack.json")
  .option("--json", "Output result as JSON")
  .action(async (options) => {
    try {
      const workingDir = configManager.getWorkingDirectory() || process.cwd();
      
      if (!options.json) {
        console.log(chalk.blue("🔍 Detecting project stack..."));
        console.log(chalk.cyan(`  📁 Working directory: ${workingDir}`));
      }

      // Run ProjectAnalysisService
      const analysisService = new ProjectAnalysisService();
      const stackResult = await analysisService.detectStack(workingDir);

      if (!stackResult.success) {
        if (options.json) {
          console.log(JSON.stringify({ success: false, error: "Stack detection failed", warnings: stackResult.warnings }, null, 2));
        } else {
          console.log(chalk.yellow("⚠️  Stack detection had issues:"));
          stackResult.warnings?.forEach((w) => console.log(chalk.yellow(`   - ${w}`)));
        }
        process.exit(1);
      }

      const stack = stackResult.stack;

      if (options.json) {
        console.log(JSON.stringify(stack, null, 2));
      } else {
        console.log(chalk.green("\n✅ Stack detected:"));
        console.log(`   Language: ${chalk.cyan(stack.language)}`);
        console.log(`   Framework(s): ${chalk.cyan(stack.frameworks.join(", "))}`);
        if (stack.database) console.log(`   Database: ${chalk.cyan(stack.database)}`);
        if (stack.orm) console.log(`   ORM: ${chalk.cyan(stack.orm)}`);
        if (stack.auth) console.log(`   Auth: ${chalk.cyan(stack.auth)}`);
        console.log(`   Package Manager: ${chalk.cyan(stack.packageManager)}`);
        console.log(`   Runtime: ${chalk.cyan(stack.runtime)}`);
        if (stack.api) console.log(`   API: ${chalk.cyan(stack.api)}`);
        console.log(`   Confidence: ${chalk.cyan(`${Math.round(stack.confidence * 100)}%`)}`);
      }

      // Save if requested
      if (options.save) {
        const taskOMaticDir = configManager.getTaskOMaticDir();
        // Ensure .task-o-matic exists? usually configManager handles paths but directory might not exist if not initialized
        // But detect command might be run on uninitialized project too?
        // The plan implies it can be used standalone.
        
        // However, configManager.getTaskOMaticDir() relies on working directory.
        // If we want to save, we should probably check if .task-o-matic exists or create it.
        
        // Actually, init attach creates it. If we run detect --save on a raw project, we should probably create it too?
        // Let's assume we create it if it doesn't exist, similar to init attach.
        
        if (!existsSync(taskOMaticDir)) {
          mkdirSync(taskOMaticDir, { recursive: true });
        }

        const stackFilePath = join(taskOMaticDir, "stack.json");
        writeFileSync(stackFilePath, JSON.stringify(stack, null, 2));
        
        if (!options.json) {
          console.log(chalk.green(`\n  ✓ Saved to ${stackFilePath}`));
        }
      }
    } catch (error) {
      displayError(error);
      process.exit(1);
    }
  });
