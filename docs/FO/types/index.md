---
## TECHNICAL BULLETIN NO. 003
### CORE TYPES - CENTRAL TYPE DEFINITION SYSTEM

**DOCUMENT ID:** `task-o-matic-core-types-v1`  
**CLEARANCE:** `All Personnel`  
**MANDATORY COMPLIANCE:** `Yes`

### ⚠️ CRITICAL SURVIVAL NOTICE
Citizen, ignore this core type system and your entire application becomes a house of cards in the wasteland. Type safety collapses, interfaces conflict, and your data structures become radioactive wastelands of undefined behavior. This is the foundation upon which all survival depends.

### TYPE SYSTEM ARCHITECTURE

The core type system provides **comprehensive type definitions** for the entire task-o-matic ecosystem. It uses **interface composition**, **union types**, and **generic patterns** to create a robust, type-safe foundation. The architecture supports:

- **AI Configuration**: Multi-provider AI service configuration
- **Task Management**: Complete task lifecycle types
- **Service Integration**: Storage, execution, and workflow types
- **Extensibility**: Open-ended properties for AI-generated content
- **Type Safety**: Compile-time validation and runtime guarantees

This design enables **cross-component compatibility** while maintaining strict type checking throughout the application.

### COMPLETE TYPE DOCUMENTATION

#### AI Configuration Types

##### AIConfig Interface

```typescript
export interface AIConfig {
  provider: AIProvider;
  model: string;
  apiKey?: string;
  baseURL?: string;
  maxTokens?: number;
  temperature?: number;
  context7Enabled?: boolean;
  reasoning?: {
    maxTokens?: number;
  };
}
```

**Purpose**: Complete configuration for AI service providers

**Properties**:
- **provider** (Required, AIProvider): AI provider ("openai", "anthropic", "openrouter", "custom")
- **model** (Required, string): Model name to use
- **apiKey** (Optional, string): API authentication key
- **baseURL** (Optional, string): Custom endpoint for custom providers
- **maxTokens** (Optional, number): Maximum tokens per request
- **temperature** (Optional, number): Response randomness (0.0-1.0)
- **context7Enabled** (Optional, boolean): Enable Context7 documentation retrieval
- **reasoning** (Optional, object): Reasoning configuration for supported models
  - **maxTokens** (Optional, number): Maximum reasoning tokens

**Usage Examples**:
```typescript
// OpenAI configuration
const openaiConfig: AIConfig = {
  provider: "openai",
  model: "gpt-4",
  apiKey: "sk-openai-...",
  maxTokens: 4000,
  temperature: 0.7,
  context7Enabled: true
};

// Anthropic with reasoning
const anthropicConfig: AIConfig = {
  provider: "anthropic",
  model: "claude-3.5-sonnet",
  apiKey: "sk-ant-...",
  maxTokens: 8000,
  temperature: 0.5,
  reasoning: {
    maxTokens: 5000
  }
};

// Custom provider
const customConfig: AIConfig = {
  provider: "custom",
  model: "llama-3-70b",
  baseURL: "https://api.custom-ai.com/v1",
  apiKey: "custom-key",
  maxTokens: 6000,
  temperature: 0.8
};
```

##### EnvAIConfig Interface

```typescript
export interface EnvAIConfig {
  AI_PROVIDER?: string;
  AI_MODEL?: string;
  AI_MAX_TOKENS?: string;
  AI_TEMPERATURE?: string;
  OPENROUTER_API_KEY?: string;
  ANTHROPIC_API_KEY?: string;
  OPENAI_API_KEY?: string;
  CUSTOM_API_KEY?: string;
  CUSTOM_API_URL?: string;
}
```

**Purpose**: Environment variable configuration for AI settings

**Properties**: All optional string properties for environment variables

