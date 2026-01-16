## TECHNICAL BULLETIN NO. 005
### RESULTS TYPES - OPERATION OUTCOME DEFINITION SYSTEM

**DOCUMENT ID:** `task-o-matic-results-types-v1`
**CLEARANCE:** `All Personnel`
**MANDATORY COMPLIANCE:** `Yes`

### ⚠️ CRITICAL SURVIVAL NOTICE
Citizen, ignore these result types and your operations become blind in wasteland. Success and failure states merge into chaos, error handling becomes guesswork, and your API responses turn to radioactive static. This is your operation outcome foundation.

### TYPE SYSTEM ARCHITECTURE

The results types system provides **comprehensive outcome tracking** for all major operations. It uses **detailed result interfaces** with rich metadata, performance metrics, and execution tracking. The architecture supports:

- **Operation-Specific Results**: Tailored result interfaces for each workflow step
- **Performance Metrics**: Detailed timing, token usage, and cost tracking
- **Error Context**: Rich error information with recovery suggestions
- **Metadata Support**: Extensible metadata for debugging and analysis
- **Integration Points**: Clean separation between workflow components

This design enables **predictable operation execution** while providing detailed operation feedback and comprehensive error handling.

### COMPLETE TYPE DOCUMENTATION

#### OperationResult Type

```typescript
export type OperationResult<T = any> =
  | {
      success: true;
      data: T;
      stats?: Record<string, any>;
      metadata?: Record<string, any>;
    }
  | {
      success: false;
      error: string;
      stats?: Record<string, any>;
      metadata?: Record<string, any>;
    };
```

**Purpose**: Generic operation result using discriminated union pattern

**Success Branch Properties**:
- **success** (Literal true): Discriminator for success state
- **data** (Type T): Operation result data
- **stats** (Optional, Record): Operation statistics
- **metadata** (Optional, Record): Additional metadata

**Failure Branch Properties**:
- **success** (Literal false): Discriminator for failure state
- **error** (Required, string): Error message
- **stats** (Optional, Record): Operation statistics even on failure
- **metadata** (Optional, Record): Error context metadata

**Usage Examples**:
```typescript
// Success result
const successResult: OperationResult<Task> = {
  success: true,
  data: createdTask,
  stats: { duration: 1500, tokensUsed: 250 }
};

// Failure result
const failureResult: OperationResult<Task> = {
  success: false,
  error: "Task creation failed: Invalid title",
  stats: { duration: 500, attempts: 3 }
};

// Type-safe usage
function handleResult(result: OperationResult<Task>): void {
  if (result.success) {
    console.log(`Success: ${result.data.title}`);
    console.log(`Stats: ${JSON.stringify(result.stats)}`);
  } else {
    console.error(`Error: ${result.error}`);
    console.log(`Stats: ${JSON.stringify(result.stats)}`);
  }

  // Guaranteed type narrowing
  function processData(result: OperationResult<string>): string {
    if (result.success) {
      // TypeScript knows result.data exists and is string
      return result.data.toUpperCase();
    } else {
      // TypeScript knows result.error exists and is string
      return `ERROR: ${result.error.toUpperCase()}`;
    }
  }
}
```

#### CreateTaskResult Interface

```typescript
export interface CreateTaskResult {
  success: true;
  task: Task;
  aiMetadata?: TaskAIMetadata;
}
```

**Purpose**: Result of task creation operation (always successful)

**Properties**:
- **success** (Literal true): Always true for this operation
- **task** (Required, Task): Created task object
- **aiMetadata** (Optional, TaskAIMetadata): AI operation metadata

