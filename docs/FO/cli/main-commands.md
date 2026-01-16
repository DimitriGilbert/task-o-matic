## TECHNICAL BULLETIN NO. 001
### MAIN COMMANDS - CORE FIELD OPERATIONS

**DOCUMENT ID:** `task-o-matic-cli-main-commands-v2`  
**CLEARANCE:** `All Personnel`  
**MANDATORY COMPLIANCE:** `Yes`

### ⚠️ CRITICAL SURVIVAL NOTICE
Citizen, ignoring these main commands is like wandering into the radioactive wastes without a geiger counter. These are your primary survival tools in the post-deadline wasteland. Master them or perish in the chaos of unmanaged projects.

### COMMAND ARCHITECTURE OVERVIEW
The main command structure represents the central nervous system of Task-O-Matic operations. Each command serves as a critical survival hub, coordinating different aspects of project management, AI integration, and workflow automation. The architecture follows a hierarchical pattern where main commands delegate to specialized subcommands, creating a modular and extensible system.

**Core Integration Points:**
- **Service Layer Integration**: All commands interface with core services (TaskService, PRDService, WorkflowService, Benchmark System)
- **AI Provider Abstraction**: Unified AI operations across multiple providers (OpenRouter, Anthropic, OpenAI, Custom endpoints)
- **Configuration Management**: Centralized config system with project-local overrides
- **Error Handling**: Standardized error reporting with TaskOMaticErrorCodes
- **Streaming Support**: Real-time AI output for enhanced user experience

### COMPLETE COMMAND DOCUMENTATION

## TASKS COMMAND
**Primary Command:** `task-o-matic tasks [subcommand] [options]`

### DESCRIPTION
The tasks command serves as the central hub for all task-related operations. It provides access to the complete task management lifecycle including creation, modification, execution, planning, and analysis. This is your primary interface for managing the hierarchical task structure that keeps projects organized in the wasteland.

### SUBCOMMANDS

#### `tasks create`
Create a new task with optional AI enhancement using Context7 documentation.

**Required Arguments:**
- `--title <title>`: Task title (required)

**Options:**
```bash
--content <content>        # Task content (supports markdown)
--effort <effort>         # Estimated effort: small, medium, large
--parent-id <id>          # Parent task ID for subtasks
--ai-enhance             # Enhance task with AI using Context7
--stream                  # Show streaming AI output during enhancement
--ai-provider <provider>    # AI provider override
--ai-model <model>         # AI model override
--ai-key <key>            # AI API key override
--ai-provider-url <url>     # AI provider URL override
--reasoning <tokens>       # Enable reasoning for OpenRouter models
```

**Examples:**
```bash
# Basic task
task-o-matic tasks create --title "Fix water filtration system"

# Task with content and enhancement
task-o-matic tasks create \
  --title "Add survivor tracking" \
  --content "Implement tracking system for all bunker residents" \
  --ai-enhance --stream

# Subtask with parent
task-o-matic tasks create \
  --title "Install sensor hardware" \
  --parent-id 1 --effort "large"
```

#### `tasks list`
List all tasks with filtering options.

**Options:**
```bash
--status <status>    # Filter by status: todo, in-progress, completed
--tag <tag>          # Filter by tag
```

**Examples:**
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

#### `tasks show`
Display detailed information about a task.

**Options:**
```bash
--id <id>    # Task ID to show (required)
```

**Examples:**
```bash
task-o-matic tasks show --id 7
```

#### `tasks update`
Update an existing task.

**Options:**
```bash
--id <id>                 # Task ID to update (required)
--title <title>             # New task title
--description <description>  # New task description
--status <status>           # New status: todo, in-progress, completed
--effort <effort>           # New estimated effort
--tags <tags>              # New tags (comma-separated)
```

**Examples:**
```bash
# Update status
task-o-matic tasks update --id 7 --status in-progress

# Update title and description
task-o-matic tasks update --id 7 --title "New title" --description "New description"

# Update effort and tags
task-o-matic tasks update --id 7 --effort "large" --tags critical,backend
```

#### `tasks delete`
Delete a task.

**Options:**
```bash
--id <id>       # Task ID to delete (required)
--force          # Skip confirmation prompt
--cascade        # Delete all subtasks
```

**Examples:**
```bash
# Delete with confirmation
task-o-matic tasks delete --id 7

# Force delete without confirmation
task-o-matic tasks delete --id 7 --force

# Delete task and all subtasks
task-o-matic tasks delete --id 7 --cascade
```

#### `tasks enhance`
Enhance an existing task with AI using Context7 documentation.

**Options:**
```bash
--task-id <id>              # Task ID to enhance
--all                        # Enhance all existing tasks
--status <status>            # Filter tasks by status
--tag <tag>                # Filter tasks by tag
--dry                        # Preview what would be enhanced
--force                      # Skip confirmation prompt
--stream                     # Show streaming AI output
--ai-provider <provider>      # AI provider override
--ai-model <model>           # AI model override
--ai-key <key>              # AI API key override
--ai-provider-url <url>       # AI provider URL override
--reasoning <tokens>         # Enable reasoning for OpenRouter models
```

**Examples:**
```bash
# Enhance single task
task-o-matic tasks enhance --task-id 7 --stream

# Enhance all tasks
task-o-matic tasks enhance --all --force --stream

# Enhance specific status/tag
task-o-matic tasks enhance --status todo --tag critical --dry
```

#### `tasks split`
Split a task into smaller subtasks using AI.

**Options:**
```bash
--task-id <id>                 # Task ID to split
--all                           # Split all existing tasks
--status <status>                 # Filter tasks by status
--tag <tag>                      # Filter tasks by tag
--dry                            # Preview what would be split
--force                          # Skip confirmation prompt
--stream                         # Show streaming AI output
--ai-provider <provider>          # AI provider override
--ai-key <key>                   # AI API key override
--ai-provider-url <url>           # AI provider URL override
--ai <models...>                # AI model(s) to use (comma-separated)
--combine-ai <provider:model>      # AI model to combine multiple split results
--reasoning <tokens>             # Enable reasoning for OpenRouter models
--tools                          # Enable filesystem tools for project analysis
```

**Multi-AI Splitting Examples:**
```bash
# Single task split
task-o-matic tasks split --task-id 7 --stream

# Split with multiple AI models
task-o-matic tasks split --task-id 7 \
  --ai "anthropic:claude-3.5-sonnet,openai:gpt-4o,openrouter:qwen-2.5" \
  --combine-ai anthropic:claude-3.5-sonnet \
  --stream

# Split all tasks with multi-AI
task-o-matic tasks split --all \
  --ai "openrouter:anthropic/claude-3.5-sonnet,openai:gpt-4o" \
  --combine-ai openrouter:anthropic/claude-3.5-sonnet \
  --stream
```

#### `tasks execute`
Execute a task using an external coding assistant.

**Required Arguments:**
- `--id <id>`: Task ID to execute (required)

**Options:**
```bash
--tool <tool>                      # External tool: opencode, claude, gemini, codex (default: opencode)
--message <message>                 # Custom message to send to tool
--model <model>                     # Model to use with executor
--continue-session                   # Continue last session (for error feedback)
--dry                               # Show what would be executed without running it
--validate <command>                 # Validation command (can be used multiple times)
--verify <command>                   # Alias for --validate (verification command)
--max-retries <number>              # Maximum number of retries (default: 3)
--try-models <models>              # Progressive model/executor configs (e.g., 'gpt-4o-mini,gpt-4o,claude:sonnet-4')
--plan                              # Generate an implementation plan before execution
--plan-model <model>                # Model/executor to use for planning (e.g., 'opencode:gpt-4o')
--plan-tool <tool>                  # Tool/Executor to use for planning (defaults to --tool)
--review-plan                      # Pause for human review of plan
--review                            # Run AI review after execution
--review-model <model>              # Model/executor to use for review (e.g., 'opencode:gpt-4o')
--auto-commit                       # Automatically commit changes after execution
--include-prd                      # Include PRD content in execution context
```

