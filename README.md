# 🚀 task-o-matic

AI-powered task management for CLI, TUI, and web applications. Parse PRDs, enhance tasks with AI, and integrate task management into your applications using local file storage only. No backend connectivity required.

## ✨ Features

- 🤖 **AI-Powered**: Parse PRDs and enhance tasks using multiple AI providers
- 🎭 **Interactive Workflow**: Guided setup from project init to task generation with AI assistance
- 📦 **Multi-Purpose Package**: Use as CLI tool, library, or MCP server
- 📁 **Project-Local Storage**: All data stored locally in `.task-o-matic/` directory
- 🎯 **Task Management**: Full CRUD operations with AI enhancement
- 📋 **PRD Processing**: Convert Product Requirements Documents into actionable tasks
- 🏗️ **Project Bootstrapping**: Better-T-Stack integration for new projects
- 🔧 **Multi-Provider AI**: Support for OpenAI, Anthropic, OpenRouter, and custom providers
- 📊 **Smart Breakdown**: AI-powered task decomposition into subtasks
- 🌊 **Real-time Streaming**: Watch AI responses generate live with streaming output
- 📊 **Model Benchmarking**: Compare performance and quality across different AI models
- 🏠 **Single-Project Focus**: Self-contained within each project directory
- 💻 **Framework-Agnostic**: Easily integrate into TUI, web apps, or any Node.js project

## 📦 Installation

### As a CLI Tool

```bash
# Install globally
npm install -g task-o-matic

# Or use with npx
npx task-o-matic init
```

### As a Library (for TUI/Web Apps)

```bash
# Install in your project
npm install task-o-matic
```

### For Development

```bash
# Clone and install dependencies
git clone https://github.com/DimitriGilbert/task-o-matic.git
cd task-o-matic
npm install
npm run build
```

## 🏗️ Architecture & Mindset

### Package Structure

```
task-o-matic/
├── dist/              # Compiled output (published)
│   ├── lib/           # Library entry point + core exports
│   ├── cli/           # CLI binary
│   ├── services/      # Business logic layer
│   ├── commands/      # CLI commands
│   ├── mcp/           # MCP server
│   └── types/         # TypeScript definitions
├── src/
│   ├── lib/           # Core library (Storage, Config, AI, etc.)
│   │   └── index.ts   # Main library exports
│   ├── services/      # TaskService, PRDService (framework-agnostic)
│   ├── cli/           # CLI-specific logic
│   │   └── bin.ts     # CLI binary entry point
│   ├── commands/      # Commander.js command implementations
│   ├── mcp/           # MCP server implementation
│   ├── prompts/       # AI prompt templates
│   ├── types/         # TypeScript type definitions
│   └── utils/         # Shared utilities
└── docs/              # Documentation
```

### Core Components

- **Service Layer** (`TaskService`, `PRDService`): Framework-agnostic business logic
- **AI Service**: Uses Vercel AI SDK for multi-provider support
- **Local Storage**: JSON-based file storage in `.task-o-matic/` directory
- **Configuration**: Project-local config with AI provider settings
- **Prompt Templates**: Structured AI prompts for consistent results

### Design Philosophy

- **Separation of Concerns**: CLI, Services, and Core are cleanly separated
- **Framework-Agnostic**: Services can be used in any environment (CLI, TUI, web)
- **Project-Local**: Each project manages its own tasks and configuration
- **AI-Enhanced**: Use AI to improve clarity and break down complexity
- **Developer-Friendly**: Simple, intuitive APIs with helpful output
- **Self-Contained**: No external dependencies, everything works offline

## 🚀 Quick Start

### Library Usage (TUI/Web Apps)

#### Installation

```bash
npm install task-o-matic
```

#### Basic Example

