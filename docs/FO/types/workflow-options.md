## TECHNICAL BULLETIN NO. 006
### WORKFLOW OPTIONS - WORKFLOW AUTOMATION CONFIGURATION SYSTEM

**DOCUMENT ID:** `task-o-matic-workflow-options-v1`  
**CLEARANCE:** `All Personnel`  
**MANDATORY COMPLIANCE:** `Yes`

### ⚠️ CRITICAL SURVIVAL NOTICE
Citizen, ignore these workflow option types and your automation becomes a runaway train in the wasteland. Steps execute without control, AI configurations clash, and your workflow becomes a cascade of failed operations. This is your automation control tower.

### TYPE SYSTEM ARCHITECTURE

The workflow options system provides **comprehensive automation configuration** for the entire task-o-matic workflow process. It uses **interface composition** and **granular control** to enable both fully automated and semi-automated workflow execution. The architecture supports:

- **Step-by-Step Control**: Fine-grained control over each workflow phase
- **AI Configuration**: Per-step AI provider and model selection
- **Automation Levels**: From fully manual to completely automated
- **Configuration Loading**: Support for both inline and file-based configuration
- **Error Recovery**: Robust error handling and retry mechanisms

This design enables **predictable workflow automation** while maintaining human oversight when needed.

### COMPLETE TYPE DOCUMENTATION

#### WorkflowAutomationOptions Interface

```typescript
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
}
```

**Purpose**: Comprehensive options for workflow command automation

**Inherited Properties**: From `StreamingAIOptions`
- **aiProvider** (Optional, string): AI provider name
- **aiModel** (Optional, string): AI model name
- **aiKey** (Optional, string): API authentication key
- **aiProviderUrl** (Optional, string): Custom endpoint URL
- **stream** (Optional, boolean): Enable streaming AI responses

**Global Workflow Control Properties**:
- **skipAll** (Optional, boolean): Skip all optional steps and run with defaults
- **autoAccept** (Optional, boolean): Automatically accept all AI suggestions without prompting
- **configFile** (Optional, string): Path to JSON configuration file with workflow options

**Step 1: Initialize Properties**:
- **skipInit** (Optional, boolean): Skip project initialization entirely
- **projectName** (Optional, string): Pre-defined project name
- **initMethod** (Optional, union): Initialization approach
  - `"quick"`: Use sensible defaults for rapid setup
  - `"custom"`: Interactive custom configuration
  - `"ai"`: AI-assisted project setup
- **projectDescription** (Optional, string): Project description for AI-assisted initialization
- **useExistingConfig** (Optional, boolean): Use existing configuration if found

**Step 2: Define PRD Properties**:
- **skipPrd** (Optional, boolean): Skip PRD definition step
- **prdMethod** (Optional, union): PRD creation approach
  - `"upload"`: Use existing PRD file
  - `"manual"`: Interactive PRD creation
  - `"ai"`: AI-generated PRD from description
  - `"skip"`: Skip PRD entirely
- **prdFile** (Optional, string): Path to existing PRD file for upload method
- **prdDescription** (Optional, string): Description for AI-generated PRD
- **prdContent** (Optional, string): Direct PRD content for automation
- **prdMultiGeneration** (Optional, boolean): Use multiple AI models for PRD generation
- **skipPrdMultiGeneration** (Optional, boolean): Skip multi-generation step
- **prdMultiGenerationModels** (Optional, string): Comma-separated provider:model combinations
- **prdCombine** (Optional, boolean): Combine multiple PRDs into master document
- **skipPrdCombine** (Optional, boolean): Skip PRD combination step
- **prdCombineModel** (Optional, string): AI model for PRD combination (provider:model format)

**Step 3: Refine PRD Properties**:
- **skipRefine** (Optional, boolean): Skip PRD refinement step
- **refineMethod** (Optional, union): PRD refinement approach
  - `"manual"`: Manual PRD editing and improvement
  - `"ai"`: AI-assisted PRD refinement
  - `"skip"`: Skip refinement entirely
- **refineFeedback** (Optional, string): Feedback for AI-driven refinement