**Examples:**
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

# Multi-step execution with verification
task-o-matic tasks execute --id 7 \
  --plan --review-plan \
  --verify "bun test" \
  --verify "bun run build" \
  --include-prd
```

#### `tasks execute-loop`
Execute multiple tasks in a loop with retry logic.

**Options:**
```bash
--status <status>          # Filter tasks by status
--tag <tag>               # Filter tasks by tag
--ids <ids>               # Comma-separated list of task IDs
--tool <tool>              # External tool to use (default: opencode)
--max-retries <number>     # Maximum retries per task
--try-models <models>      # Progressive model/executor configs
--model <model>             # Model to force
--verify <command>          # Verification command (alias: --validate)
--validate <command>        # Alias for --verify
--message <message>          # Custom message
--continue-session          # Continue last session
--auto-commit              # Automatically commit changes
--plan                    # Generate implementation plan
--plan-model <model>       # Model for planning
--plan-tool <tool>        # Tool for planning
--review-plan              # Pause for human review of plan
--review                   # Run AI review after execution
--review-model <model>      # Model for review
--include-completed        # Include completed tasks
--include-prd             # Include PRD content
--notify <target>          # Notify on completion
--dry                      # Show what would be executed
```

**Examples:**
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

# Progressive model escalation
task-o-matic tasks execute-loop --status todo \
  --try-models "gpt-4o-mini,gpt-4o,claude:sonnet-4" \
  --verify "bun test" \
  --auto-commit
```

#### `tasks get-next`
Get the next task to work on.

**Options:**
```bash
--status <status>     # Filter by status
--tag <tag>          # Filter by tag
--effort <effort>    # Filter by effort
--priority <priority>  # Sort priority: newest, oldest, effort
```

**Examples:**
```bash
# Get next TODO task
task-o-matic tasks get-next --status todo

# Get next critical priority task
task-o-matic tasks get-next --tag critical

# Get shortest task
task-o-matic tasks get-next --priority effort
```

#### `tasks status`
Set task status.

**Options:**
```bash
--id <id>        # Task ID (required)
--status <status>   # New status: todo, in-progress, completed
```

**Examples:**
```bash
task-o-matic tasks status --id 7 --status in-progress
```

#### `tasks tree`
Display hierarchical task tree.

**Options:**
```bash
--id <id>    # Root task ID (optional - shows full tree if not specified)
```

**Examples:**
```bash
# Show full tree
task-o-matic tasks tree

# Show subtree starting from task 7
task-o-matic tasks tree --id 7
```

#### `tasks subtasks`
List subtasks for a task.

**Options:**
```bash
--id <id>    # Parent task ID (required)
```

**Examples:**
```bash
task-o-matic tasks subtasks --id 7
```

#### `tasks add-tags` / `tasks remove-tags`
Add or remove tags from a task.

**Options:**
```bash
--id <id>       # Task ID (required)
--tags <tags>   # Tags to add/remove (comma-separated)
```

**Examples:**
```bash
# Add tags
task-o-matic tasks add-tags --id 7 --tags critical,security

# Remove tags
task-o-matic tasks remove-tags --id 7 --tags deprecated
```

#### `tasks plan`
Create detailed implementation plan for a task.

**Subcommands:**
- `tasks plan [create]` - Create implementation plan
- `tasks plan list` - List all available plans
- `tasks plan get` - View existing plan
- `tasks plan set` - Set plan from text or file
- `tasks plan delete` - Delete implementation plan

**tasks plan create**
**Options:**
```bash
--id <id>       # Task or subtask ID (required)
--stream          # Show streaming AI output
--ai-provider <provider>      # AI provider override
--ai-model <model>           # AI model override
--ai-key <key>              # AI API key override
--ai-provider-url <url>       # AI provider URL override
--reasoning <tokens>         # Enable reasoning for OpenRouter models
```

**Examples:**
```bash
task-o-matic tasks plan --id 7 --stream
task-o-matic tasks plan list
task-o-matic tasks plan get --id 7
```

**tasks plan set**
**Options:**
```bash
--id <id>         # Task ID (required)
--plan <text>      # Plan content
--plan-file <path> # Path to file containing plan
```

**Examples:**
```bash
# Set from text
task-o-matic tasks plan set --id 7 --plan "Step 1: Setup\nStep 2: Implement\nStep 3: Test"

# Set from file
task-o-matic tasks plan set --id 7 --plan-file ./plans/implementation.md
```

**tasks plan delete**
**Options:**
```bash
--id <id>    # Task ID (required)
```

**Examples:**
```bash
task-o-matic tasks plan delete --id 7
```

#### `tasks document`
Analyze and fetch documentation for a task using AI with Context7.

**Subcommands:**
- `tasks document [analyze]` - Analyze and fetch documentation
- `tasks document get` - Get existing documentation
- `tasks document add` - Add documentation from file

**tasks document analyze**
**Options:**
```bash
--task-id <id>      # Task ID (required)
--force                # Force refresh documentation even if recent
--stream               # Show streaming AI output
--ai-provider <provider>      # AI provider override
--ai-model <model>           # AI model override
--ai-key <key>              # AI API key override
--ai-provider-url <url>       # AI provider URL override
--reasoning <tokens>         # Enable reasoning for OpenRouter models
```

**Examples:**
```bash
task-o-matic tasks document --task-id 7 --force --stream
```

**tasks document add**
**Options:**
```bash
--id <id>               # Task ID (required)
--doc-file <path>       # Path to documentation file (required)
--overwrite             # Overwrite existing documentation
```

**Examples:**
```bash
task-o-matic tasks document add --id 7 --doc-file ./docs/api.md
```

**tasks document get**
**Options:**
```bash
--id <id>    # Task ID (required)
```

**Examples:**
```bash
task-o-matic tasks document get --id 7
```

### RETURN VALUES
- **Success**: Returns task data or operation confirmation
- **Error**: Exits with code 1 and displays error message
- **Exit Codes**: 0 (success), 1 (error), 2 (validation error)

## WORKFLOW COMMAND
**Primary Command:** `task-o-matic workflow [options]`

### DESCRIPTION
The workflow command provides an interactive, step-by-step project setup and management experience. It guides citizens through the complete project lifecycle from initialization to task generation and splitting. This is your all-in-one survival kit for establishing new project bases in the wasteland.

### COMPREHENSIVE OPTIONS

#### AI Configuration Options
```bash
--stream                    # Show streaming AI output
--ai-provider <provider>    # AI provider override
--ai-model <model>          # AI model override
--ai-key <key>              # AI API key override
--ai-provider-url <url>     # AI provider URL override
```

#### Global Workflow Control
```bash
--skip-all                  # Skip all optional steps (use defaults)
--auto-accept               # Auto-accept all AI suggestions
--config-file <path>        # Load workflow options from JSON file
```

#### Step 1: Initialization Options
```bash
--skip-init                 # Skip initialization step
--project-name <name>       # Project name
--init-method <method>      # Initialization method: quick, custom, ai
--project-description <desc>  # Project description for AI-assisted init
--use-existing-config       # Use existing configuration if found
--include-docs             # Include Task-O-Matic documentation (default: true)
--no-include-docs         # Skip including documentation
```

#### Step 2: PRD Definition Options
```bash
--skip-prd                  # Skip PRD definition
--prd-method <method>       # PRD method: upload, manual, ai, skip
--prd-file <path>          # Path to existing PRD file
--prd-description <desc>    # Product description for AI-assisted PRD
--prd-content <content>     # Direct PRD content
--prd-multi-generation       # Generate multiple PRDs and compare
--skip-prd-multi-generation # Skip PRD multi-generation
--prd-multi-generation-models <models>  # Comma-separated list of models for multi-generation
--prd-combine              # Combine generated PRDs into master PRD
--skip-prd-combine         # Skip PRD combination
--prd-combine-model <model> # Model to use for combining PRDs (provider:model)
```

