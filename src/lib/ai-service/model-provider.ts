import { openai } from "@ai-sdk/openai";
import { anthropic } from "@ai-sdk/anthropic";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
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

  private getEnvConfig(provider: string) {
    const envConfigMap: Record<string, { apiKey?: string; baseURL?: string }> =
      {
        openai: {
          apiKey: process.env.OPENAI_API_KEY,
        },
        anthropic: {
          apiKey: process.env.ANTHROPIC_API_KEY,
        },
        openrouter: {
          apiKey: process.env.OPENROUTER_API_KEY,
          baseURL: "https://openrouter.ai/api/v1",
        },
        custom: {
          apiKey: process.env.CUSTOM_API_KEY,
          baseURL: process.env.CUSTOM_API_URL,
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
        const openRouterProvider = createOpenRouter({ apiKey });
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

      default:
        throw createStandardError(
          TaskOMaticErrorCodes.AI_CONFIGURATION_ERROR,
          `Unsupported provider: ${provider}`,
          {
            suggestions: [
              "Use one of the supported providers: 'openai', 'anthropic', 'openrouter', 'custom'.",
              "Run `task-o-matic config set-ai-provider <provider>`",
            ],
          }
        );
    }
  }
}