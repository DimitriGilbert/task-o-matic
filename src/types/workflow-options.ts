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

  // Step 2: Define PRD
  skipPrd?: boolean; // Skip PRD definition
  prdMethod?: "upload" | "manual" | "ai" | "skip"; // PRD creation method
  prdFile?: string; // Path to existing PRD file
  prdDescription?: string; // For AI-assisted PRD creation
  prdContent?: string; // Direct PRD content (for automation)

  // Step 3: Refine PRD
  skipRefine?: boolean; // Skip PRD refinement
  refineMethod?: "manual" | "ai" | "skip"; // Refinement method
  refineFeedback?: string; // Feedback for AI refinement

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
}
