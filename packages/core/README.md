# ⛑️ task-o-matic-core

**The infrastructure foundation for your survival toolkit**

---

## ⚠️ ENGINEERING BULLETIN

_Engineers, the core library is the backbone of our entire operation. It's not just a package—it's the foundation upon which we build bunkers, manage supplies, and deploy AI assistance in this post-apocalyptic development landscape._

_Think of `task-o-matic-core` as your blueprint for building custom command interfaces, TUI applications, web dashboards, or any other tool you need to manage projects. All the power, none of the CLI wrapper._

_[The preceding message was brought to you by the Department of Engineering Standards. Remember: Clean architecture is survival architecture.]_

---

## 📦 OVERVIEW

`task-o-matic-core` is the foundational library providing all core functionality for task management, PRD processing, AI operations, and workflow automation. It's framework-agnostic and can be integrated into any Node.js application.

**Key Features:**
- 🤖 **AI-Powered Task Management**: Create, enhance, split, and manage tasks with AI
- 📋 **PRD Processing**: Parse, refine, version, and rework Product Requirements Documents
- 🎯 **Workflow Automation**: Complete project lifecycle orchestration
- 📊 **Benchmark System**: Compare AI model performance across operations
- 💾 **Local Storage**: File-based persistence in `.task-o-matic/` directory
- 🌊 **Streaming Support**: Real-time AI response streaming
- 🔧 **Multi-Provider AI**: OpenAI, Anthropic, OpenRouter, custom endpoints
- 📚 **Context7 Integration**: Up-to-date library documentation fetching
- 🎭 **Framework-Agnostic**: Use in CLI, TUI, web apps, or custom tools

---

## 📦 INSTALLATION

```bash
npm install task-o-matic-core
```

```bash
bun add task-o-matic-core
```

```bash
pnpm add task-o-matic-core
```

---

## 🚀 QUICK START: ENGINEERING MODE

### Basic Task Management

```typescript
import { TaskService } from "task-o-matic-core";

const taskService = new TaskService();

// Create task with AI enhancement
const result = await taskService.createTask({
  title: "Install water filtration system",
  content: "Implement water purification for bunker section B",
  aiEnhance: true,
  aiOptions: {
    aiProvider: "anthropic",
    aiModel: "claude-3-5-sonnet",
    aiKey: process.env.ANTHROPIC_API_KEY,
  },
  callbacks: {
    onProgress: (event) => {
      console.log(`Progress: ${event.message}`);
    },
  },
});

console.log("Task created:", result.task);
```

### Complete Workflow Setup

```typescript
import { WorkflowService } from "task-o-matic-core";

const workflowService = new WorkflowService();

const result = await workflowService.initializeProject({
  projectName: "vault-manager",
  initMethod: "quick",
  bootstrap: true,
  aiOptions: {
    aiProvider: "anthropic",
    aiModel: "claude-3-5-sonnet",
    aiKey: process.env.ANTHROPIC_API_KEY,
  },
  callbacks: {
    onProgress: (event) => {
      console.log(`Progress: ${event.message}`);
    },
  },
});

console.log("Project initialized:", result.projectName);
```

---

## 🏗️ CORE SERVICES

### TaskService

Manages task lifecycle including creation, enhancement, splitting, planning, and execution.

#### Constructor

```typescript
const taskService = new TaskService();
```

#### Core CRUD Operations

**createTask**

```typescript
const result = await taskService.createTask({
  title: "Add emergency alert system",
  content: "Implement real-time emergency notifications",
  parentId: "task-123",  // Optional: parent task ID
  effort: "4h",           // Optional: effort estimate
  aiEnhance: true,        // Enable AI enhancement
  aiOptions: {
    aiProvider: "anthropic",
    aiModel: "claude-3-5-sonnet",
    aiKey: process.env.ANTHROPIC_API_KEY,
  },
  streamingOptions: {
    enabled: true,
    onChunk: (chunk) => console.log(chunk),
    onFinish: ({ text }) => console.log("Enhanced:", text),
  },
  callbacks: {
    onProgress: (event) => console.log(event.message),
  },
});
```

**listTasks**

