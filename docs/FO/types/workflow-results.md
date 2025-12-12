## TECHNICAL BULLETIN NO. 007
### WORKFLOW RESULTS - WORKFLOW EXECUTION OUTCOME SYSTEM

**DOCUMENT ID:** `task-o-matic-workflow-results-v1`  
**CLEARANCE:** `All Personnel`  
**MANDATORY COMPLIANCE:** `Yes`

### ⚠️ CRITICAL SURVIVAL NOTICE
Citizen, ignore these workflow result types and your workflow execution becomes a blind journey through the wasteland. Success and failure states merge into chaos, progress tracking becomes guesswork, and your automation pipelines turn to radioactive dust. This is your workflow outcome foundation.

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
- **projectName** (Required, string): Name of the initialized project
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
}
```

**Purpose**: Result of PRD definition step

**Properties**:
- **success** (Required, boolean): Whether PRD definition succeeded
- **prdFile** (Required, string): Path to the PRD file
- **prdContent** (Required, string): Content of the PRD
- **method** (Required, union): Method used for PRD creation
  - `"upload"`: Used existing PRD file
  - `"manual"`: Created PRD interactively
  - `"ai"`: AI-generated PRD from description
  - `"skip"`: Skipped PRD definition

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
  method: "ai"
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
}
```

**Purpose**: Result of PRD refinement step

**Properties**:
- **success** (Required, boolean): Whether refinement succeeded
- **prdFile** (Required, string): Path to the refined PRD file
- **prdContent** (Required, string): Content of the refined PRD
- **questions** (Optional, string[]): Questions generated during refinement
- **answers** (Optional, Record<string, string>): Answers provided for questions

**Usage Examples**:
```typescript
// AI refinement with feedback
const aiRefineResult: RefinePRDResult = {
  success: true,
  prdFile: ".task-o-matic/prd/refined-prd.md",
  prdContent: "# Refined E-commerce Platform\n\n...",
  questions: [
    "What security measures should be implemented?",
    "How should the system handle user data privacy?",
    "What are the scalability requirements?"
    "What payment methods should be supported?"
  ],
  answers: {
    "security": "Implement OAuth2 with JWT tokens, SSL/TLS encryption, and input validation",
    "privacy": "Follow GDPR compliance with data minimization and user consent",
    "scalability": "Design for horizontal scaling with load balancers and microservices",
    "payments": "Support credit cards, PayPal, and Stripe"
  },
  method: "ai"
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
  method: "ai"
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
    timeToFirstToken?: number;
    cost?: number;
  };
}
```

**Purpose**: Result of task generation step

**Properties**:
- **success** (Required, boolean): Whether task generation succeeded
- **tasks** (Required, Task[]): Array of generated tasks
- **stats** (Required, object): Operation statistics
  - **tasksCreated** (Required, number): Number of tasks created
  - **duration** (Required, number): Operation duration in milliseconds
  - **aiProvider** (Required, string): AI provider used
  - **aiModel** (Required, string): AI model used
  - **tokenUsage** (Optional, object): AI token usage breakdown
    - **prompt** (Required, number): Prompt tokens used
    - **completion** (Required, number): Completion tokens used
    - **total** (Required, number): Total tokens used
  - **timeToFirstToken** (Optional, number): Time to first token in milliseconds
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
  - **taskId** (Required, string): ID of the task that was split
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
          status: "todo",
          parentId: "task-large-001",
          createdAt: Date.now(),
          updatedAt: Date.now()
        },
        {
          id: "task-large-001-2",
          title: "Implement data access layer",
          status: "todo",
          parentId: "task-large-001",
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
          status: "todo",
          parentId: "task-medium-002",
          createdAt: Date.now(),
          updatedAt: Date.now()
        }
      ]
    }
  ]
};

