# Plan: Task-o-matic Codebase Improvements

## Status: Execute Commands Harmonization ✅ COMPLETED

The execute and execute-loop commands have been successfully harmonized with:
- Unified core execution logic in `task-execution-core.ts`
- Shared utilities extracted (git-utils, task-planning, task-review)
- Both commands now have feature parity
- 30% code reduction with better organization
- All tests passing

---

## Identified Improvement Opportunities

Based on comprehensive codebase exploration, the following improvement opportunities have been identified across 23 command files:

### Priority 1: Critical DRY Violations (High Impact)

#### 1. Progress Handler Wrapper Pattern
**Impact**: Affects 5 files, ~40 lines of duplicate code
**Files**: `create.ts`, `enhance.ts`, `split.ts`, `plan.ts`, `document.ts`

**Current Duplication**:
```typescript
const progressHandler = (payload: any) => displayProgress(payload);
hooks.on("task:progress", progressHandler);
try {
  // operation
} finally {
  hooks.off("task:progress", progressHandler);
}
```

**Proposed Solution**: Create `src/utils/progress-tracking.ts`
```typescript
export async function withProgressTracking<T>(
  fn: () => Promise<T>
): Promise<T> {
  const progressHandler = (payload: ProgressEvent) => displayProgress(payload);
  hooks.on("task:progress", progressHandler);
  try {
    return await fn();
  } finally {
    hooks.off("task:progress", progressHandler);
  }
}
```

**Benefits**:
- Removes ~40 lines of duplicate code
- Fixes type safety (`any` → `ProgressEvent`)
- Consistent progress handling

---

#### 2. Mutual Exclusivity Validation
**Impact**: Affects 3 files (enhance, split, plan)
**Duplication**: Exact same 6-line pattern repeated 3 times

**Current Duplication**:
```typescript
if (!options.taskId && !options.all) {
  throw new Error("Either --task-id or --all must be specified");
}
if (options.taskId && options.all) {
  throw new Error("Cannot specify both --task-id and --all");
}
```

**Proposed Solution**: Create `src/utils/cli-validators.ts`
```typescript
export function validateMutuallyExclusive(
  options: any,
  field1: string,
  field2: string,
  field1Label: string = field1,
  field2Label: string = field2
): void {
  const has1 = Boolean(options[field1]);
  const has2 = Boolean(options[field2]);

  if (!has1 && !has2) {
    throw new Error(`Either --${field1Label} or --${field2Label} must be specified`);
  }
  if (has1 && has2) {
    throw new Error(`Cannot specify both --${field1Label} and --${field2Label}`);
  }
}

export function validateOneRequired(
  options: any,
  ...fields: Array<{ name: string; label: string }>
): void {
  const provided = fields.filter(f => Boolean(options[f.name]));

  if (provided.length === 0) {
    const labels = fields.map(f => `--${f.label}`).join(", ");
    throw new Error(`One of ${labels} must be specified`);
  }
  if (provided.length > 1) {
    const labels = provided.map(f => `--${f.label}`).join(", ");
    throw new Error(`Cannot specify multiple options: ${labels}`);
  }
}
```

**Benefits**:
- Single source of truth for validation logic
- Reusable across all commands
- Better error messages
- Easy to extend

---

#### 3. Bulk Operation Pattern
**Impact**: Affects 2 files, ~70 lines of near-identical code
**Files**: `enhance.ts` (lines 75-113), `split.ts` (lines 92-125)

**Current Duplication**: Nearly identical bulk processing loops with:
- Task fetching
- Progress logging
- Error handling per task
- Final summary