**Step 2.5: PRD Question/Refine Properties**:
- **skipPrdQuestionRefine** (Optional, boolean): Skip question-based PRD refinement
- **prdQuestionRefine** (Optional, boolean): Enable question-based PRD refinement
- **prdAnswerMode** (Optional, union): Who answers PRD questions
  - `"user"`: Human user answers questions
  - `"ai"`: AI model answers questions
- **prdAnswerAiProvider** (Optional, string): AI provider for answering questions
- **prdAnswerAiModel** (Optional, string): AI model for answering questions
- **prdAnswerAiKey** (Optional, string): API key for answering AI
- **prdAnswerAiProviderUrl** (Optional, string): Custom endpoint for answering AI
- **prdAnswerAiReasoning** (Optional, boolean): Enable reasoning for answering AI model

**Step 4: Generate Tasks Properties**:
- **skipGenerate** (Optional, boolean): Skip task generation step
- **generateMethod** (Optional, union): Task generation approach
  - `"standard"`: Standard task extraction from PRD
  - `"ai"`: AI-enhanced task generation
- **generateInstructions** (Optional, string): Custom instructions for task generation

**Step 5: Split Tasks Properties**:
- **skipSplit** (Optional, boolean): Skip task splitting step
- **splitTasks** (Optional, string): Comma-separated task IDs to split
- **splitAll** (Optional, boolean): Split all generated tasks
- **splitMethod** (Optional, union): Task splitting approach
  - `"interactive"`: Interactive task splitting with user confirmation
  - `"standard"`: Standard AI-powered task splitting
  - `"custom"`: Custom splitting with specific instructions
- **splitInstructions** (Optional, string): Custom instructions for task splitting

**Stack Configuration Properties**:
- **frontend** (Optional, string): Frontend framework selection
- **backend** (Optional, string): Backend framework selection
- **database** (Optional, string): Database selection
- **auth** (Optional, boolean): Include authentication system
- **bootstrap** (Optional, boolean): Use Better-T-Stack bootstrap process
- **includeDocs** (Optional, boolean): Include documentation in new project

**Usage Examples**:
```typescript
// Fully automated workflow
const fullyAutomated: WorkflowAutomationOptions = {
  skipAll: true,
  autoAccept: true,
  projectName: "E-commerce Platform",
  initMethod: "ai",
  prdMethod: "ai",
  prdDescription: "Complete e-commerce platform with user authentication and product catalog",
  generateMethod: "ai",
  splitMethod: "standard",
  splitAll: true,
  frontend: "next",
  backend: "hono",
  database: "postgres",
  auth: true,
  bootstrap: true,
  stream: true,
  aiProvider: "anthropic",
  aiModel: "claude-3.5-sonnet"
};

// Semi-automated with human oversight
const semiAutomated: WorkflowAutomationOptions = {
  autoAccept: false,
  projectName: "Mobile App",
  initMethod: "custom",
  prdMethod: "upload",
  prdFile: "./docs/PRD.md",
  prdQuestionRefine: true,
  prdAnswerMode: "user",
  generateMethod: "standard",
  splitTasks: "task-large-1,task-large-2",
  splitMethod: "interactive",
  aiProvider: "openrouter",
  stream: true
};

// Custom AI configuration per step
const customAIConfig: WorkflowAutomationOptions = {
  projectName: "AI Assistant",
  initMethod: "ai",
  prdMultiGeneration: true,
  prdMultiGenerationModels: "anthropic:claude-3.5-sonnet,openai:gpt-4o",
  prdCombine: true,
  prdCombineModel: "anthropic:claude-3.5-sonnet",
  generateMethod: "ai",
  generateInstructions: "Focus on technical implementation details and API design",
  splitMethod: "custom",
  splitInstructions: "Split tasks by technical components (frontend, backend, database)",
  prdAnswerAiProvider: "openrouter",
  prdAnswerAiModel: "anthropic/claude-3.5-sonnet",
  prdAnswerAiReasoning: true,
  aiProvider: "openrouter",
  aiModel: "anthropic/claude-3.5-sonnet"
};

// Configuration from file
const fileBasedConfig: WorkflowAutomationOptions = {
  configFile: "./workflow-config.json",
  // Other options will be loaded from file
};

// Minimal automation
const minimalAutomation: WorkflowAutomationOptions = {
  skipInit: true,
  skipPrd: true,
  skipRefine: true,
  skipGenerate: false,
  skipSplit: true,
  generateMethod: "standard",
  aiProvider: "openai",
  aiModel: "gpt-4"
};
```