#### Step 2.4: Stack Suggestion Options
```bash
--skip-stack-suggestion     # Skip stack suggestion step
--suggest-stack-from-prd [path]  # Get stack from PRD (path or current)
```

#### Step 3: Bootstrap Options
```bash
--skip-bootstrap           # Skip bootstrap step
--frontend <framework>     # Frontend framework
--backend <framework>      # Backend framework
--database <db>           # Database choice
--auth                     # Include authentication
--no-auth                  # Exclude authentication
```

#### Step 4: PRD Question/Refine Options
```bash
--skip-prd-question-refine  # Skip PRD question/refine step
--prd-question-refine       # Use question-based PRD refinement
--prd-answer-mode <mode>    # Who answers questions: user, ai
--prd-answer-ai-provider <provider>  # AI provider for answering
--prd-answer-ai-model <model>       # AI model for answering
--prd-answer-ai-reasoning            # Enable reasoning for AI answering model
```

#### Step 5: PRD Refinement Options
```bash
--skip-refine              # Skip PRD refinement
--refine-method <method>   # Refinement method: manual, ai, skip
--refine-feedback <feedback> # Feedback for AI refinement
```

#### Step 6: Task Generation Options
```bash
--skip-generate            # Skip task generation
--generate-method <method>  # Generation method: standard, ai
--generate-instructions <instructions>  # Custom task generation instructions
```

#### Step 7: Task Splitting Options
```bash
--skip-split               # Skip task splitting
--split-tasks <ids>       # Comma-separated task IDs to split
--split-all                 # Split all tasks
--split-method <method>    # Split method: interactive, standard, custom
--split-instructions <instructions>  # Custom split instructions
```

#### Step 8: Task Execution Options
```bash
--execute                           # Execute generated tasks immediately
--execute-concurrency <number>      # Number of concurrent tasks (default: 1)
--no-auto-commit                   # Disable auto-commit during execution
--execute-tool <tool>             # Executor tool (opencode/claude/gemini/codex)
--execute-model <model>            # Model override for execution
--execute-max-retries <number>    # Max retries per task
--execute-plan                     # Enable planning phase
--execute-plan-model <model>        # Model for planning
--execute-review                   # Enable review phase
--execute-review-model <model>       # Model for review
--verify <command>                 # Verification command (can be used multiple times)
--validate <command>               # Alias for --verify (validation command)
--try-models <models>             # Progressive model/executor configs
```

### WORKFLOW EXECUTION EXAMPLES

#### Basic Workflow
```bash
# Interactive workflow with all steps
task-o-matic workflow

# Quick workflow with defaults
task-o-matic workflow --skip-all --auto-accept
```

#### Advanced Workflow Configuration
```bash
# Custom workflow with specific AI models
task-o-matic workflow \
  --ai-provider anthropic \
  --ai-model claude-3.5-sonnet \
  --skip-all \
  --auto-accept \
  --execute
```

#### Workflow with Configuration File
```bash
# Save workflow configuration to JSON file
cat > workflow-config.json << EOF
{
  "projectName": "Wasteland Communications",
  "initMethod": "ai",
  "projectDescription": "Emergency communication system",
  "prdMethod": "ai",
  "prdDescription": "Build a resilient communication network",
  "skipRefine": false,
  "generateMethod": "ai",
  "splitAll": true,
  "aiProvider": "anthropic",
  "aiModel": "claude-3.5-sonnet",
  "execute": true,
  "verify": ["bun test", "bun run build"]
}
EOF

# Run workflow with configuration
task-o-matic workflow --config-file workflow-config.json
```

### WORKFLOW STEPS BREAKDOWN

#### Step 1: Project Initialization
- **Purpose**: Set up project structure and basic configuration
- **Methods**: 
  - `quick`: Use recommended defaults
  - `custom`: Manually select stack components
  - `ai`: AI-assisted configuration based on description
- **Output**: Project directory with configuration files

#### Step 2: PRD Definition
- **Purpose**: Create or import Product Requirements Document
- **Methods**:
  - `upload`: Import existing PRD file
  - `manual`: Open editor for manual PRD creation
  - `ai`: AI-generated PRD from description
  - `skip`: Use existing PRD
- **Features**: Multi-model generation and comparison

#### Step 2.4: Stack Suggestion
- **Purpose**: Get AI-recommended technology stack from PRD analysis
- **Integration**: Automatically provides stack configuration for bootstrap step
- **Output**: Suggested frontend, backend, database, auth, runtime

#### Step 3: Bootstrap
- **Purpose**: Bootstrap project with suggested or custom stack using Better-T-Stack
- **Input**: Stack from suggestion step or custom configuration
- **Output**: Full project structure with selected frameworks

#### Step 4: PRD Question/Refine
- **Purpose**: Clarify PRD requirements through Q&A
- **Answer Modes**:
  - `user`: Interactive user answers
  - `ai`: AI answers based on project context
- **Integration**: Automatically refines PRD with answers

#### Step 5: PRD Refinement
- **Purpose**: Improve PRD quality based on feedback
- **Methods**:
  - `manual`: Direct editing in editor
  - `ai`: AI-assisted refinement with feedback
  - `skip`: Skip refinement step

#### Step 6: Task Generation
- **Purpose**: Convert PRD into actionable tasks
- **Methods**:
  - `standard`: Rule-based parsing
  - `ai`: AI-powered task generation with custom instructions

#### Step 7: Task Splitting
- **Purpose**: Break complex tasks into manageable subtasks
- **Methods**:
  - `interactive`: Ask for each task individually
  - `standard`: Apply standard AI splitting to all
  - `custom`: Use custom instructions for all tasks

#### Step 8: Task Execution (NEW)
- **Purpose**: Execute generated tasks using external AI tools
- **Features**:
  - Concurrent execution support
  - Progressive model retry with `--try-models`
  - Planning phase before execution
  - Review phase after execution
  - Verification commands
  - Auto-commit support
- **Tools Supported**: opencode, claude, gemini, codex

### ERROR CONDITIONS AND EXCEPTIONS

#### Common Workflow Errors
```bash
# Configuration file not found
Error: Config file not found: workflow-config.json
Solution: Ensure file exists and is readable

# Invalid model format
Error: Invalid model format: invalid-model. Expected provider:model
Solution: Use format "anthropic:claude-3.5-sonnet"

# Missing required options
Error: Project name is required for AI initialization
Solution: Provide --project-name or use interactive mode

# Bootstrap failure
Error: Bootstrap process failed
Solution: Check better-t-stack-cli installation and network connectivity
```

#### Recovery Procedures
1. **Configuration Recovery**: Use `--config-file` with backup configuration
2. **Step Skipping**: Use specific `--skip-*` flags to bypass problematic steps
3. **AI Provider Fallback**: Override with `--ai-provider` and `--ai-model`
4. **Partial Recovery**: Continue from failed step using workflow subcommands

### TECHNICAL SPECIFICATIONS

#### Performance Characteristics
- **Initialization Time**: 2-5 minutes (depends on bootstrap complexity)
- **PRD Generation**: 30-120 seconds per model
- **Task Generation**: 10-60 seconds
- **Task Splitting**: 15-90 seconds per task
- **Memory Usage**: 100-500MB (depends on AI model and project size)

#### Resource Requirements
- **Minimum**: 2GB RAM, 1GB disk space
- **Recommended**: 4GB RAM, 5GB disk space
- **Network**: Required for AI operations and bootstrap

#### Integration Points
- **Better-T-Stack CLI**: Project bootstrapping
- **AI Services**: OpenRouter, Anthropic, OpenAI, Custom endpoints
- **Context7 MCP**: Documentation retrieval and enhancement
- **Git**: Version control integration
- **File System**: Local storage in `.task-o-matic/` directory

## PRD COMMAND
**Primary Command:** `task-o-matic prd [subcommand] [options]`

