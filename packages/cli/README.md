# ⛑️ task-o-matic CLI

**Your command bunker in the post-apocalyptic development wasteland**

---

## ⚠️ SURVIVAL BULLETIN

_Citizen, the world outside has changed. The software development landscape shifted from chaos into something... darker. But your projects don't have to die in the radioactive dust of bad management._

_The `task-o-matic` CLI is your bunker command system. Think of it as a wrist-mounted interface for code—organizing tasks, parsing documents, and deploying artificial intelligence to help your projects thrive when everything else has collapsed._

_[The preceding message was brought to you by the Department of Project Preservation. Remember: A prepared developer is a surviving developer.]_

---

## 📋 COMMAND STRUCTURE

The CLI is organized into command groups. Each group serves a specific survival function:

```bash
task-o-matic <command-group> <subcommand> [options]
```

### Available Command Groups

| Group | Purpose |
|-------|---------|
| `init` | Initialize projects, attach to existing codebases, bootstrap fresh starts |
| `tasks` | Task CRUD, enhancement, splitting, execution, planning, documentation |
| `prd` | Product Requirements Document management (create, parse, refine, combine) |
| `workflow` | Guided end-to-end project setup and automation |
| `config` | AI provider and project configuration |
| `benchmark` | AI model performance comparison and testing |
| `detect` | Technology stack detection and analysis |
| `continue` | Resume work on existing projects |
| `prompt` | Build AI prompts for external tools |
| `install` | Install documentation and agent guides |

---

## 🚀 QUICK START: SURVIVAL MODE

### The One-Shot Approach (Fastest Survival)

```bash
# Navigate to your project's containment zone
cd /path/to/your/project

# One command. The AI guides you through everything.
task-o-matic workflow --stream
```

**What happens:**
1. Initialization of the command bunker (`.task-o-matic/` directory)
2. PRD creation or loading
3. PRD refinement with AI-generated questions
4. Task generation from refined PRD
5. Task splitting into manageable chunks

**Estimated time:** 5-10 minutes

### The Surgical Strike (When You Know What You're Doing)

```bash
# Initialize containment directory
task-o-matic init init --ai-provider anthropic --ai-model claude-3-5-sonnet

# Configure AI provider
task-o-matic config set-ai-provider anthropic claude-3-5-sonnet

# Create task with AI enhancement
task-o-matic tasks create --title "Add survivor authentication" --ai-enhance --stream
```

---

## 🏗️ INITIALIZATION COMMANDS

### `task-o-matic init init`

Initialize a new project command bunker.

```bash
# Basic initialization
task-o-matic init init

# With project name and AI configuration
task-o-matic init init --project-name my-shelter-manager \
  --ai-provider anthropic --ai-model claude-3-5-sonnet

# Without bootstrapping
task-o-matic init init --no-bootstrap
```

**Options:**
- `--ai-provider <provider>`: AI provider (openai, anthropic, openrouter, custom)
- `--ai-model <model>`: AI model to use
- `--ai-key <key>`: API key for the AI provider
- `--ai-provider-url <url>`: Custom AI provider URL
- `--max-tokens <tokens>`: Max tokens for AI responses
- `--temperature <temp>`: AI temperature (0-1)
- `--no-bootstrap`: Skip project bootstrapping
- `--project-name <name>`: Project name for bootstrap
- `--frontend <frontends...>`: Frontend framework(s) for bootstrap
- `--backend <backend>`: Backend framework for bootstrap
- `--database <database>`: Database for bootstrap
- `--auth <auth>`: Authentication for bootstrap
- `--context7-api-key <key>`: Context7 API key for documentation fetching
- `--directory <dir>`: Working directory for the project
- `--package-manager <pm>`: Package manager (npm, bun, pnpm, yarn)
- `--runtime <runtime>`: Runtime (node, bun, deno)
- `--payment <payment>`: Payment provider
- `--cli-deps <level>`: CLI dependency level

### `task-o-matic init bootstrap <name>`

Bootstrap a new project with Better-T-Stack.

```bash
# Full-stack web application
task-o-matic init bootstrap vault-app --frontend next --backend hono --database postgres --auth

# CLI application
task-o-matic init bootstrap shelter-cli --backend hono --database sqlite --no-auth

# Native mobile app
task-o-matic init bootstrap survival-mobile --frontend react-native --auth
```

**Options:**
- `--frontend <frontends...>`: Frontend framework(s) (next, react, vue, svelte, react-native, none)
- `--backend <backend>`: Backend framework (hono, express, fastify, none)
- `--database <database>`: Database (sqlite, postgres, mysql, mongodb, none)
- `--orm <orm>`: ORM (prisma, drizzle, typeorm)
- `--auth <auth>`: Authentication (better-auth, clerk, nextauth, auth0, none)
- `--no-auth`: Exclude authentication
- `--addons <addons...>`: Addons (pwa, biome, testing, etc.)
- `--examples <examples...>`: Examples to include
- `--template <template>`: Use a predefined template
- `--no-git`: Skip git initialization
- `--package-manager <pm>`: Package manager
- `--no-install`: Skip installing dependencies
- `--db-setup <setup>`: Database setup
- `--runtime <runtime>`: Runtime
- `--api <type>`: API type
- `--payment <payment>`: Payment provider
- `--cli-deps <level>`: CLI dependency level

