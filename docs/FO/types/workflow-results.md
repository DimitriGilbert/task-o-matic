---
## TECHNICAL BULLETIN NO. 007
### WORKFLOW RESULTS - WORKFLOW EXECUTION OUTCOME SYSTEM

**DOCUMENT ID:** `task-o-matic-workflow-results-v1`
**CLEARANCE:** `All Personnel`
**MANDATORY COMPLIANCE:** `Yes`

### ⚠️ CRITICAL SURVIVAL NOTICE
Citizen, ignore these workflow result types and your workflow execution becomes a blind journey through wasteland. Success and failure states merge into chaos, progress tracking becomes guesswork, and your automation pipelines turn to radioactive dust. This is your workflow outcome foundation.

### TYPE SYSTEM ARCHITECTURE

The workflow results system provides **comprehensive outcome tracking** for all workflow operations. It uses **detailed result interfaces** with rich metadata, performance metrics, and step-by-step execution tracking. The architecture supports:

- **Operation-Specific Results**: Tailored result interfaces for each workflow step
- **Performance Metrics**: Detailed timing, token usage, and cost tracking
- **Step-by-Step Tracking**: Complete workflow execution history
- **Error Context**: Rich error information with recovery suggestions
- **Metadata Support**: Extensible metadata for debugging and analysis
- **Integration Points**: Clean separation between workflow components

This design enables **predictable workflow execution** while providing detailed operation feedback and comprehensive error handling.

### COMPLETE TYPE DOCUMENTATION

#### InitializeResult Interface

```typescript
export interface InitializeResult {
  success: boolean;
  projectDir: string;
  projectName: string;
  aiConfig: {
    provider: string;
    model: string;
    key: string;
  };
  stackConfig?: {
    projectName: string;
    aiProvider: string;
    aiModel: string;
    frontend?: string;
    backend?: string;
    database?: string;
    auth?: boolean;
    reasoning?: string;
  };
  bootstrapped: boolean;
}
```

**Purpose**: Result of project initialization step

**Properties**:
- **success** (Required, boolean): Whether initialization succeeded
- **projectDir** (Required, string): Path to initialized project directory
- **projectName** (Required, string): Name of initialized project
- **aiConfig** (Required, object): AI configuration used for initialization
  - **provider** (Required, string): AI provider name
  - **model** (Required, string): AI model name
  - **key** (Required, string): API authentication key
- **stackConfig** (Optional, object): Better-T-Stack configuration if applicable
  - **projectName** (Optional, string): Project name from stack config
  - **aiProvider** (Optional, string): AI provider from stack config
  - **aiModel** (Optional, string): AI model from stack config
  - **frontend** (Optional, string): Frontend framework
  - **backend** (Optional, string): Backend framework
  - **database** (Optional, string): Database choice
  - **auth** (Optional, boolean): Authentication inclusion
  - **reasoning** (Optional, string): Reasoning token limit
- **bootstrapped** (Required, boolean): Whether Better-T-Stack bootstrap was performed

**Usage Examples**:
```typescript
// Successful initialization
const successResult: InitializeResult = {
  success: true,
  projectDir: "/path/to/my-project",
  projectName: "E-commerce Platform",
  aiConfig: {
    provider: "anthropic",
    model: "claude-3.5-sonnet",
    key: "sk-ant-..."
  },
  stackConfig: {
    projectName: "E-commerce Platform",
    aiProvider: "anthropic",
    aiModel: "claude-3.5-sonnet",
    frontend: "next",
    backend: "hono",
    database: "postgres",
    auth: true,
    reasoning: "5000"
  },
  bootstrapped: true
};

// Initialization with minimal stack
const minimalResult: InitializeResult = {
  success: true,
  projectDir: "/path/to/cli-tool",
  projectName: "Task CLI Tool",
  aiConfig: {
    provider: "openai",
    model: "gpt-4",
    key: "sk-openai-..."
  },
  bootstrapped: false
};

// Failed initialization
const failureResult: InitializeResult = {
  success: false,
  projectDir: "",
  projectName: "",
  aiConfig: {
    provider: "",
    model: "",
    key: ""
  },
  bootstrapped: false
};
```

