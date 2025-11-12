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
        message: `Better-T-Stack initialization failed: ${error instanceof Error ? error.message : "Unknown error"}`,
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
      examples: config.examples,
      disableAnalytics: true,
    };
  }

  private async saveBTSConfig(name: string, config: BTSConfig): Promise<void> {
    const taskOMaticDir = configManager.getTaskOMaticDir();
    const configPath = join(taskOMaticDir, `${name}-bts-config.json`);
    writeFileSync(
      configPath,
      JSON.stringify(
        {
          ...config,
          projectName: config.projectName || name,
          createdAt: new Date().toISOString(),
        },
        null,
        2
      )
    );
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
}

export async function runBetterTStackCLI(
  options: InitOptions,
  workingDirectory?: string
): Promise<{ success: boolean; message: string }> {
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
  };

  const result = await btsService.createProject(
    options.projectName || options.name || "",
    btsConfig,
    workingDirectory
  );

  return { success: result.success, message: result.message };
}