### `task-o-matic init attach`

Attach the command bunker to an existing project.

```bash
# Auto-detect stack
task-o-matic init attach --analyze --create-prd

# Just detect without creating files
task-o-matic init attach --dry-run

# Force re-detection
task-o-matic init attach --redetect
```

**Options:**
- `--analyze`: Run full project analysis including TODOs and features
- `--create-prd`: Auto-generate a PRD from codebase analysis
- `--dry-run`: Just detect, don't create files
- `--redetect`: Force re-detection of stack
- `--ai-provider <provider>`: AI provider
- `--ai-model <model>`: AI model
- `--ai-key <key>`: AI API key
- `--ai-provider-url <url>`: AI provider URL
- `--max-tokens <tokens>`: Max tokens for AI
- `--temperature <temp>`: AI temperature
- `--context7-api-key <key>`: Context7 API key

---

## 📝 TASK COMMANDS

### `task-o-matic tasks create`

Create a new task with AI enhancement.

```bash
# Basic task
task-o-matic tasks create --title "Fix water filtration system"

# With content and enhancement
task-o-matic tasks create --title "Add survivor tracking" \
  --content "Implement tracking system for all bunker residents" \
  --ai-enhance --stream

# With parent task
task-o-matic tasks create --title "Install sensor hardware" \
  --parent-id 1 --effort 2h
```

**Options:**
- `--title <title>`: Task title (required)
- `--content <content>`: Task description
- `--effort <effort>`: Estimated effort (e.g., 2h, 4h, 1d)
- `--parent-id <id>`: Parent task ID for subtasks
- `--ai-enhance`: Enhance task with AI
- `--stream`: Show streaming AI output
- `--ai-provider <provider>`: AI provider override
- `--ai-model <model>`: AI model override
- `--ai-key <key>`: AI API key override
- `--ai-provider-url <url>`: AI provider URL override
- `--reasoning <tokens>`: Enable reasoning for OpenRouter models

### `task-o-matic tasks list`

List tasks with filtering.

```bash
# List all tasks
task-o-matic tasks list

# Filter by status
task-o-matic tasks list --status todo
task-o-matic tasks list --status in-progress
task-o-matic tasks list --status completed

# Filter by tag
task-o-matic tasks list --tag security
```

**Options:**
- `--status <status>`: Filter by status (todo, in-progress, completed)
- `--tag <tag>`: Filter by tag

### `task-o-matic tasks show`

Display detailed information about a task.

```bash
task-o-matic tasks show --id 7
```

**Options:**
- `--id <id>`: Task ID to show (required)

### `task-o-matic tasks update`

Update an existing task.

```bash
# Update status
task-o-matic tasks update --id 7 --status in-progress

# Update title and description
task-o-matic tasks update --id 7 --title "New title" --description "New description"

# Update effort and tags
task-o-matic tasks update --id 7 --effort 4h --tags critical,backend
```

**Options:**
- `--id <id>`: Task ID to update (required)
- `--title <title>`: New task title
- `--description <description>`: New task description
- `--status <status>`: New status (todo, in-progress, completed)
- `--effort <effort>`: New estimated effort
- `--tags <tags>`: New tags (comma-separated)

### `task-o-matic tasks delete`

Delete a task.

```bash
# Delete with confirmation
task-o-matic tasks delete --id 7

# Force delete without confirmation
task-o-matic tasks delete --id 7 --force

# Delete task and all subtasks
task-o-matic tasks delete --id 7 --cascade
```

**Options:**
- `--id <id>`: Task ID to delete (required)
- `--force`: Skip confirmation prompt
- `--cascade`: Delete all subtasks

### `task-o-matic tasks enhance`

Enhance an existing task with AI using Context7 documentation.

```bash
# Enhance single task
task-o-matic tasks enhance --task-id 7 --stream

# Enhance all tasks
task-o-matic tasks enhance --all --force --stream

# Enhance specific status/tag
task-o-matic tasks enhance --status todo --tag critical --dry
```

**Options:**
- `--task-id <id>`: Task ID to enhance
- `--all`: Enhance all existing tasks
- `--status <status>`: Filter tasks by status
- `--tag <tag>`: Filter tasks by tag
- `--dry`: Preview what would be enhanced
- `--force`: Skip confirmation prompt
- `--stream`: Show streaming AI output
- `--ai-provider <provider>`: AI provider override
- `--ai-model <model>`: AI model override
- `--ai-key <key>`: AI API key override
- `--ai-provider-url <url>`: AI provider URL override
- `--reasoning <tokens>`: Enable reasoning

### `task-o-matic tasks split`

Split a task into smaller subtasks using AI.

```bash
# Split single task (works even if it already has subtasks)
task-o-matic tasks split --task-id 7 --stream

# Split all tasks
task-o-matic tasks split --all --force --stream

# Multi-AI splitting
task-o-matic tasks split --task-id 7 \
  --ai "anthropic:claude-3.5-sonnet,openai:gpt-4o" \
  --combine-ai anthropic:claude-3.5-sonnet \
  --stream
```

