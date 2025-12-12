# VAULT-TEC TYPE SYSTEM SCHEMATICS
## *S.P.E.C.I.A.L. Technical Manual - Volume 3*

> **VAULT-TEC INTERNAL DOCUMENT - CLASSIFIED**
> 
> Welcome, Vault Engineer! This manual contains the complete schematics for the task-o-matic Type System - the fundamental blueprints that ensure structural integrity of our post-apocalyptic project management system. These TypeScript interfaces are the reinforced steel beams that hold your Vault together!

---

## 📋 TABLE OF CONTENTS

1. [Core Task Architecture](#core-task-architecture)
2. [AI Configuration Systems](#ai-configuration-systems)
3. [Execution & Workflow Frameworks](#execution--workflow-frameworks)
4. [Results & Operation Patterns](#results--operation-patterns)
5. [CLI Interface Specifications](#cli-interface-specifications)
6. [Progress & Callback Systems](#progress--callback-systems)
7. [Vault-Tec Safety Protocols](#vault-tec-safety-protocols)

---

## 🔧 CORE TASK ARCHITECTURE

### The Task Blueprint (`Task` Interface)

The fundamental building block of our Vault's task management system!

```typescript
export interface Task extends CreateTaskOptions {
  id: string;                    // Unique Vault identification number
  status: "todo" | "in-progress" | "completed";
  createdAt: number;             // Timestamp in milliseconds since the Great War
  updatedAt: number;             // Last modification timestamp
  tags?: string[];               // Radiation hazard warnings and other labels
  subtasks?: Task[];             // Subterranean maintenance tasks
  contentFile?: string;          // Reference to detailed schematics file
  enhancedContentFile?: string;  // AI-enhanced technical specifications
  content?: string;              // Direct task description
  documentation?: TaskDocumentation; // Technical manuals and blueprints
  dependencies?: string[];       // Prerequisite systems that must be online
  description?: string;          // Executive summary for Overseer review
  estimatedEffort?: "small" | "medium" | "large"; // Resource allocation estimate
  prdFile?: string;              // Product Requirements Document reference
  plan?: string;                 // Implementation strategy document
}
```

#### **VAULT-TEC ENGINEERING NOTE:**
> Every task requires proper identification! The `id` field is your Vault Dweller's unique identifier - never duplicate, never leave empty!

#### **Task Creation Specifications (`CreateTaskOptions`)**

```typescript
export interface CreateTaskOptions {
  title: string;                 // Clear, concise task title
  content?: string;              // Detailed task description
  effort?: "small" | "medium" | "large"; // Resource requirements
  parentId?: string;             // Parent task in hierarchical structure
  aiEnhance?: boolean;          // Request AI enhancement for task details
}
```

#### **Task Documentation Reference (`TaskDocumentation`)**

```typescript
export interface TaskDocumentation {
  lastFetched: number;           // Last sync with Vault-Tec archives
  libraries: string[];           // Referenced technical libraries
  recap: string;                 // Executive summary of documentation
  files: string[];               // Associated blueprint files
  research?: Record<string, Array<{
    query: string;               // Research query performed
    doc: string;                 // Retrieved documentation
  }>>;
}
```

---

## 🤖 AI CONFIGURATION SYSTEMS

### AI Provider Configuration (`AIConfig`)

The brain interface for our Vault's artificial intelligence systems!

```typescript
export interface AIConfig {
  provider: AIProvider;          // AI service provider
  model: string;                 // Specific AI model designation
  apiKey?: string;               // Secure access credentials
  baseURL?: string;              // Custom endpoint for specialized AI systems
  maxTokens?: number;            // Response length limitations
  temperature?: number;          // AI creativity level (0.0 = robotic, 1.0 = chaotic)
  context7Enabled?: boolean;     // Enable Vault-Tec documentation retrieval
  reasoning?: {                  // Advanced reasoning capabilities
    maxTokens?: number;
  };
}
```

#### **Supported AI Providers (`AIProvider`)**

```typescript
export type AIProvider = "openai" | "anthropic" | "openrouter" | "custom";
```

#### **Environment Variable Configuration (`EnvAIConfig`)**

For secure Vault deployment via environment variables:

```typescript
export interface EnvAIConfig {
  AI_PROVIDER?: string;          // Provider selection
  AI_MODEL?: string;             // Model specification
  AI_MAX_TOKENS?: string;        // Token limits
  AI_TEMPERATURE?: string;       // Creativity settings
  OPENROUTER_API_KEY?: string;   // OpenRouter access key
  ANTHROPIC_API_KEY?: string;    // Anthropic access key
  OPENAI_API_KEY?: string;       // OpenAI access key
  CUSTOM_API_KEY?: string;       // Custom provider key
  CUSTOM_API_URL?: string;       // Custom provider endpoint
}
```

#### **VAULT-TEC SECURITY WARNING:**
> **NEVER** hardcode API keys in your source code! Always use environment variables or secure configuration files. The Overseer is watching!

#### **Provider Default Specifications (`ProviderDefaults`)**

Factory-approved settings for each AI provider:

```typescript
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
```

---

## ⚡ EXECUTION & WORKFLOW FRAMEWORKS

### External Executor Configuration

The heavy machinery for task execution in the wasteland!

```typescript
export type ExecutorTool = "opencode" | "claude" | "gemini" | "codex";

export interface ExecutorConfig {
  model?: string;                // AI model to use for execution
  sessionId?: string;            // Resume previous execution session
  continueLastSession?: boolean; // Continue most recent session
}

export interface ExternalExecutor {
  name: string;                  // Executor identification
  execute(message: string, dry?: boolean, config?: ExecutorConfig): Promise<void>;
  supportsSessionResumption(): boolean; // Session continuity capability
}
```

#### **Task Execution Configuration (`TaskExecutionConfig`)**

```typescript
export interface TaskExecutionConfig {
  tool: ExecutorTool;             // Primary execution tool
  executorConfig?: ExecutorConfig; // Tool-specific configuration
  customMessage?: string;         // Override default execution message
  verificationCommands?: string[]; // Post-execution validation commands
  enableRetry?: boolean;          // Enable retry logic (default: false)
  maxRetries?: number;            // Maximum retry attempts (default: 3)
  tryModels?: ModelAttemptConfig[]; // Progressive model escalation
  enablePlanPhase?: boolean;      // Generate implementation plan first
  planModel?: string;             // Model for planning phase
  reviewPlan?: boolean;           // Human plan review required
  enableReviewPhase?: boolean;    // AI code review after execution
  reviewModel?: string;           // Model for review phase
  autoCommit?: boolean;           // Automatic git commit on success
  executeSubtasks?: boolean;      // Recursive subtask execution
  dry?: boolean;                  // Simulation mode only
}
```

#### **Model Attempt Configuration (`ModelAttemptConfig`)**

Progressive escalation strategy for stubborn tasks:

```typescript
export interface ModelAttemptConfig {
  executor?: ExecutorTool;        // Executor to use for this attempt
  model?: string;                 // Model specification
}
```

#### **Execution Results (`TaskExecutionResult`)**

```typescript
export interface TaskExecutionResult {
  success: boolean;               // Mission success status
  attempts: TaskExecutionAttempt[]; // All execution attempts logged
  commitInfo?: {                  // Git commit information
    message: string;
    files: string[];
  };
  subtaskResults?: TaskExecutionResult[]; // Recursive subtask results
  planContent?: string;           // Generated implementation plan
  reviewFeedback?: string;        // AI review comments
}
```

### Workflow Automation System

Complete Vault project lifecycle management!

```typescript
export type WorkflowStep =
  | "initialize"
  | "define-prd"
  | "question-refine-prd"
  | "refine-prd"
  | "generate-tasks"
  | "split-tasks"
  | "complete";

export interface WorkflowState {
  projectName?: string;           // Vault project designation
  projectDir?: string;            // Project directory location
  initialized: boolean;           // Initialization status
  prdFile?: string;               // PRD file reference
  prdContent?: string;           // PRD document content
  tasks?: Array<{                // Generated task list
    id: string;
    title: string;
    description?: string;
  }>;
  currentStep: WorkflowStep;      // Current workflow phase
  aiConfig?: {                   // AI configuration
    provider: string;
    model: string;
    key?: string;
  };
}
```

---

## 📊 RESULTS & OPERATION PATTERNS

### Operation Result Pattern (`OperationResult`)

The Vault-Tec patented discriminated union pattern for error-free operations!

```typescript
export type OperationResult<T = any> =
  | {
      success: true;
      data: T;                     // Successful operation result
      stats?: Record<string, any>; // Performance metrics
      metadata?: Record<string, any>; // Additional context
    }
  | {
      success: false;
      error: string;               // Error description
      stats?: Record<string, any>; // Performance metrics
      metadata?: Record<string, any>; // Additional context
    };
```

#### **VAULT-TEC ENGINEERING PRO-TIP:**
> The discriminated union pattern prevents invalid states! TypeScript will ensure you can't access `data` when `success` is false - no more runtime explosions in your Vault!

#### **Specialized Result Types**

```typescript
// Task Creation Result
export interface CreateTaskResult {
  success: true;
  task: Task;
  aiMetadata?: TaskAIMetadata;
}

// Task Enhancement Result
export interface EnhanceTaskResult {
  success: true;
  task: Task;
  enhancedContent: string;
  stats: {
    originalLength: number;
    enhancedLength: number;
    duration: number;
    tokenUsage?: {
      prompt: number;
      completion: number;
      total: number;
    };
    timeToFirstToken?: number;    // First response time in ms
    cost?: number;                // Operation cost in USD
  };
  metadata: {
    aiProvider: string;
    aiModel: string;
    confidence: number;
  };
}

// Task Splitting Result
export interface SplitTaskResult {
  success: true;
  task: Task;
  subtasks: Task[];
  stats: {
    subtasksCreated: number;
    duration: number;
    tokenUsage?: {
      prompt: number;
      completion: number;
      total: number;
    };
    timeToFirstToken?: number;
    cost?: number;
  };
  metadata: {
    aiProvider: string;
    aiModel: string;
    confidence?: number;
  };
}
```

### AI Metadata Tracking (`TaskAIMetadata`)

```typescript
export interface TaskAIMetadata {
  taskId: string;                 // Associated task ID
  aiGenerated: boolean;           // AI creation flag
  aiPrompt?: string;              // Original AI prompt
  confidence?: number;            // AI confidence level (0-1)
  aiProvider?: string;            // AI provider used
  aiModel?: string;               // AI model used
  generatedAt?: number;            // Generation timestamp
  enhancedAt?: number;            // Enhancement timestamp
  analyzedAt?: number;            // Analysis timestamp
  splitAt?: number;               // Split timestamp
}
```

---

## 🖥️ CLI INTERFACE SPECIFICATIONS

### Command Option Interfaces

Type-safe command-line interface specifications for Vault Engineers!

```typescript
// Base AI Provider Options
export interface AIProviderOptions {
  aiProvider?: string;
  aiModel?: string;
  aiKey?: string;
  aiProviderUrl?: string;
  reasoning?: string;
}

// Streaming Options
export interface StreamingOptions {
  stream?: boolean;
}

// Task Creation Command Options
export interface CreateCommandOptions extends 
  StreamingOptions, AIProviderOptions {
  title: string;
  content?: string;
  effort?: "small" | "medium" | "large";
  parentId?: string;
  aiEnhance?: boolean;
}

// Task Enhancement Command Options
export interface EnhanceCommandOptions extends
  TaskIdOrAllOptions,
  FilterOptions,
  DryRunOptions,
  ForceOptions,
  StreamingOptions,
  AIProviderOptions {}
```

#### **Filter and Selection Options**

```typescript
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
```

---

## 📈 PROGRESS & CALLBACK SYSTEMS

### Progress Event System (`ProgressEvent`)

Real-time progress monitoring for long-running Vault operations!

```typescript
export type ProgressEvent =
  | { type: "started"; message: string }
  | { type: "progress"; message: string; current?: number; total?: number }
  | { type: "stream-chunk"; text: string }
  | { type: "reasoning-chunk"; text: string }
  | { type: "completed"; message: string }
  | { type: "info"; message: string }
  | { type: "warning"; message: string };
```

#### **Progress Callback Interface (`ProgressCallback`)**

```typescript
export interface ProgressCallback {
  onProgress?: (event: ProgressEvent) => void;
  onComplete?: (result: any) => void;
  onError?: (error: Error) => void;
}
```

#### **Streaming Callback System (`StreamingCallbacks`)**

Advanced streaming for AI operations:

```typescript
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
```

---

## 🛡️ VAULT-TEC SAFETY PROTOCOLS

### Type Safety Guidelines

#### **1. Always Use Discriminated Unions**
```typescript
// ❌ BAD - Unsafe
interface UnsafeResult {
  success: boolean;
  data?: any;
  error?: string;
}

// ✅ GOOD - Vault-Tec approved
export type SafeResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };
```

#### **2. Never Use `any` Without Reason**
```typescript
// ❌ BAD - Radiation poisoning
function processTask(data: any): any {
  return data.processed;
}

// ✅ GOOD - Radiation shielded
function processTask<T>(data: T): ProcessedTask<T> {
  return { original: data, processed: enhance(data) };
}
```

#### **3. Use Type Guards for Runtime Validation**
```typescript
// Vault-Tec approved type guard
function isTask(obj: unknown): obj is Task {
  const task = obj as Task;
  return (
    typeof task === 'object' &&
    task !== null &&
    typeof task.id === 'string' &&
    typeof task.title === 'string' &&
    ['todo', 'in-progress', 'completed'].includes(task.status)
  );
}
```

### Common Pitfalls & Solutions

#### **PITFALL #1: Optional Property Overload**
```typescript
// ❌ PROBLEM: Too many optional properties
interface BadTaskConfig {
  title?: string;
  content?: string;
  effort?: "small" | "medium" | "large";
  // ...20 more optional properties
}

// ✅ SOLUTION: Group related properties
interface GoodTaskConfig {
  required: {
    title: string;
  };
  optional: {
    content?: string;
    effort?: "small" | "medium" | "large";
  };
  ai?: AIConfig;
  execution?: ExecutionConfig;
}
```

#### **PITFALL #2: String Type Pollution**
```typescript
// ❌ PROBLEM: Stringly-typed code
type BadStatus = string; // Could be anything!

// ✅ SOLUTION: Strict union types
type GoodStatus = "todo" | "in-progress" | "completed";
```

#### **PITFALL #3: Async/Await Type Loss**
```typescript
// ❌ PROBLEM: Lost type information
async function badFetch(id: string) {
  const response = await fetch(`/api/tasks/${id}`);
  return response.json(); // Returns any!
}

// ✅ SOLUTION: Explicit typing
async function goodFetch(id: string): Promise<Task> {
  const response = await fetch(`/api/tasks/${id}`);
  const data = await response.json();
  return validateTask(data); // Type guard ensures Task type
}
```

### Performance Optimization Tips

#### **1. Use Interface Merging Wisely**
```typescript
// Base interface
interface BaseTask {
  id: string;
  title: string;
}

// Extension for specific use cases
interface ExtendedTask extends BaseTask {
  subtasks: Task[];
  dependencies: string[];
}
```

#### **2. Leverage Generic Constraints**
```typescript
// Vault-Tec optimized generic
interface Repository<T extends { id: string }> {
  findById(id: string): Promise<T | null>;
  save(entity: T): Promise<T>;
  delete(id: string): Promise<void>;
}

// Usage with type safety
class TaskRepository implements Repository<Task> {
  // All methods are properly typed!
}
```

---

## 🔧 TROUBLESHOOTING GUIDE

### Common Type Errors & Solutions

#### **Error: "Property 'X' does not exist on type 'Y'"**
**Cause**: Missing property in interface definition
**Solution**: 
```typescript
// Add the missing property to your interface
interface Task {
  // existing properties...
  newProperty: string; // Add this
}
```

#### **Error: "Type 'X' is not assignable to type 'Y'"**
**Cause**: Type mismatch in assignment
**Solution**: Use type assertion or proper interface extension
```typescript
// Safe type assertion
const task = unknownData as Task;

// Or better, use type guard
if (isTask(unknownData)) {
  // TypeScript knows this is a Task now
  const task: Task = unknownData;
}
```

#### **Error: "Argument of type 'X' is not assignable to parameter of type 'Y'"**
**Cause**: Function parameter type mismatch
**Solution**: Check function signature and provide correct type
```typescript
// Ensure your object matches the expected interface
const createTaskOptions: CreateTaskOptions = {
  title: "Fix Vault Door",
  effort: "large",
  aiEnhance: true
};
```

### Debug Type Issues

#### **1. Use TypeScript's Type Assertion**
```typescript
// Debug unknown types
const debugType = <T>(value: T): T => {
  console.log('Type:', typeof value);
  console.log('Value:', value);
  return value;
};

const myTask = debugType<Task>(unknownTask);
```

#### **2. Leverage IDE Type Inspection**
Most modern IDEs show type information on hover. Use this feature to verify your types match expectations.

#### **3. Enable Strict TypeScript Mode**
```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true
  }
}
```

---

## 📚 REFERENCE QUICK GUIDE

### Essential Type Imports
```typescript
import {
  Task,
  AIConfig,
  TaskExecutionConfig,
  OperationResult,
  CreateTaskOptions,
  ProgressEvent,
  StreamingCallbacks
} from '../types';
```

### Common Type Patterns
```typescript
// API Response Wrapper
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: number;
}

// Configuration with Defaults
interface ConfigWithDefaults<T> {
  defaults: T;
  overrides: Partial<T>;
}

// Event Emitter Pattern
interface EventEmitter<T extends Record<string, any[]>> {
  on<K extends keyof T>(event: K, handler: (...args: T[K]) => void): void;
  emit<K extends keyof T>(event: K, ...args: T[K]): void;
}
```

---

## 🏁 CONCLUSION

Congratulations, Vault Engineer! You've mastered the task-o-matic Type System schematics. These TypeScript interfaces are the reinforced foundation that will keep your Vault running smoothly through any nuclear winter or super mutant attack.

**Remember the Vault-Tec motto: "Safety Through Strong Typing!"**

> **VAULT-TEC WARRANTY**: This type system is guaranteed to prevent 99.9% of runtime errors when used as directed. Side effects may include increased productivity, fewer bugs, and occasional smugness about your code's type safety.

---

**Document Classification: TOP SECRET**  
**VAULT-TEC PROPRIETARY INFORMATION**  
**Unauthorized distribution is punishable by reassignment to radroach cleanup duty**

*For technical support, contact your Vault-Tec representative or consult the mainframe terminal in the Overseer's office.*