**Proposed Solution**: Create `src/utils/bulk-operations.ts`
```typescript
export interface BulkOperationConfig<T = void> {
  operationName: string; // "Enhancing", "Splitting"
  operationEmoji?: string; // "🤖", "🔧"
  successMessage?: (taskId: string, result: T) => string;
  errorMessage?: (taskId: string, error: Error) => string;
  filters?: {
    status?: string;
    tag?: string;
  };
}

export async function executeBulkOperation<T>(
  operation: (taskId: string) => Promise<T>,
  config: BulkOperationConfig<T>
): Promise<{ succeeded: string[]; failed: Array<{ id: string; error: Error }> }> {
  // Fetch tasks with optional filters
  const tasks = await taskService.listTasks(config.filters || {});

  if (tasks.length === 0) {
    console.log(chalk.yellow(`No tasks found to ${config.operationName.toLowerCase()}`));
    return { succeeded: [], failed: [] };
  }

  const emoji = config.operationEmoji || "🔄";
  console.log(chalk.blue(`${emoji} ${config.operationName} ${tasks.length} tasks...`));

  const succeeded: string[] = [];
  const failed: Array<{ id: string; error: Error }> = [];

  for (let i = 0; i < tasks.length; i++) {
    const task = tasks[i];
    console.log(chalk.cyan(`\n[${i + 1}/${tasks.length}] ${config.operationName} ${task.title}`));

    try {
      const result = await operation(task.id);
      succeeded.push(task.id);

      const msg = config.successMessage
        ? config.successMessage(task.id, result)
        : `✓ ${config.operationName} task ${task.id}`;
      console.log(chalk.green(msg));
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      failed.push({ id: task.id, error: err });

      const msg = config.errorMessage
        ? config.errorMessage(task.id, err)
        : `❌ Failed to ${config.operationName.toLowerCase()} ${task.id}: ${err.message}`;
      console.log(chalk.red(msg));
    }
  }

  // Summary
  console.log(chalk.blue(`\n${"=".repeat(60)}`));
  console.log(chalk.green(`✓ ${succeeded.length} tasks succeeded`));
  if (failed.length > 0) {
    console.log(chalk.red(`❌ ${failed.length} tasks failed`));
  }
  console.log(chalk.blue(`${"=".repeat(60)}\n`));

  return { succeeded, failed };
}
```

**Usage Example**:
```typescript
// In enhance.ts
await executeBulkOperation(
  (taskId) => taskService.enhanceTask(taskId, { useContext7: true }),
  {
    operationName: "Enhancing",
    operationEmoji: "🤖",
    filters: { status: options.status, tag: options.tag },
  }
);
```

**Benefits**:
- Eliminates ~70 lines of duplicate code
- Adds consistent error tracking
- Makes adding filters trivial
- Easy to add dry-run support

---

#### 4. Model/Executor Parser Unification
**Impact**: Type safety issue, affects 2 files
**Files**: `execute.ts` (unsafe cast), `execute-loop.ts` (validated)

**Current Issue**:
- `execute.ts` uses `as any` cast → accepts invalid executors silently
- `execute-loop.ts` validates executors properly
- Duplicate parsing logic

**Proposed Solution**: Create `src/utils/model-executor-parser.ts`
```typescript
import { ExecutorTool, ModelAttemptConfig } from "../types";

const VALID_EXECUTORS: ExecutorTool[] = ["opencode", "claude", "gemini", "codex"];

export function parseTryModels(value: string): ModelAttemptConfig[] {
  return value.split(",").map((item) => {
    const trimmed = item.trim();

    if (trimmed.includes(":")) {
      const [executor, model] = trimmed.split(":");

      // Validate executor
      if (!VALID_EXECUTORS.includes(executor as ExecutorTool)) {
        throw new Error(
          `Invalid executor "${executor}". Must be one of: ${VALID_EXECUTORS.join(", ")}`
        );
      }

      return {
        executor: executor as ExecutorTool,
        model: model.trim(),
      };
    }

    // Just a model name - use default executor
    return { model: trimmed };
  });
}

export function validateExecutor(executor: string): executor is ExecutorTool {
  return VALID_EXECUTORS.includes(executor as ExecutorTool);
}

export { VALID_EXECUTORS };
```

