import { BTSConfig, BTSFrontend, InitOptions } from "../types";
import { configManager } from "./config";
import { writeFileSync, mkdirSync, readFileSync } from "fs";
// import { glob } from "glob";
import { join } from "path";
import { logger } from "./logger";

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
      logger.info(`🚀 Bootstrapping Better-T-Stack project: ${name}`);

      // Change to working directory if provided
      const originalCwd = process.cwd();
      if (workingDirectory) {
        process.chdir(workingDirectory);
        logger.info(`🔥 Changed working directory to: ${workingDirectory}`);
      }

      // Convert our config to Better-T-Stack API format
      const apiConfig = this.convertToAPIConfig(config);

      logger.info(`🔥 Calling Better-T-Stack programmatic API...`);

      // Use dynamic import via Function constructor to bypass TypeScript module resolution
      // and ensure it works in both CJS and ESM contexts
      // eslint-disable-next-line @typescript-eslint/no-implied-eval, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment
      const dynamicImport = new Function(
        "specifier",
        "return import(specifier)"
      );
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
      const btsModule = await dynamicImport("create-better-t-stack");

      // Handle different module structures and API versions
      // The package renamed 'init' to 'create' in a recent update
      const initFn =
        btsModule.create ||
        btsModule.init ||
        btsModule.default?.create ||
        btsModule.default?.init ||
        btsModule.default;
      if (typeof initFn !== "function") {
        throw new Error(
          `Could not find 'create' or 'init' function in create-better-t-stack module. ` +
            `Available exports: ${Object.keys(btsModule).join(", ")}`
        );
      }

      const result = await initFn(name, apiConfig);

      // Restore original directory
      if (workingDirectory) {
        process.chdir(originalCwd);
      }

      if (result.success) {
        // Save configuration
        await this.saveBTSConfig(name, config, result.projectDirectory);

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
          logger.error(`⚠ Post-bootstrap enhancements failed: ${error}`);
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
    // Ensure frontend is always an array for Better-T-Stack API
    const frontend = Array.isArray(config.frontend)
      ? config.frontend
      : [config.frontend];

    return {
      // Don't use 'yes' flag when providing explicit configuration
      frontend,
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
        config.examples &&
        config.examples.length > 0 &&
        config.examples[0] !== "none"
          ? config.examples
          : ["none"],
      disableAnalytics: true,
      payments: config.payments,
      template: config.template, // v3.13.0: mern, pern, t3, uniwind
      // Non-interactive options (yes: true conflicts with explicit config)
      manualDb: true, // Skip DB setup prompts
      renderTitle: false, // Cleaner output
    };
  }

  private async saveBTSConfig(
    name: string,
    config: BTSConfig,
    projectPath?: string
  ): Promise<void> {
    const taskOMaticDir = projectPath
      ? join(projectPath, ".task-o-matic")
      : configManager.getTaskOMaticDir();

    // Ensure directory exists if we're using a specific project path
    if (projectPath && !require("fs").existsSync(taskOMaticDir)) {
      require("fs").mkdirSync(taskOMaticDir, { recursive: true });
    }

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
    // const { readFileSync, writeFileSync } = await import("fs");

    logger.info("🔍 Adding check-types scripts to packages...");

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
          logger.success(
            `  ✓ Added check-types to ${file.split("/").slice(-3).join("/")}`
          );
        }
      } catch (err) {
        logger.warn(`  ⚠ Failed to update ${file}: ${err}`);
      }
    }
  }

  private async copyDocumentation(projectDir: string): Promise<void> {
    const { copyFileSync, mkdirSync, existsSync } = await import("fs");
    const { resolve, dirname } = await import("path");

    logger.info("📚 Copying documentation...");

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
        logger.success(`  ✓ Copied documentation to docs/task-o-matic.md`);
      } else {
        logger.warn("  ⚠ Could not locate source documentation file");
      }
    } catch (err) {
      logger.warn(`  ⚠ Failed to copy documentation: ${err}`);
    }
  }
}

// Helper methods for multi-frontend support
export class BetterTStackIntegration {
  private btsService: BetterTStackService;