```typescript
import {
  TaskService,
  PRDService,
  type Task,
  type AIConfig,
} from "task-o-matic";

// Initialize the service
const taskService = new TaskService();

// Create a task with AI enhancement
const result = await taskService.createTask({
  title: "Implement user authentication",
  content: "Add login and signup functionality",
  aiEnhance: true,
  aiOptions: {
    provider: "anthropic",
    model: "claude-3-5-sonnet",
    apiKey: process.env.ANTHROPIC_API_KEY,
  },
  callbacks: {
    onProgress: (event) => {
      console.log(`Progress: ${event.message}`);
    },
  },
});

console.log("Task created:", result.task);
```

#### TUI Integration Example

```typescript
import { TaskService } from "task-o-matic";
import type { ProgressCallback } from "task-o-matic";

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

#### PRD Parsing Example

```typescript
import { PRDService } from "task-o-matic";

const prdService = new PRDService();

const result = await prdService.parsePRD({
  file: "./requirements.md",
  workingDirectory: process.cwd(),
  aiOptions: {
    provider: "openrouter",
    model: "anthropic/claude-3.5-sonnet",
    apiKey: process.env.OPENROUTER_API_KEY,
  },
  callbacks: {
    onProgress: (event) => {
      console.log(event.message);
    },
  },
});

console.log(`Created ${result.tasks.length} tasks from PRD`);
result.tasks.forEach((task) => {
  console.log(`- ${task.title}`);
});
```

#### Using Utility Factories

```typescript
import { getStorage, getAIOperations, buildAIConfig } from "task-o-matic";

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
```

#### TypeScript Support

The package includes full TypeScript type definitions:

```typescript
import type {
  Task,
  AIConfig,
  StreamingOptions,
  CreateTaskOptions,
  PRDParseResult,
  TaskAIMetadata,
} from "task-o-matic";
```

### CLI Usage

#### 1. Initialize Your Project

```bash
# Navigate to your project directory
cd /path/to/your/project

# Initialize task-o-matic (basic setup)
task-o-matic init init

# Initialize task-o-matic + bootstrap Better-T-Stack project (recommended)
task-o-matic init init --project-name my-app

# Initialize with custom AI settings + bootstrap
task-o-matic init init --project-name my-app --ai-provider openrouter --ai-key your-key --frontend next --backend hono
```

This creates a `.task-o-matic/` directory with:

- `config.json` - AI configuration
- `tasks/` - Task JSON files
- `prd/` - PRD versions and logs
- `logs/` - Operation logs
- `bts-config.json` - Better-T-Stack configuration (if bootstrapped)

### 3. Configure AI Provider

```bash
# Option 1: Configure during init (recommended)
task-o-matic init init --project-name my-app --ai-provider openrouter --ai-model anthropic/claude-3.5-sonnet --ai-key your-key

# Option 2: Configure after init
task-o-matic config set-ai-provider openrouter anthropic/claude-3.5-sonnet

# Option 3: Use environment variables
export OPENROUTER_API_KEY="your-key-here"
export ANTHROPIC_API_KEY="your-key-here"
export OPENAI_API_KEY="your-key-here"
```

### 4. Bootstrap Your Project (if not done during init)

```bash
# Bootstrap with defaults (Next.js + Hono + SQLite + Auth)
task-o-matic init bootstrap my-app

# Bootstrap with custom options
task-o-matic init bootstrap my-app --frontend next --backend hono --database postgres --addons pwa biome
```

### 6. Create Your First Tasks

```bash
# Create a task with AI enhancement
task-o-matic tasks create --title "Implement user authentication" --ai-enhance

# Create a task with real-time AI streaming
task-o-matic tasks create --title "Implement user authentication" --ai-enhance --stream

# Parse a PRD into tasks
task-o-matic prd parse --file my-prd.md

# Parse PRD with real-time AI streaming
task-o-matic prd parse --file my-prd.md --stream

# List all tasks
task-o-matic tasks list
```

### 7. Interactive Workflow (Recommended for New Projects)

The interactive workflow guides you through the entire setup process:

```bash
# Start the interactive workflow
task-o-matic workflow

