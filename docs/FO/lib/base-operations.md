---
## TECHNICAL BULLETIN NO. 002
### BASE OPERATIONS - FOUNDATION SURVIVAL SYSTEM

**DOCUMENT ID:** `task-o-matic-base-operations-v1`
**CLEARANCE:** `All Personnel`
**MANDATORY COMPLIANCE:** `Yes`

### ⚠️ CRITICAL SURVIVAL NOTICE

Citizen, Base Operations is the bedrock of your AI survival kit. Without understanding this foundation, you're building on radioactive waste - everything will collapse. Master this system or perish in the chaos of uninitialized connections and failed configurations.

**File Location:** `packages/core/src/lib/ai-service/base-operations.ts`

### SYSTEM ARCHITECTURE OVERVIEW

Base Operations provides the fundamental infrastructure for all AI operations in Task-O-Matic. It implements core functionality including configuration management, streaming text operations, Context7 integration, retry logic, and model provider abstraction.

**Core Design Principles:**
- **Inheritance Foundation**: All specialized operation classes extend this base
- **Configuration Merging**: Strict precedence hierarchy for AI settings
- **Streaming Architecture**: Real-time response handling with proper callbacks
- **Tool Integration**: Seamless Context7 and filesystem tool integration
- **Error Resilience**: Built-in retry logic with exponential backoff

**Component Dependencies:**
- JSONParser: Response parsing and normalization
- Context7Client: Context7 MCP client for documentation
- RetryHandler: Exponential backoff retry mechanisms
- ModelProvider: AI model abstraction and configuration management
- Vercel AI SDK: Streaming text generation and tool execution

### COMPLETE API DOCUMENTATION

#### Class: BaseOperations

**Purpose**: Abstract base class providing core functionality for all AI operation classes. Cannot be instantiated directly - must be extended.

**Protected Properties**:
- `jsonParser: JSONParser` - JSON parsing and normalization utility
- `context7Client: Context7Client` - Context7 MCP client for documentation
- `retryHandler: RetryHandler` - Retry logic with exponential backoff
- `modelProvider: ModelProvider` - AI model configuration and instantiation

---

#### Method: mergeAIConfig()

**Purpose**: Merge AI configuration from multiple sources with proper precedence handling.

**Signature**:
```typescript
protected mergeAIConfig(config?: Partial<AIConfig>): AIConfig
```

**Parameters**:
- `config` (Partial<AIConfig>, optional): Operation-specific configuration overrides

**Return Value**:
- `AIConfig`: Merged configuration with all precedence levels applied

**Configuration Precedence** (Highest to Lowest):
1. Method parameter `config` (operation-specific overrides)
2. ConfigManager global config (project-level settings)
3. Environment variables (OPENAI_API_KEY, ANTHROPIC_API_KEY, etc.)
4. Provider defaults (defined in config.ts)

**Implementation Detail**: The method retrieves the base configuration from `modelProvider.getAIConfig()` (which includes ConfigManager, environment variables, and defaults), then applies operation-specific overrides on top using spread syntax.

**Examples**:

**Basic Configuration Merge**:
```typescript
class MyOperations extends BaseOperations {
  async myOperation() {
    // Use default config (ConfigManager + env vars + defaults)
    const defaultConfig = this.mergeAIConfig();

    // Override just the model for this operation
    const customConfig = this.mergeAIConfig({ model: "gpt-4o" });

    // Override multiple settings
    const fullOverride = this.mergeAIConfig({
      model: "claude-3-sonnet",
      temperature: 0.1,
      maxTokens: 4000
    });
  }
}
```

**Configuration Precedence Example**:
```typescript
// Environment: OPENAI_API_KEY=sk-xxx
// ConfigManager: { provider: "openai", model: "gpt-3.5-turbo" }
// Method parameter: { model: "gpt-4o" }

const finalConfig = this.mergeAIConfig({ model: "gpt-4o" });
// Result: {
//   provider: "openai",        // from ConfigManager
//   model: "gpt-4o",          // from method parameter (highest priority)
//   apiKey: "sk-xxx",          // from environment
//   // ... other defaults
// }
```

---

#### Method: handleContext7ToolResult()

**Purpose**: Process Context7 tool results and cache documentation for future use.

