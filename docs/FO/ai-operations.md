# VAULT-TEC AI OPERATIONS MANUAL
## S.P.E.C.I.A.L. ATTRIBUTE: AGILITY

**WARNING:** This manual contains classified Vault-Tec proprietary information. Unauthorized access will result in immediate termination and reassignment to custodial duties.

---

## 🎯 OVERVIEW: THE AGILITY ATTRIBUTE

Welcome, Vault Dweller! In the post-apocalyptic world of software development, **Agility** represents your ability to quickly and efficiently interact with AI models. The AI Operations system is your Pip-Boy's rapid response interface to the artificial intelligence that survived the Great War.

Think of AI Operations as your **Agility stat** - the higher your understanding, the faster you can navigate the dangerous wasteland of AI model interactions, dodge incoming errors, and strike with precision responses.

---

## 🏗️ ARCHITECTURE: THE VAULT-TEC MODULAR DESIGN

### Core Components

```
┌─────────────────────────────────────────────────────────────┐
│                    AI OPERATIONS                            │
│                 (Main Facade Class)                         │
└─────────────────────┬───────────────────────────────────────┘
                      │
    ┌─────────────────┼─────────────────┐
    │                 │                 │
┌───▼────┐    ┌──────▼──────┐    ┌──────▼──────┐
│PRD Ops │    │ Task Ops    │    │ Doc Ops     │
│(Intelli-│    │(Execution   │    │(Research    │
│gence)  │    │Focus)       │    │Division)    │
└────────┘    └─────────────┘    └─────────────┘
                      │
            ┌─────────▼─────────┐
            │  Base Operations  │
            │ (Common Utilities)│
            └───────────────────┘
```

### Supporting Infrastructure

- **ModelProvider**: Your AI model selection terminal
- **ContextBuilder**: Intelligence gathering specialist
- **RetryHandler**: Resilience training officer
- **Context7Client**: Library access terminal (MCP integration)

---

## 🚀 MAIN OPERATIONS CLASS: YOUR AGILITY HUB

### `AIOperations` - The Central Command

The `AIOperations` class is your primary interface to all AI capabilities. It delegates to specialized operation classes while maintaining a unified API.

```typescript
import { AIOperations } from './src/lib/ai-service/ai-operations';

// Initialize your AI operations terminal
const aiOps = new AIOperations();
```

#### PRD Operations (Intelligence Division)

**Parse Product Requirements Document**
```typescript
const prdResult = await aiOps.parsePRD(
  prdContent,                    // The classified document
  { model: "gpt-4o" },          // AI model selection
  undefined,                     // Custom prompt override
  "Analyze this PRD for tasks",  // Your intelligence request
  streamingOptions,              // Real-time updates
  { maxAttempts: 3 },            // Retry configuration
  "/vault/project",              // Working directory
  true                           // Enable filesystem tools
);
```

**Generate PRD Questions**
```typescript
const questions = await aiOps.generatePRDQuestions(
  prdContent,
  { provider: "anthropic" },
  undefined,
  "What questions should I ask about this PRD?",
  streamingOptions,
  undefined,
  "/vault/project",
  true
);
```

#### Task Operations (Execution Division)

**Break Down Complex Tasks**
```typescript
const subtasks = await aiOps.breakdownTask(
  task,                          // Parent task object
  { temperature: 0.7 },          // Creativity level
  undefined,                     // Custom breakdown prompt
  "Break this into manageable chunks",
  streamingOptions,
  { maxAttempts: 2 },            // Retry attempts
  fullContent,                   // Complete task context
  stackInfo,                     // Technology stack info
  existingSubtasks,              // Already existing subtasks
  true                           // Enable filesystem access
);
```

**Enhance Task Description**
```typescript
const enhancedDescription = await aiOps.enhanceTask(
  "Build a water purifier",
  "Basic water filtration system",
  { model: "claude-3-5-sonnet-20241022" },
  undefined,
  "Make this more detailed and actionable",
  "task-123",
  streamingOptions,
  { maxAttempts: 3 }
);
```

#### Documentation Operations (Research Division)

**Enhance Task with Documentation**
```typescript
const enhancedTask = await aiOps.enhanceTaskWithDocumentation(
  "task-456",
  "Implement authentication system",
  "Add user login functionality",
  "Next.js, Better Auth, Convex",
  streamingOptions,
  { maxAttempts: 2 },
  { provider: "openrouter" },
  existingResearch               // Previous research findings
);
```

---

## ⚙️ BASE OPERATIONS: THE FOUNDATION

### `BaseOperations` - Common Utilities

All specialized operations inherit from `BaseOperations`, providing core functionality:

#### Configuration Merging

The system uses a **precedence hierarchy** for configuration:

1. **Method parameter config** (highest priority - operation-specific)
2. **ConfigManager global config** (project-level settings)
3. **Environment variables** (system-wide settings)
4. **Provider defaults** (fallback values)

```typescript
// Example: Override just the model for one operation
const config = aiOps.mergeAIConfig({ model: "gpt-4o" });
// Result: Global config + model override
```

#### Streaming Text Operations

```typescript
const response = await aiOps.streamText(
  "Analyze this code for vulnerabilities",
  { provider: "anthropic", temperature: 0.1 },
  "You are a security expert...",  // System prompt
  "Please review this React component", // User message
  {
    onChunk: (text) => console.log("Received:", text),
    onFinish: (result) => console.log("Complete:", result.text),
    onError: (error) => console.error("Error:", error),
    onReasoning: (text) => console.log("AI thinking:", text)
  },
  { maxAttempts: 3, baseDelay: 1000 }
);
```

---

## 🎛️ MODEL PROVIDER: AI SELECTION TERMINAL

### `ModelProvider` - Your AI Model Gateway

The ModelProvider handles all AI model interactions with support for multiple providers:

#### Supported Providers

| Provider | Status | API Key Environment Variable | Default Model |
|----------|--------|------------------------------|---------------|
| **OpenAI** | ✅ Stable | `OPENAI_API_KEY` | `gpt-4o` |
| **Anthropic** | ✅ Stable | `ANTHROPIC_API_KEY` | `claude-3-5-sonnet-20241022` |
| **OpenRouter** | ✅ Stable | `OPENROUTER_API_KEY` | `anthropic/claude-3.5-sonnet` |
| **Custom** | ✅ Experimental | `CUSTOM_API_KEY` | User-defined |

#### Configuration Examples

**OpenAI Configuration**
```typescript
const config: AIConfig = {
  provider: "openai",
  model: "gpt-4o",
  apiKey: "sk-your-key-here",
  maxTokens: 4000,
  temperature: 0.7,
  context7Enabled: true
};
```

**OpenRouter with Reasoning**
```typescript
const config: AIConfig = {
  provider: "openrouter",
  model: "anthropic/claude-3.5-sonnet",
  apiKey: "sk-or-your-key-here",
  reasoning: {
    maxTokens: 5000  // Enable reasoning tokens
  }
};
```

**Custom Provider**
```typescript
const config: AIConfig = {
  provider: "custom",
  model: "llama-3-70b",
  apiKey: "your-custom-key",
  baseURL: "https://your-custom-endpoint.com/v1",
  maxTokens: 8000,
  temperature: 0.5
};
```

---

## 🧠 CONTEXT BUILDER: INTELLIGENCE GATHERING

### `ContextBuilder` - Your Context Specialist

The ContextBuilder gathers all relevant information for AI operations:

#### Building Task Context

```typescript
const context = await contextBuilder.buildContext("task-123");
// Returns:
// {
//   task: { id, title, description, fullContent },
//   stack: { frontend, backend, database, auth, ... },
//   documentation: { recap, files },
//   existingContent: string,
//   prdContent: string,
//   existingResearch: Record<string, Array<{query, doc}>>
// }
```

#### Context for New Tasks

```typescript
const newTaskContext = await contextBuilder.buildContextForNewTask(
  "Implement user authentication",
  "Add login and registration functionality",
  "prd/feature-auth.md"
);
```

#### Documentation Freshness Checks

```typescript
// Check if documentation is still good (less than 7 days old)
const isFresh = contextBuilder.isDocumentationFresh(documentation);

// Check if documentation is stale (more than 30 days old)
const isStale = contextBuilder.isDocumentationStale(documentation);
```

---

## 🔄 RETRY HANDLER: RESILIENCE TRAINING

### `RetryHandler` - Your Error Recovery Specialist

The RetryHandler implements exponential backoff for resilient AI operations:

#### Default Retry Configuration

```typescript
const defaultConfig: RetryConfig = {
  maxAttempts: 3,                    // Maximum retry attempts
  baseDelay: 1000,                   // Starting delay (1 second)
  maxDelay: 10000,                   // Maximum delay (10 seconds)
  backoffFactor: 2,                  // Exponential backoff multiplier
  retryableErrors: [
    "ECONNRESET", "ENOTFOUND", "ECONNREFUSED",
    "ETIMEDOUT", "NETWORK_ERROR", "RATE_LIMIT",
    "TEMPORARY_FAILURE", "INTERNAL_ERROR"
  ]
};
```

#### Custom Retry Configuration