### DESCRIPTION
The PRD command provides comprehensive Product Requirements Document management capabilities. It supports creation, parsing, refinement, and analysis of PRDs using AI assistance. This is your strategic planning tool for defining project requirements before diving into implementation.

### SUBCOMMANDS AND COMPREHENSIVE OPTIONS

#### CREATE SUBCOMMAND
```bash
task-o-matic prd create <description> [options]
```

**Required Arguments:**
- `description`: Product description for PRD generation

**Options:**
```bash
--ai <models...>       # AI model(s) to use (can specify multiple)
--combine-ai <provider:model> # AI model to combine multiple PRDs
--output-dir <path>      # Directory to save PRDs (default: .task-o-matic/prd)
--ai-reasoning <tokens> # Enable reasoning for OpenRouter models
--stream                  # Enable streaming output (single AI only)
```

**Multi-Model Generation Examples:**
```bash
# Single model PRD generation
task-o-matic prd create "Emergency shelter system" \
  --ai "anthropic:claude-3.5-sonnet" \
  --stream

# Multi-model comparison
task-o-matic prd create "Water purification system" \
  --ai "anthropic:claude-3.5-sonnet,openai:gpt-4,google:gemini-pro" \
  --combine-ai anthropic:claude-3.5-sonnet

# Custom output directory
task-o-matic prd create "Survival tracking app" \
  --ai openrouter:anthropic/claude-3.5-sonnet \
  --output-dir ./requirements
```

#### COMBINE SUBCOMMAND
```bash
task-o-matic prd combine [options]
```

**Required Options:**
```bash
--files <paths...>         # PRD files to combine
--description <text>         # Original product description
--ai <provider:model>       # AI model to use for combining
```

**Optional Options:**
```bash
--output <path>              # Output file path (default: prd-master.md)
--ai-reasoning <tokens>     # Enable reasoning for OpenRouter models
--stream                     # Enable streaming output
```

**Combination Examples:**
```bash
# Combine multiple PRD files
task-o-matic prd combine \
  --files prd1.md prd2.md prd3.md \
  --description "Emergency response system" \
  --ai anthropic:claude-3.5-sonnet \
  --output combined-prd.md

# Stream combination process
task-o-matic prd combine \
  --files ./drafts/*.md \
  --description "Medical supply tracking" \
  --ai openai:gpt-4 \
  --stream
```

#### PARSE SUBCOMMAND
```bash
task-o-matic prd parse [options]
```

**Required Options:**
```bash
--file <path>    # Path to PRD file
```

**AI Configuration Options:**
```bash
--ai <models...>              # AI model(s) to use
--combine-ai <provider:model>   # AI model to combine multiple parse results
--ai-provider <provider>      # AI provider override
--ai-model <model>           # AI model override
--ai-key <key>              # AI API key override
--ai-provider-url <url>       # AI provider URL override
--ai-reasoning <tokens>      # Enable reasoning for OpenRouter models
--stream                     # Show streaming AI output
--tools                      # Enable filesystem tools for project analysis
```

**Content Override Options:**
```bash
--prompt <prompt>       # Override prompt
--message <message>     # User message
```

**Parsing Examples:**
```bash
# Basic PRD parsing
task-o-matic prd parse --file ./requirements.md

# Advanced parsing with AI enhancement
task-o-matic prd parse \
  --file ./emergency-shelter-prd.md \
  --ai-provider anthropic \
  --ai-model claude-3.5-sonnet \
  --tools \
  --stream

# Custom parsing with reasoning
task-o-matic prd parse \
  --file ./complex-requirements.md \
  --ai-provider openrouter \
  --ai-model anthropic/claude-3.5-sonnet \
  --ai-reasoning 2048 \
  --prompt "Focus on technical implementation details"

# Multi-AI parsing with combination
task-o-matic prd parse \
  --file ./requirements.md \
  --ai "anthropic:claude-3.5-sonnet,openai:gpt-4o,openrouter:qwen-2.5" \
  --combine-ai anthropic:claude-3.5-sonnet \
  --stream
```

#### REWORK SUBCOMMAND
```bash
task-o-matic prd rework [options]
```

**Required Options:**
```bash
--file <path>       # Path to PRD file
--feedback <feedback> # User feedback for improvements
```

**Optional Options:**
```bash
--output <path>              # Output file path (default: overwrite original)
--prompt <prompt>            # Override prompt
--message <message>          # User message
--ai-provider <provider>      # AI provider override
--ai-model <model>           # AI model override
--ai-key <key>              # AI API key override
--ai-provider-url <url>       # AI provider URL override
--ai-reasoning <tokens>      # Enable reasoning for OpenRouter models
--stream                     # Show streaming AI output
--tools                      # Enable filesystem tools for project analysis
```

**Rework Examples:**
```bash
# Basic PRD rework
task-o-matic prd rework \
  --file ./draft-prd.md \
  --feedback "Add more technical specifications and API details"

# Advanced rework with AI enhancement
task-o-matic prd rework \
  --file ./requirements.md \
  --feedback "Focus on security requirements and compliance" \
  --ai-provider anthropic \
  --ai-model claude-3.5-sonnet \
  --tools \
  --stream \
  --output ./improved-requirements.md
```

#### QUESTION SUBCOMMAND
```bash
task-o-matic prd question [options]
```

**Required Options:**
```bash
--file <path>    # Path to PRD file
```

**Optional Options:**
```bash
--output <path>              # Output JSON file path (default: prd-questions.json)
--prompt <prompt>            # Override prompt
--message <message>          # User message
--ai-provider <provider>      # AI provider override
--ai-model <model>           # AI model override
--ai-key <key>              # AI API key override
--ai-provider-url <url>       # AI provider URL override
--ai-reasoning <tokens>      # Enable reasoning for OpenRouter models
--stream                     # Show streaming AI output
--tools                      # Enable filesystem tools for project analysis
```

**Question Generation Examples:**
```bash
# Generate clarifying questions
task-o-matic prd question --file ./requirements.md

# Advanced question generation
task-o-matic prd question \
  --file ./complex-prd.md \
  --ai-provider anthropic \
  --ai-model claude-3.5-sonnet \
  --tools \
  --stream \
  --output ./clarification-questions.json
```

#### REFINE SUBCOMMAND
```bash
task-o-matic prd refine [options]
```

**Required Options:**
```bash
--file <path>    # Path to PRD file
```

**Optional Options:**
```bash
--questions <path>           # Path to questions JSON file
--output <path>             # Output file path (default: overwrite original)
--prompt <prompt>            # Override prompt
--message <message>          # User message
--ai-provider <provider>      # AI provider override
--ai-model <model>           # AI model override
--ai-key <key>              # AI API key override
--ai-provider-url <url>       # AI provider URL override
--ai-reasoning <tokens>      # Enable reasoning for OpenRouter models
--stream                     # Show streaming AI output
--tools                      # Enable filesystem tools for project analysis
```

**Refinement Examples:**
```bash
# Interactive refinement
task-o-matic prd refine --file ./requirements.md

# Refinement with custom questions
task-o-matic prd refine \
  --file ./draft-prd.md \
  --questions ./custom-questions.json \
  --ai-provider anthropic \
  --ai-model claude-3.5-sonnet \
  --stream
```

#### GET-STACK SUBCOMMAND (NEW)
```bash
task-o-matic prd get-stack [options]
```

**Description**: Suggest optimal technology stack based on PRD analysis.

**Options:**
```bash
--file <path>                # Path to PRD file
--content <text>              # PRD content as string (mutually exclusive with --file)
--project-name <name>          # Project name (inferred from PRD if not provided)
--save                         # Save suggested stack to .task-o-matic/stack.json
--output <path>                # Custom output path (implies --save)
--json                         # Output result as JSON
--prompt <prompt>             # Override prompt
--message <message>           # User message
--ai-provider <provider>      # AI provider override
--ai-model <model>           # AI model override
--ai-key <key>              # AI API key override
--ai-provider-url <url>       # AI provider URL override
--ai-reasoning <tokens>      # Enable reasoning for OpenRouter models
--stream                     # Show streaming AI output
--tools                      # Enable filesystem tools for project analysis
```

