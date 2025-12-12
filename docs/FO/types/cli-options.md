---
## TECHNICAL BULLETIN NO. 002
### CLI OPTIONS - COMMAND INTERFACE COORDINATION SYSTEM

**DOCUMENT ID:** `task-o-matic-cli-options-v1`  
**CLEARANCE:** `All Personnel`  
**MANDATORY COMPLIANCE:** `Yes`

### ⚠️ CRITICAL SURVIVAL NOTICE
Citizen, ignore these CLI option interfaces and your commands will crumble like dust in the wasteland. Type safety becomes a myth, validation fails silently, and your users wander lost in a desert of undefined behavior. This is your command structure foundation.

### TYPE SYSTEM ARCHITECTURE

The CLI options system uses **interface composition patterns** to create reusable, type-safe command configurations. Each interface extends base interfaces to inherit common functionality while maintaining specific validation rules. The architecture supports:

- **Base Option Interfaces**: Common patterns like streaming, AI providers, and filtering
- **Command-Specific Interfaces**: Tailored options for each command's unique requirements
- **Composition Pattern**: Multiple inheritance through interface extension
- **Type Validation**: Compile-time checking prevents invalid option combinations

This design enables **consistent CLI behavior** across all commands while allowing for command-specific customization.

### COMPLETE TYPE DOCUMENTATION

#### Base Option Interfaces

##### TaskIdOrAllOptions Interface

```typescript
export interface TaskIdOrAllOptions {
  taskId?: string;
  all?: boolean;
}
```

**Purpose**: Provides mutually exclusive task selection options

**Properties**:
- **taskId** (Optional, string): Specific task ID to operate on
- **all** (Optional, boolean): Apply operation to all tasks

**Validation Rules**: Exactly one of `taskId` or `all` should be provided

**Usage Examples**:
```typescript
// Single task operation
const singleTask: TaskIdOrAllOptions = {
  taskId: "task-123"
};

// Bulk operation
const bulkTask: TaskIdOrAllOptions = {
  all: true
};

// Invalid - both provided (should be caught by validation)
const invalid: TaskIdOrAllOptions = {
  taskId: "task-123",
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

**Purpose**: Provides filtering capabilities for task listings and operations

**Properties**:
- **status** (Optional, union): Filter by task status
  - `"todo"`: Tasks not yet started
  - `"in-progress"`: Currently active tasks
  - `"completed"`: Finished tasks
- **tag** (Optional, string): Filter by tag name

**Usage Examples**:
```typescript
// Filter by status
const statusFilter: FilterOptions = {
  status: "todo"
};

// Filter by tag
const tagFilter: FilterOptions = {
  tag: "bug"
};

// Combined filters
const combinedFilter: FilterOptions = {
  status: "in-progress",
  tag: "feature"
};
```

##### DryRunOptions Interface

```typescript
export interface DryRunOptions {
  dry?: boolean;
}
```

**Purpose**: Enables preview mode for operations without making changes

**Properties**:
- **dry** (Optional, boolean): If true, simulate operation without executing

**Usage Examples**:
```typescript
// Preview execution
const dryRun: DryRunOptions = {
  dry: true
};