#### DefinePRDResult Interface

```typescript
export interface DefinePRDResult {
  success: boolean;
  prdFile: string;
  prdContent: string;
  method: "upload" | "manual" | "ai" | "skip";
  stats?: {
    duration: number;
    tokenUsage?: {
      prompt: number;
      completion: number;
      total: number;
    };
    timeToFirstToken?: number; // ms
    cost?: number; // USD
  };
}
```

**Purpose**: Result of PRD definition step

**Properties**:
- **success** (Required, boolean): Whether PRD definition succeeded
- **prdFile** (Required, string): Path to PRD file
- **prdContent** (Required, string): Content of PRD
- **method** (Required, union): Method used for PRD creation
  - `"upload"`: Used existing PRD file
  - `"manual"`: Created PRD interactively
  - `"ai"`: AI-generated PRD from description
  - `"skip"`: Skipped PRD definition
- **stats** (Optional, object): Operation statistics
  - **duration** (Required, number): Total operation duration
  - **tokenUsage** (Optional, object): AI token usage
    - **prompt** (Required, number): Prompt tokens used
    - **completion** (Required, number): Completion tokens used
    - **total** (Required, number): Total tokens used
  - **timeToFirstToken** (Optional, number): Time to first token in milliseconds
  - **cost** (Optional, number): Estimated cost in USD

**Usage Examples**:
```typescript
// Upload existing PRD
const uploadResult: DefinePRDResult = {
  success: true,
  prdFile: "./docs/PRD.md",
  prdContent: "# E-commerce Platform\n\n...",
  method: "upload"
};

// AI-generated PRD
const aiResult: DefinePRDResult = {
  success: true,
  prdFile: ".task-o-matic/prd/generated-prd.md",
  prdContent: "# AI-Generated E-commerce Platform\n\n...",
  method: "ai",
  stats: {
    duration: 3000,
    tokenUsage: {
      prompt: 400,
      completion: 600,
      total: 1000
    },
    timeToFirstToken: 1200,
    cost: 0.030
  }
};

// Manual PRD creation
const manualResult: DefinePRDResult = {
  success: true,
  prdFile: ".task-o-matic/prd/manual-prd.md",
  prdContent: "# Manual PRD\n\n...",
  method: "manual"
};

// Skip PRD
const skipResult: DefinePRDResult = {
  success: true,
  prdFile: "",
  prdContent: "",
  method: "skip"
};
```

#### RefinePRDResult Interface

```typescript
export interface RefinePRDResult {
  success: boolean;
  prdFile: string;
  prdContent: string;
  questions?: string[];
  answers?: Record<string, string>;
  stats?: {
    duration: number;
    tokenUsage?: {
      prompt: number;
      completion: number;
      total: number;
    };
    timeToFirstToken?: number; // ms
    cost?: number; // USD
  };
}
```

**Purpose**: Result of PRD refinement step

**Properties**:
- **success** (Required, boolean): Whether refinement succeeded
- **prdFile** (Required, string): Path to refined PRD file
- **prdContent** (Required, string): Content of refined PRD
- **questions** (Optional, string[]): Questions generated during refinement
- **answers** (Optional, Record<string, string>): Answers provided for questions
- **stats** (Optional, object): Operation statistics
  - **duration** (Required, number): Total operation duration
  - **tokenUsage** (Optional, object): AI token usage
    - **prompt** (Required, number): Prompt tokens used
    - **completion** (Required, number): Completion tokens used
    - **total** (Required, number): Total tokens used
  - **timeToFirstToken** (Optional, number): Time to first token in milliseconds)
  - **cost** (Optional, number): Estimated cost in USD

