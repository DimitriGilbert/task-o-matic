## TECHNICAL BULLETIN NO. 006
### CONFIG, INIT & PROMPT COMMANDS - SYSTEM MANAGEMENT FIELD OPERATIONS

**DOCUMENT ID:** `task-o-matic-cli-system-commands-v2`
**CLEARANCE:** `All Personnel`
**MANDATORY COMPLIANCE:** `Yes`

### ⚠️ CRITICAL SURVIVAL NOTICE
Citizen, system management commands are your foundation tools in the post-deadline wasteland. Without proper configuration and initialization, you're building on radioactive ground. These commands provide the infrastructure and setup capabilities needed to establish stable project bases.

### COMMAND ARCHITECTURE OVERVIEW
The system management command group represents the foundational layer of Task-O-Matic. It handles project initialization, configuration management, and prompt building capabilities. The architecture ensures consistent setup across different project types and development environments.

**System Management Components:**
- **Project Initialization**: Complete project setup with AI and framework bootstrapping
- **Project Attachment**: Attach task-o-matic to existing codebases with stack detection
- **Configuration Management**: AI provider configuration and project settings
- **Prompt Engineering**: Advanced AI prompt building with variable replacement and auto-detection
- **Bootstrap Integration**: Better-T-Stack CLI integration for full-stack applications
- **Environment Setup**: Development environment configuration and validation

---

## COMPLETE CONFIG COMMAND DOCUMENTATION

### CONFIG COMMAND
**Command:** `task-o-matic config`

#### COMMAND SIGNATURE
```bash
task-o-matic config [subcommand] [options]
```

---

### GET-AI-CONFIG SUBCOMMAND
**Command:** `task-o-matic config get-ai-config`

Get the current AI configuration from the project.

#### COMMAND SIGNATURE
```bash
task-o-matic config get-ai-config
```

#### GET-AI-CONFIG EXAMPLES

##### Basic Configuration Display
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

#### Configuration Information Displayed
- **AI Provider**: Currently configured AI service provider
- **AI Model**: Selected AI model for operations
- **Max Tokens**: Maximum token limit for AI requests
- **Temperature**: AI response randomness setting (0.0-1.0)
- **API Key**: Authentication key (masked in output)
- **Base URL**: Custom API endpoint if configured
- **Additional Settings**: Provider-specific configuration options

#### ERROR CONDITIONS
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

---

### SET-AI-PROVIDER SUBCOMMAND
**Command:** `task-o-matic config set-ai-provider`

Set the AI provider and optionally specify a model.

#### COMMAND SIGNATURE
```bash
task-o-matic config set-ai-provider <provider> [model]
```

#### REQUIRED ARGUMENTS
```bash
<provider>                  # AI provider (required)
<model>                    # AI model (optional)
```

#### SET-AI-PROVIDER EXAMPLES

##### Basic Provider Configuration
```bash
# Set OpenRouter provider
task-o-matic config set-ai-provider openrouter

# Set provider with specific model
task-o-matic config set-ai-provider anthropic claude-3.5-sonnet

# Set OpenAI provider
task-o-matic config set-ai-provider openai gpt-4
```

#### Configuration Validation
- **Provider Validation**: Check if provider is supported
- **Model Validation**: Verify model exists for provider
- **Configuration Merging**: Combine with existing config
- **Immediate Persistence**: Changes saved immediately to config.json

#### ERROR CONDITIONS
```bash
# Invalid provider
Error: Unknown AI provider: invalid-provider
Solution: Use supported provider: openrouter, anthropic, openai, custom

# Configuration file corruption
Error: Configuration file is corrupted
Solution: Restore from backup or reinitialize
```

---

### INFO SUBCOMMAND
**Command:** `task-o-matic config info`

Get detailed information about the current task-o-matic project, including directory paths and configuration status.

#### COMMAND SIGNATURE
```bash
task-o-matic config info
```

#### INFO COMMAND EXAMPLES

