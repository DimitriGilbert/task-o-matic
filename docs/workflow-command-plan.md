# Interactive Workflow Command Implementation Plan

## Goal Description

Create a new interactive command `task-o-matic workflow` that guides users through the complete project setup and task management lifecycle in a single, cohesive experience. At each step, users can choose from predefined options or use AI assistance to make decisions based on their natural language requirements.

**Key Features:**

- **Step 1**: Initialize/Bootstrap project with interactive prompts
- **Step 2**: Define PRD (write manually, upload file, or AI-assisted creation)
- **Step 3**: Work with AI to refine the PRD
- **Step 4**: Generate tasks from PRD
- **Step 5**: Split complex tasks into subtasks

**AI Assistance**: At each step, users can choose a "Custom/AI-Assisted" option that allows them to describe their needs in natural language. The AI will have access to all relevant documentation for that command to make informed decisions.

**TUI Compatibility**: The command will be built using the existing service layer and will be compatible with future TUI implementation using `inquirer` for prompts (already in dependencies).

## User Review Required

> [!IMPORTANT] > **Design Decision: Interactive Flow Structure**
>
> The workflow will be implemented as a single command with multiple sequential steps. Each step will:
>
> 1. Present predefined options (e.g., frontend frameworks, AI providers)
> 2. Include a "Custom/AI-Assisted" option
> 3. When AI assistance is chosen, provide the AI with full context including:
>    - Available options for that step
>    - Documentation for the relevant command
>    - User's natural language description
>
> This approach maintains separation of concerns while providing a guided experience.

> [!WARNING] > **Breaking Change Consideration**
>
> This is a new command and won't break existing functionality. However, it will introduce `inquirer` as a runtime dependency for interactive prompts. The package already has `inquirer` in dependencies, so no breaking changes are expected.

## Proposed Changes

### Core Components

#### [NEW] [workflow.ts](file:///home/didi/workspace/Code/task-o-matic/src/commands/workflow.ts)

Main command file that orchestrates the interactive workflow. This will:

- Use `inquirer` for interactive prompts
- Call existing services (`prdService`, `taskService`)
- Implement AI-assisted decision making for each step
- Maintain state between steps
- Provide progress feedback

**Key Functions:**

- `runWorkflow()`: Main orchestration function
- `stepInitialize()`: Interactive init/bootstrap
- `stepDefinePRD()`: PRD creation/upload
- `stepRefinePRD()`: AI-assisted PRD refinement
- `stepGenerateTasks()`: Parse PRD into tasks
- `stepSplitTasks()`: Break down complex tasks
- `getAIAssistedChoice()`: Generic AI decision helper

---

#### [NEW] [workflow-ai-assistant.ts](file:///home/didi/workspace/Code/task-o-matic/src/services/workflow-ai-assistant.ts)

Service layer for AI-assisted decision making. This service will:

- Take user's natural language input
- Provide context about available options
- Use AI to recommend configuration
- Return structured decisions

**Key Functions:**

- `assistInitConfig()`: Help choose init/bootstrap options
- `assistPRDCreation()`: Help create PRD from description
- `assistPRDRefinement()`: Suggest PRD improvements
- `assistTaskPrioritization()`: Help prioritize tasks

---

#### [MODIFY] [bin.ts](file:///home/didi/workspace/Code/task-o-matic/src/cli/bin.ts)

Add the new workflow command to the CLI:

```typescript
import { workflowCommand } from "../commands/workflow";

program.addCommand(workflowCommand);
```

---

### Workflow Step Details

#### Step 1: Initialize/Bootstrap

**Interactive Prompts:**

1. "Do you want to initialize a new project?" (Yes/No)
2. If Yes: "Choose initialization method:"
   - Quick start (defaults)
   - Custom configuration
   - AI-assisted (describe your project)
3. If Custom/AI-assisted: Collect project details
4. "Do you want to bootstrap with Better-T-Stack?" (Yes/No)
5. If Yes: "Choose stack options:"
   - Predefined templates (Next.js + Hono, etc.)
   - Custom selection
   - AI-assisted (describe your stack needs)

**AI Context for this step:**

- Available frontend frameworks
- Available backend frameworks
- Available databases
- Available auth options
- Documentation from `init` command

---

#### Step 2: Define PRD