**Usage Examples**:
```typescript
// Basic task creation result
const basicResult: CreateTaskResult = {
  success: true,
  task: {
    id: "task-123",
    title: "New task",
    status: "todo",
    createdAt: Date.now(),
    updatedAt: Date.now()
  }
};

// AI-enhanced task creation result
const aiResult: CreateTaskResult = {
  success: true,
  task: {
    id: "task-456",
    title: "AI-enhanced task",
    content: "Enhanced description with AI improvements",
    status: "todo",
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  aiMetadata: {
    taskId: "task-456",
    aiGenerated: true,
    aiPrompt: "Enhance task with better structure and details",
    confidence: 0.92,
    aiProvider: "anthropic",
    aiModel: "claude-3.5-sonnet",
    generatedAt: Date.now()
  }
};

// Handling in service layer
async function createTask(options: CreateTaskOptions): Promise<CreateTaskResult> {
  const task = await this.storage.createTask(options);

  if (options.aiEnhance) {
    const aiMetadata = await this.aiService.enhanceTask(task);
    return {
      success: true,
      task: aiMetadata.enhancedTask,
      aiMetadata: aiMetadata.metadata
    };
  }

  return {
    success: true,
    task
  };
}
```

#### EnhanceTaskResult Interface

```typescript
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
    timeToFirstToken?: number; // ms
    cost?: number; // USD
  };
  metadata: {
    aiProvider: string;
    aiModel: string;
    confidence: number;
  };
}
```

**Purpose**: Result of task enhancement operation with detailed metrics

**Properties**:
- **success** (Literal true): Always true for this operation
- **task** (Required, Task): Enhanced task object
- **enhancedContent** (Required, string): AI-enhanced content
- **stats** (Required, object): Operation statistics
  - **originalLength** (Required, number): Original content length
  - **enhancedLength** (Required, number): Enhanced content length
  - **duration** (Required, number): Operation duration in milliseconds
  - **tokenUsage** (Optional, object): AI token usage
    - **timeToFirstToken** (Optional, number): Time to first token in ms
    - **cost** (Optional, number): Estimated cost in USD
- **metadata** (Required, object): AI operation metadata
  - **aiProvider** (Required, string): AI provider used
  - **aiModel** (Required, string): AI model used
  - **confidence** (Required, number): AI confidence score

**Usage Examples**:
```typescript
// Enhancement result with full metrics
const enhancementResult: EnhanceTaskResult = {
  success: true,
  task: enhancedTask,
  enhancedContent: "Enhanced task description with detailed requirements and acceptance criteria...",
  stats: {
    originalLength: 150,
    enhancedLength: 450,
    duration: 3200,
    tokenUsage: {
      prompt: 200,
      completion: 300,
      total: 500
    },
    timeToFirstToken: 800,
    cost: 0.015
  },
  metadata: {
    aiProvider: "anthropic",
    aiModel: "claude-3.5-sonnet",
    confidence: 0.89
  }
};

// Enhancement result without token tracking
const basicEnhancement: EnhanceTaskResult = {
  success: true,
  task: enhancedTask,
  enhancedContent: "Simple enhancement without detailed metrics",
  stats: {
    originalLength: 100,
    enhancedLength: 200,
    duration: 1500
  },
  metadata: {
    aiProvider: "openrouter",
    aiModel: "anthropic/claude-3.5-sonnet",
    confidence: 0.85
  }
};

// Service layer implementation
async function enhanceTask(taskId: string): Promise<EnhanceTaskResult> {
  const startTime = Date.now();
  const task = await this.storage.getTask(taskId);

  if (!task) {
    throw new Error(`Task ${taskId} not found`);
  }

  const originalLength = task.content?.length || 0;
  const enhancedContent = await this.aiService.enhanceContent(task.content);
  const duration = Date.now() - startTime;

  const enhancedTask = {
    ...task,
    content: enhancedContent,
    updatedAt: Date.now()
  };

  await this.storage.updateTask(taskId, enhancedTask);

  return {
    success: true,
    task: enhancedTask,
    enhancedContent,
    stats: {
      originalLength,
      enhancedLength: enhancedContent.length,
      duration,
      tokenUsage: await this.getTokenUsage(),
      timeToFirstToken: await this.getTimeToFirstToken(),
      cost: await this.calculateCost()
    },
    metadata: {
      aiProvider: this.aiConfig.provider,
      aiModel: this.aiConfig.model,
      confidence: 0.92
    }
  };
}
```

#### SplitTaskResult Interface