**Benefits**:
- Single source of truth for parsing
- Type-safe validation
- Better error messages
- Easy to extend with new executors

---

### Priority 2: Command Enhancements (Medium Impact)

#### 5. Add Filtering to Bulk Operations
**Impact**: User experience improvement
**Files**: `enhance.ts`, `split.ts`

**Current Gap**: These commands lack `--status` and `--tag` filters that exist in `list`, `execute-loop`, `next`

**Proposed Changes**:

**enhance.ts**:
```typescript
.option("--status <status>", "Filter tasks by status (todo/in-progress/completed)")
.option("--tag <tag>", "Filter tasks by tag")
```

**split.ts**: Same additions

**Implementation**: When using `executeBulkOperation()` utility, pass filters directly

---

#### 6. Add Dry-Run Support
**Impact**: Safety improvement
**Files**: `enhance.ts`, `split.ts`

**Proposed Changes**:
```typescript
.option("--dry", "Preview what would be enhanced/split without making changes")
```

**Implementation**: In `executeBulkOperation()`, add dry-run mode that shows what would be done

---

#### 7. Add Confirmation for Destructive Bulk Operations
**Impact**: Safety improvement
**Files**: `enhance.ts`, `split.ts`

**Proposed Solution**: Create `src/utils/confirmation.ts`
```typescript
import inquirer from "inquirer";
import chalk from "chalk";

export async function confirmBulkOperation(
  operationName: string,
  taskCount: number,
  force: boolean = false
): Promise<boolean> {
  if (force) return true;

  console.log(chalk.yellow(
    `⚠️  This will ${operationName.toLowerCase()} ${taskCount} task(s).`
  ));

  const { confirmed } = await inquirer.prompt([
    {
      type: "confirm",
      name: "confirmed",
      message: `Are you sure you want to proceed?`,
      default: false,
    },
  ]);

  return confirmed;
}
```

**Usage**:
```typescript
.option("--force", "Skip confirmation prompt")

// In action handler
const confirmed = await confirmBulkOperation("enhance", tasks.length, options.force);
if (!confirmed) {
  console.log(chalk.yellow("Operation cancelled"));
  return;
}
```

---

### Priority 3: Type Safety & Code Quality (Medium Impact)

#### 8. Fix Type Safety Issues
**Impact**: Better developer experience, fewer runtime errors
**Files**: Multiple command files using `any`

**Changes Needed**:
1. Import `ProgressEvent` from `src/types/callbacks.ts`
2. Replace all `(payload: any)` with `(payload: ProgressEvent)`
3. Remove `as any` casts in executor parsing
4. Create typed option interfaces

**Example**: Create `src/types/cli-options.ts`
```typescript
export interface TaskIdOrAllOptions {
  taskId?: string;
  all?: boolean;
}

export interface FilterOptions {
  status?: "todo" | "in-progress" | "completed";
  tag?: string;
}

export interface StreamingOptions {
  stream?: boolean;
}

export interface EnhanceCommandOptions extends TaskIdOrAllOptions, FilterOptions, StreamingOptions {
  force?: boolean;
  dry?: boolean;
}

export interface SplitCommandOptions extends TaskIdOrAllOptions, FilterOptions, StreamingOptions {
  force?: boolean;
  dry?: boolean;
}

// ... more option types
```

---

#### 9. Standardize Error Handling
**Impact**: Consistent UX across commands

**Proposed Solution**: Create `src/utils/command-error-handler.ts`
```typescript
import chalk from "chalk";

export function handleCommandError(
  operationName: string,
  error: unknown
): never {
  const message = error instanceof Error ? error.message : "Unknown error";
  console.error(chalk.red(`${operationName} failed:`), message);
  process.exit(1);
}

export function wrapCommandHandler<T>(
  operationName: string,
  handler: () => Promise<T>
): () => Promise<void> {
  return async () => {
    try {
      await handler();
    } catch (error) {
      handleCommandError(operationName, error);
    }
  };
}
```