**Interactive Prompts:**

1. "How would you like to define your PRD?"
   - Write manually (open editor)
   - Upload existing file
   - AI-assisted creation (describe your product)
   - Skip (use existing PRD)
2. If AI-assisted: "Describe your product requirements:"
   - Collect natural language description
   - AI generates structured PRD
   - Save to file

**AI Context for this step:**

- PRD template structure
- Best practices for PRD writing
- Examples of good PRDs

---

#### Step 3: Refine PRD

**Interactive Prompts:**

1. "Would you like to refine your PRD?" (Yes/No)
2. If Yes: "Choose refinement method:"
   - Manual editing (open editor)
   - AI-assisted refinement (provide feedback)
   - Skip
3. If AI-assisted: "What would you like to improve?"
   - Collect feedback
   - Use `prdService.reworkPRD()`
   - Show diff and confirm

**AI Context for this step:**

- Current PRD content
- PRD quality checklist
- Documentation from `prd rework` command

---

#### Step 4: Generate Tasks

**Interactive Prompts:**

1. "Generate tasks from PRD?" (Yes/No)
2. If Yes: "Choose generation method:"
   - Standard parsing
   - AI-assisted with custom instructions
3. If AI-assisted: "Any specific instructions for task generation?"
   - Collect custom instructions
   - Pass to `prdService.parsePRD()`
4. Show generated tasks
5. "Review and confirm tasks?" (Yes/No)

**AI Context for this step:**

- PRD content
- Task breakdown best practices
- Documentation from `prd parse` command

---

#### Step 5: Split Complex Tasks

**Interactive Prompts:**

1. "Would you like to split any complex tasks?" (Yes/No)
2. If Yes: Show list of tasks with effort estimates
3. "Select tasks to split:" (Multi-select)
4. For each selected task:
   - "Choose split method:"
     - Standard AI split
     - Custom instructions
   - If custom: Collect instructions
   - Use `taskService.splitTask()`
5. Show summary of all tasks and subtasks

**AI Context for this step:**

- Task content
- Task breakdown best practices
- Documentation from `tasks split` command

---

### Prompt Templates

#### [NEW] [workflow-assistance.ts](file:///home/didi/workspace/Code/task-o-matic/src/prompts/workflow-assistance.ts)

New prompt templates for workflow AI assistance:

- `initConfigPrompt`: Help choose init/bootstrap options
- `prdCreationPrompt`: Generate PRD from description
- `prdRefinementPrompt`: Suggest PRD improvements
- `taskGenerationPrompt`: Custom task generation instructions
- `taskSplitPrompt`: Custom task splitting instructions

---

### Type Definitions

#### [MODIFY] [options.ts](file:///home/didi/workspace/Code/task-o-matic/src/types/options.ts)

Add new types for workflow:

```typescript
export interface WorkflowState {
  projectName?: string;
  initConfig?: InitConfig;
  prdFile?: string;
  tasks?: Task[];
  currentStep: WorkflowStep;
}

export type WorkflowStep =
  | "initialize"
  | "define-prd"
  | "refine-prd"
  | "generate-tasks"
  | "split-tasks"
  | "complete";

export interface AIAssistedChoice {
  userInput: string;
  availableOptions: any[];
  context: string;
  recommendation?: any;
}
```

---

### Utilities

#### [NEW] [workflow-prompts.ts](file:///home/didi/workspace/Code/task-o-matic/src/utils/workflow-prompts.ts)

Reusable prompt configurations for `inquirer`:

- `confirmPrompt(message: string)`
- `selectPrompt(message: string, choices: any[])`
- `multiSelectPrompt(message: string, choices: any[])`
- `textInputPrompt(message: string)`
- `editorPrompt(message: string)`

## Verification Plan

### Automated Tests

#### Unit Tests

**Test File**: `src/test/workflow.test.ts` (NEW)

```bash
npm run test -- src/test/workflow.test.ts
```

Tests to implement:

- `WorkflowAIAssistant.assistInitConfig()` returns valid config
- `WorkflowAIAssistant.assistPRDCreation()` generates valid PRD
- Workflow state transitions correctly
- AI context includes all required documentation

#### Integration Tests

**Test File**: `src/test/workflow-integration.test.ts` (NEW)

```bash
npm run test -- src/test/workflow-integration.test.ts
```

