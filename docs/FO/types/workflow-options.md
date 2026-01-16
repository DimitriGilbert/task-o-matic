---
## TECHNICAL BULLETIN NO. 006
### WORKFLOW OPTIONS - WORKFLOW AUTOMATION CONFIGURATION SYSTEM

**DOCUMENT ID:** `task-o-matic-workflow-options-v1`
**CLEARANCE:** `All Personnel`
**MANDATORY COMPLIANCE:** `Yes`

### ⚠️ CRITICAL SURVIVAL NOTICE
Citizen, ignore these workflow option types and your automation becomes a runaway train in wasteland. Steps execute without control, AI configurations clash, and your workflow becomes a cascade of failed operations. This is your automation control tower.

### TYPE SYSTEM ARCHITECTURE

The workflow options system provides **comprehensive automation configuration** for entire task-o-matic workflow process. It uses **interface composition** and **granular control** to enable both fully automated and semi-automated workflow execution. The architecture supports:

- **Step-by-Step Control**: Fine-grained control over each workflow phase
- **AI Configuration**: Per-step AI provider and model selection
- **Automation Levels**: From fully manual to completely automated
- **Configuration Loading**: Support for both inline and file-based configuration
- **Error Recovery**: Robust error handling and retry mechanisms
- **Extensibility**: Easy to add new command options

This design enables **predictable workflow automation** while maintaining human oversight when needed.

### COMPLETE TYPE DOCUMENTATION

#### WorkflowAutomationOptions Interface

```typescript
export interface WorkflowAutomationOptions extends StreamingAIOptions {
  // Global workflow control
  skipAll?: boolean; // Skip all optional steps
  autoAccept?: boolean; // Auto-accept all AI suggestions
  configFile?: string; // Load options from JSON file

  // Step 1: Initialize
  skipInit?: boolean; // Skip initialization entirely
  projectName?: string; // Pre-set project name
  initMethod?: "quick" | "custom" | "ai"; // Initialization method
  projectDescription?: string; // For AI-assisted init
  useExistingConfig?: boolean; // Use existing config if found

  // AI Configuration (inherited from StreamingAIOptions)
  // aiProvider, aiModel, aiKey, aiProviderUrl, stream

  // Stack Configuration
  frontend?: string; // Frontend framework
  backend?: string; // Backend framework
  database?: string; // Database choice
  auth?: boolean; // Include authentication
  bootstrap?: boolean; // Bootstrap with Better-T-Stack
  includeDocs?: boolean; // Include documentation in new project

  // Step 2: Define PRD
  skipPrd?: boolean; // Skip PRD definition
  prdMethod?: "upload" | "manual" | "ai" | "skip"; // PRD creation method
  prdFile?: string; // Path to existing PRD file
  prdDescription?: string; // For AI-assisted PRD creation
  prdContent?: string; // Direct PRD content (for automation)
  prdMultiGeneration?: boolean; // Use multi-generation for PRD creation
  skipPrdMultiGeneration?: boolean; // Skip PRD multi-generation
  prdMultiGenerationModels?: string; // Comma-separated list of provider:model
  prdCombine?: boolean; // Combine multiple PRDs into master
  skipPrdCombine?: boolean; // Skip PRD combination
  prdCombineModel?: string; // Model to use for combining (provider:model)

  // Step 2.4: Stack Suggestion
  skipStackSuggestion?: boolean; // Skip stack suggestion step
  suggestStackFromPrd?: string | true; // PRD file path, or true = use current PRD

  // Step 3: Bootstrap (moved after PRD and stack suggestion)
  skipBootstrap?: boolean; // Skip bootstrap step

  // Step 4: Refine PRD
  skipRefine?: boolean; // Skip PRD refinement
  refineMethod?: "manual" | "ai" | "skip"; // Refinement method
  refineFeedback?: string; // Feedback for AI refinement

  // Step 2.5: PRD Question/Refine (NEW)
  skipPrdQuestionRefine?: boolean; // Skip PRD question/refine step
  prdQuestionRefine?: boolean; // Use question-based PRD refinement
  prdAnswerMode?: "user" | "ai"; // Who answers questions: user or AI
  prdAnswerAiProvider?: string; // AI provider for answering (optional override)
  prdAnswerAiModel?: string; // AI model for answering (optional override)
  prdAnswerAiKey?: string; // AI API key for answering (optional override)
  prdAnswerAiProviderUrl?: string; // AI provider URL for answering (optional override)
  prdAnswerAiReasoning?: boolean; // Enable reasoning for AI answering model

  // Step 4: Generate Tasks
  skipGenerate?: boolean; // Skip task generation
  generateMethod?: "standard" | "ai"; // Generation method
  generateInstructions?: string; // Custom instructions for task generation

  // Step 5: Split Tasks
  skipSplit?: boolean; // Skip task splitting
  splitTasks?: string; // Comma-separated task IDs to split
  splitAll?: boolean; // Split all tasks
  splitMethod?: "interactive" | "standard" | "custom"; // Split method
  splitInstructions?: string; // Custom instructions for splitting

  // Step 6: Execute Tasks
  execute?: boolean; // Execute generated tasks immediately
  executeTasks?: boolean; // Alias for execute
  executeConcurrency?: number; // Number of concurrent tasks
  autoCommit?: boolean; // Auto-commit changes during execution
  executeTool?: string; // Executor tool (opencode, claude, etc.)
  executeModel?: string; // Model override for execution
  executeMaxRetries?: number; // Maximum retries per task
  executePlan?: boolean; // Enable planning phase
  executePlanModel?: string; // Model for planning
  executePlanTool?: string; // Tool for planning
  executeReview?: boolean; // Enable review phase
  executeReviewModel?: string; // Model for review

  // NEW: Verification & Robustness
  verificationCommands?: string[]; // Verification commands to run after tasks
  validate?: string[]; // Alias for verificationCommands
  tryModels?: string; // Comma-separated list of models for retry escalation
}
```

