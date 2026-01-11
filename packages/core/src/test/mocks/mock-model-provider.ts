import { AIConfig } from "../../types";

export class MockModelProvider {
  private config: AIConfig = {
    provider: "openrouter",
    model: "anthropic/claude-3.5-sonnet",
    apiKey: "test-api-key",
    baseURL: "https://openrouter.ai/api/v1",
    maxTokens: 4096,
    temperature: 0.7,
    context7Enabled: true,
  };

  getAIConfig(): AIConfig {
    return this.config;
  }

  setAIConfig(config: Partial<AIConfig>): void {
    this.config = { ...this.config, ...config };
  }
}
