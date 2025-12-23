// AI Configuration
export interface AIConfig {
  provider: AIProvider;
  model: string;
  apiKey?: string;
  baseURL?: string;
  maxTokens?: number;
  temperature?: number;
  context7Enabled?: boolean;
  reasoning?: {
    maxTokens?: number;
  };
}

// Environment Variable Configuration
export interface EnvAIConfig {
  AI_PROVIDER?: string;
  AI_MODEL?: string;
  AI_MAX_TOKENS?: string;
  AI_TEMPERATURE?: string;
  OPENROUTER_API_KEY?: string;
  ANTHROPIC_API_KEY?: string;
  OPENAI_API_KEY?: string;
  CUSTOM_API_KEY?: string;
  CUSTOM_API_URL?: string;
}

// Provider-specific defaults
export interface ProviderDefaults {
  openrouter: {
    model: string;
    maxTokens: number;
    temperature: number;
  };
  anthropic: {
    model: string;
    maxTokens: number;
    temperature: number;
  };
  openai: {
    model: string;
    maxTokens: number;
    temperature: number;
  };
  custom: {
    model: string;
    maxTokens: number;
    temperature: number;
  };
  gemini: {
    model: string;
    maxTokens: number;
    temperature: number;
  };
  zai: {
    model: string;
    maxTokens: number;
    temperature: number;
  };
}

// Task Documentation References
export interface TaskDocumentation {
  lastFetched: number;
  libraries: string[];
  recap: string;
  files: string[];
  research?: Record<
    string,
    Array<{
      query: string;
      doc: string;
    }>
  >;
}

// Task
export interface CreateTaskOptions {
  title: string;
  content?: string;
  effort?: "small" | "medium" | "large";
  parentId?: string;
  aiEnhance?: boolean;
}

export interface Task extends CreateTaskOptions {
  id: string;
  status: "todo" | "in-progress" | "completed";
  createdAt: number;
  updatedAt: number;
  tags?: string[];
  subtasks?: Task[];
  contentFile?: string;
  enhancedContentFile?: string;
  content?: string;
  documentation?: TaskDocumentation;
  dependencies?: string[];
  description?: string;
  estimatedEffort?: "small" | "medium" | "large";
  prdFile?: string; // Reference to the PRD file this task was created from
  plan?: string; // Implementation plan - just fucking text
}

// PRD Parsing - moved to results.ts
// Use PRDParseResult from results.ts instead

// Interface for parsed AI task from PRD
export interface ParsedAITask {
  title: string;
  description?: string;
  content?: string;
  effort?: "small" | "medium" | "large";
  dependencies?: string[];
  [key: string]: unknown; // Allow additional AI-generated properties
}

// AI Response Interfaces for proper typing
export interface PRDResponse {
  tasks: ParsedAITask[];
  summary: string;
  estimatedDuration: string;
  confidence: number;
}

// What AI operations returns after parsing PRD (before service layer enrichment)
export interface AIPRDParseResult {
  tasks: Task[];
  summary: string;
  estimatedDuration: string;
  confidence: number;
}

export interface TaskBreakdownResponse {
  subtasks: ParsedAITask[];
}

export interface PRDQuestionResponse {
  questions: string[];
}

// Better-T-Stack Integration

// Frontend types - supports Better-T-Stack frontends + custom (CLI, TUI)
export type BTSFrontend =
  // Better-T-Stack web frontends
  | "tanstack-router"
  | "react-router"
  | "tanstack-start"
  | "next"
  | "nuxt"
  | "svelte"
  | "solid"
  // Better-T-Stack native frontends
  | "native-bare"
  | "native-uniwind"
  | "native-unistyles"
  // Custom frontends (handled separately by task-o-matic)
  | "cli"
  | "tui"
  | "opentui" // Alias for tui
  | "medusa"
  | "none";

// CLI dependency levels
export type CliDependencyLevel =
  | "minimal"
  | "standard"
  | "full"
  | "task-o-matic";

export interface BTSConfig {
  frontend: BTSFrontend | BTSFrontend[]; // Array to support multiple frontends
  backend: "convex" | "hono" | "express" | "none";
  database: "sqlite" | "postgres" | "mysql" | "none";
  auth: "better-auth" | "clerk" | "none";
  projectName: string;
  runtime: string; // "none"
  api: string; // "none"
  payments: string; // "none"
  orm: string; // "none" for convex
  dbSetup: string; // "none"
  packageManager: string; // "npm"
  git: boolean; // true
  webDeploy: string; // "none"
  serverDeploy: string; // "none"
  install: boolean; // true
  includeDocs?: boolean;
  addons: string[]; // ["turborepo"]
  examples: string[]; // []
  createdAt?: string;
  _source?: string; // Track if config came from file or fallback
}

// Init command options (add to support new frontends)
export interface InitOptions {
  // Project metadata
  projectName?: string;
  name?: string;
  directory?: string;

