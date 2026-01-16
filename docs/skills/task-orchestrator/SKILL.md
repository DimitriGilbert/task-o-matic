---
name: task-orchestrator
description: Autonomous agent loop for executing, validating, and completing tasks. Handles state transitions, subtask management, and review cycles.
---

# Task Orchestrator

**Goal**: Drive tasks from `todo` to `completed` with strict quality gates.

## Core Rules
1. **Validation First**: NEVER complete a task without passing build/tests.
2. **Subtask Priority**: BLOCKED if subtasks are incomplete.
3. **Status Truth**: ALWAYS update status to reflect reality (`in-progress` when starting).
4. **Context Aware**: ALWAYS read linked PRD requirements before execution.

## The Loop

### 1. Claim & Context
Find work and lock it.

```bash
# Find next task
npx task-o-matic tasks get-next --status todo

# Set status (replace <ID> with the ID found above)
npx task-o-matic tasks status --id <ID> --status in-progress

# Load Context (Check for prdFile/prdRequirement)
npx task-o-matic tasks show --id <ID>
```

### 2. Execute
Perform the work. Use available tools (`opencode`, `edit`, `bash`).
*If task is complex, split it:* `npx task-o-matic tasks split --id $TASK_ID`

### 3. Validate
Run project-specific checks.

```bash
# Example validation cycle
bun run check-types && bun run build && bun test
```

### 4. Review & Fix
Triggers `code-reviewer` skill if validation passes.

*   **If Review Fails**: Create fix subtasks.
    ```bash
    npx task-o-matic tasks create --parent-id $TASK_ID --title "Fix: <issue>" --effort small
    ```
    *Loop back to Step 1 for the fix subtask.*

*   **If Review Passes**: Proceed to completion.

### 5. Completion
Only when:
- [x] Code implemented
- [x] Validation passed
- [x] Review approved
- [x] All subtasks completed

```bash
npx task-o-matic tasks status --id $TASK_ID --status completed
```

## Helper Scripts
- `scripts/check-status.sh <id>`: View task status and subtask tree.