##### Basic Project Information
```bash
# Show project details
task-o-matic config info

# Check if project is initialized
task-o-matic config info

# Display configuration file location
task-o-matic config info
```

#### INFO OUTPUT FORMAT
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

#### Project Information Displayed
- **Project Directory**: Current working directory path
- **Task-O-Matic Directory**: Path to .task-o-matic configuration directory
- **Configuration Status**: Whether config file exists and is valid
- **Configuration Content**: Current configuration settings (displayed in gray text)
- **Initialization Status**: Whether project has been properly initialized

#### ERROR CONDITIONS
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

---

## COMPLETE INIT COMMAND DOCUMENTATION

### INIT COMMAND
**Command:** `task-o-matic init`

#### COMMAND SIGNATURE
```bash
task-o-matic init [subcommand] [options]
```

---

### INIT SUBCOMMAND
**Command:** `task-o-matic init init`

Initialize a new task-o-matic project in the current or specified directory. Creates the `.task-o-matic/` directory structure with configuration files.

#### COMMAND SIGNATURE
```bash
task-o-matic init init [options]
```

#### AI CONFIGURATION OPTIONS
```bash
--ai-provider <provider>       # AI provider (openrouter/anthropic/openai/custom, default: openrouter)
--ai-model <model>           # AI model (default: z-ai/glm-4.6)
--ai-key <key>               # AI API key
--ai-provider-url <url>       # AI provider URL
--max-tokens <tokens>        # Max tokens for AI (min 32768 for 2025, default: 32768)
--temperature <temp>         # AI temperature (default: 0.5)
```

#### BOOTSTRAP OPTIONS
```bash
--no-bootstrap               # Skip bootstrap after initialization (default: false)
--project-name <name>        # Project name for bootstrap
--directory <dir>            # Working directory for project
```

#### BOOTSTRAP FRAMEWORK OPTIONS (when --project-name is provided)
```bash
--frontend <frameworks...>    # Frontend framework(s) - space/comma-separated (default: next)
--backend <framework>         # Backend framework (default: convex)
--database <database>         # Database choice (sqlite/postgres/mysql/mongodb)
--auth <provider>           # Authentication provider (better-auth/none, default: better-auth)
--package-manager <pm>       # Package manager (npm/pnpm/bun, default: npm)
--runtime <runtime>         # Runtime (bun/node, default: node)
--payment <payment>         # Payment provider (none/polar, default: none)
--cli-deps <level>        # CLI dependency level (minimal/standard/full/task-o-matic, default: standard)
```

#### CONTEXT7 INTEGRATION
```bash
--context7-api-key <key>     # Context7 API key for documentation fetching
```

#### INIT EXAMPLES

##### Basic Initialization
```bash
# Initialize with defaults in current directory
task-o-matic init init

# Initialize with custom AI provider
task-o-matic init init \
  --ai-provider anthropic \
  --ai-model claude-3.5-sonnet \
  --max-tokens 65536

# Initialize without bootstrapping
task-o-matic init init --no-bootstrap
```

##### Initialization with Bootstrap
```bash
# Initialize and bootstrap full-stack project
task-o-matic init init \
  --project-name "wasteland-shelter" \
  --frontend next \
  --backend hono \
  --database postgres \
  --auth better-auth

# Initialize in custom directory with bootstrap
task-o-matic init init \
  --directory ./projects/shelter \
  --project-name "shelter-project" \
  --ai-provider anthropic \
  --ai-model claude-opus-2024 \
  --bootstrap
```

##### Advanced Bootstrap Scenarios
```bash
# Full-stack project with AI configuration
task-o-matic init init \
  --ai-provider openrouter \
  --ai-model anthropic/claude-3.5-sonnet \
  --project-name "emergency-response" \
  --frontend next \
  --backend hono \
  --database postgres \
  --auth better-auth

# Multi-framework project (web + native + CLI)
task-o-matic init init \
  --project-name "multi-platform" \
  --frontend "next native-bare cli" \
  --backend hono \
  --database postgres

# CLI-only project
task-o-matic init init \
  --project-name "shelter-cli" \
  --frontend cli \
  --cli-deps full \
  --no-bootstrap
```

