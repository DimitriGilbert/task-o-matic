---
## TECHNICAL BULLETIN NO. 006
### CONFIG, INIT & PROMPT COMMANDS - SYSTEM MANAGEMENT FIELD OPERATIONS

**DOCUMENT ID:** `task-o-matic-cli-system-commands-v1`  
**CLEARANCE:** `All Personnel`  
**MANDATORY COMPLIANCE:** `Yes`

### ⚠️ CRITICAL SURVIVAL NOTICE
Citizen, system management commands are your foundation tools in the post-deadline wasteland. Without proper configuration and initialization, you're building on radioactive ground. These commands provide the infrastructure and setup capabilities needed to establish stable project bases.

### COMMAND ARCHITECTURE OVERVIEW
The system management command group represents the foundational layer of Task-O-Matic. It handles project initialization, configuration management, and prompt building capabilities. The architecture ensures consistent setup across different project types and development environments.

**System Management Components:**
- **Project Initialization**: Complete project setup with AI and framework bootstrapping
- **Configuration Management**: AI provider configuration and project settings
- **Prompt Engineering**: Advanced AI prompt building with variable replacement
- **Bootstrap Integration**: Better-T-Stack CLI integration for full-stack applications
- **Environment Setup**: Development environment configuration and validation

### COMPLETE CONFIG COMMAND DOCUMENTATION

## CONFIG COMMAND
**Command:** `task-o-matic config`

### COMMAND SIGNATURE
```bash
task-o-matic config [subcommand] [options]
```

### SUBCOMMANDS AND OPTIONS

#### GET-AI-CONFIG SUBCOMMAND
**Command:** `task-o-matic config get-ai-config`

### COMMAND SIGNATURE
```bash
task-o-matic config get-ai-config
```

### GET-AI-CONFIG EXAMPLES

#### Basic Configuration Display
```bash
# Show current AI configuration
task-o-matic config get-ai-config

# Output includes provider, model, tokens, temperature, etc.
```

#### Configuration Output Format
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

### CONFIGURATION INFORMATION DISPLAYED
- **AI Provider**: Currently configured AI service provider
- **AI Model**: Selected AI model for operations
- **Max Tokens**: Maximum token limit for AI requests
- **Temperature**: AI response randomness setting (0.0-1.0)
- **API Key**: Authentication key (masked in output)
- **Base URL**: Custom API endpoint if configured
- **Additional Settings**: Provider-specific configuration options

### ERROR CONDITIONS
```bash
# Configuration file not found
Error: Not a task-o-matic project
Solution: Run 'task-o-matic init init' first

# Invalid configuration format
Error: Invalid configuration file format
Solution: Check JSON syntax and structure

# Permission denied
Error: Cannot read configuration file
Solution: Check file permissions and directory access
```

#### SET-AI-PROVIDER SUBCOMMAND
**Command:** `task-o-matic config set-ai-provider`

### COMMAND SIGNATURE
```bash
task-o-matic config set-ai-provider <provider> [model]
```

### REQUIRED ARGUMENTS
```bash
<provider>                  # AI provider (required)
<model>                    # AI model (optional)
```

### SET-AI-PROVIDER EXAMPLES

#### Basic Provider Configuration
```bash
# Set OpenRouter provider
task-o-matic config set-ai-provider openrouter

# Set provider with specific model
task-o-matic config set-ai-provider anthropic claude-3.5-sonnet

# Set OpenAI provider
task-o-matic config set-ai-provider openai gpt-4

# Set custom provider
task-o-matic config set-ai-provider custom http://localhost:8080
```

#### Advanced Provider Configuration
```bash
# Configure with reasoning tokens
task-o-matic config set-ai-provider openrouter anthropic/claude-opus-2024

# Configure with custom endpoint
task-o-matic config set-ai-provider custom http://api.example.com \
  --model custom-model-v1

# Multiple provider setup
task-o-matic config set-ai-provider openrouter \
  && task-o-matic config set-ai-provider anthropic \
  && task-o-matic config set-ai-provider openai
```

### PROVIDER SUPPORT
- **OpenRouter**: Multi-provider access with extensive model selection
- **Anthropic**: Direct Claude model access
- **OpenAI**: Direct GPT model access
- **Custom**: Configurable endpoints for self-hosted or specialized providers

