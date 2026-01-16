## TECHNICAL BULLETIN NO. 002
### WORKFLOW SERVICE - PROJECT WORKFLOW SURVIVAL SYSTEM

**DOCUMENT ID:** `task-o-matic-workflow-v1`
**CLEARANCE:** `All Personnel`
**MANDATORY COMPLIANCE:** `Yes`

### ⚠️ CRITICAL SURVIVAL NOTICE
Citizen, the WorkflowService is your command center for project survival in the post-deadline wasteland. Ignore this documentation and your projects will crumble into disorganized chaos faster than a sandstorm in the radiation zone. This service orchestrates the complete project lifecycle from initialization to task execution.

### SYSTEM ARCHITECTURE OVERVIEW

The WorkflowService serves as the high-level orchestration layer that coordinates multiple services to execute complete project workflows. It abstracts away the complexity of project setup, PRD management, and task generation into a unified interface.

**Core Dependencies:**
- **ConfigManager**: Project configuration and AI settings management
- **PRDService**: Product Requirements Document processing
- **TaskService**: Task creation and management
- **WorkflowAIAssistant**: AI-powered decision making
- **Better-T-Stack CLI**: Project bootstrapping integration

**Workflow Stages:**
1. **Project Initialization**: Setup project structure and AI configuration
2. **PRD Definition**: Create or import Product Requirements Document
3. **PRD Refinement**: Improve PRD based on feedback
4. **Task Generation**: Extract tasks from PRD
5. **Task Splitting**: Break down complex tasks into subtasks
6. **Task Execution**: Execute generated tasks with AI assistance

### COMPLETE API DOCUMENTATION

---

#### initializeProject

```typescript
async initializeProject(input: {
  projectName: string;
  projectDir?: string;
  initMethod?: "quick" | "custom" | "ai";
  projectDescription?: string;
  aiOptions?: AIOptions;
  stackConfig?: {
    frontend?: string;
    backend?: string;
    database?: string;
    auth?: boolean;
  };
  bootstrap?: boolean;
  includeDocs?: boolean;
  streamingOptions?: StreamingOptions;
  callbacks?: ProgressCallback;
}): Promise<InitializeResult>
```

**Parameters:**
- `input.projectName` (string, required): Name of the project to initialize
- `input.projectDir` (string, optional): Project directory path (defaults to projectName in cwd)
- `input.initMethod` ("quick" | "custom" | "ai", optional): Initialization method
  - "quick": Pre-configured modern stack
  - "custom": User-specified stack configuration
  - "ai": AI-recommended stack based on description
- `input.projectDescription` (string, optional): Project description for AI recommendations
- `input.aiOptions` (AIOptions, optional): AI configuration override
- `input.stackConfig` (object, optional): Manual stack configuration
  - `frontend` (string, optional): Frontend framework
  - `backend` (string, optional): Backend framework
  - `database` (string, optional): Database system
  - `auth` (boolean, optional): Include authentication
- `input.bootstrap` (boolean, optional): Whether to bootstrap with Better-T-Stack
- `input.includeDocs` (boolean, optional): Include documentation in bootstrap
- `input.streamingOptions` (StreamingOptions, optional): Real-time progress callbacks
- `input.callbacks` (ProgressCallback, optional): Progress event handlers

**Returns:** InitializeResult containing:
- `success` (boolean): Operation success status
- `projectDir` (string): Created project directory path
- `projectName` (string): Project name
- `aiConfig` (object): AI configuration used
  - `provider` (string): AI provider
  - `model` (string): AI model
  - `key` (string): API key
- `stackConfig` (object): Stack configuration used
- `bootstrapped` (boolean): Whether project was bootstrapped

**Error Conditions:**
- File system errors during directory creation
- Configuration errors during AI setup
- Bootstrap failures from Better-T-Stack CLI

**Example: Quick Project Initialization**
```typescript
const result = await workflowService.initializeProject({
  projectName: "my-app",
  initMethod: "quick",
  bootstrap: true,
  callbacks: {
    onProgress: (event) => console.log(event.message),
    onError: (error) => console.error("Error:", error.message)
  }
});

console.log(`Project initialized at: ${result.projectDir}`);
console.log(`AI config: ${result.aiConfig.provider}/${result.aiConfig.model}`);
```