**Options:**
- `--task-id <id>`: Task ID to split
- `--all`: Split all existing tasks
- `--status <status>`: Filter tasks by status
- `--tag <tag>`: Filter tasks by tag
- `--dry`: Preview what would be split
- `--force`: Skip confirmation prompt
- `--stream`: Show streaming AI output
- `--ai-provider <provider>`: AI provider override
- `--ai-key <key>`: AI API key override
- `--ai-provider-url <url>`: AI provider URL override
- `--ai <models...>`: AI model(s) to use (comma-separated)
- `--combine-ai <provider:model>`: AI model to combine results
- `--reasoning <tokens>`: Enable reasoning
- `--tools`: Enable filesystem tools

### `task-o-matic tasks execute`

Execute a task using an external coding assistant.

```bash
# Execute with planning and review
task-o-matic tasks execute --id 7 \
  --tool opencode \
  --plan --review \
  --verify "bun test" \
  --max-retries 3

# Progressive model retry
task-o-matic tasks execute --id 7 \
  --try-models "gpt-4o-mini,gpt-4o,claude:sonnet-4" \
  --verify "bun run build" \
  --auto-commit
```

**Options:**
- `--id <id>`: Task ID to execute (required)
- `--tool <tool>`: External tool (opencode, claude, gemini, codex)
- `--message <message>`: Custom message to send
- `--model <model>`: Model to use
- `--continue-session`: Continue last session
- `--dry`: Show what would be executed
- `--verify <command>`: Verification command (alias: `--validate`)
- `--max-retries <number>`: Maximum number of retries
- `--try-models <models>`: Progressive model/executor configs
- `--plan`: Generate implementation plan
- `--plan-model <model>`: Model for planning
- `--plan-tool <tool>`: Tool for planning
- `--review-plan`: Pause for human review
- `--review`: Run AI review after execution
- `--review-model <model>`: Model for review
- `--auto-commit`: Automatically commit changes
- `--include-prd`: Include PRD content

### `task-o-matic tasks execute-loop`

Execute multiple tasks in a loop with retry logic.

```bash
# Execute all TODO tasks
task-o-matic tasks execute-loop --status todo \
  --tool opencode \
  --verify "bun test" \
  --max-retries 3

# Execute specific tasks
task-o-matic tasks execute-loop --ids 7,8,9 \
  --plan --review \
  --auto-commit
```

**Options:**
- `--status <status>`: Filter tasks by status
- `--tag <tag>`: Filter tasks by tag
- `--ids <ids>`: Comma-separated list of task IDs
- `--tool <tool>`: External tool to use
- `--max-retries <number>`: Maximum retries per task
- `--try-models <models>`: Progressive model/executor configs
- `--model <model>`: Model to force
- `--verify <command>`: Verification command (alias: `--validate`)
- `--message <message>`: Custom message
- `--continue-session`: Continue last session
- `--auto-commit`: Automatically commit changes
- `--plan`: Generate implementation plan
- `--plan-model <model>`: Model for planning
- `--plan-tool <tool>`: Tool for planning
- `--review-plan`: Pause for human review
- `--review`: Run AI review after execution
- `--review-model <model>`: Model for review
- `--include-completed`: Include completed tasks
- `--include-prd`: Include PRD content
- `--notify <target>`: Notify on completion
- `--dry`: Show what would be executed

### `task-o-matic tasks get-next`

Get the next task to work on.

```bash
# Get next TODO task
task-o-matic tasks get-next --status todo

# Get next critical priority task
task-o-matic tasks get-next --tag critical

# Get shortest task
task-o-matic tasks get-next --priority effort
```

**Options:**
- `--status <status>`: Filter by status
- `--tag <tag>`: Filter by tag
- `--effort <effort>`: Filter by effort
- `--priority <priority>`: Sort priority (newest, oldest, effort)

### `task-o-matic tasks status`

Set task status.

```bash
task-o-matic tasks status --id 7 --status in-progress
```

**Options:**
- `--id <id>`: Task ID (required)
- `--status <status>`: New status (todo, in-progress, completed)

### `task-o-matic tasks tree`

Display hierarchical task tree.

```bash
# Show full tree
task-o-matic tasks tree

# Show subtree starting from task 7
task-o-matic tasks tree --id 7
```

**Options:**
- `--id <id>`: Root task ID (optional - shows full tree if not specified)

### `task-o-matic tasks subtasks`

List subtasks for a task.

```bash
task-o-matic tasks subtasks --id 7
```

**Options:**
- `--id <id>`: Parent task ID (required)

### `task-o-matic tasks add-tags` / `tasks remove-tags`

Add or remove tags from a task.

```bash
# Add tags
task-o-matic tasks add-tags --id 7 --tags critical,security

# Remove tags
task-o-matic tasks remove-tags --id 7 --tags deprecated
```

**Options:**
- `--id <id>`: Task ID (required)
- `--tags <tags>`: Tags to add/remove (comma-separated)

---

## 📋 TASK PLAN COMMANDS

### `task-o-matic tasks plan`

Create detailed implementation plan for a task.

```bash
task-o-matic tasks plan --id 7 --stream
```

