---
## TECHNICAL BULLETIN NO. 003
### MODEL PROVIDER - AI ABSTRACTION SURVIVAL SYSTEM

**DOCUMENT ID:** `task-o-matic-model-provider-v1`  
**CLEARANCE:** `All Personnel`  
**MANDATORY COMPLIANCE:** `Yes`

### ⚠️ CRITICAL SURVIVAL NOTICE
Citizen, Model Provider is your gateway to AI services in the wasteland. Without mastering this abstraction layer, you're manually wiring connections to every AI service - a fool's errand that leads to certain death by API key exhaustion and rate limit starvation.

### SYSTEM ARCHITECTURE OVERVIEW

Model Provider provides a unified abstraction layer for multiple AI service providers, enabling seamless switching between OpenAI, Anthropic, OpenRouter, and custom endpoints while maintaining consistent interfaces and configuration management.

**Core Design Principles:**
- **Provider Abstraction**: Single interface for multiple AI providers
- **Configuration Hierarchy**: Environment variables → ConfigManager → defaults
- **Error Standardization**: Consistent error handling across providers
- **Model Validation**: Provider-specific model validation and instantiation
- **Security Management**: Secure API key handling and validation

**Supported Providers**:
- **OpenAI**: GPT models with official SDK
- **Anthropic**: Claude models with official SDK  
- **OpenRouter**: Multi-provider access with unified interface
- **Custom**: OpenAI-compatible endpoints with configurable URLs

### COMPLETE API DOCUMENTATION

#### Class: ModelProvider

**Purpose**: Centralized AI model provider management and instantiation with configuration merging.

**Constructor**: No explicit constructor required. Uses singleton pattern through ConfigManager.

---

#### Method: getAIConfig()

**Purpose**: Retrieve merged AI configuration from all sources with proper precedence.

**Signature**:
```typescript
public getAIConfig(): AIConfig
```

**Parameters**: None

**Return Value**:
- `AIConfig`: Complete AI configuration with all sources merged

**Configuration Precedence** (Highest to Lowest):
1. **ConfigManager Settings**: Project-specific configuration from `.task-o-matic/config.json`
2. **Environment Variables**: System-wide API keys and endpoints
3. **Provider Defaults**: Fallback values for all settings

**Environment Variable Mapping**:
```typescript
const envConfigMap = {
  openai: {
    apiKey: process.env.OPENAI_API_KEY
  },
  anthropic: {
    apiKey: process.env.ANTHROPIC_API_KEY
  },
  openrouter: {
    apiKey: process.env.OPENROUTER_API_KEY,
    baseURL: "https://openrouter.ai/api/v1"
  },
  custom: {
    apiKey: process.env.CUSTOM_API_KEY,
    baseURL: process.env.CUSTOM_API_URL
  }
};
```

**Examples**:

**Basic Configuration Retrieval**:
```typescript
const modelProvider = new ModelProvider();
const config = modelProvider.getAIConfig();

console.log("Provider:", config.provider);
console.log("Model:", config.model);
console.log("API Key:", config.apiKey ? "***configured***" : "missing");
```

**Configuration Structure**:
```typescript
interface AIConfig {
  provider: "openai" | "anthropic" | "openrouter" | "custom";
  model: string;
  apiKey?: string;
  baseURL?: string;
  temperature?: number;
  maxTokens?: number;
  reasoning?: {
    maxTokens?: number;
  };
  // ... other provider-specific settings
}
```

---

#### Method: getModel()

**Purpose**: Instantiate and return configured AI model instance for specified provider.

**Signature**:
```typescript
getModel(aiConfig: AIConfig): LanguageModelV2
```

**Parameters**:
- `aiConfig` (AIConfig, required): Complete AI configuration

**Return Value**:
- `LanguageModelV2`: Configured AI model instance

**Error Conditions**:
- Throws TaskOMaticError with AI_CONFIGURATION_ERROR for missing API keys
- Throws TaskOMaticError with AI_CONFIGURATION_ERROR for unsupported providers
- Provider-specific validation errors for invalid configurations

