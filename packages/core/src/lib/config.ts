import { join, resolve } from "path";
import { cwd } from "process";
import { AIConfig, EnvAIConfig, ProviderDefaults, AIProvider } from "../types";
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "fs";
import { config as dotenvConfig } from "dotenv";
import { validateConfig, validatePartialAIConfig } from "./config-validation";
import {
  createStandardError,
  TaskOMaticErrorCodes,
} from "../utils/task-o-matic-error";
import { logger } from "./logger";

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
// Externalized to JSON for easy updates
import PROVIDER_DEFAULTS from "./provider-defaults.json";
export { PROVIDER_DEFAULTS as providerDefaults };

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
    case "zai":
      return getEnv("ZAI_API_KEY");
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
    const providerStr = this.callbacks.getEnv("AI_PROVIDER")?.toLowerCase();
    const provider = providerStr ? (providerStr as AIProvider) : undefined;
    
    // Check if provider is valid if set
    // (This validation is loose here, strict validation happens in validateConfig)

    const maxTokensStr = this.callbacks.getEnv("AI_MAX_TOKENS");
    const tempStr = this.callbacks.getEnv("AI_TEMPERATURE");
    const modelStr = this.callbacks.getEnv("AI_MODEL");

    const config: Partial<AIConfig> = {};
    if (provider) config.provider = provider;
    if (modelStr) config.model = modelStr;
    if (maxTokensStr) config.maxTokens = parseInt(maxTokensStr);
    if (tempStr) config.temperature = parseFloat(tempStr);
    
    // API Key logic needs to know the provider. 
    // If provider is not in env, we should check the resolved provider... 
    // But here we only return partial env overrides.
    // The API key fetching logic in getApiKeyFromEnv depends on the provider.
    // If the provider comes from file, we can't know it here easily if we are just returning overrides.
    // However, getApiKeyFromEnv is a helper. 
    
    // We can fetch ALL potential API keys? No, that's messy.
    // Or we just fetch the API key if AI_PROVIDER is set? 
    // If AI_PROVIDER is NOT set, we don't know which env var to read for the key yet 
    // (unless we assume the default or the file one).
    
    // If we return undefined for apiKey here, it might overwrite the file one? 
    // No, undefined properties don't overwrite if we use spread correctly?
    // { ...a, ...b } where b has undefined properties... 
    // In JS/TS spread { ...{a:1}, ...{a: undefined} } results in {a: undefined}. 
    // So we must NOT include undefined keys in the returned object.
    
    if (provider) {
        const key = getApiKeyFromEnv(provider, this.callbacks.getEnv);
        if (key) config.apiKey = key;
    } else {
        // If provider not in env, we might miss the API key from env if the user 
        // intended to use file-provider + env-key.
        // This is a bit tricky with the current structure.
        // But let's stick to the fix for provider override first.
        // We will deal with API key resolution merging later or assume user sets both in env.
        
        // Actually, we can check all possible keys?
        // Or better: The merge logic in load() is complex.
        
        // Let's defer API key resolution to after we know the final provider?
        // But load() does: ai: { ...defaultConfig.ai, ...fileConfig.ai, ...envConfig }
        
        // If I change loadEnvConfig to NOT return apiKey if provider is missing, 
        // then apiKey will come from fileConfig or defaultConfig.
    }

    return config;
  }

  async load(): Promise<Config> {
    const envConfig = this.loadEnvConfig();

    // Default provider is openrouter
    const defaultProvider = envConfig.provider || "openrouter";
    // We can try to get API key for default provider if not in envConfig
    let defaultApiKey = envConfig.apiKey;
    if (!defaultApiKey) {
        defaultApiKey = getApiKeyFromEnv(defaultProvider, this.callbacks.getEnv);
    }

    const defaultConfig: Config = {
      ai: {
        provider: "openrouter",
        model: "z-ai/glm-4.6",
        maxTokens: 32768,
        temperature: 0.5,
        apiKey: defaultApiKey, // This might be overwritten by file or envConfig later
      },
    };

    try {
      // Use relative path "config.json" - callbacks handle resolution
      const configData = await this.callbacks.read("config.json");

      if (configData) {
        const fileConfig = JSON.parse(configData);
        
        // We need to resolve the final provider to get the correct API key from env 
        // if it wasn't provided in envConfig.
        const finalProvider = envConfig.provider || fileConfig.ai?.provider || defaultConfig.ai.provider;
        
        // If envConfig didn't provide a key, check if we can get it based on finalProvider
        let finalApiKey = envConfig.apiKey;
        if (!finalApiKey) {
             finalApiKey = getApiKeyFromEnv(finalProvider, this.callbacks.getEnv);
        }

        // We construct a refined envConfig that includes the correct API key
        const refinedEnvConfig = { ...envConfig };
        if (finalApiKey) {
            refinedEnvConfig.apiKey = finalApiKey;
        }

        const mergedConfig = {
          ...defaultConfig,
          ...fileConfig,
          ai: { ...defaultConfig.ai, ...fileConfig.ai, ...refinedEnvConfig },
        };

        // Validate the merged configuration
        const validatedConfig = validateConfig(mergedConfig);
        this.config = validatedConfig;

        if (this.config && this.config.workingDirectory) {
          this.customWorkingDir = this.config.workingDirectory;
        }
      } else {
        // Apply envConfig to defaults
        const mergedConfig = {
            ...defaultConfig,
            ai: { ...defaultConfig.ai, ...envConfig }
        };
        this.config = validateConfig(mergedConfig);
      }
    } catch (error) {
      logger.warn(`Failed to read or validate config, using defaults: ${error}`);
      // Even defaults should be validated
      this.config = validateConfig(defaultConfig);
    }

    return this.config!;
  }

  async save(): Promise<void> {
    if (!this.config) {
      throw createStandardError(
        TaskOMaticErrorCodes.CONFIGURATION_ERROR,
        "Config not loaded, cannot save.",
        {
          suggestions: ["Call await configManager.load() before saving"],
        }
      );
    }
    try {
      await this.callbacks.write(
        "config.json",
        JSON.stringify(this.config, null, 2)
      );
    } catch (error) {
      logger.error(`Failed to save config: ${error}`);
      throw error;
    }
  }

  getConfig(): Config {
    if (!this.config) {
      // If we are here, it means load() wasn't called or hasn't finished.
      // Since we can't be async here, we must throw or return defaults.
      // Returning defaults might hide issues.
      // Throwing forces users to await load().
      throw createStandardError(
        TaskOMaticErrorCodes.CONFIGURATION_ERROR,
        "Config not loaded. Call await configManager.load() first.",
        {
          context: "Configuration must be loaded before access",
          suggestions: [
            "Call await configManager.load() first",
            "Check initialization order",
          ],
        }
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

  /**
   * Validate configuration independently of load().
   * Can be used to validate config before applying changes.
   */
  validate(configToValidate?: Partial<Config>): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    const config = configToValidate || this.config;
    if (!config) {
      return {
        valid: false,
        errors: [
          "No configuration to validate. Either provide a config or call load() first.",
        ],
      };
    }

    // Validate AI config
    if (config.ai) {
      const { provider, model, apiKey, maxTokens, temperature } = config.ai;

      // Validate provider
      if (
        provider &&
        ![
          "openrouter",
          "anthropic",
          "openai",
          "custom",
          "gemini",
          "zai",
        ].includes(provider)
      ) {
        errors.push(
          `Invalid provider: ${provider}. Must be one of: openrouter, anthropic, openai, custom, gemini, zai`
        );
      }

      // Validate model
      if (model !== undefined && typeof model !== "string") {
        errors.push("Model must be a string");
      }

      // Validate maxTokens
      if (maxTokens !== undefined) {
        if (
          typeof maxTokens !== "number" ||
          maxTokens < 1 ||
          maxTokens > 200000
        ) {
          errors.push("maxTokens must be a number between 1 and 200000");
        }
      }

      // Validate temperature
      if (temperature !== undefined) {
        if (
          typeof temperature !== "number" ||
          temperature < 0 ||
          temperature > 2
        ) {
          errors.push("temperature must be a number between 0 and 2");
        }
      }

      // Warn about missing API key (not an error, just a warning)
      if (!apiKey && provider !== "custom") {
        // This is a soft validation - API key can be set via env vars
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
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
