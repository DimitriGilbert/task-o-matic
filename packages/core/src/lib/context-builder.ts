import { join } from "path";
import { Task, TaskContext, BTSConfig, TaskDocumentation } from "../types";
import { TaskRepository } from "./storage/types";
import { configManager } from "./config";
import { readFileSync, existsSync, readdirSync, statSync } from "fs";
import { logger } from "./logger";

export interface FileStats {
  mtime: number;
  isDirectory: boolean;
}

export interface ContextCallbacks {
  readFile: (path: string) => Promise<string | null>;
  fileExists: (path: string) => Promise<boolean>;
  listFiles: (dir: string) => Promise<string[]>;
  stat: (path: string) => Promise<FileStats | null>;
}

export function createDefaultContextCallbacks(): ContextCallbacks {
  return {
    readFile: async (path: string) => {
      if (existsSync(path)) {
        return readFileSync(path, "utf-8");
      }
      return null;
    },
    fileExists: async (path: string) => {
      return existsSync(path);
    },
    listFiles: async (dir: string) => {
      if (existsSync(dir) && statSync(dir).isDirectory()) {
        return readdirSync(dir);
      }
      return [];
    },
    stat: async (path: string) => {
      if (existsSync(path)) {
        const stats = statSync(path);
        return {
          mtime: stats.mtime.getTime(),
          isDirectory: stats.isDirectory(),
        };
      }
      return null;
    },
  };
}

export class ContextBuilder {
  private storage: TaskRepository;
  private callbacks: ContextCallbacks;
  private taskOMatic: string | null = null;
  private initialized = false;

  constructor(storage: TaskRepository, callbacks?: ContextCallbacks) {
    this.storage = storage;
    this.callbacks = callbacks || createDefaultContextCallbacks();
  }

  private ensureInitialized(): void {
    if (this.initialized) {
      return;
    }

    this.taskOMatic = configManager.getTaskOMaticDir();
    this.initialized = true;
  }

  /**
   * Build comprehensive context for AI operations
   */
  async buildContext(taskId: string): Promise<TaskContext> {
    this.ensureInitialized();

    const task = await this.storage.getTask(taskId);
    if (!task) {
      throw new Error(`Task with ID ${taskId} not found`);
    }

    const stack = await this.getStackConfig();
    const documentation = this.getTaskDocumentation(task);
    const fullContent = await this.getTaskFullContent(task);
    const prdContent = task.prdFile
      ? await this.getPRDContent(task.prdFile)
      : await this.getRelevantPRDContent(task.title, task.description);

    return {
      task: {
        id: task.id,
        title: task.title,
        description: task.description ?? "",
        fullContent,
      },
      stack,
      documentation: documentation
        ? {
            recap: documentation.recap,
            files: documentation.files.map((file) => ({
              path: file,
              // Content loading is skipped as per original code comment
            })),
          }
        : undefined,
      existingContent: documentation?.recap,
      prdContent,
      existingResearch: documentation?.research || {},
    };
  }

  /**
   * Build context for new tasks (without requiring existing task)
   */
  async buildContextForNewTask(
    title: string,
    description?: string,
    prdFile?: string
  ): Promise<TaskContext> {
    this.ensureInitialized();

    const stack = await this.getStackConfig();
    const prdContent = prdFile
      ? await this.getPRDContent(prdFile)
      : await this.getRelevantPRDContent(title, description);

    return {
      task: {
        id: "new-task",
        title,
        description: description ?? "",
        fullContent: undefined,
      },
      stack,
      documentation: undefined, // New tasks don't have documentation yet
      existingContent: undefined,
      prdContent,
    };
  }

  /**
   * Get stack configuration from project (set by bootstrap)
   */
  private async getStackConfig(): Promise<BTSConfig | undefined> {
    if (!this.taskOMatic) {
      return undefined;
    }

    // Return sensible defaults for Better-T-Stack
    const fallbackConfig: BTSConfig = {
      projectName: "default",
      frontend: "next",
      backend: "convex",
      database: "none", // Convex has its own database
      auth: "better-auth",
      runtime: "none",
      api: "none",
      payments: "none",
      orm: "none", // Convex doesn't use ORM
      dbSetup: "none",
      packageManager: "npm",
      git: true,
      webDeploy: "none",
      serverDeploy: "none",
      install: true,
      addons: ["turborepo"],
      examples: [],
    };
    try {
      const stackFile = join(this.taskOMatic, "stack.json");
      const content = await this.callbacks.readFile(stackFile);

      if (content) {
        const config = JSON.parse(content) as BTSConfig;
        config._source = "file"; // Track source
        return config;
      }
      fallbackConfig._source = "fallback"; // Track source
      return fallbackConfig;
    } catch (error) {
      logger.warn(
        `Failed to load stack configuration, using defaults: ${error}`
      );
      fallbackConfig._source = "fallback"; // Track source
      return fallbackConfig;
    }
  }

  /**
   * Get task documentation references
   */
  private getTaskDocumentation(task: Task): TaskDocumentation | undefined {
    return task.documentation;
  }

  /**
   * Get full task content from MD file
   */
  private async getTaskFullContent(task: Task): Promise<string | undefined> {
    if (!task.contentFile || !this.taskOMatic) {
      return undefined;
    }

    try {
      const contentPath = join(this.taskOMatic, task.contentFile);
      return (await this.callbacks.readFile(contentPath)) || undefined;
    } catch (error) {
      logger.warn(
        `Failed to read task content file ${task.contentFile}: ${error}`
      );
    }
    return undefined;
  }

