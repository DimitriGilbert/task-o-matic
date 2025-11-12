#!/usr/bin/env node

import { Command } from "commander";
import chalk from "chalk";
import { parsePRD, reworkPRD } from '../lib/prd-operations';

import { createStreamingOptions } from '../utils/streaming-options';

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
    console.log(chalk.blue("🤖 Parsing PRD with AI..."));

    // Set up streaming options if stream flag is enabled
    const streamingOptions = createStreamingOptions(options.stream, 'Parsing');

    const result = await parsePRD(options, streamingOptions);

    if (!options.stream) {
      console.log(chalk.green(`✓ Parsed PRD successfully`));
    }

    console.log(chalk.cyan(`Summary: ${result.summary}`));
    console.log(chalk.cyan(`Estimated Duration: ${result.estimatedDuration}`));
    console.log(chalk.cyan(`Confidence: ${(result.confidence * 100).toFixed(1)}%`));
    console.log('');

    console.log(chalk.blue(`Creating ${result.tasks.length} tasks...`));
    console.log(chalk.green(`✓ Created ${result.tasks.length} tasks from PRD`));

    // Show created tasks
    console.log(chalk.blue("\nCreated tasks:"));
    result.tasks.forEach((task, index) => {
      console.log(`${index + 1}. ${chalk.bold(task.title)}`);
      if (task.description) {
        console.log(chalk.gray(`   ${task.description.substring(0, 100)}...`));
      }
      console.log(chalk.cyan(`   Effort: ${task.estimatedEffort}`));
      console.log('');
    });
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
    console.log(chalk.blue("🤖 Reworking PRD with AI..."));

    // Set up streaming options if stream flag is enabled
    const streamingOptions = createStreamingOptions(options.stream, 'Rework');

    try {
      const outputPath = await reworkPRD(options, streamingOptions);

      if (!options.stream) {
        console.log(chalk.green(`✓ PRD improved and saved to ${outputPath}`));
      }

      console.log(chalk.cyan(`Feedback applied: ${options.feedback}`));
    } catch (error) {
      console.error(chalk.red("❌ Rework error:"));
      console.error(chalk.red(error instanceof Error ? error.message : String(error)));
      if (error instanceof Error && error.stack) {
        console.error(chalk.gray(error.stack));
      }
      process.exit(1);
    }
  });
