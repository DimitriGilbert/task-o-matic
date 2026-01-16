#!/usr/bin/env node

import { Command } from "commander";
import chalk from "chalk";
import { configManager, workflowService } from "task-o-matic-core";
import { displayError } from "../cli/display/progress";

export const continueCommand = new Command("continue")
  .description("Continue working on an existing project")
  .option("-s, --status", "Show project status overview")
  .option("-a, --add-feature <feature>", "Add a new feature to the PRD")
  .option("-u, --update-prd", "Update PRD with implementation progress")
  .option("-g, --generate-tasks", "Generate tasks for unimplemented features")
  .option("-p, --generate-plan", "Generate implementation plan for remaining work")
  .action(async (options) => {
    try {
      const workingDir = configManager.getWorkingDirectory() || process.cwd();
      
      let action: any = "review-status"; // Default action
      if (options.addFeature) action = "add-feature";
      else if (options.updatePrd) action = "update-prd";
      else if (options.generateTasks) action = "generate-tasks";
      else if (options.generatePlan) action = "generate-plan";

      // If just --status or no options, it falls to review-status which is correct

      const result = await workflowService.continueProject({
        projectDir: workingDir,
        action: action,
        callbacks: {
          onProgress: (event) => {
            if (event.type === "started") console.log(chalk.blue(event.message));
            else if (event.type === "completed") console.log(chalk.green(event.message));
            else if (event.type === "progress") console.log(chalk.gray(event.message));
            else if (event.type === "info") console.log(chalk.gray(event.message));
            else if (event.type === "warning") console.log(chalk.yellow(event.message));
            // Ignore stream chunks for cleaner output
          },
          onError: (error) => {
            console.error(chalk.red("Error:"), error.message);
          }
        }
      });

      if (!result.success) {
        console.log(chalk.red(`\n❌ ${result.message}`));
        if (result.action === "initialize") {
             console.log(chalk.cyan("Run 'task-o-matic init attach' to set up this project."));
        }
        process.exit(1);
      }

      const status = result.projectStatus!;
      
      console.log(chalk.bold.blue(`\n📊 Project Status: ${status.prd?.exists ? "Active" : "No PRD"}`));
      
      console.log(chalk.bold("\nTasks:"));
      console.log(`  ${chalk.green("✓")} ${status.tasks.completed} Completed`);
      console.log(`  ${chalk.yellow("➜")} ${status.tasks.inProgress} In Progress`);
      console.log(`  ${chalk.white("○")} ${status.tasks.todo} Todo`);
      console.log(`  ${chalk.cyan("=")} ${status.tasks.total} Total (${status.tasks.completionPercentage}% Complete)`);

      if (status.prd) {
        console.log(chalk.bold("\nPRD:"));
        console.log(`  ${status.prd.exists ? chalk.green("✓ Found") : chalk.red("✗ Missing")}`);
        if (status.prd.exists) {
             console.log(`  Path: ${status.prd.path}`);
        }
      }

      if (status.nextSteps && status.nextSteps.length > 0) {
        console.log(chalk.bold("\n👉 Suggested Next Steps:"));
        status.nextSteps.forEach(step => console.log(`  - ${step}`));
      }

      if (result.message && result.message !== "Project status analysis complete") {
          console.log(chalk.yellow(`\nℹ️  ${result.message}`));
      }

    } catch (error) {
      displayError(error);
      process.exit(1);
    }
  });