**Options:**
- `--id <id>`: Task or subtask ID (required)
- `--stream`: Show streaming AI output
- `--ai-provider <provider>`: AI provider override
- `--ai-model <model>`: AI model override
- `--ai-key <key>`: AI API key override
- `--ai-provider-url <url>`: AI provider URL override
- `--reasoning <tokens>`: Enable reasoning

### `task-o-matic tasks list-plan`

List all available implementation plans.

```bash
task-o-matic tasks list-plan
```

### `task-o-matic tasks get-plan`

View existing implementation plan.

```bash
task-o-matic tasks get-plan --id 7
```

**Options:**
- `--id <id>`: Task or subtask ID (required)

### `task-o-matic tasks set-plan`

Set implementation plan for a task.

```bash
# Set from text
task-o-matic tasks set-plan --id 7 --plan "Step 1: Setup\nStep 2: Implement\nStep 3: Test"

# Set from file
task-o-matic tasks set-plan --id 7 --plan-file ./plans/implementation.md
```

**Options:**
- `--id <id>`: Task ID (required)
- `--plan <text>`: Plan content
- `--plan-file <path>`: Path to file containing plan

### `task-o-matic tasks delete-plan`

Delete implementation plan.

```bash
task-o-matic tasks delete-plan --id 7
```

**Options:**
- `--id <id>`: Task ID (required)

---

## 📄 TASK DOCUMENTATION COMMANDS

### `task-o-matic tasks document`

Analyze and fetch documentation for a task using AI with Context7.

```bash
task-o-matic tasks document --task-id 7 --force --stream
```

**Options:**
- `--task-id <id>`: Task ID (required)
- `--force`: Force refresh documentation even if recent
- `--stream`: Show streaming AI output
- `--ai-provider <provider>`: AI provider override
- `--ai-model <model>`: AI model override
- `--ai-key <key>`: AI API key override
- `--ai-provider-url <url>`: AI provider URL override
- `--reasoning <tokens>`: Enable reasoning

### `task-o-matic tasks add-documentation`

Add documentation to a task from a file.

```bash
task-o-matic tasks add-documentation --id 7 --doc-file ./docs/api.md
```

**Options:**
- `--id <id>`: Task ID (required)
- `--doc-file <path>`: Path to documentation file (required)
- `--overwrite`: Overwrite existing documentation

### `task-o-matic tasks get-documentation`

Get existing documentation for a task.

```bash
task-o-matic tasks get-documentation --id 7
```

**Options:**
- `--id <id>`: Task ID (required)

---

## 📋 PRD COMMANDS

### `task-o-matic prd create <description>`

Generate PRD(s) from a product description.

```bash
# Single PRD generation
task-o-matic prd create "Build a vault management system" --stream

# Multi-AI PRD generation
task-o-matic prd create "Build a vault manager" \
  --ai "anthropic:claude-3.5-sonnet,openai:gpt-4o,openrouter:qwen-2.5" \
  --combine-ai anthropic:claude-3.5-sonnet \
  --stream

# Custom output directory
task-o-matic prd create "Survival tracking app" \
  --output-dir ./prds \
  --ai-reasoning 5000
```

**Options:**
- `<description>`: Product description (required)
- `--ai <models...>`: AI model(s) to use
- `--combine-ai <provider:model>`: AI model to combine multiple PRDs
- `--output-dir <path>`: Directory to save PRDs
- `--ai-reasoning <tokens>`: Enable reasoning for OpenRouter models
- `--stream`: Enable streaming output

### `task-o-matic prd combine`

Combine multiple PRD files into a master PRD.

```bash
task-o-matic prd combine \
  --files ./prds/prd1.md,./prds/prd2.md \
  --description "Original vault manager description" \
  --output ./prd-master.md \
  --stream
```

**Options:**
- `--files <paths...>`: PRD files to combine (required)
- `--description <text>`: Original product description
- `--ai <provider:model>`: AI model to use
- `--output <path>`: Output file path
- `--ai-reasoning <tokens>`: Enable reasoning
- `--stream`: Enable streaming

### `task-o-matic prd parse`

Parse a PRD file into structured tasks.

```bash
# Basic parsing
task-o-matic prd parse --file requirements.md --stream

# Multi-AI parsing
task-o-matic prd parse --file requirements.md \
  --ai "anthropic:claude-3.5-sonnet,openai:gpt-4o" \
  --combine-ai anthropic:claude-3.5-sonnet \
  --stream

# With custom prompt
task-o-matic prd parse --file requirements.md \
  --prompt "Focus on security features" \
  --tools
```

**Options:**
- `--file <path>`: Path to PRD file (required)
- `--ai <models...>`: AI model(s) to use
- `--combine-ai <provider:model>`: AI model to combine results
- `--prompt <prompt>`: Override prompt
- `--message <message>`: User message
- `--ai-provider <provider>`: AI provider override
- `--ai-model <model>`: AI model override
- `--ai-key <key>`: AI API key override
- `--ai-provider-url <url>`: AI provider URL override
- `--ai-reasoning <tokens>`: Enable reasoning
- `--stream`: Show streaming AI output
- `--tools`: Enable filesystem tools

### `task-o-matic prd rework`

Rework a PRD based on user feedback.