```typescript
// Get all tasks
const tasks = await taskService.listTasks();

// Filter by status
const todoTasks = await taskService.listTasks({ status: "todo" });

// Filter by tag
const criticalTasks = await taskService.listTasks({ tag: "critical" });
```

**getTask**

```typescript
const task = await taskService.getTask("task-id-here");
console.log(task.title, task.status);
```

**getTaskContent**

```typescript
const content = await taskService.getTaskContent("task-id-here");
// Returns task content as string (for large tasks stored separately)
```

**getTaskAIMetadata**

```typescript
const metadata = await taskService.getTaskAIMetadata("task-id-here");
// Returns AI metadata: who enhanced, when, with which model
```

**updateTask**

```typescript
const updated = await taskService.updateTask("task-id-here", {
  title: "New title",
  description: "New description",
  status: "in-progress",
  effort: "8h",
  tags: ["critical", "security"],
});
```

**setTaskStatus**

```typescript
await taskService.setTaskStatus("task-id-here", "completed");
```

**deleteTask**

```typescript
await taskService.deleteTask("task-id-here", {
  cascade: true,   // Delete all subtasks
  force: false,    // Require confirmation (in TUI context)
});
```

#### Tag Operations

**addTags**

```typescript
await taskService.addTags("task-id-here", ["urgent", "security"]);
```

**removeTags**

```typescript
await taskService.removeTags("task-id-here", ["deprecated"]);
```

#### Task Navigation

**getNextTask**

```typescript
const nextTask = await taskService.getNextTask({
  status: "todo",
  tag: "critical",
  effort: "2-4h",  // Filter by effort range
  priority: "effort", // Sort by: newest, oldest, effort
});
```

**getTaskTree**

```typescript
// Get full task tree
const fullTree = await taskService.getTaskTree();

// Get subtree starting from specific task
const subtree = await taskService.getTaskTree("task-id-here");
```

**getSubtasks**

```typescript
const subtasks = await taskService.getSubtasks("task-id-here");
```

#### AI Operations

**enhanceTask**

```typescript
const result = await taskService.enhanceTask("task-id-here", {
  aiOptions: {
    aiProvider: "anthropic",
    aiModel: "claude-3-5-sonnet",
    aiKey: process.env.ANTHROPIC_API_KEY,
    reasoning: 5000, // Enable reasoning tokens
  },
  streamingOptions: {
    enabled: true,
    onChunk: (chunk) => tuiTextArea.append(chunk),
    onFinish: ({ text }) => tuiStatusBar.success("Enhanced!"),
  },
});
```

**splitTask**

```typescript
const result = await taskService.splitTask("task-id-here", {
  aiOptions: {
    aiProvider: "anthropic",
    aiModel: "claude-3-5-sonnet",
    aiKey: process.env.ANTHROPIC_API_KEY,
    models: [ // Multi-AI splitting
      { provider: "anthropic", model: "claude-3.5-sonnet" },
      { provider: "openai", model: "gpt-4o" },
    ],
    combineAI: { provider: "anthropic", model: "claude-3.5-sonnet" },
  },
  promptOverride: "Split into 2-4 hour tasks",
  messageOverride: "Focus on security aspects",
  streamingOptions: { enabled: true },
  enableFilesystemTools: true, // Enable AI to read project files
});
```

**documentTask**

```typescript
const result = await taskService.documentTask("task-id-here", {
  force: false, // Skip if recent documentation exists
  aiOptions: {
    aiProvider: "anthropic",
    aiModel: "claude-3-5-sonnet",
    aiKey: process.env.ANTHROPIC_API_KEY,
  },
  streamingOptions: { enabled: true },
});
```

**planTask**

```typescript
const result = await taskService.planTask("task-id-here", {
  aiOptions: {
    aiProvider: "anthropic",
    aiModel: "claude-3-5-sonnet",
    aiKey: process.env.ANTHROPIC_API_KEY,
  },
  streamingOptions: { enabled: true },
});
```

#### Documentation Operations

**getTaskDocumentation**

```typescript
const docs = await taskService.getTaskDocumentation("task-id-here");
```

**addTaskDocumentationFromFile**

```typescript
await taskService.addTaskDocumentationFromFile("task-id-here", "./docs/api.md");
```

**setTaskPlan**

