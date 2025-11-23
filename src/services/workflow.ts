import { existsSync, writeFileSync, mkdirSync, readFileSync } from "fs";
import { join, resolve } from "path";
import { configManager } from "../lib/config";
import { runBetterTStackCLI } from "../lib/better-t-stack-cli";
import { prdService } from "./prd";
import { taskService } from "./tasks";
import { workflowAIAssistant } from "./workflow-ai-assistant";
import { AIOptions } from "../utils/ai-config-builder";
import { StreamingOptions, Task } from "../types";
import { ProgressCallback } from "../types/callbacks";
import {
  InitializeResult,
  DefinePRDResult,
  RefinePRDResult,
  GenerateTasksResult,
  SplitTasksResult,
} from "../types/workflow-results";

/**
 * WorkflowService - Business logic for workflow operations
 * Extracts all workflow logic from the command layer for reusability
 */
export class WorkflowService {
  /**
   * Step 1: Initialize Project
   * Handles project initialization, AI configuration, and optional bootstrapping
   */
  async initializeProject(input: {
    projectName: string;
    projectDir?: string; // Optional, defaults to projectName in cwd
    initMethod?: "quick" | "custom" | "ai";
    projectDescription?: string;
    aiOptions?: AIOptions;
    stackConfig?: {
      frontend?: string;
      backend?: string;
      database?: string;
      auth?: boolean;
    };
    bootstrap?: boolean;
    includeDocs?: boolean;
    streamingOptions?: StreamingOptions;
    callbacks?: ProgressCallback;
  }): Promise<InitializeResult> {
    input.callbacks?.onProgress?.({
      type: "started",
      message: "Initializing project...",
    });

    // Determine project directory
    const projectDir =
      input.projectDir || resolve(process.cwd(), input.projectName);

    // Create project directory
    if (!existsSync(projectDir)) {
      mkdirSync(projectDir, { recursive: true });
      input.callbacks?.onProgress?.({
        type: "progress",
        message: `Created directory: ${input.projectName}`,
      });
    }

    // Switch to project directory
    process.chdir(projectDir);
    configManager.setWorkingDirectory(projectDir);
    await configManager.load();

    // Initialize task-o-matic directory structure
    const taskOMaticDir = join(projectDir, ".task-o-matic");
    if (!existsSync(taskOMaticDir)) {
      mkdirSync(taskOMaticDir, { recursive: true });
      ["tasks", "prd", "logs"].forEach((dir) => {
        mkdirSync(join(taskOMaticDir, dir), { recursive: true });
      });
    }

    input.callbacks?.onProgress?.({
      type: "progress",
      message: "Configuring AI settings...",
    });

    // Get AI configuration
    const aiProvider = input.aiOptions?.aiProvider || "openrouter";
    const aiModel =
      input.aiOptions?.aiModel ||
      (aiProvider === "openrouter"
        ? "anthropic/claude-3.5-sonnet"
        : aiProvider === "anthropic"
        ? "claude-sonnet-4.5"
        : "gpt-4o");
    const apiKey = input.aiOptions?.aiKey || process.env.AI_API_KEY || "";

    // Save AI config to .env
    const envPath = join(projectDir, ".env");
    let envContent = existsSync(envPath) ? readFileSync(envPath, "utf-8") : "";

    if (!envContent.includes("AI_PROVIDER=")) {
      envContent += `AI_PROVIDER=${aiProvider}\n`;
    }
    if (!envContent.includes("AI_MODEL=")) {
      envContent += `AI_MODEL=${aiModel}\n`;
    }
    if (
      input.aiOptions?.aiProviderUrl &&
      !envContent.includes("AI_PROVIDER_URL=")
    ) {
      envContent += `AI_PROVIDER_URL=${input.aiOptions.aiProviderUrl}\n`;
    }

    const providerKeyName =
      aiProvider === "openai"
        ? "OPENAI_API_KEY"
        : aiProvider === "anthropic"
        ? "ANTHROPIC_API_KEY"
        : aiProvider === "openrouter"
        ? "OPENROUTER_API_KEY"
        : "AI_API_KEY";

    if (!envContent.includes(`${providerKeyName}=`)) {
      envContent += `${providerKeyName}=${apiKey}\n`;
    }

    writeFileSync(envPath, envContent);

    // Update process.env and ConfigManager
    process.env.AI_PROVIDER = aiProvider;
    process.env.AI_MODEL = aiModel;
    process.env[providerKeyName] = apiKey;
    if (input.aiOptions?.aiProviderUrl) {
      process.env.AI_PROVIDER_URL = input.aiOptions.aiProviderUrl;
    }

    configManager.setAIConfig({
      provider: aiProvider as any,
      model: aiModel,
      apiKey: apiKey,
      baseURL: input.aiOptions?.aiProviderUrl,
    });

    // Determine stack configuration
    let stackConfig: any = {
      projectName: input.projectName,
      aiProvider,
      aiModel,
    };

    if (input.initMethod === "ai" && input.projectDescription) {
      input.callbacks?.onProgress?.({
        type: "progress",
        message: "Getting AI recommendations for stack...",
      });

      stackConfig = await workflowAIAssistant.assistInitConfig({
        userDescription: input.projectDescription,
        aiOptions: input.aiOptions,
        streamingOptions: input.streamingOptions,
      });

      // Override with user's choices
      stackConfig.projectName = input.projectName;
      stackConfig.aiProvider = aiProvider;
      stackConfig.aiModel = aiModel;
    } else if (input.initMethod === "quick") {
      stackConfig = {
        ...stackConfig,
        frontend: "next",
        backend: "hono",
        database: "sqlite",
        auth: true,
        reasoning: "Modern, well-supported stack",
      };
    } else if (input.stackConfig) {
      stackConfig = { ...stackConfig, ...input.stackConfig };
    }

    // Bootstrap if requested
    let bootstrapped = false;
    if (input.bootstrap && (stackConfig.frontend || stackConfig.backend)) {
      input.callbacks?.onProgress?.({
        type: "progress",
        message: "Bootstrapping with Better-T-Stack...",
      });

      try {
        const result = await runBetterTStackCLI(
          {
            projectName: ".",
            frontend: stackConfig.frontend || "next",
            backend: stackConfig.backend || "hono",
            database: stackConfig.database || "sqlite",
            noAuth: !stackConfig.auth,
            orm: "drizzle",
            packageManager: "npm",
            runtime: "node",
            noInstall: false,
            noGit: false,
            includeDocs: input.includeDocs,
          },
          projectDir
        );

        if (result.success) {
          bootstrapped = true;

          // Fix config file naming
          const dotConfigPath = join(taskOMaticDir, ".-bts-config.json");
          const realConfigPath = join(
            taskOMaticDir,
            `${input.projectName}-bts-config.json`
          );
          const stackConfigPath = join(taskOMaticDir, "stack.json");

          if (existsSync(dotConfigPath)) {
            const configContent = JSON.parse(
              readFileSync(dotConfigPath, "utf-8")
            );
            configContent.projectName = input.projectName;

            const newContent = JSON.stringify(configContent, null, 2);
            writeFileSync(realConfigPath, newContent);
            writeFileSync(stackConfigPath, newContent);

            const { unlinkSync } = require("fs");
            unlinkSync(dotConfigPath);
          }
        }
      } catch (error) {
        input.callbacks?.onError?.(
          error instanceof Error ? error : new Error(String(error))
        );
      }
    }

    // Save configuration
    configManager.save();

    input.callbacks?.onProgress?.({
      type: "completed",
      message: "Project initialized successfully",
    });

    return {
      success: true,
      projectDir,
      projectName: input.projectName,
      aiConfig: {
        provider: aiProvider,
        model: aiModel,
        key: apiKey,
      },
      stackConfig,
      bootstrapped,
    };
  }

