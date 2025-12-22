#!/usr/bin/env node

import { Command } from "commander";
import chalk from "chalk";
import inquirer from "inquirer";
import {
  readFileSync,
  writeFileSync,
  existsSync,
  mkdirSync,
  unlinkSync,
} from "fs";
import { prdService } from "../services/prd";
import { createStreamingOptions } from "../utils/streaming-options";
import { displayProgress, displayError } from "../cli/display/progress";
import { taskService } from "../services/tasks";
import { join } from "path";
import { runAIParallel, combinePRDs } from "./utils/ai-parallel";
import { Task } from "../types";

export const prdCommand = new Command("prd").description(
  "Manage PRDs and generate tasks"
);

import {
  createStandardError,
  TaskOMaticErrorCodes,
} from "../utils/task-o-matic-error";
import { isValidAIProvider } from "../lib/validation";
import { configManager } from "../lib/config";
import path from "path";

// Helper to parse model string ([provider:]model[;reasoning[=budget]])
export function parseModelString(modelStr: string): {
  provider?: string;
  model: string;
  reasoning?: string;
} {
  let processingStr = modelStr;
  let reasoning: string | undefined;

  // 1. Extract reasoning
  // Format: ;reasoning or ;reasoning=1000
  const reasoningMatch = processingStr.match(/;reasoning(?:=(\d+))?$/);
  if (reasoningMatch) {
    // If specific budget provided (group 1), use it.
    // Otherwise default to "2000" as requested.
    reasoning = reasoningMatch[1] ? reasoningMatch[1] : "2000";

    // Remove the reasoning suffix from the string
    processingStr = processingStr.substring(0, reasoningMatch.index);
  }

  // 2. Extract provider and model
  // We look for the first colon.
  const firstColonIndex = processingStr.indexOf(":");

  if (firstColonIndex === -1) {
    // No colon -> It's just a model name (provider inferred from env/defaults later)
    return {
      provider: undefined,
      model: processingStr,
      reasoning,
    };
  }

  // Has colon. Check if the part before is a valid provider.
  const potentialProvider = processingStr.substring(0, firstColonIndex);
  const potentialModel = processingStr.substring(firstColonIndex + 1);

  if (isValidAIProvider(potentialProvider)) {
    // It is a known provider
    return {
      provider: potentialProvider,
      model: potentialModel,
      reasoning,
    };
  }

  // Not a known provider. Treat the whole thing as the model name.
  // This handles cases like "google/gemini...:free" where "google/gemini..." isn't a provider key.
  // Or just "model:with:colons".
  return {
    provider: undefined,
    model: processingStr,
    reasoning,
  };
}

