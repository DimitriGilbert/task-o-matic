import { BTSConfig } from "../types";
import { configManager } from "./config";
import { writeFileSync } from "fs";
import { join } from "path";

export class BetterTStackService {
  async createProject(
    name: string,
    config: BTSConfig,
    workingDirectory?: string
  ): Promise<{
    success: boolean;
    projectPath: string;
    message: string;
  }> {
    try {
      console.log(`🚀 Bootstrapping Better-T-Stack project: ${name}`);

      // Change to working directory if provided
      const originalCwd = process.cwd();
      if (workingDirectory) {
        process.chdir(workingDirectory);
        console.log(`🔥 Changed working directory to: ${workingDirectory}`);
      }

      // Convert our config to Better-T-Stack API format
      const apiConfig = this.convertToAPIConfig(config);

      console.log(`🔥 Calling Better-T-Stack programmatic API...`);

      // Use dynamic import with eval to bypass TypeScript module resolution
      // this is magically fucking terrible
      const btsModule = await eval(`import("create-better-t-stack")`);
      const result = await btsModule.init(name, apiConfig);

      // Restore original directory
      if (workingDirectory) {
        process.chdir(originalCwd);
      }

      if (result.success) {
        // Save configuration
        await this.saveBTSConfig(name, config);

        // Post-bootstrap enhancements
        try {
          const projectDir = result.projectDirectory;

          // 1. Add check-types script to packages
          await this.addCheckTypesScript(projectDir);

          // 2. Copy documentation if requested
          if (config.includeDocs) {
            await this.copyDocumentation(projectDir);
          }
        } catch (error) {
          console.error("⚠ Post-bootstrap enhancements failed:", error);
          // Don't fail the whole process, just log warning
        }

        return {
          success: true,
          projectPath: result.relativePath,
          message: `Better-T-Stack project ${name} created successfully at ${result.projectDirectory}`,
        };
      } else {
        return {
          success: false,
          projectPath: "",
          message: `Better-T-Stack bootstrap failed: ${result.error}`,
        };
      }
    } catch (error) {
      return {
        success: false,
        projectPath: "",
        message: `Better-T-Stack initialization failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      };
    }
  }

  private convertToAPIConfig(config: BTSConfig) {
    return {
      // Don't use 'yes' flag when providing explicit configuration
      frontend: [config.frontend],
      backend: config.backend,
      runtime: config.runtime,
      api: config.api,
      auth: config.auth,
      database: config.database,
      orm: config.orm,
      dbSetup: config.dbSetup,
      packageManager: config.packageManager,
      webDeploy: config.webDeploy,
      serverDeploy: config.serverDeploy,
      git: config.git,
      install: config.install,
      addons: config.addons,
      examples:
        config.examples && config.examples.length > 0
          ? config.examples
          : undefined,
      disableAnalytics: true,
    };
  }

  private async saveBTSConfig(name: string, config: BTSConfig): Promise<void> {
    const taskOMaticDir = configManager.getTaskOMaticDir();

    const configData = JSON.stringify(
      {
        ...config,
        projectName: config.projectName || name,
        createdAt: new Date().toISOString(),
      },
      null,
      2
    );

    // Save with project-specific name for tracking multiple projects
    const namedConfigPath = join(taskOMaticDir, `${name}-bts-config.json`);
    writeFileSync(namedConfigPath, configData);

    // Also save as canonical stack.json for easy discovery by context-builder
    const stackConfigPath = join(taskOMaticDir, "stack.json");
    writeFileSync(stackConfigPath, configData);
  }

  private async addCheckTypesScript(projectDir: string): Promise<void> {
    const { glob } = await import("glob");
    const { readFileSync, writeFileSync } = await import("fs");

    console.log("🔍 Adding check-types scripts to packages...");

    // Find all package.json files in apps and backend directories
    const packageFiles = await glob(
      ["apps/*/package.json", "backend/*/package.json"],
      { cwd: projectDir, absolute: true }
    );

    for (const file of packageFiles) {
      try {
        const content = JSON.parse(readFileSync(file, "utf-8"));
        if (!content.scripts) {
          content.scripts = {};
        }

        // Add check-types script if not present
        if (!content.scripts["check-types"]) {
          content.scripts["check-types"] = "tsc --noEmit";
          writeFileSync(file, JSON.stringify(content, null, 2) + "\n");
          console.log(
            `  ✓ Added check-types to ${file.split("/").slice(-3).join("/")}`
          );
        }
      } catch (err) {
        console.warn(`  ⚠ Failed to update ${file}:`, err);
      }
    }
  }

  private async copyDocumentation(projectDir: string): Promise<void> {
    const { copyFileSync, mkdirSync, existsSync } = await import("fs");
    const { resolve, dirname } = await import("path");

    console.log("📚 Copying documentation...");

    try {
      // Source: docs/agents/cli.md in the current package
      // We need to find where the package is installed or running from
      // Assuming we are running from dist/lib/better-t-stack-cli.js or similar
      // The docs should be in ../../docs/agents/cli.md relative to this file's location in source
      // Or in the package root if installed

      let sourcePath = resolve(__dirname, "../../../docs/agents/cli.md");

      // Check if we're in dist
      if (!existsSync(sourcePath)) {
        // Try to find it relative to package root (cwd when running dev)
        sourcePath = resolve(process.cwd(), "docs/agents/cli.md");
      }

      if (!existsSync(sourcePath)) {
        // Try to find it in node_modules if installed as dependency
        try {
          sourcePath = require.resolve("task-o-matic/docs/agents/cli.md");
        } catch (e) {
          // Ignore
        }
      }

      if (existsSync(sourcePath)) {
        const destPath = join(projectDir, "docs/task-o-matic.md");
        const destDir = dirname(destPath);

        if (!existsSync(destDir)) {
          mkdirSync(destDir, { recursive: true });
        }

        copyFileSync(sourcePath, destPath);
        console.log(`  ✓ Copied documentation to docs/task-o-matic.md`);
      } else {
        console.warn("  ⚠ Could not locate source documentation file");
      }
    } catch (err) {
      console.warn("  ⚠ Failed to copy documentation:", err);
    }
  }
}

export interface InitOptions {
  projectName?: string;
  name?: string;
  frontend: string;
  backend: string;
  database: string;
  noAuth?: boolean;
  addons?: string[];
  runtime?: string;
  api?: string;
  payments?: string;
  orm?: string;
  dbSetup?: string;
  packageManager?: string;
  noGit?: boolean;
  webDeploy?: string;
  serverDeploy?: string;
  noInstall?: boolean;
  examples?: string[];
  includeDocs?: boolean;
}

export async function runBetterTStackCLI(
  options: InitOptions,
  workingDirectory?: string
): Promise<{ success: boolean; message: string; projectPath?: string }> {
  const btsService = new BetterTStackService();
  const backend = options.backend;
  const isConvex = backend === "convex";

  const btsConfig: BTSConfig = {
    projectName: options.name || options.projectName || "default-project",
    frontend: (options.frontend as BTSConfig["frontend"]) || "next",
    backend: (backend as BTSConfig["backend"]) || "convex",
    database: isConvex
      ? "none"
      : (options.database as BTSConfig["database"]) || "sqlite",
    auth: options.noAuth ? "none" : "better-auth",
    addons: options.addons || ["turborepo"],
    runtime: isConvex ? "none" : options.runtime || "node",
    api: options.api || "none",
    payments: options.payments || "none",
    orm: isConvex ? "none" : options.orm || "drizzle",
    dbSetup: isConvex ? "none" : options.dbSetup || "none",
    packageManager: options.packageManager || "npm",
    git: !options.noGit,
    webDeploy: options.webDeploy || "none",
    serverDeploy: options.serverDeploy || "none",
    install: !options.noInstall,
    examples: options.examples || [],
    includeDocs: options.includeDocs,
  };

  const result = await btsService.createProject(
    options.projectName || options.name || "",
    btsConfig,
    workingDirectory
  );

  return {
    success: result.success,
    message: result.message,
    projectPath: result.projectPath,
  };
}
