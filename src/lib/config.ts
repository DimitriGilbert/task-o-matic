import { join, resolve } from "path";
import { cwd } from "process";
import { AIConfig, EnvAIConfig, ProviderDefaults, AIProvider } from "../types";
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "fs";
import { config as dotenvConfig } from "dotenv";
import { validateConfig, validatePartialAIConfig } from "./config-validation";

export interface Config {
  ai: AIConfig;
  workingDirectory?: string;
}

export interface ConfigCallbacks {
  read: (key: string) => Promise<string | null>;
  write: (key: string, value: string) => Promise<void>;
  getEnv: (key: string) => string | undefined;
}

// Provider-specific sensible defaults for 2025
const PROVIDER_DEFAULTS: ProviderDefaults = {
  openrouter: {
    model: "z-ai/glm-4.6",
    maxTokens: 32768,
    temperature: 0.5,
  },
  anthropic: {
    model: "claude-sonnet-4.5",
    maxTokens: 32768,
    temperature: 0.5,
  },
  openai: {
    model: "gpt-5",
    maxTokens: 32768,
    temperature: 0.5,
  },
  custom: {
    model: "llama-3.3-70b",
    maxTokens: 32768,
    temperature: 0.5,
  },
};

function getApiKeyFromEnv(
  provider: AIProvider,
  getEnv: (key: string) => string | undefined
): string | undefined {
  switch (provider) {
    case "openrouter":
      return getEnv("OPENROUTER_API_KEY");
    case "anthropic":
      return getEnv("ANTHROPIC_API_KEY");
    case "openai":
      return getEnv("OPENAI_API_KEY");
    case "custom":
      return getEnv("CUSTOM_API_KEY");
    default:
      return undefined;
  }
}

export function createDefaultConfigCallbacks(
  workingDir: string = cwd()
): ConfigCallbacks {
  // Ensure dotenv is loaded for the default callbacks
  const envPath = join(workingDir, ".env");
  if (existsSync(envPath)) {
    dotenvConfig({ path: envPath });
  }

  return {
    read: async (key: string) => {
      // If key is relative, assume it's in .task-o-matic dir relative to workingDir
      // But ConfigManager usually passes "config.json"
      // We need to resolve it.
      // For default callbacks, we replicate the original behavior:
      // .task-o-matic/config.json in workingDir

      const configPath = join(workingDir, ".task-o-matic", key);
      if (existsSync(configPath)) {
        return readFileSync(configPath, "utf-8");
      }
      return null;
    },
    write: async (key: string, value: string) => {
      const taskOMaticDir = join(workingDir, ".task-o-matic");
      if (!existsSync(taskOMaticDir)) {
        mkdirSync(taskOMaticDir, { recursive: true });
      }
      const configPath = join(taskOMaticDir, key);
      writeFileSync(configPath, value, "utf-8");
    },
    getEnv: (key: string) => process.env[key],
  };
}

export class ConfigManager {
  private config: Config | null = null;
  private customWorkingDir: string | null = null;
  private callbacks: ConfigCallbacks;

  constructor(callbacks?: ConfigCallbacks, workingDirectory?: string) {
    if (workingDirectory) {
      this.customWorkingDir = resolve(workingDirectory);
    }

    // If callbacks not provided, create defaults using the working directory
    this.callbacks =
      callbacks || createDefaultConfigCallbacks(this.getWorkingDirectory());

    // We cannot await in constructor.
    // Consumers MUST call load() or ensure it's loaded before accessing config.
    // For backward compatibility in CLI (where sync access was common),
    // we might need a way to force sync load if using default callbacks?
    // But we want to support async callbacks.
    // So we enforce async initialization pattern.
  }

  setWorkingDirectory(dir: string): void {
    this.customWorkingDir = resolve(dir);
    // Re-create default callbacks to point to new dir
    this.callbacks = createDefaultConfigCallbacks(this.getWorkingDirectory());
    // Invalidate config so next access requires reload
    this.config = null;
  }

  setCallbacks(callbacks: ConfigCallbacks): void {
    this.callbacks = callbacks;
    this.config = null;
  }

  getWorkingDirectory(): string {
    return this.customWorkingDir || cwd();
  }

  getTaskOMaticDir(): string {
    return join(this.getWorkingDirectory(), ".task-o-matic");
  }