```typescript
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
    timeToFirstToken?: number; // ms
    cost?: number; // USD
  };
  metadata: {
    aiProvider: string;
    aiModel: string;
    confidence?: number;
  };
}
```

**Purpose**: Result of task splitting operation with subtask details

**Properties**:
- **success** (Literal true): Always true for this operation
- **task** (Required, Task): Original task that was split
- **subtasks** (Required, Task[]): Array of created subtasks
- **stats** (Required, object): Operation statistics
  - **subtasksCreated** (Required, number): Number of subtasks created
  - **duration** (Required, number): Operation duration in milliseconds
  - **tokenUsage** (Optional, object): AI token usage
  - **timeToFirstToken** (Optional, number): Time to first token in ms
  - **cost** (Optional, number): Estimated cost in USD
- **metadata** (Required, object): AI operation metadata
  - **aiProvider** (Required, string): AI provider used
  - **aiModel** (Required, string): AI model used
  - **confidence** (Optional, number): AI confidence score

**Usage Examples**:
```typescript
// Task splitting result
const splitResult: SplitTaskResult = {
  success: true,
  task: originalTask,
  subtasks: [
    {
      id: "task-457",
      title: "Design database schema",
      content: "Create user table with proper fields",
      parentId: "task-123",
      status: "todo",
      createdAt: Date.now(),
      updatedAt: Date.now()
    },
    {
      id: "task-458",
      title: "Implement data access layer",
      content: "Create repository layer for database operations",
      parentId: "task-123",
      status: "todo",
      createdAt: Date.now(),
      updatedAt: Date.now()
    }
  ],
  stats: {
    subtasksCreated: 3,
    duration: 2800,
    tokenUsage: {
      prompt: 300,
      completion: 400,
      total: 700
    },
    timeToFirstToken: 1200,
    cost: 0.021
  },
  metadata: {
    aiProvider: "anthropic",
    aiModel: "claude-3.5-sonnet",
    confidence: 0.91
  }
};

// Service layer implementation
async function splitTask(taskId: string): Promise<SplitTaskResult> {
  const startTime = Date.now();
  const task = await this.storage.getTask(taskId);

  if (!task) {
    throw new Error(`Task ${taskId} not found`);
  }

  const subtasks = await this.aiService.splitTask(task);
  const duration = Date.now() - startTime;

  // Save subtasks
  for (const subtask of subtasks) {
    await this.storage.createTask({
      ...subtask,
      parentId: taskId,
      status: "todo",
      createdAt: Date.now(),
      updatedAt: Date.now()
    });
  }

  return {
    success: true,
    task,
    subtasks,
    stats: {
      subtasksCreated: subtasks.length,
      duration,
      tokenUsage: await this.getTokenUsage(),
      timeToFirstToken: await this.getTimeToFirstToken(),
      cost: await this.calculateCost()
    },
    metadata: {
      aiProvider: this.aiConfig.provider,
      aiModel: this.aiConfig.model,
      confidence: 0.88
    }
  };
}
```

#### PlanTaskResult Interface

```typescript
export interface PlanTaskResult {
  success: true;
  task: Task;
  plan: string;
  stats: {
    duration: number;
    tokenUsage?: {
      prompt: number;
      completion: number;
      total: number;
    };
    timeToFirstToken?: number; // ms
    cost?: number; // USD
  };
  metadata: {
    aiProvider: string;
    aiModel: string;
  };
}
```

**Purpose**: Result of task planning operation

**Properties**:
- **success** (Literal true): Always true for this operation
- **task** (Required, Task): Task for which plan was generated
- **plan** (Required, string): Generated implementation plan
- **stats** (Required, object): Operation statistics
  - **duration** (Required, number): Operation duration in milliseconds
  - **tokenUsage** (Optional, object): AI token usage
  - **timeToFirstToken** (Optional, number): Time to first token in ms
  - **cost** (Optional, number): Estimated cost in USD
- **metadata** (Required, object): AI operation metadata
  - **aiProvider** (Required, string): AI provider used
  - **aiModel** (Required, string): AI model used

**Usage Examples**:
```typescript
// Task planning result
const planResult: PlanTaskResult = {
  success: true,
  task: originalTask,
  plan: `1. Setup project structure with TypeScript