**Usage Examples**:
```typescript
// Environment configuration
process.env.AI_PROVIDER = "anthropic";
process.env.AI_MODEL = "claude-3-sonnet-20240229";
process.env.AI_MAX_TOKENS = "8000";
process.env.ANTHROPIC_API_KEY = "sk-ant-...";

// Loading from environment
function loadAIConfigFromEnv(): Partial<AIConfig> {
  return {
    provider: process.env.AI_PROVIDER as AIProvider,
    model: process.env.AI_MODEL || "claude-3-sonnet-20240229",
    maxTokens: process.env.AI_MAX_TOKENS ? parseInt(process.env.AI_MAX_TOKENS) : 4000,
    temperature: process.env.AI_TEMPERATURE ? parseFloat(process.env.AI_TEMPERATURE) : 0.7,
    apiKey: process.env.ANTHROPIC_API_KEY || process.env.OPENAI_API_KEY || process.env.OPENROUTER_API_KEY,
    baseURL: process.env.CUSTOM_API_URL
  };
}
```

##### ProviderDefaults Interface

```typescript
export interface ProviderDefaults {
  openrouter: {
    model: string;
    maxTokens: number;
    temperature: number;
  };
  anthropic: {
    model: string;
    maxTokens: number;
    temperature: number;
  };
  openai: {
    model: string;
    maxTokens: number;
    temperature: number;
  };
  custom: {
    model: string;
    maxTokens: number;
    temperature: number;
  };
}
```

**Purpose**: Default configuration for each AI provider

**Usage Examples**:
```typescript
const defaults: ProviderDefaults = {
  openrouter: {
    model: "anthropic/claude-3.5-sonnet",
    maxTokens: 8000,
    temperature: 0.7
  },
  anthropic: {
    model: "claude-3-sonnet-20240229",
    maxTokens: 8000,
    temperature: 0.7
  },
  openai: {
    model: "gpt-4",
    maxTokens: 4000,
    temperature: 0.7
  },
  custom: {
    model: "llama-3-70b",
    maxTokens: 6000,
    temperature: 0.8
  }
};

function getDefaultsForProvider(provider: AIProvider): { model: string; maxTokens: number; temperature: number } {
  return defaults[provider];
}
```

#### Task Management Types

##### Task Interface

```typescript
export interface Task extends CreateTaskOptions {
  id: string;
  status: "todo" | "in-progress" | "completed";
  createdAt: number;
  updatedAt: number;
  tags?: string[];
  subtasks?: Task[];
  contentFile?: string;
  enhancedContentFile?: string;
  content?: string;
  documentation?: TaskDocumentation;
  dependencies?: string[];
  description?: string;
  estimatedEffort?: "small" | "medium" | "large";
  prdFile?: string;
  plan?: string;
}
```

**Purpose**: Complete task definition with all metadata

**Properties**:
- **id** (Required, string): Unique task identifier
- **status** (Required, union): Current task status
- **createdAt** (Required, number): Creation timestamp
- **updatedAt** (Required, number): Last update timestamp
- **tags** (Optional, string[]): Task tags for categorization
- **subtasks** (Optional, Task[]): Child tasks
- **contentFile** (Optional, string): File containing task content
- **enhancedContentFile** (Optional, string): File containing AI-enhanced content
- **content** (Optional, string): Task description/content
- **documentation** (Optional, TaskDocumentation): Generated documentation
- **dependencies** (Optional, string[]): Task IDs this task depends on
- **description** (Optional, string): Human-readable description
- **estimatedEffort** (Optional, union): Effort estimate
- **prdFile** (Optional, string): Source PRD file reference
- **plan** (Optional, string): Implementation plan

**Inherited from CreateTaskOptions**:
- **title** (Required, string): Task title
- **content** (Optional, string): Task content
- **effort** (Optional, union): Effort estimate
- **parentId** (Optional, string): Parent task ID
- **aiEnhance** (Optional, boolean): AI enhancement flag

