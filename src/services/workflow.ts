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
        ? "claude-3-5-sonnet-20240620"
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
  }): Promise<DefinePRDResult> {
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
      input.callbacks?.onProgress?.({
        type: "progress",
        message: "Generating PRD with AI...",
      });

      prdContent = await workflowAIAssistant.assistPRDCreation({
        userDescription: input.prdDescription,
        aiOptions: input.aiOptions,
        streamingOptions: input.streamingOptions,
      });
    }

    // Save PRD
    const prdPath = join(prdDir, prdFilename);
    writeFileSync(prdPath, prdContent);

    input.callbacks?.onProgress?.({
      type: "completed",
      message: `PRD saved to ${prdPath}`,
    });

    return {
      success: true,
      prdFile: prdPath,
      prdContent,
      method: input.method,
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
    input.callbacks?.onProgress?.({
      type: "started",
      message: "Refining PRD...",
    });

    if (input.method === "skip") {
      return {
        success: true,
        prdFile: input.prdFile,
        prdContent: input.prdContent || readFileSync(input.prdFile, "utf-8"),
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

      refinedContent = await workflowAIAssistant.assistPRDRefinement({
        currentPRD: refinedContent,
        userFeedback: input.feedback,
        aiOptions: input.aiOptions,
        streamingOptions: input.streamingOptions,
      });
    }

    // Save refined PRD
    writeFileSync(input.prdFile, refinedContent);

    input.callbacks?.onProgress?.({
      type: "completed",
      message: "PRD refined successfully",
    });

    return {
      success: true,
      prdFile: input.prdFile,
      prdContent: refinedContent,
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

    input.callbacks?.onProgress?.({
      type: "started",
      message: "Generating tasks from PRD...",
    });

    const result = await prdService.parsePRD({
      file: input.prdFile,
      workingDirectory: input.projectDir,
      aiOptions: input.aiOptions,
      messageOverride: input.customInstructions,
      streamingOptions: input.streamingOptions,
      callbacks: input.callbacks,
    });

    return {
      success: true,
      tasks: result.tasks,
      stats: {
        tasksCreated: result.tasks.length,
        duration: Date.now() - startTime,
      },
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