2. Configure build tools (Webpack, Babel)
3. Create component architecture
4. Implement authentication system
5. Add database integration
6. Write comprehensive tests
7. Setup CI/CD pipeline

Estimated effort: 2-3 weeks
Key dependencies: TypeScript, Node.js, PostgreSQL`,
  stats: {
    duration: 3500,
    tokenUsage: {
      prompt: 400,
      completion: 600,
      total: 1000
    },
    timeToFirstToken: 1500,
    cost: 0.030
  },
  metadata: {
    aiProvider: "openrouter",
    aiModel: "anthropic/claude-3.5-sonnet"
  }
};

// Service layer implementation
async function planTask(taskId: string): Promise<PlanTaskResult> {
  const startTime = Date.now();
  const task = await this.storage.getTask(taskId);

  if (!task) {
    throw new Error(`Task ${taskId} not found`);
  }

  const plan = await this.aiService.generatePlan(task);
  const duration = Date.now() - startTime;

  // Update task with plan
  const updatedTask = {
    ...task,
    plan,
    updatedAt: Date.now()
  };

  await this.storage.updateTask(taskId, updatedTask);

  return {
    success: true,
    task: updatedTask,
    plan,
    stats: {
      duration,
      tokenUsage: await this.getTokenUsage(),
      timeToFirstToken: await this.getTimeToFirstToken(),
      cost: await this.calculateCost()
    },
    metadata: {
      aiProvider: this.aiConfig.provider,
      aiModel: this.aiConfig.model
    }
  };
}
```

#### DocumentTaskResult Interface

```typescript
export interface DocumentTaskResult {
  success: true;
  task: Task;
  analysis?: DocumentationDetection;
  documentation?: any;
  stats: {
    duration: number;
  };
}
```

**Purpose**: Result of task documentation operation

**Properties**:
- **success** (Literal true): Always true for this operation
- **task** (Required, Task): Task that was documented
- **analysis** (Optional, DocumentationDetection): Documentation analysis results
- **documentation** (Optional, any): Generated documentation content
- **stats** (Required, object): Operation statistics
  - **duration** (Required, number): Operation duration in milliseconds

**Usage Examples**:
```typescript
// Documentation result with analysis
const docResult: DocumentTaskResult = {
  success: true,
  task: documentedTask,
  analysis: {
    libraries: [
      { name: "react", context7Id: "/react", reason: "React components detected", searchQuery: "React hooks best practices" },
      { name: "typescript", context7Id: "/typescript", reason: "TypeScript usage detected", searchQuery: "TypeScript advanced types" }
    ],
    confidence: 0.92,
    toolResults: [
      { toolName: "context7-search", output: { docs: ["React documentation"] } }
    ],
    files: ["UserProfile.tsx", "useAuth.ts", "types.ts"]
  },
  documentation: {
    summary: "React authentication component with TypeScript",
    libraries: ["React", "TypeScript"],
    examples: [
      { code: "const UserProfile: React.FC<Props> = ({ user }) => { ... }", description: "Functional component pattern" }
    ],
    references: ["React Docs", "TypeScript Handbook"]
  },
  stats: {
    duration: 2200
  }
};

// Documentation result without analysis
const simpleDocResult: DocumentTaskResult = {
  success: true,
  task: documentedTask,
  documentation: {
    summary: "Simple task documentation",
    examples: ["Implementation details go here"]
  },
  stats: {
    duration: 1200
  }
};

// Service layer implementation
async function documentTask(taskId: string, force?: boolean): Promise<DocumentTaskResult> {
  const startTime = Date.now();
  const task = await this.storage.getTask(taskId);

  if (!task) {
    throw new Error(`Task ${taskId} not found`);
  }

  if (!force && task.documentation) {
    return {
      success: true,
      task,
      documentation: task.documentation,
      stats: { duration: Date.now() - startTime }
    };
  }

  const analysis = await this.documentationService.analyzeTask(task);
  const documentation = await this.documentationService.generateDocumentation(task, analysis);
  const duration = Date.now() - startTime;

  const updatedTask = {
    ...task,
    documentation,
    updatedAt: Date.now()
  };

  await this.storage.updateTask(taskId, updatedTask);

  return {
    success: true,
    task: updatedTask,
    analysis,
    documentation,
    stats: {
      duration
    }
  };
}
```

