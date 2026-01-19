/**
 * CLI Option Type Definitions
 * Provides proper TypeScript types for Commander.js option handlers
 */

/**
 * Common option interfaces
 */
export interface TaskIdOrAllOptions {
  taskId?: string;
  all?: boolean;
}

export interface FilterOptions {
  status?: "todo" | "in-progress" | "completed";
  tag?: string;
}

export interface DryRunOptions {
  dry?: boolean;
}

export interface ForceOptions {
  force?: boolean;
}

export interface StreamingOptions {
  stream?: boolean;
}

export interface AIProviderOptions {
  aiProvider?: string;
  aiModel?: string;
  aiKey?: string;
  aiProviderUrl?: string;
  reasoning?: string;
}

/**
 * Command-specific option interfaces
 */
export interface CreateCommandOptions
  extends StreamingOptions, AIProviderOptions {
  title: string;
  content?: string;
  effort?: "small" | "medium" | "large";
  parentId?: string;
  aiEnhance?: boolean;
}

export interface EnhanceCommandOptions
  extends
    TaskIdOrAllOptions,
    FilterOptions,
    DryRunOptions,
    ForceOptions,
    StreamingOptions,
    AIProviderOptions {}

export interface SplitCommandOptions
  extends
    TaskIdOrAllOptions,
    FilterOptions,
    DryRunOptions,
    ForceOptions,
    StreamingOptions,
    AIProviderOptions {
  ai?: string[];
  combineAi?: string;
  tools?: boolean;
}

export interface PlanCommandOptions
  extends StreamingOptions, AIProviderOptions {
  id: string;
}

export interface GetPlanCommandOptions {
  id: string;
}

export interface ListPlanCommandOptions {
  status?: string;
  tag?: string;
}

export interface DeletePlanCommandOptions {
  id: string;
}

export interface SetPlanCommandOptions {
  id: string;
  plan?: string;
  planFile?: string;
}

export interface DocumentCommandOptions
  extends StreamingOptions, AIProviderOptions {
  taskId: string;
  force?: boolean;
}

export interface GetDocumentationCommandOptions {
  id: string;
}

export interface AddDocumentationCommandOptions {
  id: string;
  docFile: string;
  overwrite?: boolean;
}

export interface ExecuteCommandOptions extends DryRunOptions {
  id: string;
  tool: string;
  message?: string;
  model?: string;
  continueSession?: boolean;
  validate?: string[];
  verify?: string[];
  maxRetries?: number;
  tryModels?: string;
  plan?: boolean;
  planModel?: string;
  planTool?: string;
  reviewPlan?: boolean;
  review?: boolean;
  reviewModel?: string;
  reviewTool?: string;
  autoCommit?: boolean;
  includePrd?: boolean;
}

export interface ExecuteLoopCommandOptions extends DryRunOptions {
  status?: string;
  tag?: string;
  ids?: string[];
  tool: string;
  maxRetries?: number;
  tryModels?: string;
  model?: string;
  verify?: string[];
  validate?: string[];
  message?: string;
  continueSession?: boolean;
  autoCommit?: boolean;
  plan?: boolean;
  planModel?: string;
  planTool?: string;
  reviewPlan?: boolean;
  review?: boolean;
  reviewModel?: string;
  reviewTool?: string;
  includeCompleted?: boolean;
  includePrd?: boolean;
  notify?: string[];
}

export interface ListCommandOptions {
  status?: string;
  tag?: string;
  all?: boolean;
}

export interface NextCommandOptions {
  tag?: string;
}

export interface UpdateCommandOptions {
  id: string;
  title?: string;
  status?: "todo" | "in-progress" | "completed";
  effort?: "small" | "medium" | "large";
}

export interface DeleteCommandOptions {
  id: string;
  force?: boolean;
}

export interface TagCommandOptions {
  id: string;
  tags: string;
}

export interface UntagCommandOptions {
  id: string;
  tags: string;
}
