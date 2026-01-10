# Workflow States

## Task Status Transitions

```
todo → in-progress → completed
         ↑    ↓
         ←←←←←← (fix cycle)
```

## State: todo

Initial state. Task has not been started.

**Actions**: Get next, show details, set in-progress

## State: in-progress

Task is being worked on.

**Actions**: Execute, validate, review, create fix subtasks

**Transitions**:

- → `completed`: Validation passes, no review issues
- → `in-progress` (stay): Fix subtasks created, need to resolve

## State: completed

Task is done.

**Actions**: None (terminal state)

## Subtask Lifecycle

1. Parent set to `in-progress`
2. Execute parent
3. Review finds issues
4. Create fix subtasks (status: `todo`)
5. Execute each fix subtask
6. Mark fix subtasks `completed`
7. Re-validate parent
8. If clean → mark parent `completed`