```typescript
const customRetryConfig: Partial<RetryConfig> = {
  maxAttempts: 5,
  baseDelay: 500,
  maxDelay: 30000,
  backoffFactor: 1.5,
  retryableErrors: ["RATE_LIMIT", "NETWORK_ERROR"]
};

await aiOps.breakdownTask(
  task,
  config,
  undefined,
  undefined,
  streamingOptions,
  customRetryConfig  // Custom retry behavior
);
```

---

## 📚 CONTEXT7 CLIENT: LIBRARY ACCESS

### `Context7Client` - MCP Integration Terminal

The Context7Client provides access to the Context7 documentation system via Model Context Protocol:

#### Initializing MCP Connection

```typescript
const context7Client = new Context7Client();

// Initialize connection to Context7 MCP server
await context7Client.initializeMCPClient();

// Get available tools
const tools = await context7Client.getMCPTools();
```

#### Saving Documentation

```typescript
const savedPath = await context7Client.saveContext7Documentation(
  "/mongodb/docs",                    // Library ID
  "aggregation pipelines",           // Search query
  "MongoDB aggregation documentation..." // Content
);
```

---

## 🛠️ PRACTICAL EXAMPLES: VAULT-TEC SCENARIOS

### Scenario 1: Analyzing a New PRD

```typescript
import { AIOperations } from './src/lib/ai-service/ai-operations';

const aiOps = new AIOperations();

async function analyzeNewPRD(prdPath: string) {
  const prdContent = await fs.readFile(prdPath, 'utf-8');
  
  console.log("🔍 Analyzing PRD with AI...");
  
  const result = await aiOps.parsePRD(
    prdContent,
    {
      provider: "anthropic",
      model: "claude-3-5-sonnet-20241022",
      temperature: 0.3  // Lower temperature for consistent analysis
    },
    undefined,
    "Parse this PRD into actionable tasks",
    {
      onChunk: (chunk) => process.stdout.write(chunk),
      onFinish: () => console.log("\n✅ PRD analysis complete!")
    },
    {
      maxAttempts: 3,
      baseDelay: 2000
    },
    process.cwd(),
    true  // Enable filesystem tools for better context
  );
  
  console.log(`📋 Generated ${result.tasks.length} tasks`);
  console.log(`⏱️  Estimated duration: ${result.estimatedDuration}`);
  console.log(`🎯 Confidence: ${result.confidence}%`);
  
  return result;
}
```

### Scenario 2: Breaking Down a Complex Task

```typescript
async function breakdownComplexTask(taskId: string) {
  const task = await taskService.getTask(taskId);
  if (!task) throw new Error("Task not found");
  
  console.log(`🔧 Breaking down task: ${task.title}`);
  
  const subtasks = await aiOps.breakdownTask(
    task,
    {
      provider: "openrouter",
      model: "anthropic/claude-3.5-sonnet",
      temperature: 0.5
    },
    undefined,
    "Break this into smaller, implementable subtasks",
    {
      onChunk: (chunk) => process.stdout.write("."),
      onFinish: () => console.log("\n✨ Task breakdown complete!")
    },
    {
      maxAttempts: 2,
      retryableErrors: ["RATE_LIMIT", "NETWORK_ERROR"]
    },
    await getTaskFullContent(task),  // Full context
    await getStackInfo(),            // Technology stack
    await getExistingSubtasks(task), // Avoid duplication
    true                            // Enable filesystem tools
  );
  
  console.log(`📦 Created ${subtasks.length} subtasks`);
  
  // Create subtasks in the system
  for (const subtask of subtasks) {
    await taskService.createTask({
      title: subtask.title,
      description: subtask.content,
      estimatedEffort: subtask.estimatedEffort as any,
      parentId: taskId
    });
  }
  
  return subtasks;
}
```

### Scenario 3: Enhancing Task with Documentation

```typescript
async function enhanceWithDocumentation(taskId: string) {
  const task = await taskService.getTask(taskId);
  if (!task) throw new Error("Task not found");
  
  console.log(`📚 Enhancing task with documentation: ${task.title}`);
  
  // First, analyze what documentation is needed
  const docNeeds = await aiOps.analyzeDocumentationNeeds(
    taskId,
    task.title,
    task.description || "",
    await getStackInfo(),
    {
      onChunk: (chunk) => process.stdout.write("🔍"),
      onFinish: () => console.log("\n📖 Documentation analysis complete!")
    },
    { maxAttempts: 2 },
    { provider: "openai", model: "gpt-4o" }
  );
  
  console.log(`🎯 Found ${docNeeds.libraries.length} libraries to research`);
  
  // Then enhance the task with the documentation
  const enhancedContent = await aiOps.enhanceTaskWithDocumentation(
    taskId,
    task.title,
    task.description || "",
    await getStackInfo(),
    {
      onChunk: (chunk) => process.stdout.write("✍️"),
      onFinish: () => console.log("\n✨ Task enhancement complete!")
    },
    { maxAttempts: 3 },
    { provider: "anthropic", model: "claude-3-5-sonnet-20241022" },
    task.documentation?.research
  );
  
  // Save the enhanced content
  await taskService.updateTask(taskId, {
    description: enhancedContent
  });
  
  return enhancedContent;
}
```

