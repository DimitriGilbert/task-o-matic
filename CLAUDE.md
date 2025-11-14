# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Building and Development
```bash
npm run build          # Clean build (removes dist and rebuilds everything)
npm run build:watch    # Build with watch mode for development
npm run clean          # Clean dist directory and build artifacts
npm run dev            # Run CLI in development mode with tsx
npm run dev:mcp        # Run MCP server in development mode
npm run check-types    # Type checking without compilation
```

### Testing
```bash
npm test              # Run tests with Mocha using tsx
npm run test          # Same as above
```

### Package Management
- Uses `bun.lock` for dependency management (not npm's package-lock.json)
- Run `bun install` for installing dependencies

## Architecture Overview

This is an AI-powered task management CLI that can be used as both a standalone CLI tool and as a library. The codebase follows a clean separation of concerns:

### Core Structure
- **CLI Layer** (`src/cli/`, `src/commands/`): Commander.js-based CLI interface
- **Service Layer** (`src/services/`): Framework-agnostic business logic (`TaskService`, `PRDService`)
- **Core Library** (`src/lib/`): Storage, AI operations, configuration management
- **Types** (`src/types/`): TypeScript type definitions
- **MCP Server** (`src/mcp/`): Model Context Protocol server implementation

### Key Services

#### TaskService (`src/services/tasks.ts`)
- Main business logic for task CRUD operations
- AI-enhanced task creation, splitting, planning, and documentation
- Handles task trees, subtasks, and dependencies
- Framework-agnostic (can be used in CLI, TUI, or web apps)

#### PRDService (`src/services/prd.ts`) 
- Parses Product Requirements Documents into actionable tasks
- AI-powered PRD analysis and improvement
- Handles file copying and project directory management

#### AIOperations (`src/lib/ai-service/ai-operations.ts`)
- Centralized AI service operations using Vercel AI SDK
- Supports multiple providers: OpenAI, Anthropic, OpenRouter, custom endpoints
- Context7 integration for documentation retrieval via MCP tools

#### LocalStorage (`src/lib/storage.ts`)
- File-based storage using JSON files in `.task-o-matic/` directory
- Handles tasks, AI metadata, plans, and project configuration
- All data is project-local (no external database)

### Package Structure
- **Library Export** (`dist/lib/index.js`): Main library entry point for programmatic use
- **CLI Binary** (`dist/cli/bin.js`): CLI executable
- **MCP Server** (`dist/mcp/server.js`): MCP server binary
- **Type Exports** (`dist/types/index.js`): TypeScript definitions

### AI Integration
- Uses Vercel AI SDK for provider abstraction
- Supports streaming responses for real-time feedback
- Context7 MCP integration for fetching library documentation
- Configurable per-project AI settings in `.task-o-matic/config.json`

### Data Storage
All data is stored locally in `.task-o-matic/` directory:
- `tasks/` - Individual task JSON files
- `config.json` - Project configuration and AI settings  
- `prd/` - PRD files and parsing results
- `logs/` - Operation logs
- `plans/` - Task implementation plans
- `docs/` - Cached documentation from Context7

### Testing
- Uses Mocha test runner with tsx for TypeScript execution
- Test files: `src/test/**/*.test.ts`
- Tests focus on core storage and service functionality

## Important Development Notes

### File Structure Conventions
- All source files are in TypeScript
- Uses CommonJS modules (compiled output)
- Entry points are clearly separated by use case (CLI vs library)

### AI Provider Configuration
- Supports environment variables: `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `OPENROUTER_API_KEY`
- Project-local config overrides environment variables
- AI operations include retry logic and error handling

### MCP Integration
- Implements Model Context Protocol for AI tool access
- Provides task management tools to AI models
- Can be used standalone or embedded in AI workflows

### Task Management Features
- Hierarchical tasks with parent-child relationships
- AI-enhanced task descriptions and documentation
- Task splitting/breakdown with context awareness
- Implementation planning with full project context
- Status transitions: todo → in-progress → completed