  private loadEnvConfig(): Partial<AIConfig> {
    const provider =
      (this.callbacks.getEnv("AI_PROVIDER")?.toLowerCase() as AIProvider) ||
      "openrouter";
    const defaults =
      PROVIDER_DEFAULTS[provider] || PROVIDER_DEFAULTS.openrouter;

    const maxTokensStr = this.callbacks.getEnv("AI_MAX_TOKENS");
    const tempStr = this.callbacks.getEnv("AI_TEMPERATURE");
    const modelStr = this.callbacks.getEnv("AI_MODEL");

    return {
      provider,
      model: modelStr || defaults.model,
      maxTokens: maxTokensStr ? parseInt(maxTokensStr) : defaults.maxTokens,
      temperature: tempStr ? parseFloat(tempStr) : defaults.temperature,
      apiKey: getApiKeyFromEnv(provider, this.callbacks.getEnv),
    };
  }

  async load(): Promise<Config> {
    const envConfig = this.loadEnvConfig();

    const defaultConfig: Config = {
      ai: {
        provider: "openrouter",
        model: "z-ai/glm-4.6",
        maxTokens: 32768,
        temperature: 0.5,
        ...envConfig,
      },
    };

    try {
      // Use relative path "config.json" - callbacks handle resolution
      const configData = await this.callbacks.read("config.json");

      if (configData) {
        const fileConfig = JSON.parse(configData);
        const mergedConfig = {
          ...defaultConfig,
          ...fileConfig,
          ai: { ...defaultConfig.ai, ...fileConfig.ai, ...envConfig },
        };

        // Validate the merged configuration
        const validatedConfig = validateConfig(mergedConfig);
        this.config = validatedConfig;

        if (this.config && this.config.workingDirectory) {
          this.customWorkingDir = this.config.workingDirectory;
        }
      } else {
        // Validate default config too
        this.config = validateConfig(defaultConfig);
      }
    } catch (error) {
      console.warn("Failed to read or validate config, using defaults:", error);
      // Even defaults should be validated
      this.config = validateConfig(defaultConfig);
    }

    return this.config!;
  }

  async save(): Promise<void> {
    if (!this.config) {
      throw new Error("Config not loaded, cannot save.");
    }
    try {
      await this.callbacks.write(
        "config.json",
        JSON.stringify(this.config, null, 2)
      );
    } catch (error) {
      console.error("Failed to save config:", error);
      throw error;
    }
  }

  getConfig(): Config {
    if (!this.config) {
      // If we are here, it means load() wasn't called or hasn't finished.
      // Since we can't be async here, we must throw or return defaults.
      // Returning defaults might hide issues.
      // Throwing forces users to await load().
      throw new Error(
        "Config not loaded. Call await configManager.load() first."
      );
    }
    return this.config;
  }

  getAIConfig(): AIConfig {
    return this.getConfig().ai;
  }

  async setAIConfig(aiConfig: Partial<AIConfig>): Promise<void> {
    if (!this.config) {
      await this.load();
    }

    // Validate the partial config before merging
    const validatedPartial = validatePartialAIConfig(aiConfig);

    // Merge and validate the full config
    const mergedAIConfig = { ...this.config!.ai, ...validatedPartial };
    const validatedConfig = validateConfig({
      ...this.config!,
      ai: mergedAIConfig,
    });

    this.config = validatedConfig;
    await this.save();
  }

  setConfig(config: Config): void {
    this.config = config;
  }

  // Helper for legacy code that might need path (deprecated for direct use)
  getConfigFilePath(): string {
    return join(this.getTaskOMaticDir(), "config.json");
  }
}

export const configManager = new ConfigManager();

/**
 * Helper function to set working directory and reload config.
 * Combines the common pattern of setWorkingDirectory + load.
 *
 * @param dir - Working directory path
 * @param manager - ConfigManager instance (defaults to singleton)
 * @returns Loaded config
 *
 * @example
 * ```typescript
 * await setupWorkingDirectory("/path/to/project");
 * ```
 */
export async function setupWorkingDirectory(
  dir: string,
  manager: ConfigManager = configManager
): Promise<Config> {
  manager.setWorkingDirectory(dir);
  return await manager.load();
}