  constructor() {
    this.btsService = new BetterTStackService();
  }

  /**
   * Parse frontend option into array of frontends
   */
  private parseFrontends(
    frontendOption?: BTSFrontend | BTSFrontend[] | string
  ): BTSFrontend[] {
    if (!frontendOption) return [];

    // If already array, return it
    if (Array.isArray(frontendOption)) return frontendOption;

    // If string, split by comma or space
    if (typeof frontendOption === "string") {
      return frontendOption
        .split(/[\s,]+/)
        .map((f) => f.trim())
        .filter(Boolean) as BTSFrontend[];
    }

    // Single value
    return [frontendOption];
  }

  /**
   * Split frontends into Better-T-Stack frontends vs custom frontends
   */
  private splitFrontends(frontends: BTSFrontend[]): {
    btsFrontends: BTSFrontend[];
    customFrontends: BTSFrontend[];
  } {
    const customTypes = new Set<string>(["cli", "medusa"]);

    return {
      btsFrontends: frontends.filter((f) => !customTypes.has(f)),
      customFrontends: frontends.filter((f) => customTypes.has(f)),
    };
  }

  /**
   * Create project with support for multiple frontends
   */
  async createProject(
    name: string,
    options: InitOptions,
    workingDirectory?: string
  ): Promise<{ success: boolean; message: string; projectPath?: string }> {
    const workingDir = workingDirectory || configManager.getWorkingDirectory();
    const frontends = this.parseFrontends(options.frontend);
    const { btsFrontends, customFrontends } = this.splitFrontends(frontends);

    const isMonorepo = frontends.length > 1;
    let projectPath = join(workingDir, name);
    const results: string[] = [];

    try {
      // Step 1: Bootstrap Better-T-Stack project FIRST (if any BTS frontends)
      // This creates the monorepo structure that CLI/TUI will be added to
      if (btsFrontends.length > 0) {
        const result = await this.bootstrapBetterTStackProject(
          name,
          btsFrontends,
          options,
          workingDir
        );
        if (!result.success) throw new Error(result.message);

        // Get the actual project path from Better-T-Stack result
        // This is the full path where the project was created
        projectPath = join(workingDir, name);
        results.push(result.message);
      } else if (isMonorepo) {
        // Create monorepo structure manually if no BTS frontends
        // (e.g., just cli + tui with no web/native)
        mkdirSync(projectPath, { recursive: true });
        mkdirSync(join(projectPath, "apps"), { recursive: true });
        logger.info(`📁 Created monorepo structure at ${projectPath}`);
      }

      // Step 2: AFTER Better-T-Stack creates the structure, add custom frontends
      // These get added into the apps/ directory that Better-T-Stack created
      for (const frontend of customFrontends) {
        if (frontend === "cli") {
          const result = await this.addCliToProject(
            name,
            projectPath,
            isMonorepo,
            options
          );
          results.push(result.message);
        }

        if (frontend === "medusa") {
          const result = await this.addMedusaToProject(
            name,
            projectPath,
            isMonorepo,
            options
          );
          results.push(result.message);
        }
      }

      return {
        success: true,
        message: results.join("\n"),
        projectPath,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        message: `Project creation failed: ${message}`,
      };
    }
  }