```typescript
// Set from text
await taskService.setTaskPlan("task-id-here", {
  planText: "Step 1: Setup\nStep 2: Implement\nStep 3: Test",
});

// Set from file
await taskService.setTaskPlan("task-id-here", {
  planFilePath: "./plans/implementation.md",
});
```

#### Plan Operations

**getTaskPlan**

```typescript
const plan = await taskService.getTaskPlan("task-id-here");
```

**listTaskPlans**

```typescript
const plans = await taskService.listTaskPlans();
```

**deleteTaskPlan**

```typescript
await taskService.deleteTaskPlan("task-id-here");
```

---

### PRDService

Handles Product Requirements Document parsing, refinement, question generation, and versioning.

#### Constructor

```typescript
const prdService = new PRDService();
```

#### PRD Operations

**parsePRD**

```typescript
const result = await prdService.parsePRD({
  file: "./requirements.md",
  workingDirectory: process.cwd(),
  enableFilesystemTools: true,
  aiOptions: {
    aiProvider: "anthropic",
    aiModel: "claude-3-5-sonnet",
    aiKey: process.env.ANTHROPIC_API_KEY,
    models: [ // Multi-AI parsing
      { provider: "anthropic", model: "claude-3.5-sonnet" },
      { provider: "openai", model: "gpt-4o" },
    ],
    combineAI: { provider: "anthropic", model: "claude-3.5-sonnet" },
  },
  promptOverride: "Focus on security features",
  messageOverride: "Include emergency protocols",
  streamingOptions: { enabled: true },
  callbacks: {
    onProgress: (event) => console.log(event.message),
  },
});

console.log("PRD parsed:", result.prd);
console.log("Tasks generated:", result.tasks);
```

**generateQuestions**

```typescript
const result = await prdService.generateQuestions({
  file: "./requirements.md",
  workingDirectory: process.cwd(),
  enableFilesystemTools: true,
  aiOptions: {
    aiProvider: "anthropic",
    aiModel: "claude-3-5-sonnet",
    aiKey: process.env.ANTHROPIC_API_KEY,
  },
  streamingOptions: { enabled: true },
  callbacks: {
    onProgress: (event) => console.log(event.message),
  },
});

console.log("Questions:", result.questions);
```

**reworkPRD**

```typescript
const result = await prdService.reworkPRD({
  file: "./requirements.md",
  feedback: "Add more details about security requirements and emergency procedures",
  output: "./reworked-requirements.md",
  workingDirectory: process.cwd(),
  enableFilesystemTools: true,
  aiOptions: {
    aiProvider: "anthropic",
    aiModel: "claude-3-5-sonnet",
    aiKey: process.env.ANTHROPIC_API_KEY,
  },
  streamingOptions: { enabled: true },
  callbacks: {
    onProgress: (event) => console.log(event.message),
  },
});
```

**refinePRDWithQuestions**

```typescript
const result = await prdService.refinePRDWithQuestions({
  file: "./requirements.md",
  questionMode: "ai", // or "user" for interactive
  answers: { // Only for user mode
    "q1": "Answer to question 1",
    "q2": "Answer to question 2",
  },
  questionAIOptions: { // Only for AI mode
    aiProvider: "openrouter",
    aiModel: "anthropic/claude-3-opus",
    aiReasoning: "enabled", // Enable reasoning for better answers
    aiKey: process.env.OPENROUTER_API_KEY,
  },
  workingDirectory: process.cwd(),
  aiOptions: {
    aiProvider: "anthropic",
    aiModel: "claude-3-5-sonnet",
    aiKey: process.env.ANTHROPIC_API_KEY,
  },
  streamingOptions: { enabled: true },
  callbacks: {
    onProgress: (event) => console.log(event.message),
  },
});

console.log(`Refined PRD with ${result.questions.length} questions`);
```

**generatePRD**

```typescript
const result = await prdService.generatePRD({
  description: "Build a vault management system for tracking supplies, residents, and security",
  outputDir: "./prds",
  filename: "vault-manager-prd.md",
  aiOptions: {
    aiProvider: "anthropic",
    aiModel: "claude-3-5-sonnet",
    aiKey: process.env.ANTHROPIC_API_KEY,
  },
  streamingOptions: { enabled: true },
  callbacks: {
    onProgress: (event) => console.log(event.message),
  },
});
```

