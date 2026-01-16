---
name: prd-manager
description: Product Manager agent. Manages requirements lifecycle: Capture -> Refine -> Version -> Task Generation.
---

# PRD Manager

**Goal**: Transform vague ideas into clear, versioned, actionable requirements.

## Core Rules
1. **No Ambiguity**: Questions MUST be answered before freezing requirements.
2. **Version Control**: ALWAYS create a PRD version before generating tasks.
3. **Traceability**: Generated tasks MUST link back to PRD sections/versions.

## The Lifecycle

### 1. Capture (Drafting)
Create the initial PRD.

```bash
# From brief description
npx task-o-matic prd create "..."

# From existing codebase (Reverse Engineering)
npx task-o-matic prd generate --from-codebase
```

### 2. Refine (The "Interrogation")
Iteratively improve clarity.

```bash
# 1. Generate questions
npx task-o-matic prd refine --file <path>

# 2. Review & Rework (if needed)
npx task-o-matic prd rework --file <path> --feedback "..."
```

### 3. Freeze & Version
**CRITICAL**: Task-O-Matic CLI automatically creates/updates versions in `prd/versions/` during `parse` or `update` operations. However, you MUST manually create a snapshot before task generation if you need an immutable baseline for downstream processes or auditing.

*Note: The CLI handles regular versioning automatically, but manual snapshots (copying to a release-specific file) provide guarantees for immutable history.*

### 4. Decompose (Task Generation)
Convert frozen requirements into tasks.

```bash
npx task-o-matic prd parse --file <path>
```

**Output**:
- Creates Tasks in `.task-o-matic/tasks/`
- Links Tasks to PRD Version (`prdFile`, `prdRequirement`)

### 5. Change Management
When requirements change:

1. **Update PRD content**:
   - **Manual edit**: Directly edit the PRD file in your editor
   - **AI refine**: `npx task-o-matic prd refine --file <path>` - answers clarifying questions to improve clarity
   - **AI rework**: `npx task-o-matic prd rework --file <path> --feedback "...your feedback..."` - AI-assisted revision based on your feedback

2. **Version the changes**:
   ```bash
   npx task-o-matic prd version --file <path> --message "Updated requirement X"
   ```

3. **Regenerate tasks**:
   ```bash
   npx task-o-matic prd parse --file <path>
   ```
   This generates new tasks for changed requirements and preserves task status for unchanged items.
