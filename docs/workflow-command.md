# Interactive Workflow Command - Quick Reference

## Command

```bash
task-o-matic workflow [options]
```

## Options

- `--stream` - Show streaming AI output during AI operations
- `--ai-provider <provider>` - Override AI provider (openrouter/anthropic/openai/custom)
- `--ai-model <model>` - Override AI model
- `--ai-key <key>` - Override AI API key

## Workflow Steps

### 1. Initialize/Bootstrap

- Check existing initialization
- Choose: Quick start, Custom, or AI-assisted configuration
- Initialize `.task-o-matic/` directory
- Optional: Bootstrap with Better-T-Stack

### 2. Define PRD

- Choose: Upload file, Manual editor, AI-assisted, or Skip
- Save PRD to `.task-o-matic/prd/`

### 3. Refine PRD

- Optional refinement step
- Choose: Manual editing or AI-assisted
- Save refined version

### 4. Generate Tasks

- Parse PRD into tasks
- Choose: Standard or AI-assisted with custom instructions
- Display generated tasks

### 5. Split Complex Tasks

- Select tasks to split
- Choose: Standard or custom instructions
- Generate subtasks

## AI Assistance

At each step, choose the "AI-assisted" option to:

1. Describe your needs in natural language
2. Receive AI-generated recommendations
3. Accept or modify the recommendations

## Examples

### Quick Start

```bash
task-o-matic workflow
# Select quick start options at each step
```

### AI-Assisted

```bash
task-o-matic workflow --stream
# Choose AI-assisted at each step
# Describe your project/product in natural language
```

### Existing Project

```bash
cd existing-project
task-o-matic workflow
# Skip initialization
# Add new PRD and generate tasks
```

## Files Created

- Implementation plan: `docs/workflow-command-plan.md`
- Service: `src/services/workflow-ai-assistant.ts`
- Prompts: `src/prompts/workflow-assistance.ts`
- Utilities: `src/utils/workflow-prompts.ts`
- Command: `src/commands/workflow.ts`
- Types: `src/types/options.ts` (updated)

## Next Steps After Workflow

```bash
# Review tasks
task-o-matic tasks list

# View task tree
task-o-matic tasks tree

# Get next task
task-o-matic tasks next

# Execute a task
task-o-matic tasks execute <task-id>
```
