---
## TECHNICAL BULLETIN NO. 001
### MAIN COMMANDS - CORE FIELD OPERATIONS

**DOCUMENT ID:** `task-o-matic-cli-main-commands-v1`  
**CLEARANCE:** `All Personnel`  
**MANDATORY COMPLIANCE:** `Yes`

### ⚠️ CRITICAL SURVIVAL NOTICE
Citizen, ignoring these main commands is like wandering into the radioactive wastes without a geiger counter. These are your primary survival tools in the post-deadline wasteland. Master them or perish in the chaos of unmanaged projects.

### COMMAND ARCHITECTURE OVERVIEW
The main command structure represents the central nervous system of Task-O-Matic operations. Each command serves as a critical survival hub, coordinating different aspects of project management, AI integration, and workflow automation. The architecture follows a hierarchical pattern where main commands delegate to specialized subcommands, creating a modular and extensible system.

**Core Integration Points:**
- **Service Layer Integration**: All commands interface with core services (TaskService, PRDService, WorkflowService, BenchmarkService)
- **AI Provider Abstraction**: Unified AI operations across multiple providers (OpenRouter, Anthropic, OpenAI, Custom endpoints)
- **Configuration Management**: Centralized config system with project-local overrides
- **Error Handling**: Standardized error reporting with TaskOMaticErrorCodes
- **Streaming Support**: Real-time AI output for enhanced user experience

### COMPLETE COMMAND DOCUMENTATION

## TASKS COMMAND
**Primary Command:** `task-o-matic tasks`

### COMMAND SIGNATURE
```bash
task-o-matic tasks [subcommand] [options]
```

### DESCRIPTION
The tasks command serves as the central hub for all task-related operations. It provides access to the complete task management lifecycle including creation, modification, execution, and analysis. This is your primary interface for managing the hierarchical task structure that keeps projects organized in the wasteland.

### SUBCOMMANDS
The tasks command delegates to specialized subcommands:
- `create` - Create new tasks with AI enhancement
- `list` - Display all tasks with filtering options
- `show` - Show detailed task information
- `update` - Modify existing task properties
- `delete` - Remove tasks from the system
- `status` - Change task status
- `add-tags` - Add tags to tasks
- `remove-tags` - Remove tags from tasks
- `plan` - Create and manage implementation plans
- `enhance` - AI-enhance task descriptions
- `split` - Break tasks into subtasks
- `document` - Fetch and analyze documentation
- `execute` - Execute tasks using external tools
- `execute-loop` - Execute multiple tasks with retry logic
- `subtasks` - List task subtasks
- `tree` - Display hierarchical task tree
- `next` - Get next task to work on

### INTEGRATION EXAMPLES
```bash
# Basic task listing
task-o-matic tasks list

# Create enhanced task
task-o-matic tasks create --title "Build shelter" --ai-enhance

# Execute task with planning
task-o-matic tasks execute --id task-123 --plan --review

# Show task tree
task-o-matic tasks tree
```

### RETURN VALUES
- **Success**: Returns task data or operation confirmation
- **Error**: Exits with code 1 and displays error message
- **Exit Codes**: 0 (success), 1 (error), 2 (validation error)

## WORKFLOW COMMAND
**Primary Command:** `task-o-matic workflow`

