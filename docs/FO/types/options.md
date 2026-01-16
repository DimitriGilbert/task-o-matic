## TECHNICAL BULLETIN NO. 004
### OPTIONS TYPES - COMMAND OPERATION DEFINITION SYSTEM

**DOCUMENT ID:** `task-o-matic-options-types-v1`
**CLEARANCE:** `All Personnel`
**MANDATORY COMPLIANCE:** `Yes`

### ⚠️ CRITICAL SURVIVAL NOTICE
Citizen, ignore these option types and your commands become lost in translation. Parameters misinterpret, validation fails, and your CLI becomes a tower of babel where no one understands each other. This is your command language foundation.

### TYPE SYSTEM ARCHITECTURE

The options types system provides **specialized interfaces** for each command operation. It uses **inheritance patterns** and **composition** to create reusable, type-safe command configurations. The architecture supports:

- **Command-Specific Options**: Tailored interfaces for each operation
- **AI Integration**: Streaming and provider configuration
- **Validation Patterns**: Type-safe parameter handling
- **Extensibility**: Easy to add new command options
- **Consistency**: Standardized patterns across commands

This design enables **clear command contracts** while maintaining flexibility for different command requirements.

### COMPLETE TYPE DOCUMENTATION

#### Base AI Options

##### AIProviderOptions Interface

```typescript
export interface AIProviderOptions {
  aiProvider?: string;
  aiModel?: string;
  aiKey?: string;
  aiProviderUrl?: string;
  aiReasoning?: string;
}
```

**Purpose**: Base AI provider configuration options

**Properties**:
- **aiProvider** (Optional, string): AI provider name (openai, anthropic, openrouter, custom, gemini, zai)
- **aiModel** (Optional, string): AI model name
- **aiKey** (Optional, string): API authentication key
- **aiProviderUrl** (Optional, string): Custom endpoint URL
- **aiReasoning** (Optional, string): Reasoning token limit (for OpenRouter)

**Usage Examples**:
```typescript
const openaiOptions: AIProviderOptions = {
  aiProvider: "openai",
  aiModel: "gpt-4",
  aiKey: "sk-openai-..."
};

const anthropicOptions: AIProviderOptions = {
  aiProvider: "anthropic",
  aiModel: "claude-3.5-sonnet",
  aiKey: "sk-ant-...",
  aiReasoning: "5000"
};

const customOptions: AIProviderOptions = {
  aiProvider: "custom",
  aiModel: "llama-3-70b",
  aiProviderUrl: "https://api.custom-ai.com/v1",
  aiKey: "custom-key"
};
```

##### StreamingAIOptions Interface

```typescript
export interface StreamingAIOptions extends AIProviderOptions {
  stream?: boolean;
}
```

**Purpose**: AI options with streaming support

**Inherited Properties**: From `AIProviderOptions`

**Specific Properties**:
- **stream** (Optional, boolean): Enable streaming output

**Usage Examples**:
```typescript
const streamingOpenAI: StreamingAIOptions = {
  aiProvider: "openai",
  aiModel: "gpt-4",
  stream: true
};

const nonStreamingAnthropic: StreamingAIOptions = {
  aiProvider: "anthropic",
  aiModel: "claude-3.5-sonnet",
  stream: false
};
```

#### Task Management Options

##### ListTasksOptions Interface

```typescript
export interface ListTasksOptions {
  status?: string;
  tag?: string;
}
```

**Purpose**: Options for listing tasks with filtering

**Properties**:
- **status** (Optional, string): Filter by task status
- **tag** (Optional, string): Filter by tag name

**Usage Examples**:
```typescript
const todoTasks: ListTasksOptions = {
  status: "todo"
};

const bugTasks: ListTasksOptions = {
  tag: "bug"
};

const todoBugs: ListTasksOptions = {
  status: "todo",
  tag: "bug"
};
```

##### ShowTaskOptions Interface

```typescript
export interface ShowTaskOptions {
  id: string;
}
```

**Purpose**: Options for displaying detailed task information

**Properties**:
- **id** (Required, string): Task ID to display

**Usage Examples**:
```typescript
const showTask: ShowTaskOptions = {
  id: "task-123"
};
```

##### CreateTaskOptions Interface

```typescript
export interface CreateTaskOptions extends StreamingAIOptions {
  title: string;
  content?: string;
  effort?: string;
  parentId?: string;
  aiEnhance?: boolean;
  taskId?: string;
}
```

**Purpose**: Options for creating new tasks

**Inherited Properties**: From `StreamingAIOptions`

