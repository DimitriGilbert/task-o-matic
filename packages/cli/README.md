# task-o-matic

AI-powered task management CLI for single projects. Parse PRDs, enhance tasks with AI, and manage your development workflow from the command line.

## Overview

`task-o-matic` is the command-line interface for the Task-O-Matic system. It provides a complete set of commands for managing tasks, processing PRDs, and automating project workflows with AI assistance.

## Installation

### Global Installation

```bash
npm install -g task-o-matic
```

### Using npx

```bash
npx task-o-matic init
```

## Quick Start

### Initialize Your Project

```bash
# Navigate to your project directory
cd /path/to/your/project

# Initialize task-o-matic
task-o-matic init init --project-name my-app

# Configure AI provider
task-o-matic config set-ai-provider anthropic claude-3-5-sonnet

# Create your first task
task-o-matic tasks create --title "Implement user authentication" --ai-enhance
```

### Interactive Workflow (Recommended)

```bash
# Start the interactive workflow with streaming
task-o-matic workflow --stream
```

The workflow will guide you through:
1. Project initialization
2. PRD creation
3. PRD refinement with AI questions
4. Task generation
5. Task splitting

## Commands

### Initialization Commands

#### `task-o-matic init init`

Initialize a new project with task-o-matic.

```bash
# Basic initialization
task-o-matic init init

# Initialize with project name
task-o-matic init init --project-name my-app

# Initialize with AI configuration
task-o-matic init init --project-name my-app --ai-provider openrouter --ai-model anthropic/claude-3.5-sonnet --ai-key your-api-key

# Initialize without bootstrapping
task-o-matic init init --no-bootstrap
```

**Options:**
- `--project-name <name>`: Name of the project
- `--ai-provider <provider>`: AI provider (openai, anthropic, openrouter, custom)
- `--ai-model <model>`: AI model to use
- `--ai-key <key>`: API key for the AI provider
- `--no-bootstrap`: Skip project bootstrapping

#### `task-o-matic init bootstrap`

Bootstrap a Better-T-Stack project.

```bash
# Bootstrap with defaults (Next.js + Hono + SQLite + Auth)
task-o-matic init bootstrap my-app

# Bootstrap with custom options
task-o-matic init bootstrap my-app --frontend next --backend hono --database postgres --addons pwa biome

# Bootstrap with authentication
task-o-matic init bootstrap my-app --auth
```

**Options:**
- `--frontend <framework>`: Frontend framework (next, react, vue, svelte, none)
- `--backend <framework>`: Backend framework (hono, express, fastify, none)
- `--database <db>`: Database (sqlite, postgres, mysql, mongodb, none)
- `--auth`: Enable authentication
- `--addons <addons>`: Additional addons (comma-separated: pwa, biome, testing, etc.)

### Configuration Commands

#### `task-o-matic config set-ai-provider`

Set the AI provider and model.

```bash
# Set Anthropic provider
task-o-matic config set-ai-provider anthropic claude-3-5-sonnet

# Set OpenAI provider
task-o-matic config set-ai-provider openai gpt-4

# Set OpenRouter provider
task-o-matic config set-ai-provider openrouter anthropic/claude-3.5-sonnet

# Set custom provider
task-o-matic config set-ai-provider custom custom-model --api-url https://api.custom.com/v1
```

#### `task-o-matic config show-ai`

Display current AI configuration.

```bash
task-o-matic config show-ai
```

### Task Commands

#### `task-o-matic tasks create`

Create a new task.

```bash
# Create a basic task
task-o-matic tasks create --title "Implement user authentication"

# Create task with content
task-o-matic tasks create --title "Add payment integration" --content "Integrate Stripe for payment processing"

# Create task with AI enhancement
task-o-matic tasks create --title "Implement user authentication" --ai-enhance

# Create task with streaming AI output
task-o-matic tasks create --title "Add payment integration" --ai-enhance --stream

# Create task with priority and tags
task-o-matic tasks create --title "Fix critical bug" --priority high --tags bug,urgent
```

**Options:**
- `--title <title>`: Task title (required)
- `--content <content>`: Task description
- `--ai-enhance`: Enhance task with AI
- `--stream`: Enable streaming output
- `--priority <priority>`: Task priority (low, medium, high)
- `--tags <tags>`: Comma-separated tags

#### `task-o-matic tasks list`

List all tasks.