```bash
task-o-matic prd rework \
  --file requirements.md \
  --feedback "Add more security protocols and emergency procedures" \
  --output ./reworked-prd.md \
  --stream
```

**Options:**
- `--file <path>`: Path to PRD file (required)
- `--feedback <feedback>`: User feedback (required)
- `--output <path>`: Output file path
- `--prompt <prompt>`: Override prompt
- `--message <message>`: User message
- `--ai-provider <provider>`: AI provider override
- `--ai-model <model>`: AI model override
- `--ai-key <key>`: AI API key override
- `--ai-provider-url <url>`: AI provider URL override
- `--ai-reasoning <tokens>`: Enable reasoning
- `--stream`: Show streaming AI output
- `--tools`: Enable filesystem tools

### `task-o-matic prd question`

Generate clarifying questions for a PRD.

```bash
task-o-matic prd question --file requirements.md --output ./questions.json --stream
```

**Options:**
- `--file <path>`: Path to PRD file (required)
- `--output <path>`: Output JSON file path
- `--prompt <prompt>`: Override prompt
- `--message <message>`: User message
- `--ai-provider <provider>`: AI provider override
- `--ai-model <model>`: AI model override
- `--ai-key <key>`: AI API key override
- `--ai-provider-url <url>`: AI provider URL override
- `--ai-reasoning <tokens>`: Enable reasoning
- `--stream`: Show streaming AI output
- `--tools`: Enable filesystem tools

### `task-o-matic prd refine`

Refine PRD by answering clarifying questions.

```bash
# AI answers questions
task-o-matic prd refine --file requirements.md --question-mode ai --stream

# User answers questions
task-o-matic prd refine --file requirements.md \
  --questions ./questions.json \
  --question-mode user \
  --stream
```

**Options:**
- `--file <path>`: Path to PRD file (required)
- `--questions <path>`: Path to questions JSON file
- `--output <path>`: Output file path
- `--prompt <prompt>`: Override prompt
- `--message <message>`: User message
- `--ai-provider <provider>`: AI provider override
- `--ai-model <model>`: AI model override
- `--ai-key <key>`: AI API key override
- `--ai-provider-url <url>`: AI provider URL override
- `--ai-reasoning <tokens>`: Enable reasoning
- `--stream`: Show streaming AI output
- `--tools`: Enable filesystem tools

### `task-o-matic prd get-stack`

Suggest optimal technology stack based on PRD analysis.

```bash
# Analyze from file
task-o-matic prd get-stack --file requirements.md --save --json

# Analyze from content
task-o-matic prd get-stack --content "Vault management system" --project-name vault-manager
```

**Options:**
- `--file <path>`: Path to PRD file
- `--content <text>`: PRD content as string
- `--project-name <name>`: Project name
- `--save`: Save suggested stack to .task-o-matic/stack.json
- `--output <path>`: Custom output path
- `--json`: Output result as JSON
- `--prompt <prompt>`: Override prompt
- `--message <message>`: User message
- `--ai-provider <provider>`: AI provider override
- `--ai-model <model>`: AI model override
- `--ai-key <key>`: AI API key override
- `--ai-provider-url <url>`: AI provider URL override
- `--ai-reasoning <tokens>`: Enable reasoning
- `--stream`: Show streaming AI output
- `--tools`: Enable filesystem tools

### `task-o-matic prd generate`

Generate a PRD from an existing codebase (reverse-engineering).

```bash
task-o-matic prd generate --output ./generated-prd.md --stream --tools
```

**Options:**
- `--output <filename>`: Output filename
- `--ai <provider:model>`: AI model to use
- `--ai-reasoning <tokens>`: Enable reasoning
- `--stream`: Enable streaming output
- `--tools`: Enable filesystem tools for deeper analysis
- `--json`: Output result as JSON

---

## 🔄 WORKFLOW COMMAND

### `task-o-matic workflow`

Interactive workflow for complete project setup and task management.