# With streaming AI output
task-o-matic workflow --stream
```

**The workflow will guide you through:**

1. **Project Initialization** - Choose quick start, custom, or AI-assisted configuration
2. **PRD Definition** - Upload file, write manually, or use AI to generate from description
3. **PRD Refinement** - Optional AI-assisted improvements
4. **Task Generation** - Parse PRD into actionable tasks
5. **Task Splitting** - Break down complex tasks into subtasks

**AI Assistance at Every Step:**

At each step, you can choose "AI-assisted" to describe your needs in natural language:

```bash
# Example AI-assisted workflow
task-o-matic workflow --stream

# Step 1: "I want to build a SaaS platform for team collaboration"
# Step 2: "Real-time chat, file sharing, and task management features"
# Step 3: "Add more details about authentication and security"
# Step 4: "Focus on MVP features first"
# Step 5: "Break tasks into 2-4 hour chunks"
```

## 📚 Documentation

- [Configuration](docs/configuration.md) - AI providers and settings
- [Task Management](docs/tasks.md) - Full task lifecycle with AI features
- [PRD Processing](docs/prd.md) - Parse and rework Product Requirements Documents
- [Interactive Workflow](docs/workflow-command.md) - Guided setup with AI assistance
- [AI Integration](docs/ai-integration.md) - AI providers and prompt engineering
- [Project Initialization](docs/projects.md) - Project setup and bootstrapping
- [Streaming Output](docs/streaming.md) - Real-time AI streaming capabilities

## 🎯 Common Workflows

### Workflow 0: Interactive Guided Setup (Recommended)

```bash
# One command to rule them all
task-o-matic workflow --stream

# The workflow will guide you through:
# 1. Project initialization with AI-assisted configuration
# 2. PRD creation (manual, upload, or AI-generated)
# 3. PRD refinement with AI feedback
# 4. Task generation from PRD
# 5. Complex task splitting

# After completion:
task-o-matic tasks list
task-o-matic tasks tree
```

### Workflow 1: From PRD to Tasks

```bash
# 1. Initialize project (if not done)
task-o-matic init init

# 2. Configure AI provider
task-o-matic config set-ai-provider anthropic claude-3-5-sonnet

# 3. Parse PRD with streaming
task-o-matic prd parse --file requirements.md --stream

# 4. Review and enhance tasks
task-o-matic tasks list
task-o-matic tasks split --task-id <complex-task-id>
```

### Workflow 2: Task Enhancement

```bash
# 1. Create basic task
task-o-matic tasks create --title "Add payment system"

# 2. Enhance with AI (with streaming)
task-o-matic tasks create --title "Add payment system" --ai-enhance --stream

# 3. Break down into subtasks
task-o-matic tasks split --task-id <task-id>
```

### Workflow 3: Benchmarking Models

Compare different AI models for performance, cost, and quality.

```bash
# 1. Run a benchmark for PRD parsing
task-o-matic benchmark run prd-parse \
  --file requirements.md \
  --models "openai:gpt-4o,openrouter:anthropic/claude-3.5-sonnet" \
  --concurrency 5

# 2. Compare results
task-o-matic benchmark compare <run-id>

# 3. View detailed metrics (Tokens, BPS, Size)
task-o-matic benchmark show <run-id>
```

### Workflow 4: Project Bootstrapping

```bash
# Option 1: One-step setup (recommended)
task-o-matic init init --project-name my-app --ai-provider openrouter --ai-key your-key

# Option 2: Two-step setup
task-o-matic init init --no-bootstrap
task-o-matic init bootstrap my-app --frontend next --backend hono

# Option 3: Manual setup
task-o-matic init init
task-o-matic config set-ai-provider openrouter anthropic/claude-3.5-sonnet
task-o-matic init bootstrap my-app