### MODEL SUPPORT BY PROVIDER
```bash
# OpenRouter models
anthropic/claude-3.5-sonnet
anthropic/claude-opus-2024
openai/gpt-4
openai/gpt-4-turbo
google/gemini-pro

# Anthropic models
claude-3.5-sonnet
claude-opus-2024

# OpenAI models
gpt-4
gpt-4-turbo
gpt-3.5-turbo

# Custom provider configuration
provider:http://api.example.com
model:custom-model-v1
baseURL:http://api.example.com/v1
```

### CONFIGURATION VALIDATION
- **Provider Validation**: Check if provider is supported
- **Model Validation**: Verify model exists for provider
- **API Key Testing**: Validate authentication credentials
- **Endpoint Testing**: Check custom endpoint accessibility
- **Configuration Merging**: Combine CLI options with existing config

### ERROR CONDITIONS
```bash
# Invalid provider
Error: Unknown AI provider: invalid-provider
Solution: Use supported provider: openrouter, anthropic, openai, custom

# Invalid model for provider
Error: Model invalid-model not available for provider provider
Solution: Check available models for provider

# API authentication failure
Error: Failed to authenticate with provider
Solution: Verify API key and network connectivity

# Configuration file corruption
Error: Configuration file is corrupted
Solution: Restore from backup or reinitialize
```

## INFO SUBCOMMAND
**Command:** `task-o-matic config info`

### COMMAND SIGNATURE
```bash
task-o-matic config info
```

### INFO COMMAND EXAMPLES

#### Basic Project Information
```bash
# Show project details
task-o-matic config info

# Check if project is initialized
task-o-matic config info

# Display configuration file location
task-o-matic config info
```

### INFO OUTPUT FORMAT
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

### PROJECT INFORMATION DISPLAYED
- **Project Directory**: Current working directory path
- **Task-O-Matic Directory**: Path to .task-o-matic configuration directory
- **Configuration Status**: Whether config file exists and is valid
- **Configuration Content**: Current configuration settings (masked for sensitive data)
- **Initialization Status**: Whether project has been properly initialized

### ERROR CONDITIONS
```bash
# Not a task-o-matic project
Error: Not a task-o-matic project
Solution: Run 'task-o-matic init init' in project directory

# Configuration file access error
Error: Cannot access configuration file
Solution: Check file permissions and directory structure

# Invalid configuration format
Error: Configuration file has invalid format
Solution: Check JSON syntax and structure
```

## INIT COMMAND
**Command:** `task-o-matic init`

### COMMAND SIGNATURE
```bash
task-o-matic init [subcommand] [options]
```

### SUBCOMMANDS AND OPTIONS

#### INIT SUBCOMMAND
**Command:** `task-o-matic init init`

### COMMAND SIGNATURE
```bash
task-o-matic init init [options]
```

### AI CONFIGURATION OPTIONS
```bash
--ai-provider <provider>       # AI provider (openrouter/anthropic/openai/custom, default: openrouter)
--ai-model <model>           # AI model (default: z-ai/glm-4.6)
--ai-key <key>               # AI API key
--ai-provider-url <url>       # AI provider URL
--max-tokens <tokens>        # Max tokens for AI (min 32768 for 2025, default: 32768)
--temperature <temp>           # AI temperature (default: 0.5)
```

### BOOTSTRAP OPTIONS
```bash
--no-bootstrap               # Skip bootstrap after initialization (default: false)
--project-name <name>        # Project name for bootstrap
--frontend <frameworks...>    # Frontend framework(s) - space/comma-separated (default: next)
--backend <framework>         # Backend framework (default: convex)
--database <database>           # Database choice (sqlite/postgres/mysql/mongodb)
--auth <provider>             # Authentication provider (better-auth/none, default: better-auth)
--context7-api-key <key>     # Context7 API key
--directory <dir>            # Working directory for project
--package-manager <pm>       # Package manager (npm/pnpm/bun, default: npm)
--runtime <runtime>           # Runtime (bun/node, default: node)
--payment <payment>           # Payment provider (none/polar, default: none)
--cli-deps <level>          # CLI dependency level (minimal/standard/full/task-o-matic, default: standard)
--tui-framework <framework>   # TUI framework (solid/vue/react, default: solid)
```

### INIT EXAMPLES

#### Basic Initialization
```bash
# Initialize with defaults
task-o-matic init init

# Initialize with custom AI
task-o-matic init init \
  --ai-provider anthropic \
  --ai-model claude-3.5-sonnet \
  --max-tokens 65536

# Initialize with bootstrap
task-o-matic init init \
  --project-name "wasteland-shelter" \
  --bootstrap
```