// Actual execution
const realRun: DryRunOptions = {
  dry: false
};
```

##### ForceOptions Interface

```typescript
export interface ForceOptions {
  force?: boolean;
}
```

**Purpose**: Overrides safety checks and confirmations

**Properties**:
- **force** (Optional, boolean): Skip confirmations and warnings

**Usage Examples**:
```typescript
// Force operation without confirmation
const forceOp: ForceOptions = {
  force: true
};
```

##### StreamingOptions Interface

```typescript
export interface StreamingOptions {
  stream?: boolean;
}
```

**Purpose**: Enables real-time AI output streaming

**Properties**:
- **stream** (Optional, boolean): Enable streaming AI responses

**Usage Examples**:
```typescript
// Enable streaming
const streaming: StreamingOptions = {
  stream: true
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

**Purpose**: Configures AI provider settings for operations

**Properties**:
- **aiProvider** (Optional, string): AI provider name ("openai", "anthropic", "openrouter", "custom")
- **aiModel** (Optional, string): Model name to use
- **aiKey** (Optional, string): API key for the provider
- **aiProviderUrl** (Optional, string): Custom endpoint URL for custom providers
- **reasoning** (Optional, string): Reasoning token limit for OpenRouter

**Usage Examples**:
```typescript
// OpenAI configuration
const openaiConfig: AIProviderOptions = {
  aiProvider: "openai",
  aiModel: "gpt-4",
  aiKey: "sk-..."
};

// Anthropic configuration
const anthropicConfig: AIProviderOptions = {
  aiProvider: "anthropic",
  aiModel: "claude-3-sonnet-20240229",
  aiKey: "sk-ant-..."
};

// OpenRouter with reasoning
const openrouterConfig: AIProviderOptions = {
  aiProvider: "openrouter",
  aiModel: "anthropic/claude-3.5-sonnet",
  aiKey: "sk-or-...",
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

#### Command-Specific Option Interfaces

##### CreateCommandOptions Interface

```typescript
export interface CreateCommandOptions extends StreamingOptions, AIProviderOptions {
  title: string;
  content?: string;
  effort?: "small" | "medium" | "large";
  parentId?: string;
  aiEnhance?: boolean;
}
```

**Purpose**: Options for creating new tasks

**Inherited Properties**: From `StreamingOptions` and `AIProviderOptions`

**Specific Properties**:
- **title** (Required, string): Task title
- **content** (Optional, string): Task description/content
- **effort** (Optional, union): Estimated effort level
  - `"small"`: Quick task (< 1 hour)
  - `"medium"`: Moderate task (1-4 hours)
  - `"large"`: Significant task (> 4 hours)
- **parentId** (Optional, string): Parent task ID for subtasks
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
  aiModel: "claude-3-sonnet",
  stream: true
};

// Large task with custom AI
const largeTask: CreateCommandOptions = {
  title: "Build authentication system",
  effort: "large",
  aiEnhance: true,
  aiProvider: "openrouter",
  aiModel: "anthropic/claude-3.5-sonnet",
  reasoning: "8000"
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

**Purpose**: Options for enhancing existing tasks with AI

**Inherited Properties**: From multiple base interfaces

**Usage Examples**:
```typescript
// Enhance single task
const enhanceSingle: EnhanceCommandOptions = {
  taskId: "task-123",
  aiProvider: "anthropic",
  stream: true
};

// Enhance all todo tasks
const enhanceAll: EnhanceCommandOptions = {
  all: true,
  status: "todo",
  aiProvider: "openrouter",
  reasoning: "5000",
  dry: true
};

// Force enhance filtered tasks
const enhanceFiltered: EnhanceCommandOptions = {
  all: true,
  tag: "bug",
  force: true,
  aiProvider: "openai",
  aiModel: "gpt-4"
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
  tools?: boolean;
}
```

**Purpose**: Options for splitting tasks into subtasks

**Inherited Properties**: From multiple base interfaces

**Specific Properties**:
- **tools** (Optional, boolean): Enable AI tool usage during splitting

**Usage Examples**:
```typescript
// Split single task with tools
const splitSingle: SplitCommandOptions = {
  taskId: "task-123",
  tools: true,
  aiProvider: "anthropic",
  stream: true
};

// Split all large tasks
const splitLarge: SplitCommandOptions = {
  all: true,
  effort: "large",
  tools: true,
  aiProvider: "openrouter",
  reasoning: "8000"
};
```

##### PlanCommandOptions Interface

```typescript
export interface PlanCommandOptions extends StreamingOptions, AIProviderOptions {
  id: string;
}
```

**Purpose**: Options for generating implementation plans

**Inherited Properties**: From `StreamingOptions` and `AIProviderOptions`

**Specific Properties**:
- **id** (Required, string): Task ID to plan

**Usage Examples**:
```typescript
// Plan task with streaming
const planTask: PlanCommandOptions = {
  id: "task-123",
  stream: true,
  aiProvider: "anthropic",
  aiModel: "claude-3-sonnet"
};
```

##### DocumentCommandOptions Interface

```typescript
export interface DocumentCommandOptions extends StreamingOptions, AIProviderOptions {
  taskId: string;
  force?: boolean;
}
```

**Purpose**: Options for generating task documentation

**Inherited Properties**: From `StreamingOptions` and `AIProviderOptions`

**Specific Properties**:
- **taskId** (Required, string): Task ID to document
- **force** (Optional, boolean): Regenerate documentation even if exists

**Usage Examples**:
```typescript
// Document task with AI
const documentTask: DocumentCommandOptions = {
  taskId: "task-123",
  stream: true,
  aiProvider: "anthropic",
  force: true
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
  reviewPlan?: boolean;
  review?: boolean;
  reviewModel?: string;
  autoCommit?: boolean;
}
```

**Purpose**: Comprehensive options for task execution with external tools

**Inherited Properties**: From `DryRunOptions`

**Specific Properties**:
- **id** (Required, string): Task ID to execute
- **tool** (Required, string): Executor tool ("opencode", "claude", "gemini", "codex")
- **message** (Optional, string): Custom execution message
- **model** (Optional, string): AI model to use with executor
- **continueSession** (Optional, boolean): Continue previous session
- **validate** (Optional, string[]): Validation commands to run
- **verify** (Optional, string[]): Alias for validate commands
- **maxRetries** (Optional, number): Maximum retry attempts
- **tryModels** (Optional, string): Comma-separated model escalation list
- **plan** (Optional, boolean): Generate implementation plan first
- **planModel** (Optional, string): Model for planning
- **reviewPlan** (Optional, boolean): Review plan before execution
- **review** (Optional, boolean): Review code after execution
- **reviewModel** (Optional, string): Model for code review
- **autoCommit** (Optional, boolean): Auto-commit successful changes

**Usage Examples**:
```typescript
// Basic execution
const basicExec: ExecuteCommandOptions = {
  id: "task-123",
  tool: "opencode",
  model: "gpt-4o"
};

// Advanced execution with planning and review
const advancedExec: ExecuteCommandOptions = {
  id: "task-123",
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
  tryModels: "gpt-4o-mini,gpt-4o,claude-sonnet-4"
};

// Continue session with verification
const continueExec: ExecuteCommandOptions = {
  id: "task-123",
  tool: "opencode",
  continueSession: true,
  verify: ["npm run build", "npm run test"],
  dry: true
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
  verify?: string[];
  validate?: string[];
  message?: string;
  continueSession?: boolean;
  autoCommit?: boolean;
  plan?: boolean;
  planModel?: string;
  reviewPlan?: boolean;
  review?: boolean;
  reviewModel?: string;
}
```

**Purpose**: Options for bulk task execution with loops

**Inherited Properties**: From `DryRunOptions`

**Specific Properties**:
- **status** (Optional, string): Filter by status
- **tag** (Optional, string): Filter by tag
- **ids** (Optional, string[]): Specific task IDs to execute
- **tool** (Required, string): Executor tool
- **maxRetries** (Optional, number): Maximum retries per task
- **tryModels** (Optional, string): Model escalation list
- **verify** (Optional, string[]): Verification commands
- **validate** (Optional, string[]): Alias for verify
- **message** (Optional, string): Custom execution message
- **continueSession** (Optional, boolean): Continue sessions
- **autoCommit** (Optional, boolean): Auto-commit changes
- **plan** (Optional, boolean): Generate plans
- **planModel** (Optional, string): Planning model
- **reviewPlan** (Optional, boolean): Review plans
- **review** (Optional, boolean): Review results
- **reviewModel** (Optional, string): Review model

**Usage Examples**:
```typescript
// Execute all todo tasks
const execAllTodo: ExecuteLoopCommandOptions = {
  status: "todo",
  tool: "opencode",
  model: "gpt-4o",
  autoCommit: true
};

// Execute specific tasks with retry
const execSpecific: ExecuteLoopCommandOptions = {
  ids: ["task-1", "task-2", "task-3"],
  tool: "claude",
  maxRetries: 3,
  tryModels: "sonnet-4,sonnet-3.5",
  verify: ["npm test"],
  plan: true,
  review: true
};

// Execute tagged tasks with full pipeline
const execTagged: ExecuteLoopCommandOptions = {
  tag: "feature",
  tool: "opencode",
  plan: true,
  planModel: "gpt-4o",
  reviewPlan: true,
  review: true,
  reviewModel: "claude-3.5-sonnet",
  validate: ["npm run lint", "npm run test", "npm run build"],
  autoCommit: true,
  maxRetries: 2
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
- **all** (Optional, boolean): Show all tasks regardless of status

**Usage Examples**:
```typescript
// List all tasks
const listAll: ListCommandOptions = {
  all: true
};

// List todo tasks
const listTodo: ListCommandOptions = {
  status: "todo"
};

// List bug tasks
const listBugs: ListCommandOptions = {
  tag: "bug"
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

**Purpose**: Options for updating task properties

**Properties**:
- **id** (Required, string): Task ID to update
- **title** (Optional, string): New task title
- **status** (Optional, union): New task status
- **effort** (Optional, union): New effort estimate

**Usage Examples**:
```typescript
// Update task status
const updateStatus: UpdateCommandOptions = {
  id: "task-123",
  status: "in-progress"
};

// Update multiple properties
const updateMultiple: UpdateCommandOptions = {
  id: "task-123",
  title: "Fix critical login bug",
  status: "in-progress",
  effort: "medium"
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
- **force** (Optional, boolean): Skip confirmation

**Usage Examples**:
```typescript
// Delete with confirmation
const deleteTask: DeleteCommandOptions = {
  id: "task-123"
};

// Force delete
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
- **id** (Required, string): Task ID to tag
- **tags** (Required, string): Comma-separated tag list

**Usage Examples**:
```typescript
// Add single tag
const addTag: TagCommandOptions = {
  id: "task-123",
  tags: "bug"
};

// Add multiple tags
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
- **id** (Required, string): Task ID to untag
- **tags** (Required, string): Comma-separated tag list to remove

**Usage Examples**:
```typescript
// Remove single tag
const removeTag: UntagCommandOptions = {
  id: "task-123",
  tags: "bug"
};

// Remove multiple tags
const removeTags: UntagCommandOptions = {
  id: "task-123",
  tags: "bug,critical"
};
```

### FUNCTION DOCUMENTATION

No standalone functions in this module - this is a type definition file.

### INTEGRATION PROTOCOLS

#### Commander.js Integration

```typescript
import { Command } from 'commander';
import { CreateCommandOptions } from '../types/cli-options';

// Define create command
const createCmd = new Command('create')
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
  .action(async (options: CreateCommandOptions) => {
    await handleCreateCommand(options);
  });
```

#### Validation Integration

```typescript
import { validateMutuallyExclusive } from '../utils/cli-validators';
import { TaskIdOrAllOptions } from '../types/cli-options';

function validateTaskSelection(options: TaskIdOrAllOptions): void {
  validateMutuallyExclusive(options, 'taskId', 'all', 'task-id', 'all');
  
  if (!options.taskId && !options.all) {
    throw new Error('Either --task-id or --all must be specified');
  }
}

// Usage in command handler
export async function handleEnhanceCommand(options: EnhanceCommandOptions): Promise<void> {
  validateTaskSelection(options);
  
  // Proceed with validated options
  await taskService.enhanceTasks(options);
}
```

#### Service Layer Integration

```typescript
import { TaskService } from '../services/tasks';
import { CreateCommandOptions, ExecuteCommandOptions } from '../types/cli-options';

export class CommandHandler {
  constructor(private taskService: TaskService) {}

  async handleCreate(options: CreateCommandOptions): Promise<void> {
    const task = await this.taskService.createTask({
      title: options.title,
      content: options.content,
      effort: options.effort,
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

  async handleExecute(options: ExecuteCommandOptions): Promise<void> {
    const result = await this.taskService.executeTask(options.id, {
      tool: options.tool as ExecutorTool,
      message: options.message,
      model: options.model,
      continueSession: options.continueSession,
      verificationCommands: options.validate || options.verify,
      maxRetries: options.maxRetries,
      tryModels: options.tryModels ? parseTryModels(options.tryModels) : undefined,
      plan: options.plan,
      planModel: options.planModel,
      reviewPlan: options.reviewPlan,
      review: options.review,
      reviewModel: options.reviewModel,
      autoCommit: options.autoCommit,
      dry: options.dry
    });
    
    console.log(`Execution completed: ${result.success}`);
  }
}
```

### SURVIVAL SCENARIOS

#### Scenario 1: Complete CLI Command Implementation

```typescript
// commands/tasks/enhance.ts
import { Command } from 'commander';
import { EnhanceCommandOptions } from '../../types/cli-options';
import { validateMutuallyExclusive, parseCsvOption } from '../../utils/cli-validators';
import { taskService } from '../../services/tasks';
import { createStreamingOptions } from '../../utils/streaming-options';
import { handleCommandError } from '../../utils/command-error-handler';

export function createEnhanceCommand(): Command {
  return new Command('enhance')
    .description('Enhance tasks with AI')
    .addOption(
      new Option('--task-id <id>', 'Enhance specific task')
        .conflicts(['all'])
    )
    .addOption(
      new Option('--all', 'Enhance all tasks')
        .conflicts(['task-id'])
    )
    .option('--status <status>', 'Filter by status (todo|in-progress|completed)')
    .option('--tag <tag>', 'Filter by tag')
    .option('--dry', 'Preview changes without applying')
    .option('--force', 'Skip confirmations')
    .option('--stream', 'Stream AI output')
    .option('--ai-provider <provider>', 'AI provider')
    .option('--ai-model <model>', 'AI model')
    .option('--ai-key <key>', 'AI API key')
    .option('--ai-provider-url <url>', 'Custom AI provider URL')
    .option('--reasoning <tokens>', 'Reasoning tokens (OpenRouter)')
    .action(async (options: EnhanceCommandOptions) => {
      await handleEnhanceCommand(options);
    });
}

async function handleEnhanceCommand(options: EnhanceCommandOptions): Promise<void> {
  try {
    // Validate mutually exclusive options
    validateMutuallyExclusive(options, 'taskId', 'all', 'task-id', 'all');
    
    // Validate status if provided
    if (options.status && !['todo', 'in-progress', 'completed'].includes(options.status)) {
      throw new Error('Invalid status. Must be: todo, in-progress, or completed');
    }
    
    // Create streaming options
    const streamingOptions = createStreamingOptions(options.stream, 'Task enhancement');
    
    // Build AI config
    const aiConfig = buildAIConfig(options);
    
    // Determine tasks to enhance
    const filters = {
      status: options.status,
      tag: options.tag
    };
    
    if (options.all) {
      // Bulk enhancement
      const tasks = await taskService.listTasks(filters);
      
      if (tasks.length === 0) {
        console.log('No tasks found matching filters');
        return;
      }
      
      console.log(`Enhancing ${tasks.length} tasks...`);
      
      for (const task of tasks) {
        console.log(`\nEnhancing: ${task.title}`);
        
        if (!options.dry) {
          await taskService.enhanceTask(task.id, {
            ...aiConfig,
            streamingOptions
          });
        }
      }
      
      console.log(`\n${options.dry ? 'Would enhance' : 'Enhanced'} ${tasks.length} tasks`);
    } else {
      // Single task enhancement
      await taskService.enhanceTask(options.taskId!, {
        ...aiConfig,
        streamingOptions
      });
    }
    
  } catch (error) {
    handleCommandError('Task enhancement', error);
  }
}
```

#### Scenario 2: Advanced Execution Command

```typescript
// commands/tasks/execute.ts
import { Command, Option } from 'commander';
import { ExecuteCommandOptions } from '../../types/cli-options';
import { validateExecutor, parseTryModels } from '../../utils/model-executor-parser';
import { taskService } from '../../services/tasks';

export function createExecuteCommand(): Command {
  return new Command('execute')
    .description('Execute task with external tools')
    .requiredOption('-i, --id <taskId>', 'Task ID to execute')
    .requiredOption('-t, --tool <tool>', 'Executor tool (opencode|claude|gemini|codex)')
    .option('-m, --message <message>', 'Custom execution message')
    .option('--model <model>', 'AI model to use')
    .option('--continue-session', 'Continue previous session')
    .option('--validate <commands>', 'Validation commands (comma-separated)')
    .option('--verify <commands>', 'Alias for validation commands')
    .option('--max-retries <count>', 'Maximum retry attempts')
    .option('--try-models <models>', 'Model escalation list (comma-separated)')
    .option('--plan', 'Generate implementation plan first')
    .option('--plan-model <model>', 'Model for planning')
    .option('--review-plan', 'Review plan before execution')
    .option('--review', 'Review code after execution')
    .option('--review-model <model>', 'Model for code review')
    .option('--auto-commit', 'Auto-commit successful changes')
    .option('--dry', 'Preview execution without running')
    .action(async (options: ExecuteCommandOptions) => {
      await handleExecuteCommand(options);
    });
}

async function handleExecuteCommand(options: ExecuteCommandOptions): Promise<void> {
  try {
    // Validate executor
    if (!validateExecutor(options.tool)) {
      throw new Error(`Invalid executor: ${options.tool}. Must be one of: opencode, claude, gemini, codex`);
    }
    
    // Parse validation commands
    const validationCommands = [
      ...(options.validate ? parseCsvOption(options.validate) : []),
      ...(options.verify ? parseCsvOption(options.verify) : [])
    ];
    
    // Parse try models
    const tryModels = options.tryModels ? parseTryModels(options.tryModels) : undefined;
    
    // Parse retry count
    const maxRetries = options.maxRetries ? parseInt(options.maxRetries, 10) : undefined;
    
    // Execute task
    const result = await taskService.executeTask(options.id, {
      tool: options.tool as ExecutorTool,
      message: options.message,
      model: options.model,
      continueSession: options.continueSession,
      verificationCommands: validationCommands,
      maxRetries,
      tryModels,
      plan: options.plan,
      planModel: options.planModel,
      reviewPlan: options.reviewPlan,
      review: options.review,
      reviewModel: options.reviewModel,
      autoCommit: options.autoCommit,
      dry: options.dry
    });
    
    // Display results
    console.log(`\nExecution ${result.success ? 'succeeded' : 'failed'}`);
    
    if (result.attempts.length > 1) {
      console.log(`Attempts: ${result.attempts.length}`);
      result.attempts.forEach((attempt, index) => {
        console.log(`  ${index + 1}. ${attempt.success ? 'Success' : 'Failed'}${attempt.model ? ` (${attempt.model})` : ''}`);
      });
    }
    
    if (result.commitInfo) {
      console.log(`\nCommitted: ${result.commitInfo.message}`);
      console.log(`Files: ${result.commitInfo.files.join(', ')}`);
    }
    
  } catch (error) {
    handleCommandError('Task execution', error);
  }
}
```

#### Scenario 3: Type-Safe Option Builder

```typescript
// utils/option-builders.ts
import { 
  CreateCommandOptions, 
  ExecuteCommandOptions,
  AIProviderOptions,
  StreamingOptions 
} from '../types/cli-options';

export class OptionBuilder {
  static createTask(overrides: Partial<CreateCommandOptions> = {}): CreateCommandOptions {
    const defaults: CreateCommandOptions = {
      title: '',
      stream: false,
      aiEnhance: false
    };
    
    return { ...defaults, ...overrides };
  }
  
  static executeTask(overrides: Partial<ExecuteCommandOptions> = {}): ExecuteCommandOptions {
    const defaults: ExecuteCommandOptions = {
      id: '',
      tool: 'opencode',
      dry: false,
      maxRetries: 3,
      plan: false,
      review: false,
      autoCommit: false
    };
    
    return { ...defaults, ...overrides };
  }
  
  static aiProvider(overrides: Partial<AIProviderOptions> = {}): AIProviderOptions {
    const defaults: AIProviderOptions = {
      aiProvider: 'anthropic',
      aiModel: 'claude-3-sonnet-20240229'
    };
    
    return { ...defaults, ...overrides };
  }
  
  static streaming(enabled: boolean = false): StreamingOptions {
    return { stream: enabled };
  }
}

// Usage examples
const basicTask = OptionBuilder.createTask({
  title: 'New task',
  content: 'Task description',
  effort: 'medium'
});

const advancedExecution = OptionBuilder.executeTask({
  id: 'task-123',
  tool: 'claude',
  plan: true,
  review: true,
  maxRetries: 5,
  ...OptionBuilder.aiProvider({
    aiProvider: 'openrouter',
    aiModel: 'anthropic/claude-3.5-sonnet',
    reasoning: '8000'
  }),
  ...OptionBuilder.streaming(true)
});
```

### TECHNICAL SPECIFICATIONS

#### Interface Composition Rules

1. **Single Inheritance**: Each interface extends from base interfaces
2. **Multiple Extension**: Commands can extend multiple base interfaces
3. **Property Shadowing**: Specific properties override inherited ones
4. **Type Compatibility**: All extensions maintain type safety

#### Validation Patterns

1. **Mutual Exclusion**: `taskId` vs `all` patterns
2. **Required Fields**: Marked as required in TypeScript
3. **Union Types**: Limited sets of valid values
4. **Optional Fields**: Clearly marked optional properties

#### Runtime Behavior

1. **Commander.js Integration**: Automatic type coercion
2. **Default Values**: Applied in service layer
3. **Validation**: Handled before service calls
4. **Error Handling**: Consistent across commands

#### Performance Considerations

1. **Interface Overhead**: Minimal at compile time
2. **Type Checking**: Full compile-time validation
3. **Runtime Cost**: No performance impact
4. **Memory Usage**: Efficient object creation

**Remember:** Citizen, in the wasteland of command-line interfaces, proper option typing is your compass. Every interface is a map through the desert of user input, and every type check is a wellspring of reliability. Without them, your commands wander aimlessly until they perish.