**combinePRDs**

```typescript
const result = await prdService.combinePRDs({
  prds: ["./prds/prd1.md", "./prds/prd2.md"],
  originalDescription: "Original vault manager description",
  outputDir: "./prds",
  filename: "combined-prd.md",
  aiOptions: {
    aiProvider: "anthropic",
    aiModel: "claude-3-5-sonnet",
    aiKey: process.env.ANTHROPIC_API_KEY,
  },
  streamingOptions: { enabled: true },
  callbacks: {
    onProgress: (event) => console.log(event.message),
  },
});
```

**suggestStack**

```typescript
const result = await prdService.suggestStack({
  file: "./requirements.md",
  // or
  content: "Vault management system with real-time tracking",
  projectName: "vault-manager",
  output: "./stack-suggestion.json",
  workingDirectory: process.cwd(),
  save: true, // Save to .task-o-matic/stack.json
  aiOptions: {
    aiProvider: "anthropic",
    aiModel: "claude-3-5-sonnet",
    aiKey: process.env.ANTHROPIC_API_KEY,
  },
  streamingOptions: { enabled: true },
  callbacks: {
    onProgress: (event) => console.log(event.message),
  },
});

console.log("Suggested stack:", result.stack);
```

**generateFromCodebase**

```typescript
const result = await prdService.generateFromCodebase({
  workingDirectory: process.cwd(),
  outputFile: "./generated-prd.md",
  enableFilesystemTools: true,
  aiOptions: {
    aiProvider: "anthropic",
    aiModel: "claude-3-5-sonnet",
    aiKey: process.env.ANTHROPIC_API_KEY,
  },
  streamingOptions: { enabled: true },
  callbacks: {
    onProgress: (event) => console.log(event.message),
  },
});

console.log("Generated PRD from codebase:", result.prd);
```

#### PRD Versioning

**createVersion**

```typescript
const result = await prdService.createVersion({
  file: "./requirements.md",
  message: "Added emergency response section",
  changes: [
    { type: "add", section: "Emergency Protocols" },
    { type: "modify", section: "Security", description: "Added biometric auth" },
  ],
  implementedTasks: ["task-123", "task-456"],
  workingDirectory: process.cwd(),
});

console.log("Version created:", result.version);
```

**getHistory**

```typescript
const history = await prdService.getHistory({
  file: "./requirements.md",
  workingDirectory: process.cwd(),
});

history.versions.forEach((version) => {
  console.log(`Version ${version.number}: ${version.message}`);
  console.log(`Created: ${new Date(version.timestamp).toISOString()}`);
  console.log(`Changes: ${version.changes.length}`);
});
```

---

### WorkflowService

Provides complete project lifecycle management from initialization to task generation and execution.

#### Constructor

```typescript
const workflowService = new WorkflowService();
```

#### Workflow Methods

**initializeProject**

```typescript
const result = await workflowService.initializeProject({
  projectName: "vault-manager",
  projectDir: process.cwd(),
  initMethod: "ai", // "quick", "custom", or "ai"
  projectDescription: "Comprehensive vault management system",
  stackConfig: {
    frontend: "next",
    backend: "hono",
    database: "postgres",
    auth: true,
  },
  bootstrap: true,
  includeDocs: true,
  aiOptions: {
    aiProvider: "anthropic",
    aiModel: "claude-3-5-sonnet",
    aiKey: process.env.ANTHROPIC_API_KEY,
  },
  streamingOptions: { enabled: true },
  callbacks: {
    onProgress: (event) => console.log(`Progress: ${event.message}`),
  },
});

console.log("Project initialized:", result.projectName);
console.log("PRD created:", result.prdPath);
```

**definePRD**