#### Advanced Initialization Scenarios
```bash
# Full-stack project with AI
task-o-matic init init \
  --ai-provider openrouter \
  --ai-model anthropic/claude-3.5-sonnet \
  --project-name "emergency-response" \
  --frontend next \
  --backend hono \
  --database postgres \
  --auth better-auth \
  --bootstrap

# Multi-framework project
task-o-matic init init \
  --project-name "multi-platform" \
  --frontend "next native-bare cli tui" \
  --backend hono \
  --database postgres \
  --bootstrap

# CLI-only project
task-o-matic init init \
  --project-name "shelter-cli" \
  --frontend cli \
  --cli-deps full \
  --no-bootstrap

# Custom directory setup
task-o-matic init init \
  --directory ./projects/wasteland-shelter \
  --project-name "shelter-project" \
  --ai-provider anthropic \
  --ai-model claude-opus-2024
```

### INITIALIZATION PROCESS

#### Directory Setup
1. **Directory Creation**: Create target directory if specified
2. **Working Directory**: Set working directory in ConfigManager
3. **Permission Check**: Verify write access to target location

#### Task-O-Matic Structure Creation
1. **Base Directory**: Create `.task-o-matic/` directory
2. **Subdirectories**: Create `tasks/`, `prd/`, `logs/`, `docs/` directories
3. **Configuration Files**: Initialize `config.json` and `mcp.json`

#### Configuration Setup
1. **AI Configuration**: Set up AI provider and model settings
2. **Default Values**: Apply sensible defaults for unspecified options
3. **Validation**: Verify configuration integrity and accessibility

#### Bootstrap Integration (Optional)
1. **Better-T-Stack CLI**: Call external bootstrap tool
2. **Framework Selection**: Configure frontend, backend, database options
3. **Project Generation**: Create complete project structure
4. **Error Handling**: Graceful handling of bootstrap failures

### BOOTSTRAP SUBCOMMAND
**Command:** `task-o-matic init bootstrap`

### COMMAND SIGNATURE
```bash
task-o-matic init bootstrap <name> [options]
```

### REQUIRED ARGUMENTS
```bash
<name>                      # Project name (required)
```

### BOOTSTRAP OPTIONS
```bash
--frontend <frameworks...>    # Frontend framework(s) - space/comma-separated
--backend <framework>         # Backend framework (hono/express/elysia/convex)
--database <database>         # Database (sqlite/postgres/mysql/mongodb)
--orm <orm>                  # ORM (drizzle/prisma/none)
--no-auth                     # Exclude authentication
--addons <addons...>          # Additional addons (pwa/tauri/starlight/biome/husky/turborepo)
--examples <examples...>       # Example projects to include (todo/ai)
--no-git                     # Skip git initialization
--package-manager <pm>       # Package manager (npm/pnpm/bun)
--db-setup <setup>           # Database setup (turso/neon/prisma-postgres/mongodb-atlas)
--runtime <runtime>           # Runtime (bun/node)
--api <type>                 # API type (trpc/orpc)
--payment <payment>           # Payment provider (none/polar)
--cli-deps <level>          # CLI dependency level (minimal/standard/full/task-o-matic)
--tui-framework <framework>  # TUI framework (solid/vue/react)
```

### BOOTSTRAP EXAMPLES

#### Basic Web Application
```bash
# Simple Next.js app
task-o-matic init bootstrap shelter-app \
  --frontend next \
  --backend hono \
  --database sqlite

# Full-stack with authentication
task-o-matic init bootstrap emergency-system \
  --frontend next \
  --backend hono \
  --database postgres \
  --auth better-auth

# Multi-framework project
task-o-matic init bootstrap multi-platform \
  --frontend "next native-bare cli tui" \
  --backend hono \
  --database postgres \
  --orm drizzle
```

#### Advanced Bootstrap Scenarios
```bash
# With specific addons
task-o-matic init bootstrap project-x \
  --frontend next \
  --backend hono \
  --database postgres \
  --orm drizzle \
  --addons "pwa tauri biome"

# With custom database setup
task-o-matic init bootstrap data-platform \
  --frontend next \
  --backend hono \
  --database postgres \
  --db-setup neon

# CLI-only project
task-o-matic init bootstrap cli-tool \
  --frontend cli \
  --cli-deps full \
  --package-manager bun
```