#### INITIALIZATION PROCESS

##### Directory Setup
1. **Directory Creation**: Create target directory if specified with `--directory`
2. **Working Directory**: Set working directory in ConfigManager
3. **Permission Check**: Verify write access to target location

##### Task-O-Matic Structure Creation
1. **Base Directory**: Create `.task-o-matic/` directory
2. **Subdirectories**: Create `tasks/`, `prd/`, `logs/`, `docs/` directories
3. **Configuration Files**: Initialize `config.json` and `mcp.json`

##### Configuration Setup
1. **AI Configuration**: Set up AI provider and model settings
2. **Default Values**: Apply sensible defaults for unspecified options
3. **Validation**: Verify configuration integrity and accessibility

##### Bootstrap Integration (when --project-name provided)
1. **Better-T-Stack CLI**: Call external bootstrap tool
2. **Framework Selection**: Configure frontend, backend, database options
3. **Project Generation**: Create complete project structure
4. **Error Handling**: Graceful handling of bootstrap failures

---

### ATTACH SUBCOMMAND
**Command:** `task-o-matic init attach`

Attach task-o-matic to an existing project. Detects the technology stack automatically and can run full project analysis including TODOs and features.

#### COMMAND SIGNATURE
```bash
task-o-matic init attach [options]
```

#### ANALYSIS OPTIONS
```bash
--analyze                    # Run full project analysis including TODOs and features
--create-prd                 # Auto-generate a PRD from codebase analysis
--dry-run                    # Just detect stack, don't create files
--redetect                   # Force re-detection of stack (overwrites cached stack.json)
```

#### AI CONFIGURATION OPTIONS
```bash
--ai-provider <provider>       # AI provider (openrouter/anthropic/openai/custom, default: openrouter)
--ai-model <model>           # AI model (default: z-ai/glm-4.6)
--ai-key <key>               # AI API key
--ai-provider-url <url>       # AI provider URL
--max-tokens <tokens>        # Max tokens for AI (default: 32768)
--temperature <temp>         # AI temperature (default: 0.5)
```

#### CONTEXT7 INTEGRATION
```bash
--context7-api-key <key>     # Context7 API key
```

#### ATTACH EXAMPLES

##### Basic Stack Detection
```bash
# Attach with basic stack detection
task-o-matic init attach

# Detect stack without creating files (dry run)
task-o-matic init attach --dry-run

# Force re-detection of stack
task-o-matic init attach --redetect
```

##### Full Project Analysis
```bash
# Attach with full analysis including TODOs and features
task-o-matic init attach --analyze

# Attach with analysis and PRD generation
task-o-matic init attach --analyze --create-prd

# Custom AI configuration during attach
task-o-matic init attach \
  --analyze \
  --create-prd \
  --ai-provider anthropic \
  --ai-model claude-3.5-sonnet
```

#### ATTACHMENT PROCESS

##### Prerequisites Check
1. **package.json Verification**: Ensure project has package.json
2. **Existing Config Check**: Warn if already initialized (unless --redetect)
3. **Git Detection**: Check for .git directory

##### Stack Detection
1. **Language Detection**: Identify TypeScript/JavaScript
2. **Framework Detection**: Detect Next.js, Express, Hono, Vue, Svelte, etc.
3. **Database Detection**: Identify Postgres, MongoDB, SQLite, MySQL
4. **ORM Detection**: Detect Prisma, Drizzle, TypeORM
5. **Auth Detection**: Identify Better-Auth, Clerk, NextAuth, Auth0
6. **Package Manager & Runtime**: Detect npm, pnpm, bun, yarn
7. **Testing & Build Tools**: Identify test frameworks and build tools
8. **Confidence Scoring**: Calculate detection confidence percentage