#### DeleteTaskResult Interface

```typescript
export interface DeleteTaskResult {
  success: true;
  deleted: Task[];
  orphanedSubtasks: Task[];
}
```

**Purpose**: Result of task deletion operation

**Properties**:
- **success** (Literal true): Always true for this operation
- **deleted** (Required, Task[]): Array of deleted tasks
- **orphanedSubtasks** (Required, Task[]): Array of orphaned subtasks

**Usage Examples**:
```typescript
// Simple task deletion
const deleteResult: DeleteTaskResult = {
  success: true,
  deleted: [deletedTask],
  orphanedSubtasks: []
};

// Cascade deletion with orphans
const cascadeResult: DeleteTaskResult = {
  success: true,
  deleted: [parentTask, childTask1, childTask2, grandchildTask1],
  orphanedSubtasks: [
    {
      id: "orphan-1",
      title: "Orphaned subtask",
      content: "This subtask's parent was deleted",
      status: "todo",
      parentId: null,
      createdAt: Date.now(),
      updatedAt: Date.now()
    }
  ]
};

// Service layer implementation
async function deleteTask(taskId: string, cascade: boolean = false): Promise<DeleteTaskResult> {
  const task = await this.storage.getTask(taskId);

  if (!task) {
    throw new Error(`Task ${taskId} not found`);
  }

  const deleted: [task];
  let orphanedSubtasks: Task[] = [];

  if (cascade) {
    // Get all descendants
    const allDescendants = await this.getAllDescendants(taskId);

    // Delete all descendants
    for (const descendant of allDescendants) {
      await this.storage.deleteTask(descendant.id);
      deleted.push(descendant);
    }

    // Find orphaned subtasks (children of deleted tasks whose parent was also deleted)
    orphanedSubtasks = allDescendants.filter(descendant =>
      descendant.parentId && !deleted.some(deleted => deleted.id === descendant.parentId)
    );
  }

  return {
    success: true,
    deleted,
    orphanedSubtasks
  };
}
```

#### PRDParseResult Interface

```typescript
export interface PRDParseResult {
  success: true;
  prd: {
    overview: string;
    objectives: string[];
    features: string[];
  };
  tasks: Task[];
  stats: {
    tasksCreated: number;
    duration: number;
    aiProvider: string;
    aiModel: string;
    tokenUsage?: {
      prompt: number;
      completion: number;
      total: number;
    };
    timeToFirstToken?: number; // ms
    cost?: number; // USD
  };
  steps: {
    step: string;
    status: "completed" | "failed";
    duration: number;
    details?: any;
  }[];
}
```

**Purpose**: Result of PRD parsing operation with detailed breakdown

**Properties**:
- **success** (Literal true): Always true for this operation
- **prd** (Required, object): Parsed PRD structure
  - **overview** (Required, string): PRD overview
  - **objectives** (Required, string[]): Project objectives
  - **features** (Required, string[]): Project features
- **tasks** (Required, Task[]): Created tasks from PRD
- **stats** (Required, object): Operation statistics
  - **tasksCreated** (Required, number): Number of tasks created
  - **duration** (Required, number): Total operation duration
  - **aiProvider** (Required, string): AI provider used
  - **aiModel** (Required, string): AI model used
  - **tokenUsage** (Optional, object): AI token usage
    - **timeToFirstToken** (Optional, number): Time to first token in ms)
    - **cost** (Optional, number): Estimated cost in USD
- **steps** (Required, array): Operation step breakdown
  - **step** (Required, string): Step name
  - **status** (Required, union): Step status
  - **duration** (Required, number): Step duration
  - **details** (Optional, any): Additional step details