### COMMAND SIGNATURE
```bash
task-o-matic workflow [options]
```

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
--frontend <framework>      # Frontend framework
--backend <framework>       # Backend framework
--database <db>            # Database choice
--auth                     # Include authentication
--no-auth                  # Exclude authentication
--bootstrap                 # Bootstrap with Better-T-Stack
--no-bootstrap             # Skip bootstrapping
--include-docs             # Include Task-O-Matic documentation
--no-include-docs         # Skip including documentation
```

#### Step 2: PRD Definition Options
```bash
--skip-prd                  # Skip PRD definition
--prd-method <method>       # PRD method: upload, manual, ai, skip
--prd-file <path>          # Path to existing PRD file
--prd-description <desc>    # Product description for AI-assisted PRD
--prd-content <content>     # Direct PRD content
--prd-multi-generation      # Generate multiple PRDs and compare
--skip-prd-multi-generation # Skip PRD multi-generation
--prd-multi-generation-models <models>  # Comma-separated model list
--prd-combine              # Combine generated PRDs into master PRD
--skip-prd-combine         # Skip PRD combination
--prd-combine-model <model> # Model to use for combining PRDs
```

#### Step 2.5: PRD Question/Refine Options
```bash
--skip-prd-question-refine  # Skip PRD question/refine step
--prd-question-refine       # Use question-based PRD refinement
--prd-answer-mode <mode>    # Who answers questions: user, ai
--prd-answer-ai-provider <provider>  # AI provider for answering
--prd-answer-ai-model <model>       # AI model for answering
--prd-answer-ai-reasoning  # Enable reasoning for AI answering model
```

#### Step 3: PRD Refinement Options
```bash
--skip-refine              # Skip PRD refinement
--refine-method <method>   # Refinement method: manual, ai, skip
--refine-feedback <feedback> # Feedback for AI refinement
```

#### Step 4: Task Generation Options
```bash
--skip-generate            # Skip task generation
--generate-method <method>  # Generation method: standard, ai
--generate-instructions <instructions>  # Custom task generation instructions
```

#### Step 5: Task Splitting Options
```bash
--skip-split               # Skip task splitting
--split-tasks <ids>       # Comma-separated task IDs to split
--split-all               # Split all tasks
--split-method <method>    # Split method: interactive, standard, custom
--split-instructions <instructions>  # Custom split instructions
```

### WORKFLOW EXECUTION EXAMPLES

#### Basic Workflow
```bash
# Interactive workflow with all steps
task-o-matic workflow

# Quick workflow with defaults
task-o-matic workflow --skip-all --auto-accept

# AI-assisted project setup
task-o-matic workflow \
  --project-name "Wasteland Shelter" \
  --init-method ai \
  --project-description "A radiation-proof shelter management system" \
  --prd-method ai \
  --prd-description "Build a comprehensive shelter management system"
```

#### Advanced Workflow Configuration
```bash
# Custom workflow with specific AI models
task-o-matic workflow \
  --ai-provider anthropic \
  --ai-model claude-3.5-sonnet \
  --project-name "Survival Kit" \
  --init-method custom \
  --frontend next \
  --backend hono \
  --database postgres \
  --auth \
  --prd-method upload \
  --prd-file ./requirements.md \
  --prd-multi-generation \
  --prd-multi-generation-models "anthropic:claude-3.5-sonnet,openai:gpt-4,google:gemini-pro" \
  --prd-combine-model anthropic:claude-3.5-sonnet
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
  "aiModel": "claude-3.5-sonnet"
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

#### Step 2.5: PRD Question/Refine
- **Purpose**: Clarify PRD requirements through Q&A
- **Answer Modes**:
  - `user`: Interactive user answers
  - `ai`: AI answers based on project context
- **Integration**: Automatically refines PRD with answers

#### Step 3: PRD Refinement
- **Purpose**: Improve PRD quality based on feedback
- **Methods**:
  - `manual`: Direct editing in editor
  - `ai`: AI-assisted refinement with feedback
  - `skip`: Skip refinement step

#### Step 4: Task Generation
- **Purpose**: Convert PRD into actionable tasks
- **Methods**:
  - `standard`: Rule-based parsing
  - `ai`: AI-powered task generation with custom instructions

#### Step 5: Task Splitting
- **Purpose**: Break complex tasks into manageable subtasks
- **Methods**:
  - `interactive`: Ask for each task individually
  - `standard`: Apply standard AI splitting to all
  - `custom`: Use custom instructions for all tasks

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
**Primary Command:** `task-o-matic prd`

### COMMAND SIGNATURE
```bash
task-o-matic prd [subcommand] [options]
```

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
--ai <provider:model...>     # AI model(s) to use (can specify multiple)
--combine-ai <provider:model> # AI model to combine multiple PRDs
--output-dir <path>          # Directory to save PRDs (default: .task-o-matic/prd)
--stream                     # Enable streaming output (single AI only)
```

**Multi-Model Generation Examples:**
```bash
# Single model PRD generation
task-o-matic prd create "Emergency shelter system" \
  --ai anthropic:claude-3.5-sonnet \
  --stream

# Multi-model comparison
task-o-matic prd create "Water purification system" \
  --ai anthropic:claude-3.5-sonnet openai:gpt-4 google:gemini-pro \
  --combine-ai anthropic:claude-3.5-sonnet