##### Full Project Analysis (when --analyze)
1. **Project Structure**: Analyze monorepo structure, source directories
2. **Documentation**: Scan for existing documentation files
3. **TODO Detection**: Find TODO comments throughout codebase
4. **Feature Detection**: Identify existing features from code
5. **Test & CI/CD**: Check for tests and CI/CD configuration
6. **Docker Detection**: Identify Docker presence

##### PRD Generation (when --create-prd)
1. **Codebase Analysis**: Use detected stack and analysis results
2. **PRD Construction**: Generate PRD from current implementation
3. **File Output**: Save PRD to `.task-o-matic/prd/current-state.md`

#### Information Displayed

##### Stack Detection Output
```
✅ Stack detected:
   Language: TypeScript
   Framework(s): Next.js, Express
   Database: PostgreSQL
   ORM: Prisma
   Auth: Better-Auth
   Package Manager: pnpm
   Runtime: Bun
   API: tRPC
   Confidence: 87%
```

##### Analysis Output
```
✅ Project analysis complete:
   Project: shelter-manager
   Version: 1.0.0

📁 Structure:
   Monorepo: Yes
   Source directories: 3
   Has tests: Yes
   Has CI/CD: Yes
   Has Docker: No

📝 TODOs found: 15 comments
   [TODO] src/auth/index.ts:42 - Implement refresh token logic
   ...

🔧 Features detected: 8
   - User Authentication: JWT-based authentication system
   - Resource Management: Track bunker supplies
   ...
```

#### ERROR CONDITIONS
```bash
# No package.json found
Error: No package.json found in this directory
Solution: Run 'task-o-matic init init' to create a new project

# Already initialized (without --redetect)
Warning: This project is already initialized with task-o-matic
Solution: Use --redetect to re-analyze stack

# Stack detection failed
Error: Stack detection failed
Solution: Check project structure and ensure valid package.json

# PRD generation failed
Error: Failed to generate PRD
Solution: Check error message and ensure AI is properly configured
```

---

### BOOTSTRAP SUBCOMMAND
**Command:** `task-o-matic init bootstrap`

Bootstrap a new project with Better-T-Stack. This command creates a complete project structure with chosen frontend, backend, database, and optional addons.

#### COMMAND SIGNATURE
```bash
task-o-matic init bootstrap <name> [options]
```

#### REQUIRED ARGUMENTS
```bash
<name>                      # Project name (required)
```

#### FRAMEWORK OPTIONS
```bash
--frontend <frameworks...>    # Frontend framework(s) - space/comma-separated (default: next)
--backend <backend>         # Backend framework (default: hono)
--database <database>       # Database (default: sqlite)
--orm <orm>                # ORM (default: drizzle)
```

#### AUTHENTICATION OPTIONS
```bash
--auth <auth>              # Authentication provider (default: better-auth)
--no-auth                 # Exclude authentication
```

#### ADDONS & FEATURES
```bash
--addons <addons...>       # Additional addons
--examples <examples...>   # Examples to include (todo/ai)
--template <template>      # Use predefined template (mern/pern/t3/uniwind/none)
```

#### GIT & INSTALLATION OPTIONS
```bash
--no-git                  # Skip git initialization
--no-install              # Skip installing dependencies
--package-manager <pm>    # Package manager (default: npm)
```

#### DATABASE SETUP
```bash
--db-setup <setup>         # Database setup (turso/neon/prisma-postgres/mongodb-atlas)
```

#### RUNTIME & API OPTIONS
```bash
--runtime <runtime>       # Runtime (default: node)
--api <type>            # API type (trpc/orpc)
```

#### PAYMENT & CLI DEPENDENCIES
```bash
--payment <payment>       # Payment provider (default: none)
--cli-deps <level>     # CLI dependency level (default: standard)
```

#### BOOTSTRAP EXAMPLES

##### Basic Web Application
```bash
# Simple Next.js app with SQLite
task-o-matic init bootstrap shelter-app \
  --frontend next \
  --backend hono \
  --database sqlite

# Full-stack with authentication and PostgreSQL
task-o-matic init bootstrap emergency-system \
  --frontend next \
  --backend hono \
  --database postgres \
  --auth better-auth
```