**Usage**:
```typescript
.action(wrapCommandHandler("Task enhancement", async (options) => {
  // command logic
}));
```

---

### Priority 4: Code Organization (Low-Medium Impact)

#### 10. Split Large Command Files
**Impact**: Better maintainability
**Files**: `plan.ts` (169 lines, 5 sub-commands), `document.ts` (170 lines, 3 sub-commands)

**Proposed Structure**:

**For plan.ts**:
```
src/commands/tasks/plan/
  ├── index.ts         (exports all)
  ├── create.ts        (planCommand)
  ├── get.ts           (getPlanCommand)
  ├── list.ts          (listPlanCommand)
  ├── delete.ts        (deletePlanCommand)
  └── set.ts           (setPlanCommand)
```

**For document.ts**:
```
src/commands/tasks/document/
  ├── index.ts         (exports all)
  ├── analyze.ts       (documentCommand)
  ├── get.ts           (getDocumentationCommand)
  └── add.ts           (addDocumentationCommand)
```

---

#### 11. Extract CSV Parsing Utility
**Impact**: Small, but improves consistency
**Files**: `execute-loop.ts`, `tags.ts`

**Proposed Solution**: In `src/utils/cli-validators.ts`
```typescript
export function parseCsvOption(value: string): string[] {
  return value.split(",").map((x) => x.trim()).filter(Boolean);
}
```

---

#### 12. Standardize Display Functions
**Impact**: Consistent output formatting

**Current Issues**:
- `create.ts` uses `displayEnhancementResult()`
- `enhance.ts` uses custom `console.log()`
- `split.ts` uses `displaySubtaskCreation()` + custom logging
- Inconsistent emoji and color usage

**Proposed Solution**: Create `src/utils/display-helpers.ts`
```typescript
export function displayOperationStart(operation: string, target: string): void {
  console.log(chalk.blue(`\n🚀 ${operation} ${target}...`));
}

export function displayOperationSuccess(operation: string, details?: string): void {
  console.log(chalk.green(`✅ ${operation} completed successfully${details ? `: ${details}` : ""}`));
}

export function displayOperationError(operation: string, error: Error): void {
  console.log(chalk.red(`❌ ${operation} failed: ${error.message}`));
}

export function displayBulkProgress(current: number, total: number, operation: string): void {
  console.log(chalk.cyan(`\n[${current}/${total}] ${operation}...`));
}
```

---

## Implementation Plan

### Phase 1: Extract Core Utilities (High Priority)
**Time Estimate**: 2-3 hours

1. Create `src/utils/progress-tracking.ts` with `withProgressTracking()`
2. Create `src/utils/cli-validators.ts` with validation functions
3. Create `src/utils/bulk-operations.ts` with `executeBulkOperation()`
4. Create `src/utils/model-executor-parser.ts` with unified parsing
5. Update all affected command files to use new utilities
6. Run tests to ensure backward compatibility

**Files to Create**:
- `src/utils/progress-tracking.ts`
- `src/utils/cli-validators.ts`
- `src/utils/bulk-operations.ts`
- `src/utils/model-executor-parser.ts`

**Files to Modify**:
- `src/commands/tasks/create.ts`
- `src/commands/tasks/enhance.ts`
- `src/commands/tasks/split.ts`
- `src/commands/tasks/plan.ts`
- `src/commands/tasks/document.ts`
- `src/commands/tasks/execute.ts`
- `src/commands/tasks/execute-loop.ts`

---

### Phase 2: Enhance Command Features (Medium Priority)
**Time Estimate**: 2-3 hours

1. Add `--status` and `--tag` filters to enhance and split commands
2. Add `--dry` option to enhance and split commands
3. Create `src/utils/confirmation.ts` with confirmation prompt
4. Add `--force` option to enhance and split commands
5. Test all new options

**Files to Create**:
- `src/utils/confirmation.ts`