# Custom output directory
task-o-matic prd create "Communication network" \
  --ai openrouter:anthropic/claude-3.5-sonnet \
  --output-dir ./requirements
```

#### COMBINE SUBCOMMAND
```bash
task-o-matic prd combine [options]
```

**Required Options:**
```bash
--files <paths...>           # PRD files to combine
--description <text>         # Original product description
--ai <provider:model>        # AI model to use for combining
```

**Optional Options:**
```bash
--output <path>              # Output file path (default: prd-master.md)
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
--file <path>                # Path to PRD file
```

**AI Configuration Options:**
```bash
--ai-provider <provider>     # AI provider override
--ai-model <model>           # AI model override
--ai-key <key>               # AI API key override
--ai-provider-url <url>      # AI provider URL override
--ai-reasoning <tokens>      # Enable reasoning for OpenRouter models
--stream                     # Show streaming AI output
--tools                      # Enable filesystem tools for project analysis
```

**Content Override Options:**
```bash
--prompt <prompt>            # Override prompt
--message <message>          # User message
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
```

#### REWORK SUBCOMMAND
```bash
task-o-matic prd rework [options]
```

**Required Options:**
```bash
--file <path>                # Path to PRD file
--feedback <feedback>         # User feedback for improvements
```

**Optional Options:**
```bash
--output <path>              # Output file path (default: overwrite original)
--prompt <prompt>            # Override prompt
--message <message>          # User message
--ai-provider <provider>     # AI provider override
--ai-model <model>           # AI model override
--ai-key <key>               # AI API key override
--ai-provider-url <url>      # AI provider URL override
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
--file <path>                # Path to PRD file
```

**Optional Options:**
```bash
--output <path>              # Output JSON file path (default: prd-questions.json)
--prompt <prompt>            # Override prompt
--message <message>          # User message
--ai-provider <provider>     # AI provider override
--ai-model <model>           # AI model override
--ai-key <key>               # AI API key override
--ai-provider-url <url>      # AI provider URL override
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
--file <path>                # Path to PRD file
```

**Optional Options:**
```bash
--questions <path>           # Path to questions JSON file
--output <path>              # Output file path (default: overwrite original)
--prompt <prompt>            # Override prompt
--message <message>          # User message
--ai-provider <provider>     # AI provider override
--ai-model <model>           # AI model override
--ai-key <key>               # AI API key override
--ai-provider-url <url>      # AI provider URL override
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

#### Storage Requirements
- **PRD Files**: 10-100KB per document
- **Generated Questions**: 5-20KB per set
- **AI Metadata**: 1-5KB per operation
- **Cache Data**: 50-200MB for documentation cache

## BENCHMARK COMMAND
**Primary Command:** `task-o-matic benchmark`

### COMMAND SIGNATURE
```bash
task-o-matic benchmark [subcommand] [options]
```

### DESCRIPTION
The benchmark command provides comprehensive AI model performance testing and comparison capabilities. It supports individual operation benchmarking, workflow benchmarking, and comparative analysis across multiple AI providers and models. This is your intelligence-gathering tool for optimizing AI operations in the wasteland.

### SUBCOMMANDS AND COMPREHENSIVE OPTIONS

#### RUN SUBCOMMAND
```bash
task-o-matic benchmark run <operation> [options]
```

**Required Arguments:**
- `operation`: Operation to benchmark (prd-parse, task-breakdown, task-create, prd-create, etc.)

**Required Options:**
```bash
--models <list>              # Comma-separated list of models (provider:model[:reasoning=<tokens>])
```

**General Options:**
```bash
--file <path>                # Input file path (for PRD ops)
--task-id <id>               # Task ID (for Task ops)
--concurrency <number>        # Max concurrent requests (default: 5)
--delay <number>             # Delay between requests in ms (default: 250)
--prompt <prompt>             # Override prompt
--message <message>           # User message
--tools                      # Enable filesystem tools
--feedback <feedback>         # Feedback (for prd-rework)
```

**Task Creation Options:**
```bash
--title <title>              # Task title (for task-create)
--content <content>           # Task content (for task-create)
--parent-id <id>             # Parent task ID (for task-create)
--effort <effort>            # Effort estimate: small, medium, large (for task-create)
--force                      # Force operation (for task-document)
```