**Provider-Specific Behavior**:

**OpenAI Provider**:
```typescript
// Required: apiKey
// Optional: model (defaults to gpt-3.5-turbo)
const model = modelProvider.getModel({
  provider: "openai",
  model: "gpt-4o",
  apiKey: "sk-..."
});
// Returns: openai("gpt-4o") instance
```

**Anthropic Provider**:
```typescript
// Required: apiKey
// Optional: model (defaults to claude-3-sonnet)
const model = modelProvider.getModel({
  provider: "anthropic", 
  model: "claude-3-opus",
  apiKey: "sk-ant-..."
});
// Returns: anthropic("claude-3-opus") instance
```

**OpenRouter Provider**:
```typescript
// Required: apiKey
// Optional: model, baseURL (defaults to OpenRouter endpoint)
const model = modelProvider.getModel({
  provider: "openrouter",
  model: "anthropic/claude-3.5-sonnet",
  apiKey: "sk-or-..."
});
// Returns: openRouterProvider("anthropic/claude-3.5-sonnet") instance
```

**Custom Provider**:
```typescript
// Required: apiKey, baseURL
// Optional: model
const model = modelProvider.getModel({
  provider: "custom",
  model: "custom-model",
  apiKey: "custom-key",
  baseURL: "https://api.custom-provider.com/v1"
});
// Returns: createOpenAICompatible provider instance
```

**Examples**:

**Basic Model Instantiation**:
```typescript
const modelProvider = new ModelProvider();
const config = modelProvider.getAIConfig();
const model = modelProvider.getModel(config);

// Use model with Vercel AI SDK
import { generateText } from "ai";
const response = await generateText({
  model,
  prompt: "Hello, world!"
});
```

**Provider Switching**:
```typescript
const modelProvider = new ModelProvider();

// Switch to OpenAI
const openaiModel = modelProvider.getModel({
  provider: "openai",
  model: "gpt-4o",
  apiKey: process.env.OPENAI_API_KEY
});

// Switch to Anthropic
const anthropicModel = modelProvider.getModel({
  provider: "anthropic", 
  model: "claude-3-sonnet",
  apiKey: process.env.ANTHROPIC_API_KEY
});

// Switch to OpenRouter
const openrouterModel = modelProvider.getModel({
  provider: "openrouter",
  model: "meta-llama/llama-3.1-405b-instruct",
  apiKey: process.env.OPENROUTER_API_KEY
});
```

**Error Handling**:
```typescript
const modelProvider = new ModelProvider();

try {
  // This will throw - missing API key
  const model = modelProvider.getModel({
    provider: "openai",
    model: "gpt-4o"
    // apiKey missing
  });
} catch (error) {
  if (error.code === TaskOMaticErrorCodes.AI_CONFIGURATION_ERROR) {
    console.error("Configuration error:", error.message);
    console.log("Suggestions:", error.suggestions);
    // Output:
    // "OpenAI API key is required"
    // Suggestions: [
    //   "Set the OPENAI_API_KEY environment variable.",
    //   "Run `task-o-matic config set-ai-key <key>`"
    // ]
  }
}

try {
  // This will throw - unsupported provider
  const model = modelProvider.getModel({
    provider: "unsupported-provider" as any,
    model: "some-model"
  });
} catch (error) {
  console.error("Provider error:", error.message);
  // Output: "Unsupported provider: unsupported-provider"
  // Suggestions: [
  //   "Use one of the supported providers: 'openai', 'anthropic', 'openrouter', 'custom'.",
  //   "Run `task-o-matic config set-ai-provider <provider>`"
  // ]
}
```

**Advanced Configuration**:
```typescript
const modelProvider = new ModelProvider();

// Custom provider with full configuration
const customModel = modelProvider.getModel({
  provider: "custom",
  model: "gpt-4o-mini",
  apiKey: "sk-custom-key",
  baseURL: "https://api.example.com/v1",
  temperature: 0.7,
  maxTokens: 2000
});

// OpenRouter with reasoning support
const reasoningModel = modelProvider.getModel({
  provider: "openrouter",
  model: "anthropic/claude-3.5-sonnet",
  apiKey: "sk-or-key",
  reasoning: {
    maxTokens: 5000
  }
});
```