**Purpose**: Comprehensive options for workflow command automation

**Inherited Properties**: From `StreamingAIOptions`
- **aiProvider** (Optional, string): AI provider name
- **aiModel** (Optional, string): AI model name
- **aiKey** (Optional, string): API authentication key
- **aiProviderUrl** (Optional, string): Custom endpoint URL
- **stream** (Optional, boolean): Enable streaming AI responses

**Global Workflow Control Properties**:
- **skipAll** (Optional, boolean): Skip all optional steps and run with defaults
- **autoAccept** (Optional, boolean): Automatically accept all AI suggestions without prompting
- **configFile** (Optional, string): Path to JSON configuration file

**Step 1: Initialize Properties**:
- **skipInit** (Optional, boolean): Skip project initialization entirely
- **projectName** (Optional, string): Pre-defined project name
- **initMethod** (Optional, union): Initialization approach
  - `"quick"`: Use sensible defaults for rapid setup
  - `"custom"`: Interactive custom configuration
  - `"ai"`: AI-assisted project setup
- **projectDescription** (Optional, string): Project description for AI-assisted initialization
- **useExistingConfig** (Optional, boolean): Use existing configuration if found

**Stack Configuration Properties**:
- **frontend** (Optional, string): Frontend framework selection
- **backend** (Optional, string): Backend framework selection
- **database** (Optional, string): Database choice
- **auth** (Optional, boolean): Include authentication system
- **bootstrap** (Optional, boolean): Use Better-T-Stack bootstrap process
- **includeDocs** (Optional, boolean): Include documentation in new project

**Step 2: Define PRD Properties**:
- **skipPrd** (Optional, boolean): Skip PRD definition
- **prdMethod** (Optional, union): PRD creation approach
  - `"upload"`: Use existing PRD file
  - `"manual"`: Interactive PRD creation
  - `"ai"`: AI-generated PRD from description
  - `"skip"`: Skip PRD entirely
- **prdFile** (Optional, string): Path to existing PRD file
- **prdDescription** (Optional, string): Description for AI-generated PRD
- **prdContent** (Optional, string): Direct PRD content for automation
- **prdMultiGeneration** (Optional, boolean): Use multiple AI models for PRD creation
- **skipPrdMultiGeneration** (Optional, boolean): Skip multi-generation step
- **prdMultiGenerationModels** (Optional, string): Comma-separated provider:model combinations
- **prdCombine** (Optional, boolean): Combine multiple PRDs into master document
- **skipPrdCombine** (Optional, boolean): Skip PRD combination step
- **prdCombineModel** (Optional, string): Model to use for combining (provider:model format)