```typescript
const result = await workflowService.definePRD({
  method: "ai", // "upload", "manual", "ai", or "skip"
  prdDescription: "Vault management system with real-time tracking",
  projectDir: process.cwd(),
  multiGeneration: true,
  multiGenerationModels: [
    { provider: "anthropic", model: "claude-3.5-sonnet" },
    { provider: "openai", model: "gpt-4o" },
  ],
  combineAI: { provider: "anthropic", model: "claude-3.5-sonnet" },
  aiOptions: {
    aiProvider: "anthropic",
    aiModel: "claude-3-5-sonnet",
    aiKey: process.env.ANTHROPIC_API_KEY,
  },
  streamingOptions: { enabled: true },
  callbacks: {
    onProgress: (event) => console.log(event.message),
  },
});

console.log("PRD defined:", result.prdPath);
```

**refinePRD**

```typescript
const result = await workflowService.refinePRD({
  method: "ai", // "manual", "ai", or "skip"
  prdFile: "./requirements.md",
  feedback: "Add more security protocols and emergency procedures",
  projectDir: process.cwd(),
  aiOptions: {
    aiProvider: "anthropic",
    aiModel: "claude-3-5-sonnet",
    aiKey: process.env.ANTHROPIC_API_KEY,
  },
  streamingOptions: { enabled: true },
  callbacks: {
    onProgress: (event) => console.log(event.message),
  },
});

console.log("PRD refined:", result.prdPath);
```

**generateTasks**

```typescript
const result = await workflowService.generateTasks({
  prdFile: "./requirements.md",
  method: "standard", // "standard" or "ai"
  customInstructions: "Break down into 2-4 hour tasks focused on MVP",
  projectDir: process.cwd(),
  aiOptions: {
    aiProvider: "anthropic",
    aiModel: "claude-3-5-sonnet",
    aiKey: process.env.ANTHROPIC_API_KEY,
  },
  streamingOptions: { enabled: true },
  callbacks: {
    onProgress: (event) => console.log(event.message),
  },
});

console.log(`Generated ${result.tasks.length} tasks`);
```

**splitTasks**

```typescript
const result = await workflowService.splitTasks({
  taskIds: ["task-1", "task-2", "task-3"],
  splitMethod: "custom", // "interactive", "standard", or "custom"
  customInstructions: "Split into 2-4 hour chunks",
  aiOptions: {
    aiProvider: "anthropic",
    aiModel: "claude-3-5-sonnet",
    aiKey: process.env.ANTHROPIC_API_KEY,
  },
  streamingOptions: { enabled: true },
  callbacks: {
    onProgress: (event) => console.log(event.message),
  },
});

console.log(`Split ${result.splits} tasks`);
```

**continueProject**

```typescript
const result = await workflowService.continueProject({
  projectDir: process.cwd(),
  action: "update-prd", // ContinueAction options
  aiOptions: {
    aiProvider: "anthropic",
    aiModel: "claude-3-5-sonnet",
    aiKey: process.env.ANTHROPIC_API_KEY,
  },
  streamingOptions: { enabled: true },
  callbacks: {
    onProgress: (event) => console.log(event.message),
  },
});

console.log("Project continued:", result.status);
```

**executeTasks**

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
    onProgress: (event) => console.log(event.message),
  },
});

console.log(`Executed ${result.completed} tasks successfully`);
```

---

### BenchmarkOrchestrator

Compare AI model performance using parallel git worktrees.

#### Constructor

```typescript
const benchmark = new BenchmarkOrchestrator();
```

#### Run Benchmark

```typescript
const run = await benchmark.run(
  "operation", // type: execution, execute-loop, operation, workflow
  {
    operationId: "prd-parse",
    params: { file: "./requirements.md" }
  },
  {
    models: [
      { provider: "openai", model: "gpt-4o" },
      { provider: "anthropic", model: "claude-3-5-sonnet" }
    ],
    concurrency: 2,
    keepWorktrees: true
  },
  (event) => {
    console.log(`[${event.modelId}] ${event.type}: ${event.message || ""}`);
  }
);

console.log("Run ID:", run.id);
console.log("Results:", run.results);
```

#### Management Methods

**listRuns**

```typescript
const runs = await benchmark.listRuns({ limit: 10 });
```

**getRun**

```typescript
const run = await benchmark.getRun("run-id-123");
```

**listWorktrees**

```typescript
const worktrees = await benchmark.listWorktrees();
```

**cleanupRun**

```typescript
await benchmark.cleanupRun("run-id-123");
```

---

## 🌊 STREAMING SUPPORT

Stream AI responses in real-time for better user experience.

### Basic Streaming

```typescript
import { TaskService } from "task-o-matic-core";