  /**
   * Step 2: Define PRD
   * Handles PRD creation through various methods
   */
  async definePRD(input: {
    method: "upload" | "manual" | "ai" | "skip";
    prdFile?: string;
    prdDescription?: string;
    prdContent?: string;
    projectDir: string;
    aiOptions?: AIOptions;
    streamingOptions?: StreamingOptions;
    callbacks?: ProgressCallback;
    // Multi-generation options
    multiGeneration?: boolean;
    multiGenerationModels?: Array<{ provider: string; model: string }>;
    combineAI?: { provider: string; model: string };
  }): Promise<DefinePRDResult> {
    const startTime = Date.now();
    let tokenUsage:
      | { prompt: number; completion: number; total: number }
      | undefined;
    let timeToFirstToken: number | undefined;
    let cost: number | undefined;

    input.callbacks?.onProgress?.({
      type: "started",
      message: "Defining PRD...",
    });

    const taskOMaticDir = join(input.projectDir, ".task-o-matic");
    const prdDir = join(taskOMaticDir, "prd");

    if (!existsSync(prdDir)) {
      mkdirSync(prdDir, { recursive: true });
    }

    if (input.method === "skip") {
      return {
        success: true,
        prdFile: "",
        prdContent: "",
        method: "skip",
        stats: {
          duration: Date.now() - startTime,
        },
      };
    }

    let prdContent = "";
    let prdFilename = "prd.md";

    if (input.method === "upload" && input.prdFile) {
      if (!existsSync(input.prdFile)) {
        throw new Error(`PRD file not found: ${input.prdFile}`);
      }
      prdContent = readFileSync(input.prdFile, "utf-8");
      prdFilename = input.prdFile.split("/").pop() || "prd.md";
    } else if (input.method === "manual" && input.prdContent) {
      prdContent = input.prdContent;
    } else if (input.method === "ai" && input.prdDescription) {
      // Check if multi-generation is requested
      if (
        input.multiGeneration &&
        input.multiGenerationModels &&
        input.multiGenerationModels.length > 1
      ) {
        // Multi-generation mode
        const results: Array<{
          path: string;
          content: string;
          stats: any;
          modelId: string;
        }> = [];

        input.callbacks?.onProgress?.({
          type: "progress",
          message: `Generating ${input.multiGenerationModels.length} PRDs concurrently...`,
        });

        // Generate PRDs concurrently
        const promises = input.multiGenerationModels.map(
          async (modelConfig, index) => {
            const modelId = `${modelConfig.provider}:${modelConfig.model}`;
            const result = await prdService.generatePRD({
              description: input.prdDescription!,
              outputDir: prdDir,
              filename: `prd-${
                modelConfig.provider
              }-${modelConfig.model.replace(/\//g, "-")}.md`,
              aiOptions: {
                aiProvider: modelConfig.provider,
                aiModel: modelConfig.model,
              },
              callbacks: {
                onProgress: (event) => {
                  // Only modify events that have a message property
                  if (
                    event.type !== "stream-chunk" &&
                    event.type !== "reasoning-chunk"
                  ) {
                    input.callbacks?.onProgress?.({
                      ...event,
                      message: `[${modelId}] ${event.message}`,
                    });
                  } else {
                    input.callbacks?.onProgress?.(event);
                  }
                },
              },
            });

            results.push({
              path: result.path,
              content: result.content,
              stats: result.stats,
              modelId,
            });

            return result;
          }
        );

        await Promise.all(promises);

        // Aggregate metrics
        tokenUsage = {
          prompt: results.reduce(
            (sum, r) => sum + (r.stats.tokenUsage?.prompt || 0),
            0
          ),
          completion: results.reduce(
            (sum, r) => sum + (r.stats.tokenUsage?.completion || 0),
            0
          ),
          total: results.reduce(
            (sum, r) => sum + (r.stats.tokenUsage?.total || 0),
            0
          ),
        };
        timeToFirstToken = Math.min(
          ...results
            .map((r) => r.stats.timeToFirstToken || Infinity)
            .filter((t) => t !== Infinity)
        );
        cost = results.reduce((sum, r) => sum + (r.stats.cost || 0), 0);

        // Combine if requested
        if (input.combineAI) {
          input.callbacks?.onProgress?.({
            type: "progress",
            message: "Combining PRDs into master PRD...",
          });

          const prdContents = results.map((r) => r.content);
          const masterResult = await prdService.combinePRDs({
            prds: prdContents,
            originalDescription: input.prdDescription!,
            outputDir: prdDir,
            filename: "prd-master.md",
            aiOptions: {
              aiProvider: input.combineAI.provider,
              aiModel: input.combineAI.model,
            },
            callbacks: input.callbacks,
          });

          prdContent = masterResult.content;
          prdFilename = "prd-master.md";

          // Add combination metrics
          if (masterResult.stats.tokenUsage) {
            tokenUsage.prompt += masterResult.stats.tokenUsage.prompt;
            tokenUsage.completion += masterResult.stats.tokenUsage.completion;
            tokenUsage.total += masterResult.stats.tokenUsage.total;
          }
          if (masterResult.stats.cost) {
            cost = (cost || 0) + masterResult.stats.cost;
          }
        } else {
          // Use the first generated PRD as the main one
          prdContent = results[0].content;
          prdFilename = `prd-${results[0].modelId
            .replace(/:/g, "-")
            .replace(/\//g, "-")}.md`;
        }
      } else {
        // Single generation mode
        const result = await prdService.generatePRD({
          description: input.prdDescription,
          outputDir: prdDir,
          filename: prdFilename,
          aiOptions: input.aiOptions,
          streamingOptions: input.streamingOptions,
          callbacks: input.callbacks,
        });

        prdContent = result.content;
        tokenUsage = result.stats.tokenUsage;
        timeToFirstToken = result.stats.timeToFirstToken;
        cost = result.stats.cost;
      }
    }

    // Save PRD if not already saved by AI service
    const prdPath = join(prdDir, prdFilename);
    if (input.method !== "ai") {
      writeFileSync(prdPath, prdContent);

      input.callbacks?.onProgress?.({
        type: "completed",
        message: `PRD saved to ${prdPath}`,
      });
    }

    const stats = {
      duration: Date.now() - startTime,
      ...(tokenUsage && { tokenUsage }),
      ...(timeToFirstToken && { timeToFirstToken }),
      ...(cost && { cost }),
    };

    return {
      success: true,
      prdFile: prdPath,
      prdContent,
      method: input.method,
      stats,
    };
  }

