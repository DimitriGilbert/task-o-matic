# 🚀 AI-Powered Task Management CLI

A comprehensive CLI tool that uses AI to manage tasks for single projects. Parse PRDs, enhance tasks with AI, and bootstrap projects using local file storage only. No backend connectivity required.

## ✨ Features

- 🤖 **AI-Powered**: Parse PRDs and enhance tasks using multiple AI providers
- 📁 **Project-Local Storage**: All data stored locally in `.task-o-matic/` directory
- 🎯 **Task Management**: Full CRUD operations with AI enhancement
- 📋 **PRD Processing**: Convert Product Requirements Documents into actionable tasks
- 🏗️ **Project Bootstrapping**: Better-T-Stack integration for new projects
- 🔧 **Multi-Provider AI**: Support for OpenAI, Anthropic, OpenRouter, and custom providers
- 📊 **Smart Breakdown**: AI-powered task decomposition into subtasks
- 🌊 **Real-time Streaming**: Watch AI responses generate live with streaming output
- 🏠 **Single-Project Focus**: Self-contained within each project directory

## 🏗️ Architecture & Mindset

### Architecture

```
apps/task-o-matic/
├── src/
│   ├── commands/     # CLI command implementations
│   ├── lib/          # Core services (AI, Storage, Config, Operations)
│   ├── mcp/          # MCP server implementation
│   ├── prompts/      # AI prompt templates with auto-detection
│   ├── test/         # Comprehensive test suite
│   ├── types/        # TypeScript type definitions
│   └── utils/        # Shared utilities (AI factory, formatters)
└── docs/            # Documentation
```

### Core Components

- **AI Service**: Uses Vercel AI SDK for multi-provider support
- **Local Storage**: JSON-based file storage in `.task-o-matic/` directory
- **Configuration**: Project-local config with AI provider settings
- **Prompt Templates**: Structured AI prompts for consistent results

### Mindset

- **Project-Local**: Each project manages its own tasks and configuration
- **AI-Enhanced**: Use AI to improve clarity and break down complexity
- **Developer-Friendly**: Simple, intuitive commands with helpful output
- **Self-Contained**: No external dependencies, everything works offline

## 🚀 Quick Start

### 1. Installation

```bash
cd apps/task-o-matic
npm install
```

### 2. Initialize Your Project

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

## 📚 Documentation

- [Configuration](docs/configuration.md) - AI providers and settings
- [Task Management](docs/tasks.md) - Full task lifecycle with AI features
- [PRD Processing](docs/prd.md) - Parse and rework Product Requirements Documents
- [AI Integration](docs/ai-integration.md) - AI providers and prompt engineering
- [Project Initialization](docs/projects.md) - Project setup and bootstrapping
- [Streaming Output](docs/streaming.md) - Real-time AI streaming capabilities

## 🎯 Common Workflows

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

### Workflow 3: Project Bootstrapping

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

```bash
# Install dependencies
npm install

# Run the CLI in development
npm run dev:tom

# Run the MCP server in development
npm run dev:mcp

# Type checking
npm run check-types:tom

# Run tests
npm run test

# Build the CLI
npm run build:tom

# Build the MCP server
npm run build:mcp
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
