import { readFileSync, existsSync, copyFileSync } from "fs";
import { join, basename, relative } from "path";
import { getAIOperations, getStorage } from "../utils/ai-service-factory";
import { AIConfig, PRDParseResult, StreamingOptions } from "../types";
import { ParsePrdOptions, ReworkPrdOptions } from "../types/options";
import { configManager } from "./config";
import { isValidAIProvider } from "./validation";
import * as fs from "fs";

export async function parsePRD(
  options: ParsePrdOptions,
  streamingOptions?: StreamingOptions,
): Promise<PRDParseResult> {
  if (!existsSync(options.file)) {
    throw new Error(`PRD file not found: ${options.file}`);
  }

  // Ensure we're in a task-o-matic project before trying to create tasks
  const taskOMaticDir = configManager.getTaskOMaticDir();
  if (!existsSync(taskOMaticDir)) {
    throw new Error(
      `Not a task-o-matic project. Run 'task-o-matic init init' first.`,
    );
  }

  // Set working directory to current directory to ensure LocalStorage can find the project
  configManager.setWorkingDirectory(process.cwd());

  const prdContent = readFileSync(options.file, "utf-8");

  // Save PRD file to .task-o-matic/prd directory and get relative path
  const prdDir = join(taskOMaticDir, "prd");
  const prdFileName = basename(options.file);
  const savedPrdPath = join(prdDir, prdFileName);

  // Ensure PRD directory exists
  if (!existsSync(prdDir)) {
    fs.mkdirSync(prdDir, { recursive: true });
  }

  // Copy PRD file to project directory
  copyFileSync(options.file, savedPrdPath);

  // Get relative path from .task-o-matic directory for storage
  const relativePrdPath = relative(taskOMaticDir, savedPrdPath);

  const aiProvider = options.aiProvider;
  if (aiProvider && !isValidAIProvider(aiProvider)) {
    throw new Error(`Invalid AI provider: ${aiProvider}`);
  }

  const aiConfig: Partial<AIConfig> = {
    ...(aiProvider && {
      provider: aiProvider as "openrouter" | "openai" | "anthropic" | "custom",
    }),
    ...(options.aiModel && { model: options.aiModel }),
    ...(options.aiKey && { apiKey: options.aiKey }),
    ...(options.aiProviderUrl && { baseURL: options.aiProviderUrl }),
    ...(options.aiReasoning && {
      reasoning: { maxTokens: parseInt(options.aiReasoning, 10) },
    }),
  };

  const result = await getAIOperations().parsePRD(
    prdContent,
    aiConfig,
    options.prompt,
    options.message,
    streamingOptions,
  );

  for (const task of result.tasks) {
    const createdTask = await getStorage().createTask({
      id: task.id, // Preserve AI-generated ID for dependencies
      title: task.title,
      description: task.description,
      content: task.content,
      estimatedEffort: task.estimatedEffort,
      status: "todo",
      dependencies: task.dependencies,
      tags: task.tags,
      prdFile: relativePrdPath, // Reference to the PRD file
    });

    // Update AI metadata with the actual task ID
    const aiMetadata = {
      taskId: createdTask.id,
      aiGenerated: true,
      aiPrompt: options.prompt,
      confidence: result.confidence,
      aiProvider: options.aiProvider,
      aiModel: options.aiModel,
      generatedAt: Date.now(),
    };

    await getStorage().saveTaskAIMetadata(aiMetadata);
  }

  return result;
}

export async function reworkPRD(
  options: ReworkPrdOptions,
  streamingOptions?: StreamingOptions,
): Promise<string> {
  if (!existsSync(options.file)) {
    throw new Error(`PRD file not found: ${options.file}`);
  }

  const prdContent = readFileSync(options.file, "utf-8");

  const aiProvider = options.aiProvider;
  if (aiProvider && !isValidAIProvider(aiProvider)) {
    throw new Error(`Invalid AI provider: ${aiProvider}`);
  }

  const aiConfig: Partial<AIConfig> = {
    ...(aiProvider && {
      provider: aiProvider as "openrouter" | "openai" | "anthropic" | "custom",
    }),
    ...(options.aiModel && { model: options.aiModel }),
    ...(options.aiKey && { apiKey: options.aiKey }),
    ...(options.aiProviderUrl && { baseURL: options.aiProviderUrl }),
    ...(options.aiReasoning && {
      reasoning: { maxTokens: parseInt(options.aiReasoning, 10) },
    }),
  };

  const improvedPRD = await getAIOperations().reworkPRD(
    prdContent,
    options.feedback,
    aiConfig,
    options.prompt,
    options.message,
    streamingOptions,
  );

  const outputPath = options.output || options.file;
  fs.writeFileSync(outputPath, improvedPRD);

  return outputPath;
}