##### Advanced Bootstrap Scenarios
```bash
# Multi-framework project (web + native)
task-o-matic init bootstrap multi-platform \
  --frontend "next native-bare" \
  --backend hono \
  --database postgres \
  --orm drizzle

# With specific addons
task-o-matic init bootstrap project-x \
  --frontend next \
  --backend hono \
  --database postgres \
  --orm drizzle \
  --addons "pwa tauri biome"

# CLI-only application
task-o-matic init bootstrap cli-tool \
  --frontend cli \
  --cli-deps full \
  --package-manager bun

# With custom database setup
task-o-matic init bootstrap data-platform \
  --frontend next \
  --backend hono \
  --database postgres \
  --db-setup neon
```

#### BOOTSTRAP FRAMEWORK SUPPORT

##### Frontend Frameworks
- **Web Frameworks**:
  - `next`: Next.js (React framework)
  - `tanstack-router`: TanStack Router (React)
  - `react-router`: React Router
  - `nuxt`: Nuxt (Vue framework)
  - `svelte`: Svelte framework
  - `solid`: SolidJS framework
- **Native Frameworks**:
  - `native-bare`: Native bare-metal
  - `native-uniwind`: Native with Uniwind styling
  - `native-unistyles`: Native with Unistyles
- **Custom Frameworks**:
  - `cli`: Command-line interface
  - `tui`: Terminal user interface

##### Backend Frameworks
- **Modern Backends**:
  - `hono`: Hono (Fast web framework)
  - `express`: Express.js (Traditional)
  - `fastify`: Fastify (High performance)
  - `elysia`: Elysia (Bun-based)
  - `self`: Self-hosted backend
  - `none`: No backend
- **Traditional Backends**:
  - `convex`: Convex backend

##### Database Options
- **SQLite**: Lightweight file-based database
- **PostgreSQL**: Full-featured relational database
- **MySQL**: Traditional relational database
- **MongoDB**: NoSQL document database

##### ORM Options
- `drizzle`: Drizzle ORM
- `prisma`: Prisma ORM
- `mongoose`: Mongoose (for MongoDB)
- `none`: No ORM

##### Auth Options
- `better-auth`: Better-Auth authentication
- `clerk`: Clerk authentication
- `none`: No authentication

##### Database Setup Services
- `turso`: Edge PostgreSQL with built-in replication
- `neon`: Serverless PostgreSQL
- `prisma-postgres`: Prisma-managed PostgreSQL
- `mongodb-atlas`: MongoDB Atlas cloud database

##### Addon Options
- `turborepo`: Monorepo management
- `pwa`: Progressive Web App capabilities
- `tauri`: Desktop application framework
- `biome`: Code formatting and linting
- `husky`: Git hooks management
- `starlight`: Starlight documentation site generator
- `fumadocs`: Fumadocs documentation
- `ultracite`: Ultracite styling
- `oxlint`: Fast linter
- `ruler`: Ruler linting
- `opentui`: Open TUI framework
- `wxt`: WXT framework

##### Templates
- `mern`: MongoDB, Express, React, Node.js
- `pern`: PostgreSQL, Express, React, Node.js
- `t3`: Next.js, Prisma, tRPC, Tailwind CSS, TypeScript
- `uniwind`: Uniwind styling framework
- `none`: No template

#### ERROR CONDITIONS
```bash
# Not initialized
Error: This directory is not initialized with task-o-matic
Solution: Run 'task-o-matic init init' first

# Better-T-Stack CLI not found
Error: Bootstrap process failed
Solution: Ensure 'better-t-stack-cli' is installed and configured correctly

# Invalid framework combination
Error: Bootstrap process failed
Solution: Check supported framework combinations in Better-T-Stack CLI

# Permission denied
Error: Permission denied creating project files
Solution: Check directory permissions and run with appropriate user
```