// Create PRD command
prdCommand
  .command("create")
  .description("Generate PRD(s) from a product description")
  .argument("<description>", "Product description")
  .option(
    "--ai <models...>",
    "AI model(s) to use. Format: [provider:]model[;reasoning[=budget]]. Example: openrouter:openai/gpt-5;reasoning=2000"
  )
  .option(
    "--combine-ai <provider:model>",
    "AI model to combine multiple PRDs into master PRD"
  )
  .option("--output-dir <path>", "Directory to save PRDs", ".task-o-matic/prd")
  .option(
    "--ai-reasoning <tokens>",
    "Enable reasoning for OpenRouter models (max reasoning tokens)"
  )
  .option("--stream", "Enable streaming output (only for single AI)")
  .action(async (description, options) => {
    try {
      // Load configuration to get defaults
      await configManager.load();
      const aiConfig = configManager.getAIConfig();
      let defaultModelStr = `${aiConfig.provider}:${aiConfig.model}`;

      // Handle default reasoning configuration
      if (aiConfig.reasoning) {
        defaultModelStr += ";reasoning";
        if (aiConfig.reasoning.maxTokens) {
          defaultModelStr += `=${aiConfig.reasoning.maxTokens}`;
        }
      }

      const cliModels = Array.isArray(options.ai)
        ? options.ai
        : options.ai
        ? [options.ai]
        : [];

      // If CLI models provided, append them to default. If not, just use default.
      // Logic: Default is ALWAYS included unless explicitly disabled (feature for later?)
      // Current requirement: "I WANT BOTH"
      const aiModels = [...new Set([defaultModelStr, ...cliModels])];

      const isSingleModel = aiModels.length === 1;

      // For single model, support streaming
      if (isSingleModel && !options.combineAi) {
        const modelConfig = parseModelString(aiModels[0]);
        const streamingOptions = createStreamingOptions(
          options.stream,
          "Generating PRD"
        );

        const result = await prdService.generatePRD({
          description,
          outputDir: options.outputDir,
          filename: `prd-${
            modelConfig.provider ? `${modelConfig.provider}-` : ""
          }${modelConfig.model.replace(/[:/]/g, "-")}.md`,
          aiOptions: {
            aiProvider: modelConfig.provider,
            aiModel: modelConfig.model,
            // CLI flag overrides model string config
            aiReasoning: options.aiReasoning || modelConfig.reasoning,
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
        // Multiple models or combine request - use parallel utility
        const results = await runAIParallel(
          aiModels,
          async (modelConfig, streamingOptions) => {
            const result = await prdService.generatePRD({
              description,
              outputDir: options.outputDir,
              filename: `prd-${
                modelConfig.provider ? `${modelConfig.provider}-` : ""
              }${modelConfig.model.replace(/[:/]/g, "-")}.md`,
              aiOptions: {
                aiProvider: modelConfig.provider,
                aiModel: modelConfig.model,
                aiReasoning: options.aiReasoning || modelConfig.reasoning,
              },
              streamingOptions,
              callbacks: {
                onProgress: (event) => {
                  /* handled by parallel util mostly, but could hook here */
                },
              },
            });
            // Wrap in expected structure
            return {
              data: result,
              stats: result.stats,
            };
          },
          {
            description: "Generating PRDs",
            showSummary: true,
          }
        );

        // Combine if requested
        if (options.combineAi) {
          const prdContents = results.map((r) => r.data.content);

          // Helper to get reasoning from combine string if present
          const combineModelConfig = parseModelString(options.combineAi);
          const reasoning = options.aiReasoning || combineModelConfig.reasoning;

          const masterPath = await combinePRDs(
            prdContents,
            description,
            options.combineAi,
            options.stream,
            reasoning
          );

          // Need to manually save since combinePRDs utility returns content string or path?
          // Wait, the utility I wrote returns string (content).
          // Actually, let's correct the utility usage or the utility itself.
          // Looking at the utility: it calls `aiOperations.combinePRDs` which returns string (content).
          // But `prdService.combinePRDs` (old code) saved the file.
          // I should probably use `prdService.combinePRDs` INSIDE the utility or here?
          // The utility uses `aiOperations`. So I get content back. I need to save it.
          const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
          const filename = "prd-master.md"; // Force master name or unique? Default to prd-master.md as per old code.
          const savePath = path.join(options.outputDir, filename);

          // Ensure dir exists
          if (!existsSync(options.outputDir)) {
            mkdirSync(options.outputDir, { recursive: true });
          }
          writeFileSync(savePath, masterPath); // masterPath is actually content here based on my utility return type

          console.log(chalk.green(`\n✓ Master PRD created: ${savePath}`));
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
  .option(
    "--ai-reasoning <tokens>",
    "Enable reasoning for OpenRouter models (max reasoning tokens)"
  )
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
          aiReasoning: options.aiReasoning || modelConfig.reasoning,
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
  .option(
    "--ai <models...>",
    "AI model(s) to use. Format: [provider:]model[;reasoning[=budget]]"
  )
  .option(
    "--combine-ai <provider:model>",
    "AI model to combine multiple parsed results"
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
  .option("--stream", "Show streaming AI output during parsing")
  .option("--tools", "Enable filesystem tools for project analysis")
  .action(async (options) => {
    try {
      // Determine working directory from current process location
      // Service layer should receive this explicitly, not use process.cwd()
      const workingDirectory = process.cwd();

      // Support multi-model if array of models provided in options.ai (added to command option below)
      const cliModels = Array.isArray(options.ai)
        ? options.ai
        : options.ai
        ? [options.ai]
        : [];

      // If just single model or no model specified (uses service default), use old flow OR simple parallel entry
      // But wait, the parse command options define --ai-provider, --ai-model separately in old code.
      // I need to update the command definition to support --ai like create/split.

      // Let's assume I updated the options in the definition (will do in next chunk).
      // If we have "ai" models list, we use parallel.

      if (cliModels.length > 0 || options.combineAi) {
        // Parallel execution

        const modelsToUse =
          cliModels.length > 0
            ? cliModels
            : [`${options.aiProvider}:${options.aiModel}`];

        const results = await runAIParallel(
          modelsToUse,
          async (modelConfig, streamingOptions) => {
            const result = await prdService.parsePRD({
              file: options.file,
              workingDirectory,
              enableFilesystemTools: options.tools,
              aiOptions: {
                aiProvider: modelConfig.provider,
                aiModel: modelConfig.model,
                aiReasoning: options.aiReasoning || modelConfig.reasoning,
              },
              promptOverride: options.prompt,
              messageOverride: options.message,
              streamingOptions,
              callbacks: {
                onProgress: (event) => {},
              },
            });

            // Save intermediate result
            const safeModel = (modelConfig.model || "")
              .replace(/[^a-z0-9]/gi, "-")
              .toLowerCase();
            const filename = `tasks-${modelConfig.provider}-${safeModel}.json`;
            const tasksDir = path.join(process.cwd(), ".task-o-matic", "tasks");

            if (!existsSync(tasksDir)) {
              mkdirSync(tasksDir, { recursive: true });
            }

            const outputPath = path.join(tasksDir, filename);

            try {
              writeFileSync(outputPath, JSON.stringify(result.tasks, null, 2));
              // console.log(chalk.dim(`   Saved: ${filename}`)); // Too verbose for parallel output?
            } catch (e) {
              // ignore write error
            }

            return {
              data: result,
              stats: result.stats,
            };
          },
          {
            description: "Parsing PRD",
            showSummary: true,
          }
        );

        // Phase 2: Cleanup intermediate tasks.json to prevent duplicates
        const tasksJsonPath = join(
          workingDirectory,
          ".task-o-matic",
          "tasks.json"
        );
        if (existsSync(tasksJsonPath)) {
          try {
            unlinkSync(tasksJsonPath);
            // console.log(chalk.dim("Cleaned up intermediate tasks.json"));
          } catch (e) {
            console.warn(chalk.yellow("Warning: Failed to cleanup tasks.json"));
          }
        }

        if (options.combineAi && results.length > 0) {
          const taskLists = results.map((r) => r.data.tasks);
          const combineModelConfig = parseModelString(options.combineAi);

          console.log(
            chalk.blue(
              `\nCombining ${taskLists.length} task lists with ${combineModelConfig.model}...`
            )
          );

          // Construct the message with drafts
          let draftsMessage =
            "Here are draft task lists generated by multiple models. Please combine them into the best possible single list ensuring strict schema compliance:\n\n";

          results.forEach((r, idx) => {
            // Try to identify model from earlier scope or just use index
            // We can reconstruct model string or just label "Model N"
            draftsMessage += `--- Model ${idx + 1} Draft ---\n${JSON.stringify(
              r.data.tasks,
              null,
              2
            )}\n\n`;
          });

          // Phase 3: Service-Based Combination
          // Calls prdService.parsePRD which will validate AND save the final tasks to the clean tasks.json
          const result = await prdService.parsePRD({
            file: options.file,
            workingDirectory,
            enableFilesystemTools: options.tools,
            aiOptions: {
              aiProvider: combineModelConfig.provider,
              aiModel: combineModelConfig.model,
              aiReasoning: options.aiReasoning || combineModelConfig.reasoning,
            },
            promptOverride: options.prompt, // Pass original prompt if any
            messageOverride: draftsMessage, // Inject drafts
            streamingOptions: createStreamingOptions(
              options.stream,
              "Combining"
            ),
            callbacks: {
              onProgress: displayProgress,
              onError: displayError,
            },
          });

          console.log(
            chalk.green(`\n✓ Combined and saved ${result.tasks.length} tasks.`)
          );
        } else if (results.length > 0) {
          // No combine requested, but we deleted tasks.json.
          // We use the service to save the "best" (first) result to ensure IDs and dependencies are preserved.
          // We do this by feeding the tasks back to the service as a "draft" to strictly follow.
          const bestResult = results[0].data;
          console.log(
            chalk.yellow(
              "\n⚠️  Multiple models used without --combine-ai. Saving result from first model."
            )
          );

          const draftsMessage = `Here is the pre-generated task list. Please validate and save it exactly as is, preserving all IDs and dependencies:\n\n${JSON.stringify(
            bestResult.tasks,
            null,
            2
          )}`;

          await prdService.parsePRD({
            file: options.file,
            workingDirectory,
            enableFilesystemTools: options.tools,
            aiOptions: {
              aiProvider: options.aiProvider, // Use default or overridden local options
              aiModel: options.aiModel,
              aiReasoning: options.aiReasoning,
            },
            promptOverride: options.prompt,
            messageOverride: draftsMessage,
            streamingOptions: createStreamingOptions(options.stream, "Saving"),
            callbacks: {
              onProgress: displayProgress,
              onError: displayError,
            },
          });

          console.log(chalk.green(`✓ Saved ${bestResult.tasks.length} tasks.`));
        }
      } else {
        // Fallback to original single flow
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
        console.log(
          chalk.cyan(`  Tasks created: ${result.stats.tasksCreated}`)
        );
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
      }
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
      writeFileSync(outputPath, JSON.stringify({ questions }, null, 2));

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

      let questions: string[] = [];

      // If questions file provided, load it
      if (options.questions && existsSync(options.questions)) {
        console.log(
          chalk.blue(`Loading questions from ${options.questions}...`)
        );
        const content = readFileSync(options.questions, "utf-8");
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