**Specific Properties**:
- **title** (Required, string): Task title
- **content** (Optional, string): Task description
- **effort** (Optional, string): Effort estimate
- **parentId** (Optional, string): Parent task ID
- **aiEnhance** (Optional, boolean): Use AI to enhance task description
- **taskId** (Optional, string): Internal use for pre-defining an ID

**Usage Examples**:
```typescript
const basicTask: CreateTaskOptions = {
  title: "Fix login bug",
  content: "Users cannot login with valid credentials",
  effort: "small"
};

const aiEnhanced: CreateTaskOptions = {
  title: "Implement OAuth2 flow",
  content: "Create OAuth2 authentication with refresh tokens",
  effort: "medium",
  aiEnhance: true,
  aiProvider: "anthropic",
  stream: true
};
```

##### DocumentTaskOptions Interface

```typescript
export interface DocumentTaskOptions extends StreamingAIOptions {
  taskId: string;
  force?: boolean;
}
```

**Purpose**: Options for generating task documentation

**Inherited Properties**: From `StreamingAIOptions`

**Specific Properties**:
- **taskId** (Required, string): Task ID to document
- **force** (Optional, boolean): Regenerate documentation even if exists

**Usage Examples**:
```typescript
const basicDoc: DocumentTaskOptions = {
  taskId: "task-123",
  aiProvider: "anthropic",
  stream: true
};

const forceDoc: DocumentTaskOptions = {
  taskId: "task-123",
  force: true,
  aiProvider: "openrouter",
  aiModel: "claude-3.5-sonnet"
};
```

##### EnhanceTaskOptions Interface

```typescript
export interface EnhanceTaskOptions extends StreamingAIOptions {
  taskId: string;
  all?: boolean;
}
```

**Purpose**: Options for enhancing tasks with AI

**Inherited Properties**: From `StreamingAIOptions`

**Specific Properties**:
- **taskId** (Required, string): Specific task ID to enhance
- **all** (Optional, boolean): Enhance all tasks (handled in command, not passed to function)

**Usage Examples**:
```typescript
const enhanceSingle: EnhanceTaskOptions = {
  taskId: "task-123",
  aiProvider: "anthropic",
  stream: true
};

const enhanceAll: EnhanceTaskOptions = {
  all: true,
  aiProvider: "openrouter",
  aiReasoning: "5000"
};
```

##### SplitTaskOptions Interface

```typescript
export interface SplitTaskOptions extends StreamingAIOptions {
  taskId: string;
  all?: boolean;
  prompt?: string;
  message?: string;
}
```

**Purpose**: Options for splitting tasks into subtasks

**Inherited Properties**: From `StreamingAIOptions`

**Specific Properties**:
- **taskId** (Required, string): Specific task ID to split
- **all** (Optional, boolean): Split all tasks (handled in command, not passed to function)
- **prompt** (Optional, string): Custom splitting prompt
- **message** (Optional, string): Alias for prompt

**Usage Examples**:
```typescript
const basicSplit: SplitTaskOptions = {
  taskId: "task-123",
  aiProvider: "anthropic",
  stream: true
};

const customSplit: SplitTaskOptions = {
  taskId: "task-123",
  prompt: "Split this into user interface and backend components",
  aiProvider: "openrouter",
  aiModel: "claude-3.5-sonnet"
};

const splitAll: SplitTaskOptions = {
  all: true,
  message: "Break down into implementable subtasks"
};
```

##### PlanTaskOptions Interface

```typescript
export interface PlanTaskOptions extends StreamingAIOptions {
  id: string;
}
```

**Purpose**: Options for generating implementation plans

**Inherited Properties**: From `StreamingAIOptions`

**Specific Properties**:
- **id** (Required, string): Task ID to plan

**Usage Examples**:
```typescript
const planTask: PlanTaskOptions = {
  id: "task-123",
  aiProvider: "anthropic",
  aiModel: "claude-3.5-sonnet",
  stream: true
};
```

##### GetPlanOptions Interface

```typescript
export interface GetPlanOptions {
  id: string;
}
```

**Purpose**: Options for retrieving existing implementation plan

**Properties**:
- **id** (Required, string): Task ID whose plan to retrieve

**Usage Examples**:
```typescript
const getPlan: GetPlanOptions = {
  id: "task-123"
};
```

##### UpdateTaskOptions Interface

```typescript
export interface UpdateTaskOptions {
  id: string;
  title?: string;
  description?: string;
  status?: "todo" | "in-progress" | "completed";
  effort?: "small" | "medium" | "large";
  tags?: string;
}
```