**Usage Examples**:
```typescript
// PRD parsing result
const prdResult: PRDParseResult = {
  success: true,
  prd: {
    overview: "E-commerce platform with user authentication, product catalog, and order management",
    objectives: [
      "Provide secure user authentication and authorization",
      "Enable product browsing and search functionality",
      "Implement shopping cart and checkout process",
      "Support order tracking and user profiles"
    ],
    features: [
      "User registration and login",
      "Product catalog with categories",
      "Shopping cart functionality",
      "Order processing and payment integration",
      "User profile management",
      "Admin dashboard for inventory management"
    ]
  },
  tasks: [
    {
      id: "task-001",
      title: "Design user authentication system",
      content: "Create secure login, registration, and password reset functionality",
      status: "todo",
      createdAt: Date.now(),
      updatedAt: Date.now()
    },
    {
      id: "task-002",
      title: "Implement product catalog",
      content: "Build product listing, search, and categorization features",
      status: "todo",
      createdAt: Date.now(),
      updatedAt: Date.now()
    },
    {
      id: "task-003",
      title: "Build shopping cart",
      content: "Implement cart functionality with item management",
      status: "todo",
      createdAt: Date.now(),
      updatedAt: Date.now()
    }
  ],
  stats: {
    tasksCreated: 8,
    duration: 4500,
    aiProvider: "anthropic",
    aiModel: "claude-3.5-sonnet",
    tokenUsage: {
      prompt: 1200,
      completion: 1800,
      total: 3000
    },
    timeToFirstToken: 2000,
    cost: 0.090
  },
  steps: [
    { step: "PRD analysis", status: "completed", duration: 800, details: { sections: 6, complexity: "high" } },
    { step: "Task extraction", status: "completed", duration: 1200, details: { tasks: 8, confidence: 0.92 } },
    { step: "Task creation", status: "completed", duration: 2500, details: { tasks: 8, storage: "file-system" } }
  ]
};
```

#### SuggestStackResult Interface

```typescript
export interface SuggestStackResult {
  success: true;
  stack: BTSConfig;
  reasoning: string;
  savedPath?: string;
  stats: {
    duration: number;
    tokenUsage?: {
      prompt: number;
      completion: number;
      total: number;
    };
    timeToFirstToken?: number;
    cost?: number;
  };
}
```

**Purpose**: Result of stack suggestion operation

**Properties**:
- **success** (Literal true): Always true for this operation
- **stack** (Required, BTSConfig): Suggested stack configuration
- **reasoning** (Required, string): AI reasoning for suggestion
- **savedPath** (Optional, string): Path where config was saved
- **stats** (Required, object): Operation statistics
  - **duration** (Required, number): Operation duration
  - **tokenUsage** (Optional, object): AI token usage
  - **timeToFirstToken** (Optional, number): Time to first token in ms)
  - **cost** (Optional, number): Estimated cost in USD

**Usage Examples**:
```typescript
// Stack suggestion result
const suggestResult: SuggestStackResult = {
  success: true,
  stack: {
    frontend: "next",
    backend: "hono",
    database: "postgres",
    auth: true,
    projectName: "My Project",
    aiProvider: "anthropic",
    aiModel: "claude-3.5-sonnet"
  },
  reasoning: "Based on your project requirements and current codebase analysis, I recommend a modern, full-stack Next.js + Hono + PostgreSQL setup with Better-Auth authentication. This combination provides excellent developer experience, strong type safety, and scalable architecture for your e-commerce platform.",
  stats: {
    duration: 2500,
    tokenUsage: {
      prompt: 500,
      completion: 800,
      total: 1300
    },
    timeToFirstToken: 1200,
    cost: 0.039
  }
};
```

#### PRDFromCodebaseResult Interface

```typescript
export interface PRDFromCodebaseResult {
  success: true;
  prdPath: string;
  content: string;
  analysis: ProjectAnalysis;
  stats: {
    duration: number;
    tokenUsage?: {
      prompt: number;
      completion: number;
      total: number;
    };
    timeToFirstToken?: number;
    cost?: number;
  };
}
```

**Purpose**: Result of PRD generation from existing codebase

