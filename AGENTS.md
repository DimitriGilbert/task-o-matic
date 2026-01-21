# AGENTS.md

Task-o-matic is an AI-powered task management system for software development that generates PRDs from ideas, parses them into structured tasks, and automates development workflows with multi-provider AI support.

## Package Manager

This project uses **Bun** as the runtime and package manager. The monorepo uses Bun workspaces to manage `packages/core` and `packages/cli`.

## Development Commands

Run these commands from the **project root**:

- **Install dependencies**: `bun install`
- **Build all packages**: `bun run build`
- **Type checking** (run before committing): `bun run check-types`
- **Run all tests**: `bun run test`

## Absolute Prohibitions

### NEVER Publish Packages

**NEVER run any publish command.** This includes `npm publish`, `bun publish`, `pnpm publish`, `yarn publish`, or any script that triggers publishing (e.g., `bun run release`).

**ALWAYS provide the command to the user. NEVER execute it yourself.**

Violations have caused version mismatches and broken releases.

### NEVER Run Destructive Commands Without Explicit Request

- No `rm -rf` on user directories
- No `git push --force`
- No database drops or resets

## Critical TypeScript Rules

**STRICTLY FORBIDDEN:**

- No `any` types - Use proper typing or `unknown` with type guards
- No `as any` casts - Use proper type assertions
- No `require()` statements - Use ES module imports only
- No dynamic `import()` - Use static imports only

**LSP errors MUST be fixed immediately.** Do not ignore, delay, or add technical debt.

## General Rules

1. When a user asks for a command, **GIVE them the command. Do NOT run it.**
2. Ask before creating test directories or files that litter the project.
3. When debugging, use the user's test commands, not your own assumptions.
4. Read the actual CLI help (`--help`) instead of trusting documentation files.

## Progressive Disclosure

Domain-specific rules are in separate files:

- **[Code Conventions](docs/CONVENTIONS.md)** - TypeScript rules, naming patterns, error handling
- **[Testing Patterns](docs/TESTING.md)** - Mocha framework, test structure, running tests
- **[Architecture Patterns](docs/ARCHITECTURE.md)** - Service layer, dependency injection, AI integration

## Project Context

- **Monorepo**: Two packages - core library (framework-agnostic) and CLI interface
- **AI Integration**: Multi-provider support (Anthropic, OpenAI, Google, OpenRouter, Gemini, ZAI)
- **Better-T-Stack**: Full support for project scaffolding with various tech stacks
- **Storage**: Local file-based in `.task-o-matic/` directory

For detailed project information, see [README.md](README.md).
