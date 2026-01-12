# task-o-matic-core

Core library for Task-O-Matic - AI-powered task management for TUI, web applications, and custom integrations.

## Overview

`task-o-matic-core` is the foundational library that provides all the core functionality for task management, PRD processing, AI operations, and workflow automation. It's designed to be framework-agnostic and can be integrated into any Node.js application.

## Installation

```bash
npm install task-o-matic-core
```

## Features

- 🤖 **AI-Powered Task Management**: Create, enhance, and manage tasks with AI assistance
- 📋 **PRD Processing**: Parse and refine Product Requirements Documents
- 🎯 **Workflow Automation**: Complete project lifecycle management
- 📊 **Benchmarking**: Compare AI model performance and quality
- 💾 **Local Storage**: File-based storage in `.task-o-matic/` directory
- 🌊 **Streaming Support**: Real-time AI response streaming
- 🔧 **Multi-Provider AI**: Support for OpenAI, Anthropic, OpenRouter, and custom providers
- 🎭 **Framework-Agnostic**: Use in CLI, TUI, web apps, or any Node.js project

## Quick Start

### Basic Task Management

```typescript
import { TaskService } from "task-o-matic-core";

const taskService = new TaskService();

// Create a task with AI enhancement
const result = await taskService.createTask({
  title: "Implement user authentication",
  content: "Add login and signup functionality",
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
  projectName: "my-app",
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

## Core Services

### TaskService

Manages task lifecycle including creation, enhancement, splitting, and execution.

```typescript
import { TaskService } from "task-o-matic-core";

const taskService = new TaskService();

// Create a task
const createResult = await taskService.createTask({
  title: "Add payment integration",
  content: "Integrate Stripe for payment processing",
  aiEnhance: true,
  aiOptions: {
    aiProvider: "openai",
    aiModel: "gpt-4",
    aiKey: process.env.OPENAI_API_KEY,
  },
});

// List all tasks
const tasks = await taskService.listTasks();

// Get a specific task
const task = await taskService.getTask(createResult.task.id);

// Update a task
const updated = await taskService.updateTask(createResult.task.id, {
  status: "in-progress",
});

// Split a complex task into subtasks
const splitResult = await taskService.splitTask({
  taskId: createResult.task.id,
  aiOptions: {
    aiProvider: "anthropic",
    aiModel: "claude-3-5-sonnet",
    aiKey: process.env.ANTHROPIC_API_KEY,
  },
});

// Execute a task
const executionResult = await taskService.executeTask({
  taskId: createResult.task.id,
  aiOptions: {
    aiProvider: "anthropic",
    aiModel: "claude-3-5-sonnet",
    aiKey: process.env.ANTHROPIC_API_KEY,
  },
});
```

### PRDService

Handles Product Requirements Document parsing, refinement, and question generation.

```typescript
import { PRDService } from "task-o-matic-core";

const prdService = new PRDService();

// Parse a PRD file
const parseResult = await prdService.parsePRD({
  file: "./requirements.md",
  aiOptions: {
    aiProvider: "anthropic",
    aiModel: "claude-3-5-sonnet",
    aiKey: process.env.ANTHROPIC_API_KEY,
  },
  callbacks: {
    onProgress: (event) => {
      console.log(event.message);
    },
  },
});

console.log("PRD parsed:", parseResult.prd);

// Generate questions and refine PRD with AI answering
const refineResult = await prdService.refinePRDWithQuestions({
  file: "./requirements.md",
  questionMode: "ai", // or "user" for interactive
  questionAIOptions: {
    // Optional: use a different AI for answering
    aiProvider: "openrouter",
    aiModel: "anthropic/claude-3-opus",
    aiReasoning: "enabled", // Enable reasoning for better answers
  },
  workingDirectory: process.cwd(),
  aiOptions: {
    aiProvider: "anthropic",
    aiModel: "claude-3-5-sonnet",
    aiKey: process.env.ANTHROPIC_API_KEY,
  },
  callbacks: {
    onProgress: (event) => {
      console.log(event.message);
    },
  },
});

console.log(`Refined PRD with ${refineResult.questions.length} questions`);
refineResult.questions.forEach((q, i) => {
  console.log(`Q${i + 1}: ${q}`);
  console.log(`A${i + 1}: ${refineResult.answers[q]}`);
});