**Stack Suggestion Examples:**
```bash
# Analyze from file
task-o-matic prd get-stack --file ./requirements.md --save --json

# Analyze from content
task-o-matic prd get-stack \
  --content "Vault management system" \
  --project-name vault-manager \
  --save

# Full analysis with streaming
task-o-matic prd get-stack \
  --file ./requirements.md \
  --stream \
  --tools
```

#### GENERATE SUBCOMMAND (NEW)
```bash
task-o-matic prd generate [options]
```

**Description**: Generate a PRD from an existing codebase (reverse-engineering).

**Options:**
```bash
--output <filename>       # Output filename (default: current-state.md)
--ai <provider:model>     # AI model to use. Format: [provider:]model[;reasoning[=budget]]
--ai-reasoning <tokens>   # Enable reasoning for OpenRouter models (max reasoning tokens)
--stream                     # Enable streaming output
--tools                      # Enable filesystem tools for deeper analysis
--json                       # Output result as JSON
```

**Reverse-Engineering Examples:**
```bash
# Generate PRD from codebase
task-o-matic prd generate --output ./generated-prd.md --stream --tools

# Use specific AI model
task-o-matic prd generate \
  --ai "anthropic:claude-3.5-sonnet" \
  --output ./prd-from-codebase.md \
  --stream

# JSON output
task-o-matic prd generate --output prd.md --json
```

### PRD COMMAND ERROR HANDLING

#### Common Error Conditions
```bash
# File not found
Error: ENOENT: no such file or directory, open 'requirements.md'
Solution: Verify file path and permissions

# Invalid model format
Error: Invalid model format: invalid-model. Expected provider:model
Solution: Use format "anthropic:claude-3.5-sonnet"

# Missing required arguments
Error: Missing required argument: description
Solution: Provide product description for create command

# AI provider errors
Error: Failed to connect to AI provider
Solution: Check API keys, network connectivity, and provider status
```

#### Recovery Strategies
1. **File Validation**: Verify PRD file exists and is readable
2. **Model Format**: Ensure correct provider:model format
3. **API Key Validation**: Check environment variables or config
4. **Network Connectivity**: Verify internet connection for AI operations
5. **Fallback Models**: Use alternative AI providers if primary fails

### TECHNICAL SPECIFICATIONS

#### PRD Processing Pipeline
1. **Content Analysis**: Parse and understand PRD structure
2. **Context Enhancement**: Add project and stack information
3. **AI Processing**: Send to configured AI model
4. **Result Validation**: Verify output quality and completeness
5. **Storage**: Save results to appropriate locations

#### Performance Metrics
- **Single PRD Generation**: 30-120 seconds
- **Multi-Model Generation**: 60-300 seconds (concurrent)
- **PRD Parsing**: 15-60 seconds
- **PRD Rework**: 30-90 seconds
- **Question Generation**: 20-45 seconds
- **Stack Suggestion**: 30-90 seconds
- **Reverse-Engineering**: 60-180 seconds

#### Storage Requirements
- **PRD Files**: 10-100KB per document
- **Generated Questions**: 5-20KB per set
- **AI Metadata**: 1-5KB per operation
- **Cache Data**: 50-200MB for documentation cache

## BENCHMARK COMMAND
**Primary Command:** `task-o-matic bench [subcommand] [options]`
**Alias:** `task-o-matic benchmark`

### DESCRIPTION
The benchmark command provides comprehensive AI model performance testing and comparison capabilities. It uses parallel execution with **git worktrees** to benchmark multiple models simultaneously. This is your intelligence-gathering tool for optimizing AI operations in the wasteland.

### SUBCOMMANDS

#### `bench run`
Run a new benchmark.

**Usage:**
```bash
task-o-matic bench run <type> [options]
```

**Types:**
- `execution`: Benchmark a single task execution
- `execute-loop`: Benchmark a batch of tasks (e.g., all TODO tasks)
- `operation`: Benchmark an internal operation (prd-parse, task-create, etc.)
- `workflow`: Benchmark a full project workflow

**Required Options:**
- `--models <models...>`: List of models to benchmark (e.g., `openai:gpt-4o`, `anthropic:claude-3-5-sonnet`)

**General Options:**
- `--concurrency <n>`: Max parallel worktrees (default: unlimited)
- `--base-commit <commit>`: Base commit to start from
- `--max-retries <n>`: Max retries per task (default: 3)
- `--verify <commands...>`: Verification commands (e.g., `bun test`)

**Type-Specific Options:**
- `--task <id>`: Task ID (required for `execution`)
- `--status <status>`: Task status filter (for `execute-loop`)
- `--operation <id>`: Operation ID (required for `operation`)
- `--file <path>`: Input file (for `operation`)

**Examples:**
```bash
# Compare models on a single task
task-o-matic bench run execution \
  --task 7 \
  --models openai:gpt-4o anthropic:claude-3-5-sonnet \
  --verify "bun test"

# Benchmark PRD parsing
task-o-matic bench run operation \
  --operation prd-parse \
  --file requirements.md \
  --models openai:gpt-4o anthropic:claude-3-5-sonnet
```

#### `bench list`
List past benchmark runs.

**Options:**
- `--type <type>`: Filter by benchmark type
- `--status <status>`: Filter by status
- `--limit <n>`: Limit number of results (default: 10)

**Example:**
```bash
task-o-matic bench list --limit 5
```

#### `bench show`
Show detailed results for a specific run.

**Usage:**
```bash
task-o-matic bench show <run-id>
```

#### `bench score`
Manually score a model's result.

**Usage:**
```bash
task-o-matic bench score <run-id> --model <model-id> --score <1-5> [--note <text>]
```

**Example:**
```bash
task-o-matic bench score bench-exec-123 --model anthropic:claude-3-5-sonnet --score 5 --note "Perfect implementation"
```

#### `bench worktrees`
Manage benchmark worktrees.

**Subcommands:**
- `list`: List active worktrees
- `cleanup <run-id>`: Remove worktrees for a run

**Example:**
```bash
# View active worktrees
task-o-matic bench worktrees list

# Clean up after inspection
task-o-matic bench worktrees cleanup bench-exec-123
```

#### `bench compare`
Compare results across models (Visualizer placeholder).

**Usage:**
```bash
task-o-matic bench compare <run-id>
```

### BENCHMARK PERFORMANCE METRICS

#### Measured Metrics
- **Duration**: Total execution time
- **Code Metrics**: Lines added/removed, files changed
- **Verification**: Test pass/fail status, build success
- **Tokens/Cost**: Token usage and estimated cost (if available)

### BENCHMARK ERROR HANDLING

#### Common Errors
```bash
# Worktree conflict
Error: Worktree path already exists
Solution: Run 'bench worktrees cleanup' for the previous run

# Model format
Error: Invalid model format
Solution: Use provider:model format (e.g., openai:gpt-4o)
```

### TECHNICAL SPECIFICATIONS

#### Benchmark Architecture
1. **Configuration Parsing**: Validate models and options
2. **Concurrent Execution**: Run models in parallel with rate limiting
3. **Progress Tracking**: Real-time status updates
4. **Result Collection**: Gather metrics and outputs
5. **Analysis**: Compare and analyze results
6. **Storage**: Save results for later review

#### Performance Characteristics
- **Concurrent Models**: Up to 10 models simultaneously
- **Request Rate**: Configurable delay between requests
- **Memory Usage**: 50-200MB per concurrent model
- **Storage**: 1-10MB per benchmark run

#### Resource Requirements
- **Minimum**: 2GB RAM, stable internet connection
- **Recommended**: 4GB RAM, high-speed internet
- **API Limits**: Respect provider rate limits
- **Disk Space**: 100MB for benchmark history

## CONFIG COMMAND
**Primary Command:** `task-o-matic config [subcommand] [options]`

