import { StreamingAIOptions } from "./options";

/**
 * Comprehensive options for workflow command automation.
 * All options are optional - workflow remains fully interactive by default.
 */
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

  // Step 3: Refine PRD
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
  executeReview?: boolean; // Enable review phase
  executeReviewModel?: string; // Model for review
}

export interface WorkflowState {
  initialized: boolean;
  currentStep:
    | "initialize"
    | "define-prd"
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
}