// Rework PRD with feedback
const reworkResult = await prdService.reworkPRD({
  file: "./requirements.md",
  feedback: "Add more details about security requirements",
  aiOptions: {
    aiProvider: "anthropic",
    aiModel: "claude-3-5-sonnet",
    aiKey: process.env.ANTHROPIC_API_KEY,
  },
});
```

### WorkflowService

Provides complete project lifecycle management from initialization to task generation.

```typescript
import { WorkflowService } from "task-o-matic-core";

const workflowService = new WorkflowService();

// Initialize project with quick setup
const initResult = await workflowService.initializeProject({
  projectName: "my-saas-app",
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

// Define PRD from description
const prdResult = await workflowService.definePRD({
  method: "ai",
  description: "A SaaS platform for team collaboration with real-time chat, file sharing, and task management",
  aiOptions: {
    aiProvider: "anthropic",
    aiModel: "claude-3-5-sonnet",
    aiKey: process.env.ANTHROPIC_API_KEY,
  },
  callbacks: {
    onProgress: (event) => {
      console.log(event.message);
    },
  },
});

// Refine PRD with questions
const refineResult = await workflowService.refinePRD({
  questionMode: "ai",
  aiOptions: {
    aiProvider: "anthropic",
    aiModel: "claude-3-5-sonnet",
    aiKey: process.env.ANTHROPIC_API_KEY,
  },
  callbacks: {
    onProgress: (event) => {
      console.log(event.message);
    },
  },
});

// Generate tasks from PRD
const tasksResult = await workflowService.generateTasks({
  instructions: "Break down into 2-4 hour tasks",
  aiOptions: {
    aiProvider: "anthropic",
    aiModel: "claude-3-5-sonnet",
    aiKey: process.env.ANTHROPIC_API_KEY,
  },
  callbacks: {
    onProgress: (event) => {
      console.log(event.message);
    },
  },
});

// Split complex tasks
const splitResult = await workflowService.splitTasks({
  splitAll: true,
  aiOptions: {
    aiProvider: "anthropic",
    aiModel: "claude-3-5-sonnet",
    aiKey: process.env.ANTHROPIC_API_KEY,
  },
  callbacks: {
    onProgress: (event) => {
      console.log(event.message);
    },
  },
});
```

### BenchmarkService

Compare AI model performance and quality across different operations.

```typescript
import { BenchmarkService } from "task-o-matic-core";

const benchmarkService = new BenchmarkService();

// Benchmark PRD parsing
const prdBenchmark = await benchmarkService.runBenchmark({
  type: "prd-parse",
  input: {
    file: "./requirements.md",
  },
  models: [
    {
      provider: "openai",
      model: "gpt-4o",
      apiKey: process.env.OPENAI_API_KEY,
    },
    {
      provider: "anthropic",
      model: "claude-3-5-sonnet",
      apiKey: process.env.ANTHROPIC_API_KEY,
    },
  ],
  concurrency: 2,
  delay: 1000,
});

console.log("Benchmark results:", prdBenchmark.results);

// Benchmark task breakdown
const taskBenchmark = await benchmarkService.runBenchmark({
  type: "task-breakdown",
  input: {
    taskId: "task-id-here",
  },
  models: [
    {
      provider: "openai",
      model: "gpt-4o",
      apiKey: process.env.OPENAI_API_KEY,
    },
    {
      provider: "anthropic",
      model: "claude-3-5-sonnet",
      apiKey: process.env.ANTHROPIC_API_KEY,
    },
  ],
  concurrency: 2,
});
```

## Streaming Support

Stream AI responses in real-time for better user experience.

```typescript
import { TaskService } from "task-o-matic-core";

const taskService = new TaskService();

// Create task with streaming
const result = await taskService.createTask({
  title: "Add payment integration",
  aiEnhance: true,
  streamingOptions: {
    enabled: true,
    onChunk: (chunk) => {
      // Process each chunk as it arrives
      console.log(chunk);
    },
    onFinish: ({ text }) => {
      console.log("Streaming complete!");
    },
  },
  aiOptions: {
    aiProvider: "anthropic",
    aiModel: "claude-3-5-sonnet",
    aiKey: process.env.ANTHROPIC_API_KEY,
  },
});
```

## TUI Integration Example

```typescript
import { TaskService } from "task-o-matic-core";
import type { ProgressCallback } from "task-o-matic-core";

const taskService = new TaskService();

// Progress callback for TUI updates
const progressCallback: ProgressCallback = {
  onProgress: (event) => {
    // Update your TUI with progress
    tuiStatusBar.update(event.message);
  },
};

// Create task with streaming
const result = await taskService.createTask({
  title: "Add payment integration",
  aiEnhance: true,
  streamingOptions: {
    enabled: true,
    onChunk: (chunk) => {
      // Update TUI in real-time
      tuiTextArea.append(chunk);
    },
    onFinish: ({ text }) => {
      tuiStatusBar.success("Task enhanced!");
    },
  },
  callbacks: progressCallback,
});
```

## Utility Functions

Access core utilities directly:

```typescript
import {
  getStorage,
  getAIOperations,
  buildAIConfig,
  configManager,
} from "task-o-matic-core";

// Get singleton instances
const storage = getStorage();
const aiOps = getAIOperations();

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
```

## TypeScript Types

Full TypeScript type definitions are included:

```typescript
import type {
  Task,
  AIConfig,
  StreamingOptions,
  CreateTaskOptions,
  PRDParseResult,
  TaskAIMetadata,
  // Workflow types
  WorkflowService,
  InitializeResult,
  DefinePRDResult,
  RefinePRDResult,
  GenerateTasksResult,
  SplitTasksResult,
  // Benchmark types
  BenchmarkService,
  BenchmarkConfig,
  BenchmarkResult,
  // Callback types
  ProgressCallback,
  StorageCallbacks,
} from "task-o-matic-core";
```

## AI Providers

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

// OpenRouter
const openrouterConfig = buildAIConfig({
  provider: "openrouter",
  model: "anthropic/claude-3.5-sonnet",
  apiKey: process.env.OPENROUTER_API_KEY,
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

- **PRD Parsing**: `claude-3.5-sonnet` or `gpt-4`
- **Task Enhancement**: `claude-3-haiku` or `gpt-3.5-turbo`
- **Task Breakdown**: `claude-3.5-sonnet` for complex tasks
- **Workflow Testing**: Use benchmarking to find optimal performance

## Storage Structure

All data is stored locally in the `.task-o-matic/` directory:

```
your-project/
├── .task-o-matic/
│   ├── config.json          # AI configuration
│   ├── bts-config.json      # Better-T-Stack configuration (if bootstrapped)
│   ├── tasks/              # Task JSON files
│   │   ├── {task-id}.json
│   │   └── ...
│   ├── prd/                # PRD versions and logs
│   │   ├── parsed-prd.json
│   │   └── ...
│   └── logs/               # Operation logs
│       └── ...
└── your-project-files...
```

## Error Handling

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
  } else {
    console.error(`Unexpected error:`, error);
  }
}
```

## Hooks System

Register hooks to customize behavior:

```typescript
import { registerLoggerHooks } from "task-o-matic-core";

// Register logger hooks
registerLoggerHooks({
  onLog: (level, message) => {
    console.log(`[${level}] ${message}`);
  },
  onError: (error) => {
    console.error(`Error:`, error);
  },
});
```

## Development

### Building from Source

```bash
# Clone and install
git clone https://github.com/DimitriGilbert/task-o-matic.git
cd task-o-matic
npm install

# Build the core package
cd packages/core
npm run build

# Type checking
npm run check-types

# Run tests
npm run test
```

### Testing

```bash
# Run all tests
npm test

# Run specific test file
npm test -- --grep "TaskService"
```

## Documentation

For more detailed documentation, see:

- [Configuration](../../docs/configuration.md) - AI providers and settings
- [Task Management](../../docs/tasks.md) - Full task lifecycle with AI features
- [PRD Processing](../../docs/prd.md) - Parse and rework Product Requirements Documents
- [Interactive Workflow](../../docs/workflow-command.md) - Guided setup with AI assistance
- [AI Integration](../../docs/ai-integration.md) - AI providers and prompt engineering
- [Project Initialization](../../docs/projects.md) - Project setup and bootstrapping
- [Streaming Output](../../docs/streaming.md) - Real-time AI streaming capabilities
- [Model Benchmarking](../../docs/benchmarking.md) - Compare AI models and workflow performance

## License

MIT License - see LICENSE file for details.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

---

**Built with ❤️ using Vercel AI SDK and modern TypeScript**
