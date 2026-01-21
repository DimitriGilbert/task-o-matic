# Code Conventions

This document outlines the TypeScript and coding conventions used in task-o-matic.

## TypeScript Rules

### Strict Mode

TypeScript strict mode is enabled. The following are strictly forbidden:

- **No `any` types** - Use proper typing or `unknown` with type guards
- **No `as any` casts** - Use proper type assertions or type guards
- **No `require()` statements** - Use ES module imports only
- **No dynamic `import()`** - Use static imports only

### Type Safety

Always fix LSP errors immediately. Do not ignore, delay, or add technical debt.

```typescript
// Good
import { TaskService } from "../services";

// Bad
const TaskService = require("../services");
// OR
const { TaskService } = await import("../services");
```

### Naming Conventions

- **Variables and functions**: `camelCase`
- **Classes and interfaces**: `PascalCase`
- **Files**: `kebab-case.ts` (e.g., `task-service.ts`)
- **Constants**: `UPPER_SNAKE_CASE`
- **Types and interfaces**: `PascalCase` with descriptive names

### Import/Export Patterns

- Use named exports over default exports
- Use ES module imports: `import { ... } from "..."`;
- Barrel exports (`index.ts`) for organizing public APIs

```typescript
// Good
export interface Task { ... }
export class TaskService { ... }

// Usage
import { Task, TaskService } from "task-o-matic-core";

// Avoid
export default class TaskService { ... }
```

### Async/Await

Prefer `async/await` over `.then()` chains for better readability:

```typescript
// Good
async function createTask(data: TaskData) {
  const task = await storage.save(data);
  return task;
}

// Avoid
function createTask(data: TaskData) {
  return storage.save(data).then(task => task);
}
```

## Error Handling

Use `TaskOMaticError` for domain errors with structured information:

```typescript
import { createStandardError, TaskOMaticErrorCodes } from "../utils";

throw createStandardError(
  TaskOMaticErrorCodes.TASK_NOT_FOUND,
  `Task with ID "${taskId}" not found`,
  {
    context: "The task could not be found in storage",
    suggestions: [
      "Verify the task ID is correct",
      "Check if the task was deleted"
    ]
  }
);
```

Wrap async operations in `try/catch` blocks. Never suppress errors silently.

## File System Operations

- Use absolute paths when using tools
- Construct paths with `path.join()`
- Be mindful of monorepo structure (packages/core vs packages/cli)

```typescript
import path from "path";

const fullPath = path.join(process.cwd(), "src", "services", "task-service.ts");
```

## Service Layer Patterns

### Dependency Injection

Services accept optional dependencies for testability:

```typescript
interface TaskServiceDependencies {
  storage?: ReturnType<typeof getStorage>;
  aiOperations?: ReturnType<typeof getAIOperations>;
}

class TaskService {
  private storage: ReturnType<typeof getStorage>;

  constructor(dependencies: TaskServiceDependencies = {}) {
    this.storage = dependencies.storage ?? getStorage();
  }
}
```

### Factory Pattern

Use factory functions for service creation:

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

## Code Organization

- **Services**: Business logic in `services/`
- **Libraries**: Core utilities and abstractions in `lib/`
- **Types**: Shared types in `types/`
- **Utils**: Reusable utilities in `utils/`
- **Prompts**: AI prompt templates in `prompts/`

## Related Documentation

- [Testing Patterns](TESTING.md)
- [Architecture Patterns](ARCHITECTURE.md)
- [AGENTS.md](../AGENTS.md) (root documentation)