**Signature**:
```typescript
protected handleContext7ToolResult(chunk: any): void
```

**Parameters**:
- `chunk` (any): Streaming chunk to check for Context7 tool results

**Processing Logic**:
1. Checks if chunk.type === "tool-result" and chunk.toolName === "get-library-docs"
2. Extracts library ID, topic, and documentation content
3. Saves documentation using Context7Client for caching
4. Handles both object and string content formats

**Implementation Detail**: The method extracts documentation from `chunk.output` and saves it with library ID and topic from `chunk.input`. It supports two formats:
- Object format with `docs.content` property
- String format directly as documentation

**Examples**:

**Manual Tool Result Handling**:
```typescript
class MyOperations extends BaseOperations {
  processStreamingChunk(chunk: any) {
    // Handle standard text chunks
    if (chunk.type === "text-delta") {
      console.log(chunk.text);
    }

    // Handle Context7 tool results
    this.handleContext7ToolResult(chunk);

    // Handle other chunk types...
  }
}
```

**Tool Result Structure**:
```typescript
// Example Context7 tool result chunk
const chunk = {
  type: "tool-result",
  toolName: "get-library-docs",
  input: {
    context7CompatibleLibraryID: "/openai/docs",
    topic: "chat-completions"
  },
  output: {
    content: [
      { type: "text", text: "OpenAI chat completion documentation..." }
    ]
  }
};
```

---

#### Method: streamText()

**Purpose**: Execute streaming AI text generation with comprehensive error handling and tool integration.

**Signature**:
```typescript
async streamText(
  prompt: string,
  config?: Partial<AIConfig>,
  systemPrompt?: string,
  userMessage?: string,
  streamingOptions?: StreamingOptions,
  retryConfig?: Partial<RetryConfig>
): Promise<string>
```

**Parameters**:
- `prompt` (string, required): Primary prompt for AI generation
- `config` (Partial<AIConfig>, optional): AI configuration overrides
- `systemPrompt` (string, optional): System prompt for AI behavior
- `userMessage` (string, optional): User message (overrides prompt if provided)
- `streamingOptions` (StreamingOptions, optional): Streaming callbacks
- `retryConfig` (Partial<RetryConfig>, optional): Retry configuration

**Return Value**:
- `Promise<string>`: Complete generated text response

**Streaming Options Structure**:
```typescript
interface StreamingOptions {
  onChunk?: (text: string) => void;           // Text delta callback
  onReasoning?: (text: string) => void;       // Reasoning delta (if supported)
  onError?: (error: Error) => void;           // Error callback
  onFinish?: (result: {                       // Completion callback
    text: string;
    finishReason: string;
    usage: any;
    isAborted: boolean;
  }) => void;
}
```

**Implementation Details**:
1. Merges configuration using `mergeAIConfig()`
2. Wraps entire operation in retry logic using `retryHandler.executeWithRetry()`
3. Creates model instance from merged configuration
4. Configures streaming with proper callbacks
5. Automatically handles Context7 tool result caching via `handleContext7ToolResult()`
6. Supports OpenRouter reasoning tokens via provider options
7. Collects all text chunks and returns complete response

**Examples**:

**Basic Streaming Text Generation**:
```typescript
class MyOperations extends BaseOperations {
  async generateResponse() {
    const response = await this.streamText(
      "Explain quantum computing in simple terms",
      { model: "gpt-4o" },
      "You are a physics professor who makes complex topics accessible."
    );
    return response;
  }
}
```

**Advanced Streaming with Callbacks**:
```typescript
class MyOperations extends BaseOperations {
  async generateWithStreaming() {
    let fullText = "";

    const response = await this.streamText(
      "Write a story about a robot discovering emotions",
      {
        model: "claude-3-sonnet",
        temperature: 0.8,
        maxTokens: 2000
      },
      "You are a creative writer specializing in science fiction.",
      undefined, // use prompt as user message
      {
        onChunk: (text) => {
          fullText += text;
          process.stdout.write(text); // Real-time output
        },
        onReasoning: (text) => {
          console.log("\n[Reasoning]:", text);
        },
        onError: (error) => {
          console.error("Streaming error:", error);
        },
        onFinish: (result) => {
          console.log("\nGeneration complete:", result.finishReason);
          console.log("Tokens used:", result.usage);
        }
      },
      { maxAttempts: 3, baseDelay: 1000 }
    );

    return response;
  }
}
```