const taskService = new TaskService();

const result = await taskService.createTask({
  title: "Add emergency alert system",
  aiEnhance: true,
  streamingOptions: {
    enabled: true,
    onChunk: (chunk) => {
      console.log("Streaming:", chunk);
    },
    onReasoning: (text) => {
      console.log("AI thinking:", text); // For OpenRouter reasoning models
    },
    onFinish: ({ text }) => {
      console.log("Streaming complete:", text.length, "characters");
    },
  },
  aiOptions: {
    aiProvider: "anthropic",
    aiModel: "claude-3-5-sonnet",
    aiKey: process.env.ANTHROPIC_API_KEY,
  },
});
```

### TUI Integration Example

```typescript
import { TaskService } from "task-o-matic-core";

const taskService = new TaskService();

// Progress callback for TUI updates
const callbacks = {
  onProgress: (event) => {
    tuiStatusBar.update(event.message);
  },
};

// Create task with streaming
const result = await taskService.createTask({
  title: "Implement biometric authentication",
  aiEnhance: true,
  streamingOptions: {
    enabled: true,
    onChunk: (chunk) => {
      // Update TUI in real-time
      tuiTextArea.append(chunk);
      tuiLayout.render();
    },
    onReasoning: (text) => {
      tuiStatusBar.update(`AI thinking: ${text.substring(0, 50)}...`);
    },
    onFinish: ({ text }) => {
      tuiStatusBar.success("Task enhanced successfully!");
      tuiLayout.render();
    },
  },
  callbacks,
});
```

---

## 📚 CONTEXT7 INTEGRATION

Access up-to-date library documentation automatically.

```typescript
import { TaskService } from "task-o-matic-core";

const taskService = new TaskService();

// Task enhancement will fetch relevant docs
const result = await taskService.enhanceTask("task-id-here", {
  aiOptions: {
    aiProvider: "anthropic",
    aiModel: "claude-3-5-sonnet",
    aiKey: process.env.ANTHROPIC_API_KEY,
  },
  // Context7 will automatically fetch docs for libraries in your stack
});

// Documentation is cached in .task-o-matic/docs/{library-name}/
// Subsequent calls use cached docs for performance
```

---

## 🔧 UTILITY FUNCTIONS

Access core utilities directly:

```typescript
import {
  getStorage,
  getAIOperations,
  getModelProvider,
  getContextBuilder,
  buildAIConfig,
  configManager,
  logger,
} from "task-o-matic-core";

// Get singleton instances
const storage = getStorage();
const aiOps = getAIOperations();
const modelProvider = getModelProvider();
const contextBuilder = getContextBuilder();

// Build AI configuration
const aiConfig = buildAIConfig({
  provider: "openai",
  model: "gpt-4",
  apiKey: process.env.OPENAI_API_KEY,
});

// Use storage directly
const allTasks = await storage.getAllTasks();

// Use config manager
await configManager.load();
const aiProvider = configManager.getAIProvider();