**Usage Examples**:
```typescript
// Basic task
const basicTask: Task = {
  id: "task-123",
  title: "Fix login bug",
  content: "Users cannot login with valid credentials",
  status: "todo",
  effort: "small",
  createdAt: Date.now(),
  updatedAt: Date.now(),
  tags: ["bug", "critical"],
  dependencies: ["task-auth-setup"]
};

// Complex task with subtasks
const complexTask: Task = {
  id: "task-456",
  title: "Build authentication system",
  content: "Implement complete authentication with OAuth2",
  status: "in-progress",
  effort: "large",
  createdAt: Date.now() - 86400000, // 1 day ago
  updatedAt: Date.now(),
  tags: ["feature", "auth"],
  subtasks: [
    {
      id: "task-457",
      title: "Design database schema",
      status: "completed",
      createdAt: Date.now() - 86000000,
      updatedAt: Date.now() - 7200000
    }
  ],
  plan: "1. Design schema\n2. Implement models\n3. Create API endpoints\n4. Add OAuth2\n5. Write tests",
  documentation: {
    lastFetched: Date.now(),
    libraries: ["passport.js", "oauth2"],
    recap: "Authentication system with OAuth2 support",
    files: ["auth.js", "oauth.js"]
  }
};

// AI-enhanced task
const aiEnhancedTask: Task = {
  id: "task-789",
  title: "Implement real-time notifications",
  content: "Add WebSocket-based notifications",
  status: "todo",
  effort: "medium",
  createdAt: Date.now(),
  updatedAt: Date.now(),
  aiEnhance: true,
  enhancedContentFile: ".task-o-matic/enhanced/task-789.md",
  documentation: {
    lastFetched: Date.now(),
    libraries: ["socket.io", "ws"],
    recap: "Real-time notification system using WebSockets",
    files: ["notifications.js", "socket-handler.js"],
    research: {
      "websocket": [
        { query: "WebSocket best practices", doc: "WebSocket API documentation" },
        { query: "socket.io vs ws", doc: "Performance comparison" }
      ]
    }
  }
};
```

##### CreateTaskOptions Interface

```typescript
export interface CreateTaskOptions {
  title: string;
  content?: string;
  effort?: "small" | "medium" | "large";
  parentId?: string;
  aiEnhance?: boolean;
}
```

**Purpose**: Options for creating new tasks

**Usage Examples**:
```typescript
// Simple task creation
const simpleTask: CreateTaskOptions = {
  title: "Write unit tests",
  content: "Add comprehensive unit tests for user service",
  effort: "medium"
};

// Subtask with AI enhancement
const aiSubtask: CreateTaskOptions = {
  title: "Test authentication endpoints",
  parentId: "task-main-auth",
  aiEnhance: true,
  effort: "small"
};
```

##### TaskDocumentation Interface

```typescript
export interface TaskDocumentation {
  lastFetched: number;
  libraries: string[];
  recap: string;
  files: string[];
  research?: Record<
    string,
    Array<{
      query: string;
      doc: string;
    }>
  >;
}
```

**Purpose**: Documentation and research data for tasks

**Properties**:
- **lastFetched** (Required, number): Last documentation update timestamp
- **libraries** (Required, string[]): Relevant libraries detected
- **recap** (Required, string): Documentation summary
- **files** (Required, string[]): Related source files
- **research** (Optional, Record): Research queries and results

**Usage Examples**:
```typescript
const docs: TaskDocumentation = {
  lastFetched: Date.now(),
  libraries: ["react", "redux", "typescript"],
  recap: "React component with Redux state management using TypeScript",
  files: ["UserProfile.tsx", "userSlice.ts", "types.ts"],
  research: {
    "react-hooks": [
      { query: "useEffect best practices", doc: "React documentation" },
      { query: "custom hooks patterns", doc: "React blog tutorial" }
    ],
    "redux": [
      { query: "redux toolkit usage", doc: "Redux Toolkit docs" },
      { query: "typescript integration", doc: "TypeScript guide" }
    ]
  }
};
```

#### AI Operation Types

##### ParsedAITask Interface

```typescript
export interface ParsedAITask {
  title: string;
  description?: string;
  content?: string;
  effort?: "small" | "medium" | "large";
  dependencies?: string[];
  [key: string]: unknown; // Allow additional AI-generated properties
}
```

**Purpose**: Task data parsed from AI responses

**Properties**:
- **title** (Required, string): Task title
- **description** (Optional, string): Task description
- **content** (Optional, string): Task content
- **effort** (Optional, union): Estimated effort
- **dependencies** (Optional, string[]): Task dependencies
- **[key: string]**: Additional AI-generated properties