  /**
   * Bootstrap Better-T-Stack project with one or more frontends
   */
  private async bootstrapBetterTStackProject(
    name: string,
    frontends: BTSFrontend[],
    options: InitOptions,
    workingDir: string
  ): Promise<{ success: boolean; message: string; projectPath: string }> {
    const backend = options.backend || "hono";
    const isConvex = backend === "convex";
    const isNoBackend = backend === "none";

    const btsConfig: BTSConfig = {
      projectName: options.name || options.projectName || name,
      frontend: frontends.length === 1 ? frontends[0] : frontends, // Pass array if multiple
      backend: (backend as BTSConfig["backend"]) || "hono",
      database: isNoBackend || isConvex
        ? "none"
        : (options.database as BTSConfig["database"]) || "sqlite",
      auth: (options.noAuth || options.backend === "none"
        ? "none"
        : options.auth || "better-auth") as BTSConfig["auth"],
      addons: (options.addons as BTSConfig["addons"]) || ["turborepo"],
      runtime: isNoBackend || isConvex || backend === "self"
        ? "none"
        : (options.runtime as BTSConfig["runtime"]) || "node",
      api: (options.api as BTSConfig["api"]) || "none",
      payments: (options.payment as BTSConfig["payments"]) || "none",
      orm: isNoBackend || isConvex || options.database === "none"
        ? "none"
        : (options.orm as BTSConfig["orm"]) || "drizzle",
      dbSetup: (isNoBackend || isConvex
        ? "none"
        : options.dbSetup || "none") as BTSConfig["dbSetup"],
      packageManager:
        (options.packageManager as BTSConfig["packageManager"]) || "npm",
      git: !options.noGit,
      webDeploy: (options.webDeploy as BTSConfig["webDeploy"]) || "none",
      serverDeploy:
        (options.serverDeploy as BTSConfig["serverDeploy"]) || "none",
      install: !options.noInstall,
      examples: (options.examples as BTSConfig["examples"]) || ["none"],
      template: options.template as BTSConfig["template"], // Optional shortcut, don't default
      // Non-interactive options (yes: true conflicts with explicit config)
      manualDb: true,
      renderTitle: false,
      includeDocs: options.includeDocs,
    };

    const result = await this.btsService.createProject(
      name,
      btsConfig,
      workingDir
    );
    return {
      success: result.success,
      message: result.message,
      projectPath: result.projectPath,
    };
  }

  /**
   * Add CLI app to project (standalone or monorepo)
   */
  private async addCliToProject(
    projectName: string,
    projectPath: string,
    isMonorepo: boolean,
    options: InitOptions
  ): Promise<{ success: boolean; message: string }> {
    const { bootstrapCliProject } = await import(
      "./bootstrap/cli-bootstrap.js"
    );

    const cliPath = isMonorepo ? join(projectPath, "apps", "cli") : projectPath;
    const cliName = isMonorepo ? `${projectName}-cli` : projectName;

    const result = await bootstrapCliProject({
      projectName: cliName,
      projectPath: cliPath,
      dependencyLevel: options.cliDeps || "standard",
      packageManager:
        (options.packageManager as "npm" | "pnpm" | "bun") || "npm",
      runtime: (options.runtime as "node" | "bun") || "node",
      typescript: true,
    });

    if (!result.success) throw new Error(result.message);

    return {
      success: true,
      message: isMonorepo
        ? `✅ CLI app added to apps/cli/`
        : `✅ CLI project "${projectName}" created successfully!`,
    };
  }

  /**
   * Add MedusaJS app to project (standalone or monorepo)
   */
  private async addMedusaToProject(
    projectName: string,
    projectPath: string,
    isMonorepo: boolean,
    options: InitOptions
  ): Promise<{ success: boolean; message: string }> {
    const { bootstrapMedusaProject } = await import(
      "./bootstrap/medusa-bootstrap.js"
    );

    const medusaPath = isMonorepo
      ? join(projectPath, "apps", "medusa")
      : projectPath;
    const medusaName = isMonorepo ? `${projectName}-medusa` : projectName;

    const result = await bootstrapMedusaProject({
      projectName: medusaName,
      projectPath: medusaPath,
      packageManager:
        (options.packageManager as "npm" | "pnpm" | "bun") || "npm",
      database: (options.database as "postgres" | "sqlite") || "sqlite",
      skipDb: options.noInstall, // Skip DB setup if not installing deps
      skipInstall: options.noInstall,
    });

    if (!result.success) throw new Error(result.message);

    return {
      success: true,
      message: isMonorepo
        ? `✅ MedusaJS app added to apps/medusa/`
        : `✅ MedusaJS project "${projectName}" created successfully!`,
    };
  }
}

// Export backward-compatible function
export async function runBetterTStackCLI(
  options: InitOptions,
  workingDirectory?: string
): Promise<{ success: boolean; message: string; projectPath?: string }> {
  const integration = new BetterTStackIntegration();
  return integration.createProject(
    options.projectName || options.name || "default-project",
    options,
    workingDirectory
  );
}