**Usage Examples**:
```typescript
// AI refinement with feedback
const aiRefineResult: RefinePRDResult = {
  success: true,
  prdFile: ".task-o-matic/prd/refined-prd.md",
  prdContent: "# Refined E-commerce Platform\n\n...",
  questions: [
    "What security measures should be implemented?",
    "How should system handle user data privacy?",
    "What are scalability requirements?",
    "What payment methods should be supported?",
    "What are the primary use cases?"
  ],
  answers: {
    "security": "Implement OAuth2 with JWT tokens, SSL/TLS encryption, and input validation",
    "privacy": "Follow GDPR compliance with data minimization and user consent",
    "scalability": "Design for horizontal scaling with load balancers and microservices",
    "useCases": "Product browsing, order management, inventory tracking, user profiles"
  },
  method: "ai",
  stats: {
    duration: 2500,
    tokenUsage: {
      prompt: 600,
      completion: 400,
      total: 1000
    },
    timeToFirstToken: 1000,
    cost: 0.024
  }
};

// Manual refinement
const manualRefineResult: RefinePRDResult = {
  success: true,
  prdFile: ".task-o-matic/prd/manual-refined-prd.md",
  prdContent: "# Manually Refined E-commerce Platform\n\n...",
  method: "manual"
};

// Question-based refinement
const questionRefineResult: RefinePRDResult = {
  success: true,
  prdFile: ".task-o-matic/prd/question-refined-prd.md",
  prdContent: "# Question-Refined E-commerce Platform\n\n...",
  questions: [
    "What are the key user personas?",
    "What are the primary use cases?",
    "What are the technical constraints?"
  ],
  answers: {
    "personas": "B2C customers, B2B administrators, mobile users",
    "useCases": "Product browsing, order management, inventory tracking",
    "constraints": "Mobile-first responsive design, offline capability, API rate limiting"
  },
  method: "ai",
  stats: {
    duration: 3000,
    tokenUsage: {
      prompt: 500,
      completion: 300,
      total: 800
    },
    timeToFirstToken: 1500,
    cost: 0.018
  }
};
```

#### GenerateTasksResult Interface

```typescript
export interface GenerateTasksResult {
  success: boolean;
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
}
```

**Purpose**: Result of task generation step

**Properties**:
- **success** (Required, boolean): Whether task generation succeeded
- **tasks** (Required, Task[]): Array of generated tasks
- **stats** (Required, object): Operation statistics
  - **tasksCreated** (Required, number): Number of tasks created
  - **duration** (Required, number): Total operation duration
  - **aiProvider** (Required, string): AI provider used
  - **aiModel** (Required, string): AI model used
  - **tokenUsage** (Optional, object): AI token usage
    - **timeToFirstToken** (Optional, number): Time to first token in milliseconds)
    - **cost** (Optional, number): Estimated cost in USD

**Usage Examples**:
```typescript
// Standard task generation
const standardResult: GenerateTasksResult = {
  success: true,
  tasks: [
    {
      id: "task-001",
      title: "Setup project structure",
      status: "todo",
      createdAt: Date.now(),
      updatedAt: Date.now()
    },
    {
      id: "task-002",
      title: "Implement authentication",
      status: "todo",
      createdAt: Date.now(),
      updatedAt: Date.now()
    }
  ],
  stats: {
    tasksCreated: 2,
    duration: 5000,
    aiProvider: "anthropic",
    aiModel: "claude-3.5-sonnet",
    tokenUsage: {
      prompt: 300,
      completion: 500,
      total: 800
    },
    timeToFirstToken: 1200,
    cost: 0.024
  }
};

// AI-enhanced task generation
const enhancedResult: GenerateTasksResult = {
  success: true,
  tasks: [
    {
      id: "task-001",
      title: "Setup project structure with TypeScript and ESLint",
      status: "todo",
      content: "Enhanced description with technical specifications...",
      createdAt: Date.now(),
      updatedAt: Date.now()
    }
  ],
  stats: {
    tasksCreated: 1,
    duration: 3000,
    aiProvider: "anthropic",
    aiModel: "claude-3.5-sonnet",
    tokenUsage: {
      prompt: 400,
      completion: 600,
      total: 1000
    },
    timeToFirstToken: 800,
    cost: 0.030
  }
};
```