**Usage Examples**:
```typescript
// Standard AI-parsed task
const standardTask: ParsedAITask = {
  title: "Implement user registration",
  description: "Create registration form with validation",
  content: "Build React component with form validation",
  effort: "medium",
  dependencies: ["task-user-model"]
};

// AI task with custom properties
const customTask: ParsedAITask = {
  title: "Setup CI/CD pipeline",
  description: "Configure GitHub Actions for deployment",
  effort: "large",
  priority: "high", // Custom AI-generated property
  estimatedDays: 5, // Custom AI-generated property
  tools: ["github-actions", "docker"], // Custom AI-generated property
  dependencies: ["task-docker-setup"]
};
```

##### PRDResponse Interface

```typescript
export interface PRDResponse {
  tasks: ParsedAITask[];
  summary: string;
  estimatedDuration: string;
  confidence: number;
}
```

**Purpose**: AI response from PRD parsing

**Usage Examples**:
```typescript
const prdResponse: PRDResponse = {
  tasks: [
    {
      title: "Create user model",
      effort: "small",
      description: "Define user data structure"
    },
    {
      title: "Build authentication",
      effort: "large",
      dependencies: ["task-user-model"]
    }
  ],
  summary: "Complete user authentication system with registration, login, and profile management",
  estimatedDuration: "2-3 weeks",
  confidence: 0.85
};
```

#### Better-T-Stack Integration Types

##### BTSFrontend Type

```typescript
export type BTSFrontend =
  | "tanstack-router"
  | "react-router"
  | "tanstack-start"
  | "next"
  | "nuxt"
  | "svelte"
  | "solid"
  | "native-bare"
  | "native-uniwind"
  | "native-unistyles"
  | "cli"
  | "tui"
  | "opentui"
  | "medusa"
  | "none";
```

**Purpose**: Supported frontend frameworks

**Frontend Categories**:
- **Web Frameworks**: tanstack-router, react-router, tanstack-start, next, nuxt, svelte, solid
- **Native Frameworks**: native-bare, native-uniwind, native-unistyles
- **Task-O-Matic**: cli, tui, opentui
- **E-commerce**: medusa
- **None**: none (no frontend)

**Usage Examples**:
```typescript
function getFrontendCategory(frontend: BTSFrontend): string {
  const webFrameworks = ["tanstack-router", "react-router", "tanstack-start", "next", "nuxt", "svelte", "solid"];
  const nativeFrameworks = ["native-bare", "native-uniwind", "native-unistyles"];
  const taskomatic = ["cli", "tui", "opentui"];
  
  if (webFrameworks.includes(frontend)) return "Web Framework";
  if (nativeFrameworks.includes(frontend)) return "Native Framework";
  if (taskomatic.includes(frontend)) return "Task-O-Matic";
  if (frontend === "medusa") return "E-commerce";
  return "None";
}

// Usage in configuration
const config: BTSConfig = {
  frontend: "next", // Web framework
  backend: "hono",
  database: "postgres",
  auth: "better-auth",
  projectName: "My App"
};
```

##### BTSConfig Interface

```typescript
export interface BTSConfig {
  frontend: BTSFrontend | BTSFrontend[];
  backend: "convex" | "hono" | "express" | "none";
  database: "sqlite" | "postgres" | "mysql" | "none";
  auth: "better-auth" | "clerk" | "none";
  projectName: string;
  runtime: string;
  api: string;
  payments: string;
  orm: string;
  dbSetup: string;
  packageManager: string;
  git: boolean;
  webDeploy: string;
  serverDeploy: string;
  install: boolean;
  includeDocs?: boolean;
  addons: string[];
  examples: string[];
  createdAt?: string;
  _source?: string;
}
```

**Purpose**: Complete Better-T-Stack project configuration

**Key Properties**:
- **frontend** (Required): Single frontend or array of frontends
- **backend** (Required): Backend framework choice
- **database** (Required): Database selection
- **auth** (Required): Authentication solution
- **projectName** (Required): Project name

