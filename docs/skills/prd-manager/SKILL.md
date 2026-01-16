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
**CRITICAL**: Create a snapshot before task generation.

*Note: Task-O-Matic CLI handles versioning automatically during parse/update, but be aware of the `prd/versions/` directory.*

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
1. Update PRD (`edit` or `rework`).
2. New Version is created.
3. Generate new tasks for *delta* or update existing ones.
