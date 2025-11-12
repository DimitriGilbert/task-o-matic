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

// PRD Parsing
export interface PRDParseResult {
  tasks: Task[];
  summary: string;
  estimatedDuration: string;
  confidence: number;
}

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

export interface TaskBreakdownResponse {
  subtasks: ParsedAITask[];
}

// Better-T-Stack Integration
export interface BTSConfig {
  frontend: "react" | "next" | "vue" | "none";
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
  addons: string[]; // ["turborepo"]
  examples: string[]; // []
  createdAt?: string;
  _source?: string; // Track if config came from file or fallback
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
export type AIProvider = "openai" | "anthropic" | "openrouter" | "custom";

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

export interface ExecuteTaskOptions {
  taskId: string;
  tool?: ExecutorTool;
  message?: string;
  dry?: boolean;
  validate?: string[];
}

export interface ExternalExecutor {
  name: string;
  execute(message: string, dry?: boolean): Promise<void>;
}

export interface ExecutionResult {
  success: boolean;
  exitCode?: number;
  error?: string;
}