// Use logger
logger.info("Starting project initialization");
logger.error("Failed to parse PRD", { error });
```

---

## 📝 TYPESCRIPT TYPES

Full TypeScript type definitions are included:

```typescript
import type {
  // Core Types
  Task,
  CreateTaskOptions,
  CreateTaskResult,
  EnhanceTaskResult,
  SplitTaskResult,
  PlanTaskResult,
  DocumentTaskResult,
  DeleteTaskResult,
  TaskListResponse,
  TaskAIMetadata,
  TaskDocumentation,

  // AI Types
  AIConfig,
  AIOptions,
  StreamingOptions,
  StreamingCallbacks,
  ProviderConfig,
  AIServiceResponse,

  // PRD Types
  PRDParseResult,
  PRDFromCodebaseResult,
  SuggestStackResult,
  PRDChange,
  PRDVersion,
  PRDVersionData,

  // Workflow Types
  InitializeResult,
  DefinePRDResult,
  RefinePRDResult,
  GenerateTasksResult,
  SplitTasksResult,
  ContinueResult,
  WorkflowOptions,
  ContinueAction,

  // Benchmark Types
  BenchmarkOrchestrator,
  BenchmarkConfig,
  BenchmarkResult,
  BenchmarkRun,
  BenchmarkProgressEvent,

  // Execution Types
  ExecuteTaskOptions,
  ExecutionResult,
  ExecuteLoopOptions,
  ExecuteLoopResult,
  ExecuteLoopConfig,
  TaskExecutionResult,

  // Callback Types
  ProgressCallback,
  StorageCallbacks,

  // Project Analysis Types
  ProjectAnalysis,
  ProjectAnalysisOptions,
  ProjectAnalysisResult,
  DetectedStack,
  ProjectStructure,

  // Error Types
  TaskOMaticError,

  // Services
  TaskService,
  WorkflowService,
  PRDService,
  BenchmarkOrchestrator,
} from "task-o-matic-core";
```

---

## 🤖 AI PROVIDERS

### Supported Providers

- **OpenAI**: GPT models with full feature support
- **Anthropic**: Claude models with enhanced reasoning
- **OpenRouter**: Access to multiple models through one API
- **Custom**: Any OpenAI-compatible API endpoint

### AI Configuration

```typescript
import { buildAIConfig } from "task-o-matic-core";

// OpenAI
const openaiConfig = buildAIConfig({
  provider: "openai",
  model: "gpt-4",
  apiKey: process.env.OPENAI_API_KEY,
});