**Example: AI-Assisted Initialization**
```typescript
const result = await workflowService.initializeProject({
  projectName: "e-commerce-platform",
  initMethod: "ai",
  projectDescription: "Full-stack e-commerce platform with payment processing and inventory management",
  aiOptions: {
    aiProvider: "anthropic",
    aiModel: "claude-3-5-sonnet"
  },
  bootstrap: true,
  includeDocs: true,
  streamingOptions: {
    onChunk: (chunk) => process.stdout.write(chunk)
  }
});

console.log("AI recommended stack:", result.stackConfig);
```

**Example: Custom Stack Configuration**
```typescript
const result = await workflowService.initializeProject({
  projectName: "custom-api",
  initMethod: "custom",
  stackConfig: {
    frontend: "react",
    backend: "express",
    database: "postgresql",
    auth: true
  },
  aiOptions: {
    aiProvider: "openai",
    aiModel: "gpt-4"
  }
});
```

---

#### definePRD

```typescript
async definePRD(input: {
  method: "upload" | "manual" | "ai" | "skip";
  prdFile?: string;
  prdDescription?: string;
  prdContent?: string;
  projectDir: string;
  aiOptions?: AIOptions;
  streamingOptions?: StreamingOptions;
  callbacks?: ProgressCallback;
  multiGeneration?: boolean;
  multiGenerationModels?: Array<{ provider: string; model: string }>;
  combineAI?: { provider: string; model: string };
}): Promise<DefinePRDResult>
```

**Parameters:**
- `input.method` ("upload" | "manual" | "ai" | "skip", required): PRD creation method
  - "upload": Import from existing file
  - "manual": Use provided content directly
  - "ai": Generate from description
  - "skip": Skip PRD creation
- `input.prdFile` (string, optional): Path to existing PRD file (for upload method)
- `input.prdDescription` (string, optional): Project description (for AI generation)
- `input.prdContent` (string, optional): PRD content (for manual method)
- `input.projectDir` (string, required): Project directory path
- `input.aiOptions` (AIOptions, optional): AI configuration override
- `input.streamingOptions` (StreamingOptions, optional): Streaming callbacks
- `input.callbacks` (ProgressCallback, optional): Progress handlers
- `input.multiGeneration` (boolean, optional): Generate multiple PRDs with different models
- `input.multiGenerationModels` (array, optional): Models for multi-generation
- `input.combineAI` (object, optional): AI configuration for combining PRDs

**Returns:** DefinePRDResult containing:
- `success` (boolean): Operation success status
- `prdFile` (string): Path to saved PRD file
- `prdContent` (string): PRD content
- `method` (string): Method used
- `stats` (object): Statistics
  - `duration` (number): Operation duration in ms
  - `tokenUsage` (object, optional): Token usage statistics
  - `timeToFirstToken` (number, optional): Time to first token
  - `cost` (number, optional): Calculated cost

**Error Conditions:**
- File not found errors for upload method
- AI operation failures for generation
- File system errors during save

**Example: Upload Existing PRD**
```typescript
const result = await workflowService.definePRD({
  method: "upload",
  prdFile: "./existing-prd.md",
  projectDir: "/path/to/project",
  callbacks: {
    onProgress: (event) => console.log(event.message)
  }
});

console.log(`PRD uploaded to: ${result.prdFile}`);
```

**Example: AI-Generated PRD**
```typescript
const result = await workflowService.definePRD({
  method: "ai",
  prdDescription: "Build a task management application with AI-powered features",
  projectDir: "/path/to/project",
  aiOptions: {
    aiProvider: "anthropic",
    aiModel: "claude-3-5-sonnet"
  },
  streamingOptions: {
    onChunk: (chunk) => process.stdout.write(chunk),
    onFinish: (result) => console.log("\nPRD generation complete!")
  }
});

console.log(`Generated PRD with ${result.prdContent.length} characters`);
```

**Example: Multi-Model PRD Generation**
```typescript
const result = await workflowService.definePRD({
  method: "ai",
  prdDescription: "Social media platform for developers",
  projectDir: "/path/to/project",
  multiGeneration: true,
  multiGenerationModels: [
    { provider: "anthropic", model: "claude-3-5-sonnet" },
    { provider: "openai", model: "gpt-4" },
    { provider: "openrouter", model: "anthropic/claude-3-opus" }
  ],
  combineAI: {
    provider: "anthropic",
    model: "claude-3-5-sonnet"
  },
  callbacks: {
    onProgress: (event) => console.log(`[${event.message}]`)
  }
});

console.log(`Generated master PRD from ${result.stats.tokenUsage?.total || 0} tokens`);
```