---

## COMPLETE PROMPT COMMAND DOCUMENTATION

### PROMPT COMMAND
**Command:** `task-o-matic prompt`

Build AI service prompts with variable replacement for external tools. Features automatic detection of PRD content and stack information, with support for custom variable overrides.

#### COMMAND SIGNATURE
```bash
task-o-matic prompt [name] [options]
```

#### BASIC OPTIONS
```bash
-t, --type <type>           # Prompt type: system or user (default: user)
-l, --list                  # List all available prompts and exit
-m, --metadata <name>        # Show metadata for specific prompt and exit
```

#### CONTENT OPTIONS
```bash
--prd-content <content>       # PRD content (for PRD-related prompts)
--prd-file <filepath>        # Load PRD content from file
--task-title <title>        # Task title (for task-related prompts)
--task-description <description> # Task description (for task-related prompts)
--task-file <filepath>       # Load task description from file
--stack-info <info>         # Technology stack information
--context-info <info>       # Additional context information
--user-feedback <feedback>   # User feedback (for prd-rework)
```

#### VARIABLE OPTIONS
```bash
--var <key=value>           # Custom variable (can be used multiple times)
--full-context             # Include comprehensive project context (file structure, dependencies, etc.)
```

#### EXECUTOR OPTIONS
```bash
--executor <type>           # Format output for specific executor (opencode, claude, gemini, codex)
```

#### PROMPT EXAMPLES

##### Basic Prompt Building
```bash
# List all available prompts
task-o-matic prompt --list

# Show prompt metadata
task-o-matic prompt --metadata prd-parsing

# Build PRD parsing prompt (auto-detects PRD from default location)
task-o-matic prompt prd-parsing

# Build PRD parsing prompt from specific file
task-o-matic prompt prd-parsing --prd-file ./requirements.md

# Build task enhancement prompt with task info
task-o-matic prompt task-enhancement \
  --task-title "Build authentication system" \
  --task-description "Implement JWT-based authentication" \
  --stack-info "Next.js, TypeScript, Prisma"
```

##### Advanced Prompt Engineering
```bash
# System prompt with full context
task-o-matic prompt prd-parsing --type system --full-context

# Prompt for specific executor with custom formatting
task-o-matic prompt task-enhancement \
  --executor claude \
  --task-title "API integration" \
  --stack-info "FastAPI, PostgreSQL, Redis"

# Multi-variable prompt with custom variables
task-o-matic prompt prd-parsing \
  --var FOCUS="security" \
  --var COMPLEXITY="high" \
  --var DEADLINE="urgent" \
  --var PROJECT_TYPE="saas"

# Override auto-detected PRD content with custom content
task-o-matic prompt task-breakdown \
  --prd-content "Custom PRD content here..." \
  --var PRIORITY="critical"
```

##### Task-Related Prompts
```bash
# Build task enhancement from file
task-o-matic prompt task-enhancement \
  --task-file ./tasks/7.md \
  --executor opencode

# Build with rich task context
task-o-matic prompt task-documentation \
  --task-title "User authentication" \
  --task-file ./tasks/auth.md \
  --full-context
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

The prompt command uses a sophisticated variable precedence system with automatic detection capabilities.

#### Variable Precedence (Highest to Lowest Priority)

1. **Custom Variables (--var)**: Highest priority, override everything including auto-detection
2. **Explicit Options**: Override auto-detection but below custom variables
3. **Auto-Detection**: Lowest priority, used when custom variables not provided

#### Auto-Detection Behavior

The prompt command automatically detects and populates the following variables:

##### PRD Content Auto-Detection
- Automatically searches for PRD files in standard locations
- Checks `.task-o-matic/prd/` directory
- Uses first found PRD file
- Can be overridden with `--prd-file` or `--prd-content`

##### Stack Information Auto-Detection
- Automatically detects technology stack from:
  - `.task-o-matic/stack.json` (if exists)
  - `package.json` dependencies and devDependencies
  - Project file structure
- Returns detected framework, database, ORM, auth, etc.
- Can be overridden with `--stack-info`

#### Built-in Variables
```bash
PRD_CONTENT              # PRD document content (auto-detected or provided)
TASK_TITLE               # Task title (for task-related prompts)
TASK_DESCRIPTION         # Task description (for task-related prompts)
TASK_CONTEXT            # Rich task context with metadata (built when title and description provided)
STACK_INFO             # Technology stack information (auto-detected or provided)
CONTEXT_INFO           # Combined context information (stack + PRD + full context)
USER_FEEDBACK          # User feedback for improvements (for prd-rework)
```

#### Custom Variables Usage

##### Single Custom Variable
```bash
task-o-matic prompt prd-parsing --var CUSTOM_VAR="value"
```

##### Multiple Custom Variables
```bash
task-o-matic prompt task-enhancement \
  --var PRIORITY="high" \
  --var ESTIMATED_EFFORT="large" \
  --var DEPENDENCIES="auth,database" \
  --var COMPLIANCE_LEVEL="strict"