```bash
# List all tasks
task-o-matic tasks list

# List tasks by status
task-o-matic tasks list --status todo
task-o-matic tasks list --status in-progress
task-o-matic tasks list --status completed

# List tasks with raw JSON output
task-o-matic tasks list --raw

# List tasks with tree view
task-o-matic tasks list --tree
```

**Options:**
- `--status <status>`: Filter by status (todo, in-progress, completed)
- `--raw`: Output raw JSON
- `--tree`: Show task tree with subtasks

#### `task-o-matic tasks show`

Display details of a specific task.

```bash
task-o-matic tasks show <task-id>
```

#### `task-o-matic tasks update`

Update a task.

```bash
# Update task status
task-o-matic tasks update <task-id> --status in-progress

# Update task title
task-o-matic tasks update <task-id> --title "New title"

# Update task content
task-o-matic tasks update <task-id> --content "New description"

# Update task priority
task-o-matic tasks update <task-id> --priority high

# Update task tags
task-o-matic tasks update <task-id> --tags updated,important
```

**Options:**
- `--status <status>`: New status (todo, in-progress, completed)
- `--title <title>`: New title
- `--content <content>`: New content
- `--priority <priority>`: New priority (low, medium, high)
- `--tags <tags>`: Comma-separated tags

#### `task-o-matic tasks delete`

Delete a task.

```bash
task-o-matic tasks delete <task-id>
```

#### `task-o-matic tasks split`

Split a complex task into subtasks.

```bash
# Split a specific task
task-o-matic tasks split <task-id>

# Split with streaming output
task-o-matic tasks split <task-id> --stream

# Split with custom instructions
task-o-matic tasks split <task-id> --instructions "Break into 2-4 hour chunks"
```

**Options:**
- `--stream`: Enable streaming output
- `--instructions <instructions>`: Custom instructions for AI

#### `task-o-matic tasks enhance`

Enhance a task with AI.

```bash
# Enhance task
task-o-matic tasks enhance <task-id>

# Enhance with streaming
task-o-matic tasks enhance <task-id> --stream
```

**Options:**
- `--stream`: Enable streaming output

#### `task-o-matic tasks execute`

Execute a task with AI assistance.

```bash
# Execute task
task-o-matic tasks execute <task-id>

# Execute with streaming
task-o-matic tasks execute <task-id> --stream

# Execute in loop mode
task-o-matic tasks execute <task-id> --loop
```

**Options:**
- `--stream`: Enable streaming output
- `--loop`: Execute in loop mode (continue until completion)

#### `task-o-matic tasks next`

Get the next task to work on.

```bash
task-o-matic tasks next
```

#### `task-o-matic tasks status`

Show task status summary.

```bash
task-o-matic tasks status
```

#### `task-o-matic tasks tree`

Display task hierarchy as a tree.

```bash
task-o-matic tasks tree
```

#### `task-o-matic tasks tags`

List all tags used across tasks.

```bash
task-o-matic tasks tags
```

#### `task-o-matic tasks subtasks`

Show subtasks for a task.

```bash
task-o-matic tasks subtasks <task-id>
```

### Task Document Commands

#### `task-o-matic tasks document add`

Add documentation to a task.

```bash
task-o-matic tasks document add <task-id> --file ./docs/implementation.md
```

**Options:**
- `--file <file>`: Documentation file to add

#### `task-o-matic tasks document get`

Get documentation for a task.

```bash
task-o-matic tasks document get <task-id>
```

#### `task-o-matic tasks document analyze`

Analyze task documentation with AI.

```bash
task-o-matic tasks document analyze <task-id>

# Analyze with streaming
task-o-matic tasks document analyze <task-id> --stream
```

**Options:**
- `--stream`: Enable streaming output

### Task Plan Commands

#### `task-o-matic tasks plan create`

Create a plan for a task.

```bash
task-o-matic tasks plan create <task-id> --instructions "Break down into steps"
```

**Options:**
- `--instructions <instructions>`: Planning instructions

#### `task-o-matic tasks plan get`

Get the plan for a task.

```bash
task-o-matic tasks plan get <task-id>
```

#### `task-o-matic tasks plan set`

Set a plan for a task.

```bash
task-o-matic tasks plan set <task-id> --plan "Step 1: Setup\nStep 2: Implement\nStep 3: Test"
```

**Options:**
- `--plan <plan>`: Plan content

#### `task-o-matic tasks plan delete`

Delete the plan for a task.

```bash
task-o-matic tasks plan delete <task-id>
```

