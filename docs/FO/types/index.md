## TECHNICAL BULLETIN NO. 003
### INDEX - CENTRAL TYPE EXPORT HUB

**DOCUMENT ID:** `task-o-matic-index-types-v1`
**CLEARANCE:** `All Personnel`
**MANDATORY COMPLIANCE:** `Yes`

### ⚠️ CRITICAL SURVIVAL NOTICE
Citizen, ignore this central type index and your imports become a scavenger hunt through the wasteland. Exports fail, type references break, and your codebase becomes a radioactive zone of undefined types. This is your central type distribution hub.

### TYPE SYSTEM ARCHITECTURE

The index file serves as the **central export hub** for all type definitions in the core package. It provides **organized re-exports** that make importing types simple and maintainable. The architecture supports:

- **Centralized Exports**: Single entry point for all types
- **Type Organization**: Logical grouping by functionality
- **Maintainability**: Easy to add new types
- **Backward Compatibility**: Stable export structure
- **Circular Dependency Prevention**: Clean separation of concerns

This design enables **predictable imports** while preventing circular dependencies between type modules.

### COMPLETE TYPE DOCUMENTATION

The index file re-exports all types from specialized modules and provides core type definitions.

#### Direct Type Exports (from this file)

##### AI Configuration Types

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

**Purpose**: Core AI configuration interface

**Properties**:
- **provider** (Required, AIProvider): AI provider name
- **model** (Required, string): AI model name
- **apiKey** (Optional, string): API authentication key
- **baseURL** (Optional, string): Custom endpoint URL
- **maxTokens** (Optional, number): Maximum tokens for generation
- **temperature** (Optional, number): AI temperature setting
- **context7Enabled** (Optional, boolean): Enable Context7 documentation
- **reasoning** (Optional, object): Reasoning token configuration

##### Environment Variable Configuration

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

**Purpose**: Environment-based AI configuration

##### Better-T-Stack Configuration Types

```typescript
export interface BTSConfig {
  frontend: BTSFrontend | BTSFrontend[];
  backend: BTSBackend;
  database: BTSDatabase;
  auth: BTSAuth;
  projectName: string;
  runtime: BTSRuntime;
  api: BTSAPI;
  payments: BTSPayments;
  orm: BTSORM;
  dbSetup: BTSDbSetup;
  packageManager: "npm" | "pnpm" | "bun";
  git: boolean;
  webDeploy: BTSWebDeploy;
  serverDeploy: BTSServerDeploy;
  install: boolean;
  includeDocs?: boolean;
  addons: BTSAddon[];
  examples: BTSExample[];
  template?: BTSTemplate;
  yes?: boolean;
  manualDb?: boolean;
  renderTitle?: boolean;
  createdAt?: string;
  _source?: string;
}
```

**Purpose**: Complete Better-T-Stack configuration

##### Task Types

```typescript
export interface CreateTaskOptions {
  title: string;
  content?: string;
  effort?: "small" | "medium" | "large";
  parentId?: string;
  aiEnhance?: boolean;
}

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
  prdSection?: string;
  prdRequirement?: string;
}
```

**Purpose**: Core task entity and creation options

##### AI Metadata Types

```typescript
export interface TaskAIMetadata {
  taskId: string;
  aiGenerated: boolean;
  aiPrompt?: string;
  confidence?: number;
  aiProvider?: string;
  aiModel?: string;
  generatedAt?: number;
  enhancedAt?: number;
  analyzedAt?: number;
  splitAt?: number;
}
```

**Purpose**: AI operation metadata for tasks

##### Context Builder Types

```typescript
export interface TaskContext {
  task: {
    id: string;
    title: string;
    description: string;
    fullContent?: string;
  };
  stack?: BTSConfig;
  existingCode?: ProjectAnalysis;
  documentation?: {
    recap: string;
    files: Array<{
      path: string;
    }>;
  };
  existingContent?: string;
  prdContent?: string;
  existingResearch?: Record<
    string,
    Array<{
      query: string;
      doc: string;
    }>
  >;
}
```

