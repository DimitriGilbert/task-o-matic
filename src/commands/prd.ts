#!/usr/bin/env node

import { Command } from "commander";
import chalk from "chalk";
import { prdService } from '../services/prd';
import { createStreamingOptions } from '../utils/streaming-options';
import { displayProgress, displayError } from '../cli/display/progress';

export const prdCommand = new Command("prd").description("Manage PRDs and generate tasks");

// Parse PRD into tasks
prdCommand
  .command("parse")
  .description("Parse a PRD file into structured tasks")
  .requiredOption("--file <path>", "Path to PRD file")
  .option("--prompt <prompt>", "Override prompt")
  .option("--message <message>", "User message")
  .option("--ai-provider <provider>", "AI provider override")
  .option("--ai-model <model>", "AI model override")
  .option("--ai-key <key>", "AI API key override")
  .option("--ai-provider-url <url>", "AI provider URL override")
  .option("--ai-reasoning <tokens>", "Enable reasoning for OpenRouter models (max reasoning tokens)")
  .option("--stream", "Show streaming AI output during parsing")
  .action(async (options) => {
    try {
      // Determine working directory from current process location
      // Service layer should receive this explicitly, not use process.cwd()
      const workingDirectory = process.cwd();

      const streamingOptions = createStreamingOptions(options.stream, 'Parsing');

      const result = await prdService.parsePRD({
        file: options.file,
        workingDirectory, // Pass working directory explicitly to service
        aiOptions: {
          aiProvider: options.aiProvider,
          aiModel: options.aiModel,
          aiKey: options.aiKey,
          aiProviderUrl: options.aiProviderUrl,
          aiReasoning: options.aiReasoning,
        },
        promptOverride: options.prompt,
        messageOverride: options.message,
        streamingOptions,
        callbacks: {
          onProgress: displayProgress,
          onError: displayError,
        },
      });

      console.log('');
      console.log(chalk.blue(`📊 PRD Parsing Summary:`));
      console.log(chalk.cyan(`  Tasks created: ${result.stats.tasksCreated}`));
      console.log(chalk.cyan(`  Duration: ${result.stats.duration}ms`));
      console.log(chalk.cyan(`  AI Model: ${result.stats.aiModel}`));

      console.log(chalk.blue('\n📋 Processing Steps:'));
      result.steps.forEach(step => {
        const icon = step.status === 'completed' ? '✓' : '✗';
        console.log(`  ${icon} ${step.step} (${step.duration}ms)`);
        if (step.details) {
          console.log(chalk.gray(`     ${JSON.stringify(step.details)}`));
        }
      });

      // Show created tasks
      console.log(chalk.blue("\n✨ Created Tasks:"));
      result.tasks.forEach((task, index) => {
        console.log(`${index + 1}. ${chalk.bold(task.title)} (${task.id})`);
        if (task.description) {
          console.log(chalk.gray(`   ${task.description.substring(0, 100)}${task.description.length > 100 ? '...' : ''}`));
        }
        if (task.estimatedEffort) {
          console.log(chalk.cyan(`   Effort: ${task.estimatedEffort}`));
        }
        console.log('');
      });
    } catch (error) {
      displayError(error);
      process.exit(1);
    }
  });

// Rework PRD with AI
prdCommand
  .command("rework")
  .description("Rework a PRD based on user feedback")
  .requiredOption("--file <path>", "Path to PRD file")
  .requiredOption("--feedback <feedback>", "User feedback")
  .option("--output <path>", "Output file path (default: overwrite original)")
  .option("--prompt <prompt>", "Override prompt")
  .option("--message <message>", "User message")
  .option("--ai-provider <provider>", "AI provider override")
  .option("--ai-model <model>", "AI model override")
  .option("--ai-key <key>", "AI API key override")
  .option("--ai-provider-url <url>", "AI provider URL override")
  .option("--ai-reasoning <tokens>", "Enable reasoning for OpenRouter models (max reasoning tokens)")
  .option("--stream", "Show streaming AI output during rework")
  .action(async (options) => {
    try {
      const streamingOptions = createStreamingOptions(options.stream, 'Rework');

      const outputPath = await prdService.reworkPRD({
        file: options.file,
        feedback: options.feedback,
        output: options.output,
        aiOptions: {
          aiProvider: options.aiProvider,
          aiModel: options.aiModel,
          aiKey: options.aiKey,
          aiProviderUrl: options.aiProviderUrl,
          aiReasoning: options.aiReasoning,
        },
        promptOverride: options.prompt,
        messageOverride: options.message,
        streamingOptions,
        callbacks: {
          onProgress: displayProgress,
          onError: displayError,
        },
      });

      console.log('');
      console.log(chalk.green(`✓ PRD improved and saved to ${outputPath}`));
      console.log(chalk.cyan(`Feedback applied: ${options.feedback}`));
    } catch (error) {
      displayError(error);
      process.exit(1);
    }
  });