#### `task-o-matic tasks plan list`

List all tasks with plans.

```bash
task-o-matic tasks plan list
```

### PRD Commands

#### `task-o-matic prd parse`

Parse a PRD file into tasks.

```bash
# Parse PRD file
task-o-matic prd parse --file requirements.md

# Parse with streaming output
task-o-matic prd parse --file requirements.md --stream

# Parse with custom instructions
task-o-matic prd parse --file requirements.md --instructions "Focus on MVP features"
```

**Options:**
- `--file <file>`: PRD file to parse (required)
- `--stream`: Enable streaming output
- `--instructions <instructions>`: Custom instructions for AI

#### `task-o-matic prd rework`

Rework a PRD with AI feedback.

```bash
# Rework PRD
task-o-matic prd rework --file requirements.md --feedback "Add more security details"

# Rework with streaming
task-o-matic prd rework --file requirements.md --feedback "Focus on scalability" --stream
```

**Options:**
- `--file <file>`: PRD file to rework (required)
- `--feedback <feedback>`: Feedback for AI (required)
- `--stream`: Enable streaming output

### Workflow Commands

#### `task-o-matic workflow`

Interactive workflow for complete project setup.

```bash
# Start interactive workflow
task-o-matic workflow

# Start with streaming output
task-o-matic workflow --stream

# Automated workflow with all options
task-o-matic workflow \
  --project-name my-saas-app \
  --project-description "Team collaboration platform" \
  --init-method ai \
  --prd-method ai \
  --prd-description "Real-time chat and file sharing" \
  --refine-feedback "Add security details" \
  --generate-instructions "Break into 2-4 hour tasks" \
  --split-all \
  --auto-accept \
  --stream
```

**Options:**
- `--project-name <name>`: Project name
- `--project-description <description>`: Project description
- `--init-method <method>`: Initialization method (quick, custom, ai)
- `--frontend <framework>`: Frontend framework
- `--backend <framework>`: Backend framework
- `--database <db>`: Database
- `--auth/--no-auth`: Enable/disable authentication
- `--prd-method <method>`: PRD creation method (file, manual, ai)
- `--prd-file <file>`: PRD file path
- `--prd-content <content>`: PRD content
- `--prd-description <description>`: PRD description (for AI method)
- `--refine-feedback <feedback>`: Feedback for PRD refinement
- `--generate-instructions <instructions>`: Instructions for task generation
- `--split-tasks/--no-split-tasks`: Enable/disable task splitting
- `--split-all`: Split all complex tasks
- `--split-instructions <instructions>`: Instructions for task splitting
- `--skip-init`: Skip initialization step
- `--skip-prd`: Skip PRD step
- `--skip-refine`: Skip PRD refinement step
- `--skip-generate`: Skip task generation step
- `--skip-split`: Skip task splitting step
- `--auto-accept`: Auto-accept all prompts
- `--stream`: Enable streaming output
- `--config-file <file>`: Load workflow from config file

### Benchmark Commands

#### `task-o-matic benchmark run`

Run a benchmark on specific operations.

```bash
# Benchmark PRD parsing
task-o-matic benchmark run prd-parse \
  --file requirements.md \
  --models "openai:gpt-4o,anthropic:claude-3-5-sonnet" \
  --concurrency 3

# Benchmark task breakdown
task-o-matic benchmark run task-breakdown \
  --task-id <task-id> \
  --models "openai:gpt-4o,anthropic:claude-3-5-sonnet" \
  --concurrency 2
```

**Options:**
- `--models <models>`: Comma-separated model list (required)
- `--concurrency <number>`: Max parallel requests (default: 3)
- `--delay <ms>`: Delay between requests (default: 1000ms)

#### `task-o-matic benchmark workflow`

Benchmark complete workflow across multiple AI models.

```bash
# Interactive workflow benchmark
task-o-matic benchmark workflow \
  --models "openai:gpt-4o,anthropic:claude-3-5-sonnet,openrouter:qwen/qwen-2.5-72b-instruct"

# Automated workflow benchmark
task-o-matic benchmark workflow \
  --models "openai:gpt-4o,anthropic:claude-3-5-sonnet" \
  --project-name "my-saas-app" \
  --project-description "Team collaboration platform" \
  --init-method ai \
  --prd-method ai \
  --auto-accept \
  --split-all \
  --concurrency 2 \
  --delay 2000
```

