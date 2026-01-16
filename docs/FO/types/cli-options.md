## TECHNICAL BULLETIN NO. 002
### CLI OPTIONS - COMMAND OPTION DEFINITION SYSTEM

**DOCUMENT ID:** `task-o-matic-cli-options-v1`
**CLEARANCE:** `All Personnel`
**MANDATORY COMPLIANCE:** `Yes`

### ⚠️ CRITICAL SURVIVAL NOTICE
Citizen, ignore these CLI option types and your commands become lost in translation. Parameters misinterpret, validation fails, and your CLI becomes a tower of babel where no one understands each other. This is your command language foundation.

### TYPE SYSTEM ARCHITECTURE

The CLI options system provides **specialized interfaces** for each command operation in the CLI layer. It uses **interface composition** and **inheritance patterns** to create reusable, type-safe command configurations. The architecture supports:

- **Command-Specific Options**: Tailored interfaces for each CLI command
- **Common Option Patterns**: Reusable interfaces for shared options
- **AI Integration**: Streaming and provider configuration
- **Validation Patterns**: Type-safe parameter handling
- **Extensibility**: Easy to add new command options
- **Consistency**: Standardized patterns across commands

This design enables **clear command contracts** while maintaining flexibility for different command requirements.

### COMPLETE TYPE DOCUMENTATION

#### Common Option Interfaces

##### TaskIdOrAllOptions Interface

```typescript
export interface TaskIdOrAllOptions {
  taskId?: string;
  all?: boolean;
}
```

**Purpose**: Common pattern for commands that operate on a specific task or all tasks

**Properties**:
- **taskId** (Optional, string): ID of specific task to operate on
- **all** (Optional, boolean): Whether to operate on all tasks

**Usage Examples**:
```typescript
// Single task operation
const singleTask: TaskIdOrAllOptions = {
  taskId: "task-123"
};

// All tasks operation
const allTasks: TaskIdOrAllOptions = {
  all: true
};
```

##### FilterOptions Interface

```typescript
export interface FilterOptions {
  status?: "todo" | "in-progress" | "completed";
  tag?: string;
}
```

**Purpose**: Common filtering options for task listing

**Properties**:
- **status** (Optional, union): Filter by task status
- **tag** (Optional, string): Filter by tag name

**Usage Examples**:
```typescript
// Filter by status
const todoTasks: FilterOptions = {
  status: "todo"
};

// Filter by tag
const criticalTasks: FilterOptions = {
  tag: "critical"
};

// Combined filters
const criticalTodo: FilterOptions = {
  status: "todo",
  tag: "critical"
};
```

##### DryRunOptions Interface

```typescript
export interface DryRunOptions {
  dry?: boolean;
}
```

**Purpose**: Enable dry-run mode for previewing operations

**Properties**:
- **dry** (Optional, boolean): If true, show what would happen without executing

**Usage Examples**:
```typescript
// Dry run
const dryRun: DryRunOptions = {
  dry: true
};

// Normal execution
const normalRun: DryRunOptions = {
  dry: false
};
```

##### ForceOptions Interface

```typescript
export interface ForceOptions {
  force?: boolean;
}
```

**Purpose**: Force operations without confirmation prompts

**Properties**:
- **force** (Optional, boolean): Skip confirmation prompts

**Usage Examples**:
```typescript
// Force deletion
const forceDelete: ForceOptions = {
  force: true
};

// Ask for confirmation
const askDelete: ForceOptions = {
  force: false
};
```

##### StreamingOptions Interface

```typescript
export interface StreamingOptions {
  stream?: boolean;
}
```

**Purpose**: Enable streaming AI responses

**Properties**:
- **stream** (Optional, boolean): Enable real-time output streaming

**Usage Examples**:
```typescript
// Enable streaming
const withStreaming: StreamingOptions = {
  stream: true
};

// No streaming
const withoutStreaming: StreamingOptions = {
  stream: false
};
```

##### AIProviderOptions Interface

```typescript
export interface AIProviderOptions {
  aiProvider?: string;
  aiModel?: string;
  aiKey?: string;
  aiProviderUrl?: string;
  reasoning?: string;
}
```

