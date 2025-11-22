import { PromptRegistry, PromptMetadata } from "./prompt-registry";
import { readFileSync, existsSync, readdirSync, statSync } from "fs";
import { configManager } from "./config";
import { ContextBuilder } from "./context-builder";
import { getContextBuilder } from "../utils/ai-service-factory";
import { join } from "path";

export interface PromptBuilderOptions {
  name: string;
  type?: "system" | "user";
  variables: Record<string, string>;
  prdContent?: string;
  taskTitle?: string;
  taskDescription?: string;
  stackInfo?: string;
  contextInfo?: string;
  userFeedback?: string;
}

export interface PromptBuilderResult {
  success: boolean;
  prompt?: string;
  metadata?: PromptMetadata;
  error?: string;
  missingVariables?: string[];
}

export class PromptBuilder {
  /**
   * Build a prompt with variable replacement
   */
  static buildPrompt(options: PromptBuilderOptions): PromptBuilderResult {
    const { name, type = "user", variables, ...directVars } = options;

    // Get the prompt name with type suffix if specified
    const promptName = type === "system" ? `${name}-system` : name;

    // Get prompt metadata from registry
    const metadata = PromptRegistry.getPrompt(promptName);
    if (!metadata) {
      return {
        success: false,
        error: `Prompt not found: ${promptName}. Available prompts:\n${PromptRegistry.listPrompts()}`,
      };
    }

    // Combine all variables (direct variables + variables object)
    const allVariables = { ...variables, ...directVars };

    // Validate required variables
    const validation = PromptRegistry.validatePrompt(promptName, allVariables);
    if (!validation.valid) {
      return {
        success: false,
        error: `Missing required variables: ${validation.missingRequired.join(
          ", "
        )}`,
        missingVariables: validation.missingRequired,
      };
    }

    // Log missing optional variables for user awareness
    if (validation.missingOptional.length > 0) {
      console.warn(
        `Note: Missing optional variables: ${validation.missingOptional.join(
          ", "
        )}`
      );
    }

    try {
      // Replace variables in the prompt text
      let promptText = metadata.promptText;

      // Replace all {VAR_NAME} patterns with their values
      for (const [key, value] of Object.entries(allVariables)) {
        const pattern = new RegExp(`\\{${key}\\}`, "g");
        promptText = promptText.replace(pattern, value || "");
      }

      // Check for any unreplaced variables (optional ones that weren't provided)
      const unreplacedVars = promptText.match(/\{[^}]+\}/g);
      if (unreplacedVars && unreplacedVars.length > 0) {
        const varNames = unreplacedVars.map((v) => v.slice(1, -1));
        const optionalUnreplaced = varNames.filter((v) =>
          metadata.optionalVariables.includes(v)
        );

        if (optionalUnreplaced.length > 0) {
          console.warn(
            `Note: Optional variables not replaced: ${optionalUnreplaced.join(
              ", "
            )}`
          );
        }
      }

      return {
        success: true,
        prompt: promptText,
        metadata,
      };
    } catch (error) {
      return {
        success: false,
        error: `Error building prompt: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      };
    }
  }

  /**
   * List all available prompts
   */
  static listPrompts(): string {
    return PromptRegistry.listPrompts();
  }

  /**
   * Get metadata for a specific prompt
   */
  static getPromptMetadata(
    name: string,
    type?: "system" | "user"
  ): PromptMetadata | null {
    const promptName = type === "system" ? `${name}-system` : name;
    return PromptRegistry.getPrompt(promptName) || null;
  }

  /**
   * Load PRD content from file
   */
  static loadPRDContent(filePath: string): string {
    if (!existsSync(filePath)) {
      throw new Error(`PRD file not found: ${filePath}`);
    }
    return readFileSync(filePath, "utf-8");
  }

  /**
   * Auto-detect and load PRD content from project
   */
  static async autoDetectPRDContent(): Promise<string | undefined> {
    try {
      const contextBuilder = getContextBuilder();

      // Build context for a dummy task to get PRD content
      const context = await contextBuilder.buildContextForNewTask(
        "Dummy Task",
        "For PRD detection"
      );

      return context.prdContent;
    } catch (error) {
      console.warn("Could not auto-detect PRD content:", error);
      return undefined;
    }
  }

  /**
   * Build task context from file or content using ContextBuilder
   */
  static async buildTaskContext(
    taskTitle: string,
    content?: string,
    filePath?: string
  ): Promise<string> {
    let taskDescription = "";

    if (filePath) {
      if (!existsSync(filePath)) {
        throw new Error(`Task file not found: ${filePath}`);
      }
      taskDescription = readFileSync(filePath, "utf-8");
    } else if (content) {
      taskDescription = content;
    }

    // Use ContextBuilder to get rich context if we have a title
    if (taskTitle) {
      try {
        const contextBuilder = getContextBuilder();
        const context = await contextBuilder.buildContextForNewTask(
          taskTitle,
          taskDescription
        );

        // Return formatted context instead of just description
        return contextBuilder.formatContextForAI(context);
      } catch (error) {
        console.warn(
          "Could not build rich task context, using basic description:",
          error
        );
        return taskDescription;
      }
    }

    return taskDescription;
  }

  /**
   * Detect stack info using ContextBuilder (proper BTS config loading)
   */
  static async detectStackInfo(projectPath?: string): Promise<string> {
    try {
      // Default to current working directory if not provided
      const workDir = projectPath || process.cwd();
      configManager.setWorkingDirectory(workDir);
      await configManager.load();

      const contextBuilder = getContextBuilder();

      // Build context for a dummy task to get stack info
      const context = await contextBuilder.buildContextForNewTask(
        "Dummy Task",
        "For stack detection"
      );

      if (context.stack && context.stack._source === "file") {
        const parts = [
          `Frontend: ${context.stack.frontend}`,
          `Backend: ${context.stack.backend}`,
        ];
        if (context.stack.database !== "none") {
          parts.push(`Database: ${context.stack.database}`);
        }
        if (context.stack.orm !== "none") {
          parts.push(`ORM: ${context.stack.orm}`);
        }
        parts.push(`Auth: ${context.stack.auth}`);
        if (context.stack.addons.length > 0) {
          parts.push(`Addons: ${context.stack.addons.join(", ")}`);
        }
        return parts.join(", ");
      }

      return "Not detected";
    } catch (error) {
      console.warn("Could not detect stack info using ContextBuilder:", error);
      return "Not detected";
    }
  }

  /**
   * Build comprehensive project context for external executors
   */
  static async buildFullProjectContext(projectPath: string): Promise<string> {
    const contextParts: string[] = [];

    contextParts.push("**Project Context:**");

    // Detect package.json and dependencies
    const packageJsonPath = join(projectPath, "package.json");
    if (existsSync(packageJsonPath)) {
      try {
        const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8"));
        const deps = Object.keys(packageJson.dependencies || {});
        const devDeps = Object.keys(packageJson.devDependencies || {});

        contextParts.push(`\n**Dependencies:**`);
        if (deps.length > 0) {
          contextParts.push(
            `- Production: ${deps.slice(0, 10).join(", ")}${
              deps.length > 10 ? ` (+${deps.length - 10} more)` : ""
            }`
          );
        }
        if (devDeps.length > 0) {
          contextParts.push(
            `- Development: ${devDeps.slice(0, 10).join(", ")}${
              devDeps.length > 10 ? ` (+${devDeps.length - 10} more)` : ""
            }`
          );
        }

        if (packageJson.scripts) {
          const scripts = Object.keys(packageJson.scripts);
          contextParts.push(`\n**Available Scripts:** ${scripts.join(", ")}`);
        }
      } catch (error) {
        console.warn("Could not parse package.json:", error);
      }
    }

    // Detect project structure
    try {
      const files = readdirSync(projectPath);
      const directories = files.filter((f) => {
        try {
          const stat = statSync(join(projectPath, f));
          return stat.isDirectory() && !f.startsWith(".");
        } catch {
          return false;
        }
      });

      if (directories.length > 0) {
        contextParts.push(`\n**Project Structure:** ${directories.join(", ")}`);
      }

      // Detect configuration files
      const configFiles = files.filter(
        (f) =>
          f.match(/\.(config|rc)\.(js|ts|json|yaml|yml)$/) ||
          [
            "tsconfig.json",
            "next.config.js",
            "vite.config.ts",
            "tailwind.config.js",
          ].includes(f)
      );
      if (configFiles.length > 0) {
        contextParts.push(
          `\n**Configuration Files:** ${configFiles.join(", ")}`
        );
      }
    } catch (error) {
      console.warn("Could not read project structure:", error);
    }

    // Detect frameworks and tools
    const detectedTools: string[] = [];
    if (
      existsSync(join(projectPath, "next.config.js")) ||
      existsSync(join(projectPath, "next.config.ts"))
    ) {
      detectedTools.push("Next.js");
    }
    if (
      existsSync(join(projectPath, "vite.config.ts")) ||
      existsSync(join(projectPath, "vite.config.js"))
    ) {
      detectedTools.push("Vite");
    }
    if (
      existsSync(join(projectPath, "tailwind.config.js")) ||
      existsSync(join(projectPath, "tailwind.config.ts"))
    ) {
      detectedTools.push("Tailwind CSS");
    }
    if (existsSync(join(projectPath, "convex"))) {
      detectedTools.push("Convex");
    }
    if (existsSync(join(projectPath, "turbo.json"))) {
      detectedTools.push("Turborepo");
    }

    if (detectedTools.length > 0) {
      contextParts.push(`\n**Detected Tools:** ${detectedTools.join(", ")}`);
    }

    return contextParts.join("\n");
  }

  /**
   * Format prompt for specific executor
   */
  static formatForExecutor(
    prompt: string,
    executor: "opencode" | "claude" | "gemini" | "codex"
  ): string {
    // Most executors work well with plain text prompts
    // This method exists for future customization if needed

    switch (executor) {
      case "claude":
        // Claude Code works well with structured markdown
        return prompt;
      case "gemini":
        // Gemini CLI supports file references with @
        return prompt;
      case "codex":
        // Codex CLI supports structured prompts
        return prompt;
      case "opencode":
      default:
        return prompt;
    }
  }
}