# Start managing tasks
task-o-matic tasks create --title "Set up development environment" --ai-enhance --stream
```

## 🔧 Environment Variables

```bash
# AI Provider API Keys
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key
OPENROUTER_API_KEY=your_openrouter_key
CUSTOM_API_KEY=your_custom_key
CUSTOM_API_URL=https://api.custom.com/v1

# Default AI Configuration
AI_PROVIDER=openrouter
AI_MODEL=anthropic/claude-3.5-sonnet
AI_MAX_TOKENS=4000
AI_TEMPERATURE=0.7
```

## 🤖 AI Providers

### Supported Providers

- **OpenAI**: GPT models with full feature support
- **Anthropic**: Claude models with enhanced reasoning
- **OpenRouter**: Access to multiple models through one API
- **Custom**: Any OpenAI-compatible API endpoint

### Model Recommendations

- **PRD Parsing**: `claude-3.5-sonnet` or `gpt-4`
- **Task Enhancement**: `claude-3-haiku` or `gpt-3.5-turbo`
- **Task Breakdown**: `claude-3.5-sonnet` for complex tasks

## 📁 Storage Structure

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

## 🛠️ Development

### Building from Source

```bash
# Clone and install
git clone https://github.com/DimitriGilbert/task-o-matic.git
cd task-o-matic
npm install

# Build everything (library + CLI + MCP server)
npm run build

# Build and watch for changes
npm run build:watch

# Clean build artifacts
npm run clean
```

### Development Mode

```bash
# Run the CLI in development mode
npm run dev

# Run the MCP server in development
npm run dev:mcp

# Type checking (without compilation)
npm run check-types

# Run tests
npm run test
```

### Testing Your Changes

```bash
# Link for local testing
npm link

# Use the linked package
task-o-matic --version

# In another project
cd /path/to/test-project
npm link task-o-matic

# Test library import
node -e "const {TaskService} = require('task-o-matic'); console.log('Works!');"
```

### Package Structure

The package is structured for both CLI and library use:

```json
{
  "main": "./dist/lib/index.js", // CommonJS library entry
  "types": "./dist/lib/index.d.ts", // TypeScript definitions
  "bin": {
    "task-o-matic": "./dist/cli/bin.js", // CLI binary
    "task-o-matic-mcp": "./dist/mcp/server.js" // MCP server binary
  },
  "exports": {
    ".": "./dist/lib/index.js", // Main library export
    "./types": "./dist/types/index.js" // Type-only exports
  }
}
```

## 🤖 MCP Server Integration

`task-o-matic` includes a built-in Model Context Protocol (MCP) server that exposes its project management capabilities directly to compatible AI models and development tools.

### Running the MCP Server

You can run the server in development mode or as a production build.

**Development:**

```bash
# This will start the server using tsx for live reloading
npm run dev:mcp
```

**Production:**
First, build the server, then run the executable from your project root.

```bash
# 1. Build the server
npm run build:mcp

# 2. Run the server
# The 'projpoc-mcp' command is now available via npx
npx projpoc-mcp
```

### Connecting a Client

You can connect any MCP-compatible client. For example, to connect an AI model, you would configure its tool server settings to use the `projpoc-mcp` command.

**Example Client Configuration:**

```json
{
  "mcpServers": {
    "task-o-matic": {
      "command": "npx",
      "args": ["projpoc-mcp"]
    }
  }
}
```

### Exposed Tools

When running, the server provides the following tools:

- **`get_project_info`**: Retrieves information about the current project, including its path and AI configuration.
- **`list_tasks`**: Lists all tasks for the project.
  - `filterByStatus` (optional): Filter by `todo`, `in-progress`, or `completed`.
- **`create_task`**: Creates a new task.
  - `taskTitle` (required): The title of the task.
  - `taskContent` (optional): The description of the task.

## 📄 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

---

**Built with ❤️ using Vercel AI SDK and modern TypeScript**