### INTEGRATION PROTOCOLS

#### Configuration Management Protocol
Configuration follows this merge order:
1. **Base Defaults**: Provider-specific default values
2. **Environment Variables**: System-wide API keys and endpoints
3. **ConfigManager**: Project-specific overrides from `.task-o-matic/config.json`
4. **Method Parameters**: Runtime overrides (highest priority)

#### Provider Selection Protocol
Provider selection follows this logic:
1. **Explicit Provider**: Use provider specified in configuration
2. **Environment Fallback**: Check for provider-specific environment variables
3. **Default Fallback**: Use configured default provider
4. **Validation**: Ensure required parameters are present

#### Error Handling Protocol
All provider errors follow this pattern:
1. **Validation**: Check required parameters before instantiation
2. **Standardization**: Convert provider errors to TaskOMaticError
3. **Context**: Include helpful suggestions for common issues
4. **Propagation**: Throw original error details for debugging

### SURVIVAL SCENARIOS

#### Scenario 1: Multi-Provider Setup
```typescript
class AIServiceManager {
  private modelProvider = new ModelProvider();
  
  async generateWithProvider(provider: string, prompt: string) {
    const baseConfig = this.modelProvider.getAIConfig();
    
    const providerConfig = {
      ...baseConfig,
      provider: provider as any
    };
    
    try {
      const model = this.modelProvider.getModel(providerConfig);
      return await generateText({ model, prompt });
    } catch (error) {
      console.error(`Failed to generate with ${provider}:`, error.message);
      throw error;
    }
  }
  
  async testAllProviders(prompt: string) {
    const providers = ["openai", "anthropic", "openrouter"];
    const results = [];
    
    for (const provider of providers) {
      try {
        const result = await this.generateWithProvider(provider, prompt);
        results.push({ provider, result, success: true });
      } catch (error) {
        results.push({ provider, error: error.message, success: false });
      }
    }
    
    return results;
  }
}
```

#### Scenario 2: Configuration Validation
```typescript
class ConfigurationValidator {
  private modelProvider = new ModelProvider();
  
  validateConfiguration(): { valid: boolean; issues: string[] } {
    const issues: string[] = [];
    
    try {
      const config = this.modelProvider.getAIConfig();
      
      // Test model instantiation
      this.modelProvider.getModel(config);
      
      // Check for common issues
      if (!config.apiKey) {
        issues.push(`API key missing for ${config.provider} provider`);
      }
      
      if (!config.model) {
        issues.push("No model specified");
      }
      
      return { valid: issues.length === 0, issues };
    } catch (error) {
      return { 
        valid: false, 
        issues: [error.message] 
      };
    }
  }
  
  async testProvider(): Promise<boolean> {
    try {
      const config = this.modelProvider.getAIConfig();
      const model = this.modelProvider.getModel(config);
      
      // Test with minimal request
      await generateText({
        model,
        prompt: "test",
        maxTokens: 1
      });
      
      return true;
    } catch (error) {
      console.error("Provider test failed:", error.message);
      return false;
    }
  }
}
```