  /**
   * Step 3: Refine PRD
   * Handles PRD refinement through manual or AI methods
   */
  async refinePRD(input: {
    method: "manual" | "ai" | "skip";
    prdFile: string;
    prdContent?: string;
    feedback?: string;
    projectDir: string;
    aiOptions?: AIOptions;
    streamingOptions?: StreamingOptions;
    callbacks?: ProgressCallback;
  }): Promise<RefinePRDResult> {
    const startTime = Date.now();
    let tokenUsage:
      | { prompt: number; completion: number; total: number }
      | undefined;
    let timeToFirstToken: number | undefined;
    let cost: number | undefined;

    input.callbacks?.onProgress?.({
      type: "started",
      message: "Refining PRD...",
    });

    if (input.method === "skip") {
      return {
        success: true,
        prdFile: input.prdFile,
        prdContent: input.prdContent || readFileSync(input.prdFile, "utf-8"),
        stats: {
          duration: Date.now() - startTime,
        },
      };
    }

    let refinedContent =
      input.prdContent || readFileSync(input.prdFile, "utf-8");

    if (input.method === "manual" && input.prdContent) {
      refinedContent = input.prdContent;
    } else if (input.method === "ai" && input.feedback) {
      input.callbacks?.onProgress?.({
        type: "progress",
        message: "Refining PRD with AI...",
      });

      // Capture metrics for AI operations
      const streamingOptions = {
        ...input.streamingOptions,
        onFinish: async (result: any) => {
          if (result.usage) {
            tokenUsage = {
              prompt:
                result.usage.inputTokens || result.usage.promptTokens || 0,
              completion:
                result.usage.outputTokens || result.usage.completionTokens || 0,
              total: result.usage.totalTokens || 0,
            };

            // Calculate cost (simplified - would need proper pricing lookup)
            if (tokenUsage.total > 0) {
              cost = tokenUsage.total * 0.000001; // Placeholder cost calculation
            }
          }
          // Call original onFinish if provided
          input.streamingOptions?.onFinish?.(result);
        },
        onChunk: (chunk: string) => {
          if (chunk && !timeToFirstToken) {
            timeToFirstToken = Date.now() - startTime;
          }
          // Call original onChunk if provided
          input.streamingOptions?.onChunk?.(chunk);
        },
      };

      refinedContent = await workflowAIAssistant.assistPRDRefinement({
        currentPRD: refinedContent,
        userFeedback: input.feedback,
        aiOptions: input.aiOptions,
        streamingOptions,
      });
    }

    // Save refined PRD
    writeFileSync(input.prdFile, refinedContent);

    input.callbacks?.onProgress?.({
      type: "completed",
      message: "PRD refined successfully",
    });

    const stats = {
      duration: Date.now() - startTime,
      ...(tokenUsage && { tokenUsage }),
      ...(timeToFirstToken && { timeToFirstToken }),
      ...(cost && { cost }),
    };

    return {
      success: true,
      prdFile: input.prdFile,
      prdContent: refinedContent,
      stats,
    };
  }

