# AGENTS.md - Critical Rules for AI Agents

## ABSOLUTE PROHIBITIONS

### NEVER PUBLISH PACKAGES

**NEVER, UNDER ANY CIRCUMSTANCES, RUN ANY PUBLISH COMMAND.**

This includes but is not limited to:

- `npm publish`
- `bun publish`
- `pnpm publish`
- `yarn publish`
- Any script that triggers publishing (e.g., `bun run release`, `npm run release`)

**ALWAYS provide the command to the user. NEVER execute it yourself.**

Violations of this rule have caused version mismatches and broken releases. This is UNACCEPTABLE.

### NEVER RUN DESTRUCTIVE COMMANDS WITHOUT EXPLICIT USER REQUEST

- No `rm -rf` on user directories
- No `git push --force`
- No database drops or resets
- No package publishing

## GENERAL RULES

1. When user asks for a command, GIVE them the command. Do NOT run it.
2. Ask before creating test directories or files that litter the project.
3. When debugging, use the user's test commands, not your own assumptions.
4. Read the actual CLI help (`--help`) instead of trusting documentation files.

## DEVELOPMENT WORKFLOW

### Environment

- **Runtime**: Bun (uses `bun.lock` for dependencies).
- **Monorepo**: Managed via Bun workspaces (`packages/cli`, `packages/core`).
- **Language**: TypeScript (Strict mode).
- **Module System**: CommonJS (compiled output).

### Build & Verification Commands

Run these commands from the **project root**:

- **Install Dependencies**:

  ```bash
  bun install
  ```

- **Build All Packages**:

  ```bash
  bun run build
  ```

- **Type Checking** (Run this before committing):

  ```bash
  bun run check-types
  ```

- **Run All Tests**:
  ```bash
  bun run test
  ```

### Running Specific Tests

To run a single test file, use `mocha` directly from the relevant package directory.

**1. Identify the Package**
Check which package the test belongs to (usually `packages/core` or `packages/cli`).

**2. Run from Package Directory**
Change directory to the package and run mocha with the project's setup file.

_For `packages/core`:_

```bash
workdir="packages/core"
bash "npx mocha -r tsx/cjs src/test/test-setup.ts src/test/path/to/your.test.ts"
```

_For `packages/cli`:_

```bash
workdir="packages/cli"
bash "npx mocha -r tsx/cjs src/test/commands.test.ts"
```

_(Note: CLI tests seem centralized in `commands.test.ts` based on package.json, but check for others if needed)_

**3. Run from Root (Alternative)**

```bash
bun run --filter task-o-matic-core test -- src/test/path/to/your.test.ts
```

## CODE STYLE & CONVENTIONS

### TypeScript

- **Strict Mode**: Enabled. No `any` unless absolutely necessary.
- **Async/Await**: Prefer over `.then()`.
- **Imports**: standard ES imports (`import { ... } from "..."`).
- **Exports**: Named exports preferred over default exports.

### Naming

- **Variables/Functions**: `camelCase`
- **Classes/Interfaces**: `PascalCase`
- **Files**: `kebab-case.ts` (e.g., `task-service.ts`)
- **Constants**: `UPPER_SNAKE_CASE`

### Architecture

- **Core Logic**: `packages/core/src/lib/` or `src/services/`.
- **CLI Logic**: `packages/cli/src/commands/`.
- **Types**: Shared types in `packages/core/src/types/`.

### Error Handling

- Use `TaskOMaticError` for expected domain errors.
- Wrap async operations in `try/catch` blocks.
- Do not suppress errors silently.

### Testing Guidelines

- **Framework**: Mocha
- **Runner**: tsx
- **Assertions**: `node:assert` (import assert from "assert")
  - `assert.strictEqual(actual, expected)`
  - `assert.deepStrictEqual(actual, expected)`
  - `assert.throws(() => { ... })`
- **Structure**:
  - `describe("Feature", () => { ... })`
  - `it("should do something", () => { ... })`
- **Location**: `src/test/` directory within each package.

### File System Operations

- Use absolute paths when using tool capabilities (`read`, `write`).
- Construct paths using `path.join()`.
- Be mindful of the monorepo structure; verify where you are before running commands.

### IMPORTANT

- NO `await import` are allowed ! STRICTLY FORBIDDEN !
- `require` is punishable by death ! STRICTLY FORBIDDEN !
- `:any` and `as any` are forbidden ! STRICTLY FORBIDDEN !
- NO `await import` are allowed ! STRICTLY FORBIDDEN !
- `require` is punishable by death ! STRICTLY FORBIDDEN !
- `:any` and `as any` are forbidden ! STRICTLY FORBIDDEN !
- LSP errors MUST be FIXED ! fixing LSP errors is NOT OPTIONAL !
- LSP errors **MUST be FIXED** ! fixing LSP errors is **NOT OPTIONAL** !
- **LSP errors MUST be FIXED** ! fixing LSP errors is **NOT OPTIONAL** !
- **LSP errors MUST be FIXED IMMEDIATELY** ! DO NOT IGNORE ! DO NOT DELAY ! DO NOT ADD TECHNICAL DEBT ! **LSP errors MUST be FIXED IMMEDIATELY**