### FUNCTION DOCUMENTATION

No standalone functions in this module - this is a type definition file.

### INTEGRATION PROTOCOLS

#### Workflow Command Integration

```typescript
// commands/workflow.ts
import { WorkflowAutomationOptions } from '../types/workflow-options';
import { WorkflowService } from '../services/workflow';

export function createWorkflowCommand(): Command {
  return new Command('workflow')
    .description('Execute complete task-o-matic workflow')
    .option('--config-file <file>', 'Load configuration from JSON file')
    .option('--skip-all', 'Skip all optional steps')
    .option('--auto-accept', 'Auto-accept all AI suggestions')
    .option('--project-name <name>', 'Project name')
    .option('--init-method <method>', 'Initialization method (quick|custom|ai)')
    .option('--skip-init', 'Skip initialization')
    .option('--prd-method <method>', 'PRD method (upload|manual|ai|skip)')
    .option('--prd-file <file>', 'Path to PRD file')
    .option('--prd-description <desc>', 'PRD description for AI generation')
    .option('--prd-multi-generation', 'Use multi-generation for PRD')
    .option('--prd-multi-models <models>', 'Models for PRD multi-generation')
    .option('--prd-combine', 'Combine multiple PRDs')
    .option('--prd-combine-model <model>', 'Model for PRD combination')
    .option('--skip-refine', 'Skip PRD refinement')
    .option('--refine-method <method>', 'Refinement method (manual|ai|skip)')
    .option('--refine-feedback <feedback>', 'Feedback for PRD refinement')
    .option('--prd-question-refine', 'Use question-based PRD refinement')
    .option('--prd-answer-mode <mode>', 'Who answers PRD questions (user|ai)')
    .option('--prd-answer-ai-provider <provider>', 'AI provider for answering questions')
    .option('--prd-answer-ai-model <model>', 'AI model for answering questions')
    .option('--prd-answer-ai-key <key>', 'API key for answering AI')
    .option('--prd-answer-ai-url <url>', 'Custom endpoint for answering AI')
    .option('--prd-answer-ai-reasoning', 'Enable reasoning for answering AI')
    .option('--skip-generate', 'Skip task generation')
    .option('--generate-method <method>', 'Task generation method (standard|ai)')
    .option('--generate-instructions <instructions>', 'Custom instructions for task generation')
    .option('--skip-split', 'Skip task splitting')
    .option('--split-tasks <tasks>', 'Comma-separated task IDs to split')
    .option('--split-all', 'Split all tasks')
    .option('--split-method <method>', 'Split method (interactive|standard|custom)')
    .option('--split-instructions <instructions>', 'Custom instructions for splitting')
    .option('--frontend <framework>', 'Frontend framework')
    .option('--backend <framework>', 'Backend framework')
    .option('--database <db>', 'Database choice')
    .option('--auth', 'Include authentication')
    .option('--bootstrap', 'Bootstrap with Better-T-Stack')
    .option('--include-docs', 'Include documentation')
    .option('--stream', 'Stream AI output')
    .option('--ai-provider <provider>', 'AI provider')
    .option('--ai-model <model>', 'AI model')
    .option('--ai-key <key>', 'AI API key')
    .option('--ai-provider-url <url>', 'Custom AI provider URL')
    .action(async (options: WorkflowAutomationOptions) => {
      await handleWorkflowCommand(options);
    });
}

async function handleWorkflowCommand(options: WorkflowAutomationOptions): Promise<void> {
  try {
    const workflowService = new WorkflowService();
    
    // Load configuration from file if specified
    if (options.configFile) {
      const fileConfig = await loadWorkflowConfig(options.configFile);
      options = { ...options, ...fileConfig };
    }
    
    // Execute workflow with automation options
    const result = await workflowService.executeWorkflow(options);
    
    if (result.success) {
      console.log('✅ Workflow completed successfully!');
      console.log(`Project: ${result.projectName}`);
      console.log(`Tasks created: ${result.tasksCreated}`);
      console.log(`Duration: ${result.duration}ms`);
    } else {
      console.error('❌ Workflow failed:', result.error);
      process.exit(1);
    }
  } catch (error) {
    console.error('💥 Workflow execution failed:', error);
    process.exit(1);
  }
}

async function loadWorkflowConfig(configPath: string): Promise<Partial<WorkflowAutomationOptions>> {
  try {
    const configContent = await fs.readFile(configPath, 'utf-8');
    return JSON.parse(configContent);
  } catch (error) {
    console.error(`Failed to load workflow config from ${configPath}:`, error);
    return {};
  }
}
```