**Usage Examples**:
```typescript
// Full-stack web application
const fullStackConfig: BTSConfig = {
  frontend: ["next", "react-router"], // Multiple frontends
  backend: "hono",
  database: "postgres",
  auth: "better-auth",
  projectName: "E-commerce Platform",
  runtime: "node",
  api: "none",
  payments: "stripe",
  orm: "prisma",
  dbSetup: "none",
  packageManager: "npm",
  git: true,
  webDeploy: "vercel",
  serverDeploy: "railway",
  install: true,
  includeDocs: true,
  addons: ["turborepo"],
  examples: [],
  createdAt: new Date().toISOString()
};

// CLI-only project
const cliConfig: BTSConfig = {
  frontend: "cli",
  backend: "none",
  database: "none",
  auth: "none",
  projectName: "Task CLI Tool",
  runtime: "none",
  api: "none",
  payments: "none",
  orm: "none",
  dbSetup: "none",
  packageManager: "npm",
  git: true,
  webDeploy: "none",
  serverDeploy: "none",
  install: true,
  addons: [],
  examples: []
};

// Native mobile app
const nativeConfig: BTSConfig = {
  frontend: "native-uniwind",
  backend: "convex",
  database: "sqlite",
  auth: "clerk",
  projectName: "Mobile App",
  runtime: "none",
  api: "none",
  payments: "none",
  orm: "none",
  dbSetup: "none",
  packageManager: "npm",
  git: true,
  webDeploy: "none",
  serverDeploy: "none",
  install: true,
  addons: ["expo"],
  examples: []
};
```

#### Execution and Workflow Types

##### ExecutorTool Type

```typescript
export type ExecutorTool = "opencode" | "claude" | "gemini" | "codex";
```

**Purpose**: Supported external execution tools

**Tools**:
- **opencode**: OpenCode AI coding assistant
- **claude**: Anthropic Claude Code
- **gemini**: Google Gemini Code
- **codex**: OpenAI Codex

**Usage Examples**:
```typescript
function getExecutorConfig(tool: ExecutorTool): { name: string; url: string } {
  const configs = {
    opencode: { name: "OpenCode", url: "https://opencode.ai" },
    claude: { name: "Claude Code", url: "https://claude.ai/code" },
    gemini: { name: "Gemini Code", url: "https://gemini.google.com/code" },
    codex: { name: "Codex", url: "https://openai.com/codex" }
  };
  return configs[tool];
}

// Usage in execution
const executor: ExecutorTool = "claude";
const config = getExecutorConfig(executor);
console.log(`Using ${config.name} for code execution`);
```

##### ExecuteTaskOptions Interface

```typescript
export interface ExecuteTaskOptions {
  taskId: string;
  tool?: ExecutorTool;
  message?: string;
  dry?: boolean;
  validate?: string[];
  model?: string;
  continueSession?: boolean;
  maxRetries?: number;
  tryModels?: ModelAttemptConfig[];
  plan?: boolean;
  planModel?: string;
  reviewPlan?: boolean;
  review?: boolean;
  reviewModel?: string;
  autoCommit?: boolean;
}
```

**Purpose**: Comprehensive options for task execution

**Usage Examples**:
```typescript
// Basic execution
const basicExec: ExecuteTaskOptions = {
  taskId: "task-123",
  tool: "opencode",
  model: "gpt-4o"
};

// Advanced execution with full pipeline
const advancedExec: ExecuteTaskOptions = {
  taskId: "task-456",
  tool: "claude",
  model: "sonnet-4",
  plan: true,
  planModel: "gpt-4o",
  reviewPlan: true,
  review: true,
  reviewModel: "claude-3.5-sonnet",
  validate: ["npm test", "npm run lint"],
  autoCommit: true,
  maxRetries: 3,
  tryModels: [
    { executor: "opencode", model: "gpt-4o-mini" },
    { executor: "claude", model: "sonnet-4" },
    { executor: "gemini", model: "gemini-2.0" }
  ]
};
```

### FUNCTION DOCUMENTATION

No standalone functions in this module - this is a type definition file.

### INTEGRATION PROTOCOLS

#### Service Layer Integration

```typescript
// services/tasks.ts
import { Task, CreateTaskOptions, ExecuteTaskOptions } from '../types';

export class TaskService {
  async createTask(options: CreateTaskOptions): Promise<Task> {
    const task: Task = {
      id: TaskIDGenerator.generate(),
      title: options.title,
      content: options.content,
      effort: options.effort,
      parentId: options.parentId,
      aiEnhance: options.aiEnhance,
      status: "todo",
      createdAt: Date.now(),
      updatedAt: Date.now(),
      tags: [],
      subtasks: []
    };
    
    await this.storage.saveTask(task);
    return task;
  }

  async executeTask(taskId: string, options: ExecuteTaskOptions): Promise<TaskExecutionResult> {
    const task = await this.storage.getTask(taskId);
    if (!task) {
      throw new Error(`Task ${taskId} not found`);
    }

    const executor = this.getExecutor(options.tool || "opencode");
    return await executor.execute(task, options);
  }
}
```