**Step 2.4: Stack Suggestion Properties**:
- **skipStackSuggestion** (Optional, boolean): Skip stack suggestion step
- **suggestStackFromPrd** (Optional, string | true): PRD file path, or true = use current PRD

**Step 3: Bootstrap Properties**:
- **skipBootstrap** (Optional, boolean): Skip bootstrap step

**Step 4: Refine PRD Properties**:
- **skipRefine** (Optional, boolean): Skip PRD refinement
- **refineMethod** (Optional, union): PRD refinement approach
  - `"manual"`: Manual PRD editing and improvement
  - `"ai"`: AI-assisted PRD refinement
  - `"skip"`: Skip refinement entirely
- **refineFeedback** (Optional, string): Feedback for AI-driven refinement

**Step 2.5: PRD Question/Refine Properties**:
- **skipPrdQuestionRefine** (Optional, boolean): Skip question-based PRD refinement
- **prdQuestionRefine** (Optional, boolean): Enable question-based PRD refinement
- **prdAnswerMode** (Optional, union): Who answers questions
  - `"user"`: Human user answers questions
  - `"ai"`: AI model answers questions
- **prdAnswerAiProvider** (Optional, string): AI provider for answering questions
- **prdAnswerAiModel** (Optional, string): AI model for answering questions
- **prdAnswerAiKey** (Optional, string): AI API key for answering questions
- **prdAnswerAiProviderUrl** (Optional, string): Custom endpoint URL for answering AI
- **prdAnswerAiReasoning** (Optional, boolean): Enable reasoning for answering AI model

**Step 4: Generate Tasks Properties**:
- **skipGenerate** (Optional, boolean): Skip task generation
- **generateMethod** (Optional, union): Task generation approach
  - `"standard"`: Standard task extraction from PRD
  - `"ai"`: AI-enhanced task generation
- **generateInstructions** (Optional, string): Custom instructions for task generation

**Step 5: Split Tasks Properties**:
- **skipSplit** (Optional, boolean): Skip task splitting
- **splitTasks** (Optional, string): Comma-separated task IDs to split
- **splitAll** (Optional, boolean): Split all tasks
- **splitMethod** (Optional, union): Task splitting approach
  - `"interactive"`: Interactive task splitting with user confirmation
  - `"standard"`: Standard AI-powered task splitting
  - `"custom"`: Custom splitting with specific instructions
- **splitInstructions** (Optional, string): Custom instructions for task splitting

**Execution Phase Properties**:
- **execute** (Optional, boolean): Execute generated tasks immediately
- **executeTasks** (Optional, boolean): Alias for execute
- **executeConcurrency** (Optional, number): Number of concurrent tasks
- **autoCommit** (Optional, boolean): Auto-commit changes during execution
- **executeTool** (Optional, string): Executor tool (opencode, claude, gemini, codex, kilo)
- **executeModel** (Optional, string): Model override for execution
- **executeMaxRetries** (Optional, number): Maximum retries per task
- **tryModels** (Optional, string): Comma-separated list of models for retry escalation
- **executePlan** (Optional, boolean): Generate implementation plan
- **executePlanModel** (Optional, string): Model for planning
- **executePlanTool** (Optional, string): Tool for planning
- **executeReview** (Optional, boolean): Run AI code review
- **executeReviewModel** (Optional, string): Model for review

**Verification & Robustness Properties**:
- **verificationCommands** (Optional, string[]): Verification commands to run after each task
- **validate** (Optional, string[]): Alias for verificationCommands
- **tryModels** (Optional, string): Comma-separated list of models for retry escalation