### BOOTSTRAP FRAMEWORK SUPPORT

#### Frontend Frameworks
- **Web**: next, tanstack-router, react-router, nuxt, svelte, solid
- **Native**: native-bare, native-uniwind, native-unistyles
- **Custom**: cli, tui

#### Backend Frameworks
- **Modern**: hono, express, elysia, fastify
- **Traditional**: convex

#### Database Options
- **SQLite**: Lightweight file-based database
- **PostgreSQL**: Full-featured relational database
- **MySQL**: Traditional relational database
- **MongoDB**: NoSQL document database
- **Turso**: Edge PostgreSQL with built-in replication
- **Neon**: Serverless PostgreSQL
- **PlanetScale**: Serverless PostgreSQL with edge caching

#### Addon Options
- **PWA**: Progressive Web App capabilities
- **Tauri**: Desktop application framework
- **Starlight**: Documentation site generator
- **Biome**: Code formatting and linting
- **Husky**: Git hooks management
- **Turborepo**: Monorepo management

### BOOTSTRAP INTEGRATION

#### Better-T-Stack CLI
1. **Version Detection**: Automatically detect and use latest version
2. **Configuration Passing**: Translate Task-O-Matic options to Better-T-Stack format
3. **Progress Tracking**: Real-time bootstrap progress display
4. **Error Handling**: Comprehensive error reporting and recovery
5. **Result Validation**: Verify bootstrap success and project structure

#### Bootstrap Process Flow
1. **Preparation**: Validate options and detect existing setup
2. **Framework Selection**: Choose and configure project stack
3. **Dependency Installation**: Install required packages and dependencies
4. **Project Generation**: Create project files and directory structure
5. **Configuration**: Set up development environment and tooling
6. **Validation**: Verify installation and configuration

### ERROR CONDITIONS
```bash
# Better-T-Stack CLI not found
Error: better-t-stack-cli not found
Solution: Install with: npm install -g better-t-stack-cli

# Invalid framework combination
Error: Invalid frontend/backend combination
Solution: Check supported framework combinations

# Bootstrap failure
Error: Bootstrap process failed
Solution: Check error output and retry with different options

# Permission denied
Error: Permission denied creating project files
Solution: Check directory permissions and run with appropriate user
```

## PROMPT COMMAND
**Command:** `task-o-matic prompt`

### COMMAND SIGNATURE
```bash
task-o-matic prompt [name] [options]
```

### BASIC OPTIONS
```bash
-t, --type <type>           # Prompt type: system or user (default: user)
-l, --list                   # List all available prompts and exit
-m, --metadata <name>        # Show metadata for specific prompt and exit
```

### CONTENT OPTIONS
```bash
--prd-content <content>       # PRD content (for PRD-related prompts)
--prd-file <filepath>        # Load PRD content from file
--task-title <title>       # Task title (for task-related prompts)
--task-description <description> # Task description (for task-related prompts)
--task-file <filepath>       # Load task description from file
--stack-info <info>          # Technology stack information
--context-info <info>        # Additional context information
--user-feedback <feedback>    # User feedback (for prd-rework)
--var <key=value>             # Custom variable (can be used multiple times)
--full-context               # Include comprehensive project context
--executor <type>             # Format output for specific executor
```

### ADVANCED OPTIONS
```bash
--executor <type>             # Format output: opencode, claude, gemini, codex
```

### PROMPT EXAMPLES

#### Basic Prompt Building
```bash
# List available prompts
task-o-matic prompt --list

# Show prompt metadata
task-o-matic prompt --metadata prd-parsing

# Build PRD parsing prompt
task-o-matic prompt prd-parsing --prd-file ./requirements.md

# Build task enhancement prompt
task-o-matic prompt task-enhancement \
  --task-title "Build authentication system" \
  --task-description "Implement JWT-based authentication" \
  --stack-info "Next.js, TypeScript, Prisma"

# Build with custom variables
task-o-matic prompt prd-parsing \
  --var FOCUS="security" \
  --var COMPLEXITY="high" \
  --var DEADLINE="urgent"
```