**PRD Creation Options:**
```bash
--description <desc>          # Project/PRD description (for prd-create, prd-combine)
--output-dir <dir>           # Output directory (for prd-create, prd-combine)
--filename <name>            # Output filename (for prd-create, prd-combine)
```

**PRD Combine Options:**
```bash
--prds <list>                # Comma-separated list of PRD file paths (for prd-combine)
```

**PRD Refine Options:**
```bash
--question-mode <mode>        # Question mode: user or ai (for prd-refine)
--answers <json>              # JSON string of answers (for prd-refine user mode)
```

**Model Format Examples:**
```bash
# Basic model format
anthropic:claude-3.5-sonnet
openai:gpt-4
openrouter:anthropic/claude-3.5-sonnet

# With reasoning tokens
openrouter:anthropic/claude-3.5-sonnet:reasoning=2048
openai:o1-preview:reasoning=4096
```

**Benchmark Run Examples:**
```bash
# Simple benchmark
task-o-matic benchmark run prd-parse \
  --models "anthropic:claude-3.5-sonnet,openai:gpt-4" \
  --file ./requirements.md

# Advanced benchmark with custom settings
task-o-matic benchmark run task-create \
  --models "openrouter:anthropic/claude-3.5-sonnet:reasoning=2048,openrouter:openai/gpt-4o" \
  --title "Create user authentication" \
  --content "Implement JWT-based authentication system" \
  --concurrency 3 \
  --delay 500

# PRD creation benchmark
task-o-matic benchmark run prd-create \
  --models "anthropic:claude-3.5-sonnet,openai:gpt-4,google:gemini-pro" \
  --description "Emergency shelter management system" \
  --output-dir ./benchmark-results

# Task breakdown with tools
task-o-matic benchmark run task-breakdown \
  --models "openrouter:anthropic/claude-3.5-sonnet" \
  --task-id task-123 \
  --tools
```

#### LIST SUBCOMMAND
```bash
task-o-matic benchmark list
```

**Description**: Lists all past benchmark runs with timestamps and commands.

**Example Output:**
```
Benchmark Runs:
- 2024-01-15_14-30-22_prd-parse (2024-01-15 2:30:22 PM) - prd-parse
- 2024-01-15_13-45-10_task-create (2024-01-15 1:45:10 PM) - task-create
- 2024-01-14_16-20-45_workflow-full (2024-01-14 4:20:45 PM) - workflow-full
```

#### OPERATIONS SUBCOMMAND
```bash
task-o-matic benchmark operations
```

**Description**: Lists all available benchmark operations grouped by category.

**Example Output:**
```
📊 Available Benchmark Operations

Task Operations:
  task-create          - Create a new task with AI enhancement
  task-enhance        - Enhance an existing task with AI
  task-breakdown      - Break task into subtasks using AI
  task-document       - Fetch and analyze documentation for task

PRD Operations:
  prd-create          - Generate PRD from product description
  prd-parse           - Parse PRD into structured tasks
  prd-rework          - Rework PRD based on feedback
  prd-combine         - Combine multiple PRDs into master PRD

Workflow Operations:
  workflow-full       - Complete workflow execution
  workflow-init       - Project initialization step
  workflow-prd        - PRD creation and refinement
```

#### SHOW SUBCOMMAND
```bash
task-o-matic benchmark show <id>
```

**Arguments:**
- `id`: Run ID to display details for

**Description**: Shows comprehensive details of a specific benchmark run including configuration, results, and performance metrics.

**Example Usage:**
```bash
task-o-matic benchmark show 2024-01-15_14-30-22_prd-parse
```

#### COMPARE SUBCOMMAND
```bash
task-o-matic benchmark compare <id>
```

**Arguments:**
- `id`: Run ID to compare results for

**Description**: Provides comparative analysis of results within a benchmark run, showing performance differences across models.

#### WORKFLOW SUBCOMMAND
```bash
task-o-matic benchmark workflow [options]
```

**Required Options:**
```bash
--models <list>              # Comma-separated list of models (provider:model[:reasoning=<tokens>])
```

**Workflow Configuration Options:**
```bash
--concurrency <number>        # Max concurrent requests (default: 3)
--delay <number>             # Delay between requests in ms (default: 1000)
--stream                     # Show streaming AI output
--skip-all                   # Skip all optional steps (use defaults)
--auto-accept                # Auto-accept all AI suggestions
--config-file <path>         # Load workflow options from JSON file
```