### DESCRIPTION
The config command provides comprehensive configuration management for Task-O-Matic projects. It handles AI provider settings, project information, and system configuration. This is your control panel for customizing Task-O-Matic behavior in the wasteland.

### SUBCOMMANDS AND OPTIONS

#### GET-AI-CONFIG SUBCOMMAND
```bash
task-o-matic config get-ai-config
```

**Description**: Displays current AI configuration including provider, model, and settings.

**Example Output:**
```json
{
  "provider": "openrouter",
  "model": "anthropic/claude-3.5-sonnet",
  "maxTokens": 32768,
  "temperature": 0.5,
  "apiKey": "***hidden***",
  "baseURL": "https://openrouter.ai/api/v1"
}
```

#### SET-AI-PROVIDER SUBCOMMAND
```bash
task-o-matic config set-ai-provider <provider> [model]
```

**Arguments:**
- `provider`: AI provider (openrouter, openai, anthropic, custom)
- `model`: AI model (optional)

**Examples:**
```bash
# Set provider only
task-o-matic config set-ai-provider openrouter

# Set provider and model
task-o-matic config set-ai-provider anthropic claude-3.5-sonnet

# Set custom provider
task-o-matic config set-ai-provider custom gpt-4
```

#### INFO SUBCOMMAND
```bash
task-o-matic config info
```

**Description**: Displays comprehensive project information including directory structure, configuration status, and system details.

**Example Output:**
```
Task-o-matic Project Info:
  Project Directory: /home/user/wasteland-shelter
  .task-o-matic dir: /home/user/wasteland-shelter/.task-o-matic
  ✓ Config file found: /home/user/wasteland-shelter/.task-o-matic/config.json
  {
    "ai": {
      "provider": "openrouter",
      "model": "anthropic/claude-3.5-sonnet",
      "maxTokens": 32768,
      "temperature": 0.5
    }
  }
```

### CONFIGURATION FILE STRUCTURE

#### Main Config File (.task-o-matic/config.json)
```json
{
  "ai": {
    "provider": "openrouter",
    "model": "anthropic/claude-3.5-sonnet",
    "maxTokens": 32768,
    "temperature": 0.5,
    "apiKey": "sk-or-v1-...",
    "baseURL": "https://openrouter.ai/api/v1"
  },
  "project": {
    "name": "Wasteland Shelter",
    "version": "1.0.0",
    "description": "Emergency shelter management system"
  },
  "storage": {
    "type": "filesystem",
    "path": ".task-o-matic"
  }
}
```

#### MCP Config File (.task-o-matic/mcp.json)
```json
{
  "context7": {
    "apiKey": "c7-...",
    "cache": {
      "enabled": true,
      "ttl": 86400
    }
  }
}
```

### CONFIGURATION ERROR HANDLING

#### Common Configuration Errors
```bash
# Config file not found
Error: Not a task-o-matic project
Solution: Run 'task-o-matic init init' first

# Invalid provider
Error: Unknown AI provider: invalid-provider
Solution: Use valid provider: openrouter, openai, anthropic, custom

# Missing API key
Error: API key not configured
Solution: Set API key via environment variable or config

# Invalid JSON
Error: Invalid configuration file format
Solution: Validate JSON syntax and structure
```

#### Configuration Recovery
1. **Reinitialization**: Run `task-o-matic init init` to recreate config
2. **Manual Repair**: Edit config.json with valid JSON
3. **Environment Override**: Use environment variables for temporary fixes
4. **Provider Switch**: Change to working AI provider

### TECHNICAL SPECIFICATIONS

#### Configuration Hierarchy
1. **Environment Variables**: Highest priority
2. **Project Config**: .task-o-matic/config.json
3. **Global Config**: ~/.task-o-matic/config.json
4. **Default Values**: Fallback settings

#### Supported AI Providers
- **OpenRouter**: Multi-provider access with extensive model selection
- **Anthropic**: Direct Claude model access
- **OpenAI**: Direct GPT model access
- **Custom**: Configurable endpoints for self-hosted or special providers

#### Configuration Validation
- **Provider Validation**: Check provider availability
- **Model Validation**: Verify model exists for provider
- **API Key Validation**: Test authentication
- **Network Connectivity**: Verify endpoint accessibility

## INIT COMMAND
**Primary Command:** `task-o-matic init [subcommand] [options]`

### DESCRIPTION
The init command provides comprehensive project initialization and bootstrapping capabilities. It supports both Task-O-Matic project setup and full-stack application bootstrapping using Better-T-Stack. This is your foundation-building tool for establishing new project bases in the wasteland.

### SUBCOMMANDS AND COMPREHENSIVE OPTIONS

#### INIT SUBCOMMAND
```bash
task-o-matic init init [options]
```

**AI Configuration Options:**
```bash
--ai-provider <provider>     # AI provider (openrouter/anthropic/openai/custom, default: openrouter)
--ai-model <model>           # AI model (default: z-ai/glm-4.6)
--ai-key <key>               # AI API key
--ai-provider-url <url>      # AI provider URL
--max-tokens <tokens>        # Max tokens for AI (min 32768 for 2025, default: 32768)
--temperature <temp>         # AI temperature (default: 0.5)
```

**Bootstrap Options:**
```bash
--no-bootstrap               # Skip bootstrap after initialization
--project-name <name>        # Project name for bootstrap
--frontend <frontends...>    # Frontend framework(s) - space/comma-separated (default: next)
--backend <backend>           # Backend framework for bootstrap (default: convex)
--database <database>         # Database for bootstrap
--auth <auth>                # Authentication for bootstrap (default: better-auth)
--context7-api-key <key>     # Context7 API key
--directory <dir>            # Working directory for the project
--package-manager <pm>       # Package manager (npm/pnpm/bun, default: npm)
--runtime <runtime>           # Runtime (bun/node, default: node)
--payment <payment>           # Payment provider (none/polar, default: none)
--cli-deps <level>           # CLI dependency level (minimal/standard/full/task-o-matic, default: standard)
```

**Initialization Examples:**
```bash
# Basic initialization
task-o-matic init init

# Initialization with custom AI settings
task-o-matic init init \
  --ai-provider anthropic \
  --ai-model claude-3.5-sonnet \
  --max-tokens 65536 \
  --temperature 0.3

# Full project setup with bootstrap
task-o-matic init init \
  --project-name "wasteland-shelter" \
  --ai-provider openrouter \
  --ai-model anthropic/claude-3.5-sonnet \
  --frontend next \
  --backend hono \
  --database postgres \
  --auth better-auth

# Custom directory setup
task-o-matic init init \
  --directory ./projects/shelter-system \
  --project-name "shelter-system" \
  --no-bootstrap
```

#### BOOTSTRAP SUBCOMMAND
```bash
task-o-matic init bootstrap <name> [options]
```

**Required Arguments:**
- `name`: Project name

**Framework Options:**
```bash
--frontend <frontends...>    # Frontend framework(s) - multiple values supported
--backend <backend>           # Backend framework (hono/express/fastify/elysia/convex)
--database <database>         # Database (sqlite/postgres/mysql/mongodb/none)
--orm <orm>                # ORM (drizzle/prisma/mongoose/none, default: drizzle)
--no-auth                    # Exclude authentication
--auth <auth>                # Authentication (better-auth/clerk/none)
--addons <addons...>          # Addons (pwa/tauri/starlight/biome/husky/turborepo)
--examples <examples...>       # Examples to include (todo/ai)
--template <template>          # Use predefined template (mern/pern/t3/uniwind/none)
--no-git                     # Skip git initialization
--package-manager <pm>       # Package manager (npm/pnpm/bun, default: npm)
--no-install                 # Skip installing dependencies
--db-setup <setup>           # Database setup (turso/neon/prisma-postgres/mongodb-atlas)
--runtime <runtime>           # Runtime (bun/node, default: node)
--api <type>                 # API type (trpc/orpc)
--payment <payment>           # Payment provider (none/polar, default: none)
--cli-deps <level>           # CLI dependency level (minimal/standard/full/task-o-matic, default: standard)
```