---

## ⚠️ VAULT-TEC SAFETY WARNINGS

### ⚡ High Voltage: API Key Management

**DANGER:** Never commit API keys to your repository! Use environment variables:

```bash
# Set your API keys (never in code!)
export OPENAI_API_KEY="sk-your-openai-key"
export ANTHROPIC_API_KEY="sk-ant-your-anthropic-key"
export OPENROUTER_API_KEY="sk-or-your-openrouter-key"
export CONTEXT7_API_KEY="your-context7-key"
```

### 🔥 Fire Hazard: Rate Limiting

**WARNING:** AI providers have rate limits. The RetryHandler helps, but:

```typescript
// Conservative retry configuration for production
const safeRetryConfig: Partial<RetryConfig> = {
  maxAttempts: 2,        // Don't hammer the API
  baseDelay: 5000,       // Start with 5 second delay
  maxDelay: 60000,       // Max 1 minute between retries
  backoffFactor: 2       // Exponential backoff
};
```

### ☢️ Radiation: Cost Management

**CAUTION:** AI operations consume credits. Monitor usage:

```typescript
// Use smaller models for simple tasks
const cheapConfig: AIConfig = {
  provider: "openai",
  model: "gpt-3.5-turbo",  // Cheaper than GPT-4
  maxTokens: 1000,         // Limit token usage
  temperature: 0.1          // Less randomness = less retries
};

// Reserve powerful models for complex tasks
const premiumConfig: AIConfig = {
  provider: "anthropic",
  model: "claude-3-5-sonnet-20241022",
  maxTokens: 8000,
  temperature: 0.7
};
```

---

## 🔧 TROUBLESHOOTING: FIELD REPAIR GUIDE

### Common Issues and Solutions

#### Issue: "API key is required"

**Diagnosis:** Missing or incorrect API key configuration.

**Solution:**
```bash
# Check environment variables
echo $OPENAI_API_KEY
echo $ANTHROPIC_API_KEY

# Or set via CLI
task-o-matic config set-ai-key your-api-key-here
```

#### Issue: "Rate limit exceeded"

**Diagnosis:** Too many requests to AI provider.

**Solution:**
```typescript
// Implement conservative retry strategy
const rateLimitSafeConfig: Partial<RetryConfig> = {
  maxAttempts: 2,
  baseDelay: 10000,  // 10 second starting delay
  retryableErrors: ["RATE_LIMIT"]
};
```

#### Issue: "Context length exceeded"

**Diagnosis:** Prompt too long for model's context window.

**Solution:**
```typescript
// Reduce maxTokens and content size
const compactConfig: AIConfig = {
  maxTokens: 2000,  // Smaller context
  // ... other config
};

// Or use a model with larger context
const largeContextConfig: AIConfig = {
  provider: "anthropic",
  model: "claude-3-5-sonnet-20241022",  // 200K context
  maxTokens: 100000
};
```

#### Issue: "Network connection failed"

**Diagnosis:** Network connectivity problems.

**Solution:**
```typescript
// Enable more aggressive retry for network issues
const networkResilientConfig: Partial<RetryConfig> = {
  maxAttempts: 5,
  baseDelay: 1000,
  maxDelay: 30000,
  backoffFactor: 1.5,
  retryableErrors: [
    "ECONNRESET", "ENOTFOUND", "ECONNREFUSED",
    "ETIMEDOUT", "NETWORK_ERROR"
  ]
};
```

---

## 🎯 OPTIMIZATION TIPS: VAULT-TEC PRO SECRETS

### Performance Optimization

1. **Use Streaming for Long Operations**
   ```typescript
   // Always enable streaming for better UX
   const streamingOptions: StreamingOptions = {
     enabled: true,
     onChunk: (chunk) => updateUI(chunk),
     onFinish: () => showCompletion()
   };
   ```

2. **Cache Documentation Results**
   ```typescript
   // Check freshness before re-fetching
   if (!contextBuilder.isDocumentationFresh(doc)) {
     // Only fetch if stale
     const newDoc = await fetchDocumentation();
   }
   ```