**Options:**
All workflow options are supported, plus:
- `--models <models>`: Comma-separated model list (required)
- `--concurrency <number>`: Max parallel requests (default: 3)
- `--delay <ms>`: Delay between requests (default: 1000ms)

#### `task-o-matic benchmark list`

List all benchmark runs.

```bash
task-o-matic benchmark list
```

#### `task-o-matic benchmark show`

Show details of a benchmark run.

```bash
task-o-matic benchmark show <run-id>
```

#### `task-o-matic benchmark compare`

Compare benchmark results.

```bash
task-o-matic benchmark compare <run-id>
```

### Prompt Commands

#### `task-o-matic prompt`

Run an AI prompt with context.

```bash
# Run a simple prompt
task-o-matic prompt "How do I implement authentication?"

# Run prompt with streaming
task-o-matic prompt "Explain the architecture" --stream

# Run prompt with file context
task-o-matic prompt "Review this code" --file ./src/auth.ts
```

**Options:**
- `--stream`: Enable streaming output
- `--file <file>`: Add file context to prompt

### Install Commands

#### `task-o-matic install`

Install shell completions.

```bash
# Install bash completions
task-o-matic install --shell bash

# Install zsh completions
task-o-matic install --shell zsh

# Install fish completions
task-o-matic install --shell fish
```

**Options:**
- `--shell <shell>`: Shell type (bash, zsh, fish)

## Common Workflows

### Workflow 1: Complete Project Setup

```bash
# One command to initialize everything
task-o-matic workflow --stream

# The workflow will guide you through:
# 1. Project initialization
# 2. PRD creation
# 3. PRD refinement
# 4. Task generation
# 5. Task breakdown
```

### Workflow 2: From PRD to Tasks

```bash
# 1. Initialize project
task-o-matic init init --project-name my-app

# 2. Configure AI provider
task-o-matic config set-ai-provider anthropic claude-3-5-sonnet

# 3. Parse PRD with streaming
task-o-matic prd parse --file requirements.md --stream

# 4. Review and enhance tasks
task-o-matic tasks list --tree

# 5. Split complex tasks
task-o-matic tasks split <complex-task-id> --stream
```

### Workflow 3: Task Enhancement

```bash
# 1. Create basic task
task-o-matic tasks create --title "Add payment system"

# 2. Enhance with AI and streaming
task-o-matic tasks create --title "Add payment system" --ai-enhance --stream

# 3. Break down into subtasks
task-o-matic tasks split <task-id> --stream
```

### Workflow 4: AI Model Comparison

```bash
# Benchmark workflow across multiple models
task-o-matic benchmark workflow \
  --models "openai:gpt-4o,anthropic:claude-3-5-sonnet,openrouter:qwen/qwen-2.5-72b-instruct" \
  --project-description "E-commerce platform with AI recommendations"

# The benchmark will:
# 1. Collect workflow questions once
# 2. Execute identical workflows in parallel
# 3. Show comprehensive comparison
# 4. Allow you to select the best model
```

### Workflow 5: Daily Task Management

```bash
# Get next task
task-o-matic tasks next

# Update task status
task-o-matic tasks update <task-id> --status in-progress

# Execute task with AI assistance
task-o-matic tasks execute <task-id> --loop

# Mark as completed
task-o-matic tasks update <task-id> --status completed

# Check progress
task-o-matic tasks status
```

## Environment Variables

```bash
# AI Provider API Keys
export OPENAI_API_KEY="your_openai_key"
export ANTHROPIC_API_KEY="your_anthropic_key"
export OPENROUTER_API_KEY="your_openrouter_key"
export CUSTOM_API_KEY="your_custom_key"
export CUSTOM_API_URL="https://api.custom.com/v1"

# Default AI Configuration
export AI_PROVIDER="anthropic"
export AI_MODEL="claude-3-5-sonnet"
export AI_MAX_TOKENS="4000"
export AI_TEMPERATURE="0.7"
```

## AI Providers

### Supported Providers

- **OpenAI**: GPT models with full feature support
- **Anthropic**: Claude models with enhanced reasoning
- **OpenRouter**: Access to multiple models through one API
- **Custom**: Any OpenAI-compatible API endpoint

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

## Shell Completions

Install shell completions for better command-line experience:

```bash
# Bash
task-o-matic install --shell bash
source ~/.bashrc

# Zsh
task-o-matic install --shell zsh
source ~/.zshrc

# Fish
task-o-matic install --shell fish
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