**Purpose**: AI provider and model configuration options

**Properties**:
- **aiProvider** (Optional, string): AI provider name (openai, anthropic, openrouter, custom, gemini, zai)
- **aiModel** (Optional, string): AI model name
- **aiKey** (Optional, string): API authentication key
- **aiProviderUrl** (Optional, string): Custom endpoint URL
- **reasoning** (Optional, string): Reasoning token limit for OpenRouter

**Usage Examples**:
```typescript
// OpenAI configuration
const openaiConfig: AIProviderOptions = {
  aiProvider: "openai",
  aiModel: "gpt-4",
  aiKey: "sk-openai-..."
};

// Anthropic with reasoning
const anthropicConfig: AIProviderOptions = {
  aiProvider: "anthropic",
  aiModel: "claude-3.5-sonnet",
  aiKey: "sk-ant-...",
  reasoning: "5000"
};

// Custom provider
const customConfig: AIProviderOptions = {
  aiProvider: "custom",
  aiModel: "llama-3-70b",
  aiProviderUrl: "https://api.custom-ai.com/v1",
  aiKey: "custom-key"
};
```

#### Command-Specific Options

##### CreateCommandOptions Interface

```typescript
export interface CreateCommandOptions
  extends StreamingOptions,
    AIProviderOptions {
  title: string;
  content?: string;
  effort?: "small" | "medium" | "large";
  parentId?: string;
  aiEnhance?: boolean;
}
```

**Purpose**: Options for creating new tasks via CLI

**Inherited Properties**: From `StreamingOptions` and `AIProviderOptions`

**Specific Properties**:
- **title** (Required, string): Task title
- **content** (Optional, string): Task description
- **effort** (Optional, union): Effort estimate
- **parentId** (Optional, string): Parent task ID
- **aiEnhance** (Optional, boolean): Use AI to enhance task description

**Usage Examples**:
```typescript
// Basic task creation
const basicTask: CreateCommandOptions = {
  title: "Fix login bug",
  content: "Users cannot login with valid credentials",
  effort: "small"
};

// AI-enhanced subtask
const aiSubtask: CreateCommandOptions = {
  title: "Implement OAuth2 flow",
  aiEnhance: true,
  parentId: "task-parent-123",
  aiProvider: "anthropic",
  aiModel: "claude-3-sonnet-20240229",
  stream: true
};

// Large task
const largeTask: CreateCommandOptions = {
  title: "Build authentication system",
  effort: "large",
  aiEnhance: true
};
```

##### EnhanceCommandOptions Interface

```typescript
export interface EnhanceCommandOptions
  extends TaskIdOrAllOptions,
    FilterOptions,
    DryRunOptions,
    ForceOptions,
    StreamingOptions,
    AIProviderOptions {}
```

**Purpose**: Options for enhancing tasks with AI

**Inherited Properties**: From `TaskIdOrAllOptions`, `FilterOptions`, `DryRunOptions`, `ForceOptions`, `StreamingOptions`, `AIProviderOptions`

**Usage Examples**:
```typescript
// Enhance single task
const enhanceSingle: EnhanceCommandOptions = {
  taskId: "task-123",
  aiProvider: "anthropic",
  aiModel: "claude-3.5-sonnet",
  stream: true
};

// Enhance all tasks with filter
const enhanceAllFiltered: EnhanceCommandOptions = {
  all: false,
  status: "todo",
  tag: "critical",
  aiProvider: "openrouter",
  aiModel: "anthropic/claude-3.5-sonnet",
  reasoning: "5000"
};

// Enhance all tasks
const enhanceAll: EnhanceCommandOptions = {
  all: true
};
```

##### SplitCommandOptions Interface

```typescript
export interface SplitCommandOptions
  extends TaskIdOrAllOptions,
    FilterOptions,
    DryRunOptions,
    ForceOptions,
    StreamingOptions,
    AIProviderOptions {
  ai?: string[];
  combineAi?: string;
  tools?: boolean;
}
```

**Purpose**: Options for splitting tasks into subtasks

