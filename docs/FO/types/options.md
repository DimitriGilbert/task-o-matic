---
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
// List all todo tasks
const todoTasks: ListTasksOptions = {
  status: "todo"
};

// List tasks with specific tag
const bugTasks: ListTasksOptions = {
  tag: "bug"
};

// Combined filters
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
// Show specific task
const showTask: ShowTaskOptions = {
  id: "task-123"
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
// Basic documentation generation
const basicDoc: DocumentTaskOptions = {
  taskId: "task-123",
  aiProvider: "anthropic",
  stream: true
};

// Force regeneration
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
- **all** (Optional, boolean): Enhance all tasks

**Usage Examples**:
```typescript
// Enhance single task
const enhanceSingle: EnhanceTaskOptions = {
  taskId: "task-123",
  aiProvider: "anthropic",
  stream: true
};

// Enhance all tasks
const enhanceAll: EnhanceTaskOptions = {
  all: true,
  aiProvider: "openrouter",
  reasoning: "5000"
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
- **all** (Optional, boolean): Split all tasks
- **prompt** (Optional, string): Custom splitting prompt
- **message** (Optional, string): Alias for prompt

**Usage Examples**:
```typescript
// Basic task splitting
const basicSplit: SplitTaskOptions = {
  taskId: "task-123",
  aiProvider: "anthropic",
  stream: true
};

// Split with custom prompt
const customSplit: SplitTaskOptions = {
  taskId: "task-123",
  prompt: "Split this into user interface and backend components",
  aiProvider: "openrouter",
  aiModel: "claude-3.5-sonnet"
};

// Split all tasks
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
// Generate plan for task
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
// Get task plan
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
// Update task status
const updateStatus: UpdateTaskOptions = {
  id: "task-123",
  status: "in-progress"
};

// Update multiple properties
const updateMultiple: UpdateTaskOptions = {
  id: "task-123",
  title: "Fix critical authentication bug",
  description: "Users cannot login due to token validation error",
  status: "in-progress",
  effort: "medium",
  tags: "bug,critical,security"
};

// Add tags
const addTags: UpdateTaskOptions = {
  id: "task-123",
  tags: "frontend,react,component"
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
// Delete with confirmation
const deleteTask: DeleteTaskOptions = {
  id: "task-123"
};

// Force delete
const forceDelete: DeleteTaskOptions = {
  id: "task-123",
  force: true
};

// Cascade delete
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
// Mark task as in progress
const startTask: SetTaskStatusOptions = {
  id: "task-123",
  status: "in-progress"
};

// Complete task
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
// Add tags
const addTags: ManageTagsOptions = {
  id: "task-123",
  tags: "bug,critical,frontend"
};

// Remove tags (same interface)
const removeTags: ManageTagsOptions = {
  id: "task-123",
  tags: "bug,critical"
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
// Basic PRD parsing
const parsePrd: ParsePrdOptions = {
  file: "./docs/PRD.md",
  aiProvider: "anthropic",
  stream: true
};

// Custom parsing instructions
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
// Basic PRD rework
const reworkPrd: ReworkPrdOptions = {
  file: "./docs/PRD.md",
  feedback: "Add more technical details and acceptance criteria",
  aiProvider: "anthropic",
  stream: true
};

// Rework with custom output
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
- **"question-refine-prd"**: AI-driven PRD questioning
- **"refine-prd"**: PRD improvement based on feedback
- **"generate-tasks"**: Task creation from PRD
- **"split-tasks"**: Task breakdown into subtasks
- **"complete"**: Workflow completion

**Usage Examples**:
```typescript
// Current step tracking
let currentStep: WorkflowStep = "initialize";

// Step progression
function nextStep(current: WorkflowStep): WorkflowStep {
  const steps: WorkflowStep[] = [
    "initialize",
    "define-prd", 
    "question-refine-prd",
    "refine-prd",
    "generate-tasks",
    "split-tasks",
    "complete"
  ];
  
  const currentIndex = steps.indexOf(current);
  return steps[Math.min(currentIndex + 1, steps.length - 1)];
}

// Step-specific handling
function handleStep(step: WorkflowStep): void {
  switch (step) {
    case "initialize":
      console.log("🚀 Initializing project...");
      break;
    case "define-prd":
      console.log("📝 Defining PRD...");
      break;
    case "question-refine-prd":
      console.log("❓ Refining PRD with questions...");
      break;
    case "refine-prd":
      console.log("✏️ Refining PRD...");
      break;
    case "generate-tasks":
      console.log("📋 Generating tasks...");
      break;
    case "split-tasks":
      console.log("🔧 Splitting tasks...");
      break;
    case "complete":
      console.log("✅ Workflow complete!");
      break;
  }
}
```

##### WorkflowState Interface

```typescript
export interface WorkflowState {
  projectName?: string;
  projectDir?: string;
  initialized: boolean;
  prdFile?: string;
  prdContent?: string;
  tasks?: Array<{ id: string; title: string; description?: string }>;
  currentStep: WorkflowStep;
  aiConfig?: {
    provider: string;
    model: string;
    key?: string;
  };
}
```

**Purpose**: Complete workflow execution state

**Properties**:
- **projectName** (Optional, string): Project name
- **projectDir** (Optional, string): Project directory path
- **initialized** (Required, boolean): Whether project is initialized
- **prdFile** (Optional, string): Path to PRD file
- **prdContent** (Optional, string): PRD file content
- **tasks** (Optional, array): Generated tasks
- **currentStep** (Required, WorkflowStep): Current workflow step
- **aiConfig** (Optional, object): AI configuration

**Usage Examples**:
```typescript
// Initial workflow state
const initialState: WorkflowState = {
  initialized: false,
  currentStep: "initialize"
};

// After initialization
const afterInit: WorkflowState = {
  projectName: "My Project",
  projectDir: "/path/to/my-project",
  initialized: true,
  currentStep: "define-prd",
  aiConfig: {
    provider: "anthropic",
    model: "claude-3.5-sonnet",
    key: "sk-ant-..."
  }
};

// After PRD creation
const afterPRD: WorkflowState = {
  projectName: "My Project",
  projectDir: "/path/to/my-project",
  initialized: true,
  prdFile: "./docs/PRD.md",
  prdContent: "# My Project\n\nThis project builds...",
  currentStep: "generate-tasks",
  aiConfig: {
    provider: "anthropic",
    model: "claude-3.5-sonnet"
  }
};

// After task generation
const afterTasks: WorkflowState = {
  projectName: "My Project",
  projectDir: "/path/to/my-project",
  initialized: true,
  prdFile: "./docs/PRD.md",
  prdContent: "# My Project\n\nThis project builds...",
  tasks: [
    { id: "task-1", title: "Setup project structure", description: "Create directories and package.json" },
    { id: "task-2", title: "Build authentication", description: "Implement user login system" },
    { id: "task-3", title: "Create dashboard", description: "Build main user interface" }
  ],
  currentStep: "split-tasks"
};
```

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
// Frontend selection
const frontendChoice: AIAssistedChoice<string> = {
  userInput: "I want to build a web app",
  availableOptions: ["next", "react-router", "nuxt", "svelte"],
  context: "Frontend framework selection",
  recommendation: "next"
};

// Database selection
const databaseChoice: AIAssistedChoice<string> = {
  userInput: "I need to store user data",
  availableOptions: ["postgres", "mysql", "sqlite"],
  context: "Database selection",
  recommendation: "postgres"
};

// Complex choice with objects
const configChoice: AIAssistedChoice<{ name: string; description: string }> = {
  userInput: "What authentication system?",
  availableOptions: [
    { name: "better-auth", description: "Modern auth with multiple providers" },
    { name: "clerk", description: "Headless auth service" },
    { name: "none", description: "No authentication" }
  ],
  context: "Authentication system selection",
  recommendation: { name: "better-auth", description: "Modern auth with multiple providers" }
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
// Full-stack web application
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

// CLI-only project
const cliConfig: InitConfigChoice = {
  projectName: "Task CLI Tool",
  aiProvider: "openrouter",
  aiModel: "anthropic/claude-3.5-sonnet",
  frontend: "cli",
  backend: "none",
  database: "none",
  auth: false
};

// Custom AI provider
const customAIConfig: InitConfigChoice = {
  projectName: "AI Assistant",
  aiProvider: "custom",
  aiModel: "llama-3-70b",
  aiProviderUrl: "https://api.custom-ai.com/v1",
  frontend: "react-router",
  backend: "express",
  database: "mysql",
  auth: true
};
```

#### Additional Task Options

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
// Get next todo task
const nextTodo: GetNextTaskOptions = {
  status: "todo"
};

// Get next high-effort task
const nextLarge: GetNextTaskOptions = {
  effort: "large",
  priority: "oldest"
};

// Get next bug task
const nextBug: GetNextTaskOptions = {
  tag: "bug",
  status: "todo",
  priority: "newest"
};

// Get oldest in-progress task
const resumeWork: GetNextTaskOptions = {
  status: "in-progress",
  priority: "oldest"
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
// List subtasks
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
// Show full task tree
const fullTree: TaskTreeOptions = {};

// Show subtree
const subtree: TaskTreeOptions = {
  id: "task-parent-123"
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
// Delete task plan
const deletePlan: DeletePlanOptions = {
  id: "task-123"
};
```

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
- **aiProvider** (Optional, string): AI provider name
- **aiModel** (Optional, string): AI model name
- **aiKey** (Optional, string): API authentication key
- **aiProviderUrl** (Optional, string): Custom endpoint URL
- **aiReasoning** (Optional, string): Reasoning token limit

**Usage Examples**:
```typescript
// OpenAI configuration
const openaiOptions: AIProviderOptions = {
  aiProvider: "openai",
  aiModel: "gpt-4",
  aiKey: "sk-openai-..."
};

// Anthropic with reasoning
const anthropicOptions: AIProviderOptions = {
  aiProvider: "anthropic",
  aiModel: "claude-3.5-sonnet",
  aiKey: "sk-ant-...",
  aiReasoning: "5000"
};

// Custom provider
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
// Streaming with OpenAI
const streamingOpenAI: StreamingAIOptions = {
  aiProvider: "openai",
  aiModel: "gpt-4",
  stream: true
};

// Non-streaming with Anthropic
const nonStreamingAnthropic: StreamingAIOptions = {
  aiProvider: "anthropic",
  aiModel: "claude-3.5-sonnet",
  stream: false
};
```

### FUNCTION DOCUMENTATION

No standalone functions in this module - this is a type definition file.

### INTEGRATION PROTOCOLS

#### Command Handler Integration

```typescript
// commands/tasks/index.ts
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

#### Service Layer Integration

```typescript
// services/tasks.ts
import { 
  CreateTaskOptions, 
  UpdateTaskOptions, 
  DeleteTaskOptions,
  ListTasksOptions,
  GetNextTaskOptions
} from '../types/options';

export class TaskService {
  async createTask(options: CreateTaskOptions, aiConfig?: AIProviderOptions): Promise<Task> {
    const task: Task = {
      id: this.generateTaskId(),
      title: options.title,
      content: options.content,
      effort: options.effort,
      parentId: options.parentId,
      aiEnhance: options.aiEnhance,
      status: "todo",
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    await this.storage.saveTask(task);

    if (options.aiEnhance) {
      await this.enhanceTask(task.id, aiConfig);
    }

    return task;
  }

  async updateTask(id: string, options: Partial<UpdateTaskOptions>): Promise<Task> {
    const existingTask = await this.storage.getTask(id);
    if (!existingTask) {
      throw new Error(`Task ${id} not found`);
    }

    const updatedTask: Task = {
      ...existingTask,
      ...options,
      updatedAt: Date.now()
    };

    // Handle tags conversion
    if (options.tags && typeof options.tags === 'string') {
      updatedTask.tags = options.tags.split(',').map(t => t.trim()).filter(Boolean);
    }

    await this.storage.updateTask(id, updatedTask);
    return updatedTask;
  }

  async listTasks(options?: ListTasksOptions): Promise<Task[]> {
    const filters = {
      status: options?.status,
      tag: options?.tag
    };
    
    return await this.storage.listTasks(filters);
  }

  async getNextTask(options?: GetNextTaskOptions): Promise<Task | null> {
    const tasks = await this.listTasks({
      status: options?.status || "todo",
      tag: options?.tag
    });

    // Filter by effort if specified
    let filteredTasks = tasks;
    if (options?.effort) {
      filteredTasks = tasks.filter(task => task.estimatedEffort === options.effort);
    }

    // Sort by priority
    switch (options?.priority) {
      case "newest":
        filteredTasks.sort((a, b) => b.createdAt - a.createdAt);
        break;
      case "oldest":
        filteredTasks.sort((a, b) => a.createdAt - b.createdAt);
        break;
      case "effort":
        const effortOrder = { "small": 1, "medium": 2, "large": 3 };
        filteredTasks.sort((a, b) => 
          (effortOrder[a.estimatedEffort || "medium"] || 2) - 
          (effortOrder[b.estimatedEffort || "medium"] || 2)
        );
        break;
      default:
        filteredTasks.sort((a, b) => a.createdAt - b.createdAt);
    }

    return filteredTasks[0] || null;
  }
}
```

#### CLI Integration

```typescript
// cli/task-commands.ts
import { Command } from 'commander';
import { 
  CreateTaskOptions,
  UpdateTaskOptions,
  DeleteTaskOptions,
  ListTasksOptions,
  EnhanceTaskOptions,
  SplitTaskOptions
} from '../../types/options';

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
      .action(async (options: CreateTaskOptions) => {
        await taskCommandHandlers.handleCreate(options);
      }),

    new Command('update')
      .description('Update a task')
      .requiredOption('-i, --id <taskId>', 'Task ID')
      .option('-t, --title <title>', 'New task title')
      .option('-d, --description <description>', 'New task description')
      .option('-s, --status <status>', 'New status (todo|in-progress|completed)')
      .option('-e, --effort <effort>', 'New effort (small|medium|large)')
      .option('--tags <tags>', 'Comma-separated tag list')
      .action(async (options: UpdateTaskOptions) => {
        await taskCommandHandlers.handleUpdate(options);
      }),

    new Command('list')
      .description('List tasks')
      .option('-s, --status <status>', 'Filter by status')
      .option('-t, --tag <tag>', 'Filter by tag')
      .action(async (options: ListTasksOptions) => {
        await taskCommandHandlers.handleList(options);
      }),

    new Command('delete')
      .description('Delete a task')
      .requiredOption('-i, --id <taskId>', 'Task ID')
      .option('-f, --force', 'Skip confirmation')
      .option('--cascade', 'Delete subtasks')
      .action(async (options: DeleteTaskOptions) => {
        await taskCommandHandlers.handleDelete(options);
      })
  ];
}
```

### SURVIVAL SCENARIOS

#### Scenario 1: Complete Task Management Workflow

```typescript
// Complete task management with all operations
class TaskManagementWorkflow {
  private taskService: TaskService;

  async executeFullWorkflow(): Promise<void> {
    console.log("🚀 Starting task management workflow...");

    // Step 1: Create tasks
    const createOptions: CreateTaskOptions = {
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

    console.log(`✅ Created ${3} subtasks`);

    // Step 3: Update main task status
    await this.taskService.updateTask(authTask.id, {
      status: "in-progress"
    });
    console.log(`✅ Updated main task status`);

    // Step 4: List current tasks
    const currentTasks = await this.taskService.listTasks();
    console.log(`📋 Current tasks: ${currentTasks.length}`);

    // Step 5: Get next task
    const nextTask = await this.taskService.getNextTask({
      status: "todo",
      priority: "oldest"
    });

    if (nextTask) {
      console.log(`➡️ Next task: ${nextTask.title}`);
      
      // Step 6: Enhance next task
      const enhanceOptions: EnhanceTaskOptions = {
        taskId: nextTask.id,
        aiProvider: "openrouter",
        aiModel: "claude-3.5-sonnet",
        stream: true
      };

      await this.taskService.enhanceTask(nextTask.id, enhanceOptions);
      console.log(`✅ Enhanced task: ${nextTask.id}`);
    }

    console.log("🎉 Task management workflow complete!");
  }

  async handleTaskSplitting(): Promise<void> {
    const largeTasks = await this.taskService.listTasks({ 
      status: "todo" 
    });

    const largeTasksFiltered = largeTasks.filter(task => 
      task.estimatedEffort === "large" && !task.parentId
    );

    for (const task of largeTasksFiltered) {
      console.log(`🔧 Splitting task: ${task.title}`);

      const splitOptions: SplitTaskOptions = {
        taskId: task.id,
        prompt: "Break this down into implementable subtasks with clear acceptance criteria",
        aiProvider: "anthropic",
        stream: true
      };

      await this.taskService.splitTask(task.id, splitOptions);
      console.log(`✅ Split task: ${task.id}`);
    }
  }
}
```

#### Scenario 2: PRD Processing Pipeline

```typescript
// Complete PRD processing workflow
class PRDProcessingWorkflow {
  private taskService: TaskService;

  async processPRD(filePath: string): Promise<void> {
    console.log(`📄 Processing PRD: ${filePath}`);

    // Step 1: Parse PRD
    const parseOptions: ParsePrdOptions = {
      file: filePath,
      aiProvider: "anthropic",
      aiModel: "claude-3.5-sonnet",
      stream: true
    };

    const parseResult = await this.prdService.parsePRD(parseOptions);
    console.log(`✅ Parsed ${parseResult.tasks.length} tasks from PRD`);

    // Step 2: Create tasks from parsed results
    const createdTasks = [];
    for (const parsedTask of parseResult.tasks) {
      const createOptions: CreateTaskOptions = {
        title: parsedTask.title,
        content: parsedTask.description,
        effort: parsedTask.effort,
        aiEnhance: true,
        aiProvider: "openrouter",
        aiModel: "claude-3.5-sonnet"
      };

      const task = await this.taskService.createTask(createOptions);
      createdTasks.push(task);
      console.log(`✅ Created task: ${task.id} - ${task.title}`);
    }

    // Step 3: Set up dependencies
    for (let i = 0; i < createdTasks.length; i++) {
      const task = createdTasks[i];
      const dependencies = parseResult.tasks[i].dependencies || [];
      
      if (dependencies.length > 0) {
        // Find dependency task IDs
        const dependencyIds = dependencies.map(dep => {
          const depTask = createdTasks.find(t => t.title === dep);
          return depTask ? depTask.id : undefined;
        }).filter(Boolean);

        await this.taskService.updateTask(task.id, {
          dependencies: dependencyIds
        });
        
        console.log(`🔗 Set dependencies for task: ${task.id}`);
      }
    }

    // Step 4: Split large tasks
    const largeTasks = createdTasks.filter(task => task.effort === "large");
    for (const task of largeTasks) {
      console.log(`🔧 Splitting large task: ${task.title}`);

      const splitOptions: SplitTaskOptions = {
        taskId: task.id,
        prompt: "Break this large task into smaller, manageable subtasks",
        aiProvider: "anthropic",
        stream: true
      };

      await this.taskService.splitTask(task.id, splitOptions);
      console.log(`✅ Split task: ${task.id}`);
    }

    // Step 5: Generate plans for complex tasks
    const complexTasks = createdTasks.filter(task => 
      task.effort === "large" || task.dependencies && task.dependencies.length > 2
    );

    for (const task of complexTasks) {
      console.log(`📋 Generating plan for: ${task.title}`);

      const planOptions: PlanTaskOptions = {
        id: task.id,
        aiProvider: "openrouter",
        aiModel: "claude-3.5-sonnet",
        stream: true
      };

      await this.taskService.planTask(task.id, planOptions);
      console.log(`✅ Generated plan for task: ${task.id}`);
    }

    console.log("🎉 PRD processing workflow complete!");
  }

  async reworkPRD(filePath: string, feedback: string): Promise<void> {
    console.log(`✏️ Reworking PRD: ${filePath}`);

    const reworkOptions: ReworkPrdOptions = {
      file: filePath,
      feedback: feedback,
      output: `${filePath}.reworked.md`,
      prompt: "Improve this PRD based on the provided feedback, focusing on clarity, completeness, and actionable requirements",
      aiProvider: "anthropic",
      aiModel: "claude-3.5-sonnet",
      stream: true
    };

    const result = await this.prdService.reworkPRD(reworkOptions);
    console.log(`✅ Reworked PRD saved to: ${result.outputFile}`);

    // Step 2: Parse updated PRD and create new tasks
    await this.processPRD(result.outputFile);
  }
}
```

#### Scenario 3: AI Configuration Management

```typescript
// AI configuration management across operations
class AIConfigManager {
  private configs: Map<string, AIProviderOptions> = new Map();

  setConfig(operation: string, config: AIProviderOptions): void {
    this.configs.set(operation, config);
    console.log(`🔧 Set AI config for ${operation}:`, {
      provider: config.aiProvider,
      model: config.aiModel,
      reasoning: config.aiReasoning
    });
  }

  getConfig(operation: string): AIProviderOptions {
    const baseConfig = this.configs.get(operation) || {};
    const envConfig = this.loadFromEnvironment();
    
    return {
      aiProvider: baseConfig.aiProvider || envConfig.aiProvider,
      aiModel: baseConfig.aiModel || envConfig.aiModel,
      aiKey: baseConfig.aiKey || envConfig.aiKey,
      aiProviderUrl: baseConfig.aiProviderUrl || envConfig.aiProviderUrl,
      aiReasoning: baseConfig.aiReasoning || envConfig.aiReasoning
    };
  }

  applyConfigToOptions<T extends AIProviderOptions>(
    baseOptions: T, 
    operation: string
  ): T & StreamingAIOptions {
    const config = this.getConfig(operation);
    
    return {
      ...baseOptions,
      aiProvider: config.aiProvider,
      aiModel: config.aiModel,
      aiKey: config.aiKey,
      aiProviderUrl: config.aiProviderUrl,
      aiReasoning: config.aiReasoning,
      stream: config.stream || false
    };
  }

  private loadFromEnvironment(): AIProviderOptions {
    return {
      aiProvider: process.env.AI_PROVIDER,
      aiModel: process.env.AI_MODEL,
      aiKey: process.env.OPENAI_API_KEY || 
               process.env.ANTHROPIC_API_KEY || 
               process.env.OPENROUTER_API_KEY,
      aiProviderUrl: process.env.CUSTOM_API_URL,
      aiReasoning: process.env.AI_REASONING
    };
  }

  // Usage in command handlers
  async handleEnhanceCommand(baseOptions: EnhanceTaskOptions): Promise<void> {
    const options = this.applyConfigToOptions(baseOptions, 'enhance');
    
    if (options.all) {
      const tasks = await this.taskService.listTasks();
      for (const task of tasks) {
        await this.taskService.enhanceTask(task.id, options);
      }
    } else {
      await this.taskService.enhanceTask(options.taskId, options);
    }
  }

  async handleSplitCommand(baseOptions: SplitTaskOptions): Promise<void> {
    const options = this.applyConfigToOptions(baseOptions, 'split');
    
    if (options.all) {
      const tasks = await this.taskService.listTasks();
      for (const task of tasks) {
        await this.taskService.splitTask(task.id, options);
      }
    } else {
      await this.taskService.splitTask(options.taskId, options);
    }
  }

  async handlePlanCommand(baseOptions: PlanTaskOptions): Promise<void> {
    const options = this.applyConfigToOptions(baseOptions, 'plan');
    await this.taskService.planTask(options.id, options);
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

**Remember:** Citizen, in the wasteland of command-line interfaces, well-defined option types are your compass. Every interface is a map through the desert of user input, and every type constraint is a wellspring of predictability. Without them, your commands become lost in the sands of ambiguity.