**Purpose**: Task context builder for AI operations

##### AI Provider Types

```typescript
export const AI_PROVIDERS_LIST = [
  "openai",
  "anthropic",
  "openrouter",
  "custom",
  "gemini",
  "zai",
] as const;

export type AIProvider = (typeof AI_PROVIDERS_LIST)[number];
```

**Purpose**: Supported AI provider enumeration

##### Streaming Types

```typescript
export interface StreamingCallbacks {
  onChunk?: (chunk: string) => void | Promise<void>;
  onFinish?: (result: {
    text: string;
    finishReason?: string;
    usage?: any;
    isAborted?: boolean;
  }) => void | Promise<void>;
  onError?: (error: unknown) => void | Promise<void>;
  onAbort?: (reason?: string) => void | Promise<void>;
  onReasoning?: (text: string) => void | Promise<void>;
}

export interface StreamingOptions extends StreamingCallbacks {
  enabled?: boolean;
}
```

**Purpose**: Streaming response configuration

##### Executor Types

```typescript
export type ExecutorTool = "opencode" | "claude" | "gemini" | "codex" | "kilo";

export interface ExecutorConfig {
  model?: string;
  sessionId?: string;
  continueLastSession?: boolean;
}
```

**Purpose**: External executor tool configuration

##### Execute Task Types

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
  planTool?: string;
  reviewPlan?: boolean;
  review?: boolean;
  reviewModel?: string;
  autoCommit?: boolean;
  includePrd?: boolean;
  onPlanReview?: (planFile: string) => Promise<string | undefined>;
}
```

**Purpose**: Task execution configuration

##### Execute Loop Types

```typescript
export interface ExecuteLoopConfig {
  model?: string;
  maxRetries?: number;
  verificationCommands?: string[];
  autoCommit?: boolean;
  tryModels?: ModelAttemptConfig[];
  plan?: boolean;
  planModel?: string;
  planTool?: string;
  reviewPlan?: boolean;
  review?: boolean;
  reviewModel?: string;
  customMessage?: string;
  continueSession?: boolean;
  includeCompleted?: boolean;
  includePrd?: boolean;
  notifyTargets?: string[];
  onPlanReview?: (planFile: string) => Promise<string | undefined>;
}

export interface ExecuteLoopOptions {
  filters?: {
    status?: string;
    tag?: string;
    taskIds?: string[];
  };
  tool?: ExecutorTool;
  config?: ExecuteLoopConfig;
  dry?: boolean;
}
```

**Purpose**: Batch task execution configuration

##### Execution Result Types

```typescript
export interface ExecutionResult {
  success: boolean;
  exitCode?: number;
  error?: string;
}

export interface TaskExecutionAttempt {
  attemptNumber: number;
  success: boolean;
  error?: string;
  executor?: ExecutorTool;
  model?: string;
  verificationResults?: Array<{
    command: string;
    success: boolean;
    output?: string;
    error?: string;
  }>;
  commitInfo?: {
    message: string;
    files: string[];
  };
  timestamp: number;
}

export interface TaskExecutionResult {
  success: boolean;
  attempts: TaskExecutionAttempt[];
  commitInfo?: {
    message: string;
    files: string[];
  };
  subtaskResults?: TaskExecutionResult[];
  planContent?: string;
  reviewFeedback?: string;
}

export interface ExecuteLoopResult {
  totalTasks: number;
  completedTasks: number;
  failedTasks: number;
  taskResults: Array<{
    taskId: string;
    taskTitle: string;
    attempts: TaskExecutionAttempt[];
    finalStatus: "completed" | "failed";
  }>;
  duration: number;
}
```

**Purpose**: Task execution result tracking

##### PRD Evolution Types

```typescript
export interface PRDChange {
  type: "add" | "modify" | "remove" | "complete";
  section: string;
  description: string;
  taskId?: string;
  changedAt: number;
}

export interface PRDVersion {
  version: number;
  content: string;
  createdAt: number;
  changes: PRDChange[];
  implementedTasks: string[];
  message?: string;
  prdFile: string;
}