#### Scenario 3: Dynamic Provider Switching
```typescript
class DynamicAIService {
  private modelProvider = new ModelProvider();
  private currentProvider: string = "openai";
  
  async switchProvider(newProvider: string) {
    try {
      // Test new provider before switching
      const testConfig = {
        ...this.modelProvider.getAIConfig(),
        provider: newProvider as any
      };
      
      this.modelProvider.getModel(testConfig);
      this.currentProvider = newProvider;
      
      console.log(`Switched to ${newProvider} provider`);
    } catch (error) {
      console.error(`Failed to switch to ${newProvider}:`, error.message);
      throw error;
    }
  }
  
  async generateWithCurrentProvider(prompt: string) {
    const config = {
      ...this.modelProvider.getAIConfig(),
      provider: this.currentProvider as any
    };
    
    const model = this.modelProvider.getModel(config);
    return await generateText({ model, prompt });
  }
  
  async getBestProvider(prompt: string): Promise<string> {
    const providers = ["openai", "anthropic", "openrouter"];
    let bestProvider = this.currentProvider;
    let bestScore = 0;
    
    for (const provider of providers) {
      try {
        const config = {
          ...this.modelProvider.getAIConfig(),
          provider: provider as any
        };
        
        const model = this.modelProvider.getModel(config);
        const result = await generateText({
          model,
          prompt: `Rate this prompt's suitability for ${provider}: ${prompt}`,
          maxTokens: 10
        });
        
        const score = parseInt(result.text) || 0;
        if (score > bestScore) {
          bestScore = score;
          bestProvider = provider;
        }
      } catch (error) {
        // Provider not available, skip
        continue;
      }
    }
    
    return bestProvider;
  }
}
```

#### Scenario 4: Custom Provider Integration
```typescript
class CustomProviderManager {
  private modelProvider = new ModelProvider();
  
  setupLocalProvider() {
    // Configure for local Ollama instance
    const localConfig = {
      provider: "custom" as const,
      model: "llama3.1:8b",
      apiKey: "not-required-for-local",
      baseURL: "http://localhost:11434/v1",
      temperature: 0.1
    };
    
    try {
      const model = this.modelProvider.getModel(localConfig);
      console.log("Local provider configured successfully");
      return model;
    } catch (error) {
      console.error("Failed to configure local provider:", error.message);
      throw error;
    }
  }
  
  setupCloudflareProvider() {
    // Configure for Cloudflare Workers AI
    const cloudflareConfig = {
      provider: "custom" as const,
      model: "@cf/meta/llama-3.1-8b-instruct",
      apiKey: process.env.CLOUDFLARE_API_TOKEN,
      baseURL: "https://api.cloudflare.com/client/v4/accounts/ACCOUNT_ID/ai/v1",
      maxTokens: 4096
    };
    
    return this.modelProvider.getModel(cloudflareConfig);
  }
  
  async testCustomProvider(config: AIConfig) {
    try {
      const model = this.modelProvider.getModel(config);
      const result = await generateText({
        model,
        prompt: "Hello from custom provider!",
        maxTokens: 50
      });
      
      console.log("Custom provider response:", result.text);
      return true;
    } catch (error) {
      console.error("Custom provider test failed:", error.message);
      return false;
    }
  }
}
```

### TECHNICAL SPECIFICATIONS

#### Performance Characteristics
- **Model Caching**: Model instances cached for repeated use
- **Connection Reuse**: HTTP connections reused when possible
- **Configuration Overhead**: Minimal impact on performance
- **Provider Switching**: Fast switching between pre-configured providers

#### Security Considerations
- **API Key Protection**: Keys never logged or exposed in errors
- **Configuration Validation**: Input sanitization for all parameters
- **Secure Defaults**: Secure default configurations
- **Environment Isolation**: Provider-specific environment variable handling

#### Reliability Features
- **Graceful Degradation**: Fallback behavior for provider failures
- **Error Recovery**: Detailed error messages with recovery suggestions
- **Configuration Validation**: Pre-flight checks before model instantiation
- **Provider Health**: Basic connectivity testing capabilities

#### Monitoring Integration
- **Provider Metrics**: Usage tracking per provider
- **Performance Monitoring**: Response time and success rate tracking
- **Error Analytics**: Provider-specific error classification
- **Configuration Auditing**: Configuration change tracking

**Remember:** Citizen, Model Provider is your universal translator in the AI wasteland. Without it, you're shouting into different service endpoints with incompatible protocols. Master this abstraction layer, or watch your integration efforts dissolve into a mess of provider-specific code and API key management nightmares.

---

**END OF BULLETIN**