**Purpose**: Options for updating task properties

**Properties**:
- **id** (Required, string): Task ID to update
- **title** (Optional, string): New task title
- **description** (Optional, string): New task description
- **status** (Optional, union): New task status
- **effort** (Optional, union): New effort estimate
- **tags** (Optional, string): Comma-separated tag list

**Usage Examples**:
```typescript
const updateStatus: UpdateTaskOptions = {
  id: "task-123",
  status: "in-progress"
};

const updateMultiple: UpdateTaskOptions = {
  id: "task-123",
  title: "Fix critical authentication bug",
  description: "Users cannot login due to token validation error",
  status: "in-progress",
  effort: "medium",
  tags: "bug,critical,security"
};
```

##### DeleteTaskOptions Interface

```typescript
export interface DeleteTaskOptions {
  id: string;
  force?: boolean;
  cascade?: boolean;
}
```

**Purpose**: Options for deleting tasks

**Properties**:
- **id** (Required, string): Task ID to delete
- **force** (Optional, boolean): Skip confirmation prompts
- **cascade** (Optional, boolean): Delete subtasks recursively

**Usage Examples**:
```typescript
const deleteTask: DeleteTaskOptions = {
  id: "task-123"
};

const forceDelete: DeleteTaskOptions = {
  id: "task-123",
  force: true
};

const cascadeDelete: DeleteTaskOptions = {
  id: "task-123",
  cascade: true,
  force: true
};
```

##### SetTaskStatusOptions Interface

```typescript
export interface SetTaskStatusOptions {
  id: string;
  status: "todo" | "in-progress" | "completed";
}
```

**Purpose**: Options for setting task status

**Properties**:
- **id** (Required, string): Task ID to update
- **status** (Required, union): New status value

**Usage Examples**:
```typescript
const startTask: SetTaskStatusOptions = {
  id: "task-123",
  status: "in-progress"
};

const completeTask: SetTaskStatusOptions = {
  id: "task-123",
  status: "completed"
};
```

##### ManageTagsOptions Interface

```typescript
export interface ManageTagsOptions {
  id: string;
  tags: string;
}
```

**Purpose**: Options for managing task tags

**Properties**:
- **id** (Required, string): Task ID to modify
- **tags** (Required, string): Comma-separated tag list

**Usage Examples**:
```typescript
const addTags: ManageTagsOptions = {
  id: "task-123",
  tags: "bug,critical,frontend"
};

const removeTags: ManageTagsOptions = {
  id: "task-123",
  tags: "bug,critical"
};
```

##### DeletePlanOptions Interface

```typescript
export interface DeletePlanOptions {
  id: string;
}
```

**Purpose**: Options for deleting task implementation plan

**Properties**:
- **id** (Required, string): Task ID whose plan to delete

**Usage Examples**:
```typescript
const deletePlan: DeletePlanOptions = {
  id: "task-123"
};
```

##### ListSubtasksOptions Interface

```typescript
export interface ListSubtasksOptions {
  id: string;
}
```

**Purpose**: Options for listing task subtasks

**Properties**:
- **id** (Required, string): Parent task ID

**Usage Examples**:
```typescript
const listSubtasks: ListSubtasksOptions = {
  id: "task-parent-123"
};
```

##### TaskTreeOptions Interface

```typescript
export interface TaskTreeOptions {
  id?: string;
}
```

**Purpose**: Options for displaying task hierarchy

**Properties**:
- **id** (Optional, string): Root task ID (shows all if omitted)

**Usage Examples**:
```typescript
const fullTree: TaskTreeOptions = {};

const subtree: TaskTreeOptions = {
  id: "task-parent-123"
};
```

##### GetNextTaskOptions Interface

```typescript
export interface GetNextTaskOptions {
  status?: "todo" | "in-progress";
  tag?: string;
  effort?: "small" | "medium" | "large";
  priority?: "newest" | "oldest" | "effort";
}
```

**Purpose**: Options for retrieving next available task

**Properties**:
- **status** (Optional, union): Filter by status
- **tag** (Optional, string): Filter by tag
- **effort** (Optional, union): Filter by effort level
- **priority** (Optional, union): Sort order priority

**Usage Examples**:
```typescript
const nextTodo: GetNextTaskOptions = {
  status: "todo"
};

const nextLarge: GetNextTaskOptions = {
  effort: "large",
  priority: "oldest"
};

const nextBug: GetNextTaskOptions = {
  tag: "bug",
  status: "todo",
  priority: "newest"
};
```

#### PRD Management Options

##### ParsePrdOptions Interface

