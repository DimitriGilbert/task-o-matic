import { join, resolve } from "path";
import { existsSync, mkdirSync, rmSync } from "fs";
import { workflowService } from "./workflow";
import { AIOptions } from "../utils/ai-config-builder";
import { StreamingOptions, Task } from "../types";
import { WorkflowBenchmarkInput, WorkflowBenchmarkResult } from "../lib/benchmark/types";
import { WorkflowAutomationOptions } from "../types/workflow-options";

/**
 * WorkflowBenchmarkService - Executes complete workflows for benchmarking
 * Creates isolated environments for each model to ensure fair comparison
 */
export class WorkflowBenchmarkService {
  /**
   * Execute a complete workflow for benchmarking purposes
   */
  async executeWorkflow(
    input: WorkflowBenchmarkInput,
    aiOptions: AIOptions,
    streamingOptions?: StreamingOptions
  ): Promise<WorkflowBenchmarkResult["output"]> {
    const startTime = Date.now();
    
    // Create temporary project directory for this benchmark run
    const tempProjectDir = this.createTempProjectDir(
      input.tempDirBase || "/tmp",
      input.collectedResponses.projectName,
      aiOptions.aiProvider || "unknown",
      aiOptions.aiModel || "unknown"
    );

    const stats = {
      initDuration: 0,
      prdGenerationDuration: 0,
      prdRefinementDuration: 0,
      taskGenerationDuration: 0,
      taskSplittingDuration: 0,
      totalTasks: 0,
      tasksWithSubtasks: 0,
      avgTaskComplexity: 0,
      prdSize: 0,
      totalSteps: 0,
      successfulSteps: 0,
    };

    let projectDir = tempProjectDir;
    let prdFile = "";
    let prdContent = "";
    let tasks: Task[] = [];

    try {
      // Step 1: Initialize Project
      const stepStart = Date.now();
      stats.totalSteps++;
      
      const initResult = await workflowService.initializeProject({
        projectName: input.collectedResponses.projectName,
        projectDir: tempProjectDir,
        initMethod: input.collectedResponses.initMethod,
        projectDescription: input.collectedResponses.projectDescription,
        aiOptions,
        stackConfig: input.collectedResponses.stackConfig,
        bootstrap: true, // Always bootstrap for benchmark unless explicitly disabled
        streamingOptions,
        callbacks: {
          onProgress: () => {}, // Silent for benchmarking
          onError: () => {},
        },
      });

      stats.initDuration = Date.now() - stepStart;
      stats.successfulSteps++;
      projectDir = initResult.projectDir;

      // Step 2: Define PRD
      if (input.collectedResponses.prdMethod !== "skip") {
        const prdStart = Date.now();
        stats.totalSteps++;

        const prdResult = await workflowService.definePRD({
          method: input.collectedResponses.prdMethod,
          prdFile: input.collectedResponses.prdFile,
          prdDescription: input.collectedResponses.prdDescription,
          prdContent: input.collectedResponses.prdContent,
          projectDir,
          aiOptions,
          streamingOptions,
          callbacks: {
            onProgress: () => {},
            onError: () => {},
          },
        });

        stats.prdGenerationDuration = Date.now() - prdStart;
        stats.successfulSteps++;
        prdFile = prdResult.prdFile;
        prdContent = prdResult.prdContent;
        stats.prdSize = prdContent.length;

        // Step 3: Refine PRD (if requested)
        if (input.collectedResponses.refinePrd && input.collectedResponses.refineFeedback) {
          const refineStart = Date.now();
          stats.totalSteps++;

          const refineResult = await workflowService.refinePRD({
            method: "ai",
            prdFile,
            feedback: input.collectedResponses.refineFeedback,
            projectDir,
            aiOptions,
            streamingOptions,
            callbacks: {
              onProgress: () => {},
              onError: () => {},
            },
          });

          stats.prdRefinementDuration = Date.now() - refineStart;
          stats.successfulSteps++;
          prdContent = refineResult.prdContent;
          stats.prdSize = prdContent.length;
        }

        // Step 4: Generate Tasks
        if (input.collectedResponses.generateTasks !== false && prdFile) {
          const tasksStart = Date.now();
          stats.totalSteps++;

          const tasksResult = await workflowService.generateTasks({
            prdFile,
            method: input.collectedResponses.customInstructions ? "ai" : "standard",
            customInstructions: input.collectedResponses.customInstructions,
            projectDir,
            aiOptions,
            streamingOptions,
            callbacks: {
              onProgress: () => {},
              onError: () => {},
            },
          });

          stats.taskGenerationDuration = Date.now() - tasksStart;
          stats.successfulSteps++;
          tasks = tasksResult.tasks;
          stats.totalTasks = tasks.length;

          // Step 5: Split Tasks (if requested)
          if (input.collectedResponses.splitTasks && tasks.length > 0) {
            const splitStart = Date.now();
            stats.totalSteps++;

            const tasksToSplit = input.collectedResponses.tasksToSplit?.length 
              ? input.collectedResponses.tasksToSplit 
              : tasks.slice(0, Math.min(3, tasks.length)).map(t => t.id); // Split first 3 tasks by default

            const splitResult = await workflowService.splitTasks({
              taskIds: tasksToSplit,
              splitMethod: input.collectedResponses.splitInstructions ? "custom" : "standard",
              customInstructions: input.collectedResponses.splitInstructions,
              aiOptions,
              streamingOptions,
              callbacks: {
                onProgress: () => {},
                onError: () => {},
              },
            });

            stats.taskSplittingDuration = Date.now() - splitStart;
            stats.successfulSteps++;
            stats.tasksWithSubtasks = splitResult.results.filter(r => !r.error && r.subtasks.length > 0).length;
          }
        }
      }

      // Calculate complexity metrics
      if (tasks.length > 0) {
        const totalComplexity = tasks.reduce((sum, task) => {
          const contentLength = (task.description || "").length;
          return sum + (contentLength > 200 ? 3 : contentLength > 100 ? 2 : 1);
        }, 0);
        stats.avgTaskComplexity = totalComplexity / tasks.length;
      }

      return {
        projectDir,
        prdFile,
        prdContent,
        tasks,
        stats,
      };

    } finally {
      // Clean up temporary directory
      this.cleanupTempProjectDir(tempProjectDir);
    }
  }