**Inherited Properties**: From `TaskIdOrAllOptions`, `FilterOptions`, `DryRunOptions`, `ForceOptions`, `StreamingOptions`, `AIProviderOptions`

**Specific Properties**:
- **ai** (Optional, string[]): AI models for multi-AI splitting
- **combineAi** (Optional, string): AI model for combining results
- **tools** (Optional, boolean): Enable filesystem tools

**Usage Examples**:
```typescript
// Basic task splitting
const basicSplit: SplitCommandOptions = {
  taskId: "task-123",
  aiProvider: "anthropic",
  aiModel: "claude-3.5-sonnet",
  stream: true
};

// Multi-AI splitting
const multiAISplit: SplitCommandOptions = {
  taskId: "task-456",
  ai: [
    "anthropic:claude-3.5-sonnet",
    "openai:gpt-4o"
  ],
  combineAi: "anthropic:claude-3.5-sonnet",
  tools: true
};

// Split all tasks
const splitAll: SplitCommandOptions = {
  all: true,
  aiProvider: "openrouter",
  aiModel: "anthropic/claude-3.5-sonnet"
};
```

##### PlanCommandOptions Interface

```typescript
export interface PlanCommandOptions
  extends StreamingOptions,
    AIProviderOptions {
  id: string;
}
```

**Purpose**: Options for generating implementation plans

**Inherited Properties**: From `StreamingOptions` and `AIProviderOptions`

**Specific Properties**:
- **id** (Required, string): Task ID to plan

**Usage Examples**:
```typescript
const generatePlan: PlanCommandOptions = {
  id: "task-123",
  aiProvider: "anthropic",
  aiModel: "claude-3.5-sonnet",
  stream: true
};
```

##### GetPlanCommandOptions Interface

```typescript
export interface GetPlanCommandOptions {
  id: string;
}
```

**Purpose**: Options for retrieving existing implementation plan

**Properties**:
- **id** (Required, string): Task ID whose plan to retrieve

**Usage Examples**:
```typescript
const getPlan: GetPlanCommandOptions = {
  id: "task-123"
};
```

##### ListPlanCommandOptions Interface

```typescript
export interface ListPlanCommandOptions {
  status?: string;
  tag?: string;
}
```

**Purpose**: Options for listing plans with filters

**Properties**:
- **status** (Optional, string): Filter by status
- **tag** (Optional, string): Filter by tag

**Usage Examples**:
```typescript
const listPlans: ListPlanCommandOptions = {
  status: "todo",
  tag: "critical"
};
```

##### DeletePlanCommandOptions Interface

```typescript
export interface DeletePlanCommandOptions {
  id: string;
}
```

**Purpose**: Options for deleting a task plan

**Properties**:
- **id** (Required, string): Task ID whose plan to delete

**Usage Examples**:
```typescript
const deletePlan: DeletePlanCommandOptions = {
  id: "task-123"
};
```

##### SetPlanCommandOptions Interface

```typescript
export interface SetPlanCommandOptions {
  id: string;
  plan?: string;
  planFile?: string;
}
```

**Purpose**: Options for setting/updating a task plan

**Properties**:
- **id** (Required, string): Task ID
- **plan** (Optional, string): Plan content string
- **planFile** (Optional, string): Path to plan file

**Usage Examples**:
```typescript
const setPlanFromString: SetPlanCommandOptions = {
  id: "task-123",
  plan: "1. Setup project structure\n2. Implement features"
};

const setPlanFromFile: SetPlanCommandOptions = {
  id: "task-123",
  planFile: "./plans/task-123.md"
};
```

##### DocumentCommandOptions Interface

```typescript
export interface DocumentCommandOptions
  extends StreamingOptions,
    AIProviderOptions {
  taskId: string;
  force?: boolean;
}
```

**Purpose**: Options for generating task documentation

**Inherited Properties**: From `StreamingOptions` and `AIProviderOptions`

**Specific Properties**:
- **taskId** (Required, string): Task ID to document
- **force** (Optional, boolean): Force regeneration even if docs exist