**Streaming with OpenRouter Reasoning**:
```typescript
class MyOperations extends BaseOperations {
  async generateWithReasoning() {
    const response = await this.streamText(
      "Solve this complex math problem step by step",
      {
        provider: "openrouter",
        model: "anthropic/claude-3.5-sonnet",
        reasoning: {
          maxTokens: 5000
        }
      },
      "You are a mathematician who shows all work.",
      undefined,
      {
        onChunk: (text) => console.log("Answer:", text),
        onReasoning: (text) => console.log("Thinking:", text)
      }
    );

    return response;
  }
}
```

**Error Handling with Custom Retry**:
```typescript
class MyOperations extends BaseOperations {
  async generateWithCustomRetry() {
    try {
      const response = await this.streamText(
        "Generate code for a REST API",
        { model: "gpt-4o" },
        "You are a senior backend developer.",
        undefined,
        {
          onError: (error) => {
            console.log("Retrying due to error:", error.message);
          }
        },
        {
          maxAttempts: 5,
          baseDelay: 2000,
          maxDelay: 30000,
          backoffFactor: 2.5,
          retryableErrors: ["RATE_LIMIT", "NETWORK_ERROR"]
        }
      );

      return response;
    } catch (error) {
      console.error("All retry attempts failed:", error);
      throw error;
    }
  }
}
```

### INTEGRATION PROTOCOLS

#### Configuration Management Protocol

All configuration operations follow strict precedence:
1. **Method Parameters**: Immediate operation overrides
2. **ConfigManager**: Project-level settings from `.task-o-matic/config.json`
3. **Environment Variables**: System-wide API keys and endpoints
4. **Provider Defaults**: Fallback values for all settings

#### Streaming Protocol Implementation

Streaming operations follow this execution flow:
1. **Configuration Merge**: Apply precedence hierarchy
2. **Model Instantiation**: Create configured AI model instance
3. **Stream Execution**: Initiate streaming with proper callbacks
4. **Tool Result Processing**: Handle Context7 documentation caching
5. **Error Handling**: Apply retry logic with exponential backoff
6. **Response Aggregation**: Collect and return complete text

**Retry Integration**: The entire streaming operation is wrapped in retry logic via `retryHandler.executeWithRetry()`. This means if the stream fails, the entire operation will be retried according to the retry configuration, not just individual chunks.

#### Context7 Integration Protocol

Documentation research follows this pattern:
1. **Tool Detection**: Monitor streaming chunks for Context7 tool calls
2. **Result Extraction**: Parse tool results for documentation content
3. **Cache Storage**: Save documentation for future task enhancement
4. **Format Handling**: Support both object and string content formats

#### Error Propagation Protocol

All operations implement consistent error handling:
1. **Retry Logic**: Automatic retry for transient failures (via retry wrapper)
2. **Error Classification**: Distinguish retryable vs. fatal errors
3. **Context Preservation**: Maintain operation context through retries
4. **Clean Propagation**: Throw original errors without modification

### SURVIVAL SCENARIOS

#### Scenario 1: Custom Operation Class

```typescript
class CustomAIOperations extends BaseOperations {
  async analyzeCode(code: string, language: string) {
    const systemPrompt = `You are an expert ${language} code analyst.`;
    const userPrompt = `Analyze this code for bugs, performance issues, and improvements:\n\n${code}`;

    return this.streamText(
      userPrompt,
      { model: "claude-3-sonnet", temperature: 0.1 },
      systemPrompt,
      undefined,
      {
        onChunk: (text) => console.log("Analyzing:", text),
        onFinish: (result) => console.log("Analysis complete")
      },
      { maxAttempts: 2 }
    );
  }

  async generateTests(functionCode: string, functionName: string) {
    const prompt = `Generate comprehensive unit tests for this function:\n\n${functionCode}`;

    return this.streamText(
      prompt,
      { model: "gpt-4o" },
      "You are a senior QA engineer specializing in test automation.",
      undefined,
      {
        onChunk: (text) => process.stdout.write(text),
        onError: (error) => console.error("Test generation failed:", error)
      }
    );
  }
}
```

