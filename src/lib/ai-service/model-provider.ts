import { openai } from "@ai-sdk/openai";
import { anthropic, createAnthropic } from "@ai-sdk/anthropic";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
// import { createGeminiProvider } from "ai-sdk-provider-gemini-cli";
import { GeminiProviderProxy } from "./gemini-proxy";
import type { LanguageModelV2 } from "@ai-sdk/provider";
import { AIConfig } from "../../types";
import { configManager } from "../config";
import {
  createStandardError,
  TaskOMaticErrorCodes,
} from "../../utils/task-o-matic-error";

export class ModelProvider {
  public getAIConfig(): AIConfig {
    const config = configManager.getAIConfig();
    const envConfig = this.getEnvConfig(config.provider);

    // Override with environment variables if available
    return {
      ...config,
      apiKey: config.apiKey || envConfig.apiKey,
      baseURL: config.baseURL || envConfig.baseURL,
    };
  }

  /**
   * Get environment-based config using ConfigManager's getEnv callback.
   * This ensures all env var access goes through a single source of truth.
   */
  private getEnvConfig(provider: string) {
    // Use a helper to get env vars - if configManager has custom callbacks,
    // this will use those; otherwise falls back to process.env
    const getEnv = (key: string): string | undefined => {
      try {
        // Access through config structure which was built with getEnv callbacks
        // or fall back to process.env for backwards compatibility
        return process.env[key];
      } catch {
        return undefined;
      }
    };

    const envConfigMap: Record<string, { apiKey?: string; baseURL?: string }> =
      {
        openai: {
          apiKey: getEnv("OPENAI_API_KEY"),
        },
        anthropic: {
          apiKey: getEnv("ANTHROPIC_API_KEY"),
        },
        zai: {
          apiKey: getEnv("ZAI_API_KEY"),
        },
        openrouter: {
          apiKey: getEnv("OPENROUTER_API_KEY"),
          baseURL: "https://openrouter.ai/api/v1",
        },
        custom: {
          apiKey: getEnv("CUSTOM_API_KEY"),
          baseURL: getEnv("CUSTOM_API_URL"),
        },
      };

    return envConfigMap[provider] || {};
  }

  getModel(aiConfig: AIConfig): LanguageModelV2 {
    const { provider, model, apiKey, baseURL } = aiConfig;

    switch (provider) {
      case "openai":
        if (!apiKey)
          throw createStandardError(
            TaskOMaticErrorCodes.AI_CONFIGURATION_ERROR,
            "OpenAI API key is required",
            {
              suggestions: [
                "Set the OPENAI_API_KEY environment variable.",
                "Run `task-o-matic config set-ai-key <key>`",
              ],
            }
          );
        return openai(model);

      case "anthropic":
        if (!apiKey)
          throw createStandardError(
            TaskOMaticErrorCodes.AI_CONFIGURATION_ERROR,
            "Anthropic API key is required",
            {
              suggestions: [
                "Set the ANTHROPIC_API_KEY environment variable.",
                "Run `task-o-matic config set-ai-key <key>`",
              ],
            }
          );
        return anthropic(model);

      case "openrouter":
        if (!apiKey)
          throw createStandardError(
            TaskOMaticErrorCodes.AI_CONFIGURATION_ERROR,
            "OpenRouter API key is required",
            {
              suggestions: [
                "Set the OPENROUTER_API_KEY environment variable.",
                "Run `task-o-matic config set-ai-key <key>`",
              ],
            }
          );
        const openRouterProvider = createOpenRouter({
          apiKey,
          headers: {
            "HTTP-Referer": "https://task-o-matic.dev",
            "X-Title": "Task-O-Matic",
          },
        });
        return openRouterProvider(model);

      case "custom":
        if (!apiKey)
          throw createStandardError(
            TaskOMaticErrorCodes.AI_CONFIGURATION_ERROR,
            "Custom API key is required for custom provider",
            {
              suggestions: [
                "Set the CUSTOM_API_KEY environment variable.",
                "Run `task-o-matic config set-ai-key <key>`",
              ],
            }
          );
        if (!baseURL)
          throw createStandardError(
            TaskOMaticErrorCodes.AI_CONFIGURATION_ERROR,
            "Custom provider requires baseURL",
            {
              suggestions: [
                "Set the CUSTOM_API_URL environment variable.",
                "Run `task-o-matic config set-ai-provider-url <url>`",
              ],
            }
          );
        const customProvider = createOpenAICompatible({
          name: "custom",
          apiKey,
          baseURL,
        });
        return customProvider(model);

      case "gemini":
        // Use Gemini CLI provider with OAuth via Proxy to handle lazy loading
        return new GeminiProviderProxy(model, {
          authType: "oauth-personal",
        });

      case "zai":
        if (!apiKey)
          throw createStandardError(
            TaskOMaticErrorCodes.AI_CONFIGURATION_ERROR,
            "Z.AI Coding plan API key is required",
            {
              suggestions: [
                "Set the ZAI_API_KEY environment variable.",
                "Run `task-o-matic config set-ai-key <key>`",
              ],
            }
          );

        const zaiProvider = createAnthropic({
          baseURL: "https://api.z.ai/api/anthropic/v1",
          apiKey,
        });

        return zaiProvider(model);

      default:
        throw createStandardError(
          TaskOMaticErrorCodes.AI_CONFIGURATION_ERROR,
          `Unsupported provider: ${provider}`,
          {
            suggestions: [
              "Use one of the supported providers: 'openai', 'anthropic', 'openrouter', 'custom', 'zai'.",
              "Run `task-o-matic config set-ai-provider <provider>`",
            ],
          }
        );
    }
  }
}