**Usage Examples**:
```typescript
const basicDoc: DocumentCommandOptions = {
  taskId: "task-123",
  aiProvider: "anthropic",
  stream: true
};

const forceDoc: DocumentCommandOptions = {
  taskId: "task-456",
  force: true,
  aiProvider: "openrouter",
  aiModel: "claude-3.5-sonnet"
};
```

##### GetDocumentationCommandOptions Interface

```typescript
export interface GetDocumentationCommandOptions {
  id: string;
}
```

**Purpose**: Options for retrieving task documentation

**Properties**:
- **id** (Required, string): Task ID

**Usage Examples**:
```typescript
const getDocumentation: GetDocumentationCommandOptions = {
  id: "task-123"
};
```

##### AddDocumentationCommandOptions Interface

```typescript
export interface AddDocumentationCommandOptions {
  id: string;
  docFile: string;
  overwrite?: boolean;
}
```

**Purpose**: Options for adding documentation to a task from file

**Properties**:
- **id** (Required, string): Task ID
- **docFile** (Required, string): Path to documentation file
- **overwrite** (Optional, boolean): Overwrite existing documentation

**Usage Examples**:
```typescript
const addDoc: AddDocumentationCommandOptions = {
  id: "task-123",
  docFile: "./docs/task-123-doc.md"
};

const addDocOverwrite: AddDocumentationCommandOptions = {
  id: "task-123",
  docFile: "./docs/task-123-doc.md",
  overwrite: true
};
```

##### ExecuteCommandOptions Interface

```typescript
export interface ExecuteCommandOptions extends DryRunOptions {
  id: string;
  tool: string;
  message?: string;
  model?: string;
  continueSession?: boolean;
  validate?: string[];
  verify?: string[];
  maxRetries?: number;
  tryModels?: string;
  plan?: boolean;
  planModel?: string;
  planTool?: string;
  reviewPlan?: boolean;
  review?: boolean;
  reviewModel?: string;
  autoCommit?: boolean;
  includePrd?: boolean;
}
```

**Purpose**: Options for executing tasks with external executor

**Properties**:
- **id** (Required, string): Task ID to execute
- **tool** (Required, string): Executor tool name (opencode, claude, gemini, codex, kilo)
- **message** (Optional, string): Custom execution message
- **model** (Optional, string): Model override
- **continueSession** (Optional, boolean): Continue last session
- **validate** (Optional, string[]): Verification commands
- **verify** (Optional, string[]): Alias for validation
- **maxRetries** (Optional, number): Maximum retries per task
- **tryModels** (Optional, string): Comma-separated model escalation list
- **plan** (Optional, boolean): Generate implementation plan
- **planModel** (Optional, string): Model for planning
- **planTool** (Optional, string): Tool for planning
- **reviewPlan** (Optional, boolean): Enable human plan review
- **review** (Optional, boolean): Run AI code review
- **reviewModel** (Optional, string): Model for review
- **autoCommit** (Optional, boolean): Auto-commit changes
- **includePrd** (Optional, boolean): Include PRD content in execution context

**Usage Examples**:
```typescript
// Basic execution
const basicExec: ExecuteCommandOptions = {
  id: "task-123",
  tool: "claude"
};

// With verification
const withVerify: ExecuteCommandOptions = {
  id: "task-456",
  tool: "opencode",
  validate: ["bun test", "bun run build"],
  verify: ["bun test", "bun run build"],
  maxRetries: 3
};

// With full pipeline
const fullPipeline: ExecuteCommandOptions = {
  id: "task-789",
  tool: "claude",
  plan: true,
  planModel: "claude-3.5-sonnet",
  planTool: "claude",
  reviewPlan: true,
  review: true,
  reviewModel: "claude-3.5-sonnet",
  autoCommit: true,
  verify: ["bun test", "bun run build"]
};

// Model escalation
const withEscalation: ExecuteCommandOptions = {
  id: "task-999",
  tool: "opencode",
  tryModels: "gpt-4o-mini,gpt-4o,claude-3.5-sonnet"
};
```

##### ExecuteLoopCommandOptions Interface

