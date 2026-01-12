import assert from "assert";
import { ConfigManager, Config, ConfigCallbacks } from "../../lib/config";
import { TaskOMaticErrorCodes } from "../../utils/task-o-matic-error";

describe("ConfigManager", () => {
  let mockCallbacks: ConfigCallbacks;
  let mockStorage: Record<string, string>;
  let mockEnv: Record<string, string>;

  beforeEach(() => {
    mockStorage = {};
    mockEnv = {};
    mockCallbacks = {
      read: async (key: string) => mockStorage[key] || null,
      write: async (key: string, value: string) => {
        mockStorage[key] = value;
      },
      getEnv: (key: string) => mockEnv[key],
    };
  });

  it("should load default configuration when no config file exists", async () => {
    const configManager = new ConfigManager(mockCallbacks);
    const config = await configManager.load();

    assert.strictEqual(config.ai.provider, "openrouter"); // Default
    assert.strictEqual(config.ai.model, "z-ai/glm-4.6"); // Default
  });

  it("should load configuration from file", async () => {
    const storedConfig: Config = {
      ai: {
        provider: "openai",
        model: "gpt-4",
        apiKey: "sk-test",
        maxTokens: 1000,
        temperature: 0.1,
      },
    };
    mockStorage["config.json"] = JSON.stringify(storedConfig);

    const configManager = new ConfigManager(mockCallbacks);
    const config = await configManager.load();

    assert.strictEqual(config.ai.provider, "openai");
    assert.strictEqual(config.ai.model, "gpt-4");
    assert.strictEqual(config.ai.apiKey, "sk-test");
  });

  it("should override config with environment variables", async () => {
    const storedConfig: Config = {
      ai: {
        provider: "openai",
        model: "gpt-4",
        apiKey: "sk-test",
      },
    };
    mockStorage["config.json"] = JSON.stringify(storedConfig);
    mockEnv["AI_PROVIDER"] = "anthropic";
    mockEnv["ANTHROPIC_API_KEY"] = "sk-ant-test";

    // Note: ConfigManager loads defaults based on provider, but file config overrides defaults,
    // and env config overrides file config?
    // Let's check implementation:
    // ... fileConfig ... envConfig
    // ai: { ...defaultConfig.ai, ...fileConfig.ai, ...envConfig }
    // So envConfig wins.

    const configManager = new ConfigManager(mockCallbacks);
    const config = await configManager.load();

    assert.strictEqual(config.ai.provider, "anthropic");
    assert.strictEqual(config.ai.apiKey, "sk-ant-test");
  });

  it("should validate configuration", async () => {
    const configManager = new ConfigManager(mockCallbacks);

    // Invalid provider
    const result1 = configManager.validate({
      ai: { provider: "invalid" as any, model: "test-model" },
    });
    assert.strictEqual(result1.valid, false);
    assert.ok(result1.errors[0].includes("Invalid provider"));

    // Valid provider
    const result2 = configManager.validate({
      ai: { provider: "openai", model: "gpt-5.2-mini" },
    });
    assert.strictEqual(result2.valid, true);
  });

  it("should save configuration", async () => {
    const configManager = new ConfigManager(mockCallbacks);
    await configManager.load(); // Load defaults

    const newConfig: Config = {
      ai: {
        provider: "custom",
        model: "my-model",
        apiKey: "secret",
      },
    };
    configManager.setConfig(newConfig);
    await configManager.save();

    const saved = JSON.parse(mockStorage["config.json"]);
    assert.strictEqual(saved.ai.provider, "custom");
    assert.strictEqual(saved.ai.model, "my-model");
  });

  it("should throw error when accessing config before load", () => {
    const configManager = new ConfigManager(mockCallbacks);
    assert.throws(
      () => {
        configManager.getConfig();
      },
      (err: any) => {
        return err.code === TaskOMaticErrorCodes.CONFIGURATION_ERROR;
      }
    );
  });

  it("should set AI config partially and save", async () => {
    const configManager = new ConfigManager(mockCallbacks);
    await configManager.load();

    await configManager.setAIConfig({
      temperature: 0.9,
      maxTokens: 500,
    });

    const saved = JSON.parse(mockStorage["config.json"]);
    assert.strictEqual(saved.ai.temperature, 0.9);
    assert.strictEqual(saved.ai.maxTokens, 500);
    // Should preserve other defaults
    assert.strictEqual(saved.ai.provider, "openrouter");
  });

  it("should update callbacks when changing working directory", () => {
    const configManager = new ConfigManager();
    const initialDir = configManager.getWorkingDirectory();

    configManager.setWorkingDirectory("/new/path");
    assert.notStrictEqual(configManager.getWorkingDirectory(), initialDir);

    // Should reset config
    assert.throws(() => configManager.getConfig());
  });
});