#### Service Layer Integration

```typescript
// services/workflow.ts
import { WorkflowAutomationOptions } from '../types/workflow-options';
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
      // AI answers questions about PRD
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
      // User answers questions about PRD
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
import { loadAIConfig } from './ai-config-builder';

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

  static async loadFromProfile(configPath: string, profileName: string): Promise<WorkflowAutomationOptions> {
    const config = await this.loadFromFile(configPath);
    
    if (!config.profiles || !config.profiles[profileName]) {
      throw new Error(`Profile '${profileName}' not found in configuration`);
    }
    
    return {
      ...config.workflow,
      ...config.profiles[profileName]
    };
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
        },
        "custom-ai": {
          projectName: "Custom AI Project",
          initMethod: "ai",
          prdMultiGeneration: true,
          prdMultiGenerationModels: "anthropic:claude-3.5-sonnet,openai:gpt-4o",
          prdCombine: true,
          prdCombineModel: "anthropic:claude-3.5-sonnet",
          generateInstructions: "Focus on API design and microservices architecture",
          splitInstructions: "Split by API endpoints and data models"
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

#### Scenario 1: Fully Automated E-commerce Platform Setup

```typescript
// Complete automation for e-commerce platform
const ecommerceWorkflow: WorkflowAutomationOptions = {
  // Global automation
  skipAll: false,
  autoAccept: true,
  projectName: "ShopMaster E-commerce",
  
  // Step 1: AI-assisted initialization
  initMethod: "ai",
  projectDescription: "Complete e-commerce platform with user authentication, product catalog, shopping cart, order management, and admin dashboard",
  
  // Step 2: AI-generated PRD with multi-generation
  prdMethod: "ai",
  prdMultiGeneration: true,
  prdMultiGenerationModels: "anthropic:claude-3.5-sonnet,openai:gpt-4o",
  prdCombine: true,
  prdCombineModel: "anthropic:claude-3.5-sonnet",
  
  // Step 3: AI refinement with comprehensive feedback
  skipRefine: false,
  refineMethod: "ai",
  refineFeedback: "Add security requirements, performance metrics, scalability considerations, and detailed API specifications",
  
  // Step 4: AI-enhanced task generation
  skipGenerate: false,
  generateMethod: "ai",
  generateInstructions: "Focus on microservices architecture, API-first design, comprehensive testing strategy, and DevOps automation",
  
  // Step 5: Standard AI splitting for large tasks
  skipSplit: false,
  splitAll: true,
  splitMethod: "standard",
  
  // Stack configuration
  frontend: "next",
  backend: "hono",
  database: "postgres",
  auth: true,
  bootstrap: true,
  includeDocs: true,
  
  // AI configuration
  stream: true,
  aiProvider: "anthropic",
  aiModel: "claude-3.5-sonnet"
};

// Execute workflow
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
  // Human oversight required
  autoAccept: false,
  projectName: "Fitness Tracker Mobile App",
  
  // Step 1: Custom initialization with existing config
  initMethod: "custom",
  useExistingConfig: true,
  
  // Step 2: Manual PRD upload with question-based refinement
  prdMethod: "upload",
  prdFile: "./docs/mobile-app-PRD.md",
  skipPrdQuestionRefine: false,
  prdQuestionRefine: true,
  prdAnswerMode: "user",
  
  // Step 3: Manual refinement
  skipRefine: false,
  refineMethod: "manual",
  
  // Step 4: Standard task generation
  skipGenerate: false,
  generateMethod: "standard",
  
  // Step 5: Interactive splitting for complex tasks
  skipSplit: false,
  splitMethod: "interactive",
  splitTasks: "task-ui-design,task-api-integration",
  
  // Mobile-focused stack
  frontend: "react-router",
  backend: "express",
  database: "sqlite",
  auth: true,
  bootstrap: false,
  
  // AI configuration for mobile development
  stream: true,
  aiProvider: "openrouter",
  aiModel: "anthropic/claude-3.5-sonnet"
};