Tests to implement:

- Full workflow execution (mocked prompts)
- Each step calls correct service methods
- State persists between steps
- Error handling for each step

### Manual Verification

#### Test Scenario 1: Complete Workflow with Defaults

```bash
# Run the workflow command
task-o-matic workflow

# Follow prompts:
# 1. Initialize: Yes → Quick start
# 2. Bootstrap: Yes → Next.js + Hono template
# 3. PRD: Upload existing file → test-prd.md
# 4. Refine: Skip
# 5. Generate: Yes → Standard parsing
# 6. Split: Yes → Select 1-2 complex tasks

# Verify:
# - .task-o-matic/ directory created
# - Project bootstrapped with correct stack
# - Tasks created from PRD
# - Complex tasks split into subtasks
task-o-matic tasks list
task-o-matic tasks tree
```

#### Test Scenario 2: AI-Assisted Workflow

```bash
# Run the workflow command
task-o-matic workflow

# Follow prompts:
# 1. Initialize: Yes → AI-assisted → "I want to build a SaaS app with authentication and payments"
# 2. Bootstrap: Yes → AI-assisted → "Use modern stack with TypeScript"
# 3. PRD: AI-assisted → "Build a subscription management platform"
# 4. Refine: Yes → AI-assisted → "Add more details about payment integration"
# 5. Generate: Yes → AI-assisted → "Focus on MVP features first"
# 6. Split: Yes → Select all tasks → AI-assisted → "Break down into 2-4 hour chunks"

# Verify:
# - AI recommendations are sensible
# - Generated PRD is comprehensive
# - Tasks are properly prioritized
# - Subtasks are appropriately sized
```

#### Test Scenario 3: Partial Workflow (Existing Project)

```bash
# In an existing task-o-matic project
cd existing-project

# Run the workflow command
task-o-matic workflow

# Follow prompts:
# 1. Initialize: No (already initialized)
# 2. PRD: Upload → new-feature.md
# 3. Refine: Yes → Manual editing
# 4. Generate: Yes → Standard
# 5. Split: No

# Verify:
# - Workflow skips initialization
# - New tasks added to existing project
# - Existing tasks not affected
```

### Build Verification

```bash
# Ensure the project builds without errors
npm run build

# Verify types
npm run check-types

# Verify the command is available
./dist/cli/bin.js workflow --help
```

## Implementation Notes

### Code Separation

- **CLI Layer** (`src/commands/workflow.ts`): Handles user interaction, prompts, display
- **Service Layer** (`src/services/workflow-ai-assistant.ts`): Business logic for AI assistance
- **Existing Services**: Reuse `prdService`, `taskService`, `configManager`
- **Prompts**: Reuse existing prompt templates, add new ones for workflow

### TUI Compatibility

The implementation will use `inquirer` which provides:

- CLI-based prompts (current implementation)
- Can be replaced with TUI library later (e.g., `@clack/prompts`, `ink`)
- Service layer is UI-agnostic

**Future TUI Migration Path:**

1. Create `src/tui/workflow.tsx` (or similar)
2. Reuse `WorkflowAIAssistant` service
3. Replace `inquirer` prompts with TUI components
4. Keep same workflow logic

### AI Context Strategy

For each AI-assisted choice:

1. Gather available options (from code/config)
2. Load relevant documentation (from docs/ or inline)
3. Include user's natural language input
4. Use existing AI operations with custom prompt
5. Parse AI response into structured decision

### State Management

Workflow state will be:

- Kept in memory during execution
- Optionally saved to `.task-o-matic/workflow-state.json`
- Allows resuming interrupted workflows
- Cleared on successful completion

### Error Handling

- Validate each step before proceeding
- Allow users to go back to previous steps
- Provide clear error messages
- Save progress before each step
- Allow graceful exit at any point

## Dependencies

**Existing:**

- `inquirer` (already in package.json)
- `commander` (for command registration)
- Existing services and utilities

**No new dependencies required.**

## Timeline Estimate

- **Workflow command structure**: 2-3 hours
- **AI assistant service**: 3-4 hours
- **Prompt templates**: 1-2 hours
- **Integration with existing services**: 2-3 hours
- **Testing**: 2-3 hours
- **Documentation**: 1 hour

**Total**: ~12-16 hours