**Files to Modify**:
- `src/commands/tasks/enhance.ts`
- `src/commands/tasks/split.ts`

---

### Phase 3: Type Safety Improvements (Medium Priority)
**Time Estimate**: 2 hours

1. Create `src/types/cli-options.ts` with typed option interfaces
2. Import `ProgressEvent` type in all command files
3. Replace all `(payload: any)` with proper types
4. Remove `as any` casts
5. Update imports across command files
6. Run type checking: `bun run check-types`

**Files to Create**:
- `src/types/cli-options.ts`

**Files to Modify**:
- All command files using progress handlers or `any` types

---

### Phase 4: Error Handling Standardization (Low Priority)
**Time Estimate**: 1-2 hours

1. Create `src/utils/command-error-handler.ts`
2. Wrap all command handlers with error handling
3. Standardize error messages
4. Test error scenarios

**Files to Create**:
- `src/utils/command-error-handler.ts`

**Files to Modify**:
- All command files

---

### Phase 5: Code Organization (Low Priority)
**Time Estimate**: 2-3 hours

1. Split `plan.ts` into submodules
2. Split `document.ts` into submodules
3. Create `src/utils/display-helpers.ts`
4. Extract CSV parsing utility
5. Update imports and ensure everything works

**Files to Create**:
- `src/commands/tasks/plan/` (6 files)
- `src/commands/tasks/document/` (4 files)
- `src/utils/display-helpers.ts`

**Files to Modify**:
- Various command files using display functions

---

## Success Criteria

✅ **Code Quality**:
- Zero `any` types in command handlers
- Zero `as any` casts
- All utilities have proper TypeScript types

✅ **DRY Compliance**:
- No duplicate progress handler patterns
- No duplicate validation logic
- No duplicate bulk operation logic
- Shared parsing utilities

✅ **Feature Parity**:
- Enhance and split commands have filtering options
- Enhance and split commands have dry-run support
- Bulk operations have confirmation prompts

✅ **Testing**:
- All existing tests pass: `bun test`
- No TypeScript errors: `bun run check-types`
- Manual testing of new features

✅ **Code Reduction**:
- Expected reduction: ~150-200 lines of duplicate code
- Better code organization and maintainability

---

## Benefits Summary

1. **Maintainability**: Single source of truth for common patterns
2. **Type Safety**: Proper types throughout, fewer runtime errors
3. **User Experience**: Consistent commands with better features
4. **Developer Experience**: Easier to add new commands
5. **Code Quality**: Less duplication, better organization
6. **Safety**: Confirmation prompts, dry-run support, better validation

---

## Backward Compatibility

All changes maintain backward compatibility:
- Existing command options work as before
- New options are optional/additive
- Error handling is improved but doesn't break existing behavior
- All tests continue to pass

---

## User Preferences (Confirmed)

✅ **Selected Phases**: ALL (1-5)
✅ **Breaking Changes**: Minor breaking changes allowed with deprecation warnings

## Implementation Order

**Phase 1: Core Utilities** → **Phase 2: Command Enhancements** → **Phase 3: Type Safety** → **Phase 4: Error Handling** → **Phase 5: Code Organization**

Total time estimate: 9-13 hours of focused work

## Deprecation Strategy (Minor Breaking Changes)

Where inconsistencies exist, we'll:
1. Add the improved option with the correct name
2. Keep the old option but show deprecation warning
3. Document the change in migration notes
4. Plan to remove deprecated options in next major version

Example:
```typescript
.option("--task-id <id>", "Task ID (recommended)")
.option("--taskId <id>", "Task ID (deprecated, use --task-id)")
```

## Next Steps

Implement all 5 phases in order:
1. Start with Phase 1 (core utilities - highest impact)
2. Run tests after each utility is created
3. Move to Phase 2 (command enhancements)
4. Phase 3 (type safety fixes)
5. Phase 4 (error handling)
6. Phase 5 (code organization)
7. Final integration testing
8. Update documentation with new patterns and migration notes