3. **Choose the Right Model for the Job**
   ```typescript
   // Simple tasks: cheaper models
   const simpleTaskConfig = { model: "gpt-3.5-turbo" };
   
   // Complex reasoning: premium models
   const complexTaskConfig = { model: "claude-3-5-sonnet-20241022" };
   
   // Code generation: specialized models
   const codeTaskConfig = { model: "gpt-4o" };
   ```

### Cost Optimization

1. **Temperature Tuning**
   ```typescript
   // Deterministic tasks (parsing, analysis)
   const deterministicConfig = { temperature: 0.1 };
   
   // Creative tasks (brainstorming, enhancement)
   const creativeConfig = { temperature: 0.8 };
   ```

2. **Token Management**
   ```typescript
   // Set reasonable limits
   const economicalConfig = {
     maxTokens: 2000,  // Prevent runaway responses
     temperature: 0.3  // Reduce randomness
   };
   ```

3. **Batch Operations**
   ```typescript
   // Process multiple tasks in parallel when possible
   const results = await Promise.all([
     aiOps.enhanceTask(task1),
     aiOps.enhanceTask(task2),
     aiOps.enhanceTask(task3)
   ]);
   ```

---

## 📊 REFERENCE: QUICK COMMAND CHEAT SHEET

### AI Operations Quick Reference

```typescript
// Initialize
const aiOps = new AIOperations();

// PRD Operations
await aiOps.parsePRD(content, config, prompt, message, streaming, retry, dir, fsTools);
await aiOps.generatePRD(description, config, prompt, message, streaming, retry);
await aiOps.reworkPRD(content, feedback, config, prompt, message, streaming, retry, dir, fsTools);
await aiOps.generatePRDQuestions(content, config, prompt, message, streaming, retry, dir, fsTools);
await aiOps.answerPRDQuestions(content, questions, config, context, streaming, retry);
await aiOps.combinePRDs(prds, description, config, prompt, message, streaming, retry);

// Task Operations
await aiOps.breakdownTask(task, config, prompt, message, streaming, retry, fullContent, stack, subtasks, fsTools);
await aiOps.enhanceTask(title, description, config, prompt, message, taskId, streaming, retry);
await aiOps.planTask(context, details, config, prompt, message, streaming, retry);

// Documentation Operations
await aiOps.enhanceTaskWithDocumentation(taskId, title, description, stack, streaming, retry, config, research);
await aiOps.analyzeDocumentationNeeds(taskId, title, description, stack, streaming, retry, config, existing);
await aiOps.generateDocumentationRecap(libraries, documents, streaming, retry);
```

### Configuration Templates

```typescript
// Development - Fast and cheap
const devConfig: AIConfig = {
  provider: "openai",
  model: "gpt-3.5-turbo",
  maxTokens: 2000,
  temperature: 0.3,
  context7Enabled: false  // Save costs in dev
};

// Production - Reliable and capable
const prodConfig: AIConfig = {
  provider: "anthropic",
  model: "claude-3-5-sonnet-20241022",
  maxTokens: 4000,
  temperature: 0.5,
  context7Enabled: true
};

// Research - Maximum capability
const researchConfig: AIConfig = {
  provider: "openrouter",
  model: "anthropic/claude-3.5-sonnet",
  maxTokens: 8000,
  temperature: 0.7,
  context7Enabled: true,
  reasoning: { maxTokens: 5000 }
};
```

---

## 🎓 CONCLUSION: AGILITY MASTERY

Congratulations, Vault Dweller! You've now mastered the **Agility** attribute of the Task-O-Matic system. With these AI Operations skills, you can:

- ✅ **Quickly parse** complex PRDs into actionable tasks
- ✅ **Efficiently break down** overwhelming projects
- ✅ **Intelligently enhance** task descriptions with AI assistance
- ✅ **Seamlessly integrate** documentation research into your workflow
- ✅ **Resiliently handle** network issues and rate limits
- ✅ **Optimize costs** while maintaining quality

Remember: In the wasteland of software development, agility isn't just about speed—it's about **smart, efficient, and reliable** AI interactions that keep your project alive and thriving.

**VAULT-TEC WISHES YOU SUCCESS IN YOUR AI ENDEAVORS!**

---

*This manual is classified Vault-Tec proprietary information. Distribution is strictly limited to authorized Vault personnel. For technical support, please contact your nearest Vault-Tec representative or consult the terminal in your local Vault.*

**Document Version:** 2.0  
**Last Updated:** December 2025  
**Classification:** Top Secret // Vault-Tec Internal Use Only