**Usage Examples**:
```typescript
// Fully automated workflow
const fullyAutomated: WorkflowAutomationOptions = {
  skipAll: false,
  autoAccept: true,
  projectName: "E-commerce Platform",
  initMethod: "ai",
  projectDescription: "Complete e-commerce platform with user authentication, product catalog, and order management",
  prdMethod: "ai",
  prdMultiGeneration: true,
  prdMultiGenerationModels: "anthropic:claude-3.5-sonnet,openai:gpt-4o",
  prdCombine: true,
  prdCombineModel: "anthropic:claude-3.5-sonnet",
  generateMethod: "ai",
  generateInstructions: "Focus on security, performance, scalability, and comprehensive testing",
  splitMethod: "standard",
  splitAll: true,
  frontend: "next",
  backend: "hono",
  database: "postgres",
  auth: true,
  bootstrap: true,
  includeDocs: true,
  stream: true,
  aiProvider: "anthropic",
  aiModel: "claude-3.5-sonnet",
  execute: true,
  executeTasks: true,
  executeTool: "claude",
  executeModel: "claude-3-sonnet",
  autoCommit: true,
  verificationCommands: ["bun test", "bun run build", "bun run lint"],
  tryModels: "gpt-4o-mini,gpt-4o,claude-3.5-sonnet",
  executePlan: true,
  executePlanModel: "claude-3.5-sonnet",
  executePlanTool: "claude",
  executeReview: true,
  executeReviewModel: "claude-3.5-sonnet"
};

// Semi-automated with human oversight
const semiAutomated: WorkflowAutomationOptions = {
  autoAccept: false,
  projectName: "Mobile App",
  initMethod: "custom",
  useExistingConfig: true,
  prdMethod: "upload",
  prdFile: "./docs/PRD.md",
  skipPrdQuestionRefine: false,
  prdQuestionRefine: true,
  prdAnswerMode: "user",
  generateMethod: "standard",
  splitTasks: "task-ui-design,task-api-integration",
  splitMethod: "interactive",
  generateInstructions: "Focus on mobile-first design and offline capability",
  aiProvider: "openrouter",
  aiModel: "anthropic/claude-3.5-sonnet",
  stream: true
};

// Minimal automation
const minimalAutomation: WorkflowAutomationOptions = {
  skipInit: true,
  skipPrd: true,
  skipGenerate: false,
  skipSplit: true,
  projectName: "CLI Tool",
  generateMethod: "standard",
  splitTasks: "task-100",
  aiProvider: "openai",
  aiModel: "gpt-4",
  stream: false
};

// Configuration from file
const fileBasedConfig: WorkflowAutomationOptions = {
  configFile: "./workflow-config.json",
  // Other options loaded from file
  skipRefine: true,
  skipBootstrap: true
};

// Custom AI configuration per step
const customAIWorkflow: WorkflowAutomationOptions = {
  projectName: "AI Research Assistant",

  // Different AI for each step
  initMethod: "ai",
  prdMultiGeneration: true,
  prdMultiGenerationModels: "anthropic:claude-3.5-sonnet,google:gemini-pro",
  prdCombine: true,
  prdCombineModel: "anthropic:claude-3.5-sonnet",

  // Question-based refinement with AI answering
  prdQuestionRefine: true,
  prdAnswerMode: "ai",
  prdAnswerAiProvider: "openrouter",
  prdAnswerAiModel: "anthropic/claude-3.5-sonnet",
  prdAnswerAiReasoning: true,

  // Task generation with custom instructions
  generateMethod: "ai",
  generateInstructions: "Generate tasks for ML pipeline development: data preprocessing, model training, and deployment automation. Include tasks for MLOps, experiment tracking, and model versioning.",

  // Task splitting with technical focus
  splitTasks: "all",
  splitMethod: "custom",
  splitInstructions: "Split tasks by ML pipeline stages: data ingestion, preprocessing, feature engineering, model training, validation, deployment, and monitoring. Create separate subtasks for each stage with appropriate dependencies.",
  aiProvider: "openrouter",
  aiModel: "anthropic/claude-3.5-sonnet",
  stream: true,

  // Advanced execution with verification
  execute: true,
  executeTool: "opencode",
  executeModel: "claude-3.5-sonnet",
  maxRetries: 5,
  tryModels: "gpt-4o-mini,gpt-4o,claude-sonnet-4",
  verificationCommands: ["python -m pytest tests/", "npm run build"],
  executePlan: true,
  executePlanModel: "claude-3.5-sonnet",
  executePlanTool: "opencode",
  executeReview: true,
  executeReviewModel: "claude-3.5-sonnet",
  autoCommit: true,
  verificationCommands: ["npm run lint", "npm run build", "npm test"]
};
```

#### WorkflowState Interface

```typescript
export interface WorkflowState {
  initialized: boolean;
  currentStep:
    | "initialize"
    | "define-prd"
    | "stack-suggestion"
    | "bootstrap"
    | "question-refine-prd"
    | "refine-prd"
    | "generate-tasks"
    | "split-tasks"
    | "execute-tasks"
    | "complete";
  projectName?: string;
  projectDir?: string;
  aiConfig?: any;
  prdFile?: string;
  prdContent?: string;
  tasks?: Array<{ id: string; title: string; description?: string }>;
  suggestedStack?: BTSConfig; // Accepted stack, used by bootstrap
}
```