  /**
   * Step 4: Generate Tasks
   * Generates tasks from PRD using the prdService
   */
  async generateTasks(input: {
    prdFile: string;
    method: "standard" | "ai";
    customInstructions?: string;
    projectDir: string;
    aiOptions?: AIOptions;
    streamingOptions?: StreamingOptions;
    callbacks?: ProgressCallback;
  }): Promise<GenerateTasksResult> {
    const startTime = Date.now();
    let tokenUsage:
      | { prompt: number; completion: number; total: number }
      | undefined;
    let timeToFirstToken: number | undefined;
    let cost: number | undefined;

    input.callbacks?.onProgress?.({
      type: "started",
      message: "Generating tasks from PRD...",
    });

    // Capture metrics for AI operations
    const streamingOptions = {
      ...input.streamingOptions,
      onFinish: async (result: any) => {
        if (result.usage) {
          tokenUsage = {
            prompt: result.usage.inputTokens || result.usage.promptTokens || 0,
            completion:
              result.usage.outputTokens || result.usage.completionTokens || 0,
            total: result.usage.totalTokens || 0,
          };

          // Calculate cost (simplified - would need proper pricing lookup)
          if (tokenUsage.total > 0) {
            cost = tokenUsage.total * 0.000001; // Placeholder cost calculation
          }
        }
        // Call original onFinish if provided
        input.streamingOptions?.onFinish?.(result);
      },
      onChunk: (chunk: string) => {
        if (chunk && !timeToFirstToken) {
          timeToFirstToken = Date.now() - startTime;
        }
        // Call original onChunk if provided
        input.streamingOptions?.onChunk?.(chunk);
      },
    };

    const result = await prdService.parsePRD({
      file: input.prdFile,
      workingDirectory: input.projectDir,
      aiOptions: input.aiOptions,
      messageOverride: input.customInstructions,
      streamingOptions,
      callbacks: input.callbacks,
    });

    const stats = {
      tasksCreated: result.tasks.length,
      duration: Date.now() - startTime,
      ...(tokenUsage && { tokenUsage }),
      ...(timeToFirstToken && { timeToFirstToken }),
      ...(cost && { cost }),
    };

    return {
      success: true,
      tasks: result.tasks,
      stats,
    };
  }

