---
name: code-reviewer
description: Review code changes against task requirements, generate structured feedback, and create fix subtasks for issues found. Use after task execution to validate implementation quality and create actionable fixes.
---

# Code Reviewer

Review changes and create fix subtasks.

## Workflow

1. Load task requirements
2. Review git diff
3. Check against review checklist
4. Generate feedback
5. Create fix subtasks for issues

## Phase 1: Load Task

```bash
npx task-o-matic tasks show --id <id>
npx task-o-matic tasks get-plan --id <id>
```

Extract:

- Task title and description
- Acceptance criteria
- Technical requirements

## Phase 2: Review Changes

```bash
git diff HEAD~1
# or
git diff <commit-before-execution>
```

## Phase 3: Check Against Criteria

See [review-checklist.md](references/review-checklist.md)

Categories:

- **Critical**: Breaks functionality, security issues
- **Major**: Missing requirements, poor patterns
- **Minor**: Style, naming, minor improvements

## Phase 4: Generate Feedback

Format per [feedback-format.md](references/feedback-format.md):

```
## Review Summary

### Critical Issues (must fix)
- [ ] Issue 1: description

### Major Issues (should fix)
- [ ] Issue 2: description

### Minor Issues (nice to have)
- [ ] Issue 3: description

### Approved
- [x] Requirement 1 met
```

## Phase 5: Create Fix Subtasks

For each Critical and Major issue:

```bash
npx task-o-matic tasks create \
  --parent-id <current-task-id> \
  --title "Fix: <issue summary>" \
  --content "<detailed fix instructions>" \
  --effort small
```

Note: The parent might itself be a subtask. Use the current task's ID as `--parent-id`.

## Output

Return:

- Review summary
- Count of issues by severity
- List of created fix subtask IDs