**Purpose**: Complete workflow execution state

**Properties**:
- **initialized** (Required, boolean): Whether project is initialized
- **currentStep** (Required, union): Current workflow step
  - **"initialize"**: Project initialization
  - **"define-prd"**: PRD creation/upload
  - **"stack-suggestion"**: Better-T-Stack configuration
  - **"bootstrap"**: Project bootstrapping
  - **"question-refine-prd"**: PRD questioning
  - **"refine-prd"**: PRD refinement
  - **"generate-tasks"**: Task creation from PRD
  - **"split-tasks"**: Task breakdown into subtasks
  - **"execute-tasks"**: Task execution
  - **"complete"**: Workflow completion
- **projectName** (Optional, string): Project name
- **projectDir** (Optional, string): Project directory path
- **aiConfig** (Optional, any): AI configuration
- **prdFile** (Optional, string): Path to PRD file
- **prdContent** (Optional, string): PRD file content
- **tasks** (Optional, array): Generated tasks
- **suggestedStack** (Optional, BTSConfig): Accepted stack configuration

**Usage Examples**:
```typescript
// Initial workflow state
const initialState: WorkflowState = {
  initialized: false,
  currentStep: "initialize"
};

// After initialization
const afterInit: WorkflowState = {
  projectName: "My Project",
  projectDir: "/path/to/my-project",
  initialized: true,
  currentStep: "define-prd",
  aiConfig: {
    provider: "anthropic",
    model: "claude-3.5-sonnet",
    key: "sk-ant-..."
  }
};

// After PRD creation
const afterPRD: WorkflowState = {
  projectName: "My Project",
  projectDir: "/path/to/my-project",
  initialized: true,
  prdFile: "./docs/PRD.md",
  prdContent: "# My Project\n\nThis project builds...",
  currentStep: "generate-tasks",
  aiConfig: {
    provider: "anthropic",
    model: "claude-3.5-sonnet"
  }
};

// After task generation
const afterTasks: WorkflowState = {
  projectName: "My Project",
  projectDir: "/path/to/my-project",
  initialized: true,
  prdFile: "./docs/PRD.md",
  prdContent: "# My Project\n\nThis project builds...",
  tasks: [
    { id: "task-1", title: "Setup project structure", description: "Create directories and package.json" },
    { id: "task-2", title: "Build authentication", description: "Implement user login system" },
    { id: "task-3", title: "Create dashboard", description: "Build main user interface" }
  ],
  currentStep: "split-tasks"
};
```

### FUNCTION DOCUMENTATION

No standalone functions in this module - this is a type definition file.

### INTEGRATION PROTOCOLS

#### Workflow Command Integration