#### AI Service Integration

```typescript
// lib/ai-service/task-operations.ts
import { Task, ParsedAITask, PRDResponse } from '../../types';

export class TaskOperations {
  async parseTasksFromPRD(prdContent: string): Promise<PRDResponse> {
    const response = await this.ai.generateText({
      prompt: `Parse this PRD into tasks:\n${prdContent}`,
      system: "You are a task breakdown expert..."
    });

    return this.parseResponse<PRDResponse>(response);
  }

  async enhanceTask(task: Task): Promise<ParsedAITask> {
    const response = await this.ai.generateText({
      prompt: `Enhance this task:\n${task.content}`,
      system: "You are a task enhancement expert..."
    });

    return this.parseResponse<ParsedAITask>(response);
  }

  private parseResponse<T>(text: string): T {
    try {
      return JSON.parse(text);
    } catch {
      throw new Error("Invalid AI response format");
    }
  }
}
```

#### Storage Integration

```typescript
// lib/storage/file-system.ts
import { Task, TaskDocumentation } from '../../types';

export class FileSystemStorage {
  async saveTask(task: Task): Promise<void> {
    const filePath = path.join(this.tasksDir, `${task.id}.json`);
    await fs.writeFile(filePath, JSON.stringify(task, null, 2));
  }

  async loadTask(taskId: string): Promise<Task | null> {
    const filePath = path.join(this.tasksDir, `${taskId}.json`);
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(content);
    } catch {
      return null;
    }
  }

  async saveTaskDocumentation(taskId: string, docs: TaskDocumentation): Promise<void> {
    const filePath = path.join(this.docsDir, `${taskId}.json`);
    await fs.writeFile(filePath, JSON.stringify(docs, null, 2));
  }
}
```

### SURVIVAL SCENARIOS

#### Scenario 1: Complete Task Lifecycle Management

```typescript
// Complete task management example
class TaskLifecycleManager {
  private storage: TaskRepository;
  private aiService: AIService;

  async createAndEnhanceTask(options: CreateTaskOptions): Promise<Task> {
    // Create initial task
    const task = await this.storage.createTask({
      ...options,
      status: "todo",
      createdAt: Date.now(),
      updatedAt: Date.now()
    });

    // Enhance with AI if requested
    if (options.aiEnhance) {
      const enhanced = await this.aiService.enhanceTask(task);
      
      // Update task with enhanced content
      const updatedTask: Task = {
        ...task,
        content: enhanced.content,
        description: enhanced.description,
        estimatedEffort: enhanced.effort,
        updatedAt: Date.now(),
        enhancedContentFile: `.task-o-matic/enhanced/${task.id}.md`
      };

      await this.storage.updateTask(task.id, updatedTask);
      return updatedTask;
    }

    return task;
  }

  async executeTaskWithPlanning(taskId: string, options: ExecuteTaskOptions): Promise<TaskExecutionResult> {
    const task = await this.storage.getTask(taskId);
    if (!task) {
      throw new Error(`Task ${taskId} not found`);
    }

    // Generate plan if requested
    if (options.plan) {
      const plan = await this.aiService.generatePlan(task, {
        model: options.planModel,
        context: await this.buildContext(task)
      });

      // Save plan to task
      const taskWithPlan: Task = {
        ...task,
        plan: plan.content,
        updatedAt: Date.now()
      };

      await this.storage.updateTask(taskId, taskWithPlan);

      // Review plan if requested
      if (options.reviewPlan) {
        const review = await this.aiService.reviewPlan(plan.content, {
          model: options.reviewModel
        });

        console.log("Plan Review:", review.feedback);
      }
    }

    // Execute task
    return await this.executeTask(task, options);
  }

  private async buildContext(task: Task): Promise<string> {
    const subtasks = task.subtasks || [];
    const dependencies = task.dependencies || [];
    
    let context = `Task: ${task.title}\n`;
    context += `Description: ${task.content || 'No description'}\n`;
    
    if (subtasks.length > 0) {
      context += `Subtasks:\n${subtasks.map(st => `- ${st.title}`).join('\n')}\n`;
    }
    
    if (dependencies.length > 0) {
      context += `Dependencies: ${dependencies.join(', ')}\n`;
    }

    return context;
  }
}
```