#### Scenario 2: Configuration Override Patterns

```typescript
class ConfigurableOperations extends BaseOperations {
  async performOperation(operationType: string) {
    let config: Partial<AIConfig> = {};

    switch (operationType) {
      case "creative":
        config = {
          model: "claude-3-opus",
          temperature: 0.9,
          maxTokens: 4000
        };
        break;

      case "analytical":
        config = {
          model: "gpt-4o",
          temperature: 0.1,
          maxTokens: 2000
        };
        break;

      case "coding":
        config = {
          model: "claude-3-sonnet",
          temperature: 0.3,
          maxTokens: 3000
        };
        break;
    }

    return this.streamText(
      `Perform ${operationType} task`,
      config
    );
  }
}
```

#### Scenario 3: Advanced Streaming with Tool Integration

```typescript
class ToolEnabledOperations extends BaseOperations {
  async researchAndExplain(topic: string) {
    // This would be extended to use tools in specialized classes
    const systemPrompt = `You are a research assistant.
    When asked about technical topics, provide comprehensive explanations
    with current best practices and real-world examples.`;

    let researchData = "";

    return this.streamText(
      `Provide a comprehensive explanation of ${topic}`,
      { model: "claude-3-sonnet" },
      systemPrompt,
      undefined,
      {
        onChunk: (text) => {
          researchData += text;
          process.stdout.write(text);
        },
        onReasoning: (text) => {
          console.log("\n🔍 Research:", text);
        },
        onFinish: (result) => {
          console.log(`\n\n📊 Research complete: ${result.text.length} characters`);
          console.log("🎯 Finish reason:", result.finishReason);
        }
      }
    );
  }
}
```

#### Scenario 4: Error-Resilient Operations

```typescript
class ResilientOperations extends BaseOperations {
  async criticalOperation(data: any) {
    const customRetryConfig = {
      maxAttempts: 10,
      baseDelay: 5000,
      maxDelay: 60000,
      backoffFactor: 1.5,
      retryableErrors: [
        "RATE_LIMIT",
        "NETWORK_ERROR",
        "ECONNRESET",
        "ETIMEDOUT",
        "TEMPORARY_FAILURE"
      ]
    };

    try {
      return await this.streamText(
        `Process critical data: ${JSON.stringify(data)}`,
        { model: "gpt-4o" },
        "You are a critical data processing system. Be extremely thorough and accurate.",
        undefined,
        {
          onChunk: (text) => console.log("Processing:", text),
          onError: (error) => console.log("Transient error, retrying:", error.message)
        },
        customRetryConfig
      );
    } catch (error) {
      console.error("Critical operation failed after all retries:", error);
      // Implement fallback logic or alert systems
      throw error;
    }
  }
}
```

### TECHNICAL SPECIFICATIONS

#### Performance Characteristics
- **Memory Efficiency**: Streaming responses minimize memory footprint
- **Concurrent Operations**: Supports multiple simultaneous streams
- **Connection Reuse**: Model instances cached for performance
- **Retry Overhead**: Minimal impact on successful operations

#### Security Considerations
- **API Key Management**: Secure handling through configuration system
- **Input Validation**: All prompts validated before processing
- **Error Sanitization**: Sensitive data removed from error messages
- **Context Isolation**: Operation-specific context prevents data leakage

#### Reliability Features
- **Exponential Backoff**: Intelligent retry with increasing delays
- **Circuit Breaking**: Fast failure on persistent service issues
- **Graceful Degradation**: Fallback behavior for non-critical failures
- **Stateless Design**: No persistent state that could cause corruption

#### Monitoring Integration
- **Operation Logging**: All operations logged with full context
- **Performance Metrics**: Token usage, duration, and retry tracking
- **Error Analytics**: Detailed error classification and reporting
- **Health Monitoring**: Service availability and response time tracking

**Remember:** Citizen, Base Operations is your foundation in the digital wasteland. Every specialized operation you build stands on this bedrock. Weak foundations mean certain collapse when the storms of network failures and AI service outages hit. Master these core operations, or watch your entire system crumble into radioactive dust.

---

**END OF BULLETIN**