```typescript
import { WorkflowAutomationOptions } from '../types/workflow-options';
import { WorkflowService } from '../services/workflow';

export function createWorkflowCommand(): Command {
  return new Command('workflow')
    .description('Execute complete task-o-matic workflow')
    .option('--config-file <file>', 'Load configuration from JSON file')
    .option('--skip-all', 'Skip all optional steps and run with defaults')
    .option('--auto-accept', 'Auto-accept all AI suggestions')
    .option('--project-name <name>', 'Project name')
    .option('--init-method <method>', 'Initialization method (quick|custom|ai)')
    .option('--project-description <desc>', 'Project description for AI-assisted init')
    .option('--skip-init', 'Skip initialization entirely')
    .option('--use-existing-config', 'Use existing config if found')
    .option('--frontend <framework>', 'Frontend framework')
    .option('--backend <framework>', 'Backend framework')
    .option('--database <db>', 'Database choice')
    .option('--auth', 'Include authentication')
    .option('--bootstrap', 'Bootstrap with Better-T-Stack')
    .option('--include-docs', 'Include documentation')
    .option('--skip-prd', 'Skip PRD definition')
    .option('--prd-method <method>', 'PRD method (upload|manual|ai|skip)')
    .option('--prd-file <file>', 'Path to PRD file')
    .option('--prd-description <desc>', 'PRD description for AI generation')
    .option('--prd-multi-generation', 'Use multi-generation for PRD')
    .option('--skip-prd-multi-generation', 'Skip PRD multi-generation')
    .option('--prd-multi-models <models>', 'Models for PRD multi-generation')
    .option('--prd-combine', 'Combine multiple PRDs')
    .option('--skip-prd-combine', 'Skip PRD combination')
    .option('--prd-combine-model <model>', 'Model for PRD combination')
    .option('--skip-stack-suggestion', 'Skip stack suggestion')
    .option('--suggest-stack-from-prd <path>', 'PRD for stack suggestion')
    .option('--skip-bootstrap', 'Skip bootstrap step')
    .option('--skip-refine', 'Skip PRD refinement')
    .option('--refine-method <method>', 'Refinement method (manual|ai|skip)')
    .option('--refine-feedback <feedback>', 'Feedback for AI refinement')
    .option('--skip-prd-question-refine', 'Skip PRD question/refine')
    .option('--prd-question-refine', 'Use question-based PRD refinement')
    .option('--prd-answer-mode <mode>', 'Who answers PRD questions (user|ai)')
    .option('--prd-answer-ai-provider <provider>', 'AI provider for answering')
    .option('--prd-answer-ai-model <model>', 'AI model for answering')
    .option('--prd-answer-ai-key <key>', 'API key for answering')
    .option('--prd-answer-ai-url <url>', 'Custom endpoint for answering')
    .option('--prd-answer-ai-reasoning', 'Enable reasoning for answering AI')
    .option('--skip-generate', 'Skip task generation')
    .option('--generate-method <method>', 'Generation method (standard|ai)')
    .option('--generate-instructions <instructions>', 'Custom instructions')
    .option('--skip-split', 'Skip task splitting')
    .option('--split-tasks <ids>', 'Task IDs to split')
    .option('--split-all', 'Split all tasks')
    .option('--split-method <method>', 'Split method (interactive|standard|custom)')
    .option('--split-instructions <instructions>', 'Split instructions')
    .option('--execute', 'Execute generated tasks immediately')
    .option('--execute-tasks', 'Alias for execute')
    .option('--execute-concurrency <count>', 'Number of concurrent tasks')
    .option('--auto-commit', 'Auto-commit changes')
    .option('--execute-tool <tool>', 'Executor tool (opencode|claude|gemini|codex|kilo)')
    .option('--execute-model <model>', 'Model override')
    .option('--execute-max-retries <count>', 'Maximum retries per task')
    .option('--try-models <models>', 'Model escalation list')
    .option('--execute-plan', 'Generate implementation plan')
    .option('--execute-plan-model <model>', 'Model for planning')
    .option('--execute-plan-tool <tool>', 'Tool for planning')
    .option('--execute-review', 'Run AI code review')
    .option('--execute-review-model <model>', 'Model for review')
    .option('--verification-commands <cmds>', 'Verification commands')
    .option('--validate <cmds>', 'Alias for verification-commands')
    .action(async (options: WorkflowAutomationOptions) => {
      await handleWorkflowCommand(options);
    });
}
```

### SURVIVAL SCENARIOS

#### Configuration Validation Rules

1. **Mutual Exclusion**: Certain options are mutually exclusive
   - `skipAll` overrides individual step skips
   - `prdMethod` determines required related options
   - `splitAll` overrides `splitTasks`
   - `executeTasks` overrides `splitTasks`

2. **Conditional Requirements**: Some options require others
   - `prdFile` required when `prdMethod` is "upload"
   - `prdDescription` required when `prdMethod` is "ai"
   - `refineFeedback` required when `refineMethod` is "ai"
   - `splitInstructions` required when `splitMethod` is "custom"
   - `prdAnswerAiProvider` + `prdAnswerAiModel` required when `prdAnswerMode` is "ai"

3. **AI Configuration Consistency**: AI options cascade down to sub-steps
   - Base AI config used unless overridden
   - Answer AI config separate from main AI config

4. **Stack Configuration Validation**: Frontend/backend combinations validated
   - Database choice affects backend options
   - Auth choice affects backend options

**Remember:** Citizen, in wasteland of manual project setup, workflow automation is your assembly line. Every option is a precision tool, every configuration is a quality control checkpoint, and every automated step is a worker that never sleeps. Configure them wisely, test them thoroughly, and they'll build your empire while you focus on bigger picture.