```

##### Overriding Auto-Detected Variables
```bash
# Auto-detection will find PRD in standard location
# This --prd-content option overrides auto-detected content
task-o-matic prompt prd-parsing \
  --prd-content "Custom PRD content here..."

# Auto-detection will find stack from project
# This --stack-info option overrides auto-detected stack
task-o-matic prompt task-enhancement \
  --stack-info "Custom stack: React, Node, MongoDB"
```

### PROMPT FORMATTING

#### Executor-Specific Formatting

Format output for different AI coding assistants:

##### Claude Formatting
```bash
task-o-matic prompt task-enhancement --executor claude
```
Optimized for Claude's XML-based syntax and reasoning preferences.

##### OpenCode Formatting
```bash
task-o-matic prompt task-enhancement --executor opencode
```
Optimized for OpenCode's format expectations.

##### Gemini Formatting
```bash
task-o-matic prompt task-enhancement --executor gemini
```
Optimized for Google Gemini's format requirements.

##### Codex Formatting
```bash
task-o-matic prompt task-enhancement --executor codex
```
Optimized for OpenAI Codex's format preferences.

### ERROR CONDITIONS

```bash
# Prompt not found
Error: Prompt not found: invalid-prompt
Solution: Use --list to see available prompts

# Missing required variables
Error: Missing required variables: PRD_CONTENT
Solution: Provide required variables via options, files, or rely on auto-detection

# Invalid variable format
Error: Invalid variable format: invalid-var
Solution: Use format: --var KEY=value

# File access error
Error: Cannot read file: /path/to/file.md
Solution: Check file path and permissions

# Executor not supported
Error: Invalid executor: invalid-executor
Solution: Use supported executor: opencode, claude, gemini, codex

# Prompt name not provided
Error: Prompt name is required unless using --list or --metadata
Solution: Provide a prompt name or use --list to see available prompts
```

---

### FIELD OPERATIONS PROTOCOLS

#### CONFIGURATION MANAGEMENT LIFECYCLE
The config, init, and prompt commands implement a complete system management workflow:

1. **Configuration Phase**
   - AI provider and model setup
   - Project initialization and bootstrap
   - Environment configuration
   - Validation and testing

2. **Initialization Phase**
   - New project setup or attachment to existing codebases
   - Directory structure creation
   - Configuration file generation
   - Bootstrap integration (optional)
   - Stack detection and analysis (for attach)
   - Error handling and recovery

3. **Prompt Engineering Phase**
   - Template-based prompt building
   - Auto-detection of PRD content and stack information
   - Variable replacement system with precedence
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
- **Stack Detection**: Cached in `.task-o-matic/stack.json`
- **Template Storage**: Prompt templates and reusable content
- **Backup Support**: Configuration and data backup capabilities

---

### SURVIVAL SCENARIOS

#### SCENARIO 1: New Project Setup with Bootstrap
```bash
# Initialize and bootstrap full-stack application
task-o-matic init init \
  --project-name "wasteland-monitoring" \
  --ai-provider openrouter \
  --ai-model anthropic/claude-3.5-sonnet \
  --frontend next \
  --backend hono \
  --database postgres \
  --auth better-auth

