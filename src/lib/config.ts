import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { cwd } from "process";
import { join, resolve } from "path";
import { config as dotenvConfig } from "dotenv";
import { AIConfig, EnvAIConfig, ProviderDefaults, AIProvider } from "../types";

export interface Config {
  ai: AIConfig;
  workingDirectory?: string;
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

function getApiKeyFromEnv(provider: AIProvider): string | undefined {
  switch (provider) {
    case "openrouter":
      return process.env.OPENROUTER_API_KEY;
    case "anthropic":
      return process.env.ANTHROPIC_API_KEY;
    case "openai":
      return process.env.OPENAI_API_KEY;
    case "custom":
      return process.env.CUSTOM_API_KEY;
    default:
      return undefined;
  }
}

export class ConfigManager {
  private config: Config | null = null;
  private customWorkingDir: string | null = null;

  constructor(workingDirectory?: string) {
    if (workingDirectory) {
      this.setWorkingDirectory(workingDirectory);
    }
    this.load();
  }

  setWorkingDirectory(dir: string): void {
    this.customWorkingDir = resolve(dir);
    // Reload config when directory changes
    this.load(); 
  }

  getWorkingDirectory(): string {
    return this.customWorkingDir || cwd();
  }

  ensureTaskOMaticDir(): void {
    const taskOMaticDir = this.getTaskOMaticDir();
    if (!existsSync(taskOMaticDir)) {
      mkdirSync(taskOMaticDir, { recursive: true });
    }
  }

  private loadEnvConfig(): Partial<AIConfig> {
    const env: EnvAIConfig = process.env as EnvAIConfig;
    const provider = (env.AI_PROVIDER?.toLowerCase() as AIProvider) || "openrouter";
    const defaults = PROVIDER_DEFAULTS[provider] || PROVIDER_DEFAULTS.openrouter;
    
    return {
      provider,
      model: env.AI_MODEL || defaults.model,
      maxTokens: env.AI_MAX_TOKENS ? parseInt(env.AI_MAX_TOKENS) : defaults.maxTokens,
      temperature: env.AI_TEMPERATURE ? parseFloat(env.AI_TEMPERATURE) : defaults.temperature,
      apiKey: getApiKeyFromEnv(provider),
    };
  }

  load(): Config {
    const workingDir = this.getWorkingDirectory();
    const envPath = join(workingDir, '.env');
    if (existsSync(envPath)) {
      dotenvConfig({ path: envPath });
    }

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

    const configFilePath = this.getConfigFilePath();
    if (existsSync(configFilePath)) {
      try {
        const configData = readFileSync(configFilePath, "utf-8");
        const fileConfig = JSON.parse(configData);
        this.config = { 
          ...defaultConfig, 
          ...fileConfig,
          ai: { ...defaultConfig.ai, ...fileConfig.ai, ...envConfig }
        };
        if (this.config && this.config.workingDirectory) {
          this.customWorkingDir = this.config.workingDirectory;
        }
      } catch (error) {
        console.warn("Failed to read config file, using defaults:", error);
        this.config = defaultConfig;
      }
    } else {
      this.config = defaultConfig;
    }

    return this.config!;
  }

  save(): void {
    if (!this.config) {
      throw new Error("Config not loaded, cannot save.");
    }
    this.ensureTaskOMaticDir();
    try {
      const configFilePath = this.getConfigFilePath();
      writeFileSync(configFilePath, JSON.stringify(this.config, null, 2));
    } catch (error) {
      console.error("Failed to save config:", error);
    }
  }

  getConfig(): Config {
    if (!this.config) {
      return this.load();
    }
    return this.config;
  }

  getAIConfig(): AIConfig {
    return this.getConfig().ai;
  }

  setAIConfig(aiConfig: Partial<AIConfig>): void {
    if (!this.config) {
      this.load();
    }
    this.config!.ai = { ...this.config!.ai, ...aiConfig };
    this.save();
  }

  setConfig(config: Config): void {
    this.config = config;
  }

  getTaskOMaticDir(): string {
    return join(this.getWorkingDirectory(), ".task-o-matic");
  }

    getConfigFilePath(): string {

      return join(this.getTaskOMaticDir(), "config.json");

    }

  }

  

  export const configManager = new ConfigManager();

  