#### Scenario 2: Multi-Frontend Project Setup

```typescript
// Project setup with multiple frontends
class MultiFrontendSetup {
  async setupProject(config: BTSConfig): Promise<void> {
    console.log(`Setting up project: ${config.projectName}`);

    // Handle multiple frontends
    const frontends = Array.isArray(config.frontend) ? config.frontend : [config.frontend];
    
    for (const frontend of frontends) {
      if (frontend === "none") continue;
      
      console.log(`Setting up ${frontend} frontend...`);
      await this.setupFrontend(frontend, config);
    }

    // Setup backend if not none
    if (config.backend !== "none") {
      await this.setupBackend(config);
    }

    // Setup database if not none
    if (config.database !== "none") {
      await this.setupDatabase(config);
    }

    // Setup authentication if not none
    if (config.auth !== "none") {
      await this.setupAuth(config);
    }

    console.log("Project setup complete!");
  }

  private async setupFrontend(frontend: BTSFrontend, config: BTSConfig): Promise<void> {
    switch (frontend) {
      case "next":
        await this.setupNextJS(config);
        break;
      case "react-router":
        await this.setupReactRouter(config);
        break;
      case "native-uniwind":
        await this.setupNativeUniwind(config);
        break;
      case "cli":
        await this.setupCLI(config);
        break;
      default:
        console.warn(`Unsupported frontend: ${frontend}`);
    }
  }

  private async setupNextJS(config: BTSConfig): Promise<void> {
    console.log("Installing Next.js dependencies...");
    await this.exec("npm install next react react-dom @types/react @types/react-dom");
    
    console.log("Creating Next.js structure...");
    await this.createDirectory("src/app");
    await this.createDirectory("src/components");
    await this.createDirectory("src/lib");
    
    // Create next.config.js
    const nextConfig = `
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
};

module.exports = nextConfig;
    `;
    await this.writeFile("next.config.js", nextConfig);
  }

  private async setupCLI(config: BTSConfig): Promise<void> {
    console.log("Setting up CLI project...");
    
    // Create CLI structure
    await this.createDirectory("src/commands");
    await this.createDirectory("src/utils");
    await this.createDirectory("src/types");
    
    // Create package.json for CLI
    const cliPackage = {
      name: config.projectName.toLowerCase().replace(/\s+/g, '-'),
      version: "1.0.0",
      bin: `./dist/cli.js`,
      scripts: {
        build: "tsc",
        dev: "tsx src/cli.ts",
        test: "mocha"
      },
      dependencies: {
        commander: "^11.0.0",
        inquirer: "^9.0.0",
        chalk: "^5.0.0"
      },
      devDependencies: {
        typescript: "^5.0.0",
        tsx: "^4.0.0",
        "@types/node": "^20.0.0",
        mocha: "^10.0.0",
        chai: "^4.0.0"
      }
    };
    
    await this.writeFile("package.json", JSON.stringify(cliPackage, null, 2));
  }
}
```

#### Scenario 3: AI Provider Configuration Management