  /**
   * Read documentation file content
   */
  private async readDocumentationFile(filePath: string): Promise<string> {
    if (!this.taskOMatic) {
      return `# ContextBuilder Not Initialized\n\nFile: ${filePath}\n\nContextBuilder has not been properly initialized.`;
    }

    try {
      const fullPath = join(this.taskOMatic, filePath);
      const content = await this.callbacks.readFile(fullPath);
      if (content) {
        return content;
      }
      return `# Documentation File Not Found\n\nFile: ${filePath}\n\nThis documentation file could not be found on disk.`;
    } catch (error) {
      return `# Error Reading Documentation\n\nFile: ${filePath}\n\nError: ${
        error instanceof Error ? error.message : "Unknown error"
      }`;
    }
  }

  /**
   * Check if documentation is fresh (less than 7 days old)
   */
  isDocumentationFresh(documentation: TaskDocumentation): boolean {
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return documentation.lastFetched > sevenDaysAgo;
  }

  /**
   * Check if documentation is stale (more than 30 days old)
   */
  isDocumentationStale(documentation: TaskDocumentation): boolean {
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    return documentation.lastFetched < thirtyDaysAgo;
  }

  /**
   * Get PRD content from file path
   */
  private async getPRDContent(prdFile: string): Promise<string | undefined> {
    if (!this.taskOMatic) {
      return undefined;
    }

    try {
      // Handle relative paths from .task-o-matic directory
      const fullPath = prdFile.startsWith("/")
        ? prdFile
        : join(this.taskOMatic, prdFile);

      return (await this.callbacks.readFile(fullPath)) || undefined;
    } catch (error) {
      logger.warn(`Failed to read PRD file ${prdFile}: ${error}`);
      return undefined;
    }
  }

  /**
   * Get relevant PRD content based on task title/description
   */
  private async getRelevantPRDContent(
    taskTitle?: string,
    taskDescription?: string
  ): Promise<string | undefined> {
    if (!this.taskOMatic) return undefined;

    // Look for PRD files in known locations
    const prdPaths = [
      join(this.taskOMatic, "prd"),
      join(this.taskOMatic, "..", "docs"),
      join(configManager.getWorkingDirectory(), ".task-o-matic", "prd"),
      join(configManager.getWorkingDirectory(), "prd"),
      join(configManager.getWorkingDirectory(), "docs"),
    ];

    for (const prdPath of prdPaths) {
      if (await this.callbacks.fileExists(prdPath)) {
        try {
          // Look for ANY text files in PRD directory
          const files = await this.callbacks.listFiles(prdPath);
          const prdFiles = files.filter(
            (f) => f.endsWith(".md") || f.endsWith(".txt")
          );

          if (prdFiles.length > 0) {
            // Get the MOST RECENT PRD file by modification time
            const prdFilesWithStats = await Promise.all(
              prdFiles.map(async (file) => {
                const path = join(prdPath, file);
                const stats = await this.callbacks.stat(path);
                return {
                  file,
                  path,
                  mtime: stats ? stats.mtime : 0,
                };
              })
            );

            prdFilesWithStats.sort((a, b) => b.mtime - a.mtime); // Sort by newest first
            const mostRecentPrd = prdFilesWithStats[0];
            return (
              (await this.callbacks.readFile(mostRecentPrd.path)) || undefined
            );
          }
        } catch (error) {
          logger.warn(`Failed to read PRD directory ${prdPath}: ${error}`);
        }
      }
    }

    return undefined;
  }

  /**
   * Format context for AI prompts
   */
  formatContextForAI(context: TaskContext): string {
    let formatted = `# Task Context\n\n`;

    formatted += `## Task Information\n`;
    formatted += `- **ID**: ${context.task.id}\n`;
    formatted += `- **Title**: ${context.task.title}\n`;
    formatted += `- **Description**: ${context.task.description}\n`;

    if (context.task.fullContent) {
      formatted += `- **Full Content**:\n${context.task.fullContent}\n\n`;
    }

    if (context.prdContent) {
      formatted += `## Product Requirements Document\n`;
      formatted += `${context.prdContent}\n\n`;
    }

    if (context.stack) {
      formatted += `## Technology Stack\n`;
      formatted += `- **Project**: ${context.stack.projectName}\n`;
      formatted += `- **Frontend**: ${context.stack.frontend}\n`;
      formatted += `- **Backend**: ${context.stack.backend}\n`;
      if (context.stack.database !== "none") {
        formatted += `- **Database**: ${context.stack.database}\n`;
      }
      if (context.stack.orm !== "none") {
        formatted += `- **ORM**: ${context.stack.orm}\n`;
      }
      formatted += `- **Auth**: ${context.stack.auth}\n`;
      if (context.stack.addons.length > 0) {
        formatted += `- **Addons**: ${context.stack.addons.join(", ")}\n`;
      }
      formatted += `- **Package Manager**: ${context.stack.packageManager}\n`;
      formatted += `\n`;
    }

    if (context.documentation) {
      formatted += `## Available Documentation\n`;
      formatted += `**Recap**: ${context.documentation.recap}\n\n`;

      if (context.documentation.files.length > 0) {
        formatted += `### Documentation Files\n\n`;
        context.documentation.files.forEach((file, index) => {
          formatted += `#### ${index + 1}. ${file.path}\n`;
          // formatted += `${file.content}\n\n`;
        });
      }
    }

    return formatted;
  }
}