#### SplitTasksResult Interface

```typescript
export interface SplitTasksResult {
  success: boolean;
  results: Array<{
    taskId: string;
    subtasks: Task[];
    error?: string;
  }>;
}
```

**Purpose**: Result of task splitting operation

**Properties**:
- **success** (Required, boolean): Whether splitting succeeded
- **results** (Required, array): Array of split results
  - **taskId** (Required, string): ID of task that was split
  - **subtasks** (Required, Task[]): Array of created subtasks
  - **error** (Optional, string): Error message if splitting failed for a task

**Usage Examples**:
```typescript
// Successful splitting
const splitResult: SplitTasksResult = {
  success: true,
  results: [
    {
      taskId: "task-large-001",
      subtasks: [
        {
          id: "task-large-001-1",
          title: "Design database schema",
          content: "Create user table with proper fields",
          parentId: "task-large-001",
          status: "todo",
          createdAt: Date.now(),
          updatedAt: Date.now()
        },
        {
          id: "task-large-001-2",
          title: "Implement data access layer",
          content: "Create repository layer for database operations",
          parentId: "task-large-001",
          status: "todo",
          createdAt: Date.now(),
          updatedAt: Date.now()
        }
      ]
    },
    {
      taskId: "task-medium-002",
      subtasks: [
        {
          id: "task-medium-002-1",
          title: "Create API endpoints",
          content: "Build RESTful API endpoints",
          parentId: "task-medium-002",
          status: "todo",
          createdAt: Date.now(),
          updatedAt: Date.now()
        }
      ]
    }
  ]
};

// Splitting with some errors
const errorResult: SplitTasksResult = {
  success: true,
  results: [
    {
      taskId: "task-complex-003",
      error: "Task too complex for automatic splitting"
    },
    {
      taskId: "task-vague-004",
      error: "Task content too vague for splitting"
    }
  ]
};
```

### FUNCTION DOCUMENTATION

No standalone functions in this module - this is a type definition file.

### INTEGRATION PROTOCOLS

#### Workflow Service Integration

