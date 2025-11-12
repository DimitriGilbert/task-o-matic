import { openai } from "@ai-sdk/openai";
import { anthropic } from "@ai-sdk/anthropic";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import type { LanguageModelV2 } from "@ai-sdk/provider";
import { AIConfig } from "../../types";
import { configManager } from "../config";

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
        if (!apiKey) throw new Error("OpenAI API key is required");
        return openai(model);

      case "anthropic":
        if (!apiKey) throw new Error("Anthropic API key is required");
        return anthropic(model);

      case "openrouter":
        if (!apiKey) throw new Error("OpenRouter API key is required");
        const openRouterProvider = createOpenRouter({ apiKey });
        return openRouterProvider(model);

      case "custom":
        if (!apiKey) throw new Error("Custom API key is required");
        if (!baseURL) throw new Error("Custom provider requires baseURL");
        const customProvider = createOpenAICompatible({
          name: "custom",
          apiKey,
          baseURL,
        });
        return customProvider(model);

      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
  }
}