**Frontend Framework Options:**
- **Web**: next, tanstack-router, react-router, nuxt, svelte, solid
- **Native**: native-bare, native-uniwind, native-unistyles
- **Custom**: cli, tui

**Bootstrap Examples:**
```bash
# Simple web application
task-o-matic init bootstrap shelter-app \
  --frontend next \
  --backend hono \
  --database sqlite \
  --auth

# Full-stack monorepo with multiple frontends
task-o-matic init bootstrap "wasteland-platform" \
  --frontend "next native-bare cli tui" \
  --backend hono \
  --database postgres \
  --orm drizzle \
  --addons "pwa tauri biome" \
  --examples "todo ai"

# CLI application
task-o-matic init bootstrap "shelter-cli" \
  --backend hono \
  --database sqlite \
  --no-auth \
  --cli-deps full \
  --package-manager bun \
  --runtime bun

# TUI application
task-o-matic init bootstrap "shelter-tui" \
  --frontend tui \
  --package-manager pnpm
```

#### ATTACH SUBCOMMAND (NEW)
```bash
task-o-matic init attach [options]
```

**Description**: Attach the command bunker to an existing project with automatic stack detection.

**Options:**
```bash
--analyze                   # Run full project analysis including TODOs and features
--create-prd               # Auto-generate a PRD from codebase analysis
--dry-run                   # Just detect, don't create files
--redetect                 # Force re-detection of stack (overwrites cached stack.json)
--ai-provider <provider>     # AI provider (openrouter/anthropic/openai/custom)
--ai-model <model>           # AI model (default: z-ai/glm-4.6)
--ai-key <key>              # AI API key
--ai-provider-url <url>       # AI provider URL
--max-tokens <tokens>        # Max tokens for AI (default: 32768)
--temperature <temp>         # AI temperature (default: 0.5)
--context7-api-key <key>     # Context7 API key
```

**Attach Examples:**
```bash
# Auto-detect stack
task-o-matic init attach --analyze --create-prd

# Just detect without creating files
task-o-matic init attach --dry-run

# Force re-detection
task-o-matic init attach --redetect
```

### INITIALIZATION WORKFLOW

#### Step 1: Directory Setup
1. Create target directory if specified
2. Set working directory in ConfigManager
3. Verify directory permissions

#### Step 2: Task-O-Matic Structure
1. Create `.task-o-matic/` directory
2. Create subdirectories: `tasks/`, `prd/`, `logs/`, `docs/`
3. Initialize configuration files

#### Step 3: Configuration Setup
1. Create `config.json` with AI settings
2. Create `mcp.json` with Context7 configuration
3. Validate configuration syntax

#### Step 4: Bootstrap (Optional)
1. Call Better-T-Stack CLI with specified options
2. Handle bootstrap results
3. Update configuration for new project structure

### ATTACH WORKFLOW

#### Step 1: Stack Detection
- Analyze package.json, dependencies, and project structure
- Detect frameworks, databases, ORM, auth, package manager, runtime
- Calculate confidence score

#### Step 2: Full Analysis (Optional)
- Analyze project structure
- Detect TODOs in comments
- Identify existing features
- Generate suggestions

#### Step 3: PRD Generation (Optional)
- Generate PRD from codebase analysis
- Save to `.task-o-matic/prd/` directory

### INITIALIZATION ERROR HANDLING

#### Common Initialization Errors
```bash
# Directory already initialized
Error: This project is already initialized with task-o-matic
Solution: Use existing project or delete .task-o-matic directory

# Permission denied
Error: EACCES: permission denied, mkdir '.task-o-matic'
Solution: Check directory permissions or use different location

# Bootstrap CLI not found
Error: better-t-stack-cli not found
Solution: Install Better-T-Stack CLI: npm install -g better-t-stack-cli

# Invalid framework combination
Error: Invalid frontend/backend combination
Solution: Check supported combinations in Better-T-Stack documentation
```

#### Recovery Procedures
1. **Directory Cleanup**: Remove partial initialization
2. **Permission Fix**: Use appropriate user permissions
3. **Dependency Installation**: Install missing CLI tools
4. **Configuration Repair**: Manual config file creation

### TECHNICAL SPECIFICATIONS

#### Directory Structure
```
project-root/
├── .task-o-matic/
│   ├── config.json          # Main configuration
│   ├── stack.json          # Detected technology stack (cached for AI context)
│   ├── bts-config.json     # Better-T-Stack configuration (if bootstrapped)
│   ├── mcp.json           # MCP configuration
│   ├── tasks.json         # Main tasks database
│   ├── ai-metadata.json    # AI metadata for all tasks
│   │
│   ├── tasks/             # Task content files
│   │   ├── {task-id}.md
│   │   └── enhanced/
│   │       └── {task-id}.md
│   │
│   ├── plans/             # Implementation plans
│   │   └── {task-id}.json
│   │
│   ├── docs/              # Documentation
│   │   ├── tasks/       # Task-specific documentation
│   │   └── {library-name}/  # Context7 library docs
│   │
│   ├── prd/              # PRD versions and logs
│   │   ├── versions/      # PRD versioning history
│   │   ├── parsed-prd.json
│   │   └── (user prd files)
│   │
│   └── logs/             # Operation logs
├── src/                   # Source code (from bootstrap)
├── package.json           # Dependencies (from bootstrap)
└── ...                   # Other bootstrap files
```

#### Configuration Defaults
- **AI Provider**: openrouter
- **AI Model**: z-ai/glm-4.6
- **Max Tokens**: 32768
- **Temperature**: 0.5
- **Package Manager**: npm
- **Runtime**: node

#### Performance Characteristics
- **Initialization Time**: 5-15 seconds
- **Bootstrap Time**: 1-5 minutes (depends on complexity)
- **Disk Usage**: 10-100MB (depends on selected frameworks)
- **Memory Usage**: 50-200MB during initialization

## CONTINUE COMMAND (NEW)
**Primary Command:** `task-o-matic continue [options]`

### DESCRIPTION
Continue working on an existing project. Analyzes project status, allows adding features to PRD, generating tasks for unimplemented features, and creating implementation plans.

### OPTIONS

```bash
-s, --status                 # Show project status overview
-a, --add-feature <feature>  # Add a new feature to PRD
-u, --update-prd             # Update PRD with implementation progress
-g, --generate-tasks           # Generate tasks for unimplemented features
-p, --generate-plan            # Generate implementation plan for remaining work
```

### CONTINUE EXAMPLES

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

## DETECT COMMAND (NEW)
**Primary Command:** `task-o-matic detect [options]`

### DESCRIPTION
Detect technology stack of current project automatically. Analyzes package.json, dependencies, and project structure to identify frameworks, databases, ORM, auth, and more.

### OPTIONS

```bash
--save    # Save detected stack to .task-o-matic/stack.json
--json    # Output result as JSON
```

### DETECT EXAMPLES

```bash
# Auto-detect and save
task-o-matic detect --save

# Output as JSON
task-o-matic detect --json

# Just display (human-readable)
task-o-matic detect
```

**Detected Information:**
- Language (TypeScript/JavaScript)
- Frameworks (Next.js, Express, Hono, etc.)
- Database (Postgres, MongoDB, SQLite, MySQL)
- ORM (Prisma, Drizzle, TypeORM)
- Auth (Better-Auth, Clerk, NextAuth, Auth0)
- Package Manager & Runtime
- API Type
- Confidence Score

## PROMPT COMMAND
**Primary Command:** `task-o-matic prompt <name> [options]`

### DESCRIPTION
Build AI service prompts with variable replacement for external tools. Supports system and user prompts, automatic content detection, and integration with external AI tools.

### OPTIONS