---

#### refinePRD

```typescript
async refinePRD(input: {
  method: "manual" | "ai" | "skip";
  prdFile: string;
  prdContent?: string;
  feedback?: string;
  projectDir: string;
  aiOptions?: AIOptions;
  streamingOptions?: StreamingOptions;
  callbacks?: ProgressCallback;
}): Promise<RefinePRDResult>
```

**Parameters:**
- `input.method` ("manual" | "ai" | "skip", required): Refinement method
  - "manual": Use provided content directly
  - "ai": AI-powered refinement based on feedback
  - "skip": Skip refinement
- `input.prdFile` (string, required): Path to PRD file
- `input.prdContent` (string, optional): New PRD content (for manual method)
- `input.feedback` (string, optional): User feedback for AI refinement
- `input.projectDir` (string, required): Project directory
- `input.aiOptions` (AIOptions, optional): AI configuration override
- `input.streamingOptions` (StreamingOptions, optional): Streaming callbacks
- `input.callbacks` (ProgressCallback, optional): Progress handlers

**Returns:** RefinePRDResult containing:
- `success` (boolean): Operation success status
- `prdFile` (string): Path to refined PRD file
- `prdContent` (string): Refined PRD content
- `stats` (object): Statistics
  - `duration` (number): Operation duration
  - `tokenUsage` (object, optional): Token usage
  - `timeToFirstToken` (number, optional): Time to first token
  - `cost` (number, optional): Calculated cost

**Error Conditions:**
- File not found errors
- AI operation failures
- File system errors during save

**Example: Manual PRD Refinement**
```typescript
const result = await workflowService.refinePRD({
  method: "manual",
  prdFile: "/path/to/project/prd.md",
  prdContent: "# Updated PRD\n\nThis is the refined version...",
  projectDir: "/path/to/project",
  callbacks: {
    onProgress: (event) => console.log(event.message)
  }
});

console.log(`PRD refined and saved to: ${result.prdFile}`);
```

**Example: AI-Powered Refinement**
```typescript
const result = await workflowService.refinePRD({
  method: "ai",
  prdFile: "/path/to/project/prd.md",
  feedback: "Add more technical specifications and API details. Include security considerations.",
  projectDir: "/path/to/project",
  aiOptions: {
    aiProvider: "anthropic",
    aiModel: "claude-3-5-sonnet"
  },
  streamingOptions: {
    onChunk: (chunk) => process.stdout.write(chunk),
    onFinish: () => console.log("\nRefinement complete!")
  }
});

console.log(`Refined PRD in ${result.stats.duration}ms`);
```

---

#### generateTasks

```typescript
async generateTasks(input: {
  prdFile: string;
  method: "standard" | "ai";
  customInstructions?: string;
  projectDir: string;
  aiOptions?: AIOptions;
  streamingOptions?: StreamingOptions;
  callbacks?: ProgressCallback;
}): Promise<GenerateTasksResult>
```

**Parameters:**
- `input.prdFile` (string, required): Path to PRD file
- `input.method` ("standard" | "ai", required): Task generation method
  - "standard": Standard PRD parsing
  - "ai": AI-enhanced task extraction
- `input.customInstructions` (string, optional): Custom instructions for AI
- `input.projectDir` (string, required): Project directory
- `input.aiOptions` (AIOptions, optional): AI configuration override
- `input.streamingOptions` (StreamingOptions, optional): Streaming callbacks
- `input.callbacks` (ProgressCallback, optional): Progress handlers

**Returns:** GenerateTasksResult containing:
- `success` (boolean): Operation success status
- `tasks` (Task[]): Array of generated tasks
- `stats` (object): Statistics
  - `tasksCreated` (number): Number of tasks created
  - `duration` (number): Operation duration
  - `tokenUsage` (object, optional): Token usage
  - `timeToFirstToken` (number, optional): Time to first token
  - `cost` (number, optional): Calculated cost

**Error Conditions:**
- PRD file not found
- AI operation failures
- Task creation errors