**Step-Specific Options** (same as workflow command):
```bash
# Initialization
--skip-init --project-name <name> --init-method <method> --project-description <desc>

# PRD Definition  
--skip-prd --prd-method <method> --prd-file <path> --prd-description <desc>

# PRD Refinement
--skip-refine --refine-method <method> --refine-feedback <feedback>

# Task Generation
--skip-generate --generate-method <method> --generate-instructions <instructions>

# Task Splitting
--skip-split --split-tasks <ids> --split-all --split-method <method>
```

**Workflow Benchmark Examples:**
```bash
# Basic workflow benchmark
task-o-matic benchmark workflow \
  --models "anthropic:claude-3.5-sonnet,openai:gpt-4" \
  --project-name "Shelter System" \
  --init-method ai \
  --project-description "Emergency shelter management"

# Advanced workflow benchmark
task-o-matic benchmark workflow \
  --models "openrouter:anthropic/claude-3.5-sonnet:reasoning=2048,openrouter:openai/gpt-4o,openrouter:google/gemini-2.0-flash-exp" \
  --concurrency 2 \
  --delay 2000 \
  --auto-accept \
  --skip-refine \
  --generate-method ai \
  --split-all
```

### BENCHMARK PERFORMANCE METRICS

#### Measured Metrics
- **Duration**: Total execution time in milliseconds
- **TTFT (Time to First Token)**: Response latency
- **Tokens**: Total token usage (prompt + completion)
- **TPS (Tokens Per Second)**: Processing speed
- **BPS (Bytes Per Second)**: Data transfer rate
- **Response Size**: Output size in bytes
- **Cost**: Estimated API cost in USD

#### Result Analysis
```bash
# Example benchmark output table
Model                                     | Duration | TTFT    | Tokens   | TPS     | BPS     | Size     | Cost
-------------------------------------------|----------|----------|----------|---------|---------|----------|----------
anthropic:claude-3.5-sonnet                | 2340ms   | 120ms    | 1250     | 0.53    | 89      | 208      | $0.004250
openai:gpt-4                              | 3120ms   | 180ms    | 980      | 0.31    | 67      | 195      | $0.039200
openrouter:anthropic/claude-3.5-sonnet     | 2450ms   | 135ms    | 1180     | 0.48    | 85      | 202      | $0.004720
```

### BENCHMARK ERROR HANDLING

#### Common Benchmark Errors
```bash
# Invalid model format
Error: Invalid model format: invalid-model. Expected provider:model[:reasoning=<tokens>]
Solution: Use correct format with provider and model

# Operation not found
Error: Benchmark operation 'invalid-op' not found
Solution: Use 'benchmark operations' to see available operations

# Concurrency limits
Error: Too many concurrent requests
Solution: Reduce --concurrency value or increase --delay

# API rate limits
Error: Rate limit exceeded for provider
Solution: Increase delay between requests or reduce concurrency
```

#### Benchmark Recovery Strategies
1. **Model Validation**: Verify all model strings before running
2. **Operation Check**: Confirm operation exists with `benchmark operations`
3. **Rate Limit Handling**: Adjust concurrency and delay parameters
4. **Partial Failure Handling**: Continue with successful models, retry failed ones

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
**Primary Command:** `task-o-matic config`

### COMMAND SIGNATURE
```bash
task-o-matic config [subcommand] [options]
```

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
**Primary Command:** `task-o-matic init`

### COMMAND SIGNATURE
```bash
task-o-matic init [subcommand] [options]
```

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
--tui-framework <framework>  # TUI framework (solid/vue/react, default: solid)
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
--backend <backend>           # Backend framework (hono/express/elysia/convex)
--database <database>         # Database (sqlite/postgres/mysql/mongodb)
--orm <orm>                  # ORM (drizzle/prisma/none, default: drizzle)
--no-auth                    # Exclude authentication
--addons <addons...>          # Additional addons (pwa/tauri/starlight/biome/husky/turborepo)
--examples <examples...>       # Examples to include (todo/ai)
--no-git                     # Skip git initialization
--package-manager <pm>       # Package manager (npm/pnpm/bun, default: npm)
--no-install                 # Skip installing dependencies
--db-setup <setup>           # Database setup (turso/neon/prisma-postgres/mongodb-atlas)
--runtime <runtime>           # Runtime (bun/node, default: node)
--api <type>                 # API type (trpc/orpc)
--payment <payment>           # Payment provider (none/polar, default: none)
--cli-deps <level>           # CLI dependency level (minimal/standard/full/task-o-matic)
--tui-framework <framework>  # TUI framework (solid/vue/react, default: solid)
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
  --database sqlite

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
  --frontend cli \
  --cli-deps full \
  --package-manager bun \
  --runtime bun

