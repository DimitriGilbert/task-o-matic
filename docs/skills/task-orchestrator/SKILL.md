---
name: task-orchestrator
description: Orchestrate task-o-matic execution with review cycles, fix subtask creation, and status tracking. Use when implementing tasks that need outer-loop supervision - execute, validate, review, create fixes, update status, repeat until complete.
---

# Task Orchestrator

Execute tasks with review cycles until completion.

## Workflow

```
1. Get task → 2. Set in-progress → 3. Execute → 4. Validate → 5. Review
                                                                   ↓
    ←←←←←←←←←←←←←← 6. Create fix subtasks (if issues) ←←←←←←←←←←←←
    ↓
7. Set completed → 8. Next task
```

## Commands Reference

```bash
# Get next task
npx task-o-matic tasks get-next

# Show task details (check if subtask via parentId)
npx task-o-matic tasks show --id <id>

# Set status
npx task-o-matic tasks status --id <id> --status in-progress
npx task-o-matic tasks status --id <id> --status completed

# Execute task
npx task-o-matic tasks execute --id <id> --tool <tool>

# List subtasks
npx task-o-matic tasks subtasks --id <id>

# View task tree
npx task-o-matic tasks tree --id <id>
```

## Phase 1: Get Task

```bash
# Get next available task
npx task-o-matic tasks get-next --status todo

# Or execute specific task
npx task-o-matic tasks show --id <id>
```

Check `parentId` in output - if present, this task is a subtask.

## Phase 2: Set In-Progress

```bash
npx task-o-matic tasks status --id <id> --status in-progress
```

## Phase 3: Execute

```bash
npx task-o-matic tasks execute --id <id> --tool opencode
```

Available tools: `opencode`, `claude`, `gemini`, `codex`

## Phase 4: Validate

Run project validation commands:

```bash
# Common patterns
bun run check-types
bun run build
bun test
```

If validation fails → continue to review anyway with error context.

## Phase 5: Review

Use the `code-reviewer` skill to:

1. Review changes against task requirements
2. Generate structured feedback
3. Create fix subtasks if issues found

## Phase 6: Handle Fixes (if issues found)

The `code-reviewer` skill creates fix subtasks under the current task:

```bash
npx task-o-matic tasks create --parent-id <current-id> --title "Fix: <issue>"
```

After fix subtasks are created:

1. Keep parent task status as `in-progress`
2. Execute each fix subtask
3. After all fixes complete, re-validate parent task

## Phase 7: Complete

When validation passes and no issues:

```bash
npx task-o-matic tasks status --id <id> --status completed
```

## Handling Nested Tasks

A task might itself be a subtask. Check `parentId` field:

- If `parentId` exists → this is a subtask
- After completing, check if parent is ready to complete

```bash
# Check parent status
task-o-matic tasks show --id <parentId>
task-o-matic tasks subtasks --id <parentId>
```

If all sibling subtasks completed → parent may be completable.