**Example: Standard Task Generation**
```typescript
const result = await workflowService.generateTasks({
  prdFile: "/path/to/project/prd.md",
  method: "standard",
  projectDir: "/path/to/project",
  callbacks: {
    onProgress: (event) => {
      if (event.type === 'progress') {
        console.log(`Progress: ${event.message}`);
      }
    }
  }
});

console.log(`Generated ${result.stats.tasksCreated} tasks`);
result.tasks.forEach(task => {
  console.log(`- ${task.title} (${task.estimatedEffort})`);
});
```

**Example: AI-Enhanced Task Generation**
```typescript
const result = await workflowService.generateTasks({
  prdFile: "/path/to/project/prd.md",
  method: "ai",
  customInstructions: "Focus on API development tasks first, then frontend. Include testing tasks.",
  projectDir: "/path/to/project",
  aiOptions: {
    aiProvider: "anthropic",
    aiModel: "claude-3-5-sonnet"
  },
  streamingOptions: {
    onChunk: (chunk) => process.stdout.write(chunk)
  }
});

console.log(`Created ${result.tasks.length} tasks with AI assistance`);
console.log(`Token usage: ${result.stats.tokenUsage?.total || 0} tokens`);
```

---

#### splitTasks

```typescript
async splitTasks(input: {
  taskIds: string[];
  splitMethod: "interactive" | "standard" | "custom";
  customInstructions?: string;
  aiOptions?: AIOptions;
  streamingOptions?: StreamingOptions;
  callbacks?: ProgressCallback;
}): Promise<SplitTasksResult>
```

**Parameters:**
- `input.taskIds` (string[], required): Array of task IDs to split
- `input.splitMethod` ("interactive" | "standard" | "custom", required): Splitting method
  - "interactive": Interactive splitting (not implemented in service layer)
  - "standard": Standard AI-powered splitting
  - "custom": Custom instructions for splitting
- `input.customInstructions` (string, optional): Custom splitting instructions
- `input.aiOptions` (AIOptions, optional): AI configuration override
- `input.streamingOptions` (StreamingOptions, optional): Streaming callbacks
- `input.callbacks` (ProgressCallback, optional): Progress handlers

**Returns:** SplitTasksResult containing:
- `success` (boolean): Operation success status
- `results` (array): Array of split results
  - `taskId` (string): Original task ID
  - `subtasks` (Task[]): Array of created subtasks
  - `error` (string, optional): Error message if splitting failed

**Error Conditions:**
- Task not found errors
- AI operation failures
- Task splitting constraints (already has subtasks)

**Example: Standard Task Splitting**
```typescript
const result = await workflowService.splitTasks({
  taskIds: ["1", "2", "3"],
  splitMethod: "standard",
  callbacks: {
    onProgress: (event) => console.log(event.message)
  }
});

result.results.forEach(splitResult => {
  if (splitResult.error) {
    console.error(`Failed to split task ${splitResult.taskId}: ${splitResult.error}`);
  } else {
    console.log(`Split task ${splitResult.taskId} into ${splitResult.subtasks.length} subtasks`);
  }
});
```

**Example: Custom Task Splitting**
```typescript
const result = await workflowService.splitTasks({
  taskIds: ["1"],
  splitMethod: "custom",
  customInstructions: "Split this into frontend, backend, and database components. Include testing tasks for each.",
  aiOptions: {
    aiProvider: "anthropic",
    aiModel: "claude-3-5-sonnet"
  },
  streamingOptions: {
    onChunk: (chunk) => process.stdout.write(chunk)
  }
});

const splitResult = result.results[0];
if (!splitResult.error) {
  console.log(`Created ${splitResult.subtasks.length} subtasks with custom instructions`);
  splitResult.subtasks.forEach(subtask => {
    console.log(`  - ${subtask.title}`);
  });
}
```

---

#### continueProject

```typescript
async continueProject(input: {
  projectDir?: string;
  action?: ContinueAction;
  aiOptions?: AIOptions;
  streamingOptions?: StreamingOptions;
  callbacks?: ProgressCallback;
}): Promise<ContinueResult>
```

**Parameters:**
- `input.projectDir` (string, optional): Project directory (defaults to cwd)
- `input.action` (ContinueAction, optional): Specific action to execute
  - `"status"`: Review current project status
  - `"generate-plan"`: Generate implementation plan
  - `"add-feature"`: Add new feature to project
  - `"update-prd"`: Update PRD with recent progress
  - `"generate-tasks"`: Generate tasks from updated PRD