  /**
   * Create a temporary project directory for benchmarking
   */
  private createTempProjectDir(tempBase: string, projectName: string, provider: string, model: string): string {
    const sanitizedModel = model.replace(/[^a-zA-Z0-9-]/g, "-");
    const dirName = `benchmark-${projectName}-${provider}-${sanitizedModel}-${Date.now()}`;
    const tempDir = join(tempBase, "task-o-matic-benchmark", dirName);
    
    if (!existsSync(tempDir)) {
      mkdirSync(tempDir, { recursive: true });
    }
    
    return tempDir;
  }

  /**
   * Clean up temporary project directory
   */
  private cleanupTempProjectDir(projectDir: string): void {
    try {
      if (existsSync(projectDir) && projectDir.includes("task-o-matic-benchmark")) {
        rmSync(projectDir, { recursive: true, force: true });
      }
    } catch (error) {
      // Ignore cleanup errors
      console.warn(`Warning: Could not clean up temp directory ${projectDir}`);
    }
  }

  /**
   * Apply the results from a selected benchmark to the actual project
   */
  async applyBenchmarkResult(
    selectedResult: WorkflowBenchmarkResult,
    targetProjectDir: string,
    originalResponses: WorkflowBenchmarkInput["collectedResponses"]
  ): Promise<{ success: boolean; message: string }> {
    try {
      const { workflowService } = await import("./workflow");
      const { writeFileSync, existsSync, mkdirSync } = await import("fs");
      const { join } = await import("path");
      
      // Ensure target directory exists
      if (!existsSync(targetProjectDir)) {
        mkdirSync(targetProjectDir, { recursive: true });
      }
      
      // Extract model configuration from modelId (e.g., "openai:gpt-4o")
      const [provider, model] = selectedResult.modelId.split(":").slice(0, 2);
      
      // Step 1: Initialize actual project with selected model
      const actualResult = await workflowService.initializeProject({
        projectName: originalResponses.projectName,
        projectDir: targetProjectDir,
        initMethod: originalResponses.initMethod,
        projectDescription: originalResponses.projectDescription,
        aiOptions: {
          aiProvider: provider,
          aiModel: model,
        },
        stackConfig: originalResponses.stackConfig,
        bootstrap: true,
        streamingOptions: {},
        callbacks: {
          onProgress: (msg) => {
            const message = typeof msg === 'string' ? msg : 
              'message' in msg ? msg.message : 
              'text' in msg ? msg.text : 'Progress update';
            console.log(`  ${message}`);
          },
          onError: (err) => console.error(`  Error: ${err.message || err}`),
        },
      });
      
      // Step 2: Copy PRD content if available
      if (selectedResult.output.prdContent && selectedResult.output.prdFile) {
        const taskOMaticDir = join(targetProjectDir, ".task-o-matic", "prd");
        if (!existsSync(taskOMaticDir)) {
          mkdirSync(taskOMaticDir, { recursive: true });
        }
        
        const targetPrdFile = join(taskOMaticDir, "prd.md");
        writeFileSync(targetPrdFile, selectedResult.output.prdContent);
        console.log(`  ✓ PRD copied to ${targetPrdFile}`);
      }
      
      // Step 3: Import tasks if available
      if (selectedResult.output.tasks && selectedResult.output.tasks.length > 0) {
        const { getStorage } = await import("../utils/ai-service-factory");
        
        // Switch to target directory context
        process.chdir(targetProjectDir);
        
        for (const task of selectedResult.output.tasks) {
          try {
            await getStorage().createTask(
              {
                title: task.title,
                description: task.description || "",
                content: task.description || "",
                parentId: task.parentId,
                estimatedEffort: task.estimatedEffort as "small" | "medium" | "large" | undefined,
              }
            );
          } catch (error) {
            console.warn(`  Warning: Could not import task "${task.title}"`);
          }
        }
        
        console.log(`  ✓ Imported ${selectedResult.output.tasks.length} tasks`);
      }
      
      return {
        success: true,
        message: `Successfully applied results from ${selectedResult.modelId} to ${targetProjectDir}`,
      };
      
    } catch (error) {
      return {
        success: false,
        message: `Failed to apply benchmark results: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }

  /**
   * Validate workflow benchmark input
   */
  validateInput(input: any): input is WorkflowBenchmarkInput {
    return (
      input &&
      input.collectedResponses &&
      typeof input.collectedResponses.projectName === "string" &&
      input.collectedResponses.projectName.length > 0 &&
      typeof input.collectedResponses.initMethod === "string" &&
      ["quick", "custom", "ai"].includes(input.collectedResponses.initMethod)
    );
  }
}

export const workflowBenchmarkService = new WorkflowBenchmarkService();