```bash
# Interactive with streaming
task-o-matic workflow --stream

# Fully automated
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

**Major Options:**

**Initialization:**
- `--stream`: Show streaming AI output
- `--auto-accept`: Auto-accept all AI suggestions
- `--skip-all`: Skip all optional steps
- `--skip-init`: Skip initialization step
- `--project-name <name>`: Project name
- `--init-method <method>`: Initialization method (quick, custom, ai)
- `--project-description <desc>`: Project description
- `--use-existing-config`: Use existing configuration

**Bootstrap:**
- `--frontend <framework>`: Frontend framework
- `--backend <framework>`: Backend framework
- `--database <db>`: Database choice
- `--auth/--no-auth`: Include/exclude authentication
- `--bootstrap/--no-bootstrap`: Bootstrap project

**PRD:**
- `--skip-prd`: Skip PRD definition
- `--prd-method <method>`: PRD method (file, manual, ai)
- `--prd-file <path>`: Path to existing PRD
- `--prd-description <desc>`: Product description
- `--prd-content <content>`: Direct PRD content
- `--prd-multi-generation`: Generate multiple PRDs
- `--skip-prd-multi-generation`: Skip multi-generation
- `--prd-multi-generation-models <models>`: Models for multi-generation
- `--prd-combine/--skip-prd-combine`: Combine generated PRDs
- `--prd-combine-model <model>`: Model for combining

**Stack Suggestion:**
- `--skip-stack-suggestion`: Skip stack suggestion
- `--suggest-stack-from-prd [path]`: Get stack from PRD

**PRD Refinement:**
- `--skip-prd-question-refine`: Skip PRD question/refine
- `--prd-question-refine`: Use question-based refinement
- `--prd-answer-mode <mode>`: Who answers questions
- `--prd-answer-ai-provider <provider>`: AI provider for answering
- `--prd-answer-ai-model <model>`: AI model for answering
- `--prd-answer-ai-reasoning`: Enable reasoning for AI answering

**Task Generation:**
- `--skip-generate`: Skip task generation
- `--generate-method <method>`: Generation method
- `--generate-instructions <instructions>`: Custom task generation instructions

**Task Splitting:**
- `--skip-split`: Skip task splitting
- `--split-tasks <ids>`: Task IDs to split
- `--split-all`: Split all tasks
- `--split-method <method>`: Split method
- `--split-instructions <instructions>`: Custom split instructions

**Execution:**
- `--execute`: Execute generated tasks
- `--execute-concurrency <number>`: Number of concurrent tasks
- `--no-auto-commit`: Disable auto-commit
- `--execute-tool <tool>`: Executor tool
- `--execute-model <model>`: Model override for execution
- `--execute-max-retries <number>`: Max retries per task
- `--execute-plan`: Enable planning phase
- `--execute-plan-model <model>`: Model for planning
- `--execute-review`: Enable review phase
- `--execute-review-model <model>`: Model for review
- `--verify <command>`: Verification command
- `--validate <command>`: Alias for --verify
- `--try-models <models>`: Progressive model/executor configs

---

## ⚙️ CONFIGURATION COMMANDS

### `task-o-matic config get-ai-config`

Get the current AI configuration.

```bash
task-o-matic config get-ai-config
```

### `task-o-matic config set-ai-provider <provider> [model]`

Set the AI provider and model.

```bash
# Set Anthropic
task-o-matic config set-ai-provider anthropic claude-3-5-sonnet

# Set OpenAI
task-o-matic config set-ai-provider openai gpt-4

# Set OpenRouter
task-o-matic config set-ai-provider openrouter anthropic/claude-3.5-sonnet

# Set custom
task-o-matic config set-ai-provider custom custom-model --api-url https://api.custom.com/v1
```

### `task-o-matic config info`

Get information about the current task-o-matic project.

```bash
task-o-matic config info
```

---

## 🧪 BENCHMARK COMMANDS

### `task-o-matic benchmark run <operation>`

Run a benchmark on specific operations.

```bash
# Benchmark PRD parsing
task-o-matic benchmark run prd-parse \
  --file requirements.md \
  --models "openai:gpt-4o,anthropic:claude-3-5-sonnet" \
  --concurrency 3

# Benchmark task breakdown
task-o-matic benchmark run task-breakdown \
  --task-id 7 \
  --models "openai:gpt-4o,anthropic:claude-3-5-sonnet" \
  --concurrency 2
```

**Options:**
- `--models <list>`: Comma-separated list of models (required)
- `--concurrency <number>`: Max concurrent requests (default: 3)
- `--delay <number>`: Delay between requests in ms
- Additional options specific to each operation

### `task-o-matic benchmark execution`

Run execution benchmark with Git branch isolation.

```bash
task-o-matic benchmark execution \
  --task-id 7 \
  --models "openai:gpt-4o,anthropic:claude-3-5-sonnet" \
  --verify "bun test" \
  --max-retries 3
```

**Options:**
- `--task-id <id>`: Task ID to benchmark (required)
- `--models <list>`: Comma-separated list of models (required)
- `--verify <command>`: Verification command
- `--max-retries <number>`: Maximum retries per model
- `--no-keep-branches`: Delete benchmark branches

### `task-o-matic benchmark execute-loop`

Benchmark task loop execution across models.

```bash
task-o-matic benchmark execute-loop \
  --status todo \
  --models "openai:gpt-4o,anthropic:claude-3-5-sonnet" \
  --verify "bun test" \
  --max-retries 3
```

**Options:**
- `--status <status>`: Filter tasks by status
- `--tag <tag>`: Filter tasks by tag
- `--ids <ids>`: Comma-separated list of task IDs
- `--models <list>`: Comma-separated list of models (required)
- `--verify <command>`: Verification command
- `--max-retries <number>`: Maximum retries per task
- `--try-models <models>`: Progressive model/executor configs
- `--no-keep-branches`: Delete benchmark branches

### `task-o-matic benchmark workflow`

Benchmark complete workflow execution across multiple models.

```bash
task-o-matic benchmark workflow \
  --models "openai:gpt-4o,anthropic:claude-3-5-sonnet" \
  --concurrency 2 \
  --delay 2000 \
  --execute \
  --skip-all