```typescript
export interface ParsePrdOptions extends StreamingAIOptions {
  file: string;
  prompt?: string;
  message?: string;
}
```

**Purpose**: Options for parsing Product Requirements Documents

**Inherited Properties**: From `StreamingAIOptions`

**Specific Properties**:
- **file** (Required, string): Path to PRD file
- **prompt** (Optional, string): Custom parsing prompt
- **message** (Optional, string): Alias for prompt

**Usage Examples**:
```typescript
const basicPrd: ParsePrdOptions = {
  file: "./docs/PRD.md",
  aiProvider: "anthropic",
  stream: true
};

const customParse: ParsePrdOptions = {
  file: "./docs/PRD.md",
  prompt: "Focus on technical requirements and user stories",
  message: "Extract actionable tasks from this PRD",
  aiProvider: "openrouter",
  aiModel: "claude-3.5-sonnet"
};
```

##### ReworkPrdOptions Interface

```typescript
export interface ReworkPrdOptions extends StreamingAIOptions {
  file: string;
  feedback: string;
  output?: string;
  prompt?: string;
  message?: string;
}
```

**Purpose**: Options for reworking PRDs based on feedback

**Inherited Properties**: From `StreamingAIOptions`

**Specific Properties**:
- **file** (Required, string): Path to PRD file
- **feedback** (Required, string): Feedback for improvements
- **output** (Optional, string): Output file path
- **prompt** (Optional, string): Custom rework prompt
- **message** (Optional, string): Alias for prompt

**Usage Examples**:
```typescript
const basicRework: ReworkPrdOptions = {
  file: "./docs/PRD.md",
  feedback: "Add more technical details and acceptance criteria",
  aiProvider: "anthropic",
  stream: true
};

const customRework: ReworkPrdOptions = {
  file: "./docs/PRD.md",
  feedback: "Include security requirements and performance metrics",
  output: "./docs/PRD-v2.md",
  prompt: "Improve this PRD with specific focus on security",
  aiProvider: "openrouter",
  aiModel: "claude-3.5-sonnet"
};
```

#### Workflow Options

##### WorkflowStep Type

```typescript
export type WorkflowStep =
  | "initialize"
  | "define-prd"
  | "stack-suggestion"
  | "bootstrap"
  | "question-refine-prd"
  | "refine-prd"
  | "generate-tasks"
  | "split-tasks"
  | "complete";
```

**Purpose**: Defined workflow automation steps

**Step Definitions**:
- **"initialize"**: Project initialization
- **"define-prd"**: PRD creation/upload
- **"stack-suggestion"**: Better-T-Stack configuration
- **"bootstrap"**: Project bootstrapping
- **"question-refine-prd"**: AI-driven PRD questioning
- **"refine-prd"**: PRD improvement based on feedback
- **"generate-tasks"**: Task creation from PRD
- **"split-tasks"**: Task breakdown into subtasks
- **"complete"**: Workflow completion

##### AIAssistedChoice Interface

```typescript
export interface AIAssistedChoice<T = any> {
  userInput: string;
  availableOptions: T[];
  context: string;
  recommendation?: T;
}
```

**Purpose**: AI-assisted decision making structure

**Properties**:
- **userInput** (Required, string): User's input
- **availableOptions** (Required, array): Available choices
- **context** (Required, string): Decision context
- **recommendation** (Optional, T): AI's recommendation

**Usage Examples**:
```typescript
const frontendChoice: AIAssistedChoice<string> = {
  userInput: "I want to build a web app",
  availableOptions: ["next", "react-router", "nuxt", "svelte"],
  context: "Frontend framework selection",
  recommendation: "next"
};

const databaseChoice: AIAssistedChoice<string> = {
  userInput: "I need to store user data",
  availableOptions: ["postgres", "mysql", "sqlite"],
  context: "Database selection",
  recommendation: "postgres"
};
```

##### InitConfigChoice Interface

```typescript
export interface InitConfigChoice {
  projectName: string;
  aiProvider: string;
  aiModel: string;
  aiProviderUrl?: string;
  frontend?: string;
  backend?: string;
  database?: string;
  auth?: boolean;
  reasoning?: string;
}
```

**Purpose**: Complete project initialization configuration

**Properties**:
- **projectName** (Required, string): Project name
- **aiProvider** (Required, string): AI provider
- **aiModel** (Required, string): AI model
- **aiProviderUrl** (Optional, string): Custom AI endpoint
- **frontend** (Optional, string): Frontend framework
- **backend** (Optional, string): Backend framework
- **database** (Optional, string): Database choice
- **auth** (Optional, boolean): Include authentication
- **reasoning** (Optional, string): Reasoning token limit