- `input.aiOptions` (AIOptions, optional): AI configuration override
- `input.streamingOptions` (StreamingOptions, optional): Streaming callbacks
- `input.callbacks` (ProgressCallback, optional): Progress handlers

**Returns:** ContinueResult containing:
- `success` (boolean): Operation success status
- `action` (string): Action executed
- `projectStatus` (object, optional): Project status information
  - `tasks` (object): Task statistics
    - `total` (number): Total task count
    - `completed` (number): Completed task count
    - `inProgress` (number): In-progress task count
    - `todo` (number): Todo task count
    - `completionPercentage` (number): Project completion percentage
  - `prd` (object): PRD information
    - `exists` (boolean): Whether PRD exists
    - `path` (string): Path to PRD file
  - `nextSteps` (string[]): Recommended next steps
- `message` (string, optional): Status message or error details

**Error Conditions:**
- Project not initialized (no `.task-o-matic` directory)
- PRD not found when required for action

**Example: Check Project Status**
```typescript
const result = await workflowService.continueProject({
  projectDir: "/path/to/project",
  callbacks: {
    onProgress: (event) => console.log(event.message)
  }
});

if (result.success && result.projectStatus) {
  const { tasks, prd, nextSteps } = result.projectStatus;
  console.log(`Project Completion: ${tasks.completionPercentage}%`);
  console.log(`Total Tasks: ${tasks.total} (${tasks.completed} completed)`);
  console.log(`PRD Status: ${prd.exists ? "Found" : "Not found"}`);
  console.log("\nRecommended Next Steps:");
  nextSteps.forEach(step => console.log(`  - ${step}`));
}
```

**Example: Generate Tasks from Existing PRD**
```typescript
const result = await workflowService.continueProject({
  projectDir: "/path/to/project",
  action: "generate-tasks",
  callbacks: {
    onProgress: (event) => console.log(event.message)
  }
});

console.log(`Action: ${result.action}`);
if (result.message) {
  console.log(`Message: ${result.message}`);
}
```

**Example: Review Project Status with Specific Directory**
```typescript
const result = await workflowService.continueProject({
  projectDir: "/path/to/another/project",
  action: "review-status",
  callbacks: {
    onProgress: (event) => console.log(`[${event.message}]`)
  }
});

if (result.success && result.projectStatus) {
  console.log("Project Analysis Complete");
  console.log(`Tasks: ${result.projectStatus.tasks.todo} todo, ${result.projectStatus.tasks.inProgress} in progress`);
}
```

---

#### executeTasks

```typescript
async executeTasks(input: {
  options: ExecuteLoopOptions;
  callbacks?: ProgressCallback;
}): Promise<{ success: boolean; result: ExecuteLoopResult }>
```

**Parameters:**
- `input.options` (ExecuteLoopOptions, required): Execution loop configuration
  - `status` (string, required): Task status filter (e.g., "todo", "in-progress")
  - `tool` (string): Execution tool to use
  - `maxRetries` (number): Maximum retry attempts per task
  - `tryModels` (array): Array of AI models to try in sequence
  - `verify` (string | string[]): Verification command(s) to run after each task
  - `plan` (boolean): Generate implementation plan before execution
  - `review` (boolean): Review generated code before applying
  - `autoCommit` (boolean): Automatically commit successful changes
- `input.callbacks` (ProgressCallback, optional): Progress event handlers

**Returns:** Object containing:
- `success` (boolean): Whether all tasks executed successfully
- `result` (ExecuteLoopResult): Execution results
  - `completedTasks` (number): Number of tasks completed
  - `failedTasks` (number): Number of tasks that failed
  - `details` (array): Individual task execution details

**Error Conditions:**
- Invalid task status filter
- No tasks matching status filter
- Execution tool errors
- Verification command failures