#### Advanced Prompt Engineering
```bash
# System prompt with full context
task-o-matic prompt prd-parsing --type system --full-context

# Prompt for specific executor
task-o-matic prompt task-enhancement \
  --executor claude \
  --task-title "API integration" \
  --stack-info "FastAPI, PostgreSQL, Redis"

# Multi-variable prompt
task-o-matic prompt prd-parsing \
  --var PROJECT_TYPE="saas" \
  --var TARGET_AUDIENCE="enterprise" \
  --var COMPLIANCE_LEVEL="strict" \
  --var DEADLINE="q4"
```

### AVAILABLE PROMPTS

#### PRD-Related Prompts
- `prd-parsing`: Parse PRD into structured tasks
- `prd-generation`: Generate PRD from product description
- `prd-rework`: Rework PRD based on feedback
- `prd-combination`: Combine multiple PRDs into master PRD
- `prd-question`: Generate clarifying questions for PRD

#### Task-Related Prompts
- `task-enhancement`: Enhance task descriptions with AI
- `task-breakdown`: Break tasks into subtasks using AI
- `task-documentation`: Generate documentation for tasks
- `task-planning`: Create implementation plans for tasks

#### System Prompts
- `documentation-detection`: Detect documentation needs in code
- `workflow-assistance`: General workflow guidance
- `error-analysis`: Analyze and suggest fixes for errors

### PROMPT VARIABLE SYSTEM

#### Built-in Variables
```bash
PRD_CONTENT              # PRD document content
TASK_TITLE               # Task title
TASK_DESCRIPTION           # Task description
TASK_CONTEXT              # Rich task context with metadata
STACK_INFO               # Technology stack information
CONTEXT_INFO              # Combined context information
USER_FEEDBACK            # User feedback for improvements
```

#### Custom Variables
```bash
# Single custom variable
task-o-matic prompt prd-parsing --var CUSTOM_VAR="value"

# Multiple custom variables
task-o-matic prompt task-enhancement \
  --var PRIORITY="high" \
  --var ESTIMATED_EFFORT="large" \
  --var DEPENDENCIES="auth,database"
```

#### Variable Precedence
1. **Custom Variables**: Highest priority, override auto-detection
2. **Explicit Options**: Override auto-detection but below custom variables
3. **Auto-Detection**: Lowest priority, used when custom variables not provided

### PROMPT FORMATTING

#### Executor-Specific Formatting
```bash
# Claude formatting
task-o-matic prompt task-enhancement --executor claude

# OpenCode formatting
task-o-matic prompt task-enhancement --executor opencode

# Gemini formatting
task-o-matic prompt task-enhancement --executor gemini

# Codex formatting
task-o-matic prompt task-enhancement --executor codex
```

### ERROR CONDITIONS
```bash
# Prompt not found
Error: Prompt not found: invalid-prompt
Solution: Use --list to see available prompts

# Missing required variables
Error: Missing required variables: PRD_CONTENT
Solution: Provide required variables or use auto-detection

# Invalid variable format
Error: Invalid variable format: invalid-var
Solution: Use format: --var KEY=value

# File access error
Error: Cannot read file: /path/to/file.md
Solution: Check file path and permissions

# Executor not supported
Error: Invalid executor: invalid-executor
Solution: Use supported executor: opencode, claude, gemini, codex
```

### FIELD OPERATIONS PROTOCOLS

#### CONFIGURATION MANAGEMENT LIFECYCLE
The config, init, and prompt commands implement a complete system management workflow:

1. **Configuration Phase**
   - AI provider and model setup
   - Project initialization and bootstrap
   - Environment configuration
   - Validation and testing

2. **Initialization Phase**
   - Directory structure creation
   - Configuration file generation
   - Bootstrap integration (optional)
   - Error handling and recovery

3. **Prompt Engineering Phase**
   - Template-based prompt building
   - Variable replacement system
   - Context integration and enhancement
   - Multi-format output support

4. **Validation Phase**
   - Configuration validation
   - Prompt syntax checking
   - Variable resolution verification
   - Output format validation

#### AI INTEGRATION PATTERNS
All system management commands support consistent AI integration:

- **Provider Abstraction**: Unified interface across AI providers
- **Model Selection**: Flexible model configuration per operation
- **Authentication**: Secure API key management
- **Streaming Support**: Real-time AI response display
- **Error Handling**: Comprehensive error reporting and retry logic

#### STORAGE INTEGRATION
System management uses consistent storage patterns:

- **Configuration Files**: JSON-based configuration in `.task-o-matic/`
- **Project Metadata**: Rich metadata storage for project tracking
- **Template Storage**: Prompt templates and reusable content
- **Backup Support**: Configuration and data backup capabilities

