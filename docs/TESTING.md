# Testing Patterns

This document outlines testing conventions and patterns used in task-o-matic.

## Test Framework

- **Framework**: Mocha
- **Runner**: tsx (for TypeScript execution)
- **Assertions**: Node.js `assert` module
- **Test Location**: `src/test/` directory within each package

## Test Structure

Use `describe` for test suites and `it` for individual tests:

```typescript
import assert from "assert";
import { beforeEach, afterEach } from "mocha";

describe("TaskService", () => {
  beforeEach(() => {
    // Setup before each test
    hooks.clear();
  });

  afterEach(() => {
    // Cleanup after each test
  });

  it("should create a task successfully", async () => {
    const task = await taskService.createTask({ title: "Test" });
    assert.strictEqual(task.title, "Test");
  });

  it("should throw error for invalid task", async () => {
    await assert.rejects(
      async () => await taskService.createTask({}),
      /Title is required/
    );
  });
});
```

## Assertion Patterns

Use the `assert` module from Node.js:

```typescript
import assert from "assert";

// Equality
assert.strictEqual(actual, expected);
assert.deepStrictEqual(actual, expected);

// Negation
assert.notStrictEqual(actual, expected);
assert.notDeepStrictEqual(actual, expected);

// Exceptions
assert.throws(() => { throw new Error("test"); });
await assert.rejects(async () => { throw new Error("test"); });

// Truthiness
assert.ok(value);
```

## Test Organization

### Test Location

Place tests next to the code they test:

```
packages/core/
├── src/
│   ├── services/
│   │   ├── task-service.ts
│   │   └── prd-service.ts
│   └── test/
│       ├── task-service.test.ts
│       └── prd-service.test.ts
```

### Test Setup

Use a `test-setup.ts` file for global test configuration:

```typescript
// src/test/test-setup.ts
import { hooks } from "../lib/hook-registry";

// Setup hooks before tests
beforeEach(() => {
  hooks.clear();
});
```

## Testing Patterns

### Dependency Injection in Tests

Inject test dependencies for isolated testing:

```typescript
import { injectTestInstances } from "../test/test-setup";

describe("TaskService with mocks", () => {
  it("should use mock storage", async () => {
    const mockStorage = {
      save: async (task: Task) => ({ ...task, id: "123" })
    };

    const taskService = new TaskService({ storage: mockStorage });
    const result = await taskService.createTask({ title: "Test" });

    assert.strictEqual(result.id, "123");
  });
});
```

### Hook Registry Testing

Clear hooks before each test to ensure isolation:

```typescript
describe("HookRegistry", () => {
  beforeEach(() => {
    hooks.clear();
  });

  it("should register and call listener", async () => {
    let called = false;
    hooks.on("task:created", () => { called = true; });
    await hooks.emit("task:created", { task: {} });
    assert.strictEqual(called, true);
  });
});
```

### Console Suppression

Suppress console.error for expected errors in tests:

```typescript
describe("Error handling", () => {
  it("should handle invalid input", async () => {
    const consoleError = console.error;
    console.error = () => {}; // Suppress expected errors

    try {
      await assert.rejects(async () => {
        await service.invalidOperation();
      });
    } finally {
      console.error = consoleError; // Restore
    }
  });
});
```

## Running Tests

### Run All Tests

From project root:

```bash
bun run test
```

### Run Specific Package Tests

```bash
# Core package tests
cd packages/core
npx mocha -r tsx/cjs src/test/test-setup.ts src/test/**/*.test.ts

# CLI package tests
cd packages/cli
npx mocha -r tsx/cjs src/test/commands.test.ts
```

### Run Single Test File

```bash
# From package directory
npx mocha -r tsx/cjs src/test/test-setup.ts src/test/task-service.test.ts

# From root using workspace filter
bun run --filter task-o-matic-core test -- src/test/task-service.test.ts
```

## CLI Testing

For CLI commands, use the safer `execFileNoThrow` utility:

```typescript
import { execFileNoThrow } from "../utils/execFileNoThrow";

describe("CLI Commands Help", () => {
  const runHelp = async (cmd: string) => {
    const result = await execFileNoThrow("bun", [
      "src/cli/bin.ts",
      cmd,
      "--help"
    ]);

    assert.strictEqual(result.status, 0, `Error: ${result.stderr}`);
    assert.ok(result.stdout.includes("Usage:"));
  };

  it("should show help for init command", async () => {
    await runHelp("init");
  });
});
```

## Best Practices

1. **Isolation**: Each test should be independent and clear its own state
2. **Descriptive names**: Test names should clearly describe what they test
3. **One assertion per test**: Tests should focus on a single behavior
4. **Arrange-Act-Assert**: Structure tests clearly
5. **Mock external dependencies**: Use dependency injection for testable code
6. **Test error cases**: Explicitly test error handling and edge cases
7. **Use safe exec**: Always use `execFileNoThrow` instead of `exec` for CLI testing

## Related Documentation

- [Code Conventions](CONVENTIONS.md)
- [Architecture Patterns](ARCHITECTURE.md)
- [AGENTS.md](../AGENTS.md) (root documentation)
