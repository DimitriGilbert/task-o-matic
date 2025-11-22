#!/usr/bin/env node

import { Command } from "commander";
import chalk from "chalk";
import inquirer from "inquirer";
import { readFileSync } from "fs";
import { prdService } from "../services/prd";
import { createStreamingOptions } from "../utils/streaming-options";
import { displayProgress, displayError } from "../cli/display/progress";

export const prdCommand = new Command("prd").description(
  "Manage PRDs and generate tasks"
);

// Helper to parse model string (provider:model)
function parseModelString(modelStr: string): {
  provider: string;
  model: string;
} {
  const parts = modelStr.split(":");
  if (parts.length < 2) {
    throw new Error(
      `Invalid model format: ${modelStr}. Expected provider:model`
    );
  }
  return { provider: parts[0], model: parts[1] };
}

// Create PRD command
prdCommand
  .command("create")
  .description("Generate PRD(s) from a product description")
  .argument("<description>", "Product description")
  .option(
    "--ai <provider:model...>",
    "AI model(s) to use for generation (can specify multiple)"
  )
  .option(
    "--combine-ai <provider:model>",
    "AI model to combine multiple PRDs into master PRD"
  )
  .option("--output-dir <path>", "Directory to save PRDs", ".task-o-matic/prd")
  .option("--stream", "Enable streaming output (only for single AI)")
  .action(async (description, options) => {
    try {
      const aiModels = options.ai || ["openrouter:anthropic/claude-3.5-sonnet"];
      const isSingleModel = aiModels.length === 1;

      // For single model, support streaming
      if (isSingleModel) {
        const modelConfig = parseModelString(aiModels[0]);
        const streamingOptions = createStreamingOptions(
          options.stream,
          "Generating PRD"
        );

        const result = await prdService.generatePRD({
          description,
          outputDir: options.outputDir,
          filename: `prd-${modelConfig.provider}-${modelConfig.model.replace(
            /\//g,
            "-"
          )}.md`,
          aiOptions: {
            aiProvider: modelConfig.provider,
            aiModel: modelConfig.model,
          },
          streamingOptions,
          callbacks: {
            onProgress: displayProgress,
            onError: displayError,
          },
        });

        console.log("");
        console.log(chalk.green(`✓ PRD generated: ${result.path}`));
        console.log(chalk.cyan(`  Duration: ${result.stats.duration}ms`));
        if (result.stats.tokenUsage) {
          console.log(chalk.cyan(`  Tokens: ${result.stats.tokenUsage.total}`));
        }
        if (result.stats.timeToFirstToken) {
          console.log(chalk.cyan(`  TTFT: ${result.stats.timeToFirstToken}ms`));
        }
      } else {
        // Multiple models - use benchmark-style display
        console.log(
          chalk.blue(`\nGenerating ${aiModels.length} PRDs concurrently...\n`)
        );

        const modelMap = new Map<string, number>();
        const modelStatus = new Map<string, string>();
        const results: Array<{
          modelId: string;
          path: string;
          stats: any;
        }> = [];

        // Print initial lines
        aiModels.forEach((m: string, i: number) => {
          modelMap.set(m, i);
          modelStatus.set(m, "Waiting...");
          console.log(chalk.dim(`- ${m}: Waiting...`));
        });
        const totalModels = aiModels.length;

        // Generate PRDs concurrently
        const promises = aiModels.map(async (modelStr: string) => {
          const modelConfig = parseModelString(modelStr);
          const index = modelMap.get(modelStr)!;

          // Update status: Starting
          const up = totalModels - index;
          process.stdout.write(`\x1B[${up}A`);
          process.stdout.write(`\x1B[2K`);
          process.stdout.write(
            `- ${chalk.bold(modelStr)}: ${chalk.yellow("Starting...")}\r`
          );
          process.stdout.write(`\x1B[${up}B`);

          try {
            const result = await prdService.generatePRD({
              description,
              outputDir: options.outputDir,
              filename: `prd-${
                modelConfig.provider
              }-${modelConfig.model.replace(/\//g, "-")}.md`,
              aiOptions: {
                aiProvider: modelConfig.provider,
                aiModel: modelConfig.model,
              },
              callbacks: {
                onProgress: (event) => {
                  if (event.type === "progress") {
                    const up = totalModels - index;
                    process.stdout.write(`\x1B[${up}A`);
                    process.stdout.write(`\x1B[2K`);
                    process.stdout.write(
                      `- ${chalk.bold(modelStr)}: ${chalk.blue(
                        event.message
                      )}\r`
                    );
                    process.stdout.write(`\x1B[${up}B`);
                  }
                },
              },
            });

            // Update status: Completed
            const up2 = totalModels - index;
            process.stdout.write(`\x1B[${up2}A`);
            process.stdout.write(`\x1B[2K`);
            process.stdout.write(
              `- ${chalk.bold(modelStr)}: ${chalk.green(
                `Completed (${result.stats.duration}ms)`
              )}\r`
            );
            process.stdout.write(`\x1B[${up2}B`);

            results.push({
              modelId: modelStr,
              path: result.path,
              stats: result.stats,
            });

            return result;
          } catch (error) {
            const up2 = totalModels - index;
            process.stdout.write(`\x1B[${up2}A`);
            process.stdout.write(`\x1B[2K`);
            process.stdout.write(
              `- ${chalk.bold(modelStr)}: ${chalk.red(
                `Failed: ${
                  error instanceof Error ? error.message : String(error)
                }`
              )}\r`
            );
            process.stdout.write(`\x1B[${up2}B`);
            throw error;
          }
        });

        await Promise.all(promises);

        // Display summary
        console.log(chalk.green(`\n✓ Generated ${results.length} PRDs\n`));
        console.log(
          chalk.bold(
            `${"Model".padEnd(40)} | ${"Duration".padEnd(10)} | ${"TTFT".padEnd(
              10
            )} | ${"Tokens".padEnd(10)}`
          )
        );
        console.log("-".repeat(80));

        results.forEach((r) => {
          const duration = `${r.stats.duration}ms`;
          const ttft = r.stats.timeToFirstToken
            ? `${r.stats.timeToFirstToken}ms`
            : "N/A";
          const tokens = r.stats.tokenUsage
            ? r.stats.tokenUsage.total.toString()
            : "N/A";

          console.log(
            `${r.modelId.padEnd(40)} | ${duration.padEnd(10)} | ${ttft.padEnd(
              10
            )} | ${tokens.padEnd(10)}`
          );
        });

        // Combine if requested
        if (options.combineAi) {
          console.log(chalk.blue("\nCombining PRDs into master PRD..."));

          const combineModelConfig = parseModelString(options.combineAi);
          const prdContents = results.map((r) => readFileSync(r.path, "utf-8"));

          const masterResult = await prdService.combinePRDs({
            prds: prdContents,
            originalDescription: description,
            outputDir: options.outputDir,
            filename: "prd-master.md",
            aiOptions: {
              aiProvider: combineModelConfig.provider,
              aiModel: combineModelConfig.model,
            },
            callbacks: {
              onProgress: displayProgress,
              onError: displayError,
            },
          });

          console.log(
            chalk.green(`\n✓ Master PRD created: ${masterResult.path}`)
          );
          console.log(
            chalk.cyan(`  Duration: ${masterResult.stats.duration}ms`)
          );
        }
      }
    } catch (error) {
      displayError(error);
      process.exit(1);
    }
  });

