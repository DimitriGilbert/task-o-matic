# Feedback Format

## Structure

```markdown
## Review: <Task Title>

**Task ID**: <id>
**Reviewer**: Claude (code-reviewer skill)
**Status**: <APPROVED | NEEDS_FIXES>

---

### Critical Issues (must fix before completion)

1. **[CRITICAL]** <Short title>
   - File: `path/to/file.ts:L42`
   - Issue: <description>
   - Fix: <suggested fix>

---

### Major Issues (should fix)

1. **[MAJOR]** <Short title>
   - File: `path/to/file.ts:L100`
   - Issue: <description>
   - Fix: <suggested fix>

---

### Minor Issues (nice to have)

1. **[MINOR]** <Short title>
   - Issue: <description>
   - Suggestion: <improvement>

---

### Approved Items

- [x] <Requirement 1> - Implemented correctly
- [x] <Requirement 2> - Working as expected

---

### Fix Subtasks Created

| ID   | Title        | Severity |
| ---- | ------------ | -------- |
| <id> | Fix: <issue> | Critical |
| <id> | Fix: <issue> | Major    |

---

### Summary

- Critical: <count>
- Major: <count>
- Minor: <count>
- Approved: <count>
```

## Severity Guidelines

**Critical**:

- Breaks core functionality
- Security vulnerability
- Data loss risk
- Build/test failures

**Major**:

- Missing requirement
- Poor architecture decision
- Significant code smell
- Missing error handling

**Minor**:

- Style inconsistency
- Naming improvements
- Documentation gaps
- Minor optimization