# Configure AI after initialization
task-o-matic config set-ai-provider openrouter anthropic/claude-opus-2024
```

#### SCENARIO 2: Attaching to Existing Project
```bash
# Attach to existing project with full analysis
task-o-matic init attach --analyze --create-prd

# Just check stack without making changes
task-o-matic init attach --dry-run

# Re-detect stack if structure has changed
task-o-matic init attach --redetect --analyze
```

#### SCENARIO 3: Prompt Engineering with Auto-Detection
```bash
# Build prompt with auto-detected PRD and stack
task-o-matic prompt prd-parsing

# Build prompt with custom variables (overrides auto-detection)
task-o-matic prompt task-enhancement \
  --task-title "Security audit system" \
  --var FOCUS="authentication" \
  --var COMPLIANCE="sox" \
  --var FRAMEWORK="next.js" \
  --var DATABASE="postgresql"

# Build prompt with full context and executor formatting
task-o-matic prompt task-breakdown \
  --task-file ./tasks/7.md \
  --full-context \
  --executor claude
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

# Build consistent prompts across projects
task-o-matic prompt prd-parsing \
  --prd-file ./project-alpha/requirements.md \
  --var PROJECT_TYPE="saas" \
  --var TARGET_AUDIENCE="enterprise"

task-o-matic prompt prd-parsing \
  --prd-file ./project-beta/requirements.md \
  --var PROJECT_TYPE="internal" \
  --var TARGET_AUDIENCE="employees"
```

---

### TECHNICAL SPECIFICATIONS

#### CONFIGURATION DATA MODEL
```typescript
interface Config {
  ai: {
    provider: string;           // AI provider name
    model: string;             // AI model name
    maxTokens?: number;        // Maximum tokens for requests
    temperature?: number;       // AI response randomness (0.0-1.0)
    apiKey?: string;           // API authentication key
    baseURL?: string;          // Custom API endpoint
  };
  project?: {
    name?: string;            // Project name
    version?: string;          // Project version
    description?: string;      // Project description
  };
  storage?: {
    type: string;             // Storage type (filesystem, database, etc.)
    path?: string;            // Custom storage path
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
- **Project Attachment**: 2-10 seconds (depends on project size)
- **Stack Detection**: 1-5 seconds
- **Full Analysis**: 10-30 seconds (depends on codebase size)
- **Bootstrap Process**: 30-120 seconds (depends on complexity)
- **Prompt Building**: 50-200ms

#### STORAGE REQUIREMENTS
- **Configuration Files**: 1-10KB per config file
- **Stack Detection Cache**: 5-50KB per project
- **Analysis Results**: 50-200KB for full project analysis
- **Project Metadata**: 5-50KB per project
- **Template Storage**: 10-100KB for prompt templates
- **Cache Storage**: 50-200MB for optimization cache

#### ERROR HANDLING
- **Configuration Recovery**: Automatic backup and restore capabilities
- **Validation Messages**: Clear error descriptions and suggestions
- **Fallback Options**: Default values when configuration is invalid
- **Permission Handling**: Graceful handling of access denied scenarios
- **Dry-Run Mode**: Preview operations without making changes

---

**Remember:** Citizen, in the harsh environment of post-deadline wasteland, system management commands are your foundation tools. They provide the infrastructure and configuration needed to establish stable, efficient development environments. Use them wisely to set up your projects for success.

The `init attach` command is particularly powerful for rescuing existing projects from the chaos of unorganized development. Use stack detection to understand what you're working with, then use prompt commands to generate consistent outputs across all your projects.

---

**DOCUMENT STATUS:** `Updated to v2`
**NEXT REVIEW:** `After major feature updates`
**CONTACT:** `Task-O-Matic System Management Team`