// Anthropic
const anthropicConfig = buildAIConfig({
  provider: "anthropic",
  model: "claude-3-5-sonnet",
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// OpenRouter with reasoning
const openrouterConfig = buildAIConfig({
  provider: "openrouter",
  model: "anthropic/claude-3.5-sonnet",
  apiKey: process.env.OPENROUTER_API_KEY,
  reasoning: 5000, // Enable extended reasoning
});

// Custom provider
const customConfig = buildAIConfig({
  provider: "custom",
  model: "custom-model",
  apiKey: process.env.CUSTOM_API_KEY,
  baseUrl: "https://api.custom.com/v1",
});
```

### Model Recommendations

Based on extensive field testing:

- **PRD Parsing**: `anthropic:claude-3.5-sonnet` or `openai:gpt-4o`
- **Task Enhancement**: `openai:gpt-4o-mini` or `anthropic:claude-3-haiku`
- **Task Breakdown**: `anthropic:claude-3.5-sonnet`
- **Workflow Testing**: Use benchmarking. Let the data decide.

### Multi-AI Operations

Let multiple AI models work together for superior results:

```typescript
const result = await taskService.splitTask("task-id-here", {
  aiOptions: {
    models: [
      { provider: "anthropic", model: "claude-3.5-sonnet", aiKey: key1 },
      { provider: "openai", model: "gpt-4o", aiKey: key2 },
    ],
    combineAI: {
      provider: "anthropic",
      model: "claude-3.5-sonnet",
      aiKey: key1,
    },
  },
});

// Multiple models approach the problem from different angles
// The combineAI model synthesizes the best results
```

---

## 💾 STORAGE STRUCTURE

All data is stored locally in the `.task-o-matic/` directory:

```
your-project/
├── .task-o-matic/
│   ├── config.json              # AI configuration
│   ├── stack.json              # Detected technology stack (cached)
│   ├── bts-config.json         # Better-T-Stack configuration
│   ├── mcp.json               # Context7/MCP configuration
│   ├── tasks.json             # Main tasks database
│   ├── ai-metadata.json       # AI metadata for all tasks
│   │
│   ├── tasks/                # Task content files
│   │   ├── {task-id}.md
│   │   └── enhanced/
│   │       └── {task-id}.md
│   │
│   ├── plans/                # Implementation plans
│   │   └── {task-id}.json
│   │
│   ├── docs/                 # Documentation
│   │   ├── tasks/           # Task-specific documentation
│   │   └── {library-name}/  # Context7 library docs (cached)
│   │
│   ├── prd/                 # PRD versions and logs
│   │   ├── versions/        # PRD versioning history
│   │   │   ├── v1.json
│   │   │   ├── v2.json
│   │   │   └── ...
│   │   ├── parsed-prd.json
│   │   └── (user prd files)
│   │
│   └── logs/                # Operation logs
└── your-project-files...
```

**Key notes:**
- Tasks with content >200 characters are stored as separate files
- AI metadata tracks who enhanced what, when, and with which model
- PRD versioning lets you track evolution over time
- Documentation from Context7 is cached to avoid repeated API calls

---

## ⚠️ ERROR HANDLING

```typescript
import { TaskService, TaskOMaticError } from "task-o-matic-core";

const taskService = new TaskService();

try {
  const result = await taskService.createTask({
    title: "New task",
    aiEnhance: true,
    aiOptions: {
      aiProvider: "anthropic",
      aiModel: "claude-3-5-sonnet",
      aiKey: process.env.ANTHROPIC_API_KEY,
    },
  });
} catch (error) {
  if (error instanceof TaskOMaticError) {
    console.error(`TaskOMatic Error: ${error.message}`);
    console.error(`Code: ${error.code}`);
    console.error(`Details:`, error.details);
    console.error(`Suggestions:`, error.suggestions);
  } else {
    console.error(`Unexpected error:`, error);
  }
}
```

### Standard Error Helpers

```typescript
import {
  isTaskOMaticError,
  formatTaskNotFoundError,
  formatInvalidStatusTransitionError,
  formatStorageError,
  formatAIOperationError,
} from "task-o-matic-core";

// Check if error is TaskOMaticError
if (isTaskOMaticError(error)) {
  // Handle accordingly
}

// Create standard errors
throw formatTaskNotFoundError("task-id-here");

throw formatInvalidStatusTransitionError("todo", "completed");

throw formatStorageError("getAllTasks", new Error("File not found"));

throw formatAIOperationError("enhanceTask", new Error("API timeout"));
```

---

## 🪝 HOOKS SYSTEM

Register hooks to customize behavior:

```typescript
import { hooks, registerLoggerHooks } from "task-o-matic-core";

// Register logger hooks
hooks.onLog = (level, message) => {
  console.log(`[${level}] ${message}`);
};

hooks.onError = (error) => {
  console.error(`Error:`, error);
  // Send to external monitoring
  externalMonitoring.logError(error);
};

hooks.onProgress = (event) => {
  // Update your UI
  ui.updateProgress(event.message);
};
```

---

## 🧪 TESTING

The core library provides test utilities:

```typescript
import {
  resetServiceInstances,
  injectTestInstances,
} from "task-o-matic-core";

// Reset all singleton instances (useful for tests)
resetServiceInstances();

// Inject mock instances for testing
injectTestInstances({
  storage: mockStorage,
  aiOperations: mockAIOperations,
});
```

---

## 🛠️ DEVELOPMENT

### Building from Source

```bash
# Clone repository
git clone https://github.com/DimitriGilbert/task-o-matic.git
cd task-o-matic

# Install dependencies
bun install

# Build core package
cd packages/core
bun run build

# Type checking
bun run check-types

# Run tests
bun run test
```

### Running Specific Tests

```bash
# From project root
cd packages/core
npx mocha -r tsx/cjs src/test/test-setup.ts src/test/path/to/your.test.ts

# Run specific test file
bun run test -- --grep "TaskService"
```

---

## 📚 FURTHER READING: ENGINEERING MANUALS

For detailed documentation:

- [Configuration Guide](../../docs/configuration.md)
- [Task Management Guide](../../docs/tasks.md)
- [PRD Processing Guide](../../docs/prd.md)
- [Workflow Command Guide](../../docs/workflow-command.md)
- [AI Integration Guide](../../docs/ai-integration.md)
- [Project Initialization Guide](../../docs/projects.md)
- [Streaming Output Guide](../../docs/streaming.md)
- [Model Benchmarking Guide](../../docs/FO/benchmark/overview.md)
- [CLI Command Reference](../cli/README.md)

---

## 🏁 FINAL REMINDER

**Remember:** Clean architecture is survival architecture. The core library is your blueprint—build whatever interface you need on top of it.

You now have everything you need to integrate task management into your custom applications. Build well, engineer.

[Stay modular. Stay clean. Survive.]

---

**DOCUMENT CONTROL:**
- **Version:** 1.0
- **Clearance:** Engineering Personnel
- **Classification:** For Builders' Eyes Only