```

**Options:**
All workflow options plus:
- `--models <list>`: Comma-separated list of models (required)
- `--concurrency <number>`: Max concurrent requests (default: 3)
- `--delay <number>`: Delay between requests (default: 1000)

### `task-o-matic benchmark list`

List all benchmark runs.

```bash
task-o-matic benchmark list
```

### `task-o-matic benchmark show <id>`

Show details of a benchmark run.

```bash
task-o-matic benchmark show <run-id>
```

### `task-o-matic benchmark compare <id>`

Compare benchmark results.

```bash
task-o-matic benchmark compare <run-id>
```

### `task-o-matic benchmark operations`

List all available benchmark operations.

```bash
task-o-matic benchmark operations
```

---

## 🔍 DETECT COMMAND

### `task-o-matic detect`

Detect technology stack of the current project.

```bash
# Auto-detect and save
task-o-matic detect --save

# Output as JSON
task-o-matic detect --json
```

**Options:**
- `--save`: Save detected stack to .task-o-matic/stack.json
- `--json`: Output result as JSON

---

## 📈 CONTINUE COMMAND

### `task-o-matic continue`

Continue working on an existing project.

```bash
# Show project status
task-o-matic continue --status

# Add new feature to PRD
task-o-matic continue --add-feature "Emergency notification system"

# Update PRD with progress
task-o-matic continue --update-prd

# Generate tasks for unimplemented features
task-o-matic continue --generate-tasks

# Generate implementation plan for remaining work
task-o-matic continue --generate-plan
```

**Options:**
- `--status`: Show project status overview
- `--add-feature <feature>`: Add a new feature to the PRD
- `--update-prd`: Update PRD with implementation progress
- `--generate-tasks`: Generate tasks for unimplemented features
- `--generate-plan`: Generate implementation plan for remaining work

---

## 💬 PROMPT COMMAND

### `task-o-matic prompt <name>`

Build AI service prompts with variable replacement for external tools.

```bash
# List available prompts
task-o-matic prompt --list

# Get PRD parsing prompt
task-o-matic prompt prd-parsing --prd-file ./requirements.md

# Get task enhancement prompt with full context
task-o-matic prompt task-enhancement \
  --task-file ./tasks/7.md \
  --full-context \
  --executor opencode

# Get prompt metadata
task-o-matic prompt --metadata prd-parsing
```

**Options:**
- `<name>`: Prompt name (e.g., prd-parsing, task-enhancement)
- `--type <type>`: Prompt type (system or user, default: user)
- `--list`: List all available prompts
- `--metadata <name>`: Show metadata for a specific prompt
- `--prd-content <content>`: PRD content
- `--prd-file <filepath>`: Load PRD content from file
- `--task-title <title>`: Task title
- `--task-description <description>`: Task description
- `--task-file <filepath>`: Load task description from file
- `--stack-info <info>`: Technology stack information
- `--context-info <info>`: Additional context information
- `--user-feedback <feedback>`: User feedback
- `--var <key=value>`: Custom variable
- `--full-context`: Include comprehensive project context
- `--executor <type>`: Format output for specific executor (opencode, claude, gemini, codex)

---

## 📦 INSTALL COMMAND

### `task-o-matic install <target>`

Install task-o-matic documentation and agent guides into current project.

```bash
# Install project documentation
task-o-matic install doc --force

# Install Claude Desktop agent guide
task-o-matic install claude

# Install generic agent guides
task-o-matic install agents --force
```

**Options:**
- `<target>`: Installation target (doc, claude, or agents) (required)
- `--force`: Overwrite existing files

---

## 🤖 AI PROVIDERS: CHOOSE YOUR MACHINE SPIRITS

| Provider | Strengths | Recommended For |
|----------|-----------|-----------------|
| **anthropic** | Strong reasoning, great with complexity | PRD parsing, task breakdown |
| **openai** | Balanced, fast | Task enhancement, code generation |
| **openrouter** | Access to many models, supports reasoning | Multi-model testing, finding optimal performer |
| **custom** | Any OpenAI-compatible endpoint | Proprietary or local models |

### Model Recommendations

- **PRD Parsing**: `anthropic:claude-3.5-sonnet` or `openai:gpt-4o`
- **Task Enhancement**: `openai:gpt-4o-mini` or `anthropic:claude-3-haiku`
- **Task Breakdown**: `anthropic:claude-3.5-sonnet`
- **Workflow Testing**: Use benchmarking. Let the data decide.

### Multi-AI Generation

Let multiple AI models compete and produce the best results together:

```bash
# For PRD creation
task-o-matic prd create "Build a vault manager" \
  --ai "anthropic:claude-3.5-sonnet,openai:gpt-4o,openrouter:qwen-2.5" \
  --combine-ai anthropic:claude-3.5-sonnet \
  --stream

# For PRD parsing
task-o-matic prd parse --file requirements.md \
  --ai "anthropic:claude-3.5-sonnet,openai:gpt-4o" \
  --combine-ai anthropic:claude-3.5-sonnet \
  --stream

# For task splitting
task-o-matic tasks split --task-id 7 \
  --ai "anthropic:claude-3.5-sonnet,openai:gpt-4o" \
  --stream
```

Competition among AI models produces superior results. Multiple models approach the same problem from different angles. The combination model synthesizes the best of all worlds.

---

## 🗺️ COMMON WORKFLOWS

### Workflow Alpha: From PRD to Tasks

```bash
# Initialize
task-o-matic init init