**Example: Execute All Todo Tasks with Verification**
```typescript
const { success, result } = await workflowService.executeTasks({
  options: {
    status: "todo",
    tool: "opencode",
    maxRetries: 3,
    tryModels: [
      { provider: "openai", model: "gpt-4o-mini" },
      { provider: "openai", model: "gpt-4o" },
      { provider: "anthropic", model: "claude-3.5-sonnet" },
    ],
    verify: "bun test",
    plan: true,
    review: true,
    autoCommit: true,
  },
  callbacks: {
    onProgress: (event) => console.log(`Progress: ${event.message}`),
    onError: (error) => console.error(`Error: ${error.message}`),
  },
});

console.log(`Execution ${success ? "completed" : "failed"}`);
console.log(`Tasks completed: ${result.completedTasks}`);
console.log(`Tasks failed: ${result.failedTasks}`);
```

**Example: Execute with Multiple Verification Commands**
```typescript
const { success, result } = await workflowService.executeTasks({
  options: {
    status: "todo",
    tool: "opencode",
    maxRetries: 2,
    verify: ["bun test", "bun run build"],
    plan: true,
  },
  callbacks: {
    onProgress: (event) => console.log(event.message),
  },
});

if (success) {
  console.log("All tasks executed and verified successfully!");
} else {
  console.log(`${result.failedTasks} tasks failed execution`);
}
```

### INTEGRATION PROTOCOLS

**Progress Callback System:**
The WorkflowService uses a standardized progress callback interface:
```typescript
interface ProgressCallback {
  onProgress?: (event: {
    type: "started" | "progress" | "completed" | "info" | "stream-chunk" | "reasoning-chunk";
    message?: string;
    current?: number;
    total?: number;
  }) => void;
  onError?: (error: Error) => void;
}
```

**AI Configuration Integration:**
All AI operations accept AIOptions for provider/model overrides:
```typescript
interface AIOptions {
  aiProvider?: string;
  aiModel?: string;
  aiKey?: string;
  aiProviderUrl?: string;
}
```

**Streaming Integration:**
Real-time feedback through StreamingOptions:
```typescript
interface StreamingOptions {
  onChunk?: (chunk: string) => void;
  onFinish?: (result: any) => void;
  onError?: (error: Error) => void;
}
```

### SURVIVAL SCENARIOS

**Scenario 1: Complete Project Workflow**
```typescript
// Step 1: Initialize project
const initResult = await workflowService.initializeProject({
  projectName: "task-manager",
  initMethod: "ai",
  projectDescription: "AI-powered task management application",
  bootstrap: true,
  aiOptions: { aiProvider: "anthropic", aiModel: "claude-3-5-sonnet" }
});

// Step 2: Generate PRD
const prdResult = await workflowService.definePRD({
  method: "ai",
  prdDescription: "Task management app with AI assistance, deadlines, and collaboration",
  projectDir: initResult.projectDir,
  aiOptions: { aiProvider: "anthropic", aiModel: "claude-3-5-sonnet" }
});

// Step 3: Generate tasks
const tasksResult = await workflowService.generateTasks({
  prdFile: prdResult.prdFile,
  method: "ai",
  projectDir: initResult.projectDir,
  aiOptions: { aiProvider: "anthropic", aiModel: "claude-3-5-sonnet" }
});

// Step 4: Split complex tasks
const splitResult = await workflowService.splitTasks({
  taskIds: tasksResult.tasks.slice(0, 3).map(t => t.id), // Split first 3 tasks
  splitMethod: "standard"
});

console.log(`Project setup complete: ${tasksResult.stats.tasksCreated} tasks created`);
```

**Scenario 2: Multi-Model PRD Comparison**
```typescript
// Generate PRDs with multiple models for comparison
const prdResult = await workflowService.definePRD({
  method: "ai",
  prdDescription: "Real-time collaboration platform for remote teams",
  projectDir: "/path/to/project",
  multiGeneration: true,
  multiGenerationModels: [
    { provider: "anthropic", model: "claude-3-5-sonnet" },
    { provider: "openai", model: "gpt-4" },
    { provider: "openrouter", model: "anthropic/claude-3-opus" }
  ],
  combineAI: { provider: "anthropic", model: "claude-3-5-sonnet" }
});

console.log(`Generated master PRD using ${prdResult.stats.tokenUsage?.total || 0} total tokens`);
```