export interface PRDVersionData {
  prdFile: string;
  versions: PRDVersion[];
  currentVersion: number;
}
```

**Purpose**: PRD versioning and evolution tracking

##### Continue Workflow Types

```typescript
export type ContinueAction =
  | "add-feature"
  | "update-prd"
  | "generate-tasks"
  | "review-status"
  | "generate-plan";
```

**Purpose**: Continue workflow action types

#### Re-Exported Types (from other modules)

The index file re-exports all types from specialized modules:

```typescript
// Re-exports from results.ts
export type {
  OperationResult,
  CreateTaskResult,
  EnhanceTaskResult,
  SplitTaskResult,
  PlanTaskResult,
  DocumentTaskResult,
  DeleteTaskResult,
  PRDParseResult,
  ContinueResult,
} from "./results";

// Re-exports all workflow types
export * from "./workflow-options";
export * from "./options";
export * from "./results";
export * from "./callbacks";
export * from "./project-analysis";
```

### TYPE ORGANIZATION

The core types are organized by functionality:

#### 1. Callbacks (`callbacks.ts`)

**Purpose**: Event coordination and progress tracking
**Key Types**:
- `ProgressEvent` - Progress event types for AI operations
- `ProgressCallback` - Optional callback handlers

**Import Path**: `task-o-matic-core/types/callbacks`

#### 2. CLI Options (`cli-options.ts`)

**Purpose**: CLI command option definitions (CLI package)
**Key Types**:
- `TaskIdOrAllOptions` - Single task or all tasks
- `FilterOptions` - Status and tag filtering
- `DryRunOptions` - Dry-run mode
- `ForceOptions` - Force operations
- `StreamingOptions` - Streaming control
- `AIProviderOptions` - AI provider configuration
- `CreateCommandOptions` - Task creation options
- `EnhanceCommandOptions` - Task enhancement options
- `SplitCommandOptions` - Task splitting options
- `PlanCommandOptions` - Planning options
- `DocumentCommandOptions` - Documentation options
- `ExecuteCommandOptions` - Task execution options
- And many more command-specific options

**Import Path**: `task-o-matic-cli/types/cli-options`

#### 3. MCP Types (`mcp.ts`)

**Purpose**: Model Context Protocol support
**Key Types**:
- `McpToolInput` - Tool input definitions (placeholder)

**Import Path**: `task-o-matic-core/types/mcp`

#### 4. Options (`options.ts`)

**Purpose**: Core service option definitions
**Key Types**:
- `AIProviderOptions` - AI provider configuration
- `StreamingAIOptions` - Streaming support
- `ListTasksOptions` - Task filtering options
- `CreateTaskOptions` - Task creation options
- `ShowTaskOptions` - Task display options
- `DocumentTaskOptions` - Documentation generation options
- `EnhanceTaskOptions` - Task enhancement options
- `SplitTaskOptions` - Task splitting options
- `PlanTaskOptions` - Planning options
- `GetPlanOptions` - Plan retrieval options
- `UpdateTaskOptions` - Task update options
- `DeleteTaskOptions` - Task deletion options
- `SetTaskStatusOptions` - Task status options
- `ManageTagsOptions` - Tag management options
- `DeletePlanOptions` - Plan deletion options
- `ListSubtasksOptions` - Subtask listing options
- `TaskTreeOptions` - Task hierarchy options
- `GetNextTaskOptions` - Next task retrieval options
- `ParsePrdOptions` - PRD parsing options
- `ReworkPrdOptions` - PRD rework options
- `WorkflowStep` - Workflow step type
- `WorkflowState` - Workflow state interface
- `AIAssistedChoice` - AI-assisted choice
- `InitConfigChoice` - Initialization config

**Import Path**: `task-o-matic-core/types/options`

#### 5. Results (`results.ts`)

**Purpose**: Operation result definitions
**Key Types**:
- `OperationResult` - Generic operation result
- `CreateTaskResult` - Task creation result
- `EnhanceTaskResult` - Task enhancement result
- `SplitTaskResult` - Task splitting result
- `PlanTaskResult` - Planning result
- `DocumentTaskResult` - Documentation result
- `DeleteTaskResult` - Task deletion result
- `PRDParseResult` - PRD parsing result
- `SuggestStackResult` - Stack suggestion result
- `PRDFromCodebaseResult` - Codebase PRD generation result
- `ContinueResult` - Continue project result

**Import Path**: `task-o-matic-core/types/results`

#### 6. Workflow Options (`workflow-options.ts`)

**Purpose**: Workflow automation options
**Key Types**:
- `WorkflowAutomationOptions` - Complete workflow automation options
- `WorkflowState` - Workflow execution state

**Import Path**: `task-o-matic-core/types/workflow-options`

#### 7. Workflow Results (`workflow-results.ts`)

**Purpose**: Workflow operation result definitions
**Key Types**:
- `InitializeResult` - Initialization result
- `DefinePRDResult` - PRD definition result
- `RefinePRDResult` - PRD refinement result
- `GenerateTasksResult` - Task generation result
- `SplitTasksResult` - Task splitting result

**Import Path**: `task-o-matic-core/types/workflow-results`

### FUNCTION DOCUMENTATION

No standalone functions in this module - this is a type definition file.

### INTEGRATION PROTOCOLS

#### Recommended Import Patterns

```typescript
// Pattern 1: Import specific types for type safety
import {
  Task,
  CreateTaskOptions,
  EnhanceTaskResult,
  AIConfig,
  BTSConfig
} from "task-o-matic-core";