# Parse PRD
task-o-matic prd parse --file requirements.md --stream

# Review task tree
task-o-matic tasks tree

# Split large tasks
task-o-matic tasks split --all --stream

# Get next task
task-o-matic tasks get-next
```

### Workflow Beta: Project Bootstrapping

```bash
# Initialize AND bootstrap
task-o-matic init init --project-name my-shelter-manager \
  --ai-provider openrouter --ai-model anthropic/claude-3.5-sonnet \
  --frontend next --backend hono --database postgres --auth
```

### Workflow Gamma: Existing Project Adoption

```bash
# Attach with analysis
task-o-matic init attach --analyze --create-prd

# Review detected stack
cat .task-o-matic/stack.json

# Generate tasks for new features
task-o-matic tasks create --title "Add emergency alerts" --ai-enhance --stream
```

### Workflow Delta: AI Model Comparison

```bash
# Benchmark PRD parsing
task-o-matic benchmark run prd-parse \
  --file requirements.md \
  --models "openai:gpt-4o,anthropic:claude-3-5-sonnet" \
  --concurrency 2

# Benchmark entire workflow
task-o-matic benchmark workflow \
  --models "openai:gpt-4o,anthropic:claude-3-5-sonnet" \
  --execute --skip-all
```

### Workflow Epsilon: Task Execution with Retry

```bash
# Execute with progressive model retry
task-o-matic tasks execute --id 7 \
  --tool opencode \
  --plan --review \
  --verify "bun test" \
  --max-retries 3 \
  --try-models "gpt-4o-mini,gpt-4o,claude:sonnet-4" \
  --auto-commit
```

---

## ⚙️ ENVIRONMENT VARIABLES

```bash
# AI Provider API Keys
export OPENAI_API_KEY="your_openai_key"
export ANTHROPIC_API_KEY="your_anthropic_key"
export OPENROUTER_API_KEY="your_openrouter_key"
export CUSTOM_API_KEY="your_custom_key"
export CUSTOM_API_URL="https://api.custom.com/v1"
export CONTEXT7_API_KEY="your_context7_key"

# Default AI Configuration
export AI_PROVIDER="anthropic"
export AI_MODEL="claude-3-5-sonnet"
export AI_MAX_TOKENS="4000"
export AI_TEMPERATURE="0.5"
```

---

## 📁 STORAGE STRUCTURE

Everything lives in `.task-o-matic/`:

```
your-project/
├── .task-o-matic/
│   ├── config.json              # AI configuration
│   ├── stack.json              # Detected technology stack
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
│   │   └── {library-name}/  # Context7 library docs
│   │
│   ├── prd/                 # PRD versions and logs
│   │   ├── versions/        # PRD versioning history
│   │   ├── parsed-prd.json
│   │   └── (user prd files)
│   │
│   └── logs/                # Operation logs
└── your-project-files...
```

---

## ❓ FREQUENTLY ASKED QUESTIONS FROM THE FIELD

**Q: Can I skip the PRD phase?**

A: Technically, yes. But also, citizen, have you SEEN the results of "just starting coding"? It's not pretty. An unclear plan is worse than no plan. At least with no plan, you know you're doomed.

**Q: Do I really need to split ALL tasks?**

A: No, but remember: a task too large to finish in one sitting is a task that won't BE finished. Procrastination kills more projects than burnout.

**Q: What AI provider should I use?**

A: We recommend OpenRouter with `claude-4.5-sonnet` for quality, or `z-ai/glm-4.7` for economy. The AI doesn't care about your survival preferences. It just wants to help organize your bunker.

**Q: Can I add tasks manually?**

A: Absolutely. Use `tasks create` with or without `--ai-enhance`.

**Q: What if my project changes direction?**

A: Common occurrence, citizen. Use `prd rework` to update your PRD, then regenerate tasks. Flexibility is a survival trait.

**Q: How does task-o-matic handle dependencies?**

A: Tasks can specify parent-child relationships. The system tracks hierarchy and prevents circular dependencies. A project where everything depends on everything is a project that never completes.

---

## 📚 FURTHER READING: SURVIVAL MANUALS

For detailed information:
- [Configuration Guide](../../docs/configuration.md)
- [Task Management Guide](../../docs/tasks.md)
- [PRD Processing Guide](../../docs/prd.md)
- [Workflow Command Guide](../../docs/workflow-command.md)
- [AI Integration Guide](../../docs/ai-integration.md)
- [Project Initialization Guide](../../docs/projects.md)
- [Streaming Output Guide](../../docs/streaming.md)
- [Model Benchmarking Guide](../../docs/benchmarking.md)
- [Core Library API](../core/README.md)

---

## 🏁 FINAL REMINDER

**Remember:** A well-planned project is like a well-stocked bunker—both give you peace of mind when the world outside gets chaotic.

You now have everything you need to manage your projects in the post-apocalyptic development landscape. Go forth, citizen. Your code is counting on you.

[Stay organized. Stay safe. Survive.]

---

**DOCUMENT CONTROL:**
- **Version:** 1.0
- **Clearance:** All Personnel
- **Classification:** For Citizens' Eyes Only