#### Basic Options
```bash
name                        # Prompt name (prd-parsing, task-enhancement, etc.)
-t, --type <type>           # Prompt type: system or user (default: user)
-l, --list                   # List all available prompts and exit
-m, --metadata <name>        # Show metadata for specific prompt and exit
```

#### Content Options
```bash
--prd-content <content>       # PRD content (for PRD-related prompts)
--prd-file <filepath>        # Load PRD content from file
--task-title <title>         # Task title (for task-related prompts)
--task-description <description> # Task description (for task-related prompts)
--task-file <filepath>       # Load task description from file
--stack-info <info>          # Technology stack information
--context-info <info>        # Additional context information
--user-feedback <feedback>    # User feedback (for prd-rework prompt)
```

#### Advanced Options
```bash
--var <key=value>           # Custom variable (can be used multiple times)
--full-context               # Include comprehensive project context
--executor <type>            # Format output for specific executor: opencode, claude, gemini, codex
```

### AVAILABLE PROMPTS

#### PRD-Related Prompts
- `prd-parsing`: Parse PRD into structured tasks
- `prd-generation`: Generate PRD from description
- `prd-rework`: Rework PRD based on feedback
- `prd-combination`: Combine multiple PRDs
- `prd-question`: Generate clarifying questions

#### Task-Related Prompts
- `task-enhancement`: Enhance task with additional details
- `task-breakdown`: Break task into subtasks
- `task-documentation`: Generate documentation for task
- `task-planning`: Create implementation plan
- `task-execution`: Generate execution instructions

#### System Prompts
- `documentation-detection`: Detect documentation needs
- `workflow-assistance`: General workflow guidance
- `error-analysis`: Analyze and suggest fixes

### PROMPT USAGE EXAMPLES

#### Basic Prompt Building
```bash
# List all available prompts
task-o-matic prompt --list

# Show metadata for specific prompt
task-o-matic prompt --metadata prd-parsing

# Build basic PRD parsing prompt
task-o-matic prompt prd-parsing --prd-file ./requirements.md
```

#### Advanced Prompt Building
```bash
# Build task enhancement with full context
task-o-matic prompt task-enhancement \
  --task-title "Implement user authentication" \
  --task-file ./task-desc.md \
  --stack-info "Next.js, TypeScript, Prisma" \
  --full-context \
  --executor claude

# Build PRD rework prompt with custom variables
task-o-matic prompt prd-rework \
  --prd-content "$(cat requirements.md)" \
  --user-feedback "Add more security protocols" \
  --var FOCUS="security" \
  --var COMPLEXITY="high" \
  --executor opencode

# System prompt generation
task-o-matic prompt prd-parsing --type system \
  --prd-file ./complex-requirements.md \
  --var STRICT_MODE="true"
```

#### Context-Aware Prompt Building
```bash
# Auto-detect PRD and stack information
task-o-matic prompt task-enhancement \
  --task-title "Build API endpoints" \
  --full-context

# Manual content override
task-o-matic prompt prd-parsing \
  --prd-content "## Emergency Shelter System\n### Overview\n..." \
  --stack-info "React, Node.js, PostgreSQL" \
  --var ESTIMATED_EFFORT="large" \
  --executor gemini
```

### AUTOMATIC CONTENT DETECTION

#### Detection Priority Order
1. **Explicit Options**: Directly provided content
2. **File Detection**: Auto-detect PRD files in project
3. **Stack Detection**: Analyze package.json and dependencies
4. **Context Building**: Combine all available information

#### Auto-Detection Features
- **PRD Content**: Searches for common PRD files (README.md, requirements.md, etc.)
- **Stack Information**: Analyzes package.json, tsconfig.json, and other config files
- **Task Context**: Builds rich context from task files and project structure
- **Full Context**: Includes file structure, dependencies, and project metadata

### VARIABLE SYSTEM

#### Built-in Variables
- `PRD_CONTENT`: PRD document content
- `TASK_TITLE`: Task title
- `TASK_DESCRIPTION`: Task description
- `TASK_CONTEXT`: Rich task context with metadata
- `STACK_INFO`: Technology stack information
- `CONTEXT_INFO`: Combined context information
- `USER_FEEDBACK`: User feedback for refinement

#### Custom Variables
```bash
# Single custom variable
--var FOCUS="security"

# Multiple custom variables
--var FOCUS="security" --var COMPLEXITY="high" --var DEADLINE="urgent"

# Complex values with spaces
--var DESCRIPTION="Build a secure authentication system with JWT"
```

#### Variable Precedence
1. **Custom Variables** (`--var`): Highest priority
2. **Explicit Options** (`--prd-content`, etc.): Override auto-detection
3. **Auto-Detection**: Default behavior
4. **Default Values**: Fallback when no content found

### EXECUTOR FORMATTING

#### Supported Executors
- **opencode**: Format for OpenCode AI assistant
- **claude**: Format for Anthropic Claude
- **gemini**: Format for Google Gemini
- **codex**: Format for GitHub Copilot/Codex

#### Formatting Differences
```bash
# Claude formatting
task-o-matic prompt task-enhancement --executor claude

# OpenCode formatting  
task-o-matic prompt task-enhancement --executor opencode

# Gemini formatting
task-o-matic prompt task-enhancement --executor gemini
```

## INSTALL COMMAND (NEW)
**Primary Command:** `task-o-matic install <target> [options]`

### DESCRIPTION
Install task-o-matic documentation and agent guides into current project.

### OPTIONS

```bash
--force    # Overwrite existing files
```

### TARGETS

```bash
doc      # Install project documentation
claude    # Install Claude Desktop agent guide
agents    # Install generic agent guides
```

### INSTALL EXAMPLES

```bash
# Install project documentation
task-o-matic install doc --force

# Install Claude agent guide
task-o-matic install claude

# Install generic agent guides
task-o-matic install agents --force
```

### FIELD OPERATIONS PROTOCOLS

#### Command Integration Patterns
All main commands integrate with core services through standardized protocols:

1. **Service Access**: Commands access services through dependency injection
2. **Configuration Management**: Unified configuration system with project-local overrides
3. **Error Handling**: Standardized error codes and user-friendly messages
4. **Progress Tracking**: Real-time progress updates for long-running operations
5. **Result Formatting**: Consistent output formatting across all commands

#### AI Provider Integration

**Provider Support Matrix:**

| Provider | Configuration | Streaming | Reasoning | Reasoning Format |
|----------|-------------|-----------|-----------|------------------|
| openrouter | ✓ | ✓ | ✓ | --ai-reasoning <tokens> |
| anthropic | ✓ | ✓ | ✗ | N/A |
| openai | ✓ | ✓ | ✗ | N/A |
| custom | ✓ | ✓ | ✗ | N/A |

**Multi-AI Parallel Execution:**

Multiple commands support parallel execution with multiple AI models:

- `tasks split --ai "model1,model2,model3"`
- `prd create --ai "model1,model2" --combine-ai model3`
- `prd parse --ai "model1,model2" --combine-ai model3`
- `benchmark run --models "model1,model2"`

This enables competitive AI model testing and combination of results for optimal outputs.

**Command Grouping:**

Commands are organized hierarchically:

```bash
task-o-matic init          # Initialization subcommands
task-o-matic tasks         # Task management subcommands
task-o-matic prd           # PRD management subcommands
task-o-matic workflow       # End-to-end workflow
task-o-matic config        # Configuration subcommands
task-o-matic benchmark     # Benchmarking subcommands
task-o-matic detect        # Stack detection
task-o-matic continue       # Project continuation
task-o-matic prompt        # Prompt building
task-o-matic install       # Documentation installation
```

---

**END OF TECHNICAL BULLETIN**

_This document is classified MANDATORY READING for all developer-citizens. Unauthorized failure to follow these protocols may result in... suboptimal project outcomes._

---

**DOCUMENT CONTROL:**

- **Version:** 2.0
- **Clearance:** All Personnel
- **Classification:** For Citizens' Eyes Only
- **Last Updated:** Current codebase revision

[Stay organized. Stay safe. Survive.]