  // AI configuration
  aiProvider?: string;
  aiModel?: string;
  aiKey?: string;
  aiProviderUrl?: string;
  maxTokens?: string;
  temperature?: string;
  context7ApiKey?: string;

  // Frontend configuration - can now be array or comma-separated string
  frontend?: BTSFrontend | BTSFrontend[] | string;
  cliDeps?: CliDependencyLevel;
  tuiFramework?: "solid" | "vue" | "react";

  // Backend configuration
  backend?: string;
  database?: string;
  orm?: string;
  dbSetup?: string;
  auth?: string;
  noAuth?: boolean;

  // Build & deployment
  runtime?: string;
  api?: string;
  payment?: string;
  packageManager?: string;
  webDeploy?: string;
  serverDeploy?: string;

  // Options
  addons?: string[];
  examples?: string[];
  noGit?: boolean;
  noInstall?: boolean;
  noBootstrap?: boolean;
  includeDocs?: boolean;
}

export interface CreateTaskRequest {
  id?: string; // Allow AI-generated IDs
  title: string;
  description?: string;
  content?: string;
  parentId?: string;
  status?: "todo" | "in-progress" | "completed";
  estimatedEffort?: "small" | "medium" | "large";
  dependencies?: string[];
  tags?: string[];
  prdFile?: string; // Reference to the PRD file this task was created from
}

// API Response wrapper
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: number;
}

// AI Metadata for tasks (stored separately)
export interface TaskAIMetadata {
  taskId: string;
  aiGenerated: boolean;
  aiPrompt?: string;
  confidence?: number;
  aiProvider?: string;
  aiModel?: string;
  generatedAt?: number;
  enhancedAt?: number;
  analyzedAt?: number;
  splitAt?: number;
}

// Context Builder Types
export interface TaskContext {
  task: {
    id: string;
    title: string;
    description: string;
    fullContent?: string;
  };
  stack?: BTSConfig;
  documentation?: {
    recap: string;
    files: Array<{
      path: string;
    }>;
  };
  existingContent?: string;
  prdContent?: string;
  existingResearch?: Record<
    string,
    Array<{
      query: string;
      doc: string;
    }>
  >;
}

// Documentation Detection Result
export interface DocumentationDetection {
  libraries: Array<{
    name: string;
    context7Id: string;
    reason: string;
    searchQuery: string;
  }>;
  confidence: number;
  toolResults?: Array<{
    toolName: string;
    output: any;
  }>;
  files?: string[];
}

// AI Provider Types (union types based on AI SDK)
export const AI_PROVIDERS_LIST = [
  "openai",
  "anthropic",
  "openrouter",
  "custom",
  "gemini",
  "zai",
] as const;

export type AIProvider = (typeof AI_PROVIDERS_LIST)[number];

// AI Metadata Types (using AI SDK patterns)
export type MetadataType = "generated" | "enhanced" | "analyzed";

// AI Service Response Types (generic wrapper based on AI SDK patterns)
export interface AIServiceResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  metadata?: TaskAIMetadata;
  timestamp: number;
}

// JSON Parse Result Type (for AI JSON parsing based on AI SDK patterns)
export interface JSONParseResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  rawText?: string;
}

// Streaming Callback Types (based on AI SDK patterns)
export interface StreamingCallbacks {
  onChunk?: (chunk: string) => void | Promise<void>;
  onFinish?: (result: {
    text: string;
    finishReason?: string;
    usage?: any;
    isAborted?: boolean;
  }) => void | Promise<void>;
  onError?: (error: unknown) => void | Promise<void>;
  onAbort?: (reason?: string) => void | Promise<void>;
  onReasoning?: (text: string) => void | Promise<void>;
}

// Streaming Options Interface
export interface StreamingOptions extends StreamingCallbacks {
  /** Enable streaming responses. When false, callbacks are ignored and final result is returned. */
  enabled?: boolean;
}

// Provider Configuration Types (based on AI SDK provider patterns)
export type ProviderConfig = {
  [K in AIProvider]: {
    apiKey?: string;
    baseURL?: string;
    model: string;
  };
};

// Retry Configuration Interface
export interface RetryConfig {
  maxAttempts?: number;
  baseDelay?: number; // Base delay in milliseconds
  maxDelay?: number; // Maximum delay in milliseconds
  backoffFactor?: number; // Multiplier for exponential backoff
  retryableErrors?: string[]; // Error types that should be retried
}

// Helper types for API responses
export type TaskListResponse = Task[];

// External Executor Types
export type ExecutorTool = "opencode" | "claude" | "gemini" | "codex";

// Executor Configuration
export interface ExecutorConfig {
  model?: string; // Model to use
  sessionId?: string; // Specific session ID to resume
  continueLastSession?: boolean; // Continue the most recent session
}