```typescript
export interface ExecuteLoopCommandOptions extends DryRunOptions {
  status?: string;
  tag?: string;
  ids?: string[];
  tool: string;
  maxRetries?: number;
  tryModels?: string;
  model?: string;
  verify?: string[];
  validate?: string[];
  message?: string;
  continueSession?: boolean;
  autoCommit?: boolean;
  plan?: boolean;
  planModel?: string;
  planTool?: string;
  reviewPlan?: boolean;
  review?: boolean;
  reviewModel?: string;
  includeCompleted?: boolean;
  includePrd?: boolean;
  notify?: string[];
}
```

**Purpose**: Options for executing multiple tasks in a loop

**Properties**:
- **status** (Optional, string): Filter by status
- **tag** (Optional, string): Filter by tag
- **ids** (Optional, string[]): Specific task IDs to execute
- **tool** (Required, string): Executor tool name
- **maxRetries** (Optional, number): Maximum retries per task
- **tryModels** (Optional, string): Comma-separated model escalation list
- **model** (Optional, string): Model override
- **verify** (Optional, string[]): Verification commands
- **validate** (Optional, string[]): Alias for verification
- **message** (Optional, string): Custom message
- **continueSession** (Optional, boolean): Continue last session
- **autoCommit** (Optional, boolean): Auto-commit changes
- **plan** (Optional, boolean): Generate implementation plan
- **planModel** (Optional, string): Model for planning
- **planTool** (Optional, string): Tool for planning
- **reviewPlan** (Optional, boolean): Enable human plan review
- **review** (Optional, boolean): Run AI code review
- **reviewModel** (Optional, string): Model for review
- **includeCompleted** (Optional, boolean): Include already-completed tasks
- **includePrd** (Optional, boolean): Include PRD content in context
- **notify** (Optional, string[]): Notification targets

**Usage Examples**:
```typescript
// Execute all todo tasks
const executeTodo: ExecuteLoopCommandOptions = {
  status: "todo",
  tool: "opencode"
};

// Execute specific tasks
const executeSpecific: ExecuteLoopCommandOptions = {
  ids: ["task-1", "task-2", "task-3"],
  tool: "claude",
  maxRetries: 3,
  verify: ["bun test"]
};

// Execute with full pipeline
const executeFull: ExecuteLoopCommandOptions = {
  tag: "critical",
  tool: "opencode",
  plan: true,
  review: true,
  autoCommit: true,
  includePrd: true,
  tryModels: "gpt-4o-mini,gpt-4o,claude-3.5-sonnet"
};
```

##### ListCommandOptions Interface

```typescript
export interface ListCommandOptions {
  status?: string;
  tag?: string;
  all?: boolean;
}
```

**Purpose**: Options for listing tasks

**Properties**:
- **status** (Optional, string): Filter by status
- **tag** (Optional, string): Filter by tag
- **all** (Optional, boolean): Show all tasks

**Usage Examples**:
```typescript
const listTodo: ListCommandOptions = {
  status: "todo"
};

const listTagged: ListCommandOptions = {
  tag: "bug"
};

const listAll: ListCommandOptions = {
  all: true
};
```

##### NextCommandOptions Interface

```typescript
export interface NextCommandOptions {
  tag?: string;
}
```

**Purpose**: Options for getting next task

**Properties**:
- **tag** (Optional, string): Filter by tag

**Usage Examples**:
```typescript
const nextCritical: NextCommandOptions = {
  tag: "critical"
};
```

##### UpdateCommandOptions Interface

```typescript
export interface UpdateCommandOptions {
  id: string;
  title?: string;
  status?: "todo" | "in-progress" | "completed";
  effort?: "small" | "medium" | "large";
}
```

**Purpose**: Options for updating tasks

**Properties**:
- **id** (Required, string): Task ID to update
- **title** (Optional, string): New task title
- **status** (Optional, union): New task status
- **effort** (Optional, union): New effort estimate

**Usage Examples**:
```typescript
const updateStatus: UpdateCommandOptions = {
  id: "task-123",
  status: "in-progress"
};

const updateAll: UpdateCommandOptions = {
  id: "task-123",
  title: "Updated title",
  effort: "large",
  status: "completed"
};
```