# TUI application
task-o-matic init bootstrap "shelter-tui" \
  --frontend tui \
  --tui-framework solid \
  --package-manager pnpm
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

### BOOTSTRAP INTEGRATION

#### Better-T-Stack Integration
The init command integrates with Better-T-Stack CLI for full-stack application bootstrapping:

**Supported Features:**
- Multi-framework frontend support
- Multiple backend options
- Database setup and configuration
- Authentication integration
- Addon system for additional features
- Example project templates

**Bootstrap Process:**
1. Validate Better-T-Stack CLI installation
2. Prepare configuration options
3. Execute bootstrap command
4. Handle results and errors
5. Update Task-O-Matic configuration

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
│   ├── mcp.json           # MCP configuration
│   ├── tasks/             # Task storage
│   ├── prd/               # PRD storage
│   ├── logs/              # Operation logs
│   └── docs/              # Documentation cache
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

## PROMPT COMMAND
**Primary Command:** `task-o-matic prompt`

### COMMAND SIGNATURE
```bash
task-o-matic prompt [name] [options]
```

### DESCRIPTION
The prompt command provides advanced AI prompt building capabilities with variable replacement and context enhancement. It supports system and user prompts, automatic content detection, and integration with external AI tools. This is your communication toolkit for crafting precise AI instructions in the wasteland.

### COMPREHENSIVE OPTIONS

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
  --user-feedback "Add security requirements" \
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
  --stack-info "React, Node.js, PostgreSQL"

# Multi-variable prompt
task-o-matic prompt task-breakdown \
  --task-title "Create user management" \
  --var ESTIMATED_EFFORT="large" \
  --var PRIORITY="high" \
  --var DEPENDENCIES="authentication,database" \
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

### PROMPT ERROR HANDLING

#### Common Prompt Errors
```bash
# Prompt not found
Error: Prompt not found: invalid-prompt
Solution: Use --list to see available prompts

# Missing required variables
Error: Missing required variables: PRD_CONTENT
Solution: Provide --prd-content or --prd-file

# Invalid variable format
Error: Invalid variable format: invalid-var. Expected key=value
Solution: Use format --var KEY=value

# File not found
Error: ENOENT: no such file or directory, open 'requirements.md'
Solution: Verify file path and permissions
```

#### Prompt Recovery Strategies
1. **Variable Validation**: Check required variables with --metadata
2. **File Verification**: Ensure all referenced files exist
3. **Format Checking**: Use correct variable format
4. **Executor Validation**: Verify executor is supported

### TECHNICAL SPECIFICATIONS

#### Prompt Building Pipeline
1. **Variable Collection**: Gather all variables from options and auto-detection
2. **Content Detection**: Auto-detect PRD, stack, and context information
3. **Variable Resolution**: Replace placeholders with actual values
4. **Formatting**: Apply executor-specific formatting
5. **Validation**: Verify all required variables are present

#### Performance Characteristics
- **Prompt Building**: 50-200ms
- **Auto-Detection**: 100-500ms
- **File Processing**: 10-50ms per file
- **Variable Resolution**: 5-20ms

#### Storage Requirements
- **Prompt Templates**: 1-5KB per prompt
- **Auto-Detection Cache**: 10-50MB
- **Context Building**: 5-20MB per project

### FIELD OPERATIONS PROTOCOLS

#### Command Integration Patterns
All main commands integrate with core services through standardized protocols:

1. **Service Access**: Commands access services through dependency injection
2. **Configuration Management**: Unified configuration system with project-local overrides
3. **Error Handling**: Standardized error codes and user-friendly messages
4. **Progress Tracking**: Real-time progress updates for long-running operations
5. **Result Formatting**: Consistent output formatting across all commands