// Combine PRDs command
prdCommand
  .command("combine")
  .description("Combine multiple PRD files into a master PRD")
  .requiredOption("--files <paths...>", "PRD files to combine")
  .requiredOption("--description <text>", "Original product description")
  .requiredOption("--ai <provider:model>", "AI model to use for combining")
  .option("--output <path>", "Output file path", "prd-master.md")
  .option("--stream", "Enable streaming output")
  .action(async (options) => {
    try {
      const modelConfig = parseModelString(options.ai);
      const streamingOptions = createStreamingOptions(
        options.stream,
        "Combining PRDs"
      );

      // Read all PRD files
      const prdContents = options.files.map((file: string) =>
        readFileSync(file, "utf-8")
      );

      const result = await prdService.combinePRDs({
        prds: prdContents,
        originalDescription: options.description,
        filename: options.output,
        aiOptions: {
          aiProvider: modelConfig.provider,
          aiModel: modelConfig.model,
        },
        streamingOptions,
        callbacks: {
          onProgress: displayProgress,
          onError: displayError,
        },
      });

      console.log("");
      console.log(chalk.green(`✓ Master PRD created: ${result.path}`));
      console.log(chalk.cyan(`  Duration: ${result.stats.duration}ms`));
      if (result.stats.tokenUsage) {
        console.log(chalk.cyan(`  Tokens: ${result.stats.tokenUsage.total}`));
      }
    } catch (error) {
      displayError(error);
      process.exit(1);
    }
  });

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
  .option(
    "--ai-reasoning <tokens>",
    "Enable reasoning for OpenRouter models (max reasoning tokens)"
  )
  .option("--stream", "Show streaming AI output during parsing")
  .option("--tools", "Enable filesystem tools for project analysis")
  .action(async (options) => {
    try {
      // Determine working directory from current process location
      // Service layer should receive this explicitly, not use process.cwd()
      const workingDirectory = process.cwd();

      const streamingOptions = createStreamingOptions(
        options.stream,
        "Parsing"
      );

      const result = await prdService.parsePRD({
        file: options.file,
        workingDirectory, // Pass working directory explicitly to service
        enableFilesystemTools: options.tools,
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

      console.log("");
      console.log(chalk.blue(`📊 PRD Parsing Summary:`));
      console.log(chalk.cyan(`  Tasks created: ${result.stats.tasksCreated}`));
      console.log(chalk.cyan(`  Duration: ${result.stats.duration}ms`));
      console.log(chalk.cyan(`  AI Model: ${result.stats.aiModel}`));

      console.log(chalk.blue("\n📋 Processing Steps:"));
      result.steps.forEach((step) => {
        const icon = step.status === "completed" ? "✓" : "✗";
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
          console.log(
            chalk.gray(
              `   ${task.description.substring(0, 100)}${
                task.description.length > 100 ? "..." : ""
              }`
            )
          );
        }
        if (task.estimatedEffort) {
          console.log(chalk.cyan(`   Effort: ${task.estimatedEffort}`));
        }
        console.log("");
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
  .option(
    "--ai-reasoning <tokens>",
    "Enable reasoning for OpenRouter models (max reasoning tokens)"
  )
  .option("--stream", "Show streaming AI output during rework")
  .option("--tools", "Enable filesystem tools for project analysis")
  .action(async (options) => {
    try {
      // Determine working directory from current process location
      // Service layer should receive this explicitly, not use process.cwd()
      const workingDirectory = process.cwd();

      const streamingOptions = createStreamingOptions(options.stream, "Rework");

      const outputPath = await prdService.reworkPRD({
        file: options.file,
        feedback: options.feedback,
        output: options.output,
        workingDirectory, // Pass working directory explicitly to service
        enableFilesystemTools: options.tools,
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

      console.log("");
      console.log(chalk.green(`✓ PRD improved and saved to ${outputPath}`));
      console.log(chalk.cyan(`Feedback applied: ${options.feedback}`));
    } catch (error) {
      displayError(error);
      process.exit(1);
    }
  });

// Generate questions for PRD
prdCommand
  .command("question")
  .description("Generate clarifying questions for a PRD")
  .requiredOption("--file <path>", "Path to PRD file")
  .option(
    "--output <path>",
    "Output JSON file path (default: prd-questions.json)"
  )
  .option("--prompt <prompt>", "Override prompt")
  .option("--message <message>", "User message")
  .option("--ai-provider <provider>", "AI provider override")
  .option("--ai-model <model>", "AI model override")
  .option("--ai-key <key>", "AI API key override")
  .option("--ai-provider-url <url>", "AI provider URL override")
  .option(
    "--ai-reasoning <tokens>",
    "Enable reasoning for OpenRouter models (max reasoning tokens)"
  )
  .option("--stream", "Show streaming AI output")
  .option("--tools", "Enable filesystem tools for project analysis")
  .action(async (options) => {
    try {
      const workingDirectory = process.cwd();
      const streamingOptions = createStreamingOptions(
        options.stream,
        "Questioning"
      );

      const questions = await prdService.generateQuestions({
        file: options.file,
        workingDirectory,
        enableFilesystemTools: options.tools,
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

      const outputPath = options.output || "prd-questions.json";
      const fs = await import("fs");
      fs.writeFileSync(outputPath, JSON.stringify({ questions }, null, 2));

      console.log("");
      console.log(chalk.green(`✓ Generated ${questions.length} questions`));
      console.log(chalk.cyan(`Saved to: ${outputPath}`));

      console.log(chalk.blue("\nQuestions:"));
      questions.forEach((q, i) => {
        console.log(`${i + 1}. ${q}`);
      });
    } catch (error) {
      displayError(error);
      process.exit(1);
    }
  });

// Refine PRD with questions
prdCommand
  .command("refine")
  .description("Refine PRD by answering clarifying questions")
  .requiredOption("--file <path>", "Path to PRD file")
  .option(
    "--questions <path>",
    "Path to questions JSON file (optional, will generate if missing)"
  )
  .option("--output <path>", "Output file path (default: overwrite original)")
  .option("--prompt <prompt>", "Override prompt")
  .option("--message <message>", "User message")
  .option("--ai-provider <provider>", "AI provider override")
  .option("--ai-model <model>", "AI model override")
  .option("--ai-key <key>", "AI API key override")
  .option("--ai-provider-url <url>", "AI provider URL override")
  .option(
    "--ai-reasoning <tokens>",
    "Enable reasoning for OpenRouter models (max reasoning tokens)"
  )
  .option("--stream", "Show streaming AI output")
  .option("--tools", "Enable filesystem tools for project analysis")
  .action(async (options) => {
    try {
      const workingDirectory = process.cwd();
      const fs = await import("fs");

      let questions: string[] = [];

      // If questions file provided, load it
      if (options.questions && fs.existsSync(options.questions)) {
        console.log(
          chalk.blue(`Loading questions from ${options.questions}...`)
        );
        const content = fs.readFileSync(options.questions, "utf-8");
        const data = JSON.parse(content);
        questions = data.questions || [];
      }

      // If no questions loaded, generate them
      if (questions.length === 0) {
        console.log(chalk.blue("Generating clarifying questions..."));
        const streamingOptions = createStreamingOptions(
          options.stream,
          "Questioning"
        );

        questions = await prdService.generateQuestions({
          file: options.file,
          workingDirectory,
          enableFilesystemTools: options.tools,
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
      }

      if (questions.length === 0) {
        console.log(
          chalk.yellow("No questions generated. PRD might be clear enough.")
        );
        return;
      }

      console.log(
        chalk.blue(
          `\nPlease answer the following ${questions.length} questions to refine the PRD:\n`
        )
      );

      const answers: Record<string, string> = {};

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

      // Format feedback
      let feedback =
        "Please incorporate the following clarifications into the PRD:\n\n";
      Object.entries(answers).forEach(([q, a], i) => {
        feedback += `Q${i + 1}: ${q}\nA: ${a}\n\n`;
      });

      console.log(chalk.blue("\nReworking PRD with your answers..."));

      const streamingOptions = createStreamingOptions(
        options.stream,
        "Refining"
      );

      const outputPath = await prdService.reworkPRD({
        file: options.file,
        feedback,
        output: options.output,
        workingDirectory,
        enableFilesystemTools: options.tools,
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

      console.log("");
      console.log(chalk.green(`✓ PRD refined and saved to ${outputPath}`));
    } catch (error) {
      displayError(error);
      process.exit(1);
    }
  });
