# Task-O-Matic CLI Agent Guide

## Autonomous Work Flow

This guide defines the continuous autonomous work cycle for AI agents using Task-O-Matic CLI.

### Core Workflow Loop

```bash
# 1. Get next available subtask (prioritizes subtasks over main tasks)
task-o-matic tasks get-next

# If main task returned, mark as in-progress and get next again
task-o-matic tasks status --id <main-task-id> --status in-progress
task-o-matic tasks get-next

# 2. Show task details and set to in-progress
task-o-matic tasks show --id <task-id>
task-o-matic tasks status --id <task-id> --status in-progress

# 3. Create implementation plan
# Use a Plan agent to create an implementation plan for this task

# 4. Execute the plan
# use a Build agent to execute the plan, get needed documentation using context7

# 5. Validate implementation
npm run check-types
# Fix any type errors before proceeding

# 6. Build validation
npm run build
# Fix any build errors before proceeding

# 7. Commit changes
git add .
git commit -m "<task-description> -- by ArtificialD"

# 8. Mark task completed
task-o-matic tasks status --id <task-id> --status completed

# 9. Repeat - get next task
task-o-matic tasks get-next
```

### Key Principles

- **Always work on subtasks first** - `get-next` prioritizes subtasks
- **Never skip validation** - Both type check and build must pass
- **Commit after each task** - Maintain clean git history
- **Continuous loop** - Immediately move to next task after completion
- **Stream AI output** - Use `--stream` flag for real-time feedback during planning

### Error Handling

- Type errors: Fix immediately, re-run `npm run check-types`
- Build errors: Fix immediately, re-run `npm run build`
- Execution failures: Review plan, adjust, re-execute

### Task States

- `todo` → `in-progress` → `completed`
- Main tasks marked `in-progress` when work begins on their subtasks
- Only mark `completed` when all validation passes and code is committed

This workflow ensures continuous autonomous development with proper validation and version control at each step.