// Configuration file for team sharing
const teamConfig: WorkflowConfigFile = {
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
  
  // Step 1: Quick initialization
  initMethod: "quick",
  
  // Step 2: Advanced PRD generation
  prdMethod: "ai",
  prdDescription: "AI-powered research assistant with advanced natural language processing",
  prdMultiGeneration: true,
  prdMultiGenerationModels: "anthropic:claude-3.5-sonnet,openai:gpt-4o,google:gemini-pro",
  prdCombine: true,
  prdCombineModel: "anthropic:claude-3.5-sonnet",
  
  // Step 2.5: AI-powered question/refine
  prdQuestionRefine: true,
  prdAnswerMode: "ai",
  prdAnswerAiProvider: "openrouter",
  prdAnswerAiModel: "anthropic/claude-3.5-sonnet",
  prdAnswerAiReasoning: true,
  
  // Step 3: AI refinement with domain-specific feedback
  skipRefine: false,
  refineMethod: "ai",
  refineFeedback: "Focus on machine learning integration, data privacy compliance, research methodology, and academic citation standards",
  
  // Step 4: Custom AI generation with specialized instructions
  skipGenerate: false,
  generateMethod: "ai",
  generateInstructions: "Generate tasks for ML pipeline development, data preprocessing, model training, and deployment automation. Include tasks for MLOps, experiment tracking, and model versioning.",
  
  // Step 5: Custom splitting with technical focus
  skipSplit: false,
  splitMethod: "custom",
  splitInstructions: "Split tasks by ML pipeline stages: data ingestion, preprocessing, feature engineering, model training, validation, deployment, and monitoring. Create separate subtasks for each stage with appropriate dependencies.",
  
  // AI-focused stack
  frontend: "none", // CLI tool
  backend: "none", // No backend needed
  database: "none", // External data sources
  auth: false,
  bootstrap: false,
  
  // Advanced AI configuration
  stream: true,
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

**Q: How do I skip just the PRD steps but keep everything else?**
A: Set `skipPrd: true` in your options. This skips both PRD definition and refinement while continuing with task generation. Remember that task generation needs a PRD to work with, so you'll need to provide one via `prdFile` or have an existing one.

**Q: Can I use different AI models for different workflow steps?**
A: Yes! Use the step-specific AI options like `prdAnswerAiModel` for question/refine steps, `prdCombineModel` for PRD combination, and the base `aiModel` for other steps. Each step can have its own AI configuration.

**Q: What's the difference between `splitAll` and `splitTasks`?**
A: `splitAll: true` splits every task generated in the workflow, while `splitTasks` lets you specify exact task IDs (comma-separated) to split. Use `splitAll` for comprehensive breakdown, or `splitTasks` for targeted splitting.

**Q: How do I save my workflow configuration for team sharing?**
A: Create a JSON configuration file using the `WorkflowConfigLoader` class. You can include multiple profiles in the `profiles` section for different team members or use cases. Use `configFile` option to load it: `--config-file team-workflow.json`.

**Q: Can I run workflow steps interactively even with automation enabled?**
A: Yes! Set `autoAccept: false` to maintain human oversight. The workflow will still use your AI configurations and predefined options, but will prompt for confirmation at each step. Set `skipAll: false` and use individual step skips for fine-grained control.

**Q: What happens if I specify conflicting options?**
A: The workflow validator will throw an error before execution. Common conflicts include: specifying both `skipAll` and individual step skips, setting `prdMethod: "upload"` without `prdFile`, or setting `splitMethod: "custom"` without `splitInstructions`.

**Remember:** Citizen, in the wasteland of manual project setup, workflow automation is your assembly line. Every option is a precision tool, every configuration is a quality control checkpoint, and every automated step is a worker that never sleeps. Configure them wisely, test them thoroughly, and they'll build your empire while you focus on the bigger picture.