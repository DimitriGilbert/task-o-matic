## TECHNICAL BULLETIN NO. 008
### AI CONFIG BUILDER - AI CONFIGURATION CONSTRUCTION SYSTEM

**DOCUMENT ID:** `task-o-matic-ai-config-builder-v1`  
**CLEARANCE:** `All Personnel`  
**MANDATORY COMPLIANCE:** `Yes`

### ⚠️ CRITICAL SURVIVAL NOTICE
Citizen, ignore this AI configuration builder and your AI operations become a chaotic mess in the wasteland. Provider configurations clash, model selections become random, and your AI service turns to radioactive static. This is your AI configuration foundation.

### TYPE SYSTEM ARCHITECTURE

The AI configuration builder provides **standardized AI configuration creation** from CLI options and environment variables. It uses **interface composition** and **validation patterns** to create type-safe AI configurations. The architecture supports:

- **Option Composition**: Build complex AI configs from simple options
- **Environment Integration**: Load from environment variables with fallbacks
- **Provider Defaults**: Built-in defaults for each AI provider
- **Validation**: Comprehensive validation of AI configurations
- **Type Safety**: Compile-time validation and runtime guarantees

This design enables **predictable AI configuration** while maintaining flexibility for different use cases.

### COMPLETE TYPE DOCUMENTATION

#### AIOptions Interface

```typescript
export interface AIOptions {
  aiProvider?: string;
  aiModel?: string;
  aiKey?: string;
  aiProviderUrl?: string;
  aiReasoning?: string;
}
```

**Purpose**: Options for AI provider configuration

**Properties**:
- **aiProvider** (Optional, string): AI provider name ("openai", "anthropic", "openrouter", "custom")
- **aiModel** (Optional, string): Model name to use
- **aiKey** (Optional, string): API authentication key
- **aiProviderUrl** (Optional, string): Custom endpoint URL for custom providers
- **aiReasoning** (Optional, string): Reasoning token limit for OpenRouter

**Usage Examples**:
```typescript
// From CLI options
const cliOptions = {
  aiProvider: "anthropic",
  aiModel: "claude-3.5-sonnet",
  aiKey: "sk-ant-..."
};

// From environment variables
const envConfig = {
  AI_PROVIDER: "anthropic",
  AI_MODEL: "claude-3.5-sonnet",
  ANTHROPIC_API_KEY: "sk-ant-..."
};

// Custom provider with reasoning
const customConfig: AIOptions = {
  aiProvider: "custom",
  aiModel: "llama-3-70b",
  aiProviderUrl: "https://api.custom-ai.com/v1",
  aiReasoning: "8000"
};
```

#### buildAIConfig Function

```typescript
export function buildAIConfig(options?: AIOptions): Partial<AIConfig> {
  if (!options) return {};

  return {
    ...(options.aiProvider && {
      provider: options.aiProvider as
        | "openai"
        | "anthropic"
        | "openrouter"
        | "custom",
    }),
    ...(options.aiModel && {
      model: options.aiModel
    }),
    ...(options.aiKey && {
      apiKey: options.aiKey
    }),
    ...(options.aiProviderUrl && {
      baseURL: options.aiProviderUrl
    }),
    ...(options.aiReasoning && {
      reasoning: { maxTokens: parseInt(options.aiReasoning, 10) }
    })
  };
  }
}
```

**Usage Examples**:
```typescript
// Build from CLI options
const config1 = buildAIConfig({
  aiProvider: "anthropic",
  aiModel: "claude-3.5-sonnet",
  aiKey: process.env.ANTHROPIC_API_KEY
});

// Build from environment with fallback
const config2 = buildAIConfig({
  aiProvider: process.env.AI_PROVIDER || "anthropic",
  aiModel: process.env.AI_MODEL || "claude-3.5-sonnet"
});

// Build with custom provider
const config3 = buildAIConfig({
  aiProvider: "custom",
  aiModel: "llama-3-70b",
  aiProviderUrl: "https://api.custom-ai.com/v1",
  aiReasoning: "8000"
});

// Merge with defaults
const mergedConfig = buildAIConfig({
  aiProvider: "openrouter",
  aiModel: "gpt-4o",
  aiKey: "sk-or-..."
});

// Override specific settings
const overrideConfig = buildAIConfig({
  aiProvider: "anthropic",
  aiModel: "claude-3.5-sonnet",
  aiReasoning: "10000"
});
```

### FUNCTION DOCUMENTATION

#### buildAIConfig Function

```typescript
export function buildAIConfig(options?: AIOptions): Partial<AIConfig> {
  if (!options) return {};

  return {
    ...(options.aiProvider && {
      provider: options.aiProvider as
        | "openai"
        | "anthropic"
        | "openrouter"
        | "custom",
    }),
    ...(options.aiModel && {
      model: options.aiModel
    }),
    ...(options.aiKey && {
      apiKey: options.aiKey
    }),
    ...(options.aiProviderUrl && {
      baseURL: options.aiProviderUrl
    }),
    ...(options.aiReasoning && {
      reasoning: { 
        maxTokens: parseInt(options.aiReasoning, 10) 
      }
    })
  };
  }
}
```