```typescript
// AI configuration management
class AIConfigManager {
  private configs: Map<AIProvider, Partial<AIConfig>> = new Map();

  constructor() {
    this.loadDefaultConfigs();
  }

  private loadDefaultConfigs(): void {
    this.configs.set("openai", {
      maxTokens: 4000,
      temperature: 0.7,
      context7Enabled: true
    });
    
    this.configs.set("anthropic", {
      maxTokens: 8000,
      temperature: 0.7,
      context7Enabled: true,
      reasoning: {
        maxTokens: 5000
      }
    });
    
    this.configs.set("openrouter", {
      maxTokens: 8000,
      temperature: 0.7,
      context7Enabled: true,
      reasoning: {
        maxTokens: 8000
      }
    });
  }

  getConfig(provider: AIProvider, model?: string): AIConfig {
    const baseConfig = this.configs.get(provider) || {};
    const envConfig = this.loadFromEnvironment(provider);
    
    return {
      provider,
      model: model || envConfig.model || baseConfig.model || this.getDefaultModel(provider),
      apiKey: envConfig.apiKey || baseConfig.apiKey,
      baseURL: envConfig.baseURL || baseConfig.baseURL,
      maxTokens: envConfig.maxTokens || baseConfig.maxTokens || 4000,
      temperature: envConfig.temperature || baseConfig.temperature || 0.7,
      context7Enabled: envConfig.context7Enabled ?? baseConfig.context7Enabled ?? true,
      reasoning: envConfig.reasoning || baseConfig.reasoning
    };
  }

  private loadFromEnvironment(provider: AIProvider): Partial<AIConfig> {
    const envVars = this.getEnvVarsForProvider(provider);
    const config: Partial<AIConfig> = {};

    if (envVars.apiKey && process.env[envVars.apiKey]) {
      config.apiKey = process.env[envVars.apiKey];
    }

    if (envVars.model && process.env[envVars.model]) {
      config.model = process.env[envVars.model];
    }

    if (process.env.AI_MAX_TOKENS) {
      config.maxTokens = parseInt(process.env.AI_MAX_TOKENS);
    }

    if (process.env.AI_TEMPERATURE) {
      config.temperature = parseFloat(process.env.AI_TEMPERATURE);
    }

    if (process.env.CUSTOM_API_URL && provider === "custom") {
      config.baseURL = process.env.CUSTOM_API_URL;
    }

    return config;
  }

  private getEnvVarsForProvider(provider: AIProvider): { apiKey?: string; model?: string } {
    switch (provider) {
      case "openai":
        return { apiKey: "OPENAI_API_KEY", model: "AI_MODEL" };
      case "anthropic":
        return { apiKey: "ANTHROPIC_API_KEY", model: "AI_MODEL" };
      case "openrouter":
        return { apiKey: "OPENROUTER_API_KEY", model: "AI_MODEL" };
      case "custom":
        return { apiKey: "CUSTOM_API_KEY", model: "AI_MODEL" };
      default:
        return {};
    }
  }

  private getDefaultModel(provider: AIProvider): string {
    const defaults = {
      openai: "gpt-4",
      anthropic: "claude-3-sonnet-20240229",
      openrouter: "anthropic/claude-3.5-sonnet",
      custom: "llama-3-70b"
    };
    return defaults[provider] || "gpt-4";
  }

  updateConfig(provider: AIProvider, updates: Partial<AIConfig>): void {
    const current = this.configs.get(provider) || {};
    this.configs.set(provider, { ...current, ...updates });
  }

  saveConfig(config: AIConfig): void {
    // Save to project config file
    const configPath = ".task-o-matic/config.json";
    const configData = JSON.stringify(config, null, 2);
    require('fs').writeFileSync(configPath, configData);
  }
}
```

### TECHNICAL SPECIFICATIONS

#### Type Safety Guarantees

1. **Compile-Time Validation**: TypeScript checks all type usage
2. **Runtime Type Guards**: Validation functions for dynamic data
3. **Interface Segregation**: Focused, minimal interfaces
4. **Substitution Principle**: Interfaces can be replaced with implementations

#### Performance Characteristics

1. **Memory Usage**: Efficient object creation
2. **Type Checking**: Zero runtime overhead
3. **Interface Size**: Optimized for common use cases
4. **Compilation**: Fast TypeScript compilation

#### Extensibility Patterns

1. **Open-Ended Types**: `[key: string]: unknown` for AI data
2. **Union Types**: Easy to add new options
3. **Generic Interfaces**: Reusable across contexts
4. **Composition**: Build complex types from simple ones

#### Integration Points

1. **Service Layer**: All services use these types
2. **Storage Layer**: Persistent data structures
3. **AI Layer**: Request/response formats
4. **CLI Layer**: Command option types

**Remember:** Citizen, in the wasteland of complex applications, comprehensive type definitions are your shelter. Every interface is a wall against chaos, every type guard is a watchtower against bugs, and every union type is a bridge between components. Without them, your code becomes radioactive waste.