export interface ExecuteTaskOptions {
  taskId: string;
  tool?: ExecutorTool;
  message?: string;
  dry?: boolean;
  validate?: string[]; // Alias: verification commands (supports both --validate and --verify)
  model?: string; // Model to use
  continueSession?: boolean; // Continue last session
  // New options (unified with execute-loop)
  maxRetries?: number; // Enable retry logic (opt-in, default: undefined = disabled)
  tryModels?: ModelAttemptConfig[]; // Progressive model escalation
  plan?: boolean; // Generate implementation plan
  planModel?: string; // Model/executor for planning
  reviewPlan?: boolean; // Enable human plan review
  review?: boolean; // Enable AI code review
  reviewModel?: string; // Model/executor for review
  autoCommit?: boolean; // Auto-commit changes
}

export interface ExternalExecutor {
  name: string;
  execute(
    message: string,
    dry?: boolean,
    config?: ExecutorConfig
  ): Promise<void>;
  supportsSessionResumption(): boolean; // Indicates if executor supports session resumption
}

export interface ExecutionResult {
  success: boolean;
  exitCode?: number;
  error?: string;
}

// Model/Executor Configuration for Retry Attempts
export interface ModelAttemptConfig {
  executor?: ExecutorTool; // Executor to use (if not specified, uses default)
  model?: string; // Model name to use with the executor
}

// Execute Loop Configuration
export interface ExecuteLoopConfig {
  model?: string; // Default model for the executor
  maxRetries?: number; // Maximum retries per task (default: 3)
  verificationCommands?: string[]; // Commands to run after each task
  autoCommit?: boolean; // Auto-commit after successful task execution
  tryModels?: ModelAttemptConfig[]; // Progressive model/executor configs for each attempt
  plan?: boolean; // Generate a plan before execution
  planModel?: string; // Model/executor to use for planning (e.g. "opencode:gpt-4o")
  reviewPlan?: boolean; // Pause for human review of the plan
  review?: boolean; // Run AI review after execution
  reviewModel?: string; // Model/executor to use for review
  customMessage?: string; // NEW: Custom message override (from execute command)
  continueSession?: boolean; // NEW: Continue last session (from execute command)
}

// Execute Loop Options
export interface ExecuteLoopOptions {
  filters?: {
    status?: string;
    tag?: string;
    taskIds?: string[]; // Specific task IDs to execute
  };
  tool?: ExecutorTool;
  config?: ExecuteLoopConfig;
  dry?: boolean;
}

// Task Execution Attempt
export interface TaskExecutionAttempt {
  attemptNumber: number;
  success: boolean;
  error?: string;
  executor?: ExecutorTool; // Executor used for this attempt
  model?: string; // Model used for this attempt
  verificationResults?: Array<{
    command: string;
    success: boolean;
    output?: string;
    error?: string;
  }>;
  commitInfo?: {
    message: string;
    files: string[];
  };
  timestamp: number;
}

// Execute Loop Result
export interface ExecuteLoopResult {
  totalTasks: number;
  completedTasks: number;
  failedTasks: number;
  taskResults: Array<{
    taskId: string;
    taskTitle: string;
    attempts: TaskExecutionAttempt[];
    finalStatus: "completed" | "failed";
  }>;
  duration: number;
}

// Unified Task Execution Configuration (used by both execute and execute-loop)
export interface TaskExecutionConfig {
  tool: ExecutorTool;
  executorConfig?: ExecutorConfig;
  customMessage?: string; // Override execution message
  verificationCommands?: string[]; // Validation/verification commands
  enableRetry?: boolean; // Enable retry logic (default: false for execute, true for execute-loop)
  maxRetries?: number; // Maximum retries per task (default: 3)
  tryModels?: ModelAttemptConfig[]; // Progressive model/executor configs
  enablePlanPhase?: boolean; // Generate implementation plan
  planModel?: string; // Model/executor for planning (format: "executor:model" or "model")
  reviewPlan?: boolean; // Enable human plan review
  enableReviewPhase?: boolean; // Enable AI code review
  reviewModel?: string; // Model/executor for review (format: "executor:model" or "model")
  autoCommit?: boolean; // Auto-commit changes
  executeSubtasks?: boolean; // Execute subtasks recursively (default: true)
  dry?: boolean; // Dry run mode
}

// Unified Task Execution Result (used by both execute and execute-loop)
export interface TaskExecutionResult {
  success: boolean;
  attempts: TaskExecutionAttempt[];
  commitInfo?: {
    message: string;
    files: string[];
  };
  subtaskResults?: TaskExecutionResult[]; // Results from subtask execution
  planContent?: string; // Generated plan content
  reviewFeedback?: string; // Review feedback if review was enabled
}

// Re-export result types from results.ts
export type {
  OperationResult,
  CreateTaskResult,
  EnhanceTaskResult,
  SplitTaskResult,
  PlanTaskResult,
  DocumentTaskResult,
  DeleteTaskResult,
  PRDParseResult,
} from "./results";