##### DeleteCommandOptions Interface

```typescript
export interface DeleteCommandOptions {
  id: string;
  force?: boolean;
}
```

**Purpose**: Options for deleting tasks

**Properties**:
- **id** (Required, string): Task ID to delete
- **force** (Optional, boolean): Skip confirmation prompts

**Usage Examples**:
```typescript
const deleteTask: DeleteCommandOptions = {
  id: "task-123"
};

const forceDelete: DeleteCommandOptions = {
  id: "task-123",
  force: true
};
```

##### TagCommandOptions Interface

```typescript
export interface TagCommandOptions {
  id: string;
  tags: string;
}
```

**Purpose**: Options for adding tags to tasks

**Properties**:
- **id** (Required, string): Task ID
- **tags** (Required, string): Comma-separated tags

**Usage Examples**:
```typescript
const addTags: TagCommandOptions = {
  id: "task-123",
  tags: "bug,critical,frontend"
};
```

##### UntagCommandOptions Interface

```typescript
export interface UntagCommandOptions {
  id: string;
  tags: string;
}
```

**Purpose**: Options for removing tags from tasks

**Properties**:
- **id** (Required, string): Task ID
- **tags** (Required, string): Comma-separated tags to remove

**Usage Examples**:
```typescript
const removeTags: UntagCommandOptions = {
  id: "task-123",
  tags: "bug,critical"
};
```

### FUNCTION DOCUMENTATION

No standalone functions in this module - this is a type definition file.

### INTEGRATION PROTOCOLS

#### CLI Command Handler Pattern

```typescript
// commands/tasks/index.ts
import {
  CreateCommandOptions,
  EnhanceCommandOptions,
  SplitCommandOptions,
  PlanCommandOptions,
  DocumentCommandOptions,
  ExecuteCommandOptions,
  ListCommandOptions,
  UpdateCommandOptions,
  DeleteCommandOptions,
  TagCommandOptions,
  UntagCommandOptions
} from '../../types/cli-options';

export class TaskCommandHandlers {
  async handleCreate(options: CreateCommandOptions): Promise<void> {
    const task = await this.taskService.createTask({
      title: options.title,
      content: options.content,
      effort: options.effort,
      parentId: options.parentId,
      aiEnhance: options.aiEnhance
    });

    console.log(`Created task: ${task.id}`);
  }

  async handleEnhance(options: EnhanceCommandOptions): Promise<void> {
    if (options.all) {
      const tasks = await this.taskService.listTasks(options);
      for (const task of tasks) {
        await this.enhanceSingleTask(task.id, options);
      }
    } else {
      await this.enhanceSingleTask(options.taskId, options);
    }
  }

  async handleUpdate(options: UpdateCommandOptions): Promise<void> {
    await this.taskService.updateTask(options.id, {
      title: options.title,
      status: options.status,
      effort: options.effort
    });
  }

  async handleExecute(options: ExecuteCommandOptions): Promise<void> {
    const executeConfig = {
      tool: options.tool,
      model: options.model,
      continueSession: options.continueSession,
      validate: options.validate || options.verify,
      maxRetries: options.maxRetries,
      tryModels: options.tryModels,
      plan: options.plan,
      planModel: options.planModel,
      planTool: options.planTool,
      reviewPlan: options.reviewPlan,
      review: options.review,
      reviewModel: options.reviewModel,
      autoCommit: options.autoCommit,
      includePrd: options.includePrd
    };

    await this.executorService.execute(options.id, executeConfig);
  }
}
```

#### Commander.js Integration