**Properties**:
- **success** (Literal true): Always true for this operation
- **prdPath** (Required, string): Path where PRD was saved
- **content** (Required, string): Generated PRD content
- **analysis** (Required, ProjectAnalysis): Codebase analysis results
- **stats** (Required, object): Operation statistics
  - **duration** (Required, number): Operation duration
  - **tokenUsage** (Optional, object): AI token usage
  - **timeToFirstToken** (Optional, number): Time to first token in ms)
  - **cost** (Optional, number): Estimated cost in USD

**Usage Examples**:
```typescript
// PRD from codebase result
const codebaseResult: PRDFromCodebaseResult = {
  success: true,
  prdPath: "./docs/PRD.md",
  content: "# My Project\n\nThis project builds...",
  analysis: {
    technologies: ["React", "Node.js", "PostgreSQL"],
    complexity: "medium",
    structure: "MVC architecture with modular components"
  },
  stats: {
    duration: 8000,
    tokenUsage: {
      prompt: 2000,
      completion: 3000,
      total: 5000
    },
    timeToFirstToken: 3000,
    cost: 0.15
  }
};
```

#### ContinueResult Interface

```typescript
export interface ContinueResult {
  success: boolean;
  action: string;
  projectStatus?: {
    tasks: {
      total: number;
      completed: number;
      inProgress: number;
      todo: number;
      completionPercentage: number;
    };
    prd?: {
      path: string;
      exists: boolean;
      features: string[];
    };
  };
  nextSteps: string[];
  message?: string;
  data?: any;
}
```

**Purpose**: Result of continue project operation

**Properties**:
- **success** (Required, boolean): Whether operation succeeded
- **action** (Required, string): Action performed
- **projectStatus** (Optional, object): Current project status
  - **tasks** (Required, object): Task statistics
    - **total** (Required, number): Total number of tasks
    - **completed** (Required, number): Number of completed tasks
    - **inProgress** (Required, number): Number of in-progress tasks
    - **todo** (Required, number): Number of todo tasks
    - **completionPercentage** (Required, number): Completion percentage
  - **prd** (Optional, object): PRD information
    - **path** (Optional, string): Path to PRD file
    - **exists** (Optional, boolean): Whether PRD exists
    - **features** (Optional, string[]): Extracted features
- **nextSteps** (Required, string[]): Suggested next steps
- **message** (Optional, string): Status message
- **data** (Optional, any): Additional data

**Usage Examples**:
```typescript
// Continue operation result
const continueResult: ContinueResult = {
  success: true,
  action: "review-status",
  projectStatus: {
    tasks: {
      total: 25,
      completed: 12,
      inProgress: 5,
      todo: 8,
      completionPercentage: 48.0
    },
    prd: {
      path: ".task-o-matic/prd/current-prd.md",
      exists: true,
      features: ["User authentication", "Product catalog", "Shopping cart", "Order management", "Admin dashboard"]
    },
  nextSteps: [
    "Complete user authentication implementation",
    "Finish product catalog features",
    "Add shopping cart functionality",
    "Implement order management",
    "Build admin dashboard"
  ],
  message: "Project is 48% complete. 5 features ready for implementation, 2 in progress, 8 tasks remain."
};
```

### FUNCTION DOCUMENTATION

No standalone functions in this module - this is a type definition file.

### TECHNICAL SPECIFICATIONS

#### Result Type Guarantees

1. **Type Safety**: Discriminated unions prevent invalid states
2. **Exhaustive Checking**: TypeScript ensures all properties handled
3. **Generic Support**: Flexible data typing for any operation
4. **Metadata Extensibility**: Optional additional properties supported
5. **Backward Compatibility**: Optional properties don't break existing code

#### Performance Characteristics

1. **Memory Efficiency**: Minimal object overhead
2. **Type Checking**: Zero runtime overhead
3. **Interface Size**: Optimized for common use cases
4. **Compilation**: Fast TypeScript compilation

**Remember:** Citizen, in wasteland of operations, well-defined result types are your compass. Every discriminated union is a path through fog of uncertainty, and every metadata field is a beacon of debugging light. Without them, your operations become lost in radioactive dust of ambiguous outcomes.
