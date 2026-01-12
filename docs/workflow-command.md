# Interactive Workflow Command - Complete Reference

## Command

```bash
task-o-matic workflow [options]
```

## Overview

The workflow command provides a complete guided experience for project setup, from initialization through task generation. It now includes advanced PRD refinement with AI-assisted question answering.

## Core Options

### AI Configuration

- `--stream` - Show streaming AI output during AI operations
- `--ai-provider <provider>` - Override AI provider (openrouter/anthropic/openai/custom)
- `--ai-model <model>` - Override AI model
- `--ai-key <key>` - Override AI API key
- `--ai-provider-url <url>` - Override AI provider URL

### Workflow Control

- `--skip-all` - Skip all optional steps (use defaults)
- `--auto-accept` - Auto-accept all AI suggestions
- `--config-file <path>` - Load workflow options from JSON file

## Workflow Steps

### 1. Initialize/Bootstrap

**Options:**

- `--skip-init` - Skip initialization step
- `--project-name <name>` - Project name
- `--init-method <method>` - Initialization method: quick, custom, ai
- `--project-description <desc>` - Project description for AI-assisted init
- `--frontend <framework>` - Frontend framework
- `--backend <framework>` - Backend framework
- `--database <db>` - Database choice
- `--auth` / `--no-auth` - Include/exclude authentication
- `--bootstrap` / `--no-bootstrap` - Bootstrap with Better-T-Stack

**What it does:**

- Check existing initialization
- Choose: Quick start, Custom, or AI-assisted configuration
- Initialize `.task-o-matic/` directory
- Optional: Bootstrap with Better-T-Stack

### 2. Define PRD

**Options:**

- `--skip-prd` - Skip PRD definition
- `--prd-method <method>` - PRD method: upload, manual, ai, skip
- `--prd-file <path>` - Path to existing PRD file
- `--prd-description <desc>` - Product description for AI-assisted PRD
- `--prd-content <content>` - Direct PRD content

**What it does:**

- Choose: Upload file, Manual editor, AI-assisted, or Skip
- Save PRD to `.task-o-matic/prd/`

### 2.5. PRD Question/Refine (NEW)

**Options:**

- `--skip-prd-question-refine` - Skip PRD question/refine step
- `--prd-question-refine` - Use question-based PRD refinement
- `--prd-answer-mode <mode>` - Who answers questions: user, ai
- `--prd-answer-ai-provider <provider>` - AI provider for answering (optional override)
- `--prd-answer-ai-model <model>` - AI model for answering (optional override)
- `--prd-answer-ai-reasoning` - Enable reasoning for AI answering model

**What it does:**

- AI generates clarifying questions about the PRD
- **User Mode**: You answer questions interactively
- **AI Mode**: AI answers questions with PRD + stack context
  - Can use a different AI model for answering (e.g., smarter model)
  - Can enable reasoning for better answers
- Automatically refines PRD with Q&A feedback

**Example - User Answering:**

```bash
task-o-matic workflow \
  --prd-question-refine \
  --prd-answer-mode user
```

**Example - AI Answering with Reasoning:**

```bash
task-o-matic workflow \
  --prd-question-refine \
  --prd-answer-mode ai \
  --prd-answer-ai-reasoning
```

**Example - AI Answering with Custom Model:**

```bash
task-o-matic workflow \
  --prd-question-refine \
  --prd-answer-mode ai \
  --prd-answer-ai-provider openrouter \
  --prd-answer-ai-model anthropic/claude-3-opus \
  --prd-answer-ai-reasoning
```

### 3. Refine PRD

**Options:**

- `--skip-refine` - Skip PRD refinement
- `--refine-method <method>` - Refinement method: manual, ai, skip
- `--refine-feedback <feedback>` - Feedback for AI refinement

**What it does:**

- Optional additional refinement step
- Choose: Manual editing or AI-assisted
- Save refined version

### 4. Generate Tasks

**Options:**

- `--skip-generate` - Skip task generation
- `--generate-method <method>` - Generation method: standard, ai
- `--generate-instructions <instructions>` - Custom task generation instructions

**What it does:**

- Parse PRD into tasks
- Choose: Standard or AI-assisted with custom instructions
- Display generated tasks

### 5. Split Complex Tasks

**Options:**

- `--skip-split` - Skip task splitting
- `--split-tasks <ids>` - Comma-separated task IDs to split
- `--split-all` - Split all tasks
- `--split-method <method>` - Split method: interactive, standard, custom
- `--split-instructions <instructions>` - Custom split instructions

**What it does:**

- Select tasks to split
- Choose: Interactive, Standard, or Custom instructions
- Generate subtasks

## Complete Automation Examples

### Full Automation with AI Answering

```bash
task-o-matic workflow \
  --stream \
  --auto-accept \
  --init-method quick \
  --bootstrap \
  --prd-method ai \
  --prd-description "A guild management app for MMO RPG players..." \
  --prd-question-refine \
  --prd-answer-mode ai \
  --prd-answer-ai-reasoning \
  --skip-refine \
  --generate-method standard \
  --split-all \
  --split-method standard \
  --ai-provider openrouter \
  --ai-model anthropic/claude-3.5-sonnet
```

### Skip Question Step

```bash
task-o-matic workflow \
  --skip-prd-question-refine \
  --prd-method ai \
  --prd-description "..."
```

### User Answering Mode

```bash
task-o-matic workflow \
  --prd-question-refine \
  --prd-answer-mode user
# You'll be prompted to answer each question interactively
```

## AI Assistance

At each step, choose the "AI-assisted" option to:

1. Describe your needs in natural language
2. Receive AI-generated recommendations
3. Accept or modify the recommendations

## Library Usage

The workflow is now available as a reusable service in the core package:

```typescript
import { WorkflowService } from "task-o-matic-core";

const workflowService = new WorkflowService();

// Initialize project
const initResult = await workflowService.initializeProject({
  projectName: "my-app",
  initMethod: "quick",
  bootstrap: true,
  aiOptions: { aiProvider: "anthropic", aiModel: "claude-3-5-sonnet" },
  callbacks: {
    onProgress: (event) => console.log(event.message),
  },
});

// Define PRD
const prdResult = await workflowService.definePRD({
  method: "ai",
  prdDescription: "A task management app...",
  projectDir: initResult.projectDir,
  aiOptions: { aiProvider: "anthropic", aiModel: "claude-3-5-sonnet" },
});

// Generate tasks
const tasksResult = await workflowService.generateTasks({
  prdFile: prdResult.prdFile,
  method: "standard",
  projectDir: initResult.projectDir,
});
```

## Files Created

The workflow command uses the following service layer:

- **Service**: `src/services/workflow.ts` - Complete workflow orchestration
- **Service**: `src/services/prd.ts` - PRD operations including question/refine
- **AI Operations**: `src/lib/ai-service/ai-operations.ts` - AI answering logic
- **Command**: `src/commands/workflow.ts` - CLI interface
- **Types**: `src/types/workflow-options.ts` - Option definitions
- **Types**: `src/types/workflow-results.ts` - Result type definitions

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

## Architecture

The workflow command follows a clean service layer pattern:

- **Command Layer** (`workflow.ts`): CLI interaction and user prompts
- **Service Layer** (`WorkflowService`, `PRDService`): Business logic
- **AI Layer** (`AIOperations`): AI provider integration

This makes the workflow fully reusable in TUI, web apps, or any Node.js project.