#### AI Provider Integration
- **Provider Abstraction**: Unified interface for all AI providers
- **Model Selection**: Flexible model configuration per operation
- **Authentication**: Secure API key management
- **Rate Limiting**: Built-in rate limiting and retry logic
- **Streaming**: Real-time response streaming when supported

#### Storage Integration
- **Local Storage**: File-based storage in `.task-o-matic/` directory
- **Data Organization**: Logical separation of tasks, PRDs, plans, and documentation
- **Metadata Management**: Rich metadata for all stored objects
- **Backup Support**: Easy backup and restore capabilities

### SURVIVAL SCENARIOS

#### Scenario 1: New Project Setup
```bash
# Initialize new project with AI assistance
task-o-matic init init \
  --project-name "wasteland-shelter" \
  --ai-provider anthropic \
  --ai-model claude-3.5-sonnet

# Run complete workflow
task-o-matic workflow \
  --project-name "Wasteland Shelter" \
  --init-method ai \
  --project-description "Emergency shelter management system" \
  --auto-accept
```

#### Scenario 2: Task Management Operations
```bash
# Create enhanced task
task-o-matic tasks create \
  --title "Build radiation detector" \
  --content "Design and implement a radiation detection system" \
  --ai-enhance \
  --stream

# Split complex task
task-o-matic tasks split \
  --task-id task-123 \
  --stream \
  --tools

# Execute task with planning
task-o-matic tasks execute \
  --id task-123 \
  --plan \
  --review \
  --auto-commit
```

#### Scenario 3: PRD Management
```bash
# Generate PRD with multiple models
task-o-matic prd create "Emergency communication system" \
  --ai "anthropic:claude-3.5-sonnet,openai:gpt-4,google:gemini-pro" \
  --combine-ai anthropic:claude-3.5-sonnet

# Parse PRD into tasks
task-o-matic prd parse \
  --file ./emergency-communication-prd.md \
  --tools \
  --stream

# Refine PRD with questions
task-o-matic prd refine \
  --file ./draft-prd.md \
  --stream
```

#### Scenario 4: Performance Optimization
```bash
# Benchmark AI models for task creation
task-o-matic benchmark run task-create \
  --models "openrouter:anthropic/claude-3.5-sonnet,openrouter:openai/gpt-4o" \
  --title "Create user authentication" \
  --content "Implement JWT-based authentication" \
  --concurrency 3

# Benchmark complete workflow
task-o-matic benchmark workflow \
  --models "anthropic:claude-3.5-sonnet,openai:gpt-4" \
  --project-name "Performance Test" \
  --init-method quick \
  --auto-accept
```

#### Scenario 5: Advanced Prompt Engineering
```bash
# Build custom prompt with full context
task-o-matic prompt task-enhancement \
  --task-title "Optimize database queries" \
  --full-context \
  --var FOCUS="performance" \
  --var DATABASE="postgresql" \
  --executor claude

# List and analyze available prompts
task-o-matic prompt --list

# Get prompt metadata for customization
task-o-matic prompt --metadata prd-parsing --type system
```

### TECHNICAL SPECIFICATIONS

#### System Architecture
- **Command Pattern**: Each command implements the Command pattern with standardized interfaces
- **Service Layer**: Business logic separated from CLI interface
- **Configuration Management**: Hierarchical configuration with environment variable support
- **Error Handling**: Comprehensive error system with error codes and recovery suggestions
- **Plugin Architecture**: Extensible system for adding new commands and providers

#### Performance Characteristics
- **Command Execution**: 10-100ms for simple commands, 1-60s for AI operations
- **Memory Usage**: 50-500MB depending on operation complexity
- **Disk I/O**: Local file operations, optimized for SSD storage
- **Network Usage**: AI API calls, typically 1-10MB per operation

#### Security Considerations
- **API Key Management**: Secure storage with environment variable support
- **Input Validation**: Comprehensive validation of all user inputs
- **Path Traversal Prevention**: Secure file access controls
- **Dependency Security**: Regular security updates for all dependencies

**Remember:** In the post-deadline wasteland, these main commands are your survival tools. Master them, respect their power, and they will guide you through the most complex project challenges. The wasteland is unforgiving, but with Task-O-Matic, you have the technology to thrive.

---

**DOCUMENT STATUS:** `Complete`  
**NEXT REVIEW:** `After next major version update`  
**CONTACT:** `Task-O-Matic Technical Documentation Team`