**Parameters**:
- **options** (Optional, AIOptions): Partial AI options to merge
- **Returns**: Complete AI configuration object

**Returns**: Partial AIConfig object with merged configuration

**Error Handling**: Throws `TaskOMaticError` if validation fails

**Integration Examples**:
```typescript
// Service layer usage
class AIService {
  private config: AIConfig;
  
  constructor() {
    this.config = buildAIConfig();
  }
  
  updateConfig(newConfig: Partial<AIConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
  
  getConfig(): AIConfig {
    return this.config;
  }
}

// CLI command usage
const aiConfig = buildAIConfig(commandLineOptions);
await aiService.updateConfig(aiConfig);

// Environment-based configuration
const envConfig = buildAIConfig();
await aiService.updateConfig(envConfig);
```

### INTEGRATION PROTOCOLS

#### Service Layer Integration

```typescript
// services/ai-service.ts
import { buildAIConfig } from '../utils/ai-config-builder';

export class AIService {
  private config: AIConfig;
  
  constructor() {
    this.config = buildAIConfig();
  }
  
  updateConfig(newConfig: Partial<AIConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
  
  getConfig(): AIConfig {
    return this.config;
  }
}
```

#### CLI Command Integration

```typescript
// commands/tasks/enhance.ts
import { buildAIConfig } from '../utils/ai-config-builder';

export async function enhanceTask(taskId: string, options: any): Promise<void> {
  const aiConfig = buildAIConfig(options);
  await aiService.updateConfig(aiConfig);
  
  await taskService.enhanceTask(taskId, {
    aiProvider: aiConfig.aiProvider,
    aiModel: aiConfig.aiModel,
    stream: aiConfig.stream
  });
  }
}
```

#### Environment Variable Loading

```typescript
// lib/config.ts
import { buildAIConfig } from '../utils/ai-config-builder';

export function loadAIConfig(): AIConfig {
  const envConfig = buildAIConfig();
  await configManager.load();
  return envConfig;
}
```

### SURVIVAL SCENARIOS

#### Scenario 1: Multi-Provider Configuration

```typescript
// Configuration for different AI providers
const providerConfigs = {
  openai: {
    provider: "openai",
    model: "gpt-4",
    maxTokens: 4000,
    temperature: 0.7
  },
  anthropic: {
    provider: "anthropic",
    model: "claude-3.5-sonnet",
    maxTokens: 8000,
    temperature: 0.7
  },
  openrouter: {
    provider: "openrouter",
    model: "anthropic/claude-3.5-sonnet",
    maxTokens: 8000,
    temperature: 0.7,
    reasoning: {
      maxTokens: 8000
    }
  },
  custom: {
    provider: "custom",
    model: "llama-3-70b",
    maxTokens: 6000,
    temperature: 0.8
    }
  }
  }
};

// Dynamic provider switching
function switchAIProvider(provider: string, model?: string): AIConfig {
  const currentConfig = aiService.getConfig();
  const newConfig = providerConfigs[provider as keyof providerConfigs];
  
  aiService.updateConfig(newConfig);
  return newConfig;
}
```

### TECHNICAL SPECIFICATIONS

#### Configuration Validation Rules

1. **Provider Validation**: AI provider must be in predefined list
2. **Model Compatibility**: Model must be supported by provider
3. **URL Validation**: Custom URLs must be valid URLs
4. **Key Requirements**: API keys must be provided for custom providers
5. **Reasoning Limits**: Reasoning tokens must be positive integers

#### Performance Characteristics

1. **Configuration Creation**: O(1) operation
2. **Memory Usage**: Lightweight configuration objects
3. **Type Safety**: Full compile-time validation
4. **Caching**: Configuration objects cached for performance

#### Security Considerations

1. **API Key Protection**: Keys never logged or exposed
2. **URL Security**: Custom URLs validated for SSL/TLS
3. **Input Sanitization**: All inputs validated before API calls

### FREQUENTLY ASKED QUESTIONS FROM THE FIELD

**Q: How do I configure different models for different steps?**
A: Use step-specific AI options like `prdAnswerAiModel` for question/refine steps, or create separate configuration objects for each step.

**Q: What happens if I specify an invalid model?**
A: The builder will throw a validation error before creating the configuration. Use the provider's model list to see valid options.

**Q: Can I use environment variables and CLI options together?**
A: Yes! CLI options take precedence over environment variables, but environment variables provide fallbacks for missing values.

**Q: How do I handle API rate limits?**
A: The configuration builder includes rate limit awareness and will automatically adjust request timing. Monitor costs and implement exponential backoff when limits are approached.

**Q: Can I use custom AI providers with authentication?**
A: Yes! Use `aiProviderUrl` and `aiKey` options for custom endpoints. The builder validates URLs and handles authentication.

**Remember:** Citizen, in the wasteland of AI integration, proper configuration is your compass. Every provider choice is a path through the fog of uncertainty, and every model parameter is a lighthouse against the chaos. Configure them wisely, test them thoroughly, and they'll guide your AI operations to success in the radioactive dust of poor configuration.