```typescript
import {
  WorkflowAutomationOptions,
  InitializeResult,
  DefinePRDResult,
  RefinePRDResult,
  GenerateTasksResult,
  SplitTasksResult
} from '../types/workflow-options';
import {
  Task,
  BTSConfig
} from '../types/index';

export class WorkflowService {
  async executeWorkflow(options: WorkflowAutomationOptions): Promise<WorkflowResult> {
    const startTime = Date.now();

    try {
      // Step 1: Initialize
      if (!options.skipInit) {
        const initResult = await this.executeInitialization(options);
        console.log(`✅ Project initialized: ${initResult.projectName}`);
      }

      // Step 2: Define PRD
      if (!options.skipPrd) {
        const prdResult = await this.executePRDDefinition(options);
        console.log(`✅ PRD defined: ${prdResult.prdFile}`);
      }

      // Step 2.5: PRD Question/Refine
      if (!options.skipPrdQuestionRefine && options.prdQuestionRefine) {
        const questionResult = await this.executePRDQuestionRefine(options);
        console.log(`✅ PRD refined with questions: ${questionResult.questions?.length || 0}`);
      }

      // Step 3: Refine PRD
      if (!options.skipRefine) {
        const refineResult = await this.executePRDRefinement(options);
        console.log(`✅ PRD refined`);
      }

      // Step 4: Generate Tasks
      if (!options.skipGenerate) {
        const generateResult = await this.executeTaskGeneration(options);
        console.log(`✅ Generated ${generateResult.stats.tasksCreated} tasks`);
      }

      // Step 5: Split Tasks
      if (!options.skipSplit) {
        const splitResult = await this.executeTaskSplitting(options);
        console.log(`✅ Split ${splitResult.results.length} task groups`);
      }

      // Step 6: Execute Tasks
      if (options.execute) {
        await this.executeTaskExecution(options);
      }

      const duration = Date.now() - startTime;

      return {
        success: true,
        projectName: options.projectName || 'Untitled Project',
        tasksCreated: this.getTasksCreatedCount(),
        duration
      };

    } catch (error) {
      const duration = Date.now() - startTime;

      return {
        success: false,
        error: error.message,
        duration
      };
    }
  }

  private async executeInitialization(options: WorkflowAutomationOptions): Promise<InitializeResult> {
    console.log('🚀 Step 1: Initializing project...');

    const initOptions = {
      projectName: options.projectName,
      method: options.initMethod || 'quick',
      projectDescription: options.projectDescription,
      useExistingConfig: options.useExistingConfig,
      frontend: options.frontend,
      backend: options.backend,
      database: options.database,
      auth: options.auth,
      bootstrap: options.bootstrap,
      includeDocs: options.includeDocs,
      aiProvider: options.aiProvider,
      aiModel: options.aiModel,
      aiKey: options.aiKey,
      aiProviderUrl: options.aiProviderUrl,
      stream: options.stream
    };

    return await this.projectInitializer.initialize(initOptions);
  }

  private async executePRDDefinition(options: WorkflowAutomationOptions): Promise<DefinePRDResult> {
    console.log('📝 Step 2: Defining PRD...');

    switch (options.prdMethod) {
      case 'upload':
        if (!options.prdFile) {
          throw new Error('PRD file path required for upload method');
        }
        return await this.prdService.uploadPRD(options.prdFile, {
          aiProvider: options.aiProvider,
          aiModel: options.aiModel,
          stream: options.stream
        });

      case 'manual':
        return await this.prdService.createManualPRD();

      case 'ai':
        if (!options.prdDescription) {
          throw new Error('PRD description required for AI generation method');
        }
        return await this.prdService.generatePRD(options.prdDescription, {
          aiProvider: options.aiProvider,
          aiModel: options.aiModel,
          stream: options.stream
        });

      case 'skip':
        console.log('⏭️ Skipping PRD definition');
        return {
          success: true,
          prdFile: "",
          prdContent: "",
          method: "skip"
        };
    }
  }

  private async executePRDQuestionRefine(options: WorkflowAutomationOptions): Promise<RefinePRDResult> {
    console.log('❓ Step 2.5: PRD Question/Refine...');

    const prdContent = await this.prdService.getCurrentPRDContent();

    if (options.prdAnswerMode === 'ai') {
      const answerAIConfig = {
        provider: options.prdAnswerAiProvider || options.aiProvider,
        model: options.prdAnswerAiModel || options.aiModel,
        apiKey: options.prdAnswerAiKey || options.aiKey,
        baseURL: options.prdAnswerAiProviderUrl || options.aiProviderUrl,
        reasoning: options.prdAnswerAiReasoning
      };

      return await this.prdService.questionAndRefinePRD(prdContent, {
        answerMode: 'ai',
        answerAIConfig
      });
    } else {
      return await this.prdService.questionAndRefinePRD(prdContent, {
        answerMode: 'user'
      });
    }
  }

  private async executePRDRefinement(options: WorkflowAutomationOptions): Promise<RefinePRDResult> {
    console.log('✏️ Step 3: Refining PRD...');

    switch (options.refineMethod) {
      case 'manual':
        return await this.prdService.manualRefinePRD();
        break;

      case 'ai':
        if (!options.refineFeedback) {
          throw new Error('Refinement feedback required for AI refinement method');
        }
        return await this.prdService.aiRefinePRD(options.refineFeedback, {
          aiProvider: options.aiProvider,
          aiModel: options.aiModel,
          stream: options.stream
        });
        break;

      case 'skip':
        console.log('⏭️ Skipping PRD refinement');
        return {
          success: true,
          prdFile: await this.prdService.getCurrentPRDPath(),
          prdContent: await this.prdService.getCurrentPRDContent(),
          method: "skip"
        };
    }
  }

  private async executeTaskGeneration(options: WorkflowAutomationOptions): Promise<GenerateTasksResult> {
    console.log('📋 Step 4: Generating tasks...');

    switch (options.generateMethod) {
      case 'standard':
        return await this.taskService.generateTasksFromPRD({
          aiProvider: options.aiProvider,
          aiModel: options.aiModel,
          stream: options.stream
        });

      case 'ai':
        if (!options.generateInstructions) {
          throw new Error('Generation instructions required for AI generation method');
        }
        return await this.taskService.generateTasksFromPRD({
          aiProvider: options.aiProvider,
          aiModel: options.aiModel,
          stream: options.stream,
          customInstructions: options.generateInstructions
        });
    }
  }

  private async executeTaskSplitting(options: WorkflowAutomationOptions): Promise<SplitTasksResult> {
    console.log('🔧 Step 5: Splitting tasks...');

    // Determine which tasks to split
    let tasksToSplit: string[] = [];

    if (options.splitAll) {
      const allTasks = await this.taskService.listTasks();
      tasksToSplit = allTasks.map(task => task.id);
    } else if (options.splitTasks) {
      tasksToSplit = options.splitTasks.split(',').map(id => id.trim());
    }

    if (tasksToSplit.length === 0) {
      console.log('⏭️ No tasks to split');
      return {
        success: true,
        results: []
      };
    }

    console.log(`🔧 Splitting ${tasksToSplit.length} tasks...`);

    const results = [];

    for (const taskId of tasksToSplit) {
      try {
        const splitResult = await this.splitSingleTask(taskId, options);
        results.push({
          taskId,
          subtasks: splitResult.subtasks
        });
      } catch (error) {
        results.push({
          taskId,
          error: error.message
        });
      }
    }

    return {
      success: true,
      results
    };
  }

  private async splitSingleTask(taskId: string, options: WorkflowAutomationOptions): Promise<any> {
    const splitOptions: {
      taskId,
      aiProvider: options.aiProvider,
      aiModel: options.aiModel,
      apiKey: options.aiKey,
      baseURL: options.aiProviderUrl,
      stream: options.stream
    };

    if (options.splitMethod === 'custom') {
      if (!options.splitInstructions) {
        throw new Error('Split instructions required for custom splitting method');
      }
      splitOptions.prompt = options.splitInstructions;
    }

    return await this.taskService.splitTask(taskId, splitOptions);
  }

  private getTasksCreatedCount(): number {
    // Implementation would count tasks created during workflow
    return 0;
  }
}
```

### TECHNICAL SPECIFICATIONS

#### Configuration Validation Rules

1. **Mutual Exclusion**: Certain options are mutually exclusive
   - `skipAll` overrides individual step skips
   - `prdMethod` determines required related options
   - `splitAll` overrides `splitTasks`

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
   - Certain combinations may be incompatible
   - Database choice affects backend options

#### Performance Characteristics

1. **Configuration Loading**: File-based config loaded asynchronously
2. **Step Execution**: Sequential execution with dependency management
3. **Memory Management**: Configuration objects are lightweight
4. **Error Recovery**: Each step can fail independently

#### Security Considerations

1. **API Key Handling**: Keys loaded from options or environment
2. **File Access**: Config files validated for path traversal
3. **AI Provider Security**: Custom endpoints validated for SSL/TLS
4. **Code Execution**: Bootstrap processes validated for security

**Remember:** Citizen, in wasteland of manual project setup, workflow automation is your assembly line. Every option is a precision tool, every configuration is a quality control checkpoint, and every automated step is a worker that never sleeps. Configure them wisely, test them thoroughly, and they'll build your empire while you focus on bigger picture.