// Pattern 2: Import from specific modules
import { ProgressEvent } from "task-o-matic-core/types/callbacks";
import { AIProviderOptions } from "task-o-matic-core/types/options";
import { Task } from "task-o-matic-core/types/index";

// Pattern 3: Named imports for clarity
import {
  ProgressEvent,
  ProgressCallback,
  Task,
  AIConfig,
  BTSConfig
} from "task-o-matic-core/types";
```

#### Usage Examples

```typescript
// Service layer imports
import { TaskService } from "../services/tasks";

// Type imports
import type {
  Task,
  CreateTaskOptions,
  AIProviderOptions,
  StreamingOptions
} from "task-o-matic-core";

export class TaskService {
  async createTask(
    options: CreateTaskOptions,
    aiConfig?: AIProviderOptions,
    streamingOptions?: StreamingOptions,
    callbacks?: { onProgress: (event: ProgressEvent) => void }
  ): Promise<Task> {
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
      await this.enhanceTask(task.id, aiConfig, streamingOptions, callbacks);
    }

    return task;
  }

  async enhanceTask(
    taskId: string,
    aiConfig: AIProviderOptions,
    streamingOptions?: StreamingOptions,
    callbacks?: { onProgress: (event: ProgressEvent) => void }
  ): Promise<void> {
    const task = await this.storage.getTask(taskId);

    callbacks?.onProgress?.({
      type: "started",
      message: "Enhancing task..."
    });

    // Enhancement logic here...

    callbacks?.onProgress?.({
      type: "completed",
      message: "Task enhanced"
    });
  }
}
```

### TECHNICAL SPECIFICATIONS

#### Export Structure

- **Wildcard Re-exports**: `export * from "./module"` pattern
- **Direct Exports**: Core types defined in this file
- **Type Safety**: All types properly exported with correct paths
- **No Default Exports**: All types require explicit import
- **Module Boundaries**: Clean separation between functional areas
- **Import Performance**: Fast wildcard re-exports

#### Maintenance Guidelines

1. **New Type Addition**: Add to appropriate module or directly to index
2. **Index Updates**: Re-export from index if added to module
3. **Breaking Changes**: Consider version bumps for major changes
4. **Deprecation**: Mark as deprecated before removing

**Remember:** Citizen, in wasteland of type systems, a well-organized index is your navigation chart. Every re-export is a signpost to survival, every type path is a route through the documentation, and every import is your lifeline to functionality. Without this index, your imports become lost in the radioactive fog.