**Scenario 3: Iterative PRD Refinement**
```typescript
// Initial PRD generation
const initialPRD = await workflowService.definePRD({
  method: "ai",
  prdDescription: "Mobile app for fitness tracking",
  projectDir: "/path/to/project"
});

// Refine with feedback
const refinedPRD = await workflowService.refinePRD({
  method: "ai",
  prdFile: initialPRD.prdFile,
  feedback: "Add social features, workout plans, and nutrition tracking. Include offline capabilities.",
  projectDir: "/path/to/project",
  aiOptions: { aiProvider: "anthropic", model: "claude-3-5-sonnet" }
});

// Generate tasks from refined PRD
const tasksResult = await workflowService.generateTasks({
  prdFile: refinedPRD.prdFile,
  method: "ai",
  projectDir: "/path/to/project"
});

console.log(`Refined PRD generated ${tasksResult.stats.tasksCreated} tasks`);
```

**Scenario 4: Continue Project and Check Status**
```typescript
// Check on an existing project
const result = await workflowService.continueProject({
  projectDir: "/path/to/existing-project",
  callbacks: {
    onProgress: (event) => console.log(`Analyzing: ${event.message}`)
  }
});

if (result.success && result.projectStatus) {
  const { tasks, prd, nextSteps } = result.projectStatus;
  console.log(`\n📊 Project Status:`);
  console.log(`   Completion: ${tasks.completionPercentage}%`);
  console.log(`   Tasks: ${tasks.total} total (${tasks.completed} completed, ${tasks.todo} todo)`);
  console.log(`   PRD: ${prd.exists ? "✓ Present" : "✗ Missing"}`);
  console.log(`\n📋 Recommended Actions:`);
  nextSteps.forEach(step => console.log(`   → ${step}`));
}
```

**Scenario 5: Execute Tasks with Retry Logic**
```typescript
// Execute all todo tasks with progressive model escalation
const { success, result } = await workflowService.executeTasks({
  options: {
    status: "todo",
    tool: "opencode",
    maxRetries: 3,
    tryModels: [
      { provider: "openai", model: "gpt-4o-mini" },  // Fast, cheap - try first
      { provider: "openai", model: "gpt-4o" },      // Better quality - try second
      { provider: "anthropic", model: "claude-3.5-sonnet" }, // Best quality - try last
    ],
    verify: "bun test",
    plan: true,
    review: true,
    autoCommit: true,
  },
  callbacks: {
    onProgress: (event) => console.log(`[${event.message}]`),
    onError: (error) => console.error(`Execution error: ${error.message}`),
  },
});

console.log(`\nExecution Summary:`);
console.log(`  ✅ Completed: ${result.completedTasks}`);
console.log(`  ❌ Failed: ${result.failedTasks}`);
console.log(`  📈 Success Rate: ${Math.round((result.completedTasks / (result.completedTasks + result.failedTasks)) * 100)}%`);
```

### TECHNICAL SPECIFICATIONS

**Directory Structure Created:**
```
project/
├── .task-o-matic/
│   ├── config.json
│   ├── tasks/
│   ├── prd/
│   └── logs/
├── .env
└── [bootstrapped files if enabled]
```

**Environment Variables Set:**
- `AI_PROVIDER`: AI provider (openai, anthropic, openrouter)
- `AI_MODEL`: AI model name
- `{PROVIDER}_API_KEY`: Provider-specific API key
- `AI_PROVIDER_URL`: Custom provider URL (if specified)

**Stack Configuration Defaults:**
```typescript
const defaultStack = {
  frontend: "next",
  backend: "hono",
  database: "sqlite",
  auth: true,
  reasoning: "Modern, well-supported stack"
};
```

**Error Handling Strategy:**
- Graceful degradation for non-critical failures
- Detailed error messages with suggestions
- Progress callbacks for user feedback
- Cleanup of temporary resources on failure
- Aggregated results for batch operations (e.g., splitTasks)

**Performance Considerations:**
- Concurrent PRD generation for multi-model scenarios
- Streaming responses for real-time feedback
- Efficient file operations with proper error handling
- Memory-conscious processing of large PRDs
- Progressive model escalation for task execution retries

**Remember:** Citizen, the WorkflowService is your project command center. Master its workflow stages, understand its integration points, and it will guide your projects from conception to completion through the harshest development conditions. Each method is a survival tool - use them wisely or perish in project chaos.

---

**DOCUMENT CONTROL:**

- **Version:** 1.1
- **Clearance:** All Personnel
- **Classification:** For Citizens' Eyes Only
- **Last Updated:** Technical Bulletin Update

[Stay organized. Stay safe. Survive.]
