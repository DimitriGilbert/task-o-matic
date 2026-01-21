# Architecture Patterns

This document outlines the architectural patterns and design principles used in task-o-matic.

## Project Structure

Task-o-matic is a monorepo with two main packages:

- **`packages/core/`**: Framework-agnostic core library with business logic
- **`packages/cli/`**: Terminal interface for user interaction

The core library can be used independently by TUI, web apps, or custom integrations.

## Service Layer Pattern

Business logic is organized into services in `packages/core/src/services/`:

- **WorkflowService**: Orchestrates complete workflows (init, PRD, tasks, execution)
- **TaskService**: Handles task CRUD operations and AI enhancements
- **PRDService**: Manages Product Requirements Document parsing and generation
- **WorkflowAIAssistant**: AI-powered decision making for workflow steps

### Service Characteristics

- **Orchestration**: Services coordinate between different components
- **State management**: Services own their state and persistence
- **AI integration**: Each service has specific AI operations
- **Event emission**: Services emit events for extensibility

Example:

```typescript
class TaskService {
  async createTask(options: CreateTaskOptions): Promise<Task> {
    // 1. Validate input
    // 2. Create task
    // 3. Emit event
    // 4. Return result
  }
}
```

## Dependency Injection

Services accept optional dependencies for testability:

```typescript
interface TaskServiceDependencies {
  storage?: ReturnType<typeof getStorage>;
  aiOperations?: ReturnType<typeof getAIOperations>;
  modelProvider?: ReturnType<typeof getModelProvider>;
  contextBuilder?: ReturnType<typeof getContextBuilder>;
}

class TaskService {
  private storage: ReturnType<typeof getStorage>;

  constructor(dependencies: TaskServiceDependencies = {}) {
    this.storage = dependencies.storage ?? getStorage();
  }
}
```

This allows easy mocking in tests:

```typescript
const mockStorage = { save: async (t) => t };
const service = new TaskService({ storage: mockStorage });
```

## Factory Pattern

Singleton services are managed through factory functions:

```typescript
// ai-service-factory.ts
let aiServiceInstance: AIService | null = null;

export function getAIService(): AIService {
  if (!aiServiceInstance) {
    aiServiceInstance = new AIService();
  }
  return aiServiceInstance;
}
```

Benefits:
- Lazy initialization
- Single instance guarantee
- Easy testing with `injectTestInstances`

## Separation of Concerns

```
packages/core/src/
├── services/      # Business logic orchestration
├── lib/           # Core utilities and abstractions
├── types/         # TypeScript type definitions
├── utils/         # Reusable helper functions
└── prompts/       # AI prompt templates
```

### Services Layer

Orchestrates business logic and coordinates between different components.

Look for implementations matching `**/services/**/*.ts`.

### Lib Layer

Core utilities and abstractions:
- **Storage**: File-based persistence
- **Config**: Configuration management
- **Hooks**: Event system for extensibility
- **AI Operations**: Modular AI operations

### Types Layer

Centralized type definitions in `types/index.ts`:
- Union types for enums
- Interface definitions
- Configuration types
- Domain models

## AI Integration Architecture

### Modular AI Operations

AI operations are organized by domain:

- **BaseOperations**: Common AI functionality
- **TaskOperations**: Task-specific operations (enhancement, splitting)
- **PRDOperations**: PRD parsing and generation
- **DocumentationOperations**: Context7 integration

Each operation class:
- Extends base functionality
- Implements domain-specific logic
- Supports streaming responses
- Captures metrics (tokens, duration)

### Streaming Support

All AI operations support streaming for real-time feedback:

```typescript
interface StreamingOptions {
  onChunk?: (chunk: string) => void;
  onReasoning?: (text: string) => void;
  onFinish?: (result: { text: string; metrics: AIMetrics }) => void;
}

await taskService.createTask({
  title: "Build feature",
  aiEnhance: true,
  streamingOptions: {
    onChunk: (chunk) => console.log(chunk),
    onReasoning: (text) => console.log(`Thinking: ${text}`),
  }
});
```

### Context7 Integration

Context7 client fetches up-to-date documentation:

```typescript
class Context7Client {
  async initializeMCPClient() {
    this.mcpClient = await experimental_createMCPClient({
      transport: {
        type: "http",
        url: "https://mcp.context7.com/mcp",
      },
    });
  }

  async fetchDocs(libraryId: string, query: string) {
    // Fetch and cache documentation
  }
}
```

## Configuration Management

Configuration has clear precedence:

1. **Explicit options** (highest priority)
2. **Config file** (`.task-o-matic/config.json`)
3. **Environment variables**
4. **Defaults** (lowest priority)

```typescript
const config = {
  aiProvider: options.aiProvider ?? config.aiProvider ?? process.env.AI_PROVIDER ?? "anthropic"
};
```

## Error Handling Architecture

### Structured Errors

Use `TaskOMaticError` with structured information:

```typescript
interface TaskOMaticError extends Error {
  code: TaskOMaticErrorCodes;
  context?: string;
  suggestions?: string[];
}

throw createStandardError(
  TaskOMaticErrorCodes.TASK_NOT_FOUND,
  "Task not found",
  {
    context: "The task could not be found",
    suggestions: ["Check task ID", "Verify task exists"]
  }
);
```

### Error Codes

Standardized error codes for different categories:
- `TASK_NOT_FOUND`
- `INVALID_CONFIG`
- `AI_OPERATION_FAILED`
- `PRD_PARSE_ERROR`

## Event System

Hook registry enables extensibility:

```typescript
import { hooks } from "./lib/hook-registry";

hooks.on("task:created", (payload) => {
  console.log(`Task created: ${payload.task.id}`);
});

await hooks.emit("task:created", { task: newTask });
```

Common events:
- `task:created`
- `task:updated`
- `prd:parsed`
- `workflow:completed`

## Storage Architecture

Local file-based storage in `.task-o-matic/` directory:

```
.task-o-matic/
├── config.json              # Configuration
├── tasks.json               # Task database
├── ai-metadata.json         # AI enhancement metadata
├── tasks/                   # Large task content
├── plans/                   # Implementation plans
├── docs/                    # Cached documentation
└── prd/                     # PRD versions
```

Storage abstraction allows easy replacement with database or cloud storage.

## Type Safety

All code uses TypeScript strict mode:
- No `any` types
- Comprehensive type coverage
- Interface-based design
- Union types for enums

## Related Documentation

- [Code Conventions](CONVENTIONS.md)
- [Testing Patterns](TESTING.md)
- [AGENTS.md](../AGENTS.md) (root documentation)