  /**
   * Step 5: Split Tasks
   * Splits complex tasks into subtasks
   */
  async splitTasks(input: {
    taskIds: string[];
    splitMethod: "interactive" | "standard" | "custom";
    customInstructions?: string;
    aiOptions?: AIOptions;
    streamingOptions?: StreamingOptions;
    callbacks?: ProgressCallback;
  }): Promise<SplitTasksResult> {
    input.callbacks?.onProgress?.({
      type: "started",
      message: `Splitting ${input.taskIds.length} tasks...`,
    });

    const results: Array<{
      taskId: string;
      subtasks: Task[];
      error?: string;
    }> = [];

    for (const taskId of input.taskIds) {
      try {
        input.callbacks?.onProgress?.({
          type: "progress",
          message: `Splitting task ${taskId}...`,
        });

        const result = await taskService.splitTask(
          taskId,
          input.aiOptions,
          undefined, // promptOverride
          input.customInstructions,
          input.streamingOptions
        );

        results.push({
          taskId,
          subtasks: result.subtasks,
        });
      } catch (error) {
        results.push({
          taskId,
          subtasks: [],
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    input.callbacks?.onProgress?.({
      type: "completed",
      message: "Task splitting completed",
    });

    return {
      success: true,
      results,
    };
  }
}

// Export singleton instance
export const workflowService = new WorkflowService();