// Splitting with errors
const errorResult: SplitTasksResult = {
  success: true,
  results: [
    {
      taskId: "task-complex-003",
      error: "Task too complex for automatic splitting"
    },
    {
      taskId: "task-undefined-004",
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
// services/workflow.ts
import { WorkflowAutomationOptions, InitializeResult, DefinePRDResult, RefinePRDResult, GenerateTasksResult, SplitTasksResult } from '../types/workflow-options';
import { ProjectInitializer } from '../lib/project-initializer';
import { PRDService } from '../services/prd';
import { TaskService } from '../services/tasks';

export class WorkflowService {
  constructor(
    private projectInitializer: ProjectInitializer,
    private prdService: PRDService,
    private taskService: TaskService
  ) {}

  async executeWorkflow(options: WorkflowAutomationOptions): Promise<WorkflowResult> {
    const startTime = Date.now();
    
    try {
      // Step 1: Initialize
      if (!options.skipInit) {
        await this.executeInitialization(options);
      }
      
      // Step 2: Define PRD
      if (!options.skipPrd) {
        await this.executePRDDefinition(options);
      }
      
      // Step 2.5: PRD Question/Refine
      if (!options.skipPrdQuestionRefine && options.prdQuestionRefine) {
        await this.executePRDQuestionRefine(options);
      }
      
      // Step 3: Refine PRD
      if (!options.skipRefine) {
        await this.executePRDRefinement(options);
      }
      
      // Step 4: Generate Tasks
      if (!options.skipGenerate) {
        await this.executeTaskGeneration(options);
      }
      
      // Step 5: Split Tasks
      if (!options.skipSplit) {
        await this.executeTaskSplitting(options);
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

  private async executeInitialization(options: WorkflowAutomationOptions): Promise<void> {
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
    
    await this.projectInitializer.initialize(initOptions);
  }

  private async executePRDDefinition(options: WorkflowAutomationOptions): Promise<void> {
    console.log('📝 Step 2: Defining PRD...');
    
    switch (options.prdMethod) {
      case 'upload':
        if (!options.prdFile) {
          throw new Error('PRD file path required for upload method');
        }
        await this.prdService.uploadPRD(options.prdFile);
        break;
        
      case 'manual':
        await this.prdService.createManualPRD();
        break;
        
      case 'ai':
        if (!options.prdDescription) {
          throw new Error('PRD description required for AI generation method');
        }
        await this.prdService.generatePRD(options.prdDescription, {
          aiProvider: options.aiProvider,
          aiModel: options.aiModel,
          stream: options.stream
        });
        break;
        
      case 'skip':
        console.log('⏭️ Skipping PRD definition');
        break;
        
      default:
        throw new Error(`Invalid PRD method: ${options.prdMethod}`);
    }
  }

  private async executePRDQuestionRefine(options: WorkflowAutomationOptions): Promise<void> {
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
      
      await this.prdService.questionAndRefinePRD(prdContent, {
        answerMode: 'ai',
        answerAIConfig
      });
    } else {
      await this.prdService.questionAndRefinePRD(prdContent, {
        answerMode: 'user'
      });
    }
  }

  private async executePRDRefinement(options: WorkflowAutomationOptions): Promise<void> {
    console.log('✏️ Step 3: Refining PRD...');
    
    switch (options.refineMethod) {
      case 'manual':
        await this.prdService.manualRefinePRD();
        break;
        
      case 'ai':
        if (!options.refineFeedback) {
          throw new Error('Refinement feedback required for AI refinement method');
        }
        await this.prdService.aiRefinePRD(options.refineFeedback, {
          aiProvider: options.aiProvider,
          aiModel: options.aiModel,
          stream: options.stream
        });
        break;
        
      case 'skip':
        console.log('⏭️ Skipping PRD refinement');
        break;
        
      default:
        throw new Error(`Invalid refinement method: ${options.refineMethod}`);
    }
  }

  private async executeTaskGeneration(options: WorkflowAutomationOptions): Promise<void> {
    console.log('📋 Step 4: Generating tasks...');
    
    switch (options.generateMethod) {
      case 'standard':
        await this.taskService.generateTasksFromPRD({
          aiProvider: options.aiProvider,
          aiModel: options.aiModel,
          stream: options.stream
        });
        break;
        
      case 'ai':
        if (!options.generateInstructions) {
          throw new Error('Generation instructions required for AI generation method');
        }
        await this.taskService.generateTasksFromPRD({
          aiProvider: options.aiProvider,
          aiModel: options.aiModel,
          stream: options.stream,
          customInstructions: options.generateInstructions
        });
        break;
        
      default:
        throw new Error(`Invalid generation method: ${options.generateMethod}`);
    }
  }

  private async executeTaskSplitting(options: WorkflowAutomationOptions): Promise<void> {
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
      return;
    }
    
    switch (options.splitMethod) {
      case 'interactive':
        for (const taskId of tasksToSplit) {
          await this.taskService.splitTaskInteractive(taskId, {
            aiProvider: options.aiProvider,
            aiModel: options.aiModel,
            stream: options.stream
          });
        }
        break;
        
      case 'standard':
        for (const taskId of tasksToSplit) {
          await this.taskService.splitTask(taskId, {
            aiProvider: options.aiProvider,
            aiModel: options.aiModel,
            stream: options.stream
          });
        }
        break;
        
      case 'custom':
        if (!options.splitInstructions) {
          throw new Error('Split instructions required for custom splitting method');
        }
        for (const taskId of tasksToSplit) {
          await this.taskService.splitTask(taskId, {
            aiProvider: options.aiProvider,
            aiModel: options.aiModel,
            stream: options.stream,
            customInstructions: options.splitInstructions
          });
        }
        break;
        
      default:
        throw new Error(`Invalid splitting method: ${options.splitMethod}`);
    }
  }

  private getTasksCreatedCount(): number {
    // Implementation would count tasks created during workflow
    return 0; // Placeholder
  }
}
```

#### Configuration File Support

```typescript
// utils/workflow-config-loader.ts
import { WorkflowAutomationOptions } from '../types/workflow-options';

export interface WorkflowConfigFile {
  version?: string;
  workflow?: Partial<WorkflowAutomationOptions>;
  profiles?: Record<string, Partial<WorkflowAutomationOptions>>;
}

export class WorkflowConfigLoader {
  static async loadFromFile(configPath: string): Promise<WorkflowConfigFile> {
    try {
      const configContent = await fs.readFile(configPath, 'utf-8');
      const config = JSON.parse(configContent) as WorkflowConfigFile;
      
      // Validate configuration
      WorkflowConfigLoader.validateConfig(config);
      
      return config;
    } catch (error) {
      throw new Error(`Failed to load workflow config from ${configPath}: ${error.message}`);
    }
  }

  static validateConfig(config: WorkflowConfigFile): void {
    if (!config.workflow) {
      throw new Error('Workflow configuration is required');
    }
    
    // Validate AI configuration
    if (config.workflow.aiProvider && !config.workflow.aiModel) {
      throw new Error('AI model is required when AI provider is specified');
    }
    
    // Validate PRD method combinations
    if (config.workflow.prdMethod === 'upload' && !config.workflow.prdFile) {
      throw new Error('PRD file is required when using upload method');
    }
    
    if (config.workflow.prdMethod === 'ai' && !config.workflow.prdDescription) {
      throw new Error('PRD description is required when using AI generation method');
    }
    
    // Validate refinement method combinations
    if (config.workflow.refineMethod === 'ai' && !config.workflow.refineFeedback) {
      throw new Error('Refinement feedback is required when using AI refinement method');
    }
    
    // Validate splitting method combinations
    if (config.workflow.splitMethod === 'custom' && !config.workflow.splitInstructions) {
      throw new Error('Split instructions are required when using custom splitting method');
    }
    
    // Validate question/refine combinations
    if (config.workflow.prdQuestionRefine && config.workflow.prdAnswerMode === 'ai') {
      if (!config.workflow.prdAnswerAiProvider || !config.workflow.prdAnswerAiModel) {
        throw new Error('AI provider and model are required when AI answers questions');
      }
    }
  }

  static createSampleConfig(): WorkflowConfigFile {
    return {
      version: "1.0.0",
      workflow: {
        projectName: "Sample Project",
        initMethod: "ai",
        prdMethod: "ai",
        prdDescription: "Sample project for demonstration",
        generateMethod: "ai",
        splitMethod: "standard",
        frontend: "next",
        backend: "hono",
        database: "postgres",
        auth: true,
        bootstrap: true,
        stream: true,
        autoAccept: false,
        aiProvider: "anthropic",
        aiModel: "claude-3.5-sonnet"
      },
      profiles: {
        "quick-start": {
          projectName: "Quick Start Project",
          skipAll: true,
          autoAccept: true,
          initMethod: "quick",
          prdMethod: "skip",
          generateMethod: "standard",
          splitMethod: "standard"
        }
      }
    };
  }

  static async saveToFile(config: WorkflowConfigFile, configPath: string): Promise<void> {
    try {
      const configContent = JSON.stringify(config, null, 2);
      await fs.writeFile(configPath, configContent, 'utf-8');
      console.log(`✅ Workflow configuration saved to ${configPath}`);
    } catch (error) {
      throw new Error(`Failed to save workflow config to ${configPath}: ${error.message}`);
    }
  }
}
```

### SURVIVAL SCENARIOS

#### Scenario 1: Complete E-commerce Platform Automation

```typescript
// Fully automated e-commerce setup
const ecommerceWorkflow: WorkflowAutomationOptions = {
  skipAll: false,
  autoAccept: true,
  projectName: "ShopMaster E-commerce",
  initMethod: "ai",
  prdMethod: "ai",
  prdDescription: "Complete e-commerce platform with user authentication, product catalog, shopping cart, order management, and admin dashboard",
  generateMethod: "ai",
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
  aiModel: "claude-3.5-sonnet"
};

// Execute with progress tracking
const progressCallback = {
  onProgress: (event) => {
    switch (event.type) {
      case "started":
        console.log(`🚀 ${event.message}`);
        break;
      case "progress":
        console.log(`📊 ${event.message}`);
        break;
      case "completed":
        console.log(`✅ ${event.message}`);
        break;
    }
  }
};

await executeWorkflow(ecommerceWorkflow);

// Expected output:
// 🚀 Step 1: Initializing project...
// ✅ Project initialized: ShopMaster E-commerce
// 📝 Step 2: Defining PRD...
// 🤖 Generating PRD with multiple models...
// 📋 Step 2.5: PRD Question/Refine...
// ❓ AI answering questions about PRD...
// ✏️ Step 3: Refining PRD...
// 📋 Step 4: Generating tasks...
// 🔧 Step 5: Splitting tasks...
// ✅ Workflow completed successfully!
// Project: ShopMaster E-commerce
// Tasks created: 47
// Duration: 4520000ms
```

#### Scenario 2: Semi-Automated Mobile App Development

```typescript
// Semi-automated workflow with human oversight
const mobileAppWorkflow: WorkflowAutomationOptions = {
  autoAccept: false,
  projectName: "Fitness Tracker Mobile App",
  initMethod: "custom",
  useExistingConfig: true,
  prdMethod: "upload",
  prdFile: "./docs/mobile-app-PRD.md",
  skipPrdQuestionRefine: false,
  prdQuestionRefine: true,
  prdAnswerMode: "user",
  generateMethod: "standard",
  splitMethod: "interactive",
  splitTasks: "task-ui-design,task-api-integration",
  frontend: "react-router",
  backend: "express",
  database: "sqlite",
  auth: true,
  bootstrap: false,
  stream: true,
  aiProvider: "openrouter",
  aiModel: "anthropic/claude-3.5-sonnet"
};

// Configuration file for team sharing
const teamConfig = WorkflowConfigFile = {
  version: "1.0.0",
  workflow: mobileAppWorkflow,
  profiles: {
    "developer": {
      ...mobileAppWorkflow,
      autoAccept: true,
      splitMethod: "standard"
    },
    "designer": {
      ...mobileAppWorkflow,
      prdAnswerMode: "ai",
      prdAnswerAiProvider: "openai",
      prdAnswerAiModel: "gpt-4"
    }
  }
};

await WorkflowConfigLoader.saveToFile(teamConfig, "./team-workflow-config.json");
```

#### Scenario 3: Custom AI Pipeline with Advanced Configuration

```typescript
// Advanced AI pipeline with custom models per step
const advancedAIWorkflow: WorkflowAutomationOptions = {
  projectName: "AI Research Assistant",
  initMethod: "quick",
  prdMethod: "ai",
  prdDescription: "AI-powered research assistant with advanced natural language processing",
  prdMultiGeneration: true,
  prdMultiGenerationModels: "anthropic:claude-3.5-sonnet,openai:gpt-4o,google:gemini-pro",
  prdCombine: true,
  prdCombineModel: "anthropic:claude-3.5-sonnet",
  prdQuestionRefine: true,
  prdAnswerMode: "ai",
  prdAnswerAiProvider: "openrouter",
  prdAnswerAiModel: "anthropic/claude-3.5-sonnet",
  prdAnswerAiReasoning: true,
  generateMethod: "ai",
  generateInstructions: "Generate tasks for ML pipeline development, data preprocessing, model training, and deployment automation. Include tasks for MLOps, experiment tracking, and model versioning.",
  splitMethod: "custom",
  splitInstructions: "Split tasks by ML pipeline stages: data ingestion, preprocessing, feature engineering, model training, validation, deployment, and monitoring. Create separate subtasks for each stage with appropriate dependencies.",
  aiProvider: "openrouter",
  aiModel: "anthropic/claude-3.5-sonnet"
};

// Execute with progress tracking
const progressCallback = {
  onProgress: (event) => {
    switch (event.type) {
      case "started":
        console.log(`🚀 ${event.message}`);
        break;
      case "progress":
        console.log(`📊 ${event.message}`);
        break;
      case "completed":
        console.log(`✅ ${event.message}`);
        break;
    }
  }
};

await executeWorkflow(advancedAIWorkflow);
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

#### Integration Points

1. **CLI Layer**: Command-line option parsing and validation
2. **Service Layer**: Workflow orchestration and step execution
3. **AI Service**: Multi-provider AI operations with streaming
4. **Project Management**: Better-T-Stack integration and initialization

### FREQUENTLY ASKED QUESTIONS FROM THE FIELD

**Q: How do I skip just PRD steps but keep everything else?**
A: Set `skipPrd: true` in your options. This skips both PRD definition and refinement while continuing with task generation. Remember that task generation needs a PRD to work with, so you'll need to provide one via `prdFile` or have an existing one.

**Q: Can I use different AI models for different workflow steps?**
A: Yes! Use step-specific AI options like `prdAnswerAiModel` for question/refine steps, `prdCombineModel` for PRD combination, and base `aiModel` for other steps. Each step can have its own AI configuration.

**Q: What's the difference between `splitAll` and `splitTasks`?**
A: `splitAll: true` splits every task generated in the workflow, while `splitTasks` lets you specify exact task IDs (comma-separated) to split. Use `splitAll` for comprehensive breakdown, or `splitTasks` for targeted splitting.

**Q: How do I save my workflow configuration for team sharing?**
A: Create a JSON configuration file using the `WorkflowConfigLoader` class. You can include multiple profiles in the `profiles` section for different team members or use cases. Use `configFile` option to load it: `--config-file team-workflow.json`.

**Q: Can I run workflow steps interactively even with automation enabled?**
A: Yes! Set `autoAccept: false` to maintain human oversight. The workflow will still use your AI configurations and predefined options, but will prompt for confirmation at each step. Set `skipAll: false` and use individual step skips for fine-grained control.

**Q: What happens if I specify conflicting options?**
A: The workflow validator will throw an error before execution. Common conflicts include: specifying both `skipAll` and individual step skips, setting `prdMethod: "upload"` without `prdFile`, or setting `splitMethod: "custom"` without `splitInstructions`.

**Remember:** Citizen, in the wasteland of manual project setup, workflow automation is your assembly line. Every option is a precision tool, every configuration is a quality control checkpoint, and every automated step is a worker that never sleeps. Configure them wisely, test them thoroughly, and they'll build your empire while you focus on the bigger picture.