```typescript
// cli/task-commands.ts
import { Command } from 'commander';
import {
  CreateCommandOptions,
  UpdateCommandOptions,
  DeleteCommandOptions,
  ListCommandOptions,
  EnhanceCommandOptions,
  SplitCommandOptions,
  DocumentCommandOptions,
  ExecuteCommandOptions,
  TagCommandOptions,
  UntagCommandOptions
} from '../../types/cli-options';

export function createTaskCommands(): Command[] {
  return [
    new Command('create')
      .description('Create a new task')
      .requiredOption('-t, --title <title>', 'Task title')
      .option('-c, --content <content>', 'Task description')
      .option('-e, --effort <effort>', 'Effort estimate (small|medium|large)')
      .option('-p, --parent <parentId>', 'Parent task ID')
      .option('--ai-enhance', 'Enhance with AI')
      .option('--stream', 'Stream AI output')
      .option('--ai-provider <provider>', 'AI provider')
      .option('--ai-model <model>', 'AI model')
      .option('--ai-key <key>', 'AI API key')
      .option('--ai-provider-url <url>', 'Custom AI provider URL')
      .option('--reasoning <tokens>', 'Reasoning tokens')
      .action(async (options: CreateCommandOptions) => {
        await taskCommandHandlers.handleCreate(options);
      }),

    new Command('update')
      .description('Update a task')
      .requiredOption('-i, --id <taskId>', 'Task ID')
      .option('-t, --title <title>', 'New task title')
      .option('-s, --status <status>', 'New status (todo|in-progress|completed)')
      .option('-e, --effort <effort>', 'New effort (small|medium|large)')
      .action(async (options: UpdateCommandOptions) => {
        await taskCommandHandlers.handleUpdate(options);
      }),

    new Command('delete')
      .description('Delete a task')
      .requiredOption('-i, --id <taskId>', 'Task ID')
      .option('-f, --force', 'Skip confirmation')
      .action(async (options: DeleteCommandOptions) => {
        await taskCommandHandlers.handleDelete(options);
      })
  ];
}
```

### SURVIVAL SCENARIOS

#### Scenario 1: Complete Task Management Workflow

```typescript
class TaskManagementWorkflow {
  private taskService: TaskService;

  async executeFullWorkflow(): Promise<void> {
    console.log("🚀 Starting task management workflow...");

    // Step 1: Create tasks
    const createOptions: CreateCommandOptions = {
      title: "Build user authentication system",
      content: "Implement login, registration, and profile management",
      effort: "large",
      aiEnhance: true,
      aiProvider: "anthropic",
      stream: true
    };

    const authTask = await this.taskService.createTask(createOptions);
    console.log(`✅ Created task: ${authTask.id}`);

    // Step 2: Create subtasks
    const loginTask = await this.taskService.createTask({
      title: "Implement login form",
      content: "Create login interface with validation",
      effort: "medium",
      parentId: authTask.id
    });

    const registerTask = await this.taskService.createTask({
      title: "Implement registration form",
      content: "Create user registration with email verification",
      effort: "medium",
      parentId: authTask.id
    });

    const profileTask = await this.taskService.createTask({
      title: "Build profile management",
      content: "User profile viewing and editing",
      effort: "small",
      parentId: authTask.id
    });

    console.log(`✅ Created 3 subtasks`);

    // Step 3: Update main task status
    const updateOptions: UpdateCommandOptions = {
      id: authTask.id,
      status: "in-progress"
    };

    await this.taskService.updateTask(updateOptions.id, updateOptions);
    console.log(`✅ Updated main task status`);

    console.log("🎉 Task management workflow complete!");
  }

  async handleTaskSplitting(): Promise<void> {
    const largeTasks = await this.taskService.listTasks({
      status: "todo"
    });

    const largeTasksFiltered = largeTasks.filter(task =>
      task.effort === "large" && !task.parentId
    );

    for (const task of largeTasksFiltered) {
      console.log(`🔧 Splitting task: ${task.title}`);

      const splitOptions: SplitCommandOptions = {
        taskId: task.id,
        aiProvider: "anthropic",
        aiModel: "claude-3.5-sonnet",
        stream: true
      };

      await this.taskService.splitTask(task.id, splitOptions);
      console.log(`✅ Split task: ${task.id}`);
    }
  }
}
```

**Remember:** Citizen, in wasteland of command-line interfaces, well-defined option types are your compass. Every interface is a map through the desert of user input, and every type constraint is a wellspring of predictability. Without them, your commands become lost in sands of ambiguity.