**Usage Examples**:
```typescript
const fullStackConfig: InitConfigChoice = {
  projectName: "E-commerce Platform",
  aiProvider: "anthropic",
  aiModel: "claude-3.5-sonnet",
  frontend: "next",
  backend: "hono",
  database: "postgres",
  auth: true,
  reasoning: "5000"
};

const cliConfig: InitConfigChoice = {
  projectName: "Task CLI Tool",
  aiProvider: "openrouter",
  aiModel: "anthropic/claude-3.5-sonnet",
  frontend: "cli",
  backend: "none",
  database: "none",
  auth: false
};
```

### FUNCTION DOCUMENTATION

No standalone functions in this module - this is a type definition file.

### INTEGRATION PROTOCOLS

#### Command Handler Integration

```typescript
import {
  ListTasksOptions,
  CreateTaskOptions,
  UpdateTaskOptions,
  DeleteTaskOptions,
  EnhanceTaskOptions,
  SplitTaskOptions,
  PlanTaskOptions,
  DocumentTaskOptions
} from '../../types/options';

export class TaskCommandHandlers {
  async handleList(options: ListTasksOptions): Promise<void> {
    const tasks = await this.taskService.listTasks({
      status: options.status,
      tag: options.tag
    });

    this.displayTasks(tasks);
  }

  async handleCreate(options: CreateTaskOptions): Promise<void> {
    const task = await this.taskService.createTask({
      title: options.title,
      content: options.content,
      effort: options.effort as "small" | "medium" | "large",
      parentId: options.parentId,
      aiEnhance: options.aiEnhance
    }, {
      aiProvider: options.aiProvider,
      aiModel: options.aiModel,
      apiKey: options.aiKey,
      baseURL: options.aiProviderUrl,
      stream: options.stream
    });

    console.log(`Created task: ${task.id}`);
  }

  async handleUpdate(options: UpdateTaskOptions): Promise<void> {
    const tags = options.tags ? options.tags.split(',').map(t => t.trim()) : undefined;

    await this.taskService.updateTask(options.id, {
      title: options.title,
      description: options.description,
      status: options.status,
      effort: options.effort,
      tags
    });

    console.log(`Updated task: ${options.id}`);
  }

  async handleDelete(options: DeleteTaskOptions): Promise<void> {
    await this.taskService.deleteTask(options.id, {
      force: options.force,
      cascade: options.cascade
    });

    console.log(`Deleted task: ${options.id}`);
  }

  async handleEnhance(options: EnhanceTaskOptions): Promise<void> {
    if (options.all) {
      const tasks = await this.taskService.listTasks();
      for (const task of tasks) {
        await this.enhanceSingleTask(task.id, options);
      }
    } else {
      await this.enhanceSingleTask(options.taskId, options);
    }
  }

  private async enhanceSingleTask(taskId: string, options: EnhanceTaskOptions): Promise<void> {
    await this.taskService.enhanceTask(taskId, {
      aiProvider: options.aiProvider,
      aiModel: options.aiModel,
      apiKey: options.aiKey,
      baseURL: options.aiProviderUrl,
      stream: options.stream
    });
  }
}
```

### TECHNICAL SPECIFICATIONS

#### Interface Design Patterns

1. **Optional Properties**: All non-essential properties marked optional
2. **Type Safety**: Union types for constrained values
3. **Inheritance**: Base interfaces extended for reusability
4. **Composition**: Multiple interface combination
5. **Consistency**: Standardized naming conventions

#### Validation Rules

1. **Required Fields**: Enforced at compile time
2. **Union Types**: Limited to predefined values
3. **String Constraints**: Comma-separated lists for tags
4. **Boolean Flags**: Consistent true/false patterns
5. **AI Integration**: Standardized AI configuration

#### Performance Considerations

1. **Object Creation**: Minimal overhead
2. **Type Checking**: Compile-time validation
3. **Memory Usage**: Efficient property access
4. **Inheritance**: Flat structure for performance

#### Extensibility Guidelines

1. **New Properties**: Add optional properties to interfaces
2. **New Commands**: Create specific option interfaces
3. **Backward Compatibility**: Optional properties don't break existing code
4. **Type Guards**: Add validation for new properties

**Remember:** Citizen, in wasteland of command-line interfaces, well-defined option types are your compass. Every interface is a map through desert of user input, and every type constraint is a wellspring of predictability. Without them, your commands become lost in sands of ambiguity.