### SURVIVAL SCENARIOS

#### SCENARIO 1: New Project Setup
```bash
# Initialize project with AI configuration
task-o-matic init init \
  --ai-provider anthropic \
  --ai-model claude-3.5-sonnet \
  --max-tokens 65536

# Bootstrap full-stack application
task-o-matic init init \
  --project-name "wasteland-monitoring" \
  --ai-provider openrouter \
  --ai-model anthropic/claude-3.5-sonnet \
  --frontend next \
  --backend hono \
  --database postgres \
  --auth better-auth \
  --bootstrap

# Configure custom AI provider
task-o-matic config set-ai-provider custom \
  --model custom-llm-v1 \
  --ai-provider-url http://localhost:8080/v1
```

#### SCENARIO 2: AI Optimization
```bash
# Test different AI models for performance
task-o-matic benchmark run task-create \
  --models "anthropic:claude-3.5-sonnet,openai:gpt-4,openrouter:anthropic/claude-3.5-sonnet"

# Configure optimal model based on results
task-o-matic config set-ai-provider openrouter \
  --model anthropic/claude-opus-2024
```

#### SCENARIO 3: Prompt Engineering
```bash
# Create specialized prompt for security tasks
task-o-matic prompt task-enhancement \
  --task-title "Security audit system" \
  --var FOCUS="authentication" \
  --var COMPLIANCE="sox" \
  --var FRAMEWORK="next.js" \
  --var DATABASE="postgresql"

# Test prompt with different executors
task-o-matic prompt task-enhancement \
  --task-title "API integration" \
  --executor opencode
task-o-matic prompt task-enhancement \
  --task-title "API integration" \
  --executor claude
task-o-matic prompt task-enhancement \
  --task-title "API integration" \
  --executor gemini
```

#### SCENARIO 4: Multi-Project Management
```bash
# Initialize multiple projects with consistent configuration
task-o-matic init init \
  --project-name "project-alpha" \
  --ai-provider openrouter \
  --ai-model anthropic/claude-3.5-sonnet

task-o-matic init init \
  --project-name "project-beta" \
  --ai-provider openrouter \
  --ai-model anthropic/claude-3.5-sonnet

# Use configuration template
task-o-matic init init \
  --config-file ./project-template.json \
  --project-name "templated-project"
```

### TECHNICAL SPECIFICATIONS

#### CONFIGURATION DATA MODEL
```typescript
interface Config {
  ai: {
    provider: string;           // AI provider name
    model: string;             // AI model name
    maxTokens?: number;        // Maximum tokens for requests
    temperature?: number;        // AI response randomness (0.0-1.0)
    apiKey?: string;           // API authentication key
    baseURL?: string;          // Custom API endpoint
  };
  project?: {
    name?: string;             // Project name
    version?: string;           // Project version
    description?: string;        // Project description
  };
  storage?: {
    type: string;             // Storage type (filesystem, database, etc.)
    path?: string;             // Custom storage path
  };
  mcp?: {
    context7?: {
      apiKey?: string;         // Context7 API key
    };
  };
}
```

#### PERFORMANCE CHARACTERISTICS
- **Configuration Loading**: 10-50ms
- **Configuration Saving**: 20-100ms
- **Project Initialization**: 5-15 seconds
- **Bootstrap Process**: 30-120 seconds (depends on complexity)
- **Prompt Building**: 50-200ms

#### STORAGE REQUIREMENTS
- **Configuration Files**: 1-10KB per config file
- **Project Metadata**: 5-50KB per project
- **Template Storage**: 10-100KB for prompt templates
- **Cache Storage**: 50-200MB for optimization cache

#### ERROR HANDLING
- **Configuration Recovery**: Automatic backup and restore capabilities
- **Validation Messages**: Clear error descriptions and suggestions
- **Fallback Options**: Default values when configuration is invalid
- **Permission Handling**: Graceful handling of access denied scenarios

**Remember:** Citizen, in the harsh environment of post-deadline wasteland, system management commands are your foundation tools. They provide the infrastructure and configuration needed to establish stable, efficient development environments. Use them wisely to set up your projects for success.

---

**DOCUMENT STATUS:** `Complete`  
**NEXT REVIEW:** `After major feature updates`  
**CONTACT:** `Task-O-Matic System Management Team`