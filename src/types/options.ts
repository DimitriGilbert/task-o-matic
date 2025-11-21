// Base interface for any command that can use AI
export interface AIProviderOptions {
  aiProvider?: string;
  aiModel?: string;
  aiKey?: string;
  aiProviderUrl?: string;
  aiReasoning?: string; // For OpenRouter
}

// For commands that can stream AI output
export interface StreamingAIOptions extends AIProviderOptions {
  stream?: boolean;
}

// tasks list
export interface ListTasksOptions {
  status?: string;
  tag?: string;
}

// tasks create
export interface CreateTaskOptions extends StreamingAIOptions {
  title: string;
  content?: string;
  effort?: string;
  parentId?: string;
  aiEnhance?: boolean;
  taskId?: string; // Internal use for pre-defining an ID
}

// tasks show
export interface ShowTaskOptions {
  id: string;
}

// tasks document
export interface DocumentTaskOptions extends StreamingAIOptions {
  taskId: string;
  force?: boolean;
}

// tasks enhance
export interface EnhanceTaskOptions extends StreamingAIOptions {
  taskId: string;
  all?: boolean; // Not passed to the function, handled in command
}

// tasks split
export interface SplitTaskOptions extends StreamingAIOptions {
  taskId: string;
  all?: boolean; // Not passed to the function, handled in command
  prompt?: string;
  message?: string;
}

// tasks plan
export interface PlanTaskOptions extends StreamingAIOptions {
  id: string;
}

// tasks get-plan
export interface GetPlanOptions {
  id: string;
}

// tasks update
export interface UpdateTaskOptions {
  id: string;
  title?: string;
  description?: string;
  status?: "todo" | "in-progress" | "completed";
  effort?: "small" | "medium" | "large";
  tags?: string; // Comes as a comma-separated string from the CLI
}

// tasks delete
export interface DeleteTaskOptions {
  id: string;
  force?: boolean;
  cascade?: boolean;
}

// tasks status
export interface SetTaskStatusOptions {
  id: string;
  status: "todo" | "in-progress" | "completed";
}

// tasks add-tags / remove-tags
export interface ManageTagsOptions {
  id: string;
  tags: string; // Comes as a comma-separated string from the CLI
}

// tasks delete-plan
export interface DeletePlanOptions {
  id: string;
}

// tasks subtasks
export interface ListSubtasksOptions {
  id: string;
}

// tasks tree
export interface TaskTreeOptions {
  id?: string;
}

// tasks get-next
export interface GetNextTaskOptions {
  status?: "todo" | "in-progress"; // Filter by status
  tag?: string; // Filter by tag
  effort?: "small" | "medium" | "large"; // Filter by effort
  priority?: "newest" | "oldest" | "effort"; // Sort priority
}

// prd parse
export interface ParsePrdOptions extends StreamingAIOptions {
  file: string;
  prompt?: string;
  message?: string;
}

// prd rework
export interface ReworkPrdOptions extends StreamingAIOptions {
  file: string;
  feedback: string;
  output?: string;
  prompt?: string;
  message?: string;
}

// Workflow command types
export type WorkflowStep =
  | "initialize"
  | "define-prd"
  | "question-refine-prd"
  | "refine-prd"
  | "generate-tasks"
  | "split-tasks"
  | "complete";

export interface WorkflowState {
  projectName?: string;
  projectDir?: string;
  initialized: boolean;
  prdFile?: string;
  prdContent?: string;
  tasks?: Array<{ id: string; title: string; description?: string }>;
  currentStep: WorkflowStep;
  aiConfig?: {
    provider: string;
    model: string;
    key?: string;
  };
}

export interface AIAssistedChoice<T = any> {
  userInput: string;
  availableOptions: T[];
  context: string;
  recommendation?: T;
}

export interface InitConfigChoice {
  projectName: string;
  aiProvider: string;
  aiModel: string;
  aiProviderUrl?: string;
  frontend?: string;
  backend?: string;
  database?: string;
  auth?: boolean;
  reasoning?: string;
}

// Export workflow automation options